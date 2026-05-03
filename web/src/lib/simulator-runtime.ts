import type { SimulatorMachine, StepMode } from './simulator'

export const DEFAULT_AUTOPLAY_INTERVAL_MS = 80
export const DEFAULT_AUTOPLAY_MAX_STEPS = 1024

export const AUTOPLAY_INTERVAL_OPTIONS = [40, 80, 160, 260] as const
export const AUTOPLAY_MAX_STEP_OPTIONS = [256, 512, 1024, 2048, 4096] as const

export type SimulatorWorkerStopReason = 'halted' | 'error' | 'limit'

export type SimulatorWorkerCommand = {
  type: 'start'
  machine: SimulatorMachine
  stepMode: StepMode
  intervalMs: number
  maxSteps: number
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