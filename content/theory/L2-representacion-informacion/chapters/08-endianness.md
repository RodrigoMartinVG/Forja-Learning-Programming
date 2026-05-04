# Endianness

## Valores multibyte y orden de bytes

Hasta acá la mayoría de los ejemplos del nivel se hicieron sobre un solo byte. Cuando un valor entra en 8 bits no hay ambigüedad sobre cómo guardarlo en memoria: el byte va a una posición y listo. La situación cambia para valores que ocupan más de un byte —enteros de 16, 32 o 64 bits, floats de 32 o 64 bits, punteros de 64 bits—. Esos valores se almacenan como **secuencias de bytes**, y el orden en que se ubican esos bytes en memoria es una decisión que la arquitectura del procesador toma una sola vez y se respeta consistentemente.

Tomar como ejemplo el entero de 32 bits con valor `0x12345678`. Este valor tiene cuatro bytes:

- el byte más significativo: `0x12`
- el segundo byte: `0x34`
- el tercer byte: `0x56`
- el byte menos significativo: `0x78`

Para almacenarlo en cuatro posiciones consecutivas de memoria —digamos las direcciones 100, 101, 102, 103— hay dos opciones razonables:

- Poner el byte más significativo primero: dirección 100 contiene `0x12`, 101 contiene `0x34`, 102 contiene `0x56`, 103 contiene `0x78`.
- Poner el byte menos significativo primero: dirección 100 contiene `0x78`, 101 contiene `0x56`, 102 contiene `0x34`, 103 contiene `0x12`.

Las dos son coherentes; ninguna es "más natural". La primera respeta el orden de escritura de izquierda a derecha que se usa en hex, y se llama **big-endian**. La segunda invierte ese orden y se llama **little-endian**. Las arquitecturas modernas dominantes —x86, x86-64, ARM en sus modos más comunes, RISC-V— usan little-endian. Algunas viejas arquitecturas —SPARC, PowerPC en su modo nativo, los protocolos de red— usan big-endian. La elección está hecha y no cambia entre ejecuciones del mismo programa: depende solo del procesador.

## Little-endian y big-endian

La tabla siguiente compara cómo se almacena el mismo entero `0x12345678` bajo las dos convenciones, en cuatro bytes consecutivos a partir de la dirección 100:

| Dirección | Big-endian | Little-endian |
|---|---|---|
| 100 | `0x12` | `0x78` |
| 101 | `0x34` | `0x56` |
| 102 | `0x56` | `0x34` |
| 103 | `0x78` | `0x12` |

El valor representado es **el mismo** en los dos casos: 305 419 896 en decimal. Lo que cambia es la disposición física en memoria. Un programa que escribe `0x12345678` en una variable `uint32_t` y otro que la lee en la misma máquina coinciden sin ningún problema, porque ambos usan la misma convención. Los problemas aparecen cuando los bytes cruzan máquinas con convenciones distintas —al transmitirse por red, al leerse de un archivo escrito en otra arquitectura— o cuando el código asume una convención y la opuesta es la activa.

Los nombres "little" y "big" se refieren a qué extremo del valor —el menos significativo o el más significativo— viene primero (en la dirección de memoria más baja). En little-endian, el "extremo chico" viene primero. En big-endian, el "extremo grande" viene primero. Los nombres provienen de un ensayo satírico de Danny Cohen de 1980 que comparaba la disputa entre convenciones con la guerra entre los Lilliputienses por qué punta abrir los huevos cocidos en *Los viajes de Gulliver*. La metáfora cuajó y los términos se quedaron.

## Por qué el dump muestra el orden y la pantalla no

Cuando un programa imprime un entero con `printf("%d", x)` o un equivalente, lo que aparece en pantalla es el valor matemático, escrito con el orden lateral usual de la base elegida. El número 305 419 896 sale como `305419896` en decimal o como `0x12345678` en hex, sin importar la endianness de la máquina. La razón es que `printf` toma el valor entero del registro o de memoria —el procesador lo ensambla automáticamente respetando la convención— y lo convierte a una secuencia de caracteres para imprimir. La conversión no expone los bytes individuales; expone el valor.

El dump hex —`xxd`, `hexdump`, una vista de memoria en un debugger— sí expone los bytes individuales en el orden físico en que están en memoria. Por eso, mirando un dump de una arquitectura little-endian, un entero de 32 bits aparece "al revés" comparado con su escritura en hex:

```text
00000100: 7856 3412                                xV4.
```

Cuatro bytes consecutivos: `0x78`, `0x56`, `0x34`, `0x12`. La columna ASCII muestra `xV4.` porque `0x78` es `x` ASCII, `0x56` es `V`, `0x34` es `4` y `0x12` es un control no imprimible. Reconstruir el valor `0x12345678` requiere invertir el orden de los bytes mentalmente: leer de derecha a izquierda los pares hex, o poner el último byte primero, etc.

La asimetría entre lo que muestra `printf` y lo que muestra el dump es la fuente de confusión más común con endianness. La regla operativa es:

- **`printf` y similares** siempre muestran el **valor**, sin orden de bytes.
- **El dump** siempre muestra los **bytes en orden físico**, que en little-endian aparecen invertidos respecto del valor.

## Endianness en x86-64: little-endian

Las arquitecturas relevantes para todo lo que sigue del track son little-endian. x86-64 es little-endian. ARM en sus modos más comunes es little-endian. RISC-V es little-endian. macOS, Linux y Windows en hardware actual son todos little-endian. La probabilidad de tropezarse con big-endian en una computadora personal moderna es muy baja.

Hay dos ámbitos donde big-endian todavía aparece:

- **Protocolos de red** (TCP/IP, DNS, muchos formatos de aplicación). El orden de bytes "de red" es big-endian, también llamado *network byte order*. Las funciones `htonl`, `htons`, `ntohl`, `ntohs` de C convierten entre endianness de la máquina y endianness de red.
- **Algunos formatos de archivo binarios** (PNG, JPEG, archivos de Java `.class`) que adoptaron big-endian por convención independientemente del hardware.

Para inspección de memoria de un programa local en una computadora moderna, asumir little-endian es razonable. Para leer un dump y reconstruir un valor entero hay que recordar que los bytes están al revés del valor.

Un ejemplo concreto en C, compilado para x86-64:

```c
#include <stdint.h>
#include <stdio.h>

int main(void) {
    uint32_t x = 0x12345678;
    printf("%p: ", (void*)&x);
    unsigned char *p = (unsigned char*)&x;
    for (int i = 0; i < 4; i++) {
        printf("%02x ", p[i]);
    }
    printf("\n");
    return 0;
}
```

La salida típica:

```text
0x7ffd5b3a8c4c: 78 56 34 12
```

Los cuatro bytes consecutivos a partir de la dirección de `x` son `0x78`, `0x56`, `0x34`, `0x12`: little-endian. La dirección concreta cambia entre ejecuciones, pero el orden de los bytes no.

## Cómo se manifiesta el error de endianness

El bug típico de endianness aparece cuando un programa escribe bytes en un archivo o por red asumiendo la convención local, y otro programa los lee asumiendo la convención opuesta. El síntoma observable es un valor "absurdo": demasiado grande, con signo invertido, o simplemente sin relación visible con el valor original.

Un ejemplo. Un programa en una máquina little-endian guarda el entero `0x00000001` en un archivo:

```text
00000000: 0100 0000                                ....
```

Otro programa lee el archivo en una máquina big-endian asumiendo que los bytes están en network byte order (big-endian). Lee los cuatro bytes como `0x01 0x00 0x00 0x00`, los interpreta de izquierda a derecha como big-endian, y reconstruye el valor `0x01000000` = 16 777 216. El valor original era 1; el valor leído es dieciséis millones. El bug se manifiesta como "los números son enormes y no debería". La causa visible es el valor; la causa real es la asunción de orden de bytes.

Un caso más sutil aparece cuando dos programas en la misma máquina —ambos little-endian— se intercambian datos pero uno usa explícitamente `htonl` para convertir a network byte order antes de escribir, y el otro lee directamente sin `ntohl`. Aquí no hay máquinas distintas: hay una conversión de más o de menos. El síntoma es el mismo (valores enormes o invertidos), pero el diagnóstico requiere mirar el código de serialización, no la arquitectura.

La defensa contra estos bugs es **declarar la convención del formato** explícitamente: cualquier formato de archivo o protocolo que use enteros multibyte tiene que especificar en qué orden se almacenan, y los programas tienen que ajustarse a esa convención independientemente de la endianness local. Para representación interna de un solo programa en una sola máquina, la endianness de la arquitectura es la única que importa y no requiere decisión adicional.

Una última nota importante: **la endianness aplica a bytes, no a bits.** Dentro de un byte individual, el orden de los bits no es ambiguo: el bit más significativo es el bit 7, el menos significativo es el bit 0, y eso vale en cualquier arquitectura. La endianness solo entra en juego cuando un valor ocupa varios bytes consecutivos. Confundir las dos cosas —pensar que en little-endian los bits dentro del byte también están al revés— es un error frecuente al empezar.
