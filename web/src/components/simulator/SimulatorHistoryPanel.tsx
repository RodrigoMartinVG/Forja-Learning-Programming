import { Fragment, useEffect, useRef, useState } from 'react'

import type { SimulatorMachine } from '../../lib/simulator'
import { getSnapshotEyebrow, getSnapshotMeta, getSnapshotTitle } from './view'

type Props = {
	machine: SimulatorMachine | null
	timeline: SimulatorMachine[]
	timelineIndex: number
	isRunning: boolean
	onSelect: (index: number) => void
}

export function SimulatorHistoryPanel({ machine, timeline, timelineIndex, isRunning, onSelect }: Props) {
	const [isExpanded, setIsExpanded] = useState(false)
	const timelineScrollRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		if (!isExpanded) {
			return
		}

		const container = timelineScrollRef.current
		if (!container) {
			return
		}

		const activeItem = container.querySelector('.sim-timeline__item--active') as HTMLElement | null
		activeItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
	}, [timelineIndex, isExpanded])

	if (!machine) {
		return null
	}

	return (
		<div className="sim-history-section">
			<button className="ghost-btn sim-btn sim-btn--small" onClick={() => setIsExpanded((current) => !current)}>
				{isExpanded ? 'ocultar historial' : `ver historial (${timelineIndex + 1}/${timeline.length})`}
			</button>
			{isExpanded && (
				<div className="sim-history-strip" ref={timelineScrollRef}>
					<div className="sim-timeline">
						{timeline.map((snapshot, index) => (
							<Fragment key={`${index}-${snapshot.pc}-${snapshot.phase}-${snapshot.status}`}>
								{index > 0 && <span className="sim-timeline__arrow">→</span>}
								<button
									className={`sim-timeline__item ${index === timelineIndex ? 'sim-timeline__item--active' : ''}`}
									onClick={() => onSelect(index)}
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
	)
}