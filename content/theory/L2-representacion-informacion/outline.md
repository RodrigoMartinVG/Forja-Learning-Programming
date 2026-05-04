# Outline: L2 - Representación de la información

## Metadatos
- Prerequisitos: `L1`.
- Introducción general recomendada: `content/theory/forja.md` y `content/theory/README.md`.
- Proyectos asociados: ninguno.
- Resultado esperado: una forma operativa de razonar sobre bits, bytes, enteros, texto simple, overflow, hexadecimal, endianness y floating point como representaciones finitas, antes de entrar en compilación real o en un lenguaje concreto.
- Desbloquea: `L3`.

## Objetivo

Que la persona pueda mirar un valor almacenado y dejar de tratarlo como una cantidad abstracta sin forma material. `L2` tiene que volver concreta la idea de que toda información vive como patrones finitos de bits y bytes, y que rango, signo, texto, orden de bytes y precisión dependen de cómo se interpreta ese patrón.

## Preguntas guía

- Qué significa representar información dentro de una máquina finita.
- Por qué un mismo patrón de bits no trae significado pegado de antemano.
- Cómo se leen enteros sin signo y enteros con signo sobre una cantidad fija de bits.
- Qué quiere decir overflow y por qué no es solo “un número muy grande”.
- Por qué hexadecimal es la notación práctica para leer bytes y memoria.
- Cómo los mismos bytes pueden leerse como texto simple y por qué eso no convierte a la memoria en “texto por naturaleza”.
- Qué introduce UTF-8 sobre codificación de longitud variable sin convertir `L2` en teoría general de strings.
- Qué unidad nombra una direccion de memoria y como un valor de varios bytes puede ocupar varias direcciones consecutivas.
- Qué cambia y qué no cambia cuando un valor ocupa varios bytes y aparece endianness.
- Por qué floating point no representa “todos los decimales” de manera exacta.

## Capítulos

### Capítulo 00 - Introducción
**Archivo:** `chapters/00-introduccion.md`
**Objetivo:** ubicar `L2` como continuación directa de `L1` y explicar por qué ahora conviene volver material la idea de dato sin saltar todavía a compilación, assembly o C.
**Secciones:**
- `## Qué agrega L2 al modelo de L1`
- `## Qué significa representar`
- `## Qué cubre`
- `## Qué no cubre y por qué`
- `## Cómo trabajarlo`
- `## El nivel siguiente`

**Notas:** esta introducción debería apoyarse en la distinción de `L1` entre dirección, valor, código y datos. No conviene abrir todavía lógica digital, puertas, ALU ni semánticas específicas de C. La pregunta central no es “cómo se fabrica el hardware”, sino “qué forma material tienen los valores que la máquina guarda y transforma”.

### Capítulo 01 - Bits, bytes y ancho finito
**Archivo:** `chapters/01-bits-bytes-ancho-finito.md`
**Objetivo:** fijar que toda representación en la máquina es finita y que el ancho disponible cambia qué puede representarse.
**Secciones:**
- `## Bit como diferencia mínima`
- `## Byte como unidad práctica`
- `## Una direccion nombra un byte`
- `## El ancho importa`
- `## El mismo patrón no trae significado pegado`
- `## Qué vuelve visible esta capa`

**Notas:** este capítulo debería usar ejemplos pequeños de 8 y 16 bits para que el límite sea visible. No hace falta tratar bits como curiosidad matemática: hace falta que el lector vea que un ancho fijo obliga a elegir qué patrones alcanzan y cuáles no. También conviene fijar desde temprano el modelo base de `L2`: memoria direccionable por bytes. Una direccion avanza de a una unidad porque nombra un byte, no porque cada direccion represente un valor entero completo.

### Capítulo 02 - Enteros sin signo y complemento a dos
**Archivo:** `chapters/02-enteros-y-complemento-a-dos.md`
**Objetivo:** mostrar cómo se interpretan patrones finitos como enteros unsigned y signed, y por qué complemento a dos es la convención útil para negativos.
**Secciones:**
- `## Enteros sin signo: contar patrones`
- `## Signo y rango finito`
- `## Complemento a dos sin folklore`
- `## El mismo byte como signed o unsigned`
- `## Qué intuición conviene retener`

**Notas:** la meta no es demostrar formalmente complemento a dos, sino volverlo legible y operativo. Conviene insistir en que `11111111` no “es” un número por sí mismo: depende de la interpretación elegida.

### Capítulo 03 - Overflow, truncado y límites de representación
**Archivo:** `chapters/03-overflow-y-truncado.md`
**Objetivo:** volver explícito qué pasa cuando el resultado no cabe en el ancho disponible y por qué eso no puede pensarse como una aritmética infinita ideal.
**Secciones:**
- `## Cuando el resultado no cabe`
- `## Overflow sin signo`
- `## Overflow con signo`
- `## Truncado y pérdida de información`
- `## Por qué esto importa antes de C`

**Notas:** este capítulo debería separar con cuidado carry, wraparound, truncado y error conceptual. No hace falta entrar todavía en UB de C ni en promociones de tipos; alcanza con fijar la intuición de límite material y resultado recortado.

### Capítulo 04 - Hexadecimal y lectura humana de bytes
**Archivo:** `chapters/04-hexadecimal-y-bytes.md`
**Objetivo:** introducir hexadecimal como notación de trabajo para leer patrones binarios sin perder relación con los bits y bytes reales.
**Secciones:**
- `## Por qué binario puro no escala`
- `## Nibble y hexadecimal`
- `## Pasar entre binario, hex y decimal`
- `## Leer dumps y tablas sin sufrir`

**Notas:** este capítulo debería dejar claro que hexadecimal no es un tema decorativo: es la manera práctica de trabajar con bytes, direcciones, hexdumps y artefactos binarios en el resto del track.

### Capítulo 05 - Texto como bytes: ASCII y UTF-8
**Archivo:** `chapters/05-texto-como-bytes-ascii-y-utf8.md`
**Objetivo:** mostrar que un mismo byte puede leerse como número o como carácter, y usar UTF-8 como primera intuición de una codificación de longitud variable sin convertir `L2` en teoría de strings.
**Secciones:**
- `## 0x41 no es solo 65`
- `## ASCII como lectura byte a byte`
- `## El mismo bloque como texto y como número`
- `## UTF-8 como codificación de longitud variable`
- `## Qué pasa si corrés el cursor`
- `## Por qué la longitud variable importa tanto`
- `## Qué anticipa y qué no`

**Notas:** este capítulo no debería entrar en `char`, terminadores `NUL`, bibliotecas ni semánticas de lenguajes. ASCII entra como otra lectura del mismo patrón de bytes. UTF-8 entra con más detalle operativo: compatibilidad con ASCII, marcas de longitud, bytes de continuación y sincronización de lectura. También conviene dejar una mención breve a que esta idea de longitud variable reaparece más adelante en algunos encodings de instrucciones y opcodes.

### Capítulo 06 - Endianness y orden de bytes
**Archivo:** `chapters/06-endianness.md`
**Objetivo:** explicar qué significa que un mismo valor multi-byte pueda almacenarse con distinto orden de bytes y cómo aparece eso al inspeccionar memoria.
**Secciones:**
- `## Un valor puede ocupar varias direcciones consecutivas`
- `## Un valor repartido en varios bytes`
- `## Little endian y big endian`
- `## Qué cambia y qué no cambia`
- `## Texto byte a byte y valores multi-byte`
- `## Cómo aparece en memoria`
- `## Por qué esto reaparece más adelante`

**Notas:** este capítulo no debe confundir endianness con orden de bits dentro de un byte. Conviene usar ejemplos de 16 y 32 bits, con tablas de memoria concretas, para que el fenómeno no quede como jerga abstracta. Tambien conviene separar con claridad dos planos: las direcciones crudas de bytes avanzan de a una unidad; una vista tipada de 16 o 32 bits agrupa varias de esas direcciones en un solo valor logico. Tambien conviene contrastar texto simple frente a valores multi-byte: la lectura byte a byte de un texto no plantea el mismo problema que la recomposición de un `u32`.

### Capítulo 07 - Floating point como aproximación finita
**Archivo:** `chapters/07-floating-point-como-aproximacion.md`
**Objetivo:** dar una intuición suficiente de por qué floating point representa aproximaciones finitas, qué tradeoff existe entre rango y precisión y por qué ciertos decimales sorprenden.
**Secciones:**
- `## No todos los reales entran`
- `## Signo, exponente y significando como intuición`
- `## Rango versus precisión`
- `## Por qué 0.1 da sorpresas`
- `## Qué se posterga para más adelante`

**Notas:** este capítulo debería ser austero. No hace falta reconstruir IEEE 754 completo ni cubrir NaN, infinities o rounding modes exhaustivos. Hace falta fijar la idea de aproximación finita y error representacional.

## Ejercicios

- `exercises/01-contar-patrones-y-rangos.md`: completar cuántos valores distintos caben en 8, 16 y 32 bits, y qué rangos aparecen en unsigned y signed.
- `exercises/02-leer-un-mismo-byte-de-dos-maneras.md`: decidir cómo cambia la interpretación de un mismo patrón cuando se lo toma como unsigned o como complemento a dos.
- `exercises/03-predecir-overflow-y-truncado.md`: anticipar resultados cuando una suma, resta o conversión excede el ancho disponible.
- `exercises/04-binario-hex-decimal.md`: pasar entre binario, hexadecimal y decimal sin perder de vista el agrupamiento por nibble y byte.
- `exercises/05-interpretar-un-mismo-bloque-de-bytes.md`: leer un mismo bloque de bytes como texto simple, como valor lógico y como piezas más chicas sin mezclar lectura con almacenamiento.
- `exercises/06-leer-endianness-en-memoria.md`: reconstruir un valor multi-byte mirando tablas de memoria en little endian y big endian, y decidir que rango de direcciones ocupa.
- `exercises/07-flotantes-y-aproximacion.md`: distinguir qué valores decimales son representables de forma exacta en binario finito y cuáles no.

## Decisiones de diseño

- `L2` no es un curso de electrónica digital ni de diseño de CPU; es el nivel donde la representación deja de ser invisible.
- Los ejemplos deben usar anchos fijos pequeños y observables antes de pasar a 32 o 64 bits.
- Hexadecimal debe tratarse como notación de trabajo permanente, no como apéndice opcional.
- Texto entra como reinterpretación de bytes, no como semántica de strings o de lenguajes.
- UTF-8 entra solo como intuición de codificación de longitud variable y de sincronización de lectura; el detalle normativo completo se posterga.
- Endianness debe mostrarse sobre valores repartidos en varios bytes y memoria concreta, no solo como definición verbal.
- El nivel debe volver explicita la diferencia entre cursor por byte y vista tipada de varios bytes, porque esa confusion reaparece despues en punteros, arrays, hexdumps y layout de datos.
- Floating point debe quedar en una intuición fuerte de aproximación finita; el detalle normativo se posterga.
- La semántica específica de C y Rust sobre tipos, casts, promociones, UB o traits no pertenece todavía a `L2`; aparece cuando entren los lenguajes.
- No hay proyecto asociado porque la inspección binaria, la práctica de endianness y la comparación de representaciones siguen viviendo como ejercicios internos del nivel.

## Pieza interactiva grande

- Solapa recomendada: `laboratorio`.
- Documento de diseño: `laboratorio.md`.
- Rol: hacer visible un buffer canonico de bits y bytes y sus distintas interpretaciones sincronizadas, sin convertir `L2` en un curso de electronica ni en un conversor de bases aislado.