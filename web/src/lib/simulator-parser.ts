import { buildLoadTrace } from './simulator-traces'
import {
	buildInitialRegisters,
	isRegisterName,
	REGISTER_PATTERN,
	REGISTER_NAMES,
} from './simulator-registers'
import type {
	AddressRef,
	Instruction,
	Operand,
	ParseIssue,
	ParseScope,
	RegisterName,
	SimulatorMachine,
} from './simulator'

const DEFAULT_REGISTER = REGISTER_NAMES[0]
const DIRECT_MEMORY_PATTERN = /^\[(\d+)\]$/
const INDIRECT_MEMORY_PATTERN = new RegExp(String.raw`^\[(${REGISTER_PATTERN})\]$`, 'i')
const MOV_PATTERN = new RegExp(String.raw`^(${REGISTER_PATTERN})\s*,\s*(${REGISTER_PATTERN}|-?\d+)$`, 'i')
const LOAD_STORE_PATTERN = new RegExp(String.raw`^(${REGISTER_PATTERN})\s*,\s*(\[(?:\d+|${REGISTER_PATTERN})\])$`, 'i')
const ADD_SUB_PATTERN = new RegExp(String.raw`^(${REGISTER_PATTERN})\s*,\s*(${REGISTER_PATTERN}|-?\d+|\[\d+\])$`, 'i')
const JNZ_PATTERN = new RegExp(String.raw`^(${REGISTER_PATTERN})\s*,\s*(\d+)$`, 'i')

function parseRegister(value: string): RegisterName | null {
	const normalized = value.toLowerCase()
	return isRegisterName(normalized) ? normalized : null
}

function parseOperand(value: string): Operand | null {
	const register = parseRegister(value)
	if (register) {
		return { kind: 'register', register }
	}

	if (/^-?\d+$/.test(value)) {
		return { kind: 'immediate', value: Number(value) }
	}

	const memoryMatch = value.match(DIRECT_MEMORY_PATTERN)
	if (memoryMatch) {
		return { kind: 'memory', address: Number(memoryMatch[1]) }
	}

	return null
}

function parseAddressRef(value: string): AddressRef | null {
	const memoryAddress = value.match(DIRECT_MEMORY_PATTERN)
	if (memoryAddress) {
		return { kind: 'direct', address: Number(memoryAddress[1]) }
	}

	const memoryRegister = value.match(INDIRECT_MEMORY_PATTERN)
	if (memoryRegister) {
		const register = parseRegister(memoryRegister[1])
		return register ? { kind: 'indirect', register } : null
	}

	return null
}

function validateInstruction(opcode: string, operands: string): string | null {
	switch (opcode) {
		case 'MOV':
				return MOV_PATTERN.test(operands)
				? null
				: 'usa `MOV rX, inmediato|registro`'
		case 'LOAD':
				return LOAD_STORE_PATTERN.test(operands)
				? null
				: 'usa `LOAD rX, [dir|rY]`'
		case 'STORE':
				return LOAD_STORE_PATTERN.test(operands)
				? null
				: 'usa `STORE rX, [dir|rY]`'
		case 'ADD':
		case 'SUB':
				return ADD_SUB_PATTERN.test(operands)
				? null
				: `usa \`${opcode} rX, inmediato|registro|[dir]\``
		case 'JMP':
			return /^(\d+)$/.test(operands)
				? null
				: 'usa `JMP dir`'
		case 'JNZ':
			return JNZ_PATTERN.test(operands)
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
			const match = operands.match(MOV_PATTERN)
			const dest = parseRegister(match?.[1] ?? DEFAULT_REGISTER) ?? DEFAULT_REGISTER
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
			const match = operands.match(LOAD_STORE_PATTERN)
			const dest = parseRegister(match?.[1] ?? DEFAULT_REGISTER) ?? DEFAULT_REGISTER
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
			const match = operands.match(LOAD_STORE_PATTERN)
			const source = parseRegister(match?.[1] ?? DEFAULT_REGISTER) ?? DEFAULT_REGISTER
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
			const match = operands.match(/^([^,]+)\s*,\s*(.+)$/i)
			const dest = parseRegister(match?.[1] ?? DEFAULT_REGISTER) ?? DEFAULT_REGISTER
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
			const match = operands.match(JNZ_PATTERN)
			const register = parseRegister(match?.[1] ?? DEFAULT_REGISTER) ?? DEFAULT_REGISTER
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
		executedInstructions: 0,
		pc: initialPc,
		ir: '--',
		registers: buildInitialRegisters(),
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