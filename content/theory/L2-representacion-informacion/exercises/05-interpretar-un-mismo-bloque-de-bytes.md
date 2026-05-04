# Interpretar un mismo bloque de bytes

Este ejercicio hace explícita una idea central de `L2`: el mismo bloque material puede sostener varias lecturas distintas sin que la memoria haya cambiado.

No alcanza con “traducir” bytes a símbolos o números. Acá conviene obligarse a separar cuatro planos:

- qué bytes exactos hay
- bajo qué convención los estás leyendo
- cuántos bytes consume cada unidad lógica
- desde qué byte estás empezando a decodificar

> Laboratorio: recorré primero la escena `ASCII vs valor logico` y después la escena `UTF-8 y bytes de continuacion`. La pregunta útil no es “cuál lectura es la verdadera”, sino “qué bytes exactos hay y qué reglas estoy usando para reconstruir una unidad lógica sobre ellos”.

## Caso A

En memoria aparece este bloque:

```text
0x20: 48 6F 6C 61
```

Completá:

- lectura ASCII simple: `?`
- lectura como cuatro `u8`: `?`, `?`, `?`, `?`
- lectura como `u32` en **big endian**: `?`
- lectura como `u32` en **little endian**: `?`
- si lo separás en dos `u16` big endian, obtenés `?` y `?`
- ¿cambió la memoria entre esas lecturas? `sí / no`

## Caso B

Ahora aparece este bloque:

```text
0x28: 34 32 2A 00
```

Completá:

- los bytes `34 32` como ASCII simple se leen `?`
- los bytes `2A 00` como `u16` en little endian valen `?`
- los bytes `34 32` como `u16` en little endian valen `?`
- ¿qué distinción deja visible este bloque entre “texto `42`” y “valor lógico `42`”? escribila en una oración breve

## Caso C

Ahora aparece este bloque:

```text
0x30: 48 6F 6C 61 20 63 61 66 C3 A9
```

Completá:

- lectura UTF-8 desde `mem[0x30]`: `?`
- ¿qué bytes del bloque empiezan con `0` y por eso pueden leerse como ASCII directo? listalos
- el byte `C3` empieza con `110`. ¿Qué sugiere eso sobre la longitud de la secuencia que abre? `?`
- el byte `A9` empieza con `10`. ¿Es byte de comienzo o de continuación? `?`
- el último carácter del bloque ocupa `?` bytes
- si empezás a leer justo en el segundo byte de ese último carácter, ¿seguís entrando por el comienzo correcto de la misma unidad lógica? `sí / no`

## Caso D

Tomá ahora esta secuencia:

```text
0x40: 41 C3 B1 E2 82 AC
```

Completá:

- `41` representa `?` y ocupa `?` byte(s)
- `C3 B1` representa `?` y ocupa `?` byte(s)
- `E2 82 AC` representa `?` y ocupa `?` byte(s)
- ¿qué bytes son comienzo de una secuencia y cuáles son bytes de continuación?
- escribí en una frase corta qué idea general de decodificación deja preparada esto para más adelante, cuando aparezcan opcodes o instrucciones de longitud variable

La pregunta final no es solo traducir bytes a símbolos. La pregunta es distinguir cuándo estás leyendo byte a byte, cuándo estás reconstruyendo un valor multi-byte y cuándo una codificación de longitud variable deja de tener sentido si corrés el cursor al lugar equivocado. Ese mismo tipo de cuidado vuelve a aparecer más adelante cuando un flujo de bytes deja de representar texto y pasa a representar instrucciones u otras unidades lógicas de tamaño variable.