import { useEffect, useRef, useState } from 'react'

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
    note: 'Prepara el caso de `JNZ` sin habilitar todavía la ejecución continua.',
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

export default function LevelSimulator({
  levelId,
  presets,
}: {
  levelId: string
  presets?: Array<{ slug: string; title: string; note: string; program: string; data: string }>
}) {
  const availablePresets = resolvePresets(presets)
  const initialState = buildInitialState(availablePresets[0])

  const [presetId, setPresetId] = useState(initialState.presetId)
  const [programText, setProgramText] = useState(initialState.programText)
  const [dataText, setDataText] = useState(initialState.dataText)
  const [machine, setMachine] = useState<SimulatorMachine | null>(initialState.machine)
  const [issues, setIssues] = useState<ParseIssue[]>(initialState.issues)
  const [stepMode, setStepMode] = useState<StepMode>('instruction')
  const [isRunning, setIsRunning] = useState(false)
  const [lastLoaded, setLastLoaded] = useState(initialState.lastLoaded)
  const workerRef = useRef<Worker | null>(null)

  const editorDirty = programText !== lastLoaded.program || dataText !== lastLoaded.data
  const memoryRows = machine ? getMemoryRows(machine) : []

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
    setMachine(result.machine)
    setLastLoaded({ program: preset.program, data: preset.data })
  }

  const handleLoad = () => {
    stopContinuousExecution()
    const result = parseSimulatorInput(programText, dataText)
    setIssues(result.issues)
    if (!result.machine) {
      return
    }

    setMachine(result.machine)
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

    setMachine(stepMachine(machine, stepMode))
  }

  const handleReset = () => {
    stopContinuousExecution()
    const result = parseSimulatorInput(lastLoaded.program, lastLoaded.data)
    setIssues(result.issues)
    setMachine(result.machine)
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
      setMachine(message.machine)

      if (message.type === 'stopped') {
        terminateWorker()
        setIsRunning(false)
      }
    }

    worker.onerror = () => {
      terminateWorker()
      setIsRunning(false)
      setMachine((current) => current
        ? {
            ...current,
            status: 'error',
            statusMessage: 'falló el runtime del Web Worker',
            history: [{ title: 'error de worker', detail: 'la ejecución continua se interrumpió por un fallo del worker' }, ...current.history].slice(0, 8),
          }
        : current)
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
            <strong> ejecución aislada</strong>. Ahora ya se puede avanzar paso a paso o correr en continuo dentro de un worker.
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
          <div className="sim-lane__label">máquina, ejecutor y memoria</div>

          <div className="sim-machine-grid">
            <section className="sim-card">
              <div className="sim-card__head">
                <div>
                  <h3 className="sim-card__title">Estado visible</h3>
                  <p className="sim-card__desc">La máquina muestra en vivo pc, ir, registros y el estado de ejecución.</p>
                </div>
                <span className={getStatusChipClass(machine, isRunning)}>{isRunning ? 'corriendo' : machine ? STATUS_LABELS[machine.status] : 'sin carga válida'}</span>
              </div>

              <div className="sim-status-grid">
                <div className="sim-kv">
                  <span className="sim-kv__key">pc</span>
                  <span className="sim-kv__value">{machine ? String(machine.pc) : '--'}</span>
                </div>
                <div className="sim-kv">
                  <span className="sim-kv__key">fase</span>
                  <span className="sim-kv__value">{machine ? PHASE_LABELS[machine.phase] : '--'}</span>
                </div>
                <div className="sim-kv">
                  <span className="sim-kv__key">r0</span>
                  <span className="sim-kv__value">{machine ? String(machine.registers.r0) : '--'}</span>
                </div>
                <div className="sim-kv">
                  <span className="sim-kv__key">r1</span>
                  <span className="sim-kv__value">{machine ? String(machine.registers.r1) : '--'}</span>
                </div>
              </div>

              <div className="sim-ir">
                <span className="sim-kv__key">ir</span>
                <code className="sim-ir__value">{machine?.ir ?? '--'}</code>
              </div>

              <p className="sim-note sim-note--boxed">{machine?.statusMessage ?? 'Cargá un programa válido para inicializar la máquina.'}</p>
            </section>

            <section className="sim-card">
              <div className="sim-card__head">
                <div>
                  <h3 className="sim-card__title">Ejecución</h3>
                  <p className="sim-card__desc">El modo actual define si cada click avanza una instrucción completa o una microfase.</p>
                </div>
              </div>

              <div className="sim-mode-row">
                <button
                  className={`sim-mode-pill ${stepMode === 'instruction' ? 'sim-mode-pill--active' : ''}`}
                  onClick={() => handleStepModeSelect('instruction')}
                >
                  step por instrucción
                </button>
                <button
                  className={`sim-mode-pill ${stepMode === 'micro' ? 'sim-mode-pill--active' : ''}`}
                  onClick={() => handleStepModeSelect('micro')}
                >
                  microfases fetch/decode/execute
                </button>
              </div>

              <div className="sim-toolbar sim-toolbar--machine">
                <div className="sim-toolbar__group">
                  <button className="ghost-btn sim-btn" onClick={handleStep} disabled={!machine || machine.status !== 'ready' || isRunning}>step</button>
                  <button className="ghost-btn sim-btn" onClick={handlePlay} disabled={!machine || machine.status !== 'ready' || isRunning}>play</button>
                  <button className="ghost-btn sim-btn" onClick={handlePause} disabled={!isRunning}>pause</button>
                  <button className="ghost-btn sim-btn" onClick={handleReset} disabled={!machine}>reset</button>
                </div>
              </div>

              {machine ? (
                <>
                  {machine.lastTrace && (
                    <div className="sim-trace">
                      <div className="sim-trace__head">
                        <div>
                          <span className="sim-kv__key">{getTraceLabel(machine.lastTrace)}</span>
                          <h4 className="sim-trace__title">{machine.lastTrace.title}</h4>
                        </div>
                        {machine.lastTrace.instructionText !== '--' && (
                          <code className="sim-trace__instruction">{machine.lastTrace.instructionText}</code>
                        )}
                      </div>

                      <p className="sim-trace__summary">{machine.lastTrace.summary}</p>

                      <div className="sim-trace__changes">
                        {machine.lastTrace.changes.map((change) => (
                          <span key={change} className="sim-trace__change">{change}</span>
                        ))}
                      </div>

                      {machine.lastTrace.phases.length > 0 && (
                        <div className="sim-trace__phases">
                          {machine.lastTrace.phases.map((phase, index) => (
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
                      )}
                    </div>
                  )}

                  <div className="sim-history">
                    {machine.history.map((entry, index) => (
                      <div key={`${entry.title}-${index}`} className="sim-history__item">
                        <span className="sim-history__title">{entry.title}</span>
                        <span className="sim-history__detail">{entry.detail}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="sim-note sim-note--boxed">Sin una carga válida no hay nada para ejecutar.</p>
              )}

              <p className="sim-note">
                La ejecución continua ahora corre en un <strong>Web Worker</strong>. Si alcanza demasiados pasos seguidos,
                se pausa sola para que puedas inspeccionar la máquina sin bloquear la interfaz.
              </p>
            </section>
          </div>

          <section className="sim-card">
            <div className="sim-card__head">
              <div>
                <h3 className="sim-card__title">Memoria cargada</h3>
                <p className="sim-card__desc">Código y datos comparten el mismo espacio direccionable de la máquina.</p>
              </div>
            </div>

            {machine ? (
              <div className="sim-memory-wrap">
                <table className="sim-memory">
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
                La carga falló, pero la última memoria válida sigue visible. Así puedes seguir enfocándote en la máquina mientras corriges el texto en el manager de carga.
              </p>
            )}
          </section>
        </div>

        <div className="sim-lane">
          <div className="sim-lane__label">manager de código y carga</div>

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
              Editar el texto no cambia la máquina cargada. La UI separa a propósito el <strong>manager de código</strong>
              de la <strong>máquina ya preparada</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}