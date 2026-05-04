export type Endianness = 'little' | 'big'
export type SelectionLength = 1 | 2 | 4 | 8
export type NumericNotation = 'decimal' | 'hex' | 'binary'
export type ArithmeticMode = 'unsigned' | 'signed'

export type ReadInterpretation =
  | 'u8'
  | 'u16'
  | 'u32'
  | 'u64'
  | 'i8'
  | 'i16'
  | 'i32'
  | 'i64'
  | 'float32'
  | 'float64'
  | 'raw-bytes'
  | 'ascii-simple'

export type LogicalInterpretation =
  | 'u8'
  | 'u16'
  | 'u32'
  | 'u64'
  | 'i8'
  | 'i16'
  | 'i32'
  | 'i64'

export type LabHistoryKind = 'material-write' | 'reinterpretation' | 'arithmetic' | 'preset' | 'memory'

export type LabHistoryEntry = {
  kind: LabHistoryKind
  title: string
  detail: string
}

export type SelectionState = {
  startAddress: number
  lengthBytes: SelectionLength
}

export type ReadViewState = {
  interpretation: ReadInterpretation
  endianness: Endianness
}

export type LogicalEditorState = {
  interpretation: LogicalInterpretation
  notation: NumericNotation
  valueInput: string
  arithmeticMode: ArithmeticMode
  operandNotation: NumericNotation
  operandInput: string
}

export type MemoryEditorState = {
  bytePatchAddress: number
  bytePatchValue: string
  asciiPatchAddress: number
  asciiPatchText: string
}

export type LabState = {
  memory: number[]
  memorySize: number
  selection: SelectionState
  readView: ReadViewState
  logicalEditor: LogicalEditorState
  memoryEditor: MemoryEditorState
  activePresetId: string | null
  history: LabHistoryEntry[]
}

export type LabPreset = {
  id: string
  title: string
  note: string
  memorySize: number
  memory: number[]
  selection: SelectionState
  readView: ReadViewState
  logicalEditor?: Partial<LogicalEditorState>
}

export type HexdumpCell = {
  address: number
  value: number
  isSelected: boolean
  isSelectionStart: boolean
}

export type HexdumpRow = {
  rowStart: number
  cells: HexdumpCell[]
  ascii: string
  hasSelectedBytes: boolean
}

export type BitSliceByte = {
  address: number
  value: number
  bits: string[]
  isSelected: boolean
  isSelectionStart: boolean
}

export type Validation<T> = {
  value: T | null
  reason: string | null
}

export type LabAction =
  | { type: 'load-preset'; presetId: string }
  | { type: 'clear-memory' }
  | { type: 'resize-memory'; nextSize: number }
  | { type: 'set-selection-start'; address: number }
  | { type: 'set-selection-length'; lengthBytes: SelectionLength }
  | { type: 'set-read-interpretation'; interpretation: ReadInterpretation }
  | { type: 'set-endianness'; endianness: Endianness }
  | { type: 'set-logical-interpretation'; interpretation: LogicalInterpretation }
  | { type: 'set-logical-notation'; notation: NumericNotation }
  | { type: 'set-logical-input'; value: string }
  | { type: 'set-arithmetic-mode'; mode: ArithmeticMode }
  | { type: 'set-operand-notation'; notation: NumericNotation }
  | { type: 'set-operand-input'; value: string }
  | { type: 'set-byte-patch-address'; address: number }
  | { type: 'set-byte-patch-value'; value: string }
  | { type: 'set-ascii-patch-address'; address: number }
  | { type: 'set-ascii-patch-text'; value: string }
  | { type: 'toggle-bit'; address: number; bitIndex: number }
  | { type: 'patch-byte'; address: number; value: number }
  | { type: 'patch-ascii'; address: number; bytes: number[]; text: string }
  | { type: 'write-logical-value'; value: bigint }
  | { type: 'apply-arithmetic'; operation: 'add' | 'subtract'; operand: bigint }
  | { type: 'apply-extension'; mode: 'zero' | 'sign' }
  | { type: 'apply-truncate' }

export const ADDRESS_BASE = 0x20
export const ROW_BYTES = 16
export const BIT_SLICE_BYTES = 8
export const MEMORY_SIZE_OPTIONS = [32, 64, 128, 256] as const
export const SELECTION_LENGTH_OPTIONS: SelectionLength[] = [1, 2, 4, 8]
export const HISTORY_LIMIT = 8

export const READ_LABELS: Record<ReadInterpretation, string> = {
  u8: 'u8',
  u16: 'u16',
  u32: 'u32',
  u64: 'u64',
  i8: 'i8',
  i16: 'i16',
  i32: 'i32',
  i64: 'i64',
  float32: 'float32',
  float64: 'float64',
  'raw-bytes': 'raw bytes',
  'ascii-simple': 'ASCII simple',
}

export const LOGICAL_LABELS: Record<LogicalInterpretation, string> = {
  u8: 'u8',
  u16: 'u16',
  u32: 'u32',
  u64: 'u64',
  i8: 'i8',
  i16: 'i16',
  i32: 'i32',
  i64: 'i64',
}

export const READ_OPTIONS_BY_LENGTH: Record<SelectionLength, ReadInterpretation[]> = {
  1: ['u8', 'i8', 'raw-bytes', 'ascii-simple'],
  2: ['u16', 'i16', 'raw-bytes', 'ascii-simple'],
  4: ['u32', 'i32', 'float32', 'raw-bytes', 'ascii-simple'],
  8: ['u64', 'i64', 'float64', 'raw-bytes', 'ascii-simple'],
}

export const LOGICAL_OPTIONS_BY_LENGTH: Record<SelectionLength, LogicalInterpretation[]> = {
  1: ['u8', 'i8'],
  2: ['u16', 'i16'],
  4: ['u32', 'i32'],
  8: ['u64', 'i64'],
}

const DEFAULT_MEMORY_SIZE = 32

function seedMemory(memorySize: number, values: number[]): number[] {
  const memory = Array.from({ length: memorySize }, () => 0)

  values.slice(0, memorySize).forEach((value, index) => {
    memory[index] = value & 0xff
  })

  return memory
}

function pushHistory(history: LabHistoryEntry[], entry: LabHistoryEntry): LabHistoryEntry[] {
  return [entry, ...history].slice(0, HISTORY_LIMIT)
}

function clampAddress(address: number, memoryLength: number): number {
  return Math.max(0, Math.min(address, Math.max(0, memoryLength - 1)))
}

function clampSelectionStart(address: number, lengthBytes: SelectionLength, memoryLength: number): number {
  return Math.max(0, Math.min(address, Math.max(0, memoryLength - lengthBytes)))
}

function getUnsignedInterpretation(lengthBytes: SelectionLength): LogicalInterpretation {
  return `u${lengthBytes * 8}` as LogicalInterpretation
}

function getSignedInterpretation(lengthBytes: SelectionLength): LogicalInterpretation {
  return `i${lengthBytes * 8}` as LogicalInterpretation
}

function getDefaultReadInterpretation(lengthBytes: SelectionLength): ReadInterpretation {
  return getUnsignedInterpretation(lengthBytes)
}

function getDefaultLogicalInterpretation(lengthBytes: SelectionLength): LogicalInterpretation {
  return getUnsignedInterpretation(lengthBytes)
}

function isReadAllowed(lengthBytes: SelectionLength, interpretation: ReadInterpretation): boolean {
  return READ_OPTIONS_BY_LENGTH[lengthBytes].includes(interpretation)
}

function isLogicalAllowed(lengthBytes: SelectionLength, interpretation: LogicalInterpretation): boolean {
  return LOGICAL_OPTIONS_BY_LENGTH[lengthBytes].includes(interpretation)
}

function syncInterpretationsForLength(state: LabState, lengthBytes: SelectionLength): LabState {
  const nextReadInterpretation = isReadAllowed(lengthBytes, state.readView.interpretation)
    ? state.readView.interpretation
    : getDefaultReadInterpretation(lengthBytes)
  const nextLogicalInterpretation = isLogicalAllowed(lengthBytes, state.logicalEditor.interpretation)
    ? state.logicalEditor.interpretation
    : getDefaultLogicalInterpretation(lengthBytes)

  return {
    ...state,
    readView: {
      ...state.readView,
      interpretation: nextReadInterpretation,
    },
    logicalEditor: {
      ...state.logicalEditor,
      interpretation: nextLogicalInterpretation,
    },
  }
}

function buildStateFromPreset(preset: LabPreset): LabState {
  const logicalInterpretation = preset.logicalEditor?.interpretation ?? getDefaultLogicalInterpretation(preset.selection.lengthBytes)

  return {
    memory: [...preset.memory],
    memorySize: preset.memorySize,
    selection: { ...preset.selection },
    readView: { ...preset.readView },
    logicalEditor: {
      interpretation: logicalInterpretation,
      notation: preset.logicalEditor?.notation ?? 'hex',
      valueInput: preset.logicalEditor?.valueInput ?? '',
      arithmeticMode: preset.logicalEditor?.arithmeticMode ?? 'unsigned',
      operandNotation: preset.logicalEditor?.operandNotation ?? 'decimal',
      operandInput: preset.logicalEditor?.operandInput ?? '1',
    },
    memoryEditor: {
      bytePatchAddress: preset.selection.startAddress,
      bytePatchValue: formatByteHex(preset.memory[preset.selection.startAddress] ?? 0),
      asciiPatchAddress: preset.selection.startAddress,
      asciiPatchText: '',
    },
    activePresetId: preset.id,
    history: [{ kind: 'preset', title: 'preset cargado', detail: preset.note }],
  }
}

export const PRESETS: LabPreset[] = [
  {
    id: 'same-byte-two-reads',
    title: 'mismo byte, dos lecturas',
    note: '0xFF deja comparar unsigned y signed sin tocar los bits.',
    memorySize: DEFAULT_MEMORY_SIZE,
    memory: seedMemory(DEFAULT_MEMORY_SIZE, [0xff]),
    selection: { startAddress: 0, lengthBytes: 1 },
    readView: { interpretation: 'u8', endianness: 'little' },
    logicalEditor: { interpretation: 'u8', notation: 'hex', valueInput: 'FF' },
  },
  {
    id: 'overflow-unsigned',
    title: 'overflow unsigned',
    note: 'La seleccion arranca en 255 para provocar wraparound inmediato.',
    memorySize: DEFAULT_MEMORY_SIZE,
    memory: seedMemory(DEFAULT_MEMORY_SIZE, [0xff]),
    selection: { startAddress: 0, lengthBytes: 1 },
    readView: { interpretation: 'u8', endianness: 'little' },
    logicalEditor: { interpretation: 'u8', notation: 'hex', valueInput: 'FF', operandNotation: 'hex', operandInput: '1' },
  },
  {
    id: 'overflow-signed',
    title: 'overflow signed',
    note: '127 sobre 8 bits signed deja visible el desborde clasico.',
    memorySize: DEFAULT_MEMORY_SIZE,
    memory: seedMemory(DEFAULT_MEMORY_SIZE, [0x7f]),
    selection: { startAddress: 0, lengthBytes: 1 },
    readView: { interpretation: 'i8', endianness: 'little' },
    logicalEditor: { interpretation: 'i8', notation: 'decimal', valueInput: '127', arithmeticMode: 'signed', operandNotation: 'decimal', operandInput: '1' },
  },
  {
    id: 'u32-little',
    title: 'un valor, cuatro bytes',
    note: '0x12345678 aparece distribuido en little endian.',
    memorySize: DEFAULT_MEMORY_SIZE,
    memory: seedMemory(DEFAULT_MEMORY_SIZE, [0x78, 0x56, 0x34, 0x12]),
    selection: { startAddress: 0, lengthBytes: 4 },
    readView: { interpretation: 'u32', endianness: 'little' },
    logicalEditor: { interpretation: 'u32', notation: 'hex', valueInput: '12345678' },
  },
  {
    id: 'u32-big',
    title: 'big endian',
    note: 'El mismo valor logico ocupa los mismos 4 bytes en otro orden material.',
    memorySize: DEFAULT_MEMORY_SIZE,
    memory: seedMemory(DEFAULT_MEMORY_SIZE, [0x12, 0x34, 0x56, 0x78]),
    selection: { startAddress: 0, lengthBytes: 4 },
    readView: { interpretation: 'u32', endianness: 'big' },
    logicalEditor: { interpretation: 'u32', notation: 'hex', valueInput: '12345678' },
  },
  {
    id: 'truncate-middle',
    title: 'sobrescribir el medio',
    note: 'Un patch local puede cambiar la lectura grande que lo contiene.',
    memorySize: DEFAULT_MEMORY_SIZE,
    memory: seedMemory(DEFAULT_MEMORY_SIZE, [0x78, 0x56, 0x34, 0x12, 0xaa, 0xbb]),
    selection: { startAddress: 0, lengthBytes: 4 },
    readView: { interpretation: 'u32', endianness: 'little' },
    logicalEditor: { interpretation: 'u32', notation: 'hex', valueInput: '12345678' },
  },
  {
    id: 'ascii-vs-logical',
    title: 'ASCII vs valor logico',
    note: 'La memoria puede leerse como numero o como texto ASCII simple.',
    memorySize: DEFAULT_MEMORY_SIZE,
    memory: seedMemory(DEFAULT_MEMORY_SIZE, [0x34, 0x32, 0x00, 0x00]),
    selection: { startAddress: 0, lengthBytes: 2 },
    readView: { interpretation: 'ascii-simple', endianness: 'little' },
    logicalEditor: { interpretation: 'u16', notation: 'decimal', valueInput: '42' },
  },
  {
    id: 'utf8-prefixes',
    title: 'UTF-8 y bytes de continuacion',
    note: 'cafe con tilde deja ver un byte lider 110xxxxx, un byte 10xxxxxx y la intuicion de longitud variable que reaparece despues en otros encodings.',
    memorySize: DEFAULT_MEMORY_SIZE,
    memory: seedMemory(DEFAULT_MEMORY_SIZE, [0x63, 0x61, 0x66, 0xc3, 0xa9, 0x20, 0x41]),
    selection: { startAddress: 3, lengthBytes: 2 },
    readView: { interpretation: 'raw-bytes', endianness: 'big' },
    logicalEditor: { interpretation: 'u16', notation: 'hex', valueInput: 'C3A9' },
  },
  {
    id: 'float-toy',
    title: 'float de juguete',
    note: '0.1 aproximado como float32 refuerza que no todo decimal entra exacto.',
    memorySize: DEFAULT_MEMORY_SIZE,
    memory: seedMemory(DEFAULT_MEMORY_SIZE, [0xcd, 0xcc, 0xcc, 0x3d]),
    selection: { startAddress: 0, lengthBytes: 4 },
    readView: { interpretation: 'float32', endianness: 'little' },
    logicalEditor: { interpretation: 'u32', notation: 'hex', valueInput: '3DCCCCCD' },
  },
]

export function createInitialState(): LabState {
  return buildStateFromPreset(PRESETS[0])
}

export function formatAddress(address: number): string {
  return `0x${(ADDRESS_BASE + address).toString(16).toUpperCase().padStart(2, '0')}`
}

export function formatByteHex(value: number): string {
  return value.toString(16).toUpperCase().padStart(2, '0')
}

export function formatByteBits(value: number): string {
  return value.toString(2).padStart(8, '0')
}

export function getSelectionRangeLabel(state: LabState): string {
  const start = formatAddress(state.selection.startAddress)
  const end = formatAddress(state.selection.startAddress + state.selection.lengthBytes - 1)
  return state.selection.lengthBytes === 1 ? `mem[${start}]` : `mem[${start}..${end}]`
}

export function getSelectedBytes(state: LabState): number[] | null {
  const end = state.selection.startAddress + state.selection.lengthBytes
  return end <= state.memory.length
    ? state.memory.slice(state.selection.startAddress, end)
    : null
}

function positiveModulo(value: bigint, modulo: bigint): bigint {
  const remainder = value % modulo
  return remainder < 0n ? remainder + modulo : remainder
}

export function getUnsignedRange(lengthBytes: SelectionLength): { min: bigint; max: bigint } {
  const bits = BigInt(lengthBytes * 8)
  return { min: 0n, max: (1n << bits) - 1n }
}

export function getSignedRange(lengthBytes: SelectionLength): { min: bigint; max: bigint } {
  const bits = BigInt(lengthBytes * 8)
  return { min: -(1n << (bits - 1n)), max: (1n << (bits - 1n)) - 1n }
}

export function decodeUnsignedFromBytes(bytes: number[], endianness: Endianness): bigint {
  const ordered = endianness === 'little' ? [...bytes].reverse() : [...bytes]
  return ordered.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n)
}

export function decodeSignedFromBytes(bytes: number[], endianness: Endianness): bigint {
  const unsigned = decodeUnsignedFromBytes(bytes, endianness)
  const bits = BigInt(bytes.length * 8)
  const signBit = 1n << (bits - 1n)
  return unsigned >= signBit ? unsigned - (1n << bits) : unsigned
}

export function encodeUnsignedToBytes(value: bigint, lengthBytes: SelectionLength, endianness: Endianness): number[] {
  const bits = BigInt(lengthBytes * 8)
  const modulo = 1n << bits
  const wrapped = positiveModulo(value, modulo)
  const littleEndianBytes = Array.from({ length: lengthBytes }, (_, index) => {
    return Number((wrapped >> BigInt(index * 8)) & 0xffn)
  })

  return endianness === 'little' ? littleEndianBytes : littleEndianBytes.reverse()
}

export function formatHexValue(value: bigint, lengthBytes: SelectionLength): string {
  const bits = BigInt(lengthBytes * 8)
  const modulo = 1n << bits
  return `0x${positiveModulo(value, modulo).toString(16).toUpperCase().padStart(lengthBytes * 2, '0')}`
}

export function formatBinaryValue(value: bigint, lengthBytes: SelectionLength): string {
  const bits = BigInt(lengthBytes * 8)
  const modulo = 1n << bits
  const raw = positiveModulo(value, modulo).toString(2).padStart(lengthBytes * 8, '0')
  return raw.match(/.{1,8}/g)?.join(' ') ?? raw
}

function formatFloat(value: number): string {
  if (Number.isNaN(value)) return 'NaN'
  if (!Number.isFinite(value)) return value > 0 ? 'Infinity' : '-Infinity'

  const absolute = Math.abs(value)
  if (absolute >= 1e6 || (absolute > 0 && absolute < 1e-4)) {
    return value.toExponential(6)
  }

  return Number(value.toPrecision(10)).toString()
}

export function decodeFloatPreview(bytes: number[], endianness: Endianness): string | null {
  if (bytes.length !== 4 && bytes.length !== 8) {
    return null
  }

  const buffer = new ArrayBuffer(bytes.length)
  const view = new DataView(buffer)
  bytes.forEach((byte, index) => view.setUint8(index, byte))
  const value = bytes.length === 4
    ? view.getFloat32(0, endianness === 'little')
    : view.getFloat64(0, endianness === 'little')

  return formatFloat(value)
}

function getNumericMagnitude(raw: string, notation: NumericNotation): bigint | null {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }

  const sign = trimmed.startsWith('-') ? -1n : 1n
  const withoutSign = trimmed.replace(/^[+-]/, '')

  if (notation === 'decimal') {
    const normalized = withoutSign.replace(/_/g, '')
    if (!/^\d+$/.test(normalized)) {
      return null
    }

    const magnitude = BigInt(normalized)
    return sign < 0 ? -magnitude : magnitude
  }

  if (notation === 'hex') {
    const normalized = withoutSign.replace(/^0x/i, '').replace(/[\s_]+/g, '')
    if (!/^[0-9a-fA-F]+$/.test(normalized)) {
      return null
    }

    const magnitude = BigInt(`0x${normalized}`)
    return sign < 0 ? -magnitude : magnitude
  }

  const normalized = withoutSign.replace(/^0b/i, '').replace(/[\s_]+/g, '')
  if (!/^[01]+$/.test(normalized)) {
    return null
  }

  const magnitude = BigInt(`0b${normalized}`)
  return sign < 0 ? -magnitude : magnitude
}

export function parseNumericInput(raw: string, notation: NumericNotation): bigint | null {
  return getNumericMagnitude(raw, notation)
}

export function parseByteInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }

  const notation: NumericNotation = /^[+-]?0b/i.test(trimmed)
    ? 'binary'
    : /^[+-]?0x/i.test(trimmed) || /[a-f]/i.test(trimmed)
      ? 'hex'
      : 'decimal'

  const parsed = parseNumericInput(trimmed, notation)
  if (parsed === null || parsed < 0n || parsed > 0xffn) {
    return null
  }

  return Number(parsed)
}

export function asciiTextToBytes(text: string): number[] | null {
  const bytes: number[] = []

  for (const character of text) {
    const code = character.charCodeAt(0)
    if (code > 0x7f) {
      return null
    }
    bytes.push(code)
  }

  return bytes
}

export function bytesToAsciiPreview(bytes: number[]): string {
  return bytes.map((byte) => (byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.')).join('')
}

function overwriteRange(memory: number[], address: number, nextBytes: number[]): number[] {
  const nextMemory = [...memory]
  nextBytes.forEach((byte, offset) => {
    if (address + offset < nextMemory.length) {
      nextMemory[address + offset] = byte & 0xff
    }
  })
  return nextMemory
}

function getSignednessFromLogicalInterpretation(interpretation: LogicalInterpretation): ArithmeticMode {
  return interpretation.startsWith('i') ? 'signed' : 'unsigned'
}

export function getUnsignedValue(state: LabState): bigint | null {
  const selectedBytes = getSelectedBytes(state)
  return selectedBytes ? decodeUnsignedFromBytes(selectedBytes, state.readView.endianness) : null
}

export function getSignedValue(state: LabState): bigint | null {
  const selectedBytes = getSelectedBytes(state)
  return selectedBytes ? decodeSignedFromBytes(selectedBytes, state.readView.endianness) : null
}

export function getInterpretationPreview(state: LabState, interpretation: ReadInterpretation): string | null {
  const selectedBytes = getSelectedBytes(state)
  if (!selectedBytes) {
    return null
  }

  switch (interpretation) {
    case 'raw-bytes':
      return selectedBytes.map(formatByteHex).join(' ')
    case 'ascii-simple':
      return bytesToAsciiPreview(selectedBytes)
    case 'u8':
    case 'u16':
    case 'u32':
    case 'u64':
      return decodeUnsignedFromBytes(selectedBytes, state.readView.endianness).toString()
    case 'i8':
    case 'i16':
    case 'i32':
    case 'i64':
      return decodeSignedFromBytes(selectedBytes, state.readView.endianness).toString()
    case 'float32':
    case 'float64':
      return decodeFloatPreview(selectedBytes, state.readView.endianness)
    default:
      return null
  }
}

export function getDerivedReadRows(state: LabState): Array<{ id: string; label: string; value: string; active: boolean }> {
  const selectedBytes = getSelectedBytes(state)
  if (!selectedBytes) {
    return []
  }

  const lengthBytes = state.selection.lengthBytes
  const unsignedValue = decodeUnsignedFromBytes(selectedBytes, state.readView.endianness)
  const signedValue = decodeSignedFromBytes(selectedBytes, state.readView.endianness)
  const floatPreview = decodeFloatPreview(selectedBytes, state.readView.endianness)
  const unsignedInterpretation = getUnsignedInterpretation(lengthBytes)
  const signedInterpretation = getSignedInterpretation(lengthBytes)
  const activeInterpretation = state.readView.interpretation

  const rows = [
    {
      id: 'raw-bytes',
      label: 'bytes en memoria',
      value: selectedBytes.map(formatByteHex).join(' '),
      active: activeInterpretation === 'raw-bytes',
    },
    {
      id: 'hex',
      label: 'hex logico',
      value: formatHexValue(unsignedValue, lengthBytes),
      active: false,
    },
    {
      id: 'unsigned',
      label: `unsigned (${unsignedInterpretation})`,
      value: unsignedValue.toString(),
      active: activeInterpretation === unsignedInterpretation,
    },
    {
      id: 'signed',
      label: `signed (${signedInterpretation})`,
      value: signedValue.toString(),
      active: activeInterpretation === signedInterpretation,
    },
    {
      id: 'binary',
      label: 'binario logico',
      value: formatBinaryValue(unsignedValue, lengthBytes),
      active: false,
    },
  ]

  if (floatPreview) {
    rows.push({
      id: 'float',
      label: lengthBytes === 4 ? 'float32 aprox.' : 'float64 aprox.',
      value: floatPreview,
      active: activeInterpretation === (lengthBytes === 4 ? 'float32' : 'float64'),
    })
  }

  rows.push({
    id: 'ascii',
    label: 'ASCII simple',
    value: bytesToAsciiPreview(selectedBytes),
    active: activeInterpretation === 'ascii-simple',
  })

  return rows
}

export function getHexdumpRows(state: LabState): HexdumpRow[] {
  const rows: HexdumpRow[] = []

  for (let rowStart = 0; rowStart < state.memory.length; rowStart += ROW_BYTES) {
    const rowBytes = state.memory.slice(rowStart, rowStart + ROW_BYTES)
    const cells = rowBytes.map((value, offset) => {
      const address = rowStart + offset
      const isSelected = address >= state.selection.startAddress && address < state.selection.startAddress + state.selection.lengthBytes

      return {
        address,
        value,
        isSelected,
        isSelectionStart: address === state.selection.startAddress,
      }
    })

    rows.push({
      rowStart,
      cells,
      ascii: bytesToAsciiPreview(rowBytes),
      hasSelectedBytes: cells.some((cell) => cell.isSelected),
    })
  }

  return rows
}

export function getBitSlice8(state: LabState): BitSliceByte[] {
  const maxStart = Math.max(0, state.memory.length - BIT_SLICE_BYTES)
  const centeredStart = state.selection.startAddress - Math.floor((BIT_SLICE_BYTES - state.selection.lengthBytes) / 2)
  const sliceStart = Math.max(0, Math.min(centeredStart, maxStart))
  const sliceBytes = state.memory.slice(sliceStart, sliceStart + BIT_SLICE_BYTES)

  return sliceBytes.map((value, offset) => {
    const address = sliceStart + offset
    const isSelected = address >= state.selection.startAddress && address < state.selection.startAddress + state.selection.lengthBytes

    return {
      address,
      value,
      bits: formatByteBits(value).split(''),
      isSelected,
      isSelectionStart: address === state.selection.startAddress,
    }
  })
}

export function getLogicalWriteValidation(state: LabState): Validation<bigint> {
  const parsed = parseNumericInput(state.logicalEditor.valueInput, state.logicalEditor.notation)
  return parsed === null
    ? { value: null, reason: 'La entrada no coincide con la notacion elegida.' }
    : { value: parsed, reason: null }
}

export function getOperandValidation(state: LabState): Validation<bigint> {
  const parsed = parseNumericInput(state.logicalEditor.operandInput, state.logicalEditor.operandNotation)
  return parsed === null
    ? { value: null, reason: 'El operando no coincide con la notacion elegida.' }
    : { value: parsed, reason: null }
}

export function getBytePatchValidation(state: LabState): Validation<number> {
  const parsed = parseByteInput(state.memoryEditor.bytePatchValue)
  return parsed === null
    ? { value: null, reason: 'El byte debe entrar entre 0x00 y 0xFF.' }
    : { value: parsed, reason: null }
}

export function getAsciiPatchValidation(state: LabState): Validation<number[]> {
  if (state.memoryEditor.asciiPatchText.length === 0) {
    return { value: null, reason: 'Ingresa texto ASCII para escribir el patch.' }
  }

  const bytes = asciiTextToBytes(state.memoryEditor.asciiPatchText)
  if (bytes === null) {
    return { value: null, reason: 'ASCII simple solo acepta caracteres de 7 bits.' }
  }

  if (state.memoryEditor.asciiPatchAddress + bytes.length > state.memory.length) {
    return { value: null, reason: 'El patch ASCII se sale de la memoria visible.' }
  }

  return { value: bytes, reason: null }
}

export function getNextLargerSelectionLength(state: LabState): SelectionLength | undefined {
  return SELECTION_LENGTH_OPTIONS.find((lengthBytes) => {
    return lengthBytes > state.selection.lengthBytes && state.selection.startAddress + lengthBytes <= state.memory.length
  })
}

export function getNextSmallerSelectionLength(state: LabState): SelectionLength | undefined {
  return [...SELECTION_LENGTH_OPTIONS].reverse().find((lengthBytes) => lengthBytes < state.selection.lengthBytes)
}

function syncEditorsAfterSelectionStart(state: LabState, startAddress: number): LabState {
  return {
    ...state,
    memoryEditor: {
      ...state.memoryEditor,
      bytePatchAddress: startAddress,
      asciiPatchAddress: startAddress,
      bytePatchValue: formatByteHex(state.memory[startAddress] ?? 0),
    },
  }
}

export function labReducer(state: LabState, action: LabAction): LabState {
  switch (action.type) {
    case 'load-preset': {
      const preset = PRESETS.find((candidate) => candidate.id === action.presetId)
      return preset ? buildStateFromPreset(preset) : state
    }

    case 'clear-memory': {
      return {
        ...state,
        memory: Array.from({ length: state.memorySize }, () => 0),
        activePresetId: null,
        history: pushHistory(state.history, {
          kind: 'memory',
          title: 'memoria limpiada',
          detail: `Se pusieron en 0x00 los ${state.memorySize} bytes visibles.`,
        }),
      }
    }

    case 'resize-memory': {
      const nextSize = MEMORY_SIZE_OPTIONS.includes(action.nextSize as (typeof MEMORY_SIZE_OPTIONS)[number])
        ? action.nextSize
        : state.memorySize
      if (nextSize === state.memorySize) {
        return state
      }

      const nextMemory = state.memory.slice(0, nextSize)
      while (nextMemory.length < nextSize) {
        nextMemory.push(0)
      }

      const nextSelectionStart = clampSelectionStart(state.selection.startAddress, state.selection.lengthBytes, nextMemory.length)
      const resizedState = syncInterpretationsForLength({
        ...state,
        memory: nextMemory,
        memorySize: nextSize,
        selection: {
          ...state.selection,
          startAddress: nextSelectionStart,
        },
        memoryEditor: {
          ...state.memoryEditor,
          bytePatchAddress: clampAddress(state.memoryEditor.bytePatchAddress, nextMemory.length),
          asciiPatchAddress: clampAddress(state.memoryEditor.asciiPatchAddress, nextMemory.length),
        },
        activePresetId: null,
      }, state.selection.lengthBytes)

      return {
        ...syncEditorsAfterSelectionStart(resizedState, nextSelectionStart),
        history: pushHistory(state.history, {
          kind: 'memory',
          title: 'memoria visible actualizada',
          detail: `La vista ahora muestra ${nextSize} bytes direccionables.`,
        }),
      }
    }

    case 'set-selection-start': {
      const nextSelectionStart = clampSelectionStart(action.address, state.selection.lengthBytes, state.memory.length)
      if (nextSelectionStart === state.selection.startAddress) {
        return state
      }

      return syncEditorsAfterSelectionStart({
        ...state,
        selection: {
          ...state.selection,
          startAddress: nextSelectionStart,
        },
        activePresetId: null,
      }, nextSelectionStart)
    }

    case 'set-selection-length': {
      if (action.lengthBytes === state.selection.lengthBytes) {
        return state
      }

      const nextSelectionStart = clampSelectionStart(state.selection.startAddress, action.lengthBytes, state.memory.length)
      const nextState = syncInterpretationsForLength({
        ...state,
        selection: {
          startAddress: nextSelectionStart,
          lengthBytes: action.lengthBytes,
        },
        activePresetId: null,
      }, action.lengthBytes)

      return {
        ...syncEditorsAfterSelectionStart(nextState, nextSelectionStart),
        history: pushHistory(state.history, {
          kind: 'reinterpretation',
          title: 'misma memoria; nueva ventana',
          detail: `La seleccion tipada ahora usa ${action.lengthBytes * 8} bits desde ${formatAddress(nextSelectionStart)}.`,
        }),
      }
    }

    case 'set-read-interpretation': {
      if (action.interpretation === state.readView.interpretation || !isReadAllowed(state.selection.lengthBytes, action.interpretation)) {
        return state
      }

      return {
        ...state,
        readView: {
          ...state.readView,
          interpretation: action.interpretation,
        },
        activePresetId: null,
        history: pushHistory(state.history, {
          kind: 'reinterpretation',
          title: 'mismos bits; nueva lectura',
          detail: `La seleccion activa ahora se mira como ${READ_LABELS[action.interpretation]}.`,
        }),
      }
    }

    case 'set-endianness': {
      if (action.endianness === state.readView.endianness) {
        return state
      }

      return {
        ...state,
        readView: {
          ...state.readView,
          endianness: action.endianness,
        },
        activePresetId: null,
        history: pushHistory(state.history, {
          kind: 'reinterpretation',
          title: 'mismos bits; nuevo orden de lectura',
          detail: `Los bytes activos ahora se interpretan como ${action.endianness} endian.`,
        }),
      }
    }

    case 'set-logical-interpretation':
      return isLogicalAllowed(state.selection.lengthBytes, action.interpretation)
        ? {
            ...state,
            logicalEditor: {
              ...state.logicalEditor,
              interpretation: action.interpretation,
            },
          }
        : state

    case 'set-logical-notation':
      return {
        ...state,
        logicalEditor: {
          ...state.logicalEditor,
          notation: action.notation,
        },
      }

    case 'set-logical-input':
      return {
        ...state,
        logicalEditor: {
          ...state.logicalEditor,
          valueInput: action.value,
        },
      }

    case 'set-arithmetic-mode':
      return {
        ...state,
        logicalEditor: {
          ...state.logicalEditor,
          arithmeticMode: action.mode,
        },
      }

    case 'set-operand-notation':
      return {
        ...state,
        logicalEditor: {
          ...state.logicalEditor,
          operandNotation: action.notation,
        },
      }

    case 'set-operand-input':
      return {
        ...state,
        logicalEditor: {
          ...state.logicalEditor,
          operandInput: action.value,
        },
      }

    case 'set-byte-patch-address':
      return {
        ...state,
        memoryEditor: {
          ...state.memoryEditor,
          bytePatchAddress: clampAddress(action.address, state.memory.length),
          bytePatchValue: formatByteHex(state.memory[clampAddress(action.address, state.memory.length)] ?? 0),
        },
      }

    case 'set-byte-patch-value':
      return {
        ...state,
        memoryEditor: {
          ...state.memoryEditor,
          bytePatchValue: action.value,
        },
      }

    case 'set-ascii-patch-address':
      return {
        ...state,
        memoryEditor: {
          ...state.memoryEditor,
          asciiPatchAddress: clampAddress(action.address, state.memory.length),
        },
      }

    case 'set-ascii-patch-text':
      return {
        ...state,
        memoryEditor: {
          ...state.memoryEditor,
          asciiPatchText: action.value,
        },
      }

    case 'toggle-bit': {
      if (action.address < 0 || action.address >= state.memory.length) {
        return state
      }

      const nextMemory = [...state.memory]
      nextMemory[action.address] = nextMemory[action.address] ^ (1 << (7 - action.bitIndex))
      return {
        ...state,
        memory: nextMemory,
        activePresetId: null,
        history: pushHistory(state.history, {
          kind: 'material-write',
          title: 'nuevos bits; toggle puntual',
          detail: `${formatAddress(action.address)} alterno el bit ${7 - action.bitIndex}.`,
        }),
      }
    }

    case 'patch-byte': {
      if (action.address < 0 || action.address >= state.memory.length) {
        return state
      }

      const previous = state.memory[action.address]
      const nextMemory = [...state.memory]
      nextMemory[action.address] = action.value & 0xff

      return {
        ...state,
        memory: nextMemory,
        activePresetId: null,
        history: pushHistory(state.history, {
          kind: 'material-write',
          title: 'patch de byte',
          detail: `${formatAddress(action.address)}: 0x${formatByteHex(previous)} -> 0x${formatByteHex(action.value)}.`,
        }),
      }
    }

    case 'patch-ascii': {
      if (action.address + action.bytes.length > state.memory.length) {
        return state
      }

      return {
        ...state,
        memory: overwriteRange(state.memory, action.address, action.bytes),
        activePresetId: null,
        history: pushHistory(state.history, {
          kind: 'material-write',
          title: 'patch ASCII puro',
          detail: `${getSelectionRangeLabel({ ...state, selection: { startAddress: action.address, lengthBytes: action.bytes.length as SelectionLength } })}: "${action.text}" -> ${action.bytes.map(formatByteHex).join(' ')}.`,
        }),
      }
    }

    case 'write-logical-value': {
      const nextBytes = encodeUnsignedToBytes(action.value, state.selection.lengthBytes, state.readView.endianness)
      const nextMemory = overwriteRange(state.memory, state.selection.startAddress, nextBytes)
      const widthBits = state.selection.lengthBytes * 8
      const signedness = getSignednessFromLogicalInterpretation(state.logicalEditor.interpretation)
      const range = signedness === 'signed' ? getSignedRange(state.selection.lengthBytes) : getUnsignedRange(state.selection.lengthBytes)
      const overflow = action.value < range.min || action.value > range.max
      const nextReadInterpretation = state.logicalEditor.interpretation

      return {
        ...state,
        memory: nextMemory,
        readView: {
          ...state.readView,
          interpretation: nextReadInterpretation,
        },
        activePresetId: null,
        history: pushHistory(state.history, {
          kind: 'material-write',
          title: 'escritura logica',
          detail: overflow
            ? `El valor no entraba en ${LOGICAL_LABELS[state.logicalEditor.interpretation]}; se conservaron solo los ${widthBits} bits bajos.`
            : `Se escribio ${LOGICAL_LABELS[state.logicalEditor.interpretation]} sobre ${getSelectionRangeLabel(state)} sin perdida de bits.`,
        }),
      }
    }

    case 'apply-arithmetic': {
      const selectedBytes = getSelectedBytes(state)
      if (!selectedBytes) {
        return state
      }

      const currentValue = state.logicalEditor.arithmeticMode === 'signed'
        ? decodeSignedFromBytes(selectedBytes, state.readView.endianness)
        : decodeUnsignedFromBytes(selectedBytes, state.readView.endianness)
      const ideal = action.operation === 'add' ? currentValue + action.operand : currentValue - action.operand
      const storedBytes = encodeUnsignedToBytes(ideal, state.selection.lengthBytes, state.readView.endianness)
      const range = state.logicalEditor.arithmeticMode === 'signed'
        ? getSignedRange(state.selection.lengthBytes)
        : getUnsignedRange(state.selection.lengthBytes)
      const overflow = ideal < range.min || ideal > range.max
      const nextInterpretation = state.logicalEditor.arithmeticMode === 'signed'
        ? getSignedInterpretation(state.selection.lengthBytes)
        : getUnsignedInterpretation(state.selection.lengthBytes)

      return {
        ...state,
        memory: overwriteRange(state.memory, state.selection.startAddress, storedBytes),
        readView: {
          ...state.readView,
          interpretation: nextInterpretation,
        },
        activePresetId: null,
        history: pushHistory(state.history, {
          kind: 'arithmetic',
          title: action.operation === 'add' ? 'suma con ancho fijo' : 'resta con ancho fijo',
          detail: overflow
            ? `Ideal ${formatHexValue(ideal, state.selection.lengthBytes)} -> almacenado ${formatHexValue(decodeUnsignedFromBytes(storedBytes, state.readView.endianness), state.selection.lengthBytes)}; se conservaron los bits bajos.`
            : `Resultado dentro del rango ${state.logicalEditor.arithmeticMode} sin truncado.`,
        }),
      }
    }

    case 'apply-extension': {
      const selectedBytes = getSelectedBytes(state)
      const nextLength = getNextLargerSelectionLength(state)
      if (!selectedBytes || !nextLength) {
        return state
      }

      const nextValue = action.mode === 'sign'
        ? decodeSignedFromBytes(selectedBytes, state.readView.endianness)
        : decodeUnsignedFromBytes(selectedBytes, state.readView.endianness)
      const nextBytes = encodeUnsignedToBytes(nextValue, nextLength, state.readView.endianness)
      const nextInterpretation = action.mode === 'sign' ? getSignedInterpretation(nextLength) : getUnsignedInterpretation(nextLength)
      const nextState = syncInterpretationsForLength({
        ...state,
        memory: overwriteRange(state.memory, state.selection.startAddress, nextBytes),
        selection: {
          ...state.selection,
          lengthBytes: nextLength,
        },
        readView: {
          ...state.readView,
          interpretation: nextInterpretation,
        },
        logicalEditor: {
          ...state.logicalEditor,
          interpretation: nextInterpretation,
        },
        activePresetId: null,
      }, nextLength)

      return {
        ...nextState,
        history: pushHistory(state.history, {
          kind: 'arithmetic',
          title: action.mode === 'sign' ? 'sign extension' : 'zero extension',
          detail: `${state.selection.lengthBytes * 8} -> ${nextLength * 8} bits desde ${formatAddress(state.selection.startAddress)}.`,
        }),
      }
    }

    case 'apply-truncate': {
      const selectedBytes = getSelectedBytes(state)
      const nextLength = getNextSmallerSelectionLength(state)
      if (!selectedBytes || !nextLength) {
        return state
      }

      const unsignedValue = decodeUnsignedFromBytes(selectedBytes, state.readView.endianness)
      const nextBytes = encodeUnsignedToBytes(unsignedValue, nextLength, state.readView.endianness)
      const nextInterpretation = getSignednessFromLogicalInterpretation(state.logicalEditor.interpretation) === 'signed'
        ? getSignedInterpretation(nextLength)
        : getUnsignedInterpretation(nextLength)
      const nextState = syncInterpretationsForLength({
        ...state,
        memory: overwriteRange(state.memory, state.selection.startAddress, nextBytes),
        selection: {
          ...state.selection,
          lengthBytes: nextLength,
        },
        readView: {
          ...state.readView,
          interpretation: nextInterpretation,
        },
        logicalEditor: {
          ...state.logicalEditor,
          interpretation: nextInterpretation,
        },
        activePresetId: null,
      }, nextLength)

      return {
        ...nextState,
        history: pushHistory(state.history, {
          kind: 'arithmetic',
          title: 'truncado',
          detail: `La ventana se recorto a ${nextLength * 8} bits y solo sobrevivieron los bits bajos del valor actual.`,
        }),
      }
    }

    default:
      return state
  }
}