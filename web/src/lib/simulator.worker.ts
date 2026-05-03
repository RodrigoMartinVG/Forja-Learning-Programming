import { stepMachine, type SimulatorMachine } from './simulator'
import {
  DEFAULT_AUTOPLAY_INTERVAL_MS,
  DEFAULT_AUTOPLAY_MAX_STEPS,
  type SimulatorWorkerCommand,
  type SimulatorWorkerEvent,
  type SimulatorWorkerStopReason,
} from './simulator-runtime'

let currentMachine: SimulatorMachine | null = null
let timerId: ReturnType<typeof setInterval> | null = null
let autoplayStepCount = 0
let currentMode: SimulatorWorkerCommand['stepMode'] = 'instruction'
let currentIntervalMs = DEFAULT_AUTOPLAY_INTERVAL_MS
let currentMaxSteps = DEFAULT_AUTOPLAY_MAX_STEPS

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

  if (autoplayStepCount >= currentMaxSteps) {
    currentMachine = pushRuntimeHistory(
      {
        ...currentMachine,
        statusMessage: `pausa automática tras ${currentMaxSteps} pasos; podés inspeccionar el estado o reanudar`,
      },
      'pausa automática',
      `se alcanzó el límite de seguridad de ${currentMaxSteps} pasos continuos`,
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
  currentIntervalMs = message.intervalMs > 0 ? message.intervalMs : DEFAULT_AUTOPLAY_INTERVAL_MS
  currentMaxSteps = message.maxSteps > 0 ? message.maxSteps : DEFAULT_AUTOPLAY_MAX_STEPS
  autoplayStepCount = 0

  if (!runAutoplayStep()) {
    return
  }

  timerId = setInterval(() => {
    runAutoplayStep()
  }, currentIntervalMs)
}