# Propuestas de unificación de layout para el simulador de L1

> Nota de trabajo previa a nuevos cambios de UI.
>
> Objetivo: reducir la fragmentación actual entre `estado de cpu`, `control de cpu` y `trabajo de cpu`, para decidir un layout más claro antes de volver a tocar React/CSS.

## Problema a resolver

La UI actual acumuló demasiadas superficies para conceptos que en realidad pertenecen a la misma familia.

Síntomas visibles:

- `estado`, `fase`, `modo de paso` e historial aparecen repartidos en más de un panel
- el panel de CPU mezcla inventario estable de estado con ejecución en curso
- `control de cpu` y `trabajo de cpu` hoy se pisan semánticamente
- `registros recientes` no agrega suficiente valor si ya existe historial navegable de estados
- `ciclo completo` se siente raro porque no es una fase real de la máquina, sino un modo de stepping

Hipótesis de rediseño:

- para `L1`, la UI principal debería poder leerse como **dos paneles**: `memoria` a la izquierda y `cpu` a la derecha
- el editor y la carga de programas pueden seguir abajo, fuera de esa pareja principal

## Reubicación semántica recomendada

Antes de hablar de layout, hace falta fijar qué significa cada cosa y dónde debería vivir.

- `estado` de máquina (`lista`, `corriendo`, `halted`, `error`) no debería mostrarse como palabra estable en la UI de `L1`; si la máquina está sana, no hace falta insistir en eso
- `modo de paso` (`pasos` vs `micropasos`) no es estado interno de la CPU: debe vivir junto a los controles y representarse como toggle pequeño
- `fase` (`fetch`, `decode`, `execute`) sí pertenece a la ejecución, pero no necesariamente al bloque de inventario de estado; puede vivir mejor junto a la explicación de lo que está ocurriendo
- `pc` e `ir` están más cerca del bloque de ejecución actual que del bloque de registros
- `r0` y `r1` sí pertenecen al bloque de registros
- la traza didáctica debería vivir dentro del panel CPU como banner o bloque expandible, no como panel aparte
- el historial de estados debería ser el único artefacto temporal persistente visible
- `registros recientes` debería eliminarse
- `ciclo completo` no debería mostrarse como si fuera una fase; si existe, debe aparecer solo como modo de stepping

## Contenido mínimo de cada panel

### Panel memoria

Debe contener:

- tabla unificada de memoria con código y datos
- resaltado de `pc`
- resaltado de instrucción actual
- resaltado de lectura/escritura reciente si aplica

No debería contener:

- controles de ejecución
- resumen didáctico largo
- historial temporal separado

### Panel cpu

Debe contener:

- controles compactos tipo debugger
- toggle pequeño de `pasos` vs `micropasos`
- bloque de registros (`r0`, `r1`)
- bloque de ejecución actual (`pc`, `ir`, instrucción activa)
- banner didáctico expandible
- historial de estados navegable

No debería contener:

- la palabra `lista` ocupando lugar fijo si no agrega información útil
- `registros recientes`
- paneles duplicados para `control` y `trabajo`

## Opción A — Dos paneles puros

La propuesta más directa para `L1`.

```text
+------------------------------------------------+ +------------------------------------------------+
| MEMORIA                                        | | CPU                                            |
|------------------------------------------------| |------------------------------------------------|
| dir | rol    | contenido                       | | [<-] [->] [>|] [||] [toggle paso/micro]       |
| 40  | dato   | 7                               | |------------------------------------------------|
| 41  | dato   | 5                               | | Registros              | Ejecución actual      |
| 100 | codigo | LOAD r0, [40]   <- pc          | | r0 = 0                 | pc = 100              |
| 101 | codigo | ADD r0, [41]                   | | r1 = 0                 | ir = LOAD r0, [40]    |
| 102 | codigo | STORE r0, [42]                 | |                        | instrucción = LOAD    |
|                                                | |------------------------------------------------|
|                                                | | Fase: decode                            [ ? ]  |
|                                                | | "La CPU interpreta LOAD y prepara execute"    |
|                                                | |------------------------------------------------|
|                                                | | Historial de estados                           |
|                                                | | [carga] -> [fetch] -> [decode] -> [execute]   |
+------------------------------------------------+ +------------------------------------------------+

+-----------------------------------------------------------------------------------------------+
| Programa editable / datos / presets / cargar en memoria                                      |
+-----------------------------------------------------------------------------------------------+
```

### Ventajas

- refleja mejor la intuición pedagógica de `L1`: memoria vs CPU
- absorbe `control` y `trabajo` dentro de un único panel CPU
- acerca la botonera a un lenguaje visual de debugger, más compacto y más natural
- deja `fase` como parte de la lectura didáctica, no del inventario de estado
- reduce repeticiones visibles

### Riesgos

- el panel CPU puede volverse demasiado alto si el bloque de fase/detail no colapsa bien
- si el historial de estados crece demasiado, compite con la traza didáctica

## Opción B — CPU en dos bandas internas

Mis mismos dos paneles principales, pero el panel CPU se parte internamente en una banda superior fija y una banda inferior temporal.

```text
+------------------------------------------------+ +------------------------------------------------+
| MEMORIA                                        | | CPU                                            |
|------------------------------------------------| |------------------------------------------------|
| tabla unificada                                | | [<-] [->] [>|] [||] [toggle paso/micro]       |
| con pc + instrucción actual                    | |------------------------------------------------|
|                                                | | Registros | pc | ir | instrucción activa      |
|                                                | |------------------------------------------------|
|                                                | | Fase: decode                            [ ? ]  |
|                                                | | "LOAD lee mem[40] y prepara execute"          |
|                                                | |------------------------------------------------|
|                                                | | Historial de estados                            |
|                                                | | [carga] -> [fetch] -> [decode] -> [execute]    |
+------------------------------------------------+ +------------------------------------------------+
```

### Ventajas

- la banda superior queda muy compacta y fácil de escanear
- el historial queda claramente separado de la lectura del estado actual
- es probablemente la opción más fácil de implementar desde la UI actual

### Riesgos

- `registros`, `pc`, `ir` e instrucción activa pueden volver a sentirse amontonados si no se jerarquizan bien
- el panel CPU puede sentirse más dashboard que máquina didáctica

## Opción C — CPU con foco en "estado actual" y timeline secundaria

Esta opción prioriza lo que pasa ahora y degrada visualmente el historial.

```text
+------------------------------------------------+ +------------------------------------------------+
| MEMORIA                                        | | CPU                                            |
|------------------------------------------------| |------------------------------------------------|
| tabla unificada                                | | [<-] [->] [>|] [||] [toggle paso/micro]       |
|                                                | |------------------------------------------------|
|                                                | | Registros              | Ejecución actual      |
|                                                | | r0 = 0                 | pc = 100              |
|                                                | | r1 = 0                 | ir = LOAD r0, [40]    |
|                                                | |                        | instrucción = LOAD    |
|                                                | |------------------------------------------------|
|                                                | | Fase: decode                            [ ? ]  |
|                                                | | "La CPU interpreta LOAD..."                   |
|                                                | |------------------------------------------------|
|                                                | | Estado 3/8   [ abrir historial ]               |
+------------------------------------------------+ +------------------------------------------------+
```

### Ventajas

- más limpio a simple vista
- favorece lectura puntual del estado presente
- puede servir mejor en pantallas medianas

### Riesgos

- el historial pierde presencia, cuando hoy es una de las mejoras más valiosas del simulador
- obliga a esconder interacción que ahora sí suma para entender la secuencia

## Recomendación para `L1`

La mejor candidata hoy parece ser la **Opción A**, con un ajuste importante:

- el cuerpo del panel CPU debería dividirse en **registros** y **ejecución actual**
- no hace falta mostrar la palabra `lista` de forma permanente
- los controles deberían verse como una pequeña botonera tipo debugger
- `fase` se mueve al bloque explicativo de abajo, no al bloque de ejecución actual
- `historial de estados` queda como única memoria temporal persistente
- `registros recientes` desaparece
- `control de cpu` y `trabajo de cpu` dejan de existir como paneles separados

En otras palabras: no se trata de mover widgets entre cajas actuales, sino de redefinir la semántica del panel derecho como **CPU = control + estado actual + lectura didáctica + timeline**.

## Qué debería contener exactamente la opción recomendada

### Encabezado del panel CPU

- botonera compacta tipo debugger
- flecha para atrás en historial
- flecha para adelante en historial
- play/pause o step según el estado
- toggle pequeño de stepping: `pasos` / `micropasos`

Representación sugerida:

- una flecha recta entrando para `paso`
- una flecha suavemente curvada o que "salta" por arriba para `micropaso`

### Bloque 1 — Registros

- `r0`
- `r1`

### Bloque 2 — Ejecución actual

- `pc`
- `ir`
- instrucción actual o título de la traza activa
- cambios visibles más importantes

### Bloque 3 — Fase y explicación mínima

- rótulo explícito: `Fase: fetch|decode|execute`
- una sola oración visible por defecto
- un icono pequeño `?` o similar para abrir detalle ampliado en popup/tooltip
- sin competir visualmente con memoria ni con historial

El detalle ampliado no debería empujar el layout hacia abajo. Debería vivir en una capa flotante o popup breve.

### Bloque 4 — Historial de estados

- timeline horizontal o tira compacta
- selección de estado anterior/siguiente
- scroll automático para mantener visible el estado activo cuando se avanza
- sin una segunda lista textual aparte

## Regla explícita sobre `fase` y `ciclo completo`

Propuesta concreta:

- `fase` solo debe nombrar fases internas reales: `fetch`, `decode`, `execute`
- `ciclo completo` no debe mostrarse como fase
- si el usuario está en modo `pasos`, la UI lo muestra en el toggle, no como pseudoestado textual
- si está en modo `micropasos`, lo mismo: toggle, no etiqueta grande dentro del cuerpo

Eso también evita mezclar dos preguntas distintas:

- en qué fase interna está la máquina
- con qué granularidad está avanzando la persona usuaria

Eso separa correctamente:

- la **máquina**: tiene una fase interna
- la **UI**: tiene un modo de stepping

## Contrato de interacción recomendado

Para seguir de manera coherente, hay que tratar la opción recomendada como contrato de implementación y no como wireframe suelto.

### 1. Regla de snapshot activo

En todo momento existe un único `snapshot activo`.

Ese snapshot gobierna simultáneamente:

- el contenido visible de memoria
- los resaltados de `pc`, instrucción actual y accesos recientes
- los valores de `r0`, `r1`, `pc` e `ir`
- el bloque `Fase: ...`
- la explicación didáctica breve
- la selección visible en el historial

Consecuencia directa: si la persona navega hacia atrás en el historial, **toda** la UI principal debe rehidratarse a ese snapshot, no solo el panel CPU.

### 2. Navegación temporal

El historial representa una secuencia de snapshots navegables.

Reglas:

- avanzar crea o selecciona el siguiente snapshot de la secuencia
- ir hacia atrás no reejecuta nada: solo cambia el snapshot activo
- ir hacia adelante desde un estado pasado tampoco reejecuta: navega a un snapshot ya existente si existe
- si la persona vuelve a ejecutar desde un snapshot pasado y eso genera una nueva rama temporal, la UI puede truncar la cola futura y continuar desde el snapshot activo actual
- el historial es la única memoria temporal persistente visible

Regla pedagógica: la persona siempre debe poder entender que está mirando **un estado de máquina congelado**, no un resumen parcial del presente.

### 3. Estados excepcionales

En estado normal, la UI no necesita mostrar una etiqueta estable como `lista`.

La semántica propuesta es:

- estado normal: encabezado silencioso, sin badge textual permanente
- `corriendo`: la actividad se deduce por autoplay activo y avance del historial, no por una palabra dominante
- `halted`: aparece una señal compacta y visible en el encabezado del panel CPU
- `error`: aparece una señal de error en el encabezado y un mensaje breve cercano al área de control
- `limit`: aparece una señal equivalente a "ejecución detenida por seguridad" para explicar el corte del worker
- `programa inválido` o `sin programa cargado`: el área de control puede deshabilitar acciones de ejecución y mostrar el motivo en texto corto

La regla general es simple: el estado solo gana protagonismo cuando deja de ser normal.

### 4. Semántica exacta de controles

Los controles del encabezado CPU no deberían mezclar navegación temporal con ejecución sin reglas claras.

Contrato sugerido:

- `[<]`: seleccionar snapshot anterior del historial
- `[>]`: seleccionar snapshot siguiente del historial
- `[>|]`: avanzar una unidad según el toggle activo
- `[||]`: pausar ejecución continua
- `[->|]`: iniciar o reanudar ejecución continua desde el snapshot activo
- `[toggle]`: elegir granularidad `pasos` o `micropasos`

Y además:

- `pasos` avanza un ciclo visible de alto nivel
- `micropasos` avanza fases internas reales (`fetch`, `decode`, `execute`)
- `play` debe respetar la granularidad activa, no inventar otra distinta
- `pause` detiene autoplay pero no cambia el snapshot seleccionado
- navegar historial con `[<]` o `[>]` tampoco cambia el modo de stepping

Eso separa bien dos dimensiones:

- navegación por estados ya producidos
- producción de estados nuevos

### 5. Contrato del bloque `Fase: ...`

El bloque `Fase: ...` describe siempre el `snapshot activo`.

No describe el evento anterior ni la intención del próximo botón.

Reglas:

- si hay traza activa, muestra `Fase: fetch|decode|execute`
- debajo muestra una sola oración visible por defecto
- el icono `?` abre detalle ampliado sin empujar el layout
- si no hay traza activa todavía, el bloque puede mostrar una frase mínima de espera o preparación, pero no desaparecer por completo

Esto evita que la UI cambie de gramática al pasar de carga inicial a ejecución real.

### 6. Responsive mínimo

La propuesta no debería quedar atada solo a desktop ancho.

Contrato mínimo:

- en desktop amplio, `memoria` y `cpu` van lado a lado
- en ancho intermedio, siguen lado a lado mientras ambas columnas sigan siendo legibles
- cuando ya no entren con legibilidad razonable, apilan en orden: `cpu`, `memoria`, `editor`
- el historial debe seguir siendo horizontal, con scroll si hace falta
- el editor queda abajo a ancho completo en todas las variantes

Mover `cpu` arriba al apilar tiene sentido porque ahí vive la acción principal de control y lectura del estado actual.

## Decisión cerrada para la próxima implementación

La próxima iteración debería asumir esto como base:

- **izquierda: memoria**
- **derecha: cpu**
- **abajo: editor/carga**

Y dentro de CPU:

- encabezado de control tipo debugger
- registros
- ejecución actual con `pc`, `ir` e instrucción activa
- bloque `Fase: ...` con detalle mínimo + popup explicativo
- historial de estados

Con eso ya no queda solo una preferencia visual: queda definido el comportamiento mínimo del simulador cuando se ejecuta, se pausa, se navega hacia atrás y aparece un estado excepcional.

## Variante A.1 — Opción A refinada

Si esto se escribe en una versión todavía más cercana a la implementación, quedaría así:

```text
+------------------------------------------------+ +------------------------------------------------+
| MEMORIA                                        | | CPU                                            |
|------------------------------------------------| |------------------------------------------------|
| dir | rol    | contenido                       | | [<] [>] [>|] [||] [->|] [toggle]              |
| 40  | dato   | 7                               | |------------------------------------------------|
| 41  | dato   | 5                               | | Registros         | Ejecución actual          |
| 100 | codigo | LOAD r0, [40]   <- pc          | | r0 = 0            | pc = 100                  |
| 101 | codigo | ADD r0, [41]                   | | r1 = 0            | ir = LOAD r0, [40]        |
| 102 | codigo | STORE r0, [42]                 | |                   | instrucción = LOAD        |
|                                                | |------------------------------------------------|
|                                                | | Fase: decode                            [ ? ]  |
|                                                | | interpreta operandos y prepara execute        |
|                                                | |------------------------------------------------|
|                                                | | [carga] -> [fetch] -> [decode] -> [execute]   |
+------------------------------------------------+ +------------------------------------------------+

+-----------------------------------------------------------------------------------------------+
| Programa editable / datos / presets / cargar en memoria                                      |
+-----------------------------------------------------------------------------------------------+
```

Notas sobre esta variante:

- `[<]` y `[>]` pueden usarse para navegar historial manualmente
- `[>|]` puede ser `step`
- `[||]` puede ser `pause`
- `[->|]` puede reservarse para `play` o avance continuo
- el toggle idealmente debe ocupar el ancho de un botón chico, no el de un selector textual completo

Esta versión parece la más alineada con lo que pediste y la que menos desperdicia espacio horizontal en el panel CPU.