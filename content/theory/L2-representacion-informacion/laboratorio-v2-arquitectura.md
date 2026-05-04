# Arquitectura implementable del laboratorio v2 para L2

> Documento de implementacion para convertir el rediseño conceptual de `laboratorio-v2.md` en una arquitectura React/TypeScript concreta.
>
> Punto de partida real: `web/src/components/L2RepresentationLab.tsx` hoy concentra estado, parsing, encoding, operaciones y render en un mismo componente.

## Objetivo

Pasar de una beta centrada en una ventana chica sobre `8` bytes a un laboratorio con:

- memoria canonica direccionable por bytes
- hexdump expandible
- seleccion tipada
- lecturas derivadas siempre sincronizadas
- edicion material de bytes, bits y patch ASCII
- separacion explicita entre interpretacion, notacion y accion

El objetivo de esta arquitectura no es solo ordenar codigo. Es proteger el modelo conceptual de `L2` para que la interfaz no vuelva a mezclar capas.

## Diagnostico de la v1 desde implementacion

La v1 actual tiene una virtud: ya concentra casi todas las transformaciones importantes sobre un buffer canonico pequeño. Pero la forma actual de implementacion no escala bien a la v2.

Hoy el componente mantiene en el mismo nivel:

- estado canonico de memoria
- estado de seleccion
- estado de interpretacion
- estado de editores
- reglas de parsing y encoding
- historiales textuales
- layout JSX completo

Problemas concretos de esa forma:

- `MEMORY_SIZE = 8` deja el modelo atado a una ventana minima
- `writeMode` mezcla notacion y semantica numerica
- el componente decide demasiado: parsea, encodea, muta y renderiza
- no existe frontera limpia entre `estado canonico` y `valores derivados`
- agregar ASCII, hexdump grande o patches libres volveria el archivo inmanejable

## Principio de arquitectura

La v2 deberia seguir una sola regla de implementacion:

**todo lo que pueda derivarse de `memory + selection + readView` no debe guardarse como estado canonico**

Eso implica que el estado persistente del laboratorio tiene que ser chico y explicito, y que las vistas se recalculan via selectores puros.

## Estado canonico propuesto

```ts
type Endianness = 'little' | 'big'
type SelectionLength = 1 | 2 | 4 | 8
type NumericNotation = 'decimal' | 'hex' | 'binary'

type ReadInterpretation =
  | 'u8' | 'u16' | 'u32' | 'u64'
  | 'i8' | 'i16' | 'i32' | 'i64'
  | 'float32' | 'float64'
  | 'raw-bytes'
  | 'ascii-simple'

type LogicalWriteInterpretation =
  | 'u8' | 'u16' | 'u32' | 'u64'
  | 'i8' | 'i16' | 'i32' | 'i64'
  | 'float32' | 'float64'

type SelectionState = {
  startAddress: number
  lengthBytes: SelectionLength
}

type ReadViewState = {
  interpretation: ReadInterpretation
  endianness: Endianness
}

type LogicalEditorState = {
  interpretation: LogicalWriteInterpretation
  notation: NumericNotation
  valueInput: string
  arithmeticMode: 'unsigned' | 'signed'
  operandNotation: NumericNotation
  operandInput: string
}

type MemoryEditorState = {
  bytePatchAddress: number
  bytePatchValue: string
  asciiPatchAddress: number
  asciiPatchText: string
  rawPatchAddress: number
  rawPatchText: string
}

type LabHistoryEntry = {
  kind: 'material-write' | 'reinterpretation' | 'arithmetic' | 'preset' | 'resize'
  title: string
  detail: string
}

type LabState = {
  memory: number[]
  memorySize: number
  selection: SelectionState
  readView: ReadViewState
  logicalEditor: LogicalEditorState
  memoryEditor: MemoryEditorState
  activePresetId: string | null
  history: LabHistoryEntry[]
}
```

## Estado que no deberia guardarse

Todo esto deberia derivarse por selectores puros:

- bytes seleccionados
- rango ocupando memoria
- valor unsigned
- valor signed
- valor float
- valor hex y binario
- preview ASCII
- filas del hexdump
- tira de `8` bytes a nivel bit alrededor de la seleccion
- errores de validacion de inputs
- si una lectura es aplicable o no para el largo actual

Regla simple:

- si puede recomponerse con una funcion pura, no deberia vivir en `useState`

## Reducer propuesto

La v2 deberia apoyarse en `useReducer`, no en muchos `useState` independientes.

No porque haga falta una arquitectura grandilocuente, sino porque las acciones del laboratorio ya son eventos de dominio bastante claros.

Acciones minimas:

```ts
type LabAction =
  | { type: 'load-preset'; presetId: string }
  | { type: 'reset-memory' }
  | { type: 'resize-memory'; nextSize: number }
  | { type: 'set-selection-start'; address: number }
  | { type: 'set-selection-length'; lengthBytes: SelectionLength }
  | { type: 'set-read-interpretation'; interpretation: ReadInterpretation }
  | { type: 'set-endianness'; endianness: Endianness }
  | { type: 'set-logical-input'; value: string }
  | { type: 'set-logical-notation'; notation: NumericNotation }
  | { type: 'set-logical-interpretation'; interpretation: LogicalWriteInterpretation }
  | { type: 'set-arithmetic-mode'; mode: 'unsigned' | 'signed' }
  | { type: 'set-operand-input'; value: string }
  | { type: 'set-operand-notation'; notation: NumericNotation }
  | { type: 'toggle-bit'; address: number; bitIndex: number }
  | { type: 'patch-byte'; address: number; value: number }
  | { type: 'patch-raw-bytes'; address: number; bytes: number[] }
  | { type: 'patch-ascii'; address: number; text: string }
  | { type: 'write-logical-value' }
  | { type: 'apply-arithmetic'; operation: 'add' | 'subtract' }
  | { type: 'apply-extension'; mode: 'zero' | 'sign' }
  | { type: 'apply-truncate' }
```

## Responsabilidad del reducer

El reducer no deberia renderizar nada ni formatear textos largos de UI, pero si deberia:

- mutar la memoria de forma inmutable
- mantener la seleccion dentro de rango
- impedir patches fuera de memoria
- registrar eventos de historial ya clasificados
- distinguir entre `mismos bits; nueva lectura` y `nuevos bits; misma lectura`

## Selectores puros que conviene extraer

Archivo recomendado: `web/src/components/l2-lab/selectors.ts`

Funciones candidatas:

```ts
getSelectedBytes(state)
getSelectionRange(state)
getUnsignedValue(state)
getSignedValue(state)
getFloatPreview(state)
getHexValue(state)
getBinaryValue(state)
getAsciiPreview(state)
getHexdumpRows(state)
getBitSlice8(state)
getApplicableReadViews(state)
getLogicalInputValidation(state)
getOperandValidation(state)
```

Regla de diseño:

- un selector no cambia estado
- un selector no decide UX de alto nivel
- un selector toma estado canonico y devuelve una lectura util para render o validacion

## Helpers puros de encoding y parsing

Archivo recomendado: `web/src/components/l2-lab/codec.ts`

Responsabilidades:

- parsear decimal, hex y binario sin mezclar interpretacion
- encodear `uN` e `iN` a bytes segun ancho y endianness
- decodear bytes a `uN`, `iN`, `float32`, `float64`
- traducir ASCII simple a bytes y bytes imprimibles a preview ASCII
- calcular truncado, sign extension, zero extension y wraparound

Punto fino importante:

- `ASCII simple` no necesita entrar al mismo parser que los numeros
- conviene dejarlo en helpers separados para que el codigo no vuelva a mezclar texto con numerico

## Arbol de componentes recomendado

```text
L2RepresentationLab
|- LabToolbar
|  |- PresetPicker
|  |- MemorySizeControls
|  |- ResetButton
|- LabMemoryPane
|  |- HexdumpTable
|  |- BitSlice8View
|- LabInspectorPane
|  |- SelectionControls
|  |- ReadInterpretationPanel
|- LabEditorsPane
|  |- LogicalValueEditor
|  |- MemoryPatchEditor
|- LabHistoryPanel
```

## Responsabilidad por componente

### `L2RepresentationLab`

- monta `useReducer`
- llama selectores principales
- pasa datos y callbacks puros a hijos
- no contiene logica de parsing inline en JSX

### `LabMemoryPane`

- renderiza hexdump
- marca bytes seleccionados
- permite click en byte y en bit
- muestra columna ASCII como lectura del dump

### `BitSlice8View`

- muestra `8` bytes alrededor de la seleccion actual
- sirve para flips de bit sin obligar a abrir un editor textual
- no decide interpretacion; solo materialidad

### `ReadInterpretationPanel`

- muestra la lectura actual del rango seleccionado
- lista lecturas hermanas: unsigned, signed, hex, binario, float, ASCII
- deja claro que cambiar interpretacion no toca memoria

### `LogicalValueEditor`

- opera sobre la seleccion activa
- tiene sus propios controles de interpretacion y notacion
- dispara `write-logical-value`, `apply-arithmetic`, `apply-extension` y `apply-truncate`

### `MemoryPatchEditor`

- opera con direccion material explicita
- contiene patch de byte, raw bytes y ASCII
- deja claro que ASCII es un patch puro sin terminador ni padding

### `LabHistoryPanel`

- renderiza entradas ya clasificadas
- puede usar badges de `accion material`, `accion logica`, `solo cambia la lectura`

## Flujo de eventos recomendado

### Caso 1. Click en un bit

```text
usuario -> BitSlice8View -> dispatch(toggle-bit)
        -> reducer actualiza memory
        -> selectores recalculan lecturas
        -> inspector y dump muestran nuevo estado
```

### Caso 2. Escribir `42` como `u32`

```text
usuario -> LogicalValueEditor
        -> parse numerico segun notacion elegida
        -> dispatch(write-logical-value)
        -> reducer encodea a bytes sobre la seleccion
        -> memory cambia
        -> dump, bits, lecturas y ASCII se recomputan
```

### Caso 3. Aplicar patch ASCII `AB`

```text
usuario -> MemoryPatchEditor
        -> ASCII 'A' 'B' => 0x41 0x42
        -> dispatch(patch-ascii)
        -> reducer sobrescribe exactamente esos dos bytes
        -> no agrega 00, no limpia bytes vecinos
        -> todas las lecturas afectadas se recalculan
```

### Caso 4. Reinterpretar de `u32` a `i32`

```text
usuario -> ReadInterpretationPanel -> dispatch(set-read-interpretation)
        -> reducer cambia solo readView
        -> memory queda intacta
        -> historial marca reinterpretacion
```

## Estructura de archivos recomendada

Sin cambiar el nombre publico del componente todavia, convendria migrar a algo asi:

```text
web/src/components/l2-lab/
  types.ts
  reducer.ts
  selectors.ts
  codec.ts
  presets.ts
  L2RepresentationLab.tsx
  LabToolbar.tsx
  LabMemoryPane.tsx
  HexdumpTable.tsx
  BitSlice8View.tsx
  LabInspectorPane.tsx
  ReadInterpretationPanel.tsx
  LogicalValueEditor.tsx
  MemoryPatchEditor.tsx
  LabHistoryPanel.tsx
```

Si en la primera iteracion eso resulta demasiado fragmentado, una version intermedia razonable seria:

```text
web/src/components/l2-lab/
  model.ts
  selectors.ts
  presets.ts
  L2RepresentationLab.tsx
```

Lo importante no es el numero de archivos. Lo importante es separar:

- estado canonico
- reglas puras del dominio
- render de UI

## Presets v2

Los presets ya no deberian ser solo un bloque corto de bytes. Deberian incluir contexto suficiente para reconstruir escena y foco inicial.

```ts
type LabPreset = {
  id: string
  title: string
  note: string
  memorySize: number
  memory: number[]
  selection: SelectionState
  readView: ReadViewState
  suggestedLogicalEditor?: Partial<LogicalEditorState>
  suggestedMemoryEditor?: Partial<MemoryEditorState>
}
```

Eso permite abrir escenas como:

- overflow unsigned
- same bytes, new meaning
- un `u32` en memoria little endian
- patch ASCII frente a valor logico
- sobrescribir el medio

## Estrategia de migracion incremental

La migracion no deberia empezar por el layout final. Deberia empezar por el modelo.

### Fase 1. Extraer dominio puro

- mover parsing, encoding y lecturas a helpers puros
- mantener el componente actual pero usando funciones externas

### Fase 2. Introducir reducer

- reemplazar los `useState` dispersos por `useReducer`
- mantener una UI cercana a la v1 mientras se estabiliza el modelo

### Fase 3. Cambiar memoria fija por hexdump expandible

- pasar de `8` a `32` bytes iniciales
- agregar filas de `16` bytes
- agregar seleccion visible y bit slice de `8` bytes

### Fase 4. Separar edicion logica y material

- `LogicalValueEditor` para valores tipados
- `MemoryPatchEditor` para bytes, raw patches y ASCII

### Fase 5. Reintroducir operaciones avanzadas

- aritmetica con ancho fijo
- zero extend y sign extend
- truncado
- historial enriquecido

## Primer slice implementable

Si hubiera que empezar ya, el slice mas seguro seria este:

1. mantener el nombre `L2RepresentationLab`
2. introducir `useReducer` con `memory`, `selection`, `readView` e `history`
3. subir la memoria inicial a `32` bytes
4. renderizar hexdump + seleccion + lecturas derivadas
5. dejar la edicion ASCII y la aritmetica para el segundo corte

Ese corte ya valida la decision mas importante: que la memoria sea realmente la unica fuente de verdad.

## Riesgos a evitar

- volver a guardar valores derivados en estado solo para simplificar JSX
- dejar ASCII medio integrado dentro del editor numerico
- dejar que cada subcomponente parsee por su cuenta
- acoplar hexdump y seleccion a una memoria fija de `8` bytes
- mezclar reglas de dominio con textos visuales dentro del reducer

## Criterio de exito tecnico

La arquitectura va en la direccion correcta si se cumple esto:

- cualquier accion material toca `memory` y solo despues se derivan lecturas
- cualquier reinterpretacion cambia `readView` sin tocar `memory`
- el componente raiz puede crecer sin volver a transformarse en un archivo monolitico
- agregar una nueva lectura derivada no obliga a rediseñar el estado canonico
- el insight `42` valor logico vs `"42"` ASCII cae naturalmente del modelo, no de una excepcion ad hoc

## Decision practica para implementacion

Cuando se empiece a codificar, conviene conservar el export publico `L2RepresentationLab` y reemplazar internamente su estructura. Eso reduce friccion con el resto de la web mientras cambia casi todo por dentro.