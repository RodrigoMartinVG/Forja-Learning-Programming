# Ejercicio 06 — Enlazar varios `.o`

## Contexto

Los programas reales se dividen en varios `.c` que se compilan a `.o` por separado y se enlazan al final. Hacer este flujo a mano —sin automatización— deja claro qué hace cada etapa y cuándo entra cada archivo al pipeline.

## Consigna

Sobre [`src/split/`](../src/split/):

1. Compilar `main.c` a `main.o` con `gcc -c`.
2. Compilar `greet.c` a `greet.o` con `gcc -c`.
3. Inspeccionar las tablas de símbolos de los dos `.o` con `nm` y verificar que las `U` y las `T` se cruzan correctamente.
4. Enlazar los dos `.o` para producir un ejecutable.
5. Ejecutar el ejecutable y verificar la salida.

## Resultado esperado

```
$ cd src/split
$ gcc -c main.c -o main.o
$ gcc -c greet.c -o greet.o
$ nm main.o
                 U greet
0000000000000000 T main
                 U puts
$ nm greet.o
0000000000000000 T greet
$ gcc main.o greet.o -o app
$ ./app
hola desde greet.c
```

(La salida exacta de `nm` puede incluir símbolos adicionales internos según la versión de gcc.)

## Verificación

El cruce de símbolos debe ser:

- `main.o` tiene `greet` como `U`. `greet.o` tiene `greet` como `T`. **Se resuelven entre sí**.
- `main.o` tiene `puts` como `U`. Ninguno de los dos `.o` lo define. **Lo va a resolver el linker contra `libc`**.

Después del linking, `nm app` debe mostrar `main` y `greet` con direcciones definitivas (ambas `T` en posiciones del rango `0x1000`+) y `puts` resuelto contra la biblioteca dinámica.

## Criterio de finalización

Se completó cuando se puede ejecutar la secuencia entera sin errores y explicar:

- Qué etapa del pipeline ejecuta cada `gcc -c`.
- Qué etapa ejecuta `gcc main.o greet.o -o app`.
- Cómo se resolvió cada referencia (a `greet` y a `puts`).

## Error que detecta

Mezclar el flujo manual con el comando único. Quien hace el ejercicio descubre que `gcc main.c greet.c -o app` produce el mismo ejecutable, pero pasa por las cuatro etapas internamente y borra los `.o` al terminar. Hacerlo por etapas deja los `.o` en disco para inspección.
