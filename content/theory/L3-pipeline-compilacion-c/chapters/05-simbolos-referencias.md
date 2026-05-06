# Símbolos y referencias no resueltas

## Definir y referenciar son cosas distintas

El `.o` que produce el ensamblador tiene una tabla de símbolos donde cada nombre aparece con un código que dice qué rol cumple en ese archivo. La distinción central, sobre la que se apoya todo el linking, es entre **definir** un símbolo y **referenciarlo**.

Un símbolo está **definido** en un `.o` si el archivo contiene su cuerpo: el código de la función, el valor de la variable, la cadena literal. Definir significa "acá vive". Un símbolo está **referenciado** si el archivo lo nombra pero no lo contiene: usa el nombre, asume que vive en otro lado, y deja un hueco para que el linker llene la dirección. Referenciar significa "necesito esto, pero no lo tengo".

Un mismo símbolo puede ser definido en un `.o` y referenciado en otros. Lo que el linker hace es **cruzar** las dos listas: para cada referencia, busca una definición correspondiente entre los `.o` y bibliotecas que recibió, y conecta los dos puntos.

Sobre [`src/split/`](../src/split/), que tiene dos `.c`:

- [`main.c`](../src/split/main.c) llama a `greet()` pero no la define: en su `.o` aparece como `U` (referenciada).
- [`greet.c`](../src/split/greet.c) define la función `greet()`: en su `.o` aparece como `T` (definida en `.text`).

Cuando el linker recibe los dos `.o`, cruza la `U` de `main.o` con la `T` de `greet.o`, llena el hueco del `call greet` en `main.o` con la dirección correspondiente, y el resultado es un ejecutable consistente.

## Los códigos de `nm` que importan en este nivel

`nm` lista los símbolos de un `.o` con una letra que codifica tipo y procedencia. Las relevantes para este nivel:

| Letra | Significado | Equivalente conceptual |
|---|---|---|
| `T` | definido en `.text`, global (exportado) | función exportada |
| `t` | definido en `.text`, local | función `static` (no exportada) |
| `D` | definido en `.data`, global | variable global con valor inicial |
| `d` | definido en `.data`, local | variable global `static` con valor inicial |
| `R` | definido en `.rodata`, global | constante global de solo lectura |
| `B` | definido en `.bss`, global | variable global sin valor inicial |
| `b` | definido en `.bss`, local | variable global `static` sin valor inicial |
| `U` | referenciado pero **no definido** en este `.o` | símbolo a resolver por el linker |
| `W` | weak symbol | definición que puede ser sobrescrita |

La regla: **mayúsculas son globales (exportadas), minúsculas son locales (no exportadas)**. Una función `static int foo(void)` aparece como `t`; sin `static`, aparece como `T`. La diferencia no afecta el comportamiento dentro del archivo, pero sí afecta lo que el linker puede ver: los símbolos minúscula no participan del cruce con otros `.o`.

Para el `hello.o` del capítulo anterior, `nm` reporta:

```text
$ nm hello.o
0000000000000000 T main
                 U puts
```

Una `T` (`main`, definida) y una `U` (`puts`, referenciada). La `U` no es un error: es el estado normal de un `.o` que llama a funciones de bibliotecas externas. Lo que sería error es que después del linking siguiera siendo `U`.

Para el split, después de `gcc -c main.c -o main.o` y `gcc -c greet.c -o greet.o`:

```text
$ nm main.o
0000000000000000 T main
                 U greet
                 U puts
$ nm greet.o
0000000000000000 T greet
                 U greet           # <-- este caso no aparece, ver nota
0000000000000000 R .rodata
```

(La última línea aparece según la versión de gcc: a veces lista la cadena literal como símbolo local, a veces no.)

`main.o` define `main` y referencia `greet` y `puts`. `greet.o` define `greet`. Cruzando las listas: `greet` se resuelve dentro de los dos `.o` que el usuario controla; `puts` queda pendiente y se va a resolver al enlazar contra `libc`.

## Por qué quedan referencias sin resolver al final del `.c`

La pregunta legítima es: si el preprocesador ya pegó `<stdio.h>` y el compilador vio la declaración de `puts`, ¿por qué `puts` queda como `U` en el `.o`?

La respuesta es que **declaración y definición son cosas distintas**. La declaración —la línea que aparece en `<stdio.h>`— le dice al compilador qué firma tiene `puts`: que toma un `const char *` y devuelve `int`. Con esa información, el compilador puede generar el código que llama a `puts` correctamente: pone el argumento en el registro adecuado, espera el resultado en el registro de retorno, sabe cuántos bytes ocupa el valor devuelto. Nada de eso requiere saber **dónde está** el cuerpo de `puts`.

La definición —el cuerpo de la función, el código que imprime la línea— vive en `libc`, una biblioteca distinta del archivo del usuario. El `.c` del usuario nunca contiene el cuerpo de `puts`. El compilador genera un `call puts` con dirección hueca, marca `puts` como referencia en la tabla de símbolos, y el linker se encarga de resolver la dirección contra `libc` en una etapa posterior.

Esta separación es la que permite que `printf`, `puts`, `malloc`, `free` y todas las funciones de la biblioteca estándar de C estén "disponibles" sin que cada `.c` tenga que incluir el código de cada una. El programador escribe el `#include` para que el compilador conozca las firmas; las definiciones reales viven en `libc.so` (o `libc.a`) y el linker las conecta cuando construye el ejecutable.

## El error "undefined reference" como síntoma

Cuando el linker no encuentra una definición para una referencia `U`, falla con un mensaje del tipo:

```text
$ gcc main.o -o app
/usr/bin/ld: main.o: in function `main':
main.c:(.text+0x12): undefined reference to `greet'
collect2: error: ld returned 1 exit status
```

El mensaje tiene tres líneas que dicen cosas distintas:

- La primera identifica el archivo objeto donde está la referencia (`main.o`) y la función dentro de ese archivo (`main`).
- La segunda da el offset dentro de `.text` (`0x12`) y el nombre del símbolo no resuelto (`greet`).
- La tercera es del wrapper de gcc (`collect2`) reportando que `ld` —el linker— retornó error.

Lo que el mensaje **no** dice es de qué `.c` se queja: dice de qué `.o`. La distinción es importante porque la causa habitual de este error no es del archivo donde está la referencia, sino del archivo donde **debería estar la definición** y no llegó. En el caso del split: si se invoca `gcc main.o -o app` sin pasar también `greet.o`, el linker ve `main.o` con `greet` como `U` y no tiene a dónde ir a buscarla. La solución es agregar `greet.o`:

```text
$ gcc main.o greet.o -o app
$ ./app
hola desde greet.c
```

Otra causa típica: la función está definida pero con un nombre ligeramente distinto —un typo, una diferencia de mayúsculas, una macro mal expandida que pegó otro nombre—. El linker no detecta similitudes: si busca `greet` y encuentra `Greet`, son símbolos distintos para él y la referencia queda sin resolver.

## Símbolos locales y símbolos globales

La distinción entre mayúscula (global) y minúscula (local) en `nm` corresponde a una distinción de C: una función o variable declarada `static` en un `.c` queda como local al archivo, y no aparece como `T`/`D`/`R` exportable sino como `t`/`d`/`r`. El linker no la ve.

Esto tiene dos consecuencias prácticas:

- **Encapsulamiento sin namespaces**. C no tiene namespaces, pero `static` cumple un rol similar: una función `static foo` en `archivo1.c` no choca con una función `static foo` en `archivo2.c` porque ninguna de las dos es visible para el linker. Las dos coexisten sin conflicto.
- **Detección temprana de funciones no usadas**. Si una función está declarada `static` y no se llama desde el archivo, gcc puede emitir un warning (con `-Wall`) o incluso eliminarla en optimización. Si fuera global, el linker tendría que conservarla por si algún otro `.o` la llama, aunque ninguno lo haga. La decisión de hacer una función `static` o no hacerla es una decisión sobre **a qué linker está dirigida la información**.

El opuesto del conflicto es **double definition**: si dos `.o` definen un símbolo global con el mismo nombre, el linker no sabe cuál elegir y falla con un mensaje del tipo `multiple definition of 'foo'`. La defensa es hacer locales (con `static`) las funciones que no se quieren exportar; lo que queda global es lo que forma parte del contrato del archivo.

## Predecir si dos `.o` enlazan

Con `nm` y la regla del cruce, mirar dos `.o` antes de intentar enlazarlos es directo. El procedimiento:

1. Listar los símbolos `U` de cada `.o`.
2. Listar los símbolos `T`/`D`/`R`/`B` de cada `.o` (las definiciones globales).
3. Para cada `U`, verificar si hay una definición global correspondiente en alguno de los `.o`.
4. Las `U` que no se cruzan con ninguna definición van a quedar pendientes para bibliotecas externas (`libc`, etc.). Si no hay biblioteca que las cubra, el linking va a fallar.

Aplicado al split:

- `main.o`: U = {`greet`, `puts`}, T = {`main`}.
- `greet.o`: U = {} (o solo metadata interna), T = {`greet`}.

`greet` cruza dentro del par. `puts` no cruza —ningún archivo del usuario la define— pero gcc por defecto enlaza contra `libc`, que la define. Resultado: enlazar `main.o greet.o` debería producir un ejecutable funcional, sin warnings ni errores.

Esta capacidad —**leer un `nm` y predecir el resultado del linking**— es lo que el capítulo busca dejar instalado. El próximo capítulo entra al linker en sí y muestra el cruce desde la perspectiva del programa que lo hace.
