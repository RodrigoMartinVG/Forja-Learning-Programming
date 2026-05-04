# Ejercicio 03 — Comparar `.s` con dos niveles de optimización

## Contexto

La flag de optimización (`-O0`, `-O1`, `-O2`, `-O3`) cambia el assembly que el compilador produce. Dos compilaciones del mismo `.c` con flags distintas producen `.s` distintos. El capítulo afirma esto; el ejercicio lo verifica.

## Consigna

Sobre [`src/hello/hello.c`](../src/hello/hello.c):

1. Generar dos `.s`, uno con `-O0` y otro con `-O2`.
2. Comparar tamaños en líneas.
3. Comparar la cantidad de etiquetas (`grep -c ":$"`) y la cantidad de instrucciones de máquina aproximadas (líneas que empiezan con tab/espacio y no son directivas).
4. Identificar visualmente al menos una diferencia entre los dos `.s` (por ejemplo, que `-O2` tiene menos instrucciones en `main`, o que reordena, o que omite un movimiento de stack).

## Resultado esperado

```
$ gcc -S -O0 hello.c -o hello-O0.s
$ gcc -S -O2 hello.c -o hello-O2.s
$ wc -l hello-O0.s hello-O2.s
  37 hello-O0.s
  31 hello-O2.s
$ grep -c ":$" hello-O0.s
6
$ grep -c ":$" hello-O2.s
5
```

(Los números pueden variar según la versión de gcc; lo importante es que **son distintos**.)

Diferencias típicas observables comparando los dos `.s`:

- `-O0` mantiene un prólogo completo de función (`pushq %rbp; movq %rsp, %rbp`) y un epílogo (`popq %rbp; ret`). `-O2` puede omitir el prólogo si la función no usa el frame pointer.
- `-O0` carga la cadena en una variable local; `-O2` la pasa directo al registro de argumento.
- `-O2` incluye anotaciones de optimización adicionales que `-O0` no tiene.

## Verificación

```
$ diff hello-O0.s hello-O2.s | head -50
```

El `diff` debe mostrar diferencias significativas, no triviales. Si los dos archivos fueran iguales, algo está mal: gcc estaría ignorando la flag de optimización.

## Criterio de finalización

Se completó cuando se puede señalar al menos dos diferencias concretas entre los `.s` y se puede explicar por qué una flag de optimización las produce. No hace falta entender qué hace cada instrucción; alcanza con reconocer que el cuerpo de `main` cambió.

## Error que detecta

Suponer que el compilador es determinista y produce el mismo assembly siempre. El ejercicio muestra que el `.s` depende de las flags, y que ese resultado es por elección del optimizador, no por azar.
