# Overflow y truncado

## Ancho fijo y resultado que no cabe

Los dos capítulos anteriores instalaron las dos convenciones de entero —sin signo y complemento a dos— como lecturas distintas del mismo patrón de bits, cada una con su rango. El rango es una cota dura: en 8 bits sin signo, los valores van de 0 a 255; en 8 bits con signo, de −128 a 127. Cualquier valor matemático fuera de ese intervalo no tiene patrón asignado en ese ancho.

La situación se vuelve problemática cuando una operación aritmética produce un resultado que cae fuera del rango. Sumar 200 y 100 sin signo en 8 bits da 300; el valor 300 no entra. Sumar 100 y 50 con signo en 8 bits da 150; el valor 150 está fuera del rango con signo aunque entre en el rango sin signo. Multiplicar 16 por 16 sin signo en 8 bits da 256; el valor 256 está justo afuera. En todos estos casos, el procesador no puede "agrandar el ancho" ni "guardar el resultado en otra parte": el ancho es una propiedad fija de la operación, declarada por las instrucciones que se están ejecutando.

Lo que sí puede hacer es producir un patrón de bits siguiendo la lógica del sumador, y dejar que el resultado se lea —correctamente o no— bajo la convención del tipo. Ese patrón es lo que el capítulo se propone analizar.

## Truncado como resto módulo $2^n$

La regla operativa, exacta, es la siguiente: una operación aritmética sobre $n$ bits produce el resultado matemático **módulo $2^n$**. Es decir, el resultado se calcula como si el ancho fuera infinito y después se descartan todos los bits por encima del bit $n-1$. Lo que queda es el resto al dividir el resultado matemático por $2^n$.

Para 8 bits, $2^8 = 256$, así que toda operación aritmética se reduce módulo 256. Esto explica todos los casos:

- $200 + 100 = 300$. Como $300 = 256 + 44$, queda $300 \bmod 256 = 44$. El patrón resultante es `00101100` (= 44 sin signo).
- $100 + 50 = 150$. El valor 150 ya entra en 8 bits sin signo, así que $150 \bmod 256 = 150$. El patrón es `10010110`.
- $16 \cdot 16 = 256$. Como $256 = 256 + 0$, queda $256 \bmod 256 = 0$. El patrón es `00000000`.

En los tres casos el procesador hizo exactamente la misma operación —suma binaria, suma binaria, multiplicación binaria— y se quedó con los 8 bits inferiores del resultado. El "se quedó con los 8 bits inferiores" es una manera concreta de decir "tomó el resto módulo $2^n$": son operaciones equivalentes.

## Overflow en aritmética sin signo

En aritmética sin signo, el síntoma del overflow es **envolvimiento**: el resultado parece volver a empezar desde 0. Sumar 1 al máximo (255 en 8 bits) produce 0; sumar 5 a 254 produce 3.

Una tabla con tres operaciones representativas en 8 bits sin signo:

| Operación | Resultado matemático | Mod $2^8$ | Patrón resultante | ¿Hay overflow? |
|---|---|---|---|---|
| 200 + 100 | 300 | 44 | `0x2C` | Sí |
| 100 + 50 | 150 | 150 | `0x96` | No |
| 255 + 1 | 256 | 0 | `0x00` | Sí |

La consecuencia visible más confusa es la tercera: sumar 1 a 255 da 0, no "256 truncado a 256 que parece 256". El patrón es directamente cero, y un programa que dependa de esa suma para detectar el final de un contador puede entrar en bucle infinito sin ninguna otra señal.

Algunas arquitecturas levantan una bandera de hardware (en x86-64 se llama el flag `CF`, *carry flag*) cada vez que ocurre un overflow sin signo. La bandera permite que el código que viene a continuación verifique si el último resultado se envolvió. Pero la bandera es **opcional**: si el código no la consulta, el overflow se manifiesta solo a través del resultado envuelto, sin ningún ruido extra.

## Overflow en complemento a dos

En complemento a dos, el síntoma del overflow es **cambio de signo**: una suma de dos positivos puede dar un negativo, y una suma de dos negativos puede dar un positivo. La aritmética binaria es exactamente la misma que en sin signo —el sumador del procesador no distingue convenciones—, pero el resultado se lee con peso negativo en el bit alto.

En 8 bits con signo, sumar 100 y 50 produce el patrón `10010110`. Ese patrón vale 150 sin signo, pero leído en complemento a dos vale $-128 + 16 + 4 + 2 = -106$. La cuenta no falló: lo que falló es que el resultado matemático (150) cayó fuera del rango con signo (que llega solo hasta 127), y el patrón resultante quedó del lado negativo de la lectura.

Una tabla con tres casos en 8 bits con signo:

| Operación | Resultado mat. | Patrón resultante | Lectura signed | ¿Cambio de signo? |
|---|---|---|---|---|
| 100 + 50 | 150 | `0x96` | −106 | Sí |
| (−128) + (−1) | −129 | `0x7F` | 127 | Sí |
| 100 + 20 | 120 | `0x78` | 120 | No |

El primer caso muestra un overflow positivo: dos operandos positivos suman un valor que se lee negativo. El segundo, un overflow negativo: dos operandos negativos suman un valor que se lee positivo. El tercero está dentro de rango y no hay cambio de signo.

La regla para detectar overflow con signo a la vista del patrón es: si los dos operandos tienen el mismo signo y el resultado tiene signo opuesto, hubo overflow. Si los operandos tienen signos distintos, no puede haber overflow con signo (la suma "achica" en lugar de agrandar). Esta regla es la que usan los procesadores para mantener un flag de overflow con signo (`OF` en x86-64) separado del flag de carry sin signo.

## Síntomas observables

La diferencia más importante entre los dos overflow es **qué señal observable produce cada uno**:

- **Sin signo**: el valor envuelve. La señal es un valor inesperadamente bajo donde se esperaba uno alto.
- **Con signo**: el valor cambia de signo. La señal es un valor negativo donde se esperaba uno positivo, o viceversa.

Un mismo patrón resultante puede ser una de las dos cosas según el tipo de la variable que lo recibe. El byte `0x96` —resultado de muchas de las operaciones anteriores— vale 150 en `uint8_t` y vale −106 en `int8_t`. La operación binaria es la misma; el síntoma es distinto.

El truncado, una operación aparentemente trivial, también es un overflow: cuando un valor de 32 bits se asigna a una variable de 8 bits, los 24 bits altos se descartan, lo cual es exactamente "tomar el resultado módulo $2^8$". Si el valor original entraba en 8 bits, no hay cambio observable. Si no entraba, los bits altos perdidos pueden producir cualquier patrón en los 8 bits inferiores, sin relación visible con el valor original. Esto se manifiesta en C cuando se asigna un `int` a un `char` o cuando una conversión implícita reduce el ancho de un valor que ya no cabe.

## Cómo aparece esto en debugging real

Tres patrones de bug típicos asociados a overflow:

- **Contador que nunca alcanza la meta.** Un loop incrementa un contador `uint8_t` y lo compara con un límite mayor a 255. La comparación nunca es verdadera porque el contador, al pasar 255, vuelve a 0 antes de superar el límite. El bucle se vuelve infinito o se corta solo cuando otra condición lo termina.
- **Valor negativo donde "no debería".** Una variable `int32_t` recibe el resultado de una multiplicación de dos `int32_t` positivos, y el resultado matemático supera $2^{31} - 1$. El patrón aparece como un valor negativo grande. Es un cambio de signo, no un valor "raro".
- **Tamaño que parece enorme.** Una resta de tipos `size_t` (sin signo, 64 bits) produce un valor menor que cero, que se envuelve a un valor cercano a $2^{64}$. Si ese valor se usa como tamaño para alocar memoria, el programa intenta pedir terabytes y termina abruptamente. La causa visible es la alocación, pero la causa real es la resta.

Los tres bugs comparten estructura: un valor matemático que no entra en el ancho disponible, un patrón resultante producido por aritmética modular, y una lectura sintomática del patrón bajo la convención del tipo. La primera defensa contra ellos no es un detector mágico —los compiladores ofrecen *sanitizers* que ayudan, pero no son universales—: es internalizar que toda operación aritmética en una computadora es modular, y planear los anchos en consecuencia.

A partir del próximo capítulo, los enteros como tales se dejan atrás: las convenciones que vienen —ASCII, UTF-8, endianness, IEEE 754— se apoyan en otras lecturas del mismo material. Pero el principio que este capítulo deja instalado —"toda operación es módulo $2^n$, y el síntoma depende de la convención"— reaparece cada vez que un programa real se comporta diferente de lo que la aritmética de pizarra predice.
