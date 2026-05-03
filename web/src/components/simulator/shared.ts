import {
	parseSimulatorInput,
	type SimulatorMachine,
} from '../../lib/simulator'

export type Preset = {
	id: string
	label: string
	note: string
	program: string
	data: string
}

const PRESETS: Preset[] = [
	{
		id: 'suma-base',
		label: 'suma base',
		note: 'Carga dos datos, los combina y deja el resultado listo para inspección.',
		program: [
			'100: LOAD r0, [40]',
			'101: ADD r0, [41]',
			'102: STORE r0, [42]',
			'103: HALT',
		].join('\n'),
		data: [
			'40: 7',
			'41: 5',
			'42: 0',
		].join('\n'),
	},
	{
		id: 'salto-condicional',
		label: 'salto condicional',
		note: 'Prepara el caso de `JNZ` y deja visible cómo cambia el pc cuando hay loop.',
		program: [
			'200: LOAD r0, [50]',
			'201: SUB r0, 1',
			'202: JNZ r0, 201',
			'203: HALT',
		].join('\n'),
		data: '50: 3',
	},
	{
		id: 'indireccion-registro',
		label: 'indirección por registro',
		note: 'Usa LOAD/STORE con [rX] para mostrar dirección efectiva calculada en runtime.',
		program: [
			'300: MOV r0, 60',
			'301: LOAD r1, [r0]',
			'302: ADD r1, 8',
			'303: MOV r0, 61',
			'304: STORE r1, [r0]',
			'305: HALT',
		].join('\n'),
		data: [
			'60: 34',
			'61: 0',
		].join('\n'),
	},
	{
		id: 'mov-y-copias',
		label: 'MOV y copias',
		note: 'Aísla MOV para mostrar carga de inmediatos y copia entre registros sin tocar memoria.',
		program: [
			'150: MOV r0, 5',
			'151: MOV r1, r0',
			'152: MOV r0, 9',
			'153: MOV r2, r0',
			'154: HALT',
		].join('\n'),
		data: '',
	},
	{
		id: 'siguiente-primo',
		label: 'siguiente primo',
		note: 'Busca el menor número primo estrictamente mayor que la entrada usando varios registros y loops anidados.',
		program: [
			'400: LOAD r0, [70]',
			'401: MOV r5, 1',
			'402: ADD r0, 1',
			'403: MOV r1, 2',
			'404: MOV r4, r0',
			'405: SUB r4, r1',
			'406: JNZ r4, 409',
			'407: STORE r0, [71]',
			'408: HALT',
			'409: MOV r2, 0',
			'410: MOV r3, 0',
			'411: ADD r2, r1',
			'412: ADD r3, 1',
			'413: MOV r4, r0',
			'414: SUB r4, r2',
			'415: JNZ r4, 417',
			'416: JNZ r5, 402',
			'417: MOV r4, r0',
			'418: SUB r4, r3',
			'419: JNZ r4, 411',
			'420: ADD r1, 1',
			'421: JNZ r5, 404',
		].join('\n'),
		data: [
			'70: 10',
			'71: 0',
		].join('\n'),
	},
]

export function resolvePresets(presets?: Array<{ slug: string; title: string; note: string; program: string; data: string }>): Preset[] {
	if (!presets || presets.length === 0) {
		return PRESETS
	}

	return presets.map((preset) => ({
		id: preset.slug,
		label: preset.title,
		note: preset.note,
		program: preset.program,
		data: preset.data,
	}))
}

export function buildInitialState(preset: Preset) {
	const result = parseSimulatorInput(preset.program, preset.data)

	return {
		presetId: preset.id,
		programText: preset.program,
		dataText: preset.data,
		machine: result.machine,
		issues: result.issues,
		lastLoaded: {
			program: preset.program,
			data: preset.data,
		},
	}
}

export function buildTimelineState(machine: SimulatorMachine | null) {
	return machine
		? { timeline: [machine], timelineIndex: 0 }
		: { timeline: [], timelineIndex: -1 }
}