---
mode: agent
description: Escribir o revisar contenido editorial de Forja siguiendo el workflow canónico (estándar + refinamiento) en fases separadas.
---

# Escribir capítulo / introducción / ejercicio de Forja

Este prompt fuerza la secuencia de §7 del [estándar editorial](../../estandar_editorial_forja.md). No saltarse pasos. No comprimir fases. La meta no es "producir el archivo en un turno": es producir un **borrador honesto** que después un humano valide.

## Fase 0 — Confirmar pedido

Pedir al usuario, si no está claro:
- archivo a producir (ruta exacta);
- tipo de archivo según §5 del estándar (capítulo, intro, ejercicio, README de nivel, outline, design doc);
- si es authoría real o placeholder.

Si el archivo es `00-introduccion.md` y el `outline.md` del nivel no registra epígrafe (regla §5.4.1), avisar al usuario antes de continuar. **No proponer epígrafe vos.**

## Fase 1 — Declaración previa obligatoria

Antes de leer reglas o tocar herramientas de escritura, responder en el chat con estas cuatro líneas, completadas con archivos reales del repo:

```
Outline seguido: <ruta a outline.md>
Capítulo previo: <ruta> — <una oración: qué deja firme>
Capítulo siguiente: <ruta o "no aplica" si es el último> — <qué tiene que asumir>
Tipo de archivo (§5): <outline | README | chapter | intro | exercise | design>
```

Si no podés llenar las cuatro con archivos reales (porque el outline no existe, porque no hay capítulo previo escrito, etc.), **parar acá** y pedir al usuario el contexto faltante o autorización para crear el outline primero. La regla §7.1 del estándar es bloqueante: sin contexto del nivel, no se redacta contenido.

## Fase 2 — Lectura de contexto editorial

Leer, en este orden:
1. §3 (voz), §4 (principios), §5 (contrato del tipo de archivo) y §6 (pedagogía) del [estándar](../../estandar_editorial_forja.md).
2. El `outline.md` del nivel completo.
3. El capítulo previo y el siguiente (los archivos reales, no la entrada del outline).
4. Memoria de repo relevante (`/memories/repo/forja-editorial-v4.md`, `/memories/repo/forja-canonical-levels.md`).

**No leer ahora** el [refinamiento](../../refinamiento_editorial_forja.md). Esa lectura es Fase 4.

## Fase 3 — Primer borrador

Escribir el archivo entero de una vez. Reglas:
- Apoyarse en lo material (P3): comandos, dumps, errores reales, trazas. Si el dominio lo permite y no hay materialidad, el borrador no cumple — replantear.
- Voz impersonal (§3.1). Sin primera persona plural didáctica. Sin segunda persona en capítulos teóricos.
- Si es `00-introduccion.md` sin epígrafe definido en outline: dejar `> <epígrafe pendiente: a definir por humano según §5.4.1>` arriba del primer `##` y seguir.
- No releer el refinamiento ni intentar cumplir R1–R11 / A1–A14 ahora. Eso paraliza.
- Escribir el archivo completo. No entregar fragmentos para "ir confirmando".

## Fase 4 — Pasada mecánica

Correr el verificador sobre el archivo recién escrito:

```powershell
$env:PYTHONIOENCODING="utf-8"; python scripts/forja.py editorial-stats --target <ruta>
```

Para cada celda roja, aplicar el **test del borrado** (R1.bis del refinamiento): leer la oración sin la palabra/frase. Si pierde fuerza, dejar y registrar por qué. Si no pierde, borrar.

No reescribir para que el script quede verde. Reescribir para que la frase sea más limpia. Si el script sigue rojo después de la pasada honesta y vos juzgás que el texto está bien, dejar el rojo y anotarlo en el reporte de Fase 6.

## Fase 5 — Pasada de continuidad y dominio

Releer el archivo entero buscando lo que el script no ve:
- **R10 entrada situada**: ¿el archivo abre nombrando un problema técnico real con conexión al previo, o aterriza un hecho aislado?
- **R11 transiciones**: ¿las fronteras entre secciones articulan o yuxtaponen?
- **B1–B5 reglas por dominio** del refinamiento: ¿los términos técnicos del dominio se usan con precisión?
- **P6 empatía estructural**: ¿el lector queda situado antes de cada salto?
- **A13 encuadre de listas**: ¿cada ítem cumple el contrato del título de la lista?

Marcar dudas con `[?]` en el archivo, no resolverlas todavía si no estás seguro.

## Fase 6 — Reporte al humano (NO emitir veredicto)

Responder en el chat con:

```
Archivo: <ruta>
Estado mecánico: <N celdas rojas | verde>
  - <métrica>: <valor> (umbral <U>) — <decisión: dejado / corregido>
  ...
Dudas marcadas con [?]: <N>
  - <ubicación>: <qué se duda>
  ...
Pendiente humano:
  - validar pedagogía (P3 materialidad genuina, P6 empatía, R10/R11 continuidad real)
  - <si aplica> definir epígrafe según §5.4.1
  - <si aplica> resolver dudas marcadas
  - emitir veredicto §6 del refinamiento (APROBADO / RECHAZADO)
```

**No emitir veredicto APROBADO por cuenta propia.** El veredicto es humano (§6 del refinamiento). El agente reporta estado, no certifica.

## Notas

- Si el usuario pide "escribí L5 entero" o equivalente macro: descomponer en archivos individuales y aplicar este protocolo a cada uno. No batch.
- Si el archivo es placeholder (no authoría real): este protocolo es excesivo. Para placeholders alcanza con el contrato §5 (estado, alcance, próximo paso) sin pasar por Fases 4–5.
- Si el pedido es **revisar** un archivo ya escrito (no producir uno nuevo): saltar a Fase 4 directamente, después leer Fase 5, terminar con Fase 6.
