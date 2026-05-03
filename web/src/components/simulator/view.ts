import { isRegisterName } from '../../lib/simulator-registers'
import type { MachineTrace, SimulatorMachine } from '../../lib/simulator'

export const PHASE_LABELS: Record<SimulatorMachine['phase'], string> = {
	idle: 'idle',
	fetch: 'fetch',
	decode: 'decode',
	execute: 'execute',
}

export const STATUS_LABELS: Record<SimulatorMachine['status'], string> = {
	ready: 'lista',
	halted: 'detenida',
	error: 'error',
}

export function isAutoplayPaused(machine: SimulatorMachine | null): boolean {
	return machine?.status === 'ready' && machine.statusMessage.startsWith('pausa automática')
}

export function getStatusChipClass(machine: SimulatorMachine | null, isRunning: boolean): string {
	if (isRunning) {
		return 'sim-chip sim-chip--running'
	}

	if (!machine) {
		return 'sim-chip'
	}

	if (isAutoplayPaused(machine)) {
		return 'sim-chip sim-chip--paused'
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

export function getSnapshotEyebrow(snapshot: SimulatorMachine, index: number): string {
	const trace = snapshot.lastTrace

	if (!trace || trace.kind === 'load') {
		return index === 0 ? 'carga' : `estado ${index}`
	}

	return trace.kind === 'micro' ? `micro ${index}` : `step ${index}`
}

export function getSnapshotTitle(snapshot: SimulatorMachine, index: number): string {
	const trace = snapshot.lastTrace

	if (!trace) {
		return `estado ${index}`
	}

	if (trace.kind === 'load') {
		return 'memoria lista'
	}

	if (trace.kind === 'micro') {
		return trace.phases[0]?.phase ?? 'micro'
	}

	return trace.instructionText !== '--' ? trace.instructionText : trace.title
}

export function getSnapshotMeta(snapshot: SimulatorMachine): string {
	return `instr ${snapshot.executedInstructions} · pc ${snapshot.pc} · ${snapshot.phase}`
}

type InstructionSignature = { opcode: string; operands: string[]; symbolic: string }

export function parseInstructionSignature(instructionText: string | null): InstructionSignature {
	if (!instructionText || instructionText === '--') {
		return { opcode: '--', operands: [], symbolic: '--' }
	}

	const normalized = instructionText.trim()
	const [opcodeRaw, ...rest] = normalized.split(/\s+/)
	const opcode = opcodeRaw ? opcodeRaw.toUpperCase() : '--'
	const operandsText = rest.join(' ').trim()
	const operands = operandsText
		? operandsText.split(',').map((value) => value.trim()).filter(Boolean)
		: []

	return {
		opcode,
		operands,
		symbolic: operands.length > 0 ? `${opcode}(${operands.join(', ')})` : opcode,
	}
}

export function buildConcretePcUpdate(machine: SimulatorMachine, signature: InstructionSignature): string {
	if (signature.opcode === '--') return '--'
	const [a0, a1] = signature.operands
	const base = machine.currentInstructionAddress ?? machine.pc
	switch (signature.opcode) {
		case 'JMP':
			return `pc <- ${a0 ?? '?'}`
		case 'JNZ': {
			const regKey = a0?.toLowerCase()
			const regVal = isRegisterName(regKey) ? machine.registers[regKey] : undefined
			if (regVal !== undefined) {
				return regVal !== 0 ? `pc <- ${a1}` : `pc <- ${base + 1}`
			}
			return `pc <- ${a1} (cond)`
		}
		case 'HALT':
			return 'halt'
		default:
			return `pc <- ${base + 1}`
	}
}

export function buildExecuteSymbol(signature: InstructionSignature): string {
	if (signature.opcode === '--') {
		return '--'
	}
	return signature.operands.length > 0
		? `exec.${signature.opcode}(${signature.operands.join(', ')})`
		: `exec.${signature.opcode}()`
}

export function buildFetchLines(machine: SimulatorMachine | null, instructionText: string | null): string[] {
	if (!machine) {
		return ['mem[pc]', '-> --', 'ir <- --']
	}

	const fetched = instructionText && instructionText !== '--'
		? instructionText
		: (machine.ir || '--')

	return [`mem[${machine.pc}]`, `-> ${fetched}`, `ir <- ${fetched}`]
}

export function buildDecodeLines(signature: InstructionSignature): string[] {
	if (signature.opcode === '--') {
		return ['op = --']
	}

	const lines = [`op = ${signature.opcode}`]
	signature.operands.forEach((operand, index) => {
		lines.push(`a${index} = ${operand}`)
	})

	return lines.slice(0, 3)
}

function buildExecuteEffectLines(signature: InstructionSignature): string[] {
	const [a0, a1] = signature.operands

	switch (signature.opcode) {
		case 'MOV':
			return a0 && a1 ? [`${a0} <- ${a1}`] : []
		case 'LOAD':
			return a0 && a1 ? [`${a0} <- mem${a1.replace(/^\[(.*)\]$/, '[$1]')}`] : []
		case 'STORE':
			return a0 && a1 ? [`mem${a1.replace(/^\[(.*)\]$/, '[$1]')} <- ${a0}`] : []
		case 'ADD':
			return a0 && a1 ? [`${a0} <- ${a0} + ${a1}`] : []
		case 'SUB':
			return a0 && a1 ? [`${a0} <- ${a0} - ${a1}`] : []
		case 'JMP':
			return a0 ? [`branch -> ${a0}`] : []
		case 'JNZ':
			return a0 && a1 ? [`if ${a0} != 0 -> ${a1}`] : []
		case 'HALT':
			return ['stop clock']
		default:
			return []
	}
}

export function buildExecuteLines(signature: InstructionSignature, pcUpdate: string | null = null): string[] {
	if (signature.opcode === '--') {
		return ['--']
	}

	return [buildExecuteSymbol(signature), ...buildExecuteEffectLines(signature), ...(pcUpdate ? [pcUpdate] : [])].slice(0, 3)
}

export function normalizePhaseLines(lines: string[] | null, rows = 3): Array<{ text: string; pending: boolean; empty: boolean }> {
	if (!lines) {
		return Array.from({ length: rows }, (_, index) => ({
			text: index === 0 ? '—' : '',
			pending: index === 0,
			empty: index !== 0,
		}))
	}

	const trimmed = lines.slice(0, rows)
	while (trimmed.length < rows) {
		trimmed.push('')
	}

	return trimmed.map((text) => ({ text, pending: false, empty: text === '' }))
}

export function getExplanationSummary(machine: SimulatorMachine | null, activeTrace: MachineTrace | null): string {
	return activeTrace?.summary
		?? machine?.statusMessage
		?? 'Cargá un programa válido para inicializar la máquina.'
}