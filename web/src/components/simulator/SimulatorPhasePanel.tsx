import { Fragment, useEffect, useState } from 'react'

import type { SimulatorMachine } from '../../lib/simulator'
import {
	PHASE_LABELS,
	buildConcretePcUpdate,
	buildDecodeLines,
	buildExecuteLines,
	buildFetchLines,
	getExplanationSummary,
	normalizePhaseLines,
	parseInstructionSignature,
} from './view'

type Props = {
	machine: SimulatorMachine | null
}

export function SimulatorPhasePanel({ machine }: Props) {
	const [isExplanationExpanded, setIsExplanationExpanded] = useState(false)
	const activeTrace = machine?.lastTrace ?? null
	const activeInstructionText = activeTrace && activeTrace.instructionText !== '--'
		? activeTrace.instructionText
		: null
	const explanationSummary = getExplanationSummary(machine, activeTrace)
	const parsedInstruction = parseInstructionSignature(machine?.ir ?? activeInstructionText)
	const phaseSymbolFetch = buildFetchLines(machine, machine?.ir ?? activeInstructionText)
	const phaseSymbolDecode = buildDecodeLines(parsedInstruction)
	const phaseSymbolPcUpdate = machine ? buildConcretePcUpdate(machine, parsedInstruction) : '--'
	const phaseSymbolExecute = buildExecuteLines(parsedInstruction, phaseSymbolPcUpdate)

	useEffect(() => {
		setIsExplanationExpanded(false)
	}, [machine?.pc, machine?.phase, machine?.statusMessage])

	if (!machine) {
		return <div className="sim-fase"><p className="sim-fase__text sim-fase__text--placeholder">Cargá un programa válido para inicializar la máquina.</p></div>
	}

	const phaseOrder: Record<string, number> = { idle: 0, fetch: 1, decode: 2, execute: 3 }
	const currentPhaseOrder = phaseOrder[machine.phase] ?? 0
	const phaseCards = [
		{ key: 'fetch', label: 'fetch', lines: phaseSymbolFetch },
		{ key: 'decode', label: 'decode', lines: currentPhaseOrder >= 2 ? phaseSymbolDecode : null },
		{ key: 'execute', label: 'execute', lines: currentPhaseOrder >= 3 ? phaseSymbolExecute : null },
	] as const

	return (
		<div className="sim-fase">
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
						{activeInstructionText && <code className="sim-trace__instruction">{activeInstructionText}</code>}
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
		</div>
	)
}