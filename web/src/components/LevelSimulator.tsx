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
	{
		id: 'indireccion-registro',
		label: 'indirección por registro',
		note: 'Usa LOAD/STORE con [rX] para mostrar dirección efectiva calculada en runtime.',
		program: [
			'300: MOV r0, 60',
			'301: LOAD r1, [r0]',
			'302: ADD r1, 8',
			'303: MOV r0, 61',
			'304: STORE r1, [r0]',
			'305: HALT',
		].join('\n'),
		data: [
			'60: 34',
			'61: 0',
		].join('\n'),
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

function parseInstructionSignature(instructionText: string | null): { opcode: string; operands: string[]; symbolic: string } {
	if (!instructionText || instructionText === '--') {
		return { opcode: '--', operands: [], symbolic: '--' }
	}

	const normalized = instructionText.trim()
	const [opcodeRaw, ...rest] = normalized.split(/\s+/)
	const opcode = opcodeRaw ? opcodeRaw.toUpperCase() : '--'
	const operandsText = rest.join(' ').trim()
	const operands = operandsText
		? operandsText.split(',').map((value) => value.trim()).filter(Boolean)
		: []

	return {
		opcode,
		operands,
		symbolic: operands.length > 0 ? `${opcode}(${operands.join(', ')})` : opcode,
	}
}

function buildDecodeSymbol(signature: { opcode: string; operands: string[] }): string {
	if (signature.opcode === '--') {
		return '--'
	}

	if (signature.operands.length === 0) {
		return `op=${signature.opcode}`
	}

	const parts = signature.operands.map((operand, index) => `a${index}=${operand}`)
	return `op=${signature.opcode} | ${parts.join(' | ')}`
}

function buildConcretePcUpdate(machine: SimulatorMachine, signature: { opcode: string; operands: string[] }): string {
	if (signature.opcode === '--') return '--'
	const [a0, a1] = signature.operands
	const base = machine.currentInstructionAddress ?? machine.pc
	switch (signature.opcode) {
		case 'JMP':
			return `pc <- ${a0 ?? '?'}`
		case 'JNZ': {
			const regKey = a0?.toLowerCase() as 'r0' | 'r1' | undefined
			const regVal = regKey ? machine.registers[regKey] : undefined
			if (regVal !== undefined) {
				return regVal !== 0 ? `pc <- ${a1}` : `pc <- ${base + 1}`
			}
			return `pc <- ${a1} (cond)`
		}
		case 'HALT':
			return 'halt'
		default:
			return `pc <- ${base + 1}`
	}
}

function buildExecuteSymbol(signature: { opcode: string; operands: string[] }): string {
	if (signature.opcode === '--') {
		return '--'
	}
	return signature.operands.length > 0
		? `exec.${signature.opcode}(${signature.operands.join(', ')})`
		: `exec.${signature.opcode}()`
}

function buildFetchLines(machine: SimulatorMachine | null, instructionText: string | null): string[] {
	if (!machine) {
		return ['mem[pc]', '-> --', 'ir <- --']
	}

	const fetched = instructionText && instructionText !== '--'
		? instructionText
		: (machine.ir || '--')

	return [`mem[${machine.pc}]`, `-> ${fetched}`, `ir <- ${fetched}`]
}

function buildDecodeLines(signature: { opcode: string; operands: string[] }): string[] {
	if (signature.opcode === '--') {
		return ['op = --']
	}

	const lines = [`op = ${signature.opcode}`]
	signature.operands.forEach((operand, index) => {
		lines.push(`a${index} = ${operand}`)
	})

	return lines.slice(0, 3)
}

function buildExecuteEffectLines(signature: { opcode: string; operands: string[] }): string[] {
	const [a0, a1] = signature.operands

	switch (signature.opcode) {
		case 'MOV':
			return a0 && a1 ? [`${a0} <- ${a1}`] : []
		case 'LOAD':
			return a0 && a1 ? [`${a0} <- mem${a1.replace(/^\[(.*)\]$/, '[$1]')}`] : []
		case 'STORE':
			return a0 && a1 ? [`mem${a1.replace(/^\[(.*)\]$/, '[$1]')} <- ${a0}`] : []
		case 'ADD':
			return a0 && a1 ? [`${a0} <- ${a0} + ${a1}`] : []
		case 'SUB':
			return a0 && a1 ? [`${a0} <- ${a0} - ${a1}`] : []
		case 'JMP':
			return a0 ? [`branch -> ${a0}`] : []
		case 'JNZ':
			return a0 && a1 ? [`if ${a0} != 0 -> ${a1}`] : []
		case 'HALT':
			return ['stop clock']
		default:
			return []
	}
}

function buildExecuteLines(
	signature: { opcode: string; operands: string[] },
	pcUpdate: string | null = null,
): string[] {
	if (signature.opcode === '--') {
		return ['--']
	}

	return [buildExecuteSymbol(signature), ...buildExecuteEffectLines(signature), ...(pcUpdate ? [pcUpdate] : [])].slice(0, 3)
}

function normalizePhaseLines(lines: string[] | null, rows = 3): Array<{ text: string; pending: boolean; empty: boolean }> {
	if (!lines) {
		return Array.from({ length: rows }, (_, index) => ({
			text: index === 0 ? '—' : '',
			pending: index === 0,
			empty: index !== 0,
		}))
	}

	const trimmed = lines.slice(0, rows)
	while (trimmed.length < rows) {
		trimmed.push('')
	}

	return trimmed.map((text) => ({ text, pending: false, empty: text === '' }))
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
	const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)
	const selectedPreset = availablePresets.find((preset) => preset.id === presetId) ?? availablePresets[0] ?? null

	const workerRef = useRef<Worker | null>(null)
	const timelineRef = useRef<SimulatorMachine[]>(initialTimelineState.timeline)
	const timelineIndexRef = useRef(initialTimelineState.timelineIndex)
	const timelineScrollRef = useRef<HTMLDivElement | null>(null)

	const editorDirty = programText !== lastLoaded.program || dataText !== lastLoaded.data
	const machine = timelineIndex >= 0 ? timeline[timelineIndex] ?? null : null
	const memoryRows = machine ? getMemoryRows(machine) : []
	const timelineHasPast = timelineIndex > 0
	const timelineHasFuture = timelineIndex >= 0 && timelineIndex < timeline.length - 1
	const activeTrace = machine?.lastTrace ?? null
	const latestEvent = machine?.history[0] ?? null
	const explanationSummary = activeTrace?.summary
		?? machine?.statusMessage
		?? 'Cargá un programa válido para inicializar la máquina.'
	const activeInstructionText = activeTrace && activeTrace.instructionText !== '--'
		? activeTrace.instructionText
		: null
	const parsedInstruction = parseInstructionSignature(machine?.ir ?? activeInstructionText)
	const phaseSymbolFetch = buildFetchLines(machine, machine?.ir ?? activeInstructionText)
	const phaseSymbolDecode = buildDecodeLines(parsedInstruction)
	const phaseSymbolPcUpdate = machine ? buildConcretePcUpdate(machine, parsedInstruction) : '--'
	const phaseSymbolExecute = buildExecuteLines(parsedInstruction, phaseSymbolPcUpdate)

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

	useEffect(() => {
		if (!isHistoryExpanded) {
			return
		}

		const container = timelineScrollRef.current
		if (!container) {
			return
		}

		const activeItem = container.querySelector('.sim-timeline__item--active') as HTMLElement | null
		activeItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
	}, [timelineIndex, isHistoryExpanded])

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
		setIsHistoryExpanded(false)
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
		setIsHistoryExpanded(false)
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

	const phaseOrder: Record<string, number> = { idle: 0, fetch: 1, decode: 2, execute: 3 }
	const currentPhaseOrder = machine ? (phaseOrder[machine.phase] ?? 0) : 0

	const phaseCards = [
		{ key: 'fetch',    label: 'fetch',   lines: phaseSymbolFetch },
		{ key: 'decode',   label: 'decode',  lines: currentPhaseOrder >= 2 ? phaseSymbolDecode : null },
		{ key: 'execute',  label: 'execute', lines: currentPhaseOrder >= 3 ? phaseSymbolExecute : null },
	] as const

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
				<div className="sim-panel-pair">

					{/* ── MEMORIA ────────────────────────────────────── */}
					<section className="sim-panel sim-panel--memory">
						<div className="sim-panel__head">
							<h3 className="sim-panel__title">Memoria</h3>
							<p className="sim-panel__desc">Código y datos unificados. Resaltado: pc e instrucción activa.</p>
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

					{/* ── CPU ────────────────────────────────────────── */}
					<section className="sim-panel sim-panel--cpu">

						{/* Barra de control tipo debugger */}
						<div className="sim-dbg-bar">
							<div className="sim-dbg-controls">
								<button
									className="sim-dbg-btn"
									onClick={handleStepBack}
									disabled={!timelineHasPast || isRunning}
									aria-label="Estado anterior"
									title="Estado anterior"
								>←</button>
								<button
									className="sim-dbg-btn"
									onClick={handleTimelineForward}
									disabled={!timelineHasFuture || isRunning}
									aria-label="Estado siguiente"
									title="Estado siguiente"
								>→</button>
								<span className="sim-dbg-sep" />
								<button
									className="sim-dbg-btn"
									onClick={handleStep}
									disabled={!machine || machine.status !== 'ready' || isRunning}
									aria-label="Avanzar un paso"
									title="Avanzar un paso"
								>▶|</button>
								{isRunning ? (
									<button
										className="sim-dbg-btn"
										onClick={handlePause}
										aria-label="Pausar"
										title="Pausar"
									>⏸</button>
								) : (
									<button
										className="sim-dbg-btn"
										onClick={handlePlay}
										disabled={!machine || machine.status !== 'ready'}
										aria-label="Iniciar ejecución continua"
										title="Play"
									>▶</button>
								)}
								<button
									className="sim-dbg-btn"
									onClick={handleReset}
									disabled={!machine}
									aria-label="Reiniciar"
									title="Reiniciar"
								>↺</button>
								<span className="sim-dbg-sep" />
								<div className="sim-dbg-toggle">
									<button
										className={`sim-dbg-toggle__btn ${stepMode === 'instruction' ? 'sim-dbg-toggle__btn--active' : ''}`}
										onClick={() => handleStepModeSelect('instruction')}
									>paso</button>
									<button
										className={`sim-dbg-toggle__btn ${stepMode === 'micro' ? 'sim-dbg-toggle__btn--active' : ''}`}
										onClick={() => handleStepModeSelect('micro')}
									>micro</button>
								</div>
							</div>
							{machine && (machine.status !== 'ready' || isRunning) && (
								<span className={getStatusChipClass(machine, isRunning)}>
									{isRunning ? 'corriendo' : STATUS_LABELS[machine.status]}
								</span>
							)}
						</div>

						{/* Bloque 1: Registros + Ejecución actual */}
						<div className="sim-cpu-state">
							<div className="sim-cpu-block">
								<span className="sim-cpu-block__label">registros</span>
								<div className="sim-cpu-rows">
									<div className="sim-cpu-row">
										<span className="sim-cpu-row__label">r0</span>
										<span className="sim-cpu-row__value">{machine ? String(machine.registers.r0) : '--'}</span>
									</div>
									<div className="sim-cpu-row">
										<span className="sim-cpu-row__label">r1</span>
										<span className="sim-cpu-row__value">{machine ? String(machine.registers.r1) : '--'}</span>
									</div>
								</div>
							</div>
							<div className="sim-cpu-block sim-cpu-block--exec">
								<span className="sim-cpu-block__label">ejecución actual</span>
								<div className="sim-cpu-rows">
									<div className="sim-cpu-row">
										<span className="sim-cpu-row__label">pc</span>
										<span className="sim-cpu-row__value">{machine ? String(machine.pc) : '--'}</span>
									</div>
									<div className="sim-cpu-row sim-cpu-row--instruction">
										<span className="sim-cpu-row__label">ir</span>
										<code className="sim-cpu-row__instruction">{machine?.ir ?? '--'}</code>
									</div>
								</div>
							</div>
						</div>

						{/* Bloque 2: Fase + explicación mínima */}
						<div className="sim-fase">
							{machine ? (
								<>
									<div className="sim-fase__head">
										<span className="sim-fase__label">
											Fase: <strong className="sim-fase__phase">{PHASE_LABELS[machine.phase]}</strong>
										</span>
										{activeTrace && (
											<button
												className="sim-fase__toggle ghost-btn sim-btn sim-btn--small"
												onClick={() => setIsExplanationExpanded((current) => !current)}
											>
												{isExplanationExpanded ? '▲' : '?'}
											</button>
										)}
									</div>
									<div className="sim-phase-rail">
										{phaseCards.map((phase, index) => (
											<Fragment key={phase.key}>
												<div className={`sim-phase-rail__item ${machine.phase === phase.key ? 'sim-phase-rail__item--active' : ''}`}>
													<span className="sim-phase-rail__title">{phase.label}</span>
													<div className="sim-phase-rail__body">
														{normalizePhaseLines(phase.lines).map((line, lineIndex) => (
															<span
																key={`${phase.key}-${lineIndex}`}
																className={[
																	'sim-phase-rail__line',
																	line.pending ? 'sim-phase-rail__line--pending' : '',
																	line.empty ? 'sim-phase-rail__line--empty' : '',
																].filter(Boolean).join(' ')}
															>
																{line.text || '\u00A0'}
															</span>
														))}
													</div>
												</div>
												{index < phaseCards.length - 1 && <span className="sim-phase-rail__arrow">→</span>}
											</Fragment>
										))}
									</div>
									<p className="sim-fase__text">{explanationSummary}</p>

									{isExplanationExpanded && activeTrace && (
										<div className="sim-fase__detail">
											<div className="sim-fase__detail-head">
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
								</>
							) : (
								<p className="sim-fase__text sim-fase__text--placeholder">Cargá un programa válido para inicializar la máquina.</p>
							)}
						</div>

						{/* Bloque 3: Historial de estados */}
						{machine && (
							<div className="sim-history-section">
								<button
									className="ghost-btn sim-btn sim-btn--small"
									onClick={() => setIsHistoryExpanded((current) => !current)}
								>
									{isHistoryExpanded
										? 'ocultar historial'
										: `ver historial (${timelineIndex + 1}/${timeline.length})`}
								</button>
								{isHistoryExpanded && (
									<div className="sim-history-strip" ref={timelineScrollRef}>
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
									</div>
								)}
							</div>
						)}
					</section>
				</div>

				{/* ── EDITOR / CARGA ─────────────────────────────────── */}
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

					<div className="sim-prepare-layout">
						<aside className="sim-prepare-controls">
							<div className="sim-prepare-controls__top">
								<div className="sim-presets">
									{availablePresets.map((preset) => (
										<button
											key={preset.id}
											className={`sim-preset ${preset.id === presetId ? 'sim-preset--active' : ''}`}
											onClick={() => handlePresetSelect(preset)}
										>
											<span className="sim-preset__title">{preset.label}</span>
										</button>
									))}
								</div>
								{selectedPreset && <p className="sim-presets__note">{selectedPreset.note}</p>}
							</div>

							<div className="sim-prepare-controls__middle">
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

								<div className="sim-toolbar sim-toolbar--prepare sim-toolbar--prepare-anchor">
									<div className="sim-toolbar__group">
										<button className="ghost-btn sim-btn sim-btn--accent" onClick={handleLoad}>cargar en memoria</button>
										<button className="ghost-btn sim-btn" onClick={handleRestoreLastLoad}>restaurar última carga</button>
									</div>
								</div>
							</div>

							<p className="sim-note sim-note--compact sim-prepare-controls__note">
								Editar el texto no cambia la máquina cargada. La UI separa a propósito <strong>programa</strong>,
								<strong>datos</strong>, <strong>máquina ya preparada</strong> y <strong>línea de tiempo</strong>.
								 Un editor unificado podría existir más adelante como modo avanzado de memoria cruda.
							</p>
						</aside>

						<div className="sim-prepare-editors">
							<label className="sim-field">
								<span className="sim-field__label">Datos iniciales</span>
								<span className="sim-field__hint">Valores iniciales en memoria, separados del código para no mezclar semánticas.</span>
								<textarea
									className="sim-textarea sim-textarea--compact"
									value={dataText}
									onChange={(event) => setDataText(event.target.value)}
									spellCheck={false}
								/>
							</label>

							<label className="sim-field">
								<span className="sim-field__label">Programa editable</span>
								<span className="sim-field__hint">Instrucciones con direcciones explícitas.</span>
								<textarea
									className="sim-textarea"
									value={programText}
									onChange={(event) => setProgramText(event.target.value)}
									spellCheck={false}
								/>
							</label>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}
