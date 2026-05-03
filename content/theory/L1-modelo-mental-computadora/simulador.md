# Simulador didáctico de máquina de Von Neumann para L1

> Documento de diseño interno para una futura solapa propia del nivel.
>
> Este artefacto no reemplaza capítulos ni ejercicios. Define una pieza interactiva grande, pensada para crecer con el track.

## Objetivo

Construir un simulador didáctico que haga visible, paso a paso, el modelo mental de `L1`: memoria, `pc`, registros, fetch, decode, execute, código cargado, datos y programa en ejecución.

La primera versión tiene que servir para reforzar lo que ya explican los capítulos `01` a `04`, no para adelantar contenidos de `L2`, `L3`, `L7` o niveles de sistemas operativos.

## Por qué va en una solapa propia

Esta pieza no conviene vivir como capítulo de teoría ni como ejercicio aislado.

- como capítulo sería demasiado grande y con demasiado estado propio
- como ejercicio quedaría subrepresentada, porque no es una práctica acotada sino una herramienta de exploración
- como solapa propia puede tener controles, editor, presets, memoria visible y traza sin deformar la lectura del nivel

Nombre recomendado de la futura solapa: `simulador`.

## Contrato conceptual

El simulador tiene que respetar estas distinciones desde la primera versión:

- **programa editable**: texto que la persona modifica en el editor
- **memoria cargada**: representación ya cargada en la memoria didáctica de la máquina
- **ejecución actual**: estado vivo de la máquina mientras se avanza o corre el programa

Regla importante: editar el programa no cambia la ejecución actual hasta que la persona vuelva a presionar `cargar en memoria`.

Ese punto no es solo técnico. Refuerza exactamente la diferencia conceptual entre texto editable, código cargado y programa en ejecución que `L1` ya introduce en `04`.

## Qué muestra L1

La versión inicial debe ser austera y alineada con la teoría ya escrita.

Estado visible en `L1`:

- `pc`
- `ir`
- `r0`
- `r1`
- memoria unificada con código y datos
- fase actual: `fetch`, `decode` o `execute`
- instrucción actual
- traza de cambios recientes

Estado que no conviene exponer todavía en la primera cara del simulador:

- flags
- stack pointer
- direcciones virtuales
- scheduler
- syscalls
- detalles de pipeline real

Se puede conservar la idea de buses o registros internos como inspiración visual, pero no deben dominar la interfaz de `L1`.

## Alcance de la v1

La v1 tiene que ser usable y pedagógicamente clara, pero deliberadamente chica.

Incluye:

- editor de programa editable
- bloque de datos iniciales editable
- presets cargables desde la interfaz
- botón `cargar en memoria`
- controles `step`, `play`, `pause`, `reset`
- modo de paso fino por microfase
- modo de paso por instrucción completa
- memoria visible con direcciones explícitas
- resaltado claro de lecturas, escrituras y salto de `pc`
- historial reciente de estados o traza ejecutada

No incluye todavía:

- múltiples procesos ejecutando a la vez
- cambio de contexto automático
- sintaxis compleja con labels
- assembly real o demasiado cercano a una ISA histórica

## ISA mínima de L1

La primera ISA tiene que ser pequeña, uniforme y suficiente para ilustrar el modelo mental del nivel.

Instrucciones propuestas:

- `MOV rX, valor`
- `LOAD rX, [dir]`
- `STORE rX, [dir]`
- `ADD rX, operando`
- `SUB rX, operando`
- `JMP dir`
- `JNZ rX, dir`
- `HALT`

Donde:

- `valor` puede ser un inmediato decimal o un registro
- `operando` puede ser inmediato decimal, registro o celda de memoria
- `dir` es siempre una dirección explícita escrita en decimal en la v1

La interfaz de `L1` no debería usar hexadecimal en esta etapa. Decimal alcanza y conversa mejor con los ejemplos actuales del nivel.

## Especificación corta del parser

Para la primera iteración conviene cerrar una gramática corta y predecible.

Reglas generales:

- registros admitidos: `r0` y `r1`
- programa: una instrucción por línea con formato `direccion: instruccion`
- datos: una celda por línea con formato `direccion: valor`
- una misma dirección no puede repetirse
- en la v1 tampoco conviene reutilizar una dirección como código y como dato
- sin labels en esta etapa
- sin comentarios en esta etapa

Formas admitidas:

- `MOV r0, 5`
- `MOV r1, r0`
- `LOAD r0, [40]`
- `STORE r0, [42]`
- `ADD r0, 3`
- `ADD r0, r1`
- `ADD r0, [41]`
- `SUB r1, 1`
- `JMP 120`
- `JNZ r0, 101`
- `HALT`

## Ejemplos válidos e inválidos

Válidos:

```text
100: MOV r0, 5
101: ADD r0, 3
102: STORE r0, [42]
103: HALT
```

```text
40: 7
41: 5
42: 0
```

Inválidos:

```text
100 LOAD r0, [40]
```

Falta `:` entre dirección e instrucción.

```text
100: LOAD [40], r0
```

En esta ISA `LOAD` siempre carga desde memoria hacia un registro.

```text
100: JNZ 101
```

Falta el registro a evaluar.

```text
40: hola
```

En datos iniciales la celda debe contener un entero decimal.

## Por qué existe `MOV`

`LOAD` y `STORE` modelan tráfico entre registro y memoria.

- `LOAD` = leer memoria y copiar a un registro
- `STORE` = tomar un registro y escribirlo en memoria

`MOV` cumple otro rol: copiar entre registros o cargar un inmediato en un registro sin mezclar esa operación con lectura de memoria.

Eso tiene valor didáctico en `L1` porque evita que `LOAD` quiera decir dos cosas distintas a la vez:

- leer desde memoria
- cargar un valor inmediato

Si más adelante quisiéramos simplificar todavía más la ISA, podríamos rediscutirlo. Pero para la primera versión `MOV` ayuda a mantener una frontera clara entre movimiento interno de estado y acceso a memoria.

## Formato mínimo del programa editable

La primera versión debe privilegiar claridad por encima de expresividad.

Programa:

```text
100: LOAD r0, [40]
101: ADD  r0, [41]
102: STORE r0, [42]
103: HALT
```

Datos iniciales:

```text
40: 7
41: 5
42: 0
```

Decisiones para la v1:

- direcciones explícitas en cada línea
- números decimales
- sin labels
- comentarios opcionales solo si no complican demasiado el parser
- errores sintácticos reportados por línea

## Layout de memoria didáctico

El simulador debe hacer visible que código y datos viven en el mismo espacio de memoria.

Modelo inicial:

- el programa editable ya trae direcciones explícitas para código
- los datos iniciales también se cargan con direcciones explícitas
- la memoria renderiza ambas cosas en una sola tabla o grilla
- el `pc` apunta a direcciones visibles de esa misma memoria

Eso permite que `L1` refuerce una idea central: código y dato no son materias distintas; cambian de rol según cómo los lee la máquina.

## Modelo de tiempo

La interfaz debe soportar dos ritmos de observación:

- **paso fino**: avanza por `fetch`, `decode` y `execute`
- **paso por instrucción**: ejecuta la instrucción completa y deja el estado siguiente listo para inspección

Eso evita una falsa dicotomía entre simulador lindo pero lento y simulador útil pero opaco.

## Errores y mensajes

El simulador tiene que tratar el error como parte del aprendizaje.

Los mensajes deberían distinguir:

- error de parseo del programa editable
- error de carga en memoria
- error de ejecución

Y mostrar, cuando corresponda:

- línea afectada
- instrucción o dato inválido
- forma esperada
- estado en el que falló la ejecución

## Worker de ejecución

El parseo y la carga en memoria pueden arrancar en el hilo principal sin problema.

La ejecución continua no.

La implementación actual de `play` y `pause` ya corre dentro de un `Web Worker` del navegador, precisamente porque `JMP` y `JNZ` ya pueden sostener loops reales.

Eso evita bloquear la interfaz y obliga a separar mejor:

- editor y controles de la UI
- estado serializable de la máquina
- comandos de ejecución y respuestas del motor

La recomendación práctica sigue siendo la misma: cualquier ejecución continua futura, incluyendo velocidad configurable, tracing más rico o múltiples procesos, tiene que conservar este aislamiento y seguir usando estado serializable.

## Presets y contenido curricular

Los presets no deberían quedar hardcodeados sin contexto pedagógico.

Conviene pensarlos como contenido del nivel:

- un preset base para `LOAD` + `ADD` + `STORE`
- un preset para salto condicional con `JNZ`
- un preset para mostrar diferencia entre editar, cargar y ejecutar

Más adelante podrían vivir en archivos versionados junto al nivel y ser leídos por la web como escenarios del simulador.
Ahora esos escenarios pueden quedar en `simulator-presets/`, junto al resto del contenido del nivel, sin depender de ejemplos embebidos dentro de la UI.

## Crecimiento por niveles

El simulador no debe nacer como demo aislada de `L1`, sino como núcleo evolutivo del track.

Idea general:

- `L1`: estado, instrucciones, memoria, fetch/decode/execute, programa editable y carga en memoria
- `L2`: representación binaria, bytes, overflow, vistas de memoria más concretas
- `L3`: relación entre texto editable, artefacto cargado y ejecución
- `L7`: instrucciones con una notación más cercana a assembly real
- niveles posteriores: stack, syscalls, procesos, scheduler, memoria virtual y otros mecanismos

La regla es simple: el simulador nunca debe mostrar como sabido algo que el nivel todavía no explicó.

## Decisiones de arquitectura

Recomendación técnica actual:

- componente interactivo implementado en `web/` con React + TypeScript
- contenido y presets ligados al nivel en archivos del repo
- solapa propia en la vista del nivel, no embebido como markdown largo
- motor estable con capacidades habilitables por nivel

No parece buen candidato para MDX en esta etapa. La interacción es demasiado grande y demasiado stateful.

## Orden recomendado de implementación

1. definir ISA, parser y formato exacto del programa editable
2. construir un motor mínimo de estado para un solo programa
3. renderizar memoria, registros, `pc`, `ir` y fase actual
4. agregar `cargar en memoria`, `step`, `play`, `pause`, `reset`
5. sumar presets curriculares de `L1`
6. recién después abrir crecimiento hacia más registros, más vistas o varios procesos

## Criterio de éxito para la v1

La v1 está bien si una persona puede:

- editar un programa chico
- cargarlo en memoria
- ver con claridad qué dirección señala el `pc`
- distinguir fetch, decode y execute
- notar qué cambió en registros y memoria
- entender que editar el texto no equivale a cambiar el proceso ya cargado

Si además se ve atractiva, mejor. Pero la prioridad es que enseñe bien.