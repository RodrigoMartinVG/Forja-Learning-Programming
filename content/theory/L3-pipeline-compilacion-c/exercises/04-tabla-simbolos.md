# Ejercicio 04 — Leer la tabla de símbolos del `.o`

## Contexto

El `.o` contiene una tabla de símbolos que `nm` muestra. Cada símbolo aparece con una letra de tipo (`T`, `D`, `R`, `B`, `U` y otras) que codifica si está definido o referenciado. Aprender a leer la tabla es un paso necesario para entender el linking.

## Consigna

Sobre [`src/hello/hello.c`](../src/hello/hello.c):

1. Compilar a `.o` (sin enlazar).
2. Ejecutar `nm hello.o`.
3. Para cada símbolo de la salida: clasificarlo como **definido** o **referenciado**, y escribir en una línea cuál es su rol.

## Resultado esperado

```text
$ gcc -c hello.c -o hello.o
$ nm hello.o
0000000000000000 T main
                 U puts
```

Anotación esperada por símbolo:

| Símbolo | Tipo | Clasificación | Rol |
|---|---|---|---|
| `main` | `T` | definido | función principal del programa, exportada al linker |
| `puts` | `U` | referenciado | función externa de `libc` que el linker debe resolver |

(La salida puede incluir uno o dos símbolos adicionales según la versión de gcc, por ejemplo, `_GLOBAL_OFFSET_TABLE_` como `U`. Si aparecen, clasificarlos también.)

## Verificación

Cruzar la clasificación contra el código:

- `main` está definido en `hello.c` (la función arranca con `int main(void) { ... }`). Por eso es `T`.
- `puts` aparece llamada (`puts(GREETING)`) pero no definida. Por eso es `U`.

## Criterio de finalización

Se completó cuando se puede leer cualquier `.o` chico con `nm` y, para cada línea, decir si el símbolo está definido en el archivo o si necesita resolución externa, y por qué.

## Error que detecta

Tratar las `U` como errores. El ejercicio muestra que las `U` son **el estado normal** de un `.o` que llama a funciones de bibliotecas externas: lo que sería un error es que después del linking siguieran apareciendo.
