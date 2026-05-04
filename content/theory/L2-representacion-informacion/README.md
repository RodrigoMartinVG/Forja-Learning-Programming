# L2 - Representación de la información

> Autoría del nivel abierta en `outline.md`.
>
> Este README sigue funcionando como documento de diseño interno, aunque el nivel ya tenga capítulos, ejercicios y una primera versión renderizable del laboratorio.
>
> Diseño curricular -> `docs/forja-contenido.md`
> Introducción general -> `content/theory/README.md`
> Outline del nivel -> `outline.md`
> Diseño del laboratorio interactivo -> `laboratorio.md`

## Estado editorial

- Objetivo del nivel: fijar una forma operativa de pensar bits, bytes, ancho finito, enteros, texto simple, hexadecimal, endianness y floating point como representaciones materiales antes de abrir compilación real, assembly o formatos binarios más pesados.
- Proyecto asociado: ninguno.
- Estado actual: `outline.md`, los capítulos `00` a `07`, los ejercicios `01` a `07` y una primera versión del laboratorio con hexdump, lecturas derivadas, patches materiales y escenas curriculares ya existen.
- Nota de alcance: `L2` no busca agotar Unicode, IEEE 754 ni herramientas industriales completas. Busca dejar firme la alfabetización que después reaparece en hexdumps reales, `xxd`, `od`, `objdump`, vistas de debugger y artefactos del pipeline.

## Prerequisitos

- L1

## Proyectos asociados

- Sin proyectos asociados todavía.

## Capítulos del nivel

| Archivo | Título | Nota |
|---|---|---|
| `chapters/00-introduccion.md` | Introducción | Ubica L2 en el mapa y fija la pregunta central del nivel. |
| `chapters/01-bits-bytes-ancho-finito.md` | Bits, bytes y ancho finito | Fija bit, byte, dirección por byte y ancho como materia mínima de la representación. |
| `chapters/02-enteros-y-complemento-a-dos.md` | Enteros sin signo y complemento a dos | Separa unsigned y signed sobre el mismo patrón finito. |
| `chapters/03-overflow-y-truncado.md` | Overflow, truncado y límites de representación | Hace visible qué pasa cuando el resultado ideal no entra en el ancho disponible. |
| `chapters/04-hexadecimal-y-bytes.md` | Hexadecimal y lectura humana de bytes | Vuelve práctica la lectura de bytes, tablas de memoria y dumps. |
| `chapters/05-texto-como-bytes-ascii-y-utf8.md` | Texto como bytes: ASCII y UTF-8 | Trata texto como otra lectura de bytes y abre la idea de longitud variable. |
| `chapters/06-endianness.md` | Endianness y orden de bytes | Reconstruye valores multi-byte sin confundir orden de bytes con orden de bits. |
| `chapters/07-floating-point-como-aproximacion.md` | Floating point como aproximación finita | Cierra el nivel con rango, precisión y aproximación binaria. |

## Ejercicios del nivel

| Archivo | Título | Nota |
|---|---|---|
| `exercises/01-contar-patrones-y-rangos.md` | Contar patrones y rangos | Contar cuántos valores caben según el ancho y la lectura elegida. |
| `exercises/02-leer-un-mismo-byte-de-dos-maneras.md` | Leer un mismo byte de dos maneras | Comparar unsigned y complemento a dos sin cambiar los bits. |
| `exercises/03-predecir-overflow-y-truncado.md` | Predecir overflow y truncado | Anticipar qué sobrevive cuando el resultado no cabe o el ancho se recorta. |
| `exercises/04-binario-hex-decimal.md` | Binario, hex y decimal | Pasar entre notaciones sin perder el agrupamiento por nibble y byte. |
| `exercises/05-interpretar-un-mismo-bloque-de-bytes.md` | Interpretar un mismo bloque de bytes | Separar bloque material, lectura textual, lectura numérica y cursor de decodificación. |
| `exercises/06-leer-endianness-en-memoria.md` | Leer endianness en memoria | Reconstruir valores multi-byte mirando memoria byte a byte. |
| `exercises/07-flotantes-y-aproximacion.md` | Flotantes y aproximación | Distinguir exactitud, aproximación y límites de representación en binario finito. |

## Próximo paso

Seguir puliendo la continuidad editorial del nivel y hacer crecer la solapa `laboratorio` con mejores escenas sobre texto, longitud variable y lectura estructurada de bytes, sin adelantar todavía herramientas o semánticas que pertenecen a niveles posteriores.
