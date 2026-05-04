# Ejercicio 12 — Diagnóstico cruzado por etapa

## Contexto

El nivel insiste en que distintos errores nacen en distintas etapas del pipeline, y que confundirlos lleva a buscar la solución en el lugar equivocado. Este ejercicio toma cinco mensajes de error reales y exige clasificarlos: en qué etapa nació cada uno, y qué comando confirmaría la hipótesis.

## Consigna

Para cada uno de los siguientes mensajes de error, determinar:

1. **Etapa del pipeline** donde se origina (preprocesado / compilación / ensamblado / linking / carga).
2. **Comando con el que se confirmaría** que el problema es de esa etapa (y no de otra).
3. **Una causa típica** del error.

Errores:

- **E1**: `fatal error: stdio.h: No such file or directory`
- **E2**: `error: too few arguments to function 'puts'`
- **E3**: `undefined reference to 'cos'`
- **E4**: `error while loading shared libraries: libfoo.so.1: cannot open shared object file`
- **E5**: `multiple definition of 'global_var'; main.o: first defined here`

## Resultado esperado

| Error | Etapa | Comando confirmatorio | Causa típica |
|---|---|---|---|
| E1 | preprocesado | `echo \| gcc -E -v - 2>&1 \| grep include` muestra los paths de búsqueda de headers; falta el directorio donde está `stdio.h` | la toolchain de C no está completamente instalada, o se usó un cross-compiler sin sysroot configurado |
| E2 | compilación | `gcc -E archivo.c \| grep -A1 'puts'` muestra la declaración real que el compilador vio; no coincide con la llamada del código | el código llama a `puts()` sin argumento, o `puts(a, b)` con dos argumentos; bug del programador |
| E3 | linking | `nm archivo.o \| grep cos` muestra `cos` como `U`; falta `-lm` en la invocación de gcc | se usaron funciones de `<math.h>` sin enlazar contra `libm` |
| E4 | carga (no es etapa del pipeline; ocurre al ejecutar) | `ldd ./programa` muestra `libfoo.so.1 => not found` | la biblioteca no está instalada, o no está en el `LD_LIBRARY_PATH` ni en los paths del sistema |
| E5 | linking | `nm archivo1.o archivo2.o \| grep global_var` muestra dos definiciones globales (`D` o `B`) del mismo nombre | el header declaró una variable global sin `extern` y por eso quedó definida en cada `.c` que lo incluye; la solución es declarar `extern` en el header y definir solo en uno de los `.c` |

## Verificación

Para cada error, el comando confirmatorio debe **producir información concreta** que apoye la hipótesis de en qué etapa nació. Si el comando devuelve algo ambiguo, la hipótesis no está bien fundada.

## Criterio de finalización

Se completó cuando los cinco errores tienen su etapa identificada y se puede explicar por qué cada error pertenece a esa etapa y no a otra. En particular:

- E1 vs E3: los dos parecen de "biblioteca", pero E1 es del preprocesador (no encuentra el archivo `stdio.h`) y E3 es del linker (no encuentra el cuerpo de `cos`).
- E3 vs E4: los dos parecen de "biblioteca", pero E3 es de link (la biblioteca no se enlazó) y E4 es de carga (la biblioteca dinámica no se encuentra al arrancar).
- E2 vs E5: los dos parecen "del compilador", pero E2 es del compilador (chequea firmas) y E5 es del linker (chequea unicidad de definiciones).

## Error que detecta

Colapsar todos los errores del build en "no compila". El ejercicio fuerza a separar las etapas y a buscar la solución en el lugar correcto: para E1 y E4, configuración del entorno; para E2, código C; para E3, flags de gcc; para E5, organización de declaraciones en headers.
