import type { SimulatorMachine, StepMode } from './simulator'

export type SimulatorWorkerStopReason = 'halted' | 'error' | 'limit'

export type SimulatorWorkerCommand = {
  type: 'start'
  machine: SimulatorMachine
  stepMode: StepMode
}

export type SimulatorWorkerEvent =
  | {
      type: 'tick'
      machine: SimulatorMachine
    }
  | {
      type: 'stopped'
      machine: SimulatorMachine
      reason: SimulatorWorkerStopReason
    }