# Por qué este nivel existe

## El byte sin convención no representa nada

`L1` cerró con un modelo mínimo de máquina: piezas, estado, transiciones, una traza tabular donde cada paso de ejecución es legible. En esa traza, las posiciones de memoria aparecieron siempre con un valor adentro —un número entero, escrito en decimal—, y nada más. Una posición de memoria valía 7, otra valía 40, otra valía `STORE r0, [40]`. La pregunta de *qué clase de cosa* era ese 7 quedó implícita: a veces era un dato numérico, a veces una dirección, a veces un código de instrucción. La trinidad rol/interpretación del [capítulo 02 de `L1`](../../L1-modelo-mental-computadora/chapters/02-memoria.md) ya había avisado que la materia y la lectura son cosas distintas, pero el nivel no entró en cómo esa materia está realmente escrita.

Ahora hay que entrar. En una computadora real, las posiciones de memoria no contienen "el número 7" ni "la instrucción `LOAD r0, [40]`": contienen patrones de bits, agrupados en bytes, y nada más. Para que esos patrones signifiquen algo —un entero, un caracter, una dirección, una instrucción, una fracción decimal— hace falta una **convención de lectura**. Sin convención, un byte es ruido: ocho dígitos binarios, dos dígitos hexadecimales, ningún valor.

Un caso concreto, anticipo del nivel completo. El byte `0xFF` —`11111111` en binario— puede leerse de las siguientes formas, todas legítimas, todas distintas:

- como entero sin signo: vale **255**;
- como entero con signo en complemento a dos: vale **-1**;
- como caracter en Latin-1: vale **`ÿ`**;
- como byte aislado de un archivo UTF-8: es **inválido**, no representa nada por sí solo;
- como un nibble alto de un float: aporta **bits al exponente**, sin un valor independiente;
- como byte dentro de una instrucción x86-64: puede ser **parte del opcode** de una instrucción multi-byte, sin valor numérico autónomo.

Seis lecturas, seis resultados. La materia es una sola: ocho bits encendidos. La pregunta *"¿qué dice este byte?"* no tiene respuesta hasta que se diga *"¿bajo qué convención lo leo?"*.

## Lo que el nivel cambia

`L1` instaló una pregunta: *¿qué hace una computadora cuando ejecuta un programa?*. La respuesta fue un modelo de piezas y transiciones. `L2` instala una pregunta distinta y complementaria: *¿qué clase de cosa son los valores que viven en esas piezas?*. La respuesta del nivel no es una sola: son **varias convenciones de lectura** que se aplican al mismo material físico para producir significados distintos.

La pregunta operativa que la persona que termina `L2` debería poder responder, mirando un dump de bytes, es: *"dado este patrón y esta convención, ¿qué valor representa, y qué pasaría si la convención cambiara?"*. Esa pregunta —patrón más convención produce valor— es la herramienta central del nivel, y va a aparecer una y otra vez en los ejercicios.

Cambia el verbo de la lectura. En `L1` se leía una traza para reconstruir qué pasó. En `L2` se lee un dump para reconstruir qué se está representando. Ambas lecturas son comprobables: si la convención está fijada, el valor es único; si dos personas aplican la misma convención al mismo patrón, llegan al mismo valor.

## Las convenciones que el nivel va a fijar

El recorrido del nivel se organiza por convenciones, no por temas. Cada capítulo introduce una convención y muestra cómo se aplica, qué rango cubre, qué errores produce cuando se confunde con otra:

- **Bit y byte como unidades materiales** (capítulo 01): sin esta base, las demás convenciones flotan.
- **Hexadecimal** (capítulo 02): no es una convención de valor, sino una **escritura compacta** del mismo patrón. Se introduce temprano porque todo lo que sigue se apoya en lectura hex.
- **Entero sin signo** (capítulo 03): la convención más simple. Cada bit pesa una potencia de 2 no negativa.
- **Complemento a dos** (capítulo 04): la convención estándar para enteros con signo. El bit más significativo pesa **negativo**.
- **Overflow y truncado** (capítulo 05): consecuencias inevitables del ancho fijo, comunes a las dos convenciones de entero.
- **ASCII** (capítulo 06): la primera convención de texto. Una tabla de 7 bits que mapea bytes a caracteres del inglés.
- **UTF-8** (capítulo 07): la convención de texto que cubre todo Unicode usando 1 a 4 bytes por caracter.
- **Endianness** (capítulo 08): convención de **orden** de bytes en valores que ocupan más de un byte.
- **Floating point IEEE 754** (capítulo 09): convención para fracciones, con tres campos —signo, exponente, mantisa— y un puñado de casos especiales.

Cada una de estas convenciones es independiente de las otras en el sentido de que se podría reemplazar sin afectar al resto. Hay computadoras big-endian, hubo codificaciones de texto distintas a UTF-8, hay representaciones decimales de coma flotante que no son IEEE 754. Lo que las convenciones de este nivel tienen en común no es ser únicas posibles, sino ser las **convenciones efectivas** del cómputo moderno: las que se va a encontrar quien abra cualquier dump de cualquier sistema en uso.

## El dump hex como herramienta de trabajo

`L1` instaló la **traza tabular** como herramienta de trabajo: una tabla con filas-paso y columnas-pieza. `L2` instala una herramienta complementaria: el **dump hexadecimal**. Un dump hex es una representación tabular de una región de memoria (o de un archivo, que conceptualmente es lo mismo) donde cada byte se muestra como dos dígitos hexadecimales. La herramienta clásica de Linux para producir dumps es `xxd`; otras alternativas son `hexdump` y `od`.

Un dump típico se ve así:

```text
00000000: 4865 6c6c 6f2c 2057 6f72 6c64 210a       Hello, World!.
```

Tres columnas: la dirección (offset) del primer byte de la línea, los bytes en sí escritos en hex, y la lectura ASCII del rango imprimible. Esa última columna es ya una primera convención aplicada —ASCII—, y los capítulos siguientes van a mostrar cómo cambia el contenido visible si se cambia la convención.

Los dumps de este nivel van a venir mayormente en forma de tabla markdown, como en `L1`, pero también van a aparecer dumps reales producidos con `xxd` sobre archivos del laboratorio del repositorio. La continuidad con la herramienta concreta es deliberada: cuando en `L3` aparezcan archivos `.o` y secciones binarias, la herramienta para mirarlos va a ser exactamente esta.

## Lo que el nivel deliberadamente no toca

Algunos temas que la palabra "representación" suele evocar quedan fuera de `L2`, no por accidente:

- **Aritmética binaria detallada de floating point** —cómo se suman dos `float`, qué bits se redondean, qué pasa con la mantisa— queda fuera del track o reaparece en niveles muy avanzados. `L2` se queda en el plano intuitivo: tres campos, un cálculo, casos especiales, comparación frágil.
- **Codificaciones de texto distintas de ASCII y UTF-8** (UTF-16, UTF-32, EBCDIC, Latin-1, Shift-JIS) se mencionan al pasar pero no se desarrollan. UTF-8 cubre la enorme mayoría del cómputo moderno y entender el resto se vuelve fácil después.
- **Representación de instrucciones máquina** —qué bits codifican `ADD r0, 1` en x86-64 real— se posterga a `L7`. En `L2` se habla de instrucciones nominales como en `L1`, sin entrar en su encoding.
- **Alineación, padding, layout de structs** —cuándo el compilador agrega bytes invisibles entre campos— aparece en `L9` y siguientes, cuando el lenguaje C esté instalado.

Estas postergaciones son la condición para que `L2` pueda hacer lo que promete: dejar firme un puñado de convenciones efectivas, manipulables a mano, que después se van a encontrar en cada artefacto binario del resto del track.

## Lo que queda instalado al terminar el nivel

Después de los diez capítulos, la persona que terminó `L2` debería poder mirar un dump hex de bytes y, dada una convención, decir qué valor representa. Si el dump muestra `41 42 43 0A`, decir que como ASCII es la cadena `"ABC\n"`. Si muestra `7F FF FF FF`, decir que como entero sin signo de 32 bits big-endian es `2147483647` y como complemento a dos es el mismo valor —el máximo positivo— y que un bit más en el byte alto produciría overflow al mínimo negativo. Si muestra `3F 80 00 00`, decir que como `float` IEEE 754 vale exactamente `1.0`.

Esa capacidad operativa es la base directa de `L3`, donde van a aparecer secciones binarias de archivos `.o` que solo se entienden con hex, ASCII y endianness en la cabeza, y de `L7`, donde la lectura de operandos inmediatos en assembly real depende de complemento a dos. Lo que `L2` deja firme es exactamente lo que esos niveles van a tratar como base: que un patrón de bits no significa nada por sí mismo, y que toda lectura significativa de memoria viene acompañada, explícita o implícitamente, de una convención.
