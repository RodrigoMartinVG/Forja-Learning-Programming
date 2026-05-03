import { stepMachine, type SimulatorMachine } from './simulator'
import type { SimulatorWorkerCommand, SimulatorWorkerEvent, SimulatorWorkerStopReason } from './simulator-runtime'

const AUTOPLAY_INTERVAL_MS = 260
const AUTOPLAY_MAX_STEPS = 256

let currentMachine: SimulatorMachine | null = null
let timerId: ReturnType<typeof setInterval> | null = null
let autoplayStepCount = 0
let currentMode: SimulatorWorkerCommand['stepMode'] = 'instruction'

const workerScope = self as unknown as {
  postMessage: (message: SimulatorWorkerEvent) => void
  onmessage: ((event: MessageEvent<SimulatorWorkerCommand>) => void) | null
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
}

function emit(message: SimulatorWorkerEvent) {
  workerScope.postMessage(message)
}

function pushRuntimeHistory(machine: SimulatorMachine, title: string, detail: string): SimulatorMachine {
  return {
    ...machine,
    history: [{ title, detail }, ...machine.history].slice(0, 8),
  }
}

function stopWith(reason: SimulatorWorkerStopReason) {
  stopTimer()

  if (!currentMachine) {
    return
  }

  emit({
    type: 'stopped',
    machine: currentMachine,
    reason,
  })
}

function runAutoplayStep(): boolean {
  if (!currentMachine || currentMachine.status !== 'ready') {
    stopWith('error')
    return false
  }

  currentMachine = stepMachine(currentMachine, currentMode)
  autoplayStepCount += 1
  emit({ type: 'tick', machine: currentMachine })

  if (currentMachine.status === 'halted') {
    stopWith('halted')
    return false
  }

  if (currentMachine.status === 'error') {
    stopWith('error')
    return false
  }

  if (autoplayStepCount >= AUTOPLAY_MAX_STEPS) {
    currentMachine = pushRuntimeHistory(
      {
        ...currentMachine,
        statusMessage: `pausa automática tras ${AUTOPLAY_MAX_STEPS} pasos; podés inspeccionar el estado o reanudar`,
      },
      'pausa automática',
      `se alcanzó el límite de seguridad de ${AUTOPLAY_MAX_STEPS} pasos continuos`,
    )

    stopWith('limit')
    return false
  }

  return true
}

workerScope.onmessage = (event) => {
  const message = event.data
  if (message.type !== 'start') {
    return
  }

  stopTimer()
  currentMachine = message.machine
  currentMode = message.stepMode
  autoplayStepCount = 0

  if (!runAutoplayStep()) {
    return
  }

  timerId = setInterval(() => {
    runAutoplayStep()
  }, AUTOPLAY_INTERVAL_MS)
}