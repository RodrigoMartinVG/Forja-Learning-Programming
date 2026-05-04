# Introducción

L1 dejó una máquina mínima visible: CPU, registros, memoria, direcciones, instrucciones y programa en ejecución. Eso alcanzó para dejar de hablar como si el código corriera por arte de magia.

L2 agrega otra capa de realidad: los datos que esa máquina guarda no viven como cantidades abstractas sin forma. Viven como patrones finitos de bits y bytes.

Antes de compilación, de assembly real o de un lenguaje concreto, hace falta una idea más simple y más fuerte: un valor dentro de la máquina no es solo “el número que quiero pensar”, sino una representación material con ancho, rango y límites.

> Laboratorio: durante L2 conviene leer la teoría con la solapa `laboratorio` abierta. No reemplaza la lectura, pero sí vuelve visibles el buffer canónico, los bytes, la ventana tipada, el overflow y el orden de bytes mientras el nivel les pone nombre.

## Qué agrega L2 al modelo de L1

En L1 alcanzaba con decir cosas como `mem[40] = 7`, distinguir dirección de valor y seguir cómo cambiaba el estado.

En L2 aparece una pregunta nueva: ¿qué significa exactamente que ahí “haya un 7”? ¿Qué patrón está guardado? ¿Cuántos bits ocupa? ¿Qué otros valores podrían leerse sobre ese mismo patrón si la interpretación cambiara?

Eso agrega varias piezas al modelo:

- los datos tienen una forma finita dentro de la máquina
- el ancho disponible importa
- el mismo patrón no trae significado pegado de antemano
- una dirección de memoria nombra una unidad concreta de almacenamiento
- un valor lógico puede ocupar varios bytes consecutivos, no una sola “celda mágica” indivisible

Esta última intuición conviene fijarla temprano: en el modelo base de L2, la memoria es **direccionable por bytes**. Una dirección avanza de a una unidad porque nombra un byte. Si después querés leer un `u16`, un `u32` o un `u64`, lo que cambia no es la memoria en sí, sino la ventana con la que agrupás varios bytes consecutivos como un solo valor lógico.

## Qué significa representar

Representar no es copiar una idea matemática pura dentro de la máquina sin costo ni límites. Representar es usar un patrón finito para que cierto tipo de lectura sea posible.

Por eso, una misma secuencia de bits puede verse de maneras distintas:

- como entero sin signo
- como entero con signo en complemento a dos
- como texto simple byte a byte
- como bytes escritos en hexadecimal
- como parte de un valor más grande repartido en varias direcciones

La máquina no guarda “sentido” en abstracto. Guarda patrones. El sentido aparece cuando alguien decide cómo leerlos.

Ese punto tiene mucho alcance. Si no queda firme ahora, más adelante es fácil mezclar:

- el valor abstracto que una persona quiere expresar
- el patrón material que realmente queda almacenado
- la interpretación tipada que un lenguaje, una ISA o un formato hacen sobre ese patrón

L2 entra para separar esas tres cosas antes de que el track las vuelva a mezclar en contextos más difíciles.

## Un mismo bloque, varias lecturas

Conviene fijar esa idea con un ejemplo concreto antes de que el nivel avance.

Tomá estos cuatro bytes:

```text
48 6F 6C 61
```

Ese bloque material puede mirarse de varias maneras sin haber cambiado un solo byte.

- como texto ASCII simple, se lee `Hola`
- como cuatro `u8`, se lee `72`, `111`, `108`, `97`
- como bloque hexadecimal, puede escribirse `0x48 0x6F 0x6C 0x61`
- como un valor de `32` bits, ya no alcanza con los bytes: también hace falta decidir la lectura tipada y, más adelante, el endianness

Eso deja una lección útil para todo `L2`.

La memoria no sabe si esos bytes eran un saludo, un entero, parte de un header o un campo de otra estructura. La memoria guarda bytes. La lectura decide qué unidad lógica cree estar viendo arriba de esos bytes.

Ese ejemplo también prepara bien dos ampliaciones del nivel:

- más adelante aparecerá texto como otra interpretación válida del mismo dump
- después aparecerá endianness, donde el problema ya no es solo qué bytes hay, sino cómo se agrupan y en qué orden reconstruyen un valor multi-byte

## Qué cubre

El arco del nivel se organiza en siete bloques:

| Bloque | Para qué entra en L2 |
|---|---|
| Bits, bytes y ancho finito | fijar la materia mínima de la representación y sus límites |
| Enteros unsigned y signed | mostrar que el mismo patrón puede leerse con reglas distintas |
| Overflow y truncado | volver visible qué pasa cuando el resultado no cabe |
| Hexadecimal | dar una notación práctica para leer bytes sin sufrir binario puro |
| Texto como bytes | mostrar que los mismos bytes pueden leerse como texto y abrir una primera intuición de codificación variable |
| Endianness y memoria multi-byte | mostrar cómo un valor grande ocupa varias direcciones y qué orden siguen sus bytes |
| Floating point como aproximación | fijar que no todos los decimales entran exactos en binario finito |

El trabajo del nivel no es “hacer cuentas raras”. Es volver concretas varias distinciones que el resto del track va a necesitar una y otra vez.

## Qué no cubre y por qué

- No cubre electrónica digital en serio. Puertas, flip-flops, ALU y circuitos quedan fuera porque el foco acá no es fabricar la máquina, sino entender cómo representa datos.
- No cubre semántica fina de C o Rust. Casts, promociones, UB, traits o detalles de librerías pertenecen a los niveles de lenguaje.
- No cubre IEEE 754 completo. Hace falta una intuición fuerte de aproximación finita, no una especificación normativa exhaustiva.
- No cubre formatos binarios reales ni artefactos del compilador. Eso entra mejor cuando L3 abra el pipeline y más adelante cuando aparezcan ELF, serialización y object layout.
- No cubre assembly real todavía. La materialidad de los datos conviene fijarla antes de volver a encontrarla dentro de instrucciones, immediatos, memoria y hexdumps en L7.

## Cómo trabajarlo

La regla operativa sigue siendo la misma que en todo Forja: repo abierto en la IDE, devcontainer operativo y lectura siempre pegada al workspace real. La web ayuda a recorrer el plan, pero no reemplaza ese entorno.

Recorrido recomendado:

1. leer este capítulo para fijar el mapa del nivel
2. seguir los capítulos en orden
3. usar ejemplos chicos de 8 y 16 bits antes de saltar a anchos grandes
4. mirar siempre qué patrón exacto hay, no solo qué valor “parece” haber
5. usar el `laboratorio` para comprobar si una diferencia es de bits, de lectura o de rango
6. volver a este capítulo si más adelante algún tema empieza a sentirse como una lista de definiciones sueltas

La pregunta útil durante todo L2 es esta: “¿qué patrón exacto está almacenado, cuántos bytes ocupa y bajo qué lectura estoy diciendo que esto vale lo que vale?”

## El nivel siguiente

Después de L2 viene `L3`, donde el foco deja de estar en la materia de los datos y pasa al recorrido que transforma source en artefactos ejecutables.

L2 deja listo algo importante para ese salto: cuando aparezcan `.o`, ejecutables, bytes en memoria, hexdumps o secciones de un archivo, ya no deberían sonar como materia misteriosa. L2 explica con qué forma material vive la información; L3 empieza a mostrar cómo esa información se produce y se encadena en el pipeline de compilación.

Más adelante también aparecerán herramientas industriales para mirar bytes en serio, como `xxd`, `od`, `objdump`, vistas crudas de debugger y dumps reales de memoria o archivos. `L2` no necesita enseñarlas todavía como herramientas. Necesita dejar lista la alfabetización que hace falta para que, cuando lleguen, no parezcan ruido críptico sino evidencia material legible.