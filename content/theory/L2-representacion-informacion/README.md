# L2 - Representación de la información

> README editorial del nivel.
>
> Este archivo fija alcance, estructura y estado de trabajo de `L2`. No reemplaza capítulos, ejercicios ni la solapa `laboratorio`: sirve para mantener continuidad curricular dentro del repo.
>
> Diseño curricular -> `docs/forja-contenido.md`
> Introducción general -> `content/theory/README.md`
> Outline del nivel -> `outline.md`
> Diseño del laboratorio interactivo -> `laboratorio.md`

## Estado editorial

- Objetivo del nivel: fijar una forma operativa de pensar bits, bytes, ancho finito, enteros, texto simple, hexadecimal, endianness y floating point como representaciones materiales antes de abrir compilación real, assembly o formatos binarios más pesados.
- Proyecto asociado: ninguno.
- Estado actual: `outline.md`, los capítulos `00` a `09`, los ejercicios `01` a `11` y una primera versión del laboratorio con hexdump, lecturas derivadas, patches materiales y escenas curriculares ya existen y forman una base navegable del nivel.
- Nota de alcance: `L2` no busca agotar Unicode, IEEE 754 ni herramientas industriales completas. Busca dejar firme la alfabetización que después reaparece en hexdumps reales, `xxd`, `od`, `objdump`, vistas de debugger y artefactos del pipeline.

## Prerequisitos

- L1

## Proyectos asociados

- Sin proyectos asociados todavía.

## Capítulos del nivel

| Archivo | Título | Nota |
|---|---|---|
| `chapters/00-introduccion.md` | Por qué este nivel existe | Instala la pregunta operativa: patrón más convención produce valor. |
| `chapters/01-bits-bytes-ancho.md` | Bit, byte y ancho finito | Fija las unidades materiales y el ancho como cota dura. |
| `chapters/02-hexadecimal.md` | Hexadecimal como apoyo de lectura | Introduce hex como escritura compacta del mismo patrón. |
| `chapters/03-enteros-sin-signo.md` | Enteros sin signo | Convención posicional binaria con pesos no negativos. |
| `chapters/04-complemento-a-dos.md` | Complemento a dos | Convención con signo: el bit alto pesa negativo. |
| `chapters/05-overflow-truncado.md` | Overflow y truncado | Aritmética módulo $2^n$ y dos síntomas distintos según convención. |
| `chapters/06-texto-ascii.md` | Texto como bytes: ASCII | Tabla de 7 bits, caracteres de control, cadenas terminadas en cero. |
| `chapters/07-utf8.md` | UTF-8 y codificación de longitud variable | Code points, esquema de cabeceras y compatibilidad con ASCII. |
| `chapters/08-endianness.md` | Endianness | Orden de bytes en valores multibyte; little-endian dominante. |
| `chapters/09-floating-point.md` | Floating point como aproximación finita | Formato IEEE 754, casos especiales, fragilidad de la igualdad. |

## Ejercicios del nivel

| Archivo | Título | Nota |
|---|---|---|
| `exercises/01-conversiones.md` | Conversiones binario / hex / decimal sin signo | Pasar entre las tres notaciones a mano. |
| `exercises/02-lectura-dual.md` | Lectura del mismo byte bajo dos convenciones | Sin signo y complemento a dos sobre el mismo patrón. |
| `exercises/03-inversion-signo.md` | Inversión de signo en complemento a dos | Invertir bits y sumar 1 sobre tres positivos. |
| `exercises/04-predecir-overflow.md` | Predecir overflow | Tres operaciones, dos tipos de overflow, patrón resultante. |
| `exercises/05-dump-ascii.md` | Leer un dump ASCII | Crear archivo, mirarlo con `xxd`, transcribir a mano. |
| `exercises/06-ascii-vs-utf8.md` | Distinguir bytes ASCII de bytes UTF-8 multibyte | Clasificar cada byte por sus bits altos. |
| `exercises/07-reconstruir-le.md` | Reconstruir un entero LE desde un dump | Programa C, dump, reconstrucción manual. |
| `exercises/08-comparar-le-be.md` | Comparar LE y BE sobre el mismo valor | Mismo entero, dos disposiciones de bytes. |
| `exercises/09-desarmar-float.md` | Desarmar un `float` en sus tres campos | Aplicar la fórmula IEEE 754 sobre `1.0f` y un `float` cercano a $\pi$. |
| `exercises/10-valores-especiales-fp.md` | Identificar valores especiales de IEEE 754 | Reconocer `+0`, `-0`, `+∞`, NaN por la estructura de los campos. |
| `exercises/11-diagnostico-cruzado.md` | Diagnóstico cruzado | Tres lecturas del mismo patrón y elección justificada por contexto. |

## Próximo paso

El trabajo pendiente ya no es abrir temas nuevos, sino endurecer la continuidad editorial del nivel y hacer crecer la solapa `laboratorio` con escenas más precisas sobre texto, longitud variable y lectura estructurada de bytes, sin invadir todavía herramientas o semánticas que pertenecen a niveles posteriores.
