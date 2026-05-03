export const REGISTER_NAMES = ['r0', 'r1', 'r2', 'r3', 'r4', 'r5'] as const

export type RegisterName = (typeof REGISTER_NAMES)[number]

export const REGISTER_PATTERN = `(?:${REGISTER_NAMES.join('|')})`

export function isRegisterName(value: string | null | undefined): value is RegisterName {
	return value != null && REGISTER_NAMES.includes(value as RegisterName)
}

export function buildInitialRegisters(): Record<RegisterName, number> {
	return Object.fromEntries(REGISTER_NAMES.map((register) => [register, 0])) as Record<RegisterName, number>
}