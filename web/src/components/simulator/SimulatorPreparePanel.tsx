import type { ParseIssue } from '../../lib/simulator'
import type { Preset } from './shared'

type Props = {
	editorDirty: boolean
	availablePresets: Preset[]
	selectedPreset: Preset | null
	programText: string
	dataText: string
	issues: ParseIssue[]
	onPresetSelect: (preset: Preset) => void
	onProgramChange: (value: string) => void
	onDataChange: (value: string) => void
	onLoad: () => void
	onRestoreLastLoad: () => void
}

export function SimulatorPreparePanel({
	editorDirty,
	availablePresets,
	selectedPreset,
	programText,
	dataText,
	issues,
	onPresetSelect,
	onProgramChange,
	onDataChange,
	onLoad,
	onRestoreLastLoad,
}: Props) {
	return (
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
									className={`sim-preset ${preset.id === selectedPreset?.id ? 'sim-preset--active' : ''}`}
									onClick={() => onPresetSelect(preset)}
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
								<button className="ghost-btn sim-btn sim-btn--accent" onClick={onLoad}>cargar en memoria</button>
								<button className="ghost-btn sim-btn" onClick={onRestoreLastLoad}>restaurar última carga</button>
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
						<textarea className="sim-textarea sim-textarea--compact" value={dataText} onChange={(event) => onDataChange(event.target.value)} spellCheck={false} />
					</label>

					<label className="sim-field">
						<span className="sim-field__label">Programa editable</span>
						<span className="sim-field__hint">Instrucciones con direcciones explícitas.</span>
						<textarea className="sim-textarea" value={programText} onChange={(event) => onProgramChange(event.target.value)} spellCheck={false} />
					</label>
				</div>
			</div>
		</section>
	)
}