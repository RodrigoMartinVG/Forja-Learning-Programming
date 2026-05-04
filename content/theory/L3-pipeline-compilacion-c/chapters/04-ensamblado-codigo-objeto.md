# Ensamblado y código objeto

## Del assembly al `.o`

La tercera etapa del pipeline es el **ensamblado**. Su trabajo es traducir el `.s` —que es texto— a un archivo binario llamado **código objeto**, con extensión `.o` en Linux. La traducción es local: cada instrucción del assembly se convierte en sus bytes correspondientes, cada directiva produce metadatos en el `.o`, cada etiqueta se registra en una tabla. El ensamblador no toma decisiones: traduce simbólico a binario.

La flag `-c` le dice a gcc que se detenga después del ensamblado:

```text
$ gcc -c hello.c -o hello.o
$ file hello.o
hello.o: ELF 64-bit LSB relocatable, x86-64, version 1 (SYSV), not stripped
```

`file` reporta el tipo: ELF 64-bit, x86-64, **relocatable**. Las dos palabras claves son "ELF" y "relocatable". ELF (*Executable and Linkable Format*) es el formato de archivos objeto y ejecutables en Linux. Su estructura interna se abre en detalle en `L4`; en este nivel basta saber que es un formato binario con secciones, una tabla de símbolos y metadata. "Relocatable" significa que el archivo todavía no tiene direcciones definitivas: las referencias a símbolos están registradas pero no resueltas, y las direcciones internas pueden moverse cuando el linker combine este `.o` con otros.

A diferencia del `.s`, el `.o` no se mira con `cat`: hacerlo produce ruido —es binario—. Para inspeccionarlo hay tres herramientas principales: `nm`, `objdump`, `readelf`.

## Secciones del `.o`

Igual que el `.s`, el `.o` está organizado en secciones. La diferencia es que en el `.o` las secciones contienen **bytes binarios**, no texto. Las secciones más comunes:

| Sección | Contenido | Carácter |
|---|---|---|
| `.text` | código de máquina (las instrucciones traducidas) | ejecutable, solo lectura |
| `.data` | datos modificables con valor inicial | solo lectura/escritura |
| `.rodata` | datos de solo lectura (cadenas literales, constantes) | solo lectura |
| `.bss` | datos modificables sin valor inicial | solo lectura/escritura, espacio reservado pero no almacenado |
| `.symtab` | tabla de símbolos | metadata |
| `.strtab` | tabla de strings (nombres de símbolos) | metadata |
| `.rela.text` | relocations sobre `.text` | metadata |
| `.note.*` | información variada (compilador, ABI) | metadata |

Para listar las secciones de un `.o`, `objdump -h`:

```text
$ objdump -h hello.o
hello.o:     file format elf64-x86-64

Sections:
Idx Name          Size      VMA               LMA               File off  Algn
  0 .text         00000018  0000000000000000  0000000000000000  00000040  2**0
                  CONTENTS, ALLOC, LOAD, RELOC, READONLY, CODE
  1 .data         00000000  0000000000000000  0000000000000000  00000058  2**0
                  CONTENTS, ALLOC, LOAD, DATA
  2 .bss          00000000  0000000000000000  0000000000000000  00000058  2**0
                  ALLOC
  3 .rodata       0000000f  0000000000000000  0000000000000000  00000058  2**0
                  CONTENTS, ALLOC, LOAD, READONLY, DATA
  ...
```

Lo más relevante para este nivel:

- `.text` tiene 0x18 = 24 bytes: el código de `main` traducido a instrucciones binarias x86-64.
- `.rodata` tiene 0x0F = 15 bytes: la cadena `"hola, pipeline"` (14 caracteres + el byte 0 final).
- `.data` y `.bss` tienen tamaño 0: el programa no tiene variables globales con valor inicial ni sin valor inicial.
- Las VMA (*Virtual Memory Address*) están todas en cero, porque el `.o` es relocatable: las direcciones definitivas las va a asignar el linker.

Las secciones se pueden volcar también, byte por byte, con `objdump -s` o `xxd`. Para `.rodata`:

```text
$ objdump -s -j .rodata hello.o
Contents of section .rodata:
 0000 686f6c61 2c207069 70656c69 6e6500    hola, pipeline.
```

Quince bytes, exactamente la cadena `hola, pipeline` seguida del byte cero. Las convenciones de `L2` —ASCII, hex, dump tabular— son lo único que hace falta para leerlo. La sección `.text`, en cambio, contiene las instrucciones x86-64 codificadas, que con `objdump -d` se pueden ver como assembly otra vez, esta vez salido del `.o`:

```text
$ objdump -d hello.o
hello.o:     file format elf64-x86-64

Disassembly of section .text:

0000000000000000 <main>:
   0:   f3 0f 1e fa             endbr64
   4:   55                      push   %rbp
   5:   48 89 e5                mov    %rsp,%rbp
   8:   48 8d 05 00 00 00 00    lea    0x0(%rip),%rax
   f:   48 89 c7                mov    %rax,%rdi
  12:   e8 00 00 00 00          call   17 <main+0x17>
  17:   b8 00 00 00 00          mov    $0x0,%eax
  1c:   5d                      pop    %rbp
  1d:   c3                      ret
```

A la izquierda, el offset dentro de `.text`. En el medio, los bytes de la instrucción en hex. A la derecha, la instrucción desensamblada. El `call` en la dirección 0x12 tiene los cuatro bytes del operando en cero (`00 00 00 00`): es una **referencia no resuelta**. El linker va a reemplazar esos cuatro bytes por el offset relativo al `puts` real cuando lo encuentre. Esa es la razón por la cual el `.o` no es ejecutable todavía: las llamadas externas tienen huecos donde irían las direcciones, y los huecos solo se llenan en la etapa de linking.

## La tabla de símbolos como contrato del archivo

La sección `.symtab` —la tabla de símbolos— es la pieza más importante del `.o` para entender el linking. Es la **lista de qué define el archivo y qué necesita** para ensamblarse con otros. La herramienta clásica para leerla es `nm`:

```text
$ nm hello.o
0000000000000000 T main
                 U puts
```

Dos filas, dos columnas relevantes:

- La primera columna es la dirección del símbolo dentro del `.o` (en hex). Para los símbolos definidos, es el offset de su primer byte dentro de su sección. Para los no definidos, está vacía.
- La segunda columna es una **letra de tipo** que clasifica el símbolo.
- La tercera columna es el nombre.

Las letras de `nm` que aparecen en este nivel son:

| Letra | Significado |
|---|---|
| `T` | símbolo definido en la sección `.text` (función global) |
| `t` | igual que `T` pero local al archivo (no exportado) |
| `D` | símbolo definido en `.data` (variable global con valor inicial) |
| `R` | símbolo definido en `.rodata` (constante global) |
| `B` | símbolo definido en `.bss` (variable global sin valor inicial) |
| `U` | símbolo **referenciado pero no definido** en este `.o` |

En `hello.o`:

- `main` es `T`: definido en `.text`. Es la función que se va a exportar al linker.
- `puts` es `U`: referenciado pero no definido. El `call puts@PLT` del `.s` se tradujo a un `call` con dirección hueca y un símbolo `puts` en la tabla con la marca `U`. El linker va a tener que resolverlo.

La tabla de símbolos es lo que el linker mira primero cuando recibe varios `.o`: cruza los símbolos `U` de unos contra los símbolos `T`/`D`/`R`/`B` de otros, y resuelve cada referencia llenando los huecos. El próximo capítulo se concentra en este cruce.

## Por qué un `.o` no es ejecutable todavía

Las dos razones por las cuales un `.o` no se puede ejecutar directamente:

- **Tiene referencias no resueltas**. El `.text` del `.o` contiene `call` con direcciones en cero que el linker tiene que llenar. Si el sistema operativo intentara cargar el `.o` y ejecutarlo, los `call` saltarían a la dirección 0, donde no hay código válido.
- **No tiene una entrada definida**. Un ejecutable tiene un punto de entrada (la dirección donde el SO empieza a ejecutar al cargar el proceso); el `.o` no lo tiene. Lo agrega el linker basado en la convención del lenguaje (en C, el linker busca `main` y arma el código de arranque que lo invoca).

Por estas dos razones, intentar correr un `.o` directamente falla:

```text
$ chmod +x hello.o
$ ./hello.o
bash: ./hello.o: cannot execute binary file: Exec format error
```

El sistema operativo lee el header ELF del `.o`, ve que el tipo es `relocatable` y no `executable`, y rechaza cargarlo como proceso. La diferencia entre los dos tipos es exactamente lo que el linker convierte: de un archivo con huecos a un archivo con todo resuelto y un punto de entrada definido.

## Inspección con `objdump` y `nm`

Para cerrar el capítulo, una rutina mínima de inspección sobre cualquier `.o`:

```bash
$ file hello.o                # confirmar que es ELF relocatable
$ nm hello.o                  # ver la tabla de símbolos
$ objdump -h hello.o          # ver las secciones
$ objdump -d hello.o          # ver el código de .text desensamblado
$ objdump -s -j .rodata hello.o   # ver el contenido de .rodata
```

Con esta secuencia se puede caracterizar cualquier `.o` chico en pocos minutos: qué define, qué necesita, qué secciones tiene, qué hay en cada una. La información alcanza para predecir si un conjunto de `.o` va a enlazar entre sí.

A partir del próximo capítulo, "símbolo" deja de ser una palabra suelta y se vuelve la entidad central de las dos etapas que faltan del pipeline (ensamblado y linking). La diferencia entre símbolo definido y símbolo referenciado, que `nm` ya muestra como `T` vs `U`, es la base de cómo el linker integra varios `.o` en un ejecutable.
