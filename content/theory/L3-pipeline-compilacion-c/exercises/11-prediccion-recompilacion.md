# Ejercicio 11 — Predicción de recompilación

## Contexto

`make` regenera selectivamente: rehace solo los targets cuyos prerrequisitos cambiaron. Predecir qué archivos se van a recompilar tras una modificación, sin ejecutar `make`, es la prueba operativa de que el grafo de dependencias está internalizado.

## Consigna

Sobre el Makefile del ejercicio anterior (o equivalentemente sobre [`src/split/Makefile`](../src/split/Makefile)):

1. Asegurarse de que el build está al día (`make` no hace nada).
2. Para cada uno de los siguientes cambios, **predecir antes de ejecutar** qué `.o` se van a regenerar y si `app` se va a reenlazar:
   - **Caso A**: `touch main.c`
   - **Caso B**: `touch greet.c`
   - **Caso C**: `touch greet.h`
   - **Caso D**: tocar el Makefile mismo
3. Ejecutar `touch` y `make` para cada caso, y comparar con la predicción.

## Resultado esperado

Predicciones:

| Caso | `main.o` se regenera | `greet.o` se regenera | `app` se reenlaza |
|---|---|---|---|
| A: `touch main.c` | sí | no | sí |
| B: `touch greet.c` | no | sí | sí |
| C: `touch greet.h` | sí | sí | sí |
| D: `touch Makefile` | no | no | no |

(El caso D es más sutil: el Makefile no aparece como prerrequisito en ninguna regla, así que `make` no lo considera para invalidar. En proyectos serios se suele agregar el Makefile como prerrequisito explícito de los targets para que los cambios de flags fuercen recompilación, pero el Makefile del ejercicio anterior no lo hace.)

Verificaciones:

```
$ make             # asegurar que todo está al día
make: 'app' is up to date.

# Caso A
$ touch main.c
$ make
cc -Wall -Wextra -std=c11 -c main.c -o main.o
cc main.o greet.o -o app

# Caso B
$ touch greet.c
$ make
cc -Wall -Wextra -std=c11 -c greet.c -o greet.o
cc main.o greet.o -o app

# Caso C
$ touch greet.h
$ make
cc -Wall -Wextra -std=c11 -c main.c -o main.o
cc -Wall -Wextra -std=c11 -c greet.c -o greet.o
cc main.o greet.o -o app

# Caso D
$ touch Makefile
$ make
make: 'app' is up to date.
```

## Verificación

Para cada caso, contar los comandos ejecutados por `make` y compararlos con la predicción. Si hay discrepancia, revisar:

- Si `make` recompiló de más, las dependencias declaradas son demasiado amplias.
- Si `make` recompiló de menos, las dependencias declaradas son demasiado angostas (típicamente, falta declarar un header como prerrequisito).

## Criterio de finalización

Se completó cuando las cuatro predicciones coinciden con el comportamiento real, y se puede explicar el caso C en particular: por qué tocar `greet.h` regenera **los dos** `.o` y no solo `greet.o`.

## Error que detecta

Olvidar dependencias de headers. El ejercicio muestra que un header compartido es prerrequisito de **todos** los `.o` que lo incluyen, y que omitir cualquiera de esas dependencias en el Makefile produce builds inconsistentes (donde `main.o` queda al día contra una versión vieja de `greet.h`).
