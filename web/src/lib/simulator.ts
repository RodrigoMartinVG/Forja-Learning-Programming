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

type RegisterName = 'r0' | 'r1'

type AddressRef =
  | { kind: 'direct'; address: number }
  | { kind: 'indirect'; register: RegisterName }

type Operand =
  | { kind: 'immediate'; value: number }
  | { kind: 'register'; register: RegisterName }
  | { kind: 'memory'; address: number }

type Instruction =
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

function uniqueChanges(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    if (!value || seen.has(value)) {
      continue
    }

    seen.add(value)
    result.push(value)
  }

  return result
}

function getInstructionText(instruction: Instruction | null, fallback = '--'): string {
  return instruction?.text ?? fallback
}

function getInstructionOpcode(instruction: Instruction): string {
  switch (instruction.kind) {
    case 'mov':
      return 'MOV'
    case 'load':
      return 'LOAD'
    case 'store':
      return 'STORE'
    case 'add':
      return 'ADD'
    case 'sub':
      return 'SUB'
    case 'jmp':
      return 'JMP'
    case 'jnz':
      return 'JNZ'
    case 'halt':
      return 'HALT'
  }
}

function describeOperandForDecode(operand: Operand): string {
  switch (operand.kind) {
    case 'immediate':
      return `inmediato ${operand.value}`
    case 'register':
      return `registro ${operand.register}`
    case 'memory':
      return `mem[${operand.address}]`
  }
}

function describeResolvedOperand(machine: SimulatorMachine, operand: Operand): string {
  switch (operand.kind) {
    case 'immediate':
      return `inmediato ${operand.value}`
    case 'register':
      return `${operand.register} = ${machine.registers[operand.register]}`
    case 'memory':
      return operand.address in machine.data
        ? `mem[${operand.address}] = ${machine.data[operand.address]}`
        : `mem[${operand.address}] sin cargar`
  }
}

function formatAddressRef(ref: AddressRef): string {
  switch (ref.kind) {
    case 'direct':
      return `[${ref.address}]`
    case 'indirect':
      return `[${ref.register}]`
  }
}

function describeAddressRefForDecode(ref: AddressRef): string {
  switch (ref.kind) {
    case 'direct':
      return `mem[${ref.address}] (directa)`
    case 'indirect':
      return `mem[${ref.register}] (indirecta)`
  }
}

function describeInstructionOperands(instruction: Instruction): string {
  switch (instruction.kind) {
    case 'mov':
      return `destino ${instruction.dest}; origen ${describeOperandForDecode(instruction.source)}`
    case 'load':
      return `destino ${instruction.dest}; fuente ${describeAddressRefForDecode(instruction.sourceRef)}`
    case 'store':
      return `fuente ${instruction.source}; destino ${describeAddressRefForDecode(instruction.targetRef)}`
    case 'add':
    case 'sub':
      return `acumulador ${instruction.dest}; operando ${describeOperandForDecode(instruction.operand)}`
    case 'jmp':
      return `salto directo a ${instruction.target}`
    case 'jnz':
      return `si ${instruction.register} != 0, salto a ${instruction.target}`
    case 'halt':
      return 'sin operandos; detiene la máquina'
  }
}

function collectStateChanges(before: SimulatorMachine, after: SimulatorMachine): string[] {
  const changes: string[] = []

  if (before.phase !== after.phase) {
    changes.push(`fase = ${after.phase}`)
  }

  if (before.ir !== after.ir) {
    changes.push(`ir = ${after.ir}`)
  }

  if (before.pc !== after.pc) {
    changes.push(`pc = ${after.pc}`)
  }

  for (const register of ['r0', 'r1'] as const) {
    if (before.registers[register] !== after.registers[register]) {
      changes.push(`${register} = ${after.registers[register]}`)
    }
  }

  const dataAddresses = [...new Set([...Object.keys(before.data), ...Object.keys(after.data)].map(Number))]
    .sort((left, right) => left - right)

  for (const address of dataAddresses) {
    if (before.data[address] !== after.data[address]) {
      changes.push(`mem[${address}] = ${after.data[address]}`)
    }
  }

  if (before.status !== after.status) {
    changes.push(`estado = ${after.status}`)
  }

  return changes.length > 0 ? changes : ['sin cambios visibles todavía']
}

function buildLoadTrace(initialPc: number, programCount: number, dataCount: number): MachineTrace {
  return {
    kind: 'load',
    title: 'Carga inicial en memoria',
    instructionText: '--',
    summary: `La máquina quedó preparada pero todavía no empezó a ejecutar. El pc arranca en ${initialPc} y el texto editable sigue separado del estado ya cargado.`,
    phases: [],
    changes: [`pc = ${initialPc}`, 'fase = idle', `${programCount} instrucciones cargadas`, `${dataCount} datos cargados`],
  }
}

function buildFetchTrace(before: SimulatorMachine, after: SimulatorMachine): MachineTracePhase {
  if (after.status === 'error' || !after.currentInstruction) {
    return {
      phase: 'fetch',
      title: 'fetch',
      instructionText: '--',
      summary: `La CPU intentó buscar código en pc=${before.pc}, pero no encontró una instrucción válida para cargar en IR.`,
      bullets: [
        { label: 'busca', detail: `mem[${before.pc}]` },
        { label: 'fallo', detail: after.statusMessage },
        { label: 'consecuencia', detail: 'la máquina entra en error y ya no puede seguir sin reset' },
      ],
      changes: collectStateChanges(before, after),
    }
  }

  const instructionText = getInstructionText(after.currentInstruction)

  return {
    phase: 'fetch',
    title: 'fetch',
    instructionText,
    summary: `La CPU mira la dirección indicada por el pc, lee ${instructionText} desde memoria y la copia al IR.`,
    bullets: [
      { label: 'lee memoria', detail: `mem[${before.pc}] = ${instructionText}` },
      { label: 'escribe ir', detail: `ir = ${instructionText}` },
      { label: 'flujo', detail: `el pc todavía sigue en ${before.pc}; la decisión de avance viene después` },
    ],
    changes: collectStateChanges(before, after),
  }
}

function buildDecodeTrace(before: SimulatorMachine, after: SimulatorMachine): MachineTracePhase {
  const instruction = before.currentInstruction ?? after.currentInstruction

  if (!instruction || after.status === 'error') {
    return {
      phase: 'decode',
      title: 'decode',
      instructionText: '--',
      summary: `La CPU intentó interpretar el IR, pero no tenía una instrucción válida disponible.`,
      bullets: [
        { label: 'ir', detail: before.ir },
        { label: 'fallo', detail: after.statusMessage },
      ],
      changes: collectStateChanges(before, after),
    }
  }

  return {
    phase: 'decode',
    title: 'decode',
    instructionText: instruction.text,
    summary: `La CPU interpreta ${instruction.text} y decide qué operandos tendrá que leer o escribir en execute.`,
    bullets: [
      { label: 'opcode', detail: getInstructionOpcode(instruction) },
      { label: 'operandos', detail: describeInstructionOperands(instruction) },
      { label: 'nota', detail: 'decode no cambia registros ni memoria; solo prepara la acción siguiente' },
    ],
    changes: collectStateChanges(before, after),
  }
}

function buildExecuteTrace(before: SimulatorMachine, after: SimulatorMachine): MachineTracePhase {
  const instruction = before.currentInstruction ?? after.currentInstruction
  const instructionText = getInstructionText(instruction)

  if (!instruction) {
    return {
      phase: 'execute',
      title: 'execute',
      instructionText: '--',
      summary: 'La CPU intentó ejecutar, pero no había una instrucción lista en IR.',
      bullets: [
        { label: 'ir', detail: before.ir },
        { label: 'fallo', detail: after.statusMessage },
      ],
      changes: collectStateChanges(before, after),
    }
  }

  if (after.status === 'error') {
    return {
      phase: 'execute',
      title: 'execute',
      instructionText,
      summary: `La CPU entró en execute para ${instructionText}, pero la operación falló antes de completar el cambio de estado.`,
      bullets: [
        { label: 'instrucción', detail: instructionText },
        { label: 'fallo', detail: after.statusMessage },
        { label: 'consecuencia', detail: 'la máquina queda detenida por error hasta hacer reset' },
      ],
      changes: collectStateChanges(before, after),
    }
  }

  switch (instruction.kind) {
    case 'mov': {
      return {
        phase: 'execute',
        title: 'execute',
        instructionText,
        summary: `La CPU resuelve el origen ${describeResolvedOperand(before, instruction.source)} y copia ese valor dentro de ${instruction.dest}.`,
        bullets: [
          { label: 'lee', detail: describeResolvedOperand(before, instruction.source) },
          { label: 'escribe', detail: `${instruction.dest} = ${after.registers[instruction.dest]}` },
          { label: 'flujo', detail: `al terminar, el pc pasa a ${after.pc}` },
        ],
        changes: collectStateChanges(before, after),
      }
    }

    case 'load': {
      const resolved = resolveAddressRef(before, instruction.sourceRef)
      return {
        phase: 'execute',
        title: 'execute',
        instructionText,
        summary: `La CPU resuelve ${formatAddressRef(instruction.sourceRef)} como ${resolved.source}, lee ${resolved.source} = ${before.data[resolved.address]} y copia ese dato a ${instruction.dest}.`,
        bullets: [
          { label: 'dirección efectiva', detail: `${formatAddressRef(instruction.sourceRef)} -> ${resolved.source}` },
          { label: 'lee memoria', detail: `${resolved.source} = ${before.data[resolved.address]}` },
          { label: 'escribe registro', detail: `${instruction.dest} = ${after.registers[instruction.dest]}` },
          { label: 'flujo', detail: `al terminar, el pc pasa a ${after.pc}` },
        ],
        changes: collectStateChanges(before, after),
      }
    }

    case 'store': {
      const resolved = resolveAddressRef(before, instruction.targetRef)
      return {
        phase: 'execute',
        title: 'execute',
        instructionText,
        summary: `La CPU toma ${instruction.source} = ${before.registers[instruction.source]}, resuelve ${formatAddressRef(instruction.targetRef)} como ${resolved.source} y escribe allí el valor.`,
        bullets: [
          { label: 'lee registro', detail: `${instruction.source} = ${before.registers[instruction.source]}` },
          { label: 'dirección efectiva', detail: `${formatAddressRef(instruction.targetRef)} -> ${resolved.source}` },
          { label: 'escribe memoria', detail: `${resolved.source} = ${after.data[resolved.address]}` },
          { label: 'flujo', detail: `al terminar, el pc pasa a ${after.pc}` },
        ],
        changes: collectStateChanges(before, after),
      }
    }

    case 'add':
    case 'sub': {
      return {
        phase: 'execute',
        title: 'execute',
        instructionText,
        summary: `La CPU toma ${instruction.dest} = ${before.registers[instruction.dest]}, aplica ${instruction.kind === 'add' ? 'la suma' : 'la resta'} con ${describeResolvedOperand(before, instruction.operand)} y guarda ${after.registers[instruction.dest]} en el mismo registro.`,
        bullets: [
          { label: 'lee acumulador', detail: `${instruction.dest} = ${before.registers[instruction.dest]}` },
          { label: 'lee operando', detail: describeResolvedOperand(before, instruction.operand) },
          { label: 'escribe resultado', detail: `${instruction.dest} = ${after.registers[instruction.dest]}` },
          { label: 'flujo', detail: `al terminar, el pc pasa a ${after.pc}` },
        ],
        changes: collectStateChanges(before, after),
      }
    }

    case 'jmp': {
      return {
        phase: 'execute',
        title: 'execute',
        instructionText,
        summary: `La CPU cambia el flujo sin usar la dirección siguiente: el pc salta directo a ${instruction.target}.`,
        bullets: [
          { label: 'decisión de flujo', detail: `pc = ${after.pc}` },
          { label: 'registros', detail: 'no cambia registros ni datos' },
          { label: 'lectura', detail: 'el único dato relevante era el destino del salto' },
        ],
        changes: collectStateChanges(before, after),
      }
    }

    case 'jnz': {
      const registerValue = before.registers[instruction.register]
      const jumpTaken = after.pc === instruction.target

      return {
        phase: 'execute',
        title: 'execute',
        instructionText,
        summary: jumpTaken
          ? `Como ${instruction.register} vale ${registerValue}, la condición se cumple y el salto lleva el pc a ${after.pc}.`
          : `Como ${instruction.register} vale ${registerValue}, la condición falla y el flujo sigue por la dirección ${after.pc}.`,
        bullets: [
          { label: 'lee condición', detail: `${instruction.register} = ${registerValue}` },
          { label: 'decisión', detail: jumpTaken ? `salta a ${instruction.target}` : `no salta; sigue a ${after.pc}` },
          { label: 'registros', detail: 'no cambia datos ni registros; solo decide el flujo' },
        ],
        changes: collectStateChanges(before, after),
      }
    }

    case 'halt': {
      return {
        phase: 'execute',
        title: 'execute',
        instructionText,
        summary: 'La CPU procesa HALT y deja la máquina detenida. No habrá otra instrucción hasta que hagas reset.',
        bullets: [
          { label: 'control', detail: 'HALT corta la ejecución continua y también el stepping posterior' },
          { label: 'estado', detail: 'la máquina pasa a halted' },
          { label: 'registros', detail: 'no modifica memoria ni registros en este paso' },
        ],
        changes: collectStateChanges(before, after),
      }
    }
  }
}

function buildMicroTrace(phaseTrace: MachineTracePhase): MachineTrace {
  return {
    kind: 'micro',
    title: `Microfase: ${phaseTrace.title}`,
    instructionText: phaseTrace.instructionText,
    summary: phaseTrace.summary,
    phases: [phaseTrace],
    changes: phaseTrace.changes,
  }
}

function buildInstructionTrace(phases: MachineTracePhase[], machine: SimulatorMachine): MachineTrace {
  let focusPhase: MachineTracePhase | null = null
  for (let index = phases.length - 1; index >= 0; index -= 1) {
    if (phases[index].phase === 'execute') {
      focusPhase = phases[index]
      break
    }
  }

  focusPhase ??= phases[phases.length - 1] ?? null

  const instructionText = focusPhase?.instructionText ?? '--'
  const changes = uniqueChanges(phases.flatMap((phase) => phase.changes))

  return {
    kind: 'instruction',
    title: machine.status === 'error'
      ? `Ciclo interrumpido: ${instructionText}`
      : `Ciclo completo: ${instructionText}`,
    instructionText,
    summary: focusPhase?.summary ?? machine.statusMessage,
    phases,
    changes,
  }
}

function parseRegister(value: string): RegisterName | null {
  const normalized = value.toLowerCase()
  return normalized === 'r0' || normalized === 'r1' ? normalized : null
}

function parseOperand(value: string): Operand | null {
  const register = parseRegister(value)
  if (register) {
    return { kind: 'register', register }
  }

  if (/^-?\d+$/.test(value)) {
    return { kind: 'immediate', value: Number(value) }
  }

  const memoryMatch = value.match(/^\[(\d+)\]$/)
  if (memoryMatch) {
    return { kind: 'memory', address: Number(memoryMatch[1]) }
  }

  return null
}

function parseAddressRef(value: string): AddressRef | null {
  const memoryAddress = value.match(/^\[(\d+)\]$/)
  if (memoryAddress) {
    return { kind: 'direct', address: Number(memoryAddress[1]) }
  }

  const memoryRegister = value.match(/^\[(r[01])\]$/i)
  if (memoryRegister) {
    const register = parseRegister(memoryRegister[1])
    return register ? { kind: 'indirect', register } : null
  }

  return null
}

function validateInstruction(opcode: string, operands: string): string | null {
  switch (opcode) {
    case 'MOV':
      return /^(r[01])\s*,\s*(r[01]|-?\d+)$/i.test(operands)
        ? null
        : 'usa `MOV rX, inmediato|registro`'
    case 'LOAD':
      return /^(r[01])\s*,\s*\[(\d+|r[01])\]$/i.test(operands)
        ? null
        : 'usa `LOAD rX, [dir|rY]`'
    case 'STORE':
      return /^(r[01])\s*,\s*\[(\d+|r[01])\]$/i.test(operands)
        ? null
        : 'usa `STORE rX, [dir|rY]`'
    case 'ADD':
    case 'SUB':
      return /^(r[01])\s*,\s*(r[01]|-?\d+|\[\d+\])$/i.test(operands)
        ? null
        : `usa \`${opcode} rX, inmediato|registro|[dir]\``
    case 'JMP':
      return /^(\d+)$/.test(operands)
        ? null
        : 'usa `JMP dir`'
    case 'JNZ':
      return /^(r[01])\s*,\s*(\d+)$/i.test(operands)
        ? null
        : 'usa `JNZ rX, dir`'
    case 'HALT':
      return operands.trim() === ''
        ? null
        : '`HALT` no lleva operandos'
    default:
      return 'opcode no soportado en L1'
  }
}

function parseInstruction(address: number, opcode: string, operands: string): Instruction {
  const normalizedOpcode = opcode.toUpperCase()

  switch (normalizedOpcode) {
    case 'MOV': {
      const match = operands.match(/^(r[01])\s*,\s*(r[01]|-?\d+)$/i)
      const dest = parseRegister(match?.[1] ?? 'r0') ?? 'r0'
      const sourceText = match?.[2] ?? '0'
      const source = parseOperand(sourceText)
      return {
        kind: 'mov',
        address,
        text: `MOV ${dest}, ${sourceText}`,
        dest,
        source: source && source.kind !== 'memory' ? source : { kind: 'immediate', value: 0 },
      }
    }

    case 'LOAD': {
      const match = operands.match(/^(r[01])\s*,\s*(\[(?:\d+|r[01])\])$/i)
      const dest = parseRegister(match?.[1] ?? 'r0') ?? 'r0'
      const sourceToken = (match?.[2] ?? '[0]').toLowerCase()
      const sourceRef = parseAddressRef(sourceToken) ?? { kind: 'direct' as const, address: 0 }
      return {
        kind: 'load',
        address,
        text: `LOAD ${dest}, ${sourceToken}`,
        dest,
        sourceRef,
      }
    }

    case 'STORE': {
      const match = operands.match(/^(r[01])\s*,\s*(\[(?:\d+|r[01])\])$/i)
      const source = parseRegister(match?.[1] ?? 'r0') ?? 'r0'
      const targetToken = (match?.[2] ?? '[0]').toLowerCase()
      const targetRef = parseAddressRef(targetToken) ?? { kind: 'direct' as const, address: 0 }
      return {
        kind: 'store',
        address,
        text: `STORE ${source}, ${targetToken}`,
        source,
        targetRef,
      }
    }

    case 'ADD':
    case 'SUB': {
      const match = operands.match(/^(r[01])\s*,\s*(.+)$/i)
      const dest = parseRegister(match?.[1] ?? 'r0') ?? 'r0'
      const operandText = (match?.[2] ?? '0').trim()
      const operand = parseOperand(operandText) ?? { kind: 'immediate' as const, value: 0 }

      return {
        kind: normalizedOpcode === 'ADD' ? 'add' : 'sub',
        address,
        text: `${normalizedOpcode} ${dest}, ${operandText}`,
        dest,
        operand,
      }
    }

    case 'JMP': {
      const target = Number(operands)
      return {
        kind: 'jmp',
        address,
        text: `JMP ${target}`,
        target,
      }
    }

    case 'JNZ': {
      const match = operands.match(/^(r[01])\s*,\s*(\d+)$/i)
      const register = parseRegister(match?.[1] ?? 'r0') ?? 'r0'
      const target = Number(match?.[2] ?? '0')
      return {
        kind: 'jnz',
        address,
        text: `JNZ ${register}, ${target}`,
        register,
        target,
      }
    }

    default:
      return {
        kind: 'halt',
        address,
        text: 'HALT',
      }
  }
}

export function parseSimulatorInput(programText: string, dataText: string): {
  issues: ParseIssue[]
  machine: SimulatorMachine | null
} {
  const issues: ParseIssue[] = []
  const seenAddresses = new Map<number, { scope: ParseScope; line: number }>()
  const program: Record<number, Instruction> = {}
  const data: Record<number, number> = {}

  const claimAddress = (address: number, scope: ParseScope, line: number) => {
    const seen = seenAddresses.get(address)
    if (seen) {
      issues.push({
        scope,
        line,
        message: `la dirección ${address} ya fue usada en ${seen.scope} (línea ${seen.line})`,
      })
      return false
    }

    seenAddresses.set(address, { scope, line })
    return true
  }

  const programLines = programText.split(/\r?\n/)
  for (const [index, rawLine] of programLines.entries()) {
    const line = rawLine.trim()
    if (!line) continue

    const match = line.match(/^(\d+)\s*:\s*([A-Za-z]+)(?:\s+(.*))?$/)
    if (!match) {
      issues.push({ scope: 'programa', line: index + 1, message: 'formato esperado: `direccion: INSTRUCCION`' })
      continue
    }

    const address = Number(match[1])
    const opcode = match[2].toUpperCase()
    const operands = (match[3] ?? '').trim()
    const validation = validateInstruction(opcode, operands)
    if (validation) {
      issues.push({ scope: 'programa', line: index + 1, message: validation })
      continue
    }

    if (!claimAddress(address, 'programa', index + 1)) {
      continue
    }

    program[address] = parseInstruction(address, opcode, operands)
  }

  const dataLines = dataText.split(/\r?\n/)
  for (const [index, rawLine] of dataLines.entries()) {
    const line = rawLine.trim()
    if (!line) continue

    const match = line.match(/^(\d+)\s*:\s*(-?\d+)$/)
    if (!match) {
      issues.push({ scope: 'datos', line: index + 1, message: 'formato esperado: `direccion: entero`' })
      continue
    }

    const address = Number(match[1])
    if (!claimAddress(address, 'datos', index + 1)) {
      continue
    }

    data[address] = Number(match[2])
  }

  const programAddresses = Object.keys(program).map(Number).sort((left, right) => left - right)
  if (programAddresses.length === 0) {
    issues.push({ scope: 'programa', line: 1, message: 'el programa debe tener al menos una instrucción' })
  }

  if (issues.length > 0) {
    return { issues, machine: null }
  }

  const initialPc = programAddresses[0]
  const machine: SimulatorMachine = {
    phase: 'idle',
    status: 'ready',
    statusMessage: 'lista para iniciar fetch',
    pc: initialPc,
    ir: '--',
    registers: { r0: 0, r1: 0 },
    program,
    programAddresses,
    data,
    currentInstruction: null,
    currentInstructionAddress: null,
    history: [
      {
        title: 'memoria cargada',
        detail: `pc inicial = ${initialPc}; ${programAddresses.length} instrucciones y ${Object.keys(data).length} celdas de datos`,
      },
    ],
    lastTrace: buildLoadTrace(initialPc, programAddresses.length, Object.keys(data).length),
  }

  return { issues: [], machine }
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
        {
          ...base,
          registers: { ...base.registers, [instruction.dest]: value },
          pc: nextAddress ?? base.pc,
          statusMessage: `${instruction.dest} <- ${value}`,
        },
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
        {
          ...base,
          registers: { ...base.registers, [instruction.dest]: value },
          pc: nextAddress ?? base.pc,
          statusMessage: `${instruction.dest} <- ${resolved.source} = ${value}`,
        },
        'execute',
        `${instruction.dest} <- ${resolved.source} = ${value}`,
      )
    }

    case 'store': {
      const resolved = resolveAddressRef(base, instruction.targetRef)
      const value = base.registers[instruction.source]
      return pushHistory(
        {
          ...base,
          data: { ...base.data, [resolved.address]: value },
          pc: nextAddress ?? base.pc,
          statusMessage: `${resolved.source} <- ${value}`,
        },
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
        {
          ...base,
          registers: { ...base.registers, [instruction.dest]: nextValue },
          pc: nextAddress ?? base.pc,
          statusMessage: `${instruction.dest} <- ${currentValue} ${instruction.kind === 'add' ? '+' : '-'} ${resolved.value} = ${nextValue}`,
        },
        'execute',
        `${instruction.dest} <- ${nextValue}`,
      )
    }

    case 'jmp': {
      return pushHistory(
        {
          ...base,
          pc: instruction.target,
          statusMessage: `salto incondicional a ${instruction.target}`,
        },
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
        {
          ...base,
          pc: target,
          statusMessage: registerValue !== 0
            ? `${instruction.register} != 0, salto a ${instruction.target}`
            : `${instruction.register} = 0, sigue a ${target}`,
        },
        'execute',
        registerValue !== 0
          ? `pc <- ${instruction.target}`
          : `pc <- ${target}`,
      )
    }

    case 'halt': {
      return pushHistory(
        {
          ...base,
          status: 'halted',
          statusMessage: 'ejecución detenida por HALT',
        },
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