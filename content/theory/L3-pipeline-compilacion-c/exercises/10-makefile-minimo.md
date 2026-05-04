# Ejercicio 10 — Makefile mínimo

## Contexto

`make` es la herramienta clásica para automatizar el pipeline. Un Makefile pequeño bien escrito vuelve el build reproducible y selectivo: rehace lo que cambió y solo lo que cambió.

[`src/split/Makefile`](../src/split/Makefile) ya existe en el repositorio y sirve como referencia. Este ejercicio replica su construcción desde cero para fijar el mecanismo.

## Consigna

1. En un directorio nuevo, copiar `main.c`, `greet.c` y `greet.h` de [`src/split/`](../src/split/).
2. Escribir un Makefile que produzca un ejecutable llamado `app` a partir de los dos `.c` y el header. El Makefile debe:
   - Definir las variables `CC` y `CFLAGS`.
   - Tener una regla para producir `app` a partir de `main.o` y `greet.o`.
   - Tener una regla por cada `.o`, declarando correctamente sus prerrequisitos (incluido `greet.h`).
   - Tener una regla `clean` que borre los `.o` y el ejecutable.
3. Ejecutar `make` desde estado limpio y registrar la salida.
4. Ejecutar `make` por segunda vez sin tocar nada y verificar que no hace nada.
5. Tocar `greet.c` (con `touch greet.c`) y ejecutar `make` de nuevo. Verificar que solo se recompiló `greet.o` y se reenlazó `app`.

## Resultado esperado

Makefile esperado (igual o equivalente al de `src/split/Makefile`):

```
CC := cc
CFLAGS := -Wall -Wextra -std=c11

app: main.o greet.o
	$(CC) main.o greet.o -o app

main.o: main.c greet.h
	$(CC) $(CFLAGS) -c main.c -o main.o

greet.o: greet.c greet.h
	$(CC) $(CFLAGS) -c greet.c -o greet.o

clean:
	rm -f app main.o greet.o
```

(Las recetas tienen que empezar con un tab, no con espacios.)

Ejecuciones:

```
$ make clean
rm -f app main.o greet.o
$ make
cc -Wall -Wextra -std=c11 -c main.c -o main.o
cc -Wall -Wextra -std=c11 -c greet.c -o greet.o
cc main.o greet.o -o app
$ make
make: 'app' is up to date.
$ touch greet.c
$ make
cc -Wall -Wextra -std=c11 -c greet.c -o greet.o
cc main.o greet.o -o app
```

## Verificación

Las tres condiciones críticas:

- Primera invocación: ejecuta tres comandos (dos `gcc -c` y un `gcc -o`).
- Segunda invocación inmediata: no ejecuta nada.
- Después de `touch greet.c`: ejecuta dos comandos (`gcc -c greet.c` y `gcc -o`), pero **no** `gcc -c main.c` (porque `main.c` no cambió).

Si la tercera condición falla y `make` recompila también `main.o`, hay un problema en el Makefile (probablemente las dependencias no están bien declaradas).

## Criterio de finalización

Se completó cuando las tres invocaciones se comportan exactamente como en el resultado esperado, y se puede explicar por qué `make` regenera lo que regenera y omite lo que omite, en términos de timestamps y prerrequisitos.

## Error que detecta

Declarar mal las dependencias o escribir recetas con espacios en lugar de tabs. Los dos errores son los más típicos al empezar con Makefiles, y los dos se manifiestan de manera identificable: "missing separator" o "no se recompila lo que debería".
