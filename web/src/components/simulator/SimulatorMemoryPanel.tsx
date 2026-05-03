import type { MemoryRow, SimulatorMachine } from '../../lib/simulator'

type Props = {
	machine: SimulatorMachine | null
	memoryRows: MemoryRow[]
	hasIssues: boolean
}

export function SimulatorMemoryPanel({ machine, memoryRows, hasIssues }: Props) {
	return (
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

			{hasIssues && machine && (
				<p className="sim-note sim-note--boxed">
					La carga falló, pero la última memoria válida sigue visible. Así podés comparar el editor con la máquina ya cargada.
				</p>
			)}
		</section>
	)
}