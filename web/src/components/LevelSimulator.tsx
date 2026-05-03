import { useEffect, useRef, useState } from 'react'

import {
	getMemoryRows,
	parseSimulatorInput,
	stepMachine,
	type ParseIssue,
	type SimulatorMachine,
	type StepMode,
} from '../lib/simulator'
import { REGISTER_NAMES } from '../lib/simulator-registers'
import {
	DEFAULT_AUTOPLAY_INTERVAL_MS,
	DEFAULT_AUTOPLAY_MAX_STEPS,
	type SimulatorWorkerCommand,
	type SimulatorWorkerEvent,
} from '../lib/simulator-runtime'
import { SimulatorControlsBar } from './simulator/SimulatorControlsBar'
import { SimulatorHistoryPanel } from './simulator/SimulatorHistoryPanel'
import { SimulatorMemoryPanel } from './simulator/SimulatorMemoryPanel'
import { SimulatorPhasePanel } from './simulator/SimulatorPhasePanel'
import { SimulatorPreparePanel } from './simulator/SimulatorPreparePanel'
import { buildInitialState, buildTimelineState, resolvePresets, type Preset } from './simulator/shared'

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
	const [autoplayIntervalMs, setAutoplayIntervalMs] = useState(DEFAULT_AUTOPLAY_INTERVAL_MS)
	const [autoplayMaxSteps, setAutoplayMaxSteps] = useState(DEFAULT_AUTOPLAY_MAX_STEPS)
	const [isRunning, setIsRunning] = useState(false)
	const [lastLoaded, setLastLoaded] = useState(initialState.lastLoaded)
	const [timeline, setTimeline] = useState<SimulatorMachine[]>(initialTimelineState.timeline)
	const [timelineIndex, setTimelineIndex] = useState(initialTimelineState.timelineIndex)
	const selectedPreset = availablePresets.find((preset) => preset.id === presetId) ?? availablePresets[0] ?? null

	const workerRef = useRef<Worker | null>(null)
	const timelineRef = useRef<SimulatorMachine[]>(initialTimelineState.timeline)
	const timelineIndexRef = useRef(initialTimelineState.timelineIndex)

	const editorDirty = programText !== lastLoaded.program || dataText !== lastLoaded.data
	const machine = timelineIndex >= 0 ? timeline[timelineIndex] ?? null : null
	const memoryRows = machine ? getMemoryRows(machine) : []
	const timelineHasPast = timelineIndex > 0
	const timelineHasFuture = timelineIndex >= 0 && timelineIndex < timeline.length - 1
	const registerRangeLabel = `${REGISTER_NAMES[0]}-${REGISTER_NAMES[REGISTER_NAMES.length - 1]}`

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
		const command: SimulatorWorkerCommand = {
			type: 'start',
			machine,
			stepMode,
			intervalMs: autoplayIntervalMs,
			maxSteps: autoplayMaxSteps,
		}

		worker.postMessage(command)
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
					<span className="tag">{registerRangeLabel}</span>
					<span className="tag">memoria unificada</span>
				</div>
			</section>

			<div className="sim-workspace">
				<div className="sim-panel-pair">
					<SimulatorMemoryPanel machine={machine} memoryRows={memoryRows} hasIssues={issues.length > 0} />

					{/* ── CPU ────────────────────────────────────────── */}
					<section className="sim-panel sim-panel--cpu">
						<SimulatorControlsBar
							machine={machine}
							isRunning={isRunning}
							stepMode={stepMode}
							timelineHasPast={timelineHasPast}
							timelineHasFuture={timelineHasFuture}
							onStepBack={handleStepBack}
							onStepForward={handleTimelineForward}
							onStep={handleStep}
							onPlay={handlePlay}
							onPause={handlePause}
							onReset={handleReset}
							onStepModeSelect={handleStepModeSelect}
							autoplayIntervalMs={autoplayIntervalMs}
							autoplayMaxSteps={autoplayMaxSteps}
							onAutoplayIntervalChange={setAutoplayIntervalMs}
							onAutoplayMaxStepsChange={setAutoplayMaxSteps}
						/>

						{/* Bloque 1: Registros + Ejecución actual */}
						<div className="sim-cpu-state">
							<div className="sim-cpu-block">
								<span className="sim-cpu-block__label">registros</span>
								<div className="sim-cpu-rows">
									{REGISTER_NAMES.map((register) => (
										<div key={register} className="sim-cpu-row">
											<span className="sim-cpu-row__label">{register}</span>
											<span className="sim-cpu-row__value">{machine ? String(machine.registers[register]) : '--'}</span>
										</div>
									))}
								</div>
							</div>
							<div className="sim-cpu-block sim-cpu-block--exec">
								<span className="sim-cpu-block__label">ejecución actual</span>
								<div className="sim-cpu-rows">
									<div className="sim-cpu-row">
										<span className="sim-cpu-row__label">pc</span>
										<span className="sim-cpu-row__value">{machine ? String(machine.pc) : '--'}</span>
									</div>
									<div className="sim-cpu-row">
										<span className="sim-cpu-row__label">instr</span>
										<span className="sim-cpu-row__value">{machine ? String(machine.executedInstructions) : '--'}</span>
									</div>
									<div className="sim-cpu-row sim-cpu-row--instruction">
										<span className="sim-cpu-row__label">ir</span>
										<code className="sim-cpu-row__instruction">{machine?.ir ?? '--'}</code>
									</div>
								</div>
							</div>
						</div>

						<SimulatorPhasePanel machine={machine} />

						<SimulatorHistoryPanel
							machine={machine}
							timeline={timeline}
							timelineIndex={timelineIndex}
							isRunning={isRunning}
							onSelect={handleTimelineSelect}
						/>
					</section>
				</div>
				<SimulatorPreparePanel
					editorDirty={editorDirty}
					availablePresets={availablePresets}
					selectedPreset={selectedPreset}
					programText={programText}
					dataText={dataText}
					issues={issues}
					onPresetSelect={handlePresetSelect}
					onProgramChange={setProgramText}
					onDataChange={setDataText}
					onLoad={handleLoad}
					onRestoreLastLoad={handleRestoreLastLoad}
				/>
			</div>
		</div>
	)
}
