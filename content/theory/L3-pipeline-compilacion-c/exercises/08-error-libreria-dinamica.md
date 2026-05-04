# Ejercicio 08 — Provocar error de biblioteca dinámica

## Contexto

Cuando una biblioteca dinámica no se encuentra al cargar el proceso, el error aparece **al ejecutar**, no al compilar ni al enlazar. Distinguir este caso del `undefined reference` (que es de link) es necesario para diagnosticar correctamente.

Este ejercicio requiere construir una biblioteca dinámica propia, igual que en el capítulo de bibliotecas, para poder romper su disponibilidad sin tocar las bibliotecas del sistema.

## Consigna

1. A partir de [`src/split/greet.c`](../src/split/greet.c), construir una biblioteca dinámica `libgreet.so` siguiendo el procedimiento del capítulo 07 (con `-fPIC` y `-shared`).
2. Compilar [`src/split/main.c`](../src/split/main.c) enlazando contra la biblioteca dinámica con `-L. -lgreet`.
3. Verificar con `ldd` que el ejecutable depende de `libgreet.so`.
4. Intentar ejecutarlo sin que `libgreet.so` esté en la ruta de búsqueda. Capturar el mensaje de error.
5. Configurar `LD_LIBRARY_PATH=.` y ejecutarlo de nuevo. Verificar que ahora funciona.
6. Renombrar `libgreet.so` (por ejemplo a `libgreet.so.bak`) y volver a intentar ejecutar con `LD_LIBRARY_PATH=.`. Capturar el nuevo error.

## Resultado esperado

Paso 1–2:

```
$ cd src/split
$ gcc -c -fPIC greet.c -o greet.o
$ gcc -shared greet.o -o libgreet.so
$ gcc main.c -L. -lgreet -o app_dyn
```

Paso 3:

```
$ ldd app_dyn
        ...
        libgreet.so => not found
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (...)
        ...
```

Paso 4:

```
$ ./app_dyn
./app_dyn: error while loading shared libraries: libgreet.so: cannot open shared object file: No such file or directory
```

Paso 5:

```
$ LD_LIBRARY_PATH=. ./app_dyn
hola desde greet.c
```

Paso 6:

```
$ mv libgreet.so libgreet.so.bak
$ LD_LIBRARY_PATH=. ./app_dyn
./app_dyn: error while loading shared libraries: libgreet.so: cannot open shared object file: No such file or directory
$ mv libgreet.so.bak libgreet.so   # restaurar
```

## Verificación

El error de carga aparece en runtime, no en compilación. Confirmarlo:

- Paso 1–2: la compilación y el linking terminan **sin error** aunque `libgreet.so` esté presente.
- Paso 4: el ejecutable existe, pero falla al **arrancar** con un mensaje del dynamic linker.
- Paso 5: cambiando `LD_LIBRARY_PATH` —una variable de entorno— el problema se resuelve sin recompilar.
- Paso 6: si el archivo deja de estar disponible, el error reaparece.

## Criterio de finalización

Se completó cuando se puede distinguir un error de link (`undefined reference`) de un error de carga (`cannot open shared object file`), y se puede explicar:

- En qué etapa del pipeline aparece cada uno.
- Qué se modifica para resolver cada uno (código C / flags de gcc / variables de entorno).

## Error que detecta

Confundir error de carga con error de link. El ejercicio muestra que el ejecutable con error de carga se compiló y enlazó perfectamente: el problema es **dónde está el archivo `.so`**, no qué tiene adentro. Por eso la solución no pasa por gcc sino por configuración de runtime.
