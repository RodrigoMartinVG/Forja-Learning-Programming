import {
  buildDecodeTrace,
  buildExecuteTrace,
  buildFetchTrace,
  buildInstructionTrace,
  buildMicroTrace,
} from './simulator-traces'
import type { RegisterName } from './simulator-registers'

export { parseSimulatorInput } from './simulator-parser'
export { REGISTER_NAMES } from './simulator-registers'
export type { RegisterName } from './simulator-registers'

export type ParseScope = 'programa' | 'datos'
export type ParseIssue = {
  scope: ParseScope
  line: number
  message: string
}

export type MemoryRow = {
  address: number
  role: 'codigo' | 'dato'
  value: string
}

export type StepMode = 'instruction' | 'micro'
export type MachinePhase = 'idle' | 'fetch' | 'decode' | 'execute'
export type MachineStatus = 'ready' | 'halted' | 'error'

export type AddressRef =
  | { kind: 'direct'; address: number }
  | { kind: 'indirect'; register: RegisterName }

export type Operand =
  | { kind: 'immediate'; value: number }
  | { kind: 'register'; register: RegisterName }
  | { kind: 'memory'; address: number }

export type Instruction =
  | { kind: 'mov'; address: number; text: string; dest: RegisterName; source: Exclude<Operand, { kind: 'memory' }> }
  | { kind: 'load'; address: number; text: string; dest: RegisterName; sourceRef: AddressRef }
  | { kind: 'store'; address: number; text: string; source: RegisterName; targetRef: AddressRef }
  | { kind: 'add'; address: number; text: string; dest: RegisterName; operand: Operand }
  | { kind: 'sub'; address: number; text: string; dest: RegisterName; operand: Operand }
  | { kind: 'jmp'; address: number; text: string; target: number }
  | { kind: 'jnz'; address: number; text: string; register: RegisterName; target: number }
  | { kind: 'halt'; address: number; text: string }

export type MachineEvent = {
  title: string
  detail: string
}

export type MachineTraceBullet = {
  label: string
  detail: string
}

export type MachineTracePhase = {
  phase: MachinePhase
  title: string
  instructionText: string
  summary: string
  bullets: MachineTraceBullet[]
  changes: string[]
}

export type MachineTrace = {
  kind: 'load' | 'micro' | 'instruction'
  title: string
  instructionText: string
  summary: string
  phases: MachineTracePhase[]
  changes: string[]
}

export type SimulatorMachine = {
  phase: MachinePhase
  status: MachineStatus
  statusMessage: string
  executedInstructions: number
  pc: number
  ir: string
  registers: Record<RegisterName, number>
  program: Record<number, Instruction>
  programAddresses: number[]
  data: Record<number, number>
  currentInstruction: Instruction | null
  currentInstructionAddress: number | null
  history: MachineEvent[]
  lastTrace: MachineTrace | null
}

function pushHistory(machine: SimulatorMachine, title: string, detail: string): SimulatorMachine {
  return {
    ...machine,
    history: [{ title, detail }, ...machine.history].slice(0, 8),
  }
}

function withTrace(machine: SimulatorMachine, trace: MachineTrace): SimulatorMachine {
  return {
    ...machine,
    lastTrace: trace,
  }
}

function markInstructionExecuted(machine: SimulatorMachine): SimulatorMachine {
  return {
    ...machine,
    executedInstructions: machine.executedInstructions + 1,
  }
}

function getNextSequentialAddress(machine: SimulatorMachine, address: number): number | null {
  return machine.programAddresses.find((candidate) => candidate > address) ?? null
}

function withRuntimeError(machine: SimulatorMachine, message: string): SimulatorMachine {
  return pushHistory(
    {
      ...machine,
      status: 'error',
      statusMessage: message,
    },
    'error de ejecución',
    message,
  )
}

function doFetch(machine: SimulatorMachine): SimulatorMachine {
  const instruction = machine.program[machine.pc]
  if (!instruction) {
    return withRuntimeError(machine, `no hay instrucción en la dirección ${machine.pc}`)
  }

  return pushHistory(
    {
      ...machine,
      phase: 'fetch',
      ir: instruction.text,
      currentInstruction: instruction,
      currentInstructionAddress: instruction.address,
      statusMessage: `fetch desde ${machine.pc}`,
    },
    'fetch',
    `pc=${machine.pc}, ir=${instruction.text}`,
  )
}

function doDecode(machine: SimulatorMachine): SimulatorMachine {
  if (!machine.currentInstruction) {
    return withRuntimeError(machine, 'no hay instrucción cargada en IR para decodificar')
  }

  return pushHistory(
    {
      ...machine,
      phase: 'decode',
      statusMessage: `decode de ${machine.currentInstruction.text}`,
    },
    'decode',
    machine.currentInstruction.text,
  )
}

function readOperand(machine: SimulatorMachine, operand: Operand): { value: number; machine: SimulatorMachine | null } {
  switch (operand.kind) {
    case 'immediate':
      return { value: operand.value, machine: null }
    case 'register':
      return { value: machine.registers[operand.register], machine: null }
    case 'memory': {
      if (!(operand.address in machine.data)) {
        return {
          value: 0,
          machine: withRuntimeError(machine, `la dirección de datos ${operand.address} no está cargada`),
        }
      }

      return { value: machine.data[operand.address], machine: null }
    }
  }
}

function resolveAddressRef(machine: SimulatorMachine, ref: AddressRef): { address: number; source: string } {
  switch (ref.kind) {
    case 'direct':
      return { address: ref.address, source: `mem[${ref.address}]` }
    case 'indirect': {
      const resolved = machine.registers[ref.register]
      return { address: resolved, source: `mem[${ref.register}=${resolved}]` }
    }
  }
}

function doExecute(machine: SimulatorMachine): SimulatorMachine {
  const instruction = machine.currentInstruction
  if (!instruction) {
    return withRuntimeError(machine, 'no hay instrucción actual para ejecutar')
  }

  const base = { ...machine, phase: 'execute' as const }
  const currentAddress = instruction.address
  const nextAddress = getNextSequentialAddress(machine, currentAddress)

  switch (instruction.kind) {
    case 'mov': {
      const { value } = readOperand(base, instruction.source)
      return pushHistory(
        markInstructionExecuted({
          ...base,
          registers: { ...base.registers, [instruction.dest]: value },
          pc: nextAddress ?? base.pc,
          statusMessage: `${instruction.dest} <- ${value}`,
        }),
        'execute',
        `${instruction.dest} <- ${value}`,
      )
    }

    case 'load': {
      const resolved = resolveAddressRef(base, instruction.sourceRef)
      if (!(resolved.address in base.data)) {
        return withRuntimeError(base, `la dirección de datos ${resolved.address} no está cargada (${resolved.source})`)
      }

      const value = base.data[resolved.address]
      return pushHistory(
        markInstructionExecuted({
          ...base,
          registers: { ...base.registers, [instruction.dest]: value },
          pc: nextAddress ?? base.pc,
          statusMessage: `${instruction.dest} <- ${resolved.source} = ${value}`,
        }),
        'execute',
        `${instruction.dest} <- ${resolved.source} = ${value}`,
      )
    }

    case 'store': {
      const resolved = resolveAddressRef(base, instruction.targetRef)
      const value = base.registers[instruction.source]
      return pushHistory(
        markInstructionExecuted({
          ...base,
          data: { ...base.data, [resolved.address]: value },
          pc: nextAddress ?? base.pc,
          statusMessage: `${resolved.source} <- ${value}`,
        }),
        'execute',
        `${resolved.source} <- ${value}`,
      )
    }

    case 'add':
    case 'sub': {
      const resolved = readOperand(base, instruction.operand)
      if (resolved.machine) {
        return resolved.machine
      }

      const currentValue = base.registers[instruction.dest]
      const nextValue = instruction.kind === 'add'
        ? currentValue + resolved.value
        : currentValue - resolved.value

      return pushHistory(
        markInstructionExecuted({
          ...base,
          registers: { ...base.registers, [instruction.dest]: nextValue },
          pc: nextAddress ?? base.pc,
          statusMessage: `${instruction.dest} <- ${currentValue} ${instruction.kind === 'add' ? '+' : '-'} ${resolved.value} = ${nextValue}`,
        }),
        'execute',
        `${instruction.dest} <- ${nextValue}`,
      )
    }

    case 'jmp': {
      return pushHistory(
        markInstructionExecuted({
          ...base,
          pc: instruction.target,
          statusMessage: `salto incondicional a ${instruction.target}`,
        }),
        'execute',
        `pc <- ${instruction.target}`,
      )
    }

    case 'jnz': {
      const registerValue = base.registers[instruction.register]
      const target = registerValue !== 0 ? instruction.target : nextAddress
      if (target == null) {
        return withRuntimeError(base, `no hay instrucción siguiente después de ${instruction.address}`)
      }

      return pushHistory(
        markInstructionExecuted({
          ...base,
          pc: target,
          statusMessage: registerValue !== 0
            ? `${instruction.register} != 0, salto a ${instruction.target}`
            : `${instruction.register} = 0, sigue a ${target}`,
        }),
        'execute',
        registerValue !== 0
          ? `pc <- ${instruction.target}`
          : `pc <- ${target}`,
      )
    }

    case 'halt': {
      return pushHistory(
        markInstructionExecuted({
          ...base,
          status: 'halted',
          statusMessage: 'ejecución detenida por HALT',
        }),
        'execute',
        'HALT detuvo la máquina',
      )
    }
  }
}

export function stepMachine(machine: SimulatorMachine, mode: StepMode): SimulatorMachine {
  if (machine.status !== 'ready') {
    return machine
  }

  const stepMicro = (current: SimulatorMachine): { machine: SimulatorMachine; trace: MachineTracePhase } => {
    switch (current.phase) {
      case 'idle': {
        const next = doFetch(current)
        return { machine: next, trace: buildFetchTrace(current, next) }
      }
      case 'fetch': {
        const next = doDecode(current)
        return { machine: next, trace: buildDecodeTrace(current, next) }
      }
      case 'decode': {
        const next = doExecute(current)
        return { machine: next, trace: buildExecuteTrace(current, next) }
      }
      case 'execute': {
        const next = doFetch(current)
        return { machine: next, trace: buildFetchTrace(current, next) }
      }
    }
  }

  if (mode === 'micro') {
    const result = stepMicro(machine)
    return withTrace(result.machine, buildMicroTrace(result.trace))
  }

  let working = machine
  const phases: MachineTracePhase[] = []

  if (working.phase === 'idle') {
    const next = doFetch(working)
    phases.push(buildFetchTrace(working, next))
    working = next
    if (working.status !== 'ready') return working
  }

  if (working.phase === 'fetch') {
    const next = doDecode(working)
    phases.push(buildDecodeTrace(working, next))
    working = next
    if (working.status !== 'ready') return working
  }

  if (working.phase === 'decode') {
    const next = doExecute(working)
    phases.push(buildExecuteTrace(working, next))
    return withTrace(next, buildInstructionTrace(phases, next))
  }

  const fetched = doFetch(working)
  phases.push(buildFetchTrace(working, fetched))
  working = fetched
  if (working.status !== 'ready') return working
  const decoded = doDecode(working)
  phases.push(buildDecodeTrace(working, decoded))
  working = decoded
  if (working.status !== 'ready') return working
  const executed = doExecute(working)
  phases.push(buildExecuteTrace(working, executed))
  return withTrace(executed, buildInstructionTrace(phases, executed))
}

export function getMemoryRows(machine: SimulatorMachine): MemoryRow[] {
  const codeRows: MemoryRow[] = machine.programAddresses.map((address) => ({
    address,
    role: 'codigo',
    value: machine.program[address].text,
  }))

  const dataRows: MemoryRow[] = Object.keys(machine.data)
    .map(Number)
    .sort((left, right) => left - right)
    .map((address) => ({
      address,
      role: 'dato' as const,
      value: String(machine.data[address]),
    }))

  return [...codeRows, ...dataRows].sort((left, right) => left.address - right.address)
}