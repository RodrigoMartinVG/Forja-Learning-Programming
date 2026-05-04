# Ejercicio 09 — Efecto observable de una flag

## Contexto

El capítulo 08 sostiene que una flag de gcc, para que valga la pena, **modifica algo observable** en uno o más artefactos del pipeline. Si la flag no produce un cambio observable en el programa concreto, no está haciendo nada útil. Este ejercicio aplica esa rutina a una flag específica.

## Consigna

Elegir una de las tres flags siguientes: `-g`, `-O2`, `-Wall`. Para la flag elegida:

1. Compilar el programa de [`src/hello/hello.c`](../src/hello/hello.c) **sin** la flag.
2. Compilar el programa **con** la flag.
3. Comparar los artefactos resultantes y describir la diferencia concreta. Las maneras de comparar dependen de la flag:
   - `-g`: comparar tamaño del `.o` y secciones (`objdump -h`). El `.o` con `-g` tiene secciones `.debug_*` que el sin `-g` no tiene.
   - `-O2`: comparar `.s` (líneas, instrucciones) y `.o` (tamaño, secciones).
   - `-Wall`: ejecutar la compilación sobre un programa que tenga un patrón sospechoso (variable no inicializada, comparación entre signed y unsigned, etc.) y observar si gcc emite warnings con la flag y no sin ella.

## Resultado esperado

Para `-g`:

```
$ gcc -c hello.c -o hello-no-g.o
$ gcc -c -g hello.c -o hello-g.o
$ ls -l hello-no-g.o hello-g.o
-rw-r--r-- 1 user user 1664 ... hello-no-g.o
-rw-r--r-- 1 user user 4504 ... hello-g.o
$ objdump -h hello-g.o | grep debug
  4 .debug_info   ...
  5 .debug_abbrev ...
  6 .debug_line   ...
  7 .debug_str    ...
$ objdump -h hello-no-g.o | grep debug
$
```

(Tamaños y secciones exactas varían; lo importante es que con `-g` el `.o` es más grande y aparecen secciones `.debug_*`.)

Para `-O2`:

```
$ gcc -S hello.c -o hello-O0.s
$ gcc -S -O2 hello.c -o hello-O2.s
$ wc -l hello-O0.s hello-O2.s
  37 hello-O0.s
  31 hello-O2.s
$ diff hello-O0.s hello-O2.s | head
```

(El `diff` debe mostrar diferencias significativas en el cuerpo de `main`.)

Para `-Wall`, como `hello.c` no tiene patrones sospechosos, hay que crear un archivo `bad.c` con código tipo:

```c
int main(void) {
    int x;
    return x;
}
```

```
$ gcc -c bad.c -o bad.o
$
$ gcc -Wall -c bad.c -o bad.o
bad.c: In function 'main':
bad.c:3:12: warning: 'x' is used uninitialized [-Wuninitialized]
    3 |     return x;
      |            ^
```

## Verificación

La flag elegida debe producir un cambio observable. Anotar en una línea **qué cambió** entre los dos artefactos.

## Criterio de finalización

Se completó cuando, mirando los dos artefactos producidos, se puede señalar concretamente qué diferencia introdujo la flag, y se entiende que la respuesta no se puede dar sin haber producido los dos archivos para comparar.

## Error que detecta

Copiar flags de tutoriales sin verificar que tengan efecto. El ejercicio enseña la rutina de **dos compilaciones más comparación**, que es la única manera fiable de saber qué hace una flag desconocida en un programa concreto.
