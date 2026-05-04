# Rediseno del laboratorio de representacion para L2

> Borrador de diseno para una segunda vuelta del laboratorio.
>
> No reemplaza a `laboratorio.md`. Lo complementa: la v1 ya existe, pero este documento cambia el modelo mental de la herramienta para volverla mas reactiva, mas clara y mas cercana a un inspector real de memoria.
>
> Para bajar este rediseño a una estructura concreta de React/TypeScript, ver `laboratorio-v2-arquitectura.md`.

## Diagnostico

La v1 sirve como beta y ya deja ver ideas importantes de `L2`, pero esta pensada mas como una coleccion de operaciones sobre una ventana corta que como un laboratorio de memoria realmente reactivo.

Eso genera cuatro problemas de base:

- el buffer visible es demasiado chico para sentirse como memoria o hexdump
- el estado de "valor logico" queda demasiado separado de la memoria material
- editar la memoria y escribir un valor no se sienten como dos caminos hacia la misma fuente de verdad
- un mismo combo mezcla notacion de entrada con interpretacion numerica, y eso confunde dos conceptos distintos

Ejemplo del problema conceptual actual:

- `hex` y `binario` describen **como escribo o muestro**
- `unsigned`, `signed` y `float` describen **como interpreto**

No pertenecen al mismo eje. Si viven en el mismo selector, la UI ensena una confusion conceptual justo en un nivel cuyo objetivo es separar capas.

## Principio rector

La v2 debe partir de una sola regla:

**la fuente de verdad es la memoria direccionable por bytes**

Todo lo demas se deriva de ahi:

- seleccion activa
- ancho de lectura
- endianness
- interpretacion
- notacion de visualizacion
- valor logico visible
- historial de cambios

Consecuencia importante:

- si escribo un valor logico, cambia la memoria
- si hago click sobre bytes o bits en memoria, cambia la memoria
- en ambos casos, todas las lecturas derivadas se recalculan automaticamente

No deberia existir un "valor original" separado que quede desincronizado de la memoria. Si existe, el modelo ya nacio mal.

## Separaciones que la interfaz debe imponer

La v2 tiene que separar explicitamente estos ejes:

### 1. Nivel material

Lo que existe fisicamente en el laboratorio.

- bits
- bytes
- direcciones
- rango de memoria seleccionado

### 2. Interpretacion

Como leo ese mismo patron.

- `u8`, `u16`, `u32`, `u64`
- `i8`, `i16`, `i32`, `i64`
- `float32`, `float64`
- `raw bytes`

### 3. Notacion

Como escribo o muestro un valor.

- decimal
- hexadecimal
- binario

### 4. Tipo de accion

Que clase de operacion estoy haciendo sobre la memoria.

- escribir bytes crudos
- escribir un valor logico segun una interpretacion
- reinterpretar sin cambiar memoria
- aplicar una operacion aritmetica con ancho fijo
- sobrescribir solo algunos bytes

La regla didactica de la interfaz deberia ser:

**ningun control debe mezclar dos de estos ejes al mismo tiempo**

## Modelo reactivo propuesto

La estructura conceptual minima de la v2 podria ser esta:

```text
memory: byte[]

selection:
  startAddress: 0x00
  lengthBytes: 4

readView:
  interpretation: u32
  endianness: little

editor:
  targetLayer: logical | memory
  notation: decimal | hex | binary

derived:
  selectedBytes
  bitView
  memoryBitSlice8
  unsignedValue
  signedValue
  hexValue
  binaryValue
  floatValue
  asciiPreview
  occupiedAddresses
```

Punto clave:

- `derived` no se guarda como estado canonico
- `derived` se recalcula a partir de `memory + selection + readView`

Eso hace que el laboratorio sea verdaderamente reactivo.

## Unidad conceptual central

La unidad central de la pantalla ya no deberia ser "un valor" sino esta dupla:

- **rango de memoria seleccionado**
- **lectura actual de ese rango**

Eso permite que la persona vea dos cosas al mismo tiempo:

- la memoria material no sabe de tipos
- la persona si decide leerla con una ventana y una interpretacion

## Insight adicional que vale la pena explotar

Hay una idea especialmente potente que la v2 podria hacer visible y que hoy la beta no termina de capturar:

**la misma memoria puede ser interpretada como numero, como bytes crudos o como texto ASCII simple, y escribir un numero en ASCII no es lo mismo que escribir ese numero como valor logico binario**

Ejemplo corto:

- escribir el valor logico `42` como `u32` little endian no produce los bytes `0x34 0x32`
- escribir el texto ASCII `42` si produce esos bytes

Ese contraste vale muchisimo para `L2` porque obliga a separar:

- valor abstracto
- codificacion material
- lectura elegida

La unica condicion es presentarlo con mucho orden. ASCII no deberia entrar como una rareza decorativa ni como una semantica gigante de strings. Deberia aparecer como una **lectura textual simple del mismo dump** y, si se habilita edicion, como una **forma distinta de escribir bytes**.

Decision de diseno para esta iteracion:

- la escritura ASCII no deberia quedar atada al rango seleccionado
- deberia funcionar como un **patch de memoria** con direccion inicial explicita y longitud libre
- la seleccion actual puede seguir mostrando como impacta ese patch en una lectura tipada, pero no deberia gobernar el tamano del texto escrito
- el patch ASCII deberia sobrescribir **exactamente** los bytes del texto ingresado, sin terminador implicito ni relleno automatico

## Layout propuesto

La pantalla deberia sentirse primero como un hexdump interactivo, y despues como un panel de interpretaciones derivadas.

```text
+-----------------------------------------------------------------------------------------------+
| L2 laboratorio v2                                                                             |
| Preset [overflow-u8 v]   Memoria [32 bytes v]   Expandir [+32]   Reset [boton]               |
+-----------------------------------------------------------------------------------------------+
| HEXDUMP / MEMORIA                                     | SELECCION Y LECTURAS                  |
|-------------------------------------------------------+---------------------------------------|
| addr  00 01 02 03 04 05 06 07 08 09 0A 0B ... | ASCII | inicio: 0x04                          |
| 0x00  FF 00 A5 3C 78 56 34 12 00 00 00 00 ... | ..<xV4. | bytes: 4                              |
| 0x10  2C 01 7F 80 CD CC CC 3D 00 00 00 00 ... | ,....=. | ocupa: mem[0x04..0x07]                |
| 0x20  00 00 00 00 00 00 00 00 00 00 00 00 ... | ....... | endian: little                        |
|            ^^ ^^ ^^ ^^                                | ver como: [u32 v]                     |
|            rango seleccionado                         | unsigned: 305419896                   |
|                                                       | signed:   305419896                   |
| vista de 8 bytes como bits alrededor de la seleccion  | hex:      0x12345678                  |
| 0x00  11111111 00000000 10100101 00111100 ...         | bin:      00010010 00110100 ...       |
| click byte -> editar / click bit -> flip              | float32:  no aplica                   |
| click ASCII -> inspeccionar texto simple              | ASCII:    "xV4."                      |
+-------------------------------------------------------+---------------------------------------|
| ESCRIBIR COMO VALOR                                   | ESCRIBIR MEMORIA                      |
|-------------------------------------------------------+---------------------------------------|
| interpretacion de escritura: [u32 v]                  | modo: [byte v] [bit] [patch bytes]    |
| notacion de entrada:        [hex v]                   | byte en 0x05: [56] [aplicar]          |
| entrada:                    [0x12345688 ]             | bits en 0x05: 01010110                |
| [escribir] [sumar] [restar] [zero ext]                | patch ASCII desde 0x04: [xV4.]        |
| etiqueta: accion logica                               | [aplicar patch]                       |
|                                                       | etiqueta: accion material             |
+-------------------------------------------------------+---------------------------------------|
| HISTORIAL                                                                                       |
| - write logical u32, hex 0x12345688 -> mem[0x04..0x07]                                         |
| - patch byte mem[0x05]: 0x56 -> 0x57                                                            |
| - patch ASCII desde mem[0x04]: "AB" -> 41 42                                                  |
| - reinterpret same bytes as i32                                                                 |
+-----------------------------------------------------------------------------------------------+
```

## Flujo de datos que debe quedar claro

```text
          presets / reset / expandir memoria
                        |
                        v
                 +--------------+
                 | memory bytes |
                 +--------------+
         ^    ^     |
         |    |     v
   escribir bytes |  seleccion activa
   o editar bits  |     + endianness
         ^    |     |
         |    |     v
       escribir   |  lecturas derivadas
       valor      |  (u32, i32, hex,
       logico     |   bin, float...)
    (u32, i16...) | 
                        
        escribir texto ASCII simple
```

Si una flecha no termina tocando `memory bytes`, entonces no esta cambiando el estado real sino solo reinterpretando.

ASCII entra exactamente bajo la misma regla que las demas acciones materiales:

- si lo uso solo como columna de lectura, no cambia la memoria
- si escribo texto ASCII, si cambia la memoria
- despues de eso, todas las lecturas numericas deben recalcularse
- el texto se aplica como patch desde una direccion inicial, no como "valor" del rango seleccionado
- el patch no agrega `00`, no borra bytes vecinos y no rellena el resto del rango con nada

## Interacciones que la v2 debe soportar

### A. Escribir un valor logico

Caso:

- selecciono `mem[0x04..0x07]`
- digo "escribi `0x12345678` como `u32` little endian"

Resultado esperado:

- la memoria cambia
- el hexdump muestra los bytes correspondientes
- todas las lecturas derivadas se recalculan
- el historial deja claro que cambie bits, no solo interpretacion

### B. Editar memoria directamente

Caso:

- hago click sobre `mem[0x05]`
- cambio `0x56` por `0xFF`

Resultado esperado:

- no existe ningun "valor logico previo" que quede congelado
- el panel de lecturas muestra inmediatamente el nuevo `u32`, `i32`, `hex` y `bin`
- si la lectura float deja de ser valida o cambia mucho, eso se ve tambien
- la columna ASCII se recalcula tambien, porque sigue siendo otra lectura del mismo dump

### B2. Editar como ASCII

Caso:

- aplico un patch ASCII `ABCD` empezando en `mem[0x04]`

Resultado esperado:

- la memoria pasa a contener `0x41 0x42 0x43 0x44` desde esa direccion en adelante
- el hexdump cambia
- la vista de bits cambia
- cualquier lectura numerica cuyo rango toque esos bytes cambia tambien
- si la seleccion activa cae fuera del patch, la seleccion no se mueve automaticamente
- los bytes posteriores al texto quedan intactos

Leccion didactica esperada:

- escribir `42` como texto ASCII no es lo mismo que escribir `42` como `u16`, `u32` o `u8`
- la memoria solo recibe bytes; la diferencia la pone la codificacion elegida
- un patch ASCII tiene direccion inicial material y longitud libre; no es una asignacion tipada
- si quiero un terminador `00`, deberia escribirlo como otro patch o como otra accion material explicita

### C. Reinterpretar sin escribir

Caso:

- mantengo los mismos bytes
- paso de verlos como `u32` a verlos como `i32`

Resultado esperado:

- la memoria no cambia
- el historial dice explicitamente `mismos bits; nueva interpretacion`

### D. Aritmetica con ancho fijo

Caso:

- selecciono 1, 2, 4 u 8 bytes
- elijo una interpretacion aritmetica
- sumo `0x10` o `15`

Resultado esperado:

- la notacion de entrada puede ser decimal, hex o binario
- la interpretacion aritmetica puede ser `unsigned` o `signed`
- el historial muestra `ideal` y `almacenado`

Ejemplo:

- `sumar 0x10 como unsigned de 8 bits`
- `valor ideal: 0x10F`
- `valor almacenado: 0x0F`
- `se conservaron los 8 bits bajos`

### E. Sobrescritura parcial

Caso:

- tengo un `u32` seleccionado
- escribo un `u16` en el medio del rango

Resultado esperado:

- el hexdump muestra con claridad que solo cambiaron dos bytes
- la lectura grande cambia como consecuencia derivada
- el laboratorio ensena que una escritura local puede alterar una lectura mayor que contiene esos bytes

## Compacto, pero no pequeno

La memoria deberia arrancar chica, pero no minima.

Recomendacion de arranque:

- vista inicial: `32 bytes`
- opcion de crecer a `64`, `128` o `256`
- layout de hexdump en filas de `16 bytes`
- una tira secundaria de `8 bytes` vista a nivel bit alrededor de la seleccion actual

Eso permite que el laboratorio siga siendo compacto pero ya se sienta como memoria real.

No hace falta mostrar miles de bytes. Hace falta mostrar **suficientes bytes para que la seleccion sea un recorte dentro de una memoria mayor**.

## Controles que deberian existir

### Grupo 1: seleccion

- direccion inicial
- cantidad de bytes seleccionados: `1`, `2`, `4`, `8`
- endianness para lecturas multi-byte

### Grupo 2: ver como

- `u8`, `u16`, `u32`, `u64`
- `i8`, `i16`, `i32`, `i64`
- `float32`, `float64`
- `raw bytes`
- `ASCII simple`

### Grupo 3: escribir como valor

- interpretacion de escritura
- notacion de entrada
- campo de entrada
- acciones: escribir, sumar, restar, zero extend, sign extend, truncar

### Grupo 4: editar memoria

- editar un byte puntual
- flipper de bits
- patch de varios bytes consecutivos
- escribir texto ASCII simple como patch desde una direccion inicial

## Sobre la vista ASCII

Me parece una mejora muy fuerte, con una condicion: presentarla como una lectura hermana del dump, no como un reemplazo del eje principal del laboratorio.

Por que suma:

- hace visible de inmediato que el patron material no trae significado pegado
- conecta `L2` con hexdumps reales, archivos y protocolos sin adelantarse demasiado
- deja una escena muy potente: `42` como numero logico frente a `"42"` como bytes ASCII

Por que hay que cuidarla:

- si aparece demasiado pronto o demasiado dominante, puede meter el tema de strings donde el foco todavia es representacion finita
- conviene hablar de `ASCII simple` o `texto simple byte a byte`, no de strings completos ni codificaciones complejas

La mejor version seria:

- columna ASCII en el dump como lectura pasiva
- edicion ASCII habilitada en un panel de memoria, no mezclada con "escribir valor logico"
- campo `direccion inicial` + campo `texto`, con longitud libre y escritura secuencial de bytes
- sin terminador implicito y sin limpieza automatica de bytes sobrantes
- placeholders para bytes no imprimibles, por ejemplo `.`

## Controles que no deberian existir

Para evitar confusion, no conviene volver a caer en esto:

- un combo unico con `hex`, `binary`, `unsigned`, `signed`
- una UI donde la lectura activa y la escritura activa se pisan sin avisar
- una memoria tan corta que se sienta como "el valor" en vez de como un espacio de bytes

## Mockup alternativo aun mas compacto

Si la primera version de la v2 necesita ocupar menos alto, se puede comprimir asi:

```text
+----------------------------------------------------------------------------------+
| dump                                  | seleccion                                |
| 0x00  FF 00 A5 3C 78 56 34 12 ... ..< | mem[0x04..0x07] little endian            |
| 0x10  2C 01 7F 80 CD CC CC 3D ... ,.. | u32: 305419896   i32: 305419896          |
| 0x20  00 00 00 00 00 00 00 00 ... ... | hex: 0x12345678  bin: 00010010...        |
| bits: 01111000 01010110 ...           | ASCII: "xV4."     float32: no aplica    |
+---------------------------------------+------------------------------------------+
| escribir valor                        | editar memoria                            |
| tipo [u32] notacion [hex] [0x10]      | byte [0x05] = [FF]                       |
| [escribir] [sumar] [restar]           | patch ASCII desde [0x04] texto [AB]      |
+----------------------------------------------------------------------------------+
```

## Diferencia didactica clave entre paneles

El laboratorio necesita decir en voz alta desde la propia UI:

- **estoy editando memoria**
- **estoy escribiendo un valor logico**
- **estoy reinterpretando sin cambiar memoria**

Eso se puede reforzar con rotulos, colores o etiquetas cortas en cada accion.

Ejemplos de etiquetas:

- `accion material`
- `accion logica`
- `solo cambia la lectura`
- `texto ASCII simple`

## Escenas que siguen siendo utiles en esta arquitectura

Los presets de la v1 siguen sirviendo, pero sobre este nuevo modelo:

- mismo byte, dos lecturas
- overflow unsigned
- overflow signed
- nibbles y hex
- un valor, cuatro bytes
- little vs big endian
- truncado
- sobrescribir el medio
- zero extend vs sign extend
- float de juguete

La diferencia es que ahora cada preset abre una memoria visible y una seleccion inicial, no solo un valor encapsulado.

## Criterio de exito de esta v2

La v2 esta bien pensada si una persona puede:

- escribir `42` como `u32`, ver como cae en memoria y despues modificar un byte para ver que el valor cambia
- hacer sumas tanto en decimal como en hexadecimal sin cambiar el significado de la operacion
- recorrer una memoria de varias filas y entender que la seleccion es solo una ventana tipada sobre ese dump
- distinguir claramente `notacion`, `interpretacion` y `materialidad`
- ver cuando una accion cambia bits y cuando solo cambia la lectura
- entender por que `42` como texto y `42` como valor logico producen bytes distintos
- entender por que un patch ASCII puede tocar varias direcciones aunque la ventana tipada activa sea otra

## MVP recomendado

Si hubiera que reconstruir el laboratorio desde esta idea sin hacer una reescritura gigante de una sola vez, el orden mas razonable seria:

1. volver canonica a la memoria y derivar desde ahi todas las lecturas
2. reemplazar el buffer de 8 bytes por un hexdump de 32 bytes expandible
3. separar los controles de `ver como`, `escribir como` y `notacion`
4. hacer que la seleccion controle todas las lecturas derivadas
5. habilitar edicion directa de bytes y bits
6. agregar columna ASCII y edicion ASCII simple como otra escritura material del dump
7. recien despues reintroducir aritmetica, extension, truncado e historial enriquecido

## Decision ya tomada en este borrador

Para esta linea de diseno, ASCII queda definido asi:

- lectura: columna textual simple del dump completo
- escritura: patch material con direccion inicial explicita
- longitud: libre, determinada por el texto ingresado
- relacion con la seleccion: indirecta; la seleccion no limita el patch, solo permite ver su efecto en lecturas tipadas
- alcance de escritura: exactamente los bytes del texto, sin padding ni terminador automatico

## Preguntas abiertas para iterar este documento

- conviene que la seleccion sea siempre de `1`, `2`, `4`, `8` bytes, o tambien permitir rangos libres para inspeccion cruda
- la tira de bits de `8 bytes` conviene ser fija alrededor de la seleccion o seguir exactamente el rango seleccionado
- conviene que `float32` y `float64` vivan siempre en `ver como` o solo aparezcan si la seleccion tiene 4 u 8 bytes
- conviene un modo de `watch` con varias lecturas fijas sobre distintas direcciones al mismo tiempo

La idea de este documento no es cerrar esas preguntas ahora, sino mover el laboratorio desde una beta funcional hacia un modelo mas solido y mas fiel al objetivo conceptual de `L2`.