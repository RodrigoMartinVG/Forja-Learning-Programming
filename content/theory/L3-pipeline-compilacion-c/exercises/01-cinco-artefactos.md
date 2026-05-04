# Ejercicio 01 — Producir los cinco artefactos

## Contexto

El nivel insiste en que `gcc hello.c -o hello` es un comando único que esconde un pipeline de cuatro etapas. Para volver el pipeline tangible, hay que pedirle a gcc que se detenga en cada etapa y deje en disco el artefacto correspondiente.

## Consigna

Sobre [`src/hello/hello.c`](../src/hello/hello.c), generar los cinco artefactos del pipeline en disco al mismo tiempo: `hello.c`, `hello.i`, `hello.s`, `hello.o`, `hello`.

Para cada uno, ejecutar `file` y registrar la salida.

## Resultado esperado

Los comandos a ejecutar (desde `src/hello/`):

```
$ gcc -E hello.c -o hello.i
$ gcc -S hello.c -o hello.s
$ gcc -c hello.c -o hello.o
$ gcc hello.c -o hello
```

Después, `ls -l` debe mostrar los cinco archivos:

```
hello
hello.c
hello.i
hello.o
hello.s
```

Y `file` aplicado a cada uno debe identificar el tipo: el `.c` y el `.i` como C source, el `.s` como assembler source, el `.o` como ELF relocatable, el ejecutable como ELF executable (pie executable, dinámicamente enlazado).

## Verificación

```
$ file hello.c hello.i hello.s hello.o hello
```

La salida debe distinguir los cinco tipos. En particular, las dos diferencias críticas son: (a) `.o` es **relocatable**, no ejecutable; (b) el ejecutable es **executable** y reporta dependencias dinámicas.

Adicionalmente:

```
$ ./hello
hola, pipeline
```

debe ejecutar correctamente.

## Criterio de finalización

Se completó cuando los cinco archivos existen, sus tipos se reconocieron mediante `file`, y se puede explicar para cada uno con qué etapa del pipeline corresponde y qué herramienta de inspección sirve para abrirlo.

## Error que detecta

Confundir el comando único `gcc hello.c -o hello` con el pipeline completo. Quien hace el ejercicio descubre que las etapas son cuatro y los artefactos son cinco, no uno.
