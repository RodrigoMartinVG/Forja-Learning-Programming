import { REGISTER_NAMES } from './simulator-registers'
import type {
	AddressRef,
	Instruction,
	MachineTrace,
	MachineTracePhase,
	Operand,
	SimulatorMachine,
} from './simulator'

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

	for (const register of REGISTER_NAMES) {
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

export function buildLoadTrace(initialPc: number, programCount: number, dataCount: number): MachineTrace {
	return {
		kind: 'load',
		title: 'Carga inicial en memoria',
		instructionText: '--',
		summary: `La máquina quedó preparada pero todavía no empezó a ejecutar. El pc arranca en ${initialPc} y el texto editable sigue separado del estado ya cargado.`,
		phases: [],
		changes: [`pc = ${initialPc}`, 'fase = idle', `${programCount} instrucciones cargadas`, `${dataCount} datos cargados`],
	}
}

export function buildFetchTrace(before: SimulatorMachine, after: SimulatorMachine): MachineTracePhase {
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

export function buildDecodeTrace(before: SimulatorMachine, after: SimulatorMachine): MachineTracePhase {
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

export function buildExecuteTrace(before: SimulatorMachine, after: SimulatorMachine): MachineTracePhase {
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

export function buildMicroTrace(phaseTrace: MachineTracePhase): MachineTrace {
	return {
		kind: 'micro',
		title: `Microfase: ${phaseTrace.title}`,
		instructionText: phaseTrace.instructionText,
		summary: phaseTrace.summary,
		phases: [phaseTrace],
		changes: phaseTrace.changes,
	}
}

export function buildInstructionTrace(phases: MachineTracePhase[], machine: SimulatorMachine): MachineTrace {
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