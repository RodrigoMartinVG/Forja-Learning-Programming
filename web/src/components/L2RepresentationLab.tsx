import { useMemo, useReducer } from 'react'

import {
  getAsciiPatchValidation,
  getBitSlice8,
  getBytePatchValidation,
  getDerivedReadRows,
  getInterpretationPreview,
  getHexdumpRows,
  getLogicalWriteValidation,
  getNextLargerSelectionLength,
  getNextSmallerSelectionLength,
  getOperandValidation,
  getSelectionRangeLabel,
  getSignedRange,
  getUnsignedRange,
  formatAddress,
  formatByteHex,
  LOGICAL_LABELS,
  LOGICAL_OPTIONS_BY_LENGTH,
  MEMORY_SIZE_OPTIONS,
  PRESETS,
  READ_LABELS,
  READ_OPTIONS_BY_LENGTH,
  SELECTION_LENGTH_OPTIONS,
  createInitialState,
  labReducer,
  type LabHistoryKind,
  type NumericNotation,
  type SelectionLength,
  type ReadInterpretation,
  type LogicalInterpretation,
} from './l2-lab/model'

const HISTORY_KIND_LABELS: Record<LabHistoryKind, string> = {
  'material-write': 'accion material',
  reinterpretation: 'solo cambia la lectura',
  arithmetic: 'accion logica',
  preset: 'escena',
  memory: 'memoria',
}

const NOTATION_LABELS: Record<NumericNotation, string> = {
  decimal: 'decimal',
  hex: 'hex',
  binary: 'binario',
}

const READ_HELP: Record<ReadInterpretation, string> = {
  u8: 'Lee los mismos bytes como entero unsigned.',
  u16: 'Lee los mismos bytes como entero unsigned.',
  u32: 'Lee los mismos bytes como entero unsigned.',
  u64: 'Lee los mismos bytes como entero unsigned.',
  i8: 'Reinterpreta los bits como signed en complemento a dos.',
  i16: 'Reinterpreta los bits como signed en complemento a dos.',
  i32: 'Reinterpreta los bits como signed en complemento a dos.',
  i64: 'Reinterpreta los bits como signed en complemento a dos.',
  float32: 'Mira la seleccion como aproximacion float32.',
  float64: 'Mira la seleccion como aproximacion float64.',
  'raw-bytes': 'Muestra el patron material sin imponer tipo numerico.',
  'ascii-simple': 'Muestra esos mismos bytes como ASCII simple con placeholders.',
}

const SCENE_GUIDES: Partial<Record<string, {
  title: string
  intro: string
  cues: Array<{ label: string; value: string }>
  closing: string
}>> = {
  'utf8-prefixes': {
    title: 'Longitud variable y lectura estructurada',
    intro: 'En esta escena, los bytes seleccionados ya no se entienden bien como ASCII simple. Se entienden mejor como una secuencia donde la forma del primer byte orienta cómo debe seguir la lectura.',
    cues: [
      { label: 'C3', value: 'empieza con 110, asi que anuncia el comienzo de una secuencia UTF-8 de 2 bytes' },
      { label: 'A9', value: 'empieza con 10, asi que funciona como byte de continuacion y no como comienzo autonomo' },
      { label: 'cursor material', value: 'puede pararse en cualquier byte de memoria' },
      { label: 'cursor de decodificacion', value: 'solo esta alineado si entra por el comienzo correcto de la secuencia' },
    ],
    closing: 'La idea importante no es solo textual. Mas adelante reaparece en encodings de instrucciones y opcodes de longitud variable, donde ciertos bytes iniciales tambien orientan cuanta estructura queda por leer.',
  },
}

export default function L2RepresentationLab() {
  const [state, dispatch] = useReducer(labReducer, createInitialState())

  const hexdumpRows = useMemo(() => getHexdumpRows(state), [state])
  const bitSlice = useMemo(() => getBitSlice8(state), [state])
  const derivedReadRows = useMemo(() => getDerivedReadRows(state), [state])
  const logicalValidation = useMemo(() => getLogicalWriteValidation(state), [state])
  const operandValidation = useMemo(() => getOperandValidation(state), [state])
  const bytePatchValidation = useMemo(() => getBytePatchValidation(state), [state])
  const asciiPatchValidation = useMemo(() => getAsciiPatchValidation(state), [state])
  const nextLargerSelectionLength = useMemo(() => getNextLargerSelectionLength(state), [state])
  const nextSmallerSelectionLength = useMemo(() => getNextSmallerSelectionLength(state), [state])
  const activeReadValue = useMemo(() => getInterpretationPreview(state, state.readView.interpretation) ?? '—', [state])
  const unsignedRange = useMemo(() => getUnsignedRange(state.selection.lengthBytes), [state.selection.lengthBytes])
  const signedRange = useMemo(() => getSignedRange(state.selection.lengthBytes), [state.selection.lengthBytes])

  const logicalOptions = LOGICAL_OPTIONS_BY_LENGTH[state.selection.lengthBytes]
  const readOptions = READ_OPTIONS_BY_LENGTH[state.selection.lengthBytes]
  const selectionRangeLabel = getSelectionRangeLabel(state)
  const widthBits = state.selection.lengthBytes * 8
  const activeSceneGuide = state.activePresetId ? SCENE_GUIDES[state.activePresetId] : null

  return (
    <div className="lab-shell">
      <div className="section-lbl">laboratorio de representacion</div>

      <div className="lab-hero">
        <div>
          <h2 className="lab-hero__title">Memoria canonica, hexdump y lecturas derivadas</h2>
          <p className="lab-hero__copy">
            Esta primera implementacion de la v2 toma a la memoria visible como unica fuente de verdad.
            La seleccion tipada, las lecturas numericas y ASCII, y los patches materiales se recalculan
            siempre a partir del mismo dump direccionable por bytes.
          </p>
        </div>
        <div className="lab-badges">
          <span className="lab-badge">hexdump</span>
          <span className="lab-badge">bits</span>
          <span className="lab-badge">ASCII</span>
          <span className="lab-badge">patches</span>
          <span className="lab-badge">fixed width</span>
        </div>
      </div>

      <div className="lab-grid">
        <section className="lab-card lab-card--full">
          <div className="lab-card__header">
            <div>
              <h3>Escenas y memoria visible</h3>
              <p>Cada preset abre una escena del nivel sobre una memoria mas larga y expandible.</p>
            </div>
          </div>

          <div className="lab-toolbar">
            <label className="lab-field">
              <span>memoria visible</span>
              <select
                className="lab-select"
                value={state.memorySize}
                onChange={(event) => dispatch({ type: 'resize-memory', nextSize: Number(event.target.value) })}
              >
                {MEMORY_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option} bytes</option>
                ))}
              </select>
            </label>

            <div className="lab-toolbar__actions">
              <button className="lab-action" onClick={() => dispatch({ type: 'clear-memory' })}>limpiar memoria</button>
            </div>
          </div>

          <div className="lab-preset-grid">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={`lab-preset ${state.activePresetId === preset.id ? 'lab-preset--active' : ''}`}
                onClick={() => dispatch({ type: 'load-preset', presetId: preset.id })}
              >
                <span className="lab-preset__title">{preset.title}</span>
                <span className="lab-preset__note">{preset.note}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="lab-card">
          <div className="lab-card__header">
            <div>
              <h3>Seleccion activa</h3>
              <p>La memoria avanza byte a byte; la ventana tipada decide como leer una parte.</p>
            </div>
          </div>

          <div className="lab-control-grid">
            <label className="lab-field">
              <span>direccion inicial</span>
              <select
                className="lab-select"
                value={state.selection.startAddress}
                onChange={(event) => dispatch({ type: 'set-selection-start', address: Number(event.target.value) })}
              >
                {state.memory.map((_, address) => (
                  <option key={address} value={address}>{formatAddress(address)}</option>
                ))}
              </select>
            </label>

            <label className="lab-field">
              <span>tamano de seleccion</span>
              <select
                className="lab-select"
                value={state.selection.lengthBytes}
                onChange={(event) => dispatch({ type: 'set-selection-length', lengthBytes: Number(event.target.value) as SelectionLength })}
              >
                {SELECTION_LENGTH_OPTIONS.map((lengthBytes) => (
                  <option key={lengthBytes} value={lengthBytes}>{lengthBytes * 8} bits</option>
                ))}
              </select>
            </label>

            <label className="lab-field">
              <span>endianness</span>
              <select
                className="lab-select"
                value={state.readView.endianness}
                onChange={(event) => dispatch({ type: 'set-endianness', endianness: event.target.value as 'little' | 'big' })}
              >
                <option value="little">little endian</option>
                <option value="big">big endian</option>
              </select>
            </label>
          </div>

          <label className="lab-field">
            <span>lectura principal</span>
            <select
              className="lab-select"
              value={state.readView.interpretation}
              onChange={(event) => dispatch({ type: 'set-read-interpretation', interpretation: event.target.value as ReadInterpretation })}
            >
              {readOptions.map((option) => (
                <option key={option} value={option}>{READ_LABELS[option]}</option>
              ))}
            </select>
          </label>

          <div className="lab-reading-list">
            <div className="lab-reading-row">
              <span>ocupa</span>
              <code>{selectionRangeLabel}</code>
            </div>
            <div className="lab-reading-row">
              <span>unsigned valido</span>
              <code>{unsignedRange.min.toString()} .. {unsignedRange.max.toString()}</code>
            </div>
            <div className="lab-reading-row">
              <span>signed valido</span>
              <code>{signedRange.min.toString()} .. {signedRange.max.toString()}</code>
            </div>
          </div>

          <p className="lab-note">{READ_HELP[state.readView.interpretation]}</p>
        </section>

        <section className="lab-card">
          <div className="lab-card__header">
            <div>
              <h3>Lecturas derivadas</h3>
              <p>El patron material es uno; las lecturas cambian sin tocar la memoria.</p>
            </div>
          </div>

          <div className="lab-reading-summary">
            <div className="lab-field-group__title">lectura principal</div>
            <div className="lab-reading-summary__head">{READ_LABELS[state.readView.interpretation]}</div>
            <code className="lab-reading-summary__value">{activeReadValue}</code>
          </div>

          <div className="lab-reading-list">
            {derivedReadRows.map((row) => (
              <div key={row.id} className={`lab-reading-row ${row.active ? 'lab-reading-row--active' : ''}`}>
                <span>{row.label}</span>
                <code>{row.value}</code>
              </div>
            ))}
          </div>
        </section>

        {activeSceneGuide && (
          <section className="lab-card">
            <div className="lab-card__header">
              <div>
                <h3>{activeSceneGuide.title}</h3>
                <p>{activeSceneGuide.intro}</p>
              </div>
            </div>

            <div className="lab-reading-list">
              {activeSceneGuide.cues.map((cue) => (
                <div key={cue.label} className="lab-reading-row">
                  <span>{cue.label}</span>
                  <span>{cue.value}</span>
                </div>
              ))}
            </div>

            <p className="lab-note">{activeSceneGuide.closing}</p>
          </section>
        )}

        <section className="lab-card lab-card--full">
          <div className="lab-card__header">
            <div>
              <h3>Hexdump canonico</h3>
              <p>La memoria visible siempre avanza byte a byte. La columna ASCII es otra lectura del mismo dump.</p>
            </div>
          </div>

          <div className="lab-hexdump">
            <div className="lab-hexdump__header">
              <span className="lab-hexdump__row-addr">addr</span>
              <div className="lab-hexdump__bytes lab-hexdump__bytes--labels">
                {Array.from({ length: 16 }, (_, index) => (
                  <span key={index} className="lab-hexdump__label">{index.toString(16).toUpperCase().padStart(2, '0')}</span>
                ))}
              </div>
              <span className="lab-hexdump__ascii">ASCII</span>
            </div>

            {hexdumpRows.map((row) => (
              <div key={row.rowStart} className="lab-hexdump__row">
                <span className="lab-hexdump__row-addr">{formatAddress(row.rowStart)}</span>
                <div className="lab-hexdump__bytes">
                  {row.cells.map((cell) => (
                    <button
                      key={cell.address}
                      className={[
                        'lab-hexdump__byte',
                        cell.isSelected ? 'lab-hexdump__byte--selected' : '',
                        cell.isSelectionStart ? 'lab-hexdump__byte--anchor' : '',
                      ].join(' ').trim()}
                      onClick={() => dispatch({ type: 'set-selection-start', address: cell.address })}
                    >
                      {formatByteHex(cell.value)}
                    </button>
                  ))}
                </div>
                <div className={`lab-hexdump__ascii ${row.hasSelectedBytes ? 'lab-hexdump__ascii--selected' : ''}`}>{row.ascii}</div>
              </div>
            ))}
          </div>

          <div className="lab-card__header lab-card__header--subsection">
            <div>
              <h3>Vista de 8 bytes a nivel bit</h3>
              <p>Sirve para tocar la materialidad fina sin perder el contexto del hexdump.</p>
            </div>
          </div>

          <div className="lab-memory-grid">
            {bitSlice.map((byte) => (
              <div
                key={byte.address}
                className={[
                  'lab-byte',
                  byte.isSelected ? 'lab-byte--active' : '',
                  byte.isSelectionStart ? 'lab-byte--cursor' : '',
                ].join(' ').trim()}
              >
                <div className="lab-byte__top">
                  <button className="lab-byte__addr" onClick={() => dispatch({ type: 'set-selection-start', address: byte.address })}>
                    {formatAddress(byte.address)}
                  </button>
                  <span className="lab-byte__hex">0x{formatByteHex(byte.value)}</span>
                </div>
                <div className="lab-bit-row">
                  {byte.bits.map((bit, bitIndex) => (
                    <button
                      key={`${byte.address}-${bitIndex}`}
                      className={`lab-bit ${bit === '1' ? 'lab-bit--on' : ''}`.trim()}
                      onClick={() => dispatch({ type: 'toggle-bit', address: byte.address, bitIndex })}
                    >
                      {bit}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lab-card">
          <div className="lab-card__header">
            <div>
              <h3>Escribir como valor</h3>
              <p>Esta superficie escribe sobre la seleccion tipada. Notacion e interpretacion ya no viven en el mismo combo.</p>
            </div>
          </div>

          <div className="lab-stack">
            <div className="lab-inline-fields lab-inline-fields--triple">
              <label className="lab-field">
                <span>interpretacion</span>
                <select
                  className="lab-select"
                  value={state.logicalEditor.interpretation}
                  onChange={(event) => dispatch({ type: 'set-logical-interpretation', interpretation: event.target.value as LogicalInterpretation })}
                >
                  {logicalOptions.map((option) => (
                    <option key={option} value={option}>{LOGICAL_LABELS[option]}</option>
                  ))}
                </select>
              </label>

              <label className="lab-field">
                <span>notacion</span>
                <select
                  className="lab-select"
                  value={state.logicalEditor.notation}
                  onChange={(event) => dispatch({ type: 'set-logical-notation', notation: event.target.value as NumericNotation })}
                >
                  {Object.entries(NOTATION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <label className="lab-field lab-field--grow">
                <span>entrada</span>
                <input
                  className="lab-input"
                  value={state.logicalEditor.valueInput}
                  onChange={(event) => dispatch({ type: 'set-logical-input', value: event.target.value })}
                />
              </label>
            </div>

            <p className="lab-note">Escribe sobre {selectionRangeLabel} usando {widthBits} bits y {state.readView.endianness} endian.</p>
            {logicalValidation.reason && <p className="lab-warning">{logicalValidation.reason}</p>}

            <div className="lab-action-row">
              <button
                className="lab-action"
                disabled={logicalValidation.value === null}
                onClick={() => logicalValidation.value !== null && dispatch({ type: 'write-logical-value', value: logicalValidation.value })}
              >
                escribir sobre seleccion
              </button>
            </div>

            <div className="lab-inline-fields lab-inline-fields--triple">
              <label className="lab-field lab-field--grow">
                <span>operando</span>
                <input
                  className="lab-input"
                  value={state.logicalEditor.operandInput}
                  onChange={(event) => dispatch({ type: 'set-operand-input', value: event.target.value })}
                />
              </label>

              <label className="lab-field">
                <span>notacion del operando</span>
                <select
                  className="lab-select"
                  value={state.logicalEditor.operandNotation}
                  onChange={(event) => dispatch({ type: 'set-operand-notation', notation: event.target.value as NumericNotation })}
                >
                  {Object.entries(NOTATION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <label className="lab-field">
                <span>aritmetica</span>
                <select
                  className="lab-select"
                  value={state.logicalEditor.arithmeticMode}
                  onChange={(event) => dispatch({ type: 'set-arithmetic-mode', mode: event.target.value as 'unsigned' | 'signed' })}
                >
                  <option value="unsigned">unsigned</option>
                  <option value="signed">signed</option>
                </select>
              </label>
            </div>

            {operandValidation.reason && <p className="lab-warning">{operandValidation.reason}</p>}

            <div className="lab-action-row">
              <button
                className="lab-action"
                disabled={operandValidation.value === null}
                onClick={() => operandValidation.value !== null && dispatch({ type: 'apply-arithmetic', operation: 'add', operand: operandValidation.value })}
              >
                sumar
              </button>
              <button
                className="lab-action"
                disabled={operandValidation.value === null}
                onClick={() => operandValidation.value !== null && dispatch({ type: 'apply-arithmetic', operation: 'subtract', operand: operandValidation.value })}
              >
                restar
              </button>
              <button
                className="lab-action"
                disabled={!nextLargerSelectionLength}
                onClick={() => dispatch({ type: 'apply-extension', mode: 'zero' })}
              >
                zero extend
              </button>
              <button
                className="lab-action"
                disabled={!nextLargerSelectionLength}
                onClick={() => dispatch({ type: 'apply-extension', mode: 'sign' })}
              >
                sign extend
              </button>
              <button
                className="lab-action"
                disabled={!nextSmallerSelectionLength}
                onClick={() => dispatch({ type: 'apply-truncate' })}
              >
                truncar
              </button>
            </div>
          </div>
        </section>

        <section className="lab-card">
          <div className="lab-card__header">
            <div>
              <h3>Editar memoria</h3>
              <p>Bytes, bits y ASCII simple viven del lado material. Ninguno de estos editores toca tipos por si solo.</p>
            </div>
          </div>

          <div className="lab-stack">
            <div className="lab-field-group">
              <div className="lab-field-group__title">patch de byte</div>
              <div className="lab-inline-fields">
                <label className="lab-field">
                  <span>direccion</span>
                  <select
                    className="lab-select"
                    value={state.memoryEditor.bytePatchAddress}
                    onChange={(event) => dispatch({ type: 'set-byte-patch-address', address: Number(event.target.value) })}
                  >
                    {state.memory.map((_, address) => (
                      <option key={address} value={address}>{formatAddress(address)}</option>
                    ))}
                  </select>
                </label>

                <label className="lab-field lab-field--grow">
                  <span>byte</span>
                  <input
                    className="lab-input"
                    value={state.memoryEditor.bytePatchValue}
                    onChange={(event) => dispatch({ type: 'set-byte-patch-value', value: event.target.value })}
                  />
                </label>
              </div>

              {bytePatchValidation.reason && <p className="lab-warning">{bytePatchValidation.reason}</p>}

              <div className="lab-action-row">
                <button
                  className="lab-action"
                  disabled={bytePatchValidation.value === null}
                  onClick={() => bytePatchValidation.value !== null && dispatch({
                    type: 'patch-byte',
                    address: state.memoryEditor.bytePatchAddress,
                    value: bytePatchValidation.value,
                  })}
                >
                  aplicar byte
                </button>
              </div>
            </div>

            <div className="lab-field-group">
              <div className="lab-field-group__title">patch ASCII simple</div>
              <div className="lab-inline-fields lab-inline-fields--address-wide">
                <label className="lab-field">
                  <span>direccion inicial</span>
                  <select
                    className="lab-select"
                    value={state.memoryEditor.asciiPatchAddress}
                    onChange={(event) => dispatch({ type: 'set-ascii-patch-address', address: Number(event.target.value) })}
                  >
                    {state.memory.map((_, address) => (
                      <option key={address} value={address}>{formatAddress(address)}</option>
                    ))}
                  </select>
                </label>

                <label className="lab-field lab-field--grow">
                  <span>texto</span>
                  <input
                    className="lab-input"
                    value={state.memoryEditor.asciiPatchText}
                    onChange={(event) => dispatch({ type: 'set-ascii-patch-text', value: event.target.value })}
                  />
                </label>
              </div>

              <p className="lab-note">Sobrescribe exactamente los bytes del texto. No agrega terminador ni padding.</p>
              {asciiPatchValidation.reason && <p className="lab-warning">{asciiPatchValidation.reason}</p>}

              <div className="lab-action-row">
                <button
                  className="lab-action"
                  disabled={asciiPatchValidation.value === null}
                  onClick={() => asciiPatchValidation.value !== null && dispatch({
                    type: 'patch-ascii',
                    address: state.memoryEditor.asciiPatchAddress,
                    bytes: asciiPatchValidation.value,
                    text: state.memoryEditor.asciiPatchText,
                  })}
                >
                  aplicar patch ASCII
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="lab-card">
          <div className="lab-card__header">
            <div>
              <h3>Historial corto</h3>
              <p>El historial distingue escenas, reinterpretaciones, acciones logicas y acciones materiales.</p>
            </div>
          </div>

          <ul className="lab-history">
            {state.history.map((entry, index) => (
              <li key={`${entry.title}-${index}`} className="lab-history__item">
                <div className="lab-history__meta">
                  <div className="lab-history__title">{entry.title}</div>
                  <span className={`lab-history__kind lab-history__kind--${entry.kind}`}>{HISTORY_KIND_LABELS[entry.kind]}</span>
                </div>
                <div className="lab-history__detail">{entry.detail}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}