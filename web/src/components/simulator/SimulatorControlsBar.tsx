import {
	AUTOPLAY_INTERVAL_OPTIONS,
	AUTOPLAY_MAX_STEP_OPTIONS,
} from '../../lib/simulator-runtime'
import type { SimulatorMachine, StepMode } from '../../lib/simulator'
import { STATUS_LABELS, getStatusChipClass, isAutoplayPaused } from './view'

type Props = {
	machine: SimulatorMachine | null
	isRunning: boolean
	stepMode: StepMode
	timelineHasPast: boolean
	timelineHasFuture: boolean
	onStepBack: () => void
	onStepForward: () => void
	onStep: () => void
	onPlay: () => void
	onPause: () => void
	onReset: () => void
	onStepModeSelect: (nextMode: StepMode) => void
	autoplayIntervalMs: number
	autoplayMaxSteps: number
	onAutoplayIntervalChange: (nextMs: number) => void
	onAutoplayMaxStepsChange: (nextSteps: number) => void
}

export function SimulatorControlsBar({
	machine,
	isRunning,
	stepMode,
	timelineHasPast,
	timelineHasFuture,
	onStepBack,
	onStepForward,
	onStep,
	onPlay,
	onPause,
	onReset,
	onStepModeSelect,
	autoplayIntervalMs,
	autoplayMaxSteps,
	onAutoplayIntervalChange,
	onAutoplayMaxStepsChange,
}: Props) {
	const autoplayPaused = isAutoplayPaused(machine)

	return (
		<div className="sim-dbg-bar">
			<div className="sim-dbg-controls">
				<button
					className="sim-dbg-btn"
					onClick={onStepBack}
					disabled={!timelineHasPast || isRunning}
					aria-label="Estado anterior"
					title="Estado anterior"
				>←</button>
				<button
					className="sim-dbg-btn"
					onClick={onStepForward}
					disabled={!timelineHasFuture || isRunning}
					aria-label="Estado siguiente"
					title="Estado siguiente"
				>→</button>
				<span className="sim-dbg-sep" />
				<button
					className="sim-dbg-btn"
					onClick={onStep}
					disabled={!machine || machine.status !== 'ready' || isRunning}
					aria-label="Avanzar un paso"
					title="Avanzar un paso"
				>▶|</button>
				{isRunning ? (
					<button className="sim-dbg-btn" onClick={onPause} aria-label="Pausar" title="Pausar">⏸</button>
				) : (
					<button
						className="sim-dbg-btn"
						onClick={onPlay}
						disabled={!machine || machine.status !== 'ready'}
						aria-label="Iniciar ejecución continua"
						title="Play"
					>▶</button>
				)}
				<button className="sim-dbg-btn" onClick={onReset} disabled={!machine} aria-label="Reiniciar" title="Reiniciar">↺</button>
				<span className="sim-dbg-sep" />
				<div className="sim-dbg-toggle">
					<button
						className={`sim-dbg-toggle__btn ${stepMode === 'instruction' ? 'sim-dbg-toggle__btn--active' : ''}`}
						onClick={() => onStepModeSelect('instruction')}
					>paso</button>
					<button
						className={`sim-dbg-toggle__btn ${stepMode === 'micro' ? 'sim-dbg-toggle__btn--active' : ''}`}
						onClick={() => onStepModeSelect('micro')}
					>micro</button>
				</div>
				<div className="sim-dbg-config">
					<label className="sim-dbg-field">
						<span className="sim-dbg-field__label">vel</span>
						<select
							className="sim-dbg-select"
							value={String(autoplayIntervalMs)}
							onChange={(event) => onAutoplayIntervalChange(Number(event.target.value))}
							disabled={isRunning}
							title="Velocidad de ejecución continua"
						>
							{AUTOPLAY_INTERVAL_OPTIONS.map((value) => (
								<option key={value} value={value}>{value} ms</option>
							))}
						</select>
					</label>
					<label className="sim-dbg-field">
						<span className="sim-dbg-field__label">límite</span>
						<select
							className="sim-dbg-select"
							value={String(autoplayMaxSteps)}
							onChange={(event) => onAutoplayMaxStepsChange(Number(event.target.value))}
							disabled={isRunning}
							title="Límite de pasos continuos antes de pausar"
						>
							{AUTOPLAY_MAX_STEP_OPTIONS.map((value) => (
								<option key={value} value={value}>{value}</option>
							))}
						</select>
					</label>
				</div>
			</div>
			{machine && (machine.status !== 'ready' || isRunning || autoplayPaused) && (
				<span className={getStatusChipClass(machine, isRunning)}>
					{isRunning ? 'corriendo' : autoplayPaused ? 'pausa auto' : STATUS_LABELS[machine.status]}
				</span>
			)}
		</div>
	)
}