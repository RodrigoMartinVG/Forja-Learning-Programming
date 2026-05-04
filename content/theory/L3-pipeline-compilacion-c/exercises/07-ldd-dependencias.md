# Ejercicio 07 — Inspeccionar dependencias dinámicas

## Contexto

`ldd` lista las bibliotecas dinámicas de las que un ejecutable depende en runtime. Conocer esa lista es básico: sin las bibliotecas correctas en el sistema, el ejecutable no arranca, aunque haya compilado y enlazado bien.

## Consigna

1. Producir un ejecutable a partir de [`src/hello/hello.c`](../src/hello/hello.c) con `gcc hello.c -o hello`.
2. Ejecutar `ldd hello` y registrar cada entrada de la salida.
3. Para cada entrada, describir qué biblioteca es y qué función cumple en el programa.
4. Para una de las bibliotecas, verificar que el archivo existe en la ruta reportada.

## Resultado esperado

```text
$ gcc hello.c -o hello
$ ldd hello
        linux-vdso.so.1 (0x00007ffd...)
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f...)
        /lib64/ld-linux-x86-64.so.2 (0x00007f...)
```

Descripción esperada por línea:

| Entrada | Qué es | Función |
|---|---|---|
| `linux-vdso.so.1` | una "biblioteca" virtual provista por el kernel | aporta llamadas al sistema rápidas (`gettimeofday`, etc.) sin entrar al kernel formalmente; no corresponde a un archivo en disco |
| `libc.so.6` | la biblioteca estándar de C | define `puts`, `printf`, `malloc`, y la mayoría de las funciones que un programa C usa habitualmente |
| `ld-linux-x86-64.so.2` | el dynamic linker / loader | el componente que el kernel invoca al ejecutar el programa para resolver las dependencias dinámicas y mapear las bibliotecas en memoria |

Verificación de existencia:

```text
$ ls -l /lib/x86_64-linux-gnu/libc.so.6
lrwxrwxrwx 1 root root 12 ... /lib/x86_64-linux-gnu/libc.so.6 -> libc-2.31.so
```

(El path y el target del symlink dependen de la distribución.)

## Verificación

`ldd` debe reportar al menos `libc.so.6` y `ld-linux-x86-64.so.2`. Si el sistema reporta `not found` para alguna de estas, hay un problema serio de instalación: resolverlo antes de continuar con el nivel.

## Criterio de finalización

Se completó cuando se puede mirar la salida de `ldd` sobre cualquier ejecutable simple y explicar el rol de cada dependencia, y cuando se entiende que el ejecutable **no es autosuficiente**: depende de archivos en el sistema para arrancar.

## Error que detecta

Suponer que el ejecutable contiene todo lo que necesita. El ejercicio muestra que un programa C trivial depende de al menos dos archivos externos al ejecutable, y que el sistema operativo los carga automáticamente al arrancar el proceso.
