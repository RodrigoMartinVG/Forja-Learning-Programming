# Ejercicio 05 — Provocar y leer "undefined reference"

## Contexto

`undefined reference` es uno de los errores más comunes y más mal diagnosticados del pipeline de C. Se confunde con un error del compilador, pero es del linker: aparece cuando una referencia `U` en un `.o` no encuentra ninguna definición disponible. Provocarlo a propósito permite verlo en condiciones controladas.

## Consigna

1. Crear un archivo `bad.c` con el siguiente contenido:

   ```c
   #include <stdio.h>

   int suma(int a, int b);   // declaración, sin definición

   int main(void) {
       printf("%d\n", suma(2, 3));
       return 0;
   }
   ```

2. Compilar a `.o` con `gcc -c bad.c -o bad.o`. Verificar que el `.o` se produce **sin errores**.
3. Inspeccionar la tabla de símbolos: `nm bad.o`. Localizar `suma` como `U`.
4. Intentar enlazar: `gcc bad.o -o bad`. Capturar el mensaje de error.
5. Crear un archivo `suma.c` que defina la función:

   ```c
   int suma(int a, int b) { return a + b; }
   ```

6. Compilar y enlazar los dos: `gcc bad.c suma.c -o bad`. Verificar que ahora produce un ejecutable funcional.

## Resultado esperado

Paso 2: `bad.o` se produce sin error. El compilador acepta la declaración sin definición; no es su trabajo verificar que `suma` exista.

Paso 3: `nm bad.o` muestra `suma` como `U`:

```text
                 U printf
                 U suma
0000000000000000 T main
```

Paso 4: el linker falla:

```text
$ gcc bad.o -o bad
/usr/bin/ld: bad.o: in function `main':
bad.c:(.text+0x14): undefined reference to `suma'
collect2: error: ld returned 1 exit status
```

Paso 6: con `suma.c` agregado, la compilación va hasta el final y el ejecutable corre:

```text
$ gcc bad.c suma.c -o bad
$ ./bad
5
```

## Verificación

Las tres confirmaciones críticas:

- El compilador (etapa 2) **no se queja** de la falta de definición. Es el linker (etapa 4) el que reporta el error.
- `nm bad.o` muestra `suma` como `U` antes del linking.
- Pasarle `suma.c` (o `suma.o`) al linker resuelve el error sin tocar `bad.c`.

## Criterio de finalización

Se completó cuando se puede explicar por qué el compilador no detecta el problema y por qué el linker sí, y se puede mostrar concretamente la diferencia entre **declaración** (que satisface al compilador) y **definición** (que satisface al linker).

## Error que detecta

Atribuir `undefined reference` al compilador. El ejercicio aísla el problema: el compilador termina sin error, el `.o` queda en disco con una `U`, y el error aparece recién al enlazar. Esto cambia el lugar donde se busca la solución: no es código C que se completa, es organización de archivos y `.o` para el linker.
