# Bibliotecas estáticas y dinámicas

## Biblioteca estática como empaquetado de `.o`

Una **biblioteca estática** es un archivo —con extensión `.a` en Linux— que contiene varios `.o` empaquetados juntos, igual que un archivo `.tar`. Cuando el linker enlaza contra una biblioteca estática, **copia adentro del ejecutable** los `.o` cuyos símbolos se necesitan para resolver referencias. La copia es selectiva: si una biblioteca contiene veinte `.o` y el ejecutable solo usa funciones definidas en dos de ellos, los otros dieciocho no entran al binario.

Una biblioteca estática se construye con `ar`, no con gcc:

```
$ ar rcs libgreet.a greet.o
$ ar t libgreet.a
greet.o
```

`ar` ("archive") es la herramienta clásica de Unix para empaquetar `.o` en `.a`. La flag `r` agrega archivos, `c` crea el archivo si no existe, `s` actualiza el índice. El resultado es `libgreet.a`. La convención de nombre es **`lib{nombre}.a`**: el linker, al ver `-lgreet`, busca `libgreet.a` (o `libgreet.so`).

Para enlazar contra `libgreet.a` y producir un ejecutable que ya no dependa del archivo:

```
$ gcc main.o -L. -lgreet -o app_static
$ ldd app_static
        linux-vdso.so.1 (...)
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (...)
        /lib64/ld-linux-x86-64.so.2 (...)
```

`-L.` agrega el directorio actual a la búsqueda de bibliotecas; `-lgreet` le dice al linker que busque `libgreet.{so,a}`. Notar que `libgreet.a` **no aparece** en `ldd app_static`: el código de `greet.o` se copió adentro del ejecutable y la biblioteca dejó de ser una dependencia. Si se borra `libgreet.a` del disco, el ejecutable sigue funcionando.

`libc.so.6` sí aparece en `ldd` porque por defecto `libc` se enlaza dinámicamente, no estáticamente. Para producir un ejecutable verdaderamente estático —sin dependencias de runtime— hace falta la flag `-static`, que se trata más abajo.

## Biblioteca dinámica como dependencia en runtime

Una **biblioteca dinámica** —`.so` en Linux ("shared object")— es un archivo ELF parecido a un ejecutable, pero pensado para que varios programas lo carguen al ejecutarse y compartan su código en memoria. Cuando el linker enlaza contra una biblioteca dinámica, **no copia su código** en el ejecutable: deja en su lugar una referencia que el **dynamic linker** —el componente del sistema operativo que carga procesos— resuelve cuando el proceso arranca.

El ejecutable resultante depende del archivo `.so` en runtime. Si la biblioteca no está disponible al ejecutar el programa, falla con un mensaje del tipo `error while loading shared libraries: libfoo.so.1: cannot open shared object file`.

Para construir una biblioteca dinámica:

```
$ gcc -c -fPIC greet.c -o greet.o
$ gcc -shared greet.o -o libgreet.so
$ file libgreet.so
libgreet.so: ELF 64-bit LSB shared object, x86-64, ...
```

Dos flags importantes:

- `-fPIC` (*Position Independent Code*): le dice al compilador que produzca código que funciona desde cualquier dirección virtual, no solo desde una fija. Las bibliotecas dinámicas necesitan esto porque pueden cargarse en direcciones distintas en cada proceso.
- `-shared`: le dice al linker que produzca un `.so` en lugar de un ejecutable.

Para enlazar contra `libgreet.so`:

```
$ gcc main.o -L. -lgreet -o app_dynamic
$ ldd app_dynamic
        linux-vdso.so.1 (...)
        libgreet.so => not found
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (...)
        /lib64/ld-linux-x86-64.so.2 (...)
```

Acá aparece una primera observación: `ldd` reporta `libgreet.so => not found`. La razón es que el dynamic linker busca bibliotecas en una lista de directorios estándar (`/lib`, `/usr/lib`, etc.) y `libgreet.so` no está en ninguno de esos. El linker de compilación sí la encontró (con `-L.`), pero el dynamic linker tiene su propia búsqueda, que se controla con la variable de entorno `LD_LIBRARY_PATH` o con el RPATH grabado en el ejecutable.

Para correrlo:

```
$ ./app_dynamic
./app_dynamic: error while loading shared libraries: libgreet.so: cannot open shared object file
$ LD_LIBRARY_PATH=. ./app_dynamic
hola desde greet.c
```

La primera invocación falla; la segunda funciona porque `LD_LIBRARY_PATH=.` agrega el directorio actual a la búsqueda. Esto es un error de **carga**, no de **link**: el ejecutable se construyó bien, pero su biblioteca dinámica no está disponible al cargar.

## Tamaño y dependencias resultantes

Comparar los dos ejecutables muestra la diferencia más visible:

```
$ ls -l app_static app_dynamic
-rwxr-xr-x 1 user user 16224 ... app_static
-rwxr-xr-x 1 user user 16104 ... app_dynamic
```

Para un ejemplo tan trivial la diferencia es chica. Si en lugar de `greet` la biblioteca tuviera, digamos, una rutina de procesamiento de imágenes con cientos de KB de código, la diferencia se vuelve significativa: el binario estático crece, el dinámico se mantiene chico pero arrastra una dependencia.

Una comparación más dramática se obtiene con `-static` total:

```
$ gcc -static main.c greet.c -o app_fully_static
$ ls -l app_fully_static
-rwxr-xr-x 1 user user 762144 ... app_fully_static
$ ldd app_fully_static
        not a dynamic executable
```

Casi 800 KB. La razón es que `-static` enlaza también contra `libc` estáticamente, así que el ejecutable contiene una copia de todas las funciones de `libc` que usa (transitivamente, cualquier función que usen las que usa, etc.). El binario es autocontenido: `ldd` reporta "not a dynamic executable" porque no tiene ninguna dependencia. Se puede mover a otra máquina sin instalar nada.

## Cuándo se manifiesta el error en cada modo

Los dos modos producen errores en momentos distintos del ciclo de vida del programa:

- **Estático**: cualquier referencia no resuelta es un **error de link**, en tiempo de compilación. Si el linker no encuentra una función, el ejecutable nunca se construye. Una vez que el ejecutable existe, no puede fallar por una biblioteca faltante.
- **Dinámico**: las referencias que apuntan a bibliotecas dinámicas se resuelven en **dos momentos**:
  - En tiempo de link, el linker verifica que la biblioteca exista y contenga los símbolos necesarios. Si no, falla con `cannot find -lfoo` o similar.
  - En tiempo de **carga** (cuando se ejecuta el programa), el dynamic linker busca el archivo `.so` en los directorios configurados. Si no lo encuentra, el programa falla al arrancar con `cannot open shared object file`.
  - Adicionalmente, hay un tercer modo —**lazy binding**— donde la dirección concreta de cada función se resuelve la primera vez que se llama. Si una biblioteca tiene una función mal exportada, el error puede aparecer mucho después del arranque, en el primer uso.

La consecuencia operativa: **`undefined reference` y `cannot open shared object file` son errores distintos**. El primero es de link (estático o dinámico). El segundo es de carga (solo dinámico). Cambiar el código C no resuelve ninguno de los dos: se resuelven con flags de compilación, instalación de bibliotecas, o variables de entorno.

## Inspección con `ldd` y `nm`

Para diagnosticar problemas de bibliotecas, las herramientas:

- **`ldd`**: lista las dependencias dinámicas de un ejecutable o de un `.so`. Reporta cada biblioteca con la ruta donde se resolvió, o `not found` si el dynamic linker no la encuentra. Solo aplica a binarios con dependencias dinámicas.
- **`nm`**: lista los símbolos. Aplicado a un ejecutable, muestra qué quedó como referencia dinámica (símbolos `U` con la marca de la biblioteca). Aplicado a una `.so`, muestra qué símbolos exporta esa biblioteca (los que un ejecutable puede pedirle).
- **`readelf -d`**: lista la sección `.dynamic` del ejecutable, que tiene metadata de qué bibliotecas y qué símbolos espera. Más detallado que `ldd`.

Una rutina típica de diagnóstico cuando un ejecutable no arranca:

```
$ ./app
./app: error while loading shared libraries: libfoo.so.1: cannot open shared object file
$ ldd app
        ...
        libfoo.so.1 => not found
$ # buscar la biblioteca en el sistema
$ find / -name 'libfoo.so*' 2>/dev/null
$ # si la biblioteca está en una ruta no estándar:
$ LD_LIBRARY_PATH=/ruta/de/la/lib ./app
```

Si la biblioteca aparece en `find` pero no en `LD_LIBRARY_PATH` (o no tiene un symlink `libfoo.so.1` apuntando a ella), el problema se resuelve con configuración de runtime, no recompilando.

## Decidir entre estático y dinámico

La elección entre los dos modos no es una cuestión técnica universal: depende del contexto. Algunos criterios:

- **Distribución**. Si el binario se va a mover entre máquinas que pueden no tener las bibliotecas, estático es más cómodo: corre en cualquier máquina compatible. Dinámico requiere que las dependencias estén instaladas o se distribuyan junto.
- **Tamaño total**. Si varios programas usan la misma biblioteca grande, dinámico ahorra espacio: el código vive una vez y se comparte. Estático multiplica el código por la cantidad de programas.
- **Actualizaciones de seguridad**. Si la biblioteca tiene un parche de seguridad, dinámico permite actualizarla sin recompilar los programas que la usan. Estático obliga a recompilar cada uno.
- **Arranque y memoria**. Dinámico tiene un costo de arranque (el dynamic linker resuelve direcciones) y un costo de memoria por proceso (las tablas de símbolos). Estático arranca más rápido.

En la práctica, los sistemas Linux desktop y server usan dinámico por defecto para la mayor parte del software (incluida `libc`), porque las ventajas de actualización y memoria compartida pesan más. Los sistemas embedded, los binarios distribuidos como un solo archivo (Go, algunos Rust con `musl`), y ciertos contextos de seguridad prefieren estático.

A partir del próximo capítulo, el foco vuelve a las flags del compilador en general: cómo identifican y modifican lo que cada etapa del pipeline produce, más allá del linking.
