import { Fragment, useEffect, useRef, useState } from 'react'

import {
	getMemoryRows,
	parseSimulatorInput,
	stepMachine,
	type MachineTrace,
	type ParseIssue,
	type SimulatorMachine,
	type StepMode,
} from '../lib/simulator'
import type { SimulatorWorkerEvent } from '../lib/simulator-runtime'

type Preset = {
	id: string
	label: string
	note: string
	program: string
	data: string
}

const PRESETS: Preset[] = [
	{
		id: 'suma-base',
		label: 'suma base',
		note: 'Carga dos datos, los combina y deja el resultado listo para inspección.',
		program: [
			'100: LOAD r0, [40]',
			'101: ADD r0, [41]',
			'102: STORE r0, [42]',
			'103: HALT',
		].join('\n'),
		data: [
			'40: 7',
			'41: 5',
			'42: 0',
		].join('\n'),
	},
	{
		id: 'salto-condicional',
		label: 'salto condicional',
		note: 'Prepara el caso de `JNZ` y deja visible cómo cambia el pc cuando hay loop.',
		program: [
			'200: LOAD r0, [50]',
			'201: SUB r0, 1',
			'202: JNZ r0, 201',
			'203: HALT',
		].join('\n'),
		data: '50: 3',
	},
]

function resolvePresets(presets?: Array<{ slug: string; title: string; note: string; program: string; data: string }>): Preset[] {
	if (!presets || presets.length === 0) {
		return PRESETS
	}

	return presets.map((preset) => ({
		id: preset.slug,
		label: preset.title,
		note: preset.note,
		program: preset.program,
		data: preset.data,
	}))
}

function buildInitialState(preset: Preset) {
	const result = parseSimulatorInput(preset.program, preset.data)

	return {
		presetId: preset.id,
		programText: preset.program,
		dataText: preset.data,
		machine: result.machine,
		issues: result.issues,
		lastLoaded: {
			program: preset.program,
			data: preset.data,
		},
	}
}

function buildTimelineState(machine: SimulatorMachine | null) {
	return machine
		? { timeline: [machine], timelineIndex: 0 }
		: { timeline: [], timelineIndex: -1 }
}

const PHASE_LABELS: Record<SimulatorMachine['phase'], string> = {
	idle: 'idle',
	fetch: 'fetch',
	decode: 'decode',
	execute: 'execute',
}

const STATUS_LABELS: Record<SimulatorMachine['status'], string> = {
	ready: 'lista',
	halted: 'detenida',
	error: 'error',
}

function getStatusChipClass(machine: SimulatorMachine | null, isRunning: boolean): string {
	if (isRunning) {
		return 'sim-chip sim-chip--running'
	}

	if (!machine) {
		return 'sim-chip'
	}

	switch (machine.status) {
		case 'ready':
			return 'sim-chip sim-chip--loaded'
		case 'halted':
			return 'sim-chip sim-chip--halted'
		case 'error':
			return 'sim-chip sim-chip--error'
	}
}

function getTraceLabel(trace: MachineTrace | null): string {
	if (!trace) {
		return 'sin traza activa'
	}

	switch (trace.kind) {
		case 'load':
			return 'última carga'
		case 'micro':
			return 'última microfase'
		case 'instruction':
			return 'última instrucción'
	}
}

function getSnapshotEyebrow(snapshot: SimulatorMachine, index: number): string {
	const trace = snapshot.lastTrace

	if (!trace || trace.kind === 'load') {
		return index === 0 ? 'carga' : `estado ${index}`
	}

	return trace.kind === 'micro' ? `micro ${index}` : `step ${index}`
}

function getSnapshotTitle(snapshot: SimulatorMachine, index: number): string {
	const trace = snapshot.lastTrace

	if (!trace) {
		return `estado ${index}`
	}

	if (trace.kind === 'load') {
		return 'memoria lista'
	}

	if (trace.kind === 'micro') {
		return trace.phases[0]?.phase ?? 'micro'
	}

	return trace.instructionText !== '--' ? trace.instructionText : trace.title
}

function getSnapshotMeta(snapshot: SimulatorMachine): string {
	return `pc ${snapshot.pc} · ${snapshot.phase}`
}

export default function LevelSimulator({
	levelId,
	presets,
}: {
	levelId: string
	presets?: Array<{ slug: string; title: string; note: string; program: string; data: string }>
}) {
	const availablePresets = resolvePresets(presets)
	const initialState = buildInitialState(availablePresets[0])
	const initialTimelineState = buildTimelineState(initialState.machine)

	const [presetId, setPresetId] = useState(initialState.presetId)
	const [programText, setProgramText] = useState(initialState.programText)
	const [dataText, setDataText] = useState(initialState.dataText)
	const [issues, setIssues] = useState<ParseIssue[]>(initialState.issues)
	const [stepMode, setStepMode] = useState<StepMode>('instruction')
	const [isRunning, setIsRunning] = useState(false)
	const [lastLoaded, setLastLoaded] = useState(initialState.lastLoaded)
	const [timeline, setTimeline] = useState<SimulatorMachine[]>(initialTimelineState.timeline)
	const [timelineIndex, setTimelineIndex] = useState(initialTimelineState.timelineIndex)
	const [isExplanationExpanded, setIsExplanationExpanded] = useState(false)

	const workerRef = useRef<Worker | null>(null)
	const timelineRef = useRef<SimulatorMachine[]>(initialTimelineState.timeline)
	const timelineIndexRef = useRef(initialTimelineState.timelineIndex)

	const editorDirty = programText !== lastLoaded.program || dataText !== lastLoaded.data
	const machine = timelineIndex >= 0 ? timeline[timelineIndex] ?? null : null
	const memoryRows = machine ? getMemoryRows(machine) : []
	const timelineHasPast = timelineIndex > 0
	const timelineHasFuture = timelineIndex >= 0 && timelineIndex < timeline.length - 1
	const activeTrace = machine?.lastTrace ?? null
	const explanationSummary = activeTrace?.summary
		?? machine?.statusMessage
		?? 'Cargá un programa válido para inicializar la máquina.'
	const activeInstructionText = activeTrace && activeTrace.instructionText !== '--'
		? activeTrace.instructionText
		: null

	const commitTimeline = (nextTimeline: SimulatorMachine[], nextIndex: number) => {
		timelineRef.current = nextTimeline
		timelineIndexRef.current = nextIndex
		setTimeline(nextTimeline)
		setTimelineIndex(nextIndex)
	}

	const replaceTimeline = (nextMachine: SimulatorMachine | null) => {
		if (!nextMachine) {
			commitTimeline([], -1)
			return
		}

		commitTimeline([nextMachine], 0)
	}

	const selectTimelineSnapshot = (nextIndex: number) => {
		timelineIndexRef.current = nextIndex
		setTimelineIndex(nextIndex)
	}

	const appendTimelineSnapshot = (nextMachine: SimulatorMachine) => {
		const base = timelineRef.current.slice(0, Math.max(timelineIndexRef.current, -1) + 1)
		const nextTimeline = [...base, nextMachine]
		commitTimeline(nextTimeline, nextTimeline.length - 1)
	}

	const terminateWorker = () => {
		workerRef.current?.terminate()
		workerRef.current = null
	}

	const stopContinuousExecution = () => {
		terminateWorker()
		setIsRunning(false)
	}

	useEffect(() => {
		return () => {
			terminateWorker()
		}
	}, [])

	useEffect(() => {
		setIsExplanationExpanded(false)
	}, [timelineIndex, machine?.pc, machine?.phase, machine?.statusMessage])

	const handleStepModeSelect = (nextMode: StepMode) => {
		if (nextMode === stepMode) {
			return
		}

		stopContinuousExecution()
		setStepMode(nextMode)
	}

	const handlePresetSelect = (preset: Preset) => {
		stopContinuousExecution()
		const result = parseSimulatorInput(preset.program, preset.data)
		setPresetId(preset.id)
		setProgramText(preset.program)
		setDataText(preset.data)
		setIssues(result.issues)
		replaceTimeline(result.machine)
		setLastLoaded({ program: preset.program, data: preset.data })
	}

	const handleLoad = () => {
		stopContinuousExecution()
		const result = parseSimulatorInput(programText, dataText)
		setIssues(result.issues)
		if (!result.machine) {
			return
		}

		replaceTimeline(result.machine)
		setLastLoaded({ program: programText, data: dataText })
	}

	const handleRestoreLastLoad = () => {
		stopContinuousExecution()
		setProgramText(lastLoaded.program)
		setDataText(lastLoaded.data)
		setIssues([])
	}

	const handleStep = () => {
		if (!machine || machine.status !== 'ready' || isRunning) {
			return
		}

		appendTimelineSnapshot(stepMachine(machine, stepMode))
	}

	const handleStepBack = () => {
		if (!timelineHasPast || isRunning) {
			return
		}

		stopContinuousExecution()
		selectTimelineSnapshot(timelineIndex - 1)
	}

	const handleTimelineForward = () => {
		if (!timelineHasFuture || isRunning) {
			return
		}

		stopContinuousExecution()
		selectTimelineSnapshot(timelineIndex + 1)
	}

	const handleTimelineSelect = (index: number) => {
		if (index < 0 || index >= timeline.length || isRunning) {
			return
		}

		stopContinuousExecution()
		selectTimelineSnapshot(index)
	}

	const handleReset = () => {
		stopContinuousExecution()
		const result = parseSimulatorInput(lastLoaded.program, lastLoaded.data)
		setIssues(result.issues)
		replaceTimeline(result.machine)
	}

	const handlePlay = () => {
		if (!machine || machine.status !== 'ready' || isRunning) {
			return
		}

		terminateWorker()

		const worker = new Worker(new URL('../lib/simulator.worker.ts', import.meta.url), { type: 'module' })
		workerRef.current = worker

		worker.onmessage = (event: MessageEvent<SimulatorWorkerEvent>) => {
			const message = event.data
			appendTimelineSnapshot(message.machine)

			if (message.type === 'stopped') {
				terminateWorker()
				setIsRunning(false)
			}
		}

		worker.onerror = () => {
			terminateWorker()
			setIsRunning(false)
			const current = timelineRef.current[timelineIndexRef.current] ?? null
			if (!current) {
				return
			}

			appendTimelineSnapshot({
				...current,
				status: 'error',
				statusMessage: 'falló el runtime del Web Worker',
				history: [{ title: 'error de worker', detail: 'la ejecución continua se interrumpió por un fallo del worker' }, ...current.history].slice(0, 8),
			})
		}

		setIsRunning(true)
		worker.postMessage({
			type: 'start',
			machine,
			stepMode,
		})
	}

	const handlePause = () => {
		stopContinuousExecution()
	}

	return (
		<div className="sim-shell">
			<div className="section-lbl">simulador v1</div>

			<section className="sim-hero">
				<div className="sim-hero__copy">
					<h2 className="sim-hero__title">Máquina didáctica para {levelId}</h2>
					<p className="sim-hero__desc">
						Esta primera shell ya separa <strong>programa editable</strong>, <strong>memoria cargada</strong> y
						<strong> ejecución aislada</strong>. Ahora también podés caminar hacia atrás por la línea de tiempo y releer cualquier estado sin perder el contexto.
					</p>
				</div>

				<div className="sim-hero__meta">
					<span className="tag">pc</span>
					<span className="tag">ir</span>
					<span className="tag">r0</span>
					<span className="tag">r1</span>
					<span className="tag">memoria unificada</span>
				</div>
			</section>

			<div className="sim-workspace">
				<div className="sim-lane sim-lane--machine">
					<div className="sim-lane__label">panel de ejecución y lectura</div>

					<div className="sim-dashboard">
						<section className="sim-card sim-card--cpu">
							<div className="sim-card__head">
								<h3 className="sim-card__title">Estado de cpu</h3>
								<span className={getStatusChipClass(machine, isRunning)}>
									{isRunning ? 'corriendo' : machine ? STATUS_LABELS[machine.status] : 'sin carga válida'}
								</span>
							</div>

							<div className="sim-status-grid sim-status-grid--compact">
								<div className="sim-kv sim-kv--compact">
									<span className="sim-kv__key">pc</span>
									<span className="sim-kv__value">{machine ? String(machine.pc) : '--'}</span>
								</div>
								<div className="sim-kv sim-kv--compact">
									<span className="sim-kv__key">fase</span>
									<span className="sim-kv__value">{machine ? PHASE_LABELS[machine.phase] : '--'}</span>
								</div>
								<div className="sim-kv sim-kv--compact">
									<span className="sim-kv__key">r0</span>
									<span className="sim-kv__value">{machine ? String(machine.registers.r0) : '--'}</span>
								</div>
								<div className="sim-kv sim-kv--compact">
									<span className="sim-kv__key">r1</span>
									<span className="sim-kv__value">{machine ? String(machine.registers.r1) : '--'}</span>
								</div>
							</div>

							<div className="sim-cpu-inline">
								<div className="sim-ir sim-ir--compact">
									<span className="sim-kv__key">ir</span>
									<code className="sim-ir__value">{machine?.ir ?? '--'}</code>
								</div>
								{machine && (
									<div className="sim-kv sim-kv--compact sim-kv--quiet">
										<span className="sim-kv__key">estado</span>
										<span className="sim-kv__value">{timelineIndex + 1}/{timeline.length}</span>
									</div>
								)}
							</div>
						</section>

						<section className="sim-card sim-card--control">
							<div className="sim-card__head sim-card__head--control">
								<h3 className="sim-card__title">Control del cpu</h3>
								<div className="sim-control-head">
									<div className="sim-control-head__row">
										{machine && <span className="sim-chip">estado {timelineIndex + 1}/{timeline.length}</span>}
										<div className="sim-mode-row">
											<button
												className={`sim-mode-pill ${stepMode === 'instruction' ? 'sim-mode-pill--active' : ''}`}
												onClick={() => handleStepModeSelect('instruction')}
											>
												pasos
											</button>
											<button
												className={`sim-mode-pill ${stepMode === 'micro' ? 'sim-mode-pill--active' : ''}`}
												onClick={() => handleStepModeSelect('micro')}
											>
												micropasos
											</button>
										</div>
									</div>
									<div className="sim-control-head__row">
										<button className="ghost-btn sim-btn" onClick={handleStepBack} disabled={!timelineHasPast || isRunning}>anterior</button>
										<button className="ghost-btn sim-btn" onClick={handleStep} disabled={!machine || machine.status !== 'ready' || isRunning}>step</button>
										<button className="ghost-btn sim-btn" onClick={handlePlay} disabled={!machine || machine.status !== 'ready' || isRunning}>play</button>
										<button className="ghost-btn sim-btn" onClick={handlePause} disabled={!isRunning}>pause</button>
										<button className="ghost-btn sim-btn" onClick={handleReset} disabled={!machine}>reset</button>
									</div>
								</div>
							</div>

							<div className="sim-explainer">
								<div className="sim-explainer__summary">
									<div className="sim-explainer__copy">
										<span className="sim-kv__key">{activeTrace ? getTraceLabel(activeTrace) : 'estado actual'}</span>
										<p className="sim-explainer__text">{explanationSummary}</p>
									</div>
									{activeTrace && (
										<button
											className="ghost-btn sim-btn sim-btn--small"
											onClick={() => setIsExplanationExpanded((current) => !current)}
										>
											{isExplanationExpanded ? 'ocultar detalle' : 'ver detalle'}
										</button>
									)}
								</div>

								{isExplanationExpanded && activeTrace && (
									<div className="sim-explainer__details">
										<div className="sim-explainer__details-head">
											<h4 className="sim-explainer__title">{activeTrace.title}</h4>
											{activeInstructionText && (
												<code className="sim-trace__instruction">{activeInstructionText}</code>
											)}
										</div>

										{activeTrace.phases.length > 0 ? (
											<div className="sim-trace__phases">
												{activeTrace.phases.map((phase, index) => (
													<div key={`${phase.phase}-${index}`} className="sim-trace-phase">
														<div className="sim-trace-phase__head">
															<span className="sim-trace-phase__title">{phase.title}</span>
															<span className="sim-trace-phase__phase">{phase.phase}</span>
														</div>
														<p className="sim-trace-phase__summary">{phase.summary}</p>
														<div className="sim-trace-phase__bullets">
															{phase.bullets.map((bullet) => (
																<div key={`${bullet.label}-${bullet.detail}`} className="sim-trace-phase__bullet">
																	<span className="sim-trace-phase__bullet-label">{bullet.label}</span>
																	<span className="sim-trace-phase__bullet-detail">{bullet.detail}</span>
																</div>
															))}
														</div>
													</div>
												))}
											</div>
										) : (
											<p className="sim-note">No hay más detalle didáctico para este estado.</p>
										)}
									</div>
								)}

								{machine && timelineHasFuture && (
									<p className="sim-note sim-note--compact">
										Si seguís ejecutando desde este estado, la línea de tiempo continúa desde acá.
									</p>
								)}
							</div>
						</section>

						<section className="sim-card sim-card--memory">
							<div className="sim-card__head">
								<div>
									<h3 className="sim-card__title">Memoria cargada</h3>
									<p className="sim-card__desc">La tabla marca qué dirección está bajo el pc y cuál contiene la instrucción activa.</p>
								</div>
							</div>

							{machine ? (
								<div className="sim-memory-wrap sim-memory-wrap--compact">
									<table className="sim-memory sim-memory--compact">
										<thead>
											<tr>
												<th>dir</th>
												<th>rol</th>
												<th>contenido</th>
											</tr>
										</thead>
										<tbody>
											{memoryRows.map((row) => (
												<tr
													key={`${row.role}-${row.address}`}
													className={[
														machine.pc === row.address ? 'sim-memory-row--pc' : '',
														machine.currentInstructionAddress === row.address ? 'sim-memory-row--current' : '',
													].filter(Boolean).join(' ')}
												>
													<td>{row.address}</td>
													<td>
														<span className={`sim-role sim-role--${row.role}`}>{row.role}</span>
													</td>
													<td>{row.value}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<p className="sim-note sim-note--boxed">Todavía no hay una carga válida para mostrar.</p>
							)}

							{issues.length > 0 && machine && (
								<p className="sim-note sim-note--boxed">
									La carga falló, pero la última memoria válida sigue visible. Así podés comparar el editor con la máquina ya cargada.
								</p>
							)}
						</section>

						<section className="sim-card sim-card--work">
							<div className="sim-card__head">
								<div>
									<h3 className="sim-card__title">Trabajo del cpu</h3>
									<p className="sim-card__desc">La línea de tiempo muestra estados previos; abajo ves cambios visibles e historial reciente.</p>
								</div>
							</div>

							{machine ? (
								<div className="sim-workbody">
									<div className="sim-timeline-nav">
										<button className="ghost-btn sim-btn sim-btn--icon" onClick={handleStepBack} disabled={!timelineHasPast || isRunning} aria-label="Ir al estado anterior">←</button>
										<span className="sim-timeline-nav__status">estado {timelineIndex + 1} / {timeline.length}</span>
										<button className="ghost-btn sim-btn sim-btn--icon" onClick={handleTimelineForward} disabled={!timelineHasFuture || isRunning} aria-label="Ir al estado siguiente">→</button>
									</div>

									<div className="sim-timeline">
										{timeline.map((snapshot, index) => (
											<Fragment key={`${index}-${snapshot.pc}-${snapshot.phase}-${snapshot.status}`}>
												{index > 0 && <span className="sim-timeline__arrow">→</span>}
												<button
													className={`sim-timeline__item ${index === timelineIndex ? 'sim-timeline__item--active' : ''}`}
													onClick={() => handleTimelineSelect(index)}
													disabled={isRunning}
												>
													<span className="sim-timeline__item-eyebrow">{getSnapshotEyebrow(snapshot, index)}</span>
													<span className="sim-timeline__item-title">{getSnapshotTitle(snapshot, index)}</span>
													<span className="sim-timeline__item-meta">{getSnapshotMeta(snapshot)}</span>
												</button>
											</Fragment>
										))}
									</div>

									<div className="sim-workscroll">
										{activeTrace && (
											<div className="sim-worksection">
												<span className="sim-kv__key">trabajo visible</span>
												<div className="sim-workpanel">
													<div className="sim-workpanel__head">
														<div>
															<h4 className="sim-workpanel__title">{activeTrace.title}</h4>
														</div>
														{activeInstructionText && (
															<code className="sim-trace__instruction">{activeInstructionText}</code>
														)}
													</div>
													<div className="sim-trace__changes">
														{activeTrace.changes.map((change) => (
															<span key={change} className="sim-trace__change">{change}</span>
														))}
													</div>
												</div>
											</div>
										)}

										<div className="sim-worksection">
											<span className="sim-kv__key">registro reciente</span>
											<div className="sim-history">
												{machine.history.map((entry, index) => (
													<div key={`${entry.title}-${index}`} className="sim-history__item">
														<span className="sim-history__title">{entry.title}</span>
														<span className="sim-history__detail">{entry.detail}</span>
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							) : (
								<p className="sim-note sim-note--boxed">Sin una carga válida no hay nada para ejecutar.</p>
							)}
						</section>
					</div>
				</div>

				<div className="sim-lane">
					<div className="sim-lane__label">carga y edición de programas</div>

					<section className="sim-card sim-card--prepare">
						<div className="sim-card__head">
							<div>
								<h3 className="sim-card__title">Preparar y cargar</h3>
								<p className="sim-card__desc">Elegir preset, editar programa y decidir cuándo actualizar la máquina.</p>
							</div>
							<span className={`sim-chip ${editorDirty ? 'sim-chip--dirty' : 'sim-chip--loaded'}`}>
								{editorDirty ? 'editor modificado' : 'sin cambios desde la última carga'}
							</span>
						</div>

						<div className="sim-presets">
							{availablePresets.map((preset) => (
								<button
									key={preset.id}
									className={`sim-preset ${preset.id === presetId ? 'sim-preset--active' : ''}`}
									onClick={() => handlePresetSelect(preset)}
								>
									<span className="sim-preset__title">{preset.label}</span>
									<span className="sim-preset__note">{preset.note}</span>
								</button>
							))}
						</div>

						<div className="sim-editors">
							<label className="sim-field">
								<span className="sim-field__label">Programa editable</span>
								<textarea
									className="sim-textarea"
									value={programText}
									onChange={(event) => setProgramText(event.target.value)}
									spellCheck={false}
								/>
							</label>

							<label className="sim-field">
								<span className="sim-field__label">Datos iniciales</span>
								<textarea
									className="sim-textarea sim-textarea--compact"
									value={dataText}
									onChange={(event) => setDataText(event.target.value)}
									spellCheck={false}
								/>
							</label>
						</div>

						<div className="sim-toolbar sim-toolbar--prepare">
							<div className="sim-toolbar__group">
								<button className="ghost-btn sim-btn sim-btn--accent" onClick={handleLoad}>cargar en memoria</button>
								<button className="ghost-btn sim-btn" onClick={handleRestoreLastLoad}>restaurar última carga</button>
							</div>
						</div>

						{issues.length > 0 && (
							<div className="sim-errors">
								{issues.map((issue) => (
									<div key={`${issue.scope}-${issue.line}-${issue.message}`} className="sim-error">
										<span className="sim-error__meta">{issue.scope} · línea {issue.line}</span>
										<span className="sim-error__message">{issue.message}</span>
									</div>
								))}
							</div>
						)}

						<p className="sim-note">
							Editar el texto no cambia la máquina cargada. La UI separa a propósito el <strong>editor</strong>
							de la <strong>máquina ya preparada</strong> y de la <strong>línea de tiempo</strong> que estás recorriendo.
						</p>
					</section>
				</div>
			</div>
		</div>
	)
}
