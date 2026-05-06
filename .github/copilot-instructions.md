# Forja — instrucciones para sesiones de Copilot

Este archivo es el **punto de reencuentro** de cada sesión nueva de Copilot/AI en este repo. Léelo antes de tocar nada. No duplica los documentos maestros: los referencia.

## Regla número uno

Si el pedido implica **crear o modificar contenido** (niveles teóricos, capítulos, ejercicios, READMEs de proyectos, outlines, placeholders, prosa visible al usuario), el resultado **debe cumplir** los documentos canónicos. La división de roles importa según la fase del trabajo:

1. [CONVENTIONS.md](../CONVENTIONS.md) — estructura, nombres, layout, estados (placeholder vs authoría real), `outline.md` antes de `chapters/`, `00-introduccion.md` obligatorio, etc. **Se consulta antes de crear o mover archivos.**
2. [estandar_editorial_forja.md](../estandar_editorial_forja.md) — voz, principios pedagógicos, contratos por tipo de archivo, workflow editorial. **Se consulta al escribir.**
3. [refinamiento_editorial_forja.md](../refinamiento_editorial_forja.md) — reglas de prosa R1–R11, anti-patrones A1–A14, reglas por dominio B1–B5, protocolo de revisión, verificación automática (`forja editorial-stats`). **Se consulta al revisar, después del primer borrador.**
4. Los `docs/forja-*.md` correspondientes — canon curricular y de arquitectura cuando el cambio toca el plan, los proyectos, la web o el orden de construcción.

Antes de empezar a redactar o crear archivos de contenido, **abrir y releer** las secciones relevantes de esos documentos. No confiar en lo que parezca recordado de sesiones anteriores: el estándar evoluciona y las plantillas viejas pueden estar vetadas.

Si hay conflicto entre lo que pide el usuario y estos documentos, avisar antes de proceder en vez de inventar una solución intermedia.

## Qué es Forja

Monorepo de aprendizaje de programación de sistemas (C, Rust, sistemas operativos, compiladores, redes, persistencia, runtimes, herramientas de bajo nivel). El canon curricular son los niveles `L0`–`L57` en [content/theory/](content/theory/) y los proyectos en [content/projects/](content/projects/). La web en [web/](web/) sólo navega archivos reales del repo; no inventa contenido.

## Estado real (no fingir authoría que no existe)

- En el track teórico, `L0`–`L4` están en authoría real. El resto de los `Lx` viven como placeholder estructural.
- El bloque editorial previo a `L0` vive en [content/intro/forja/](content/intro/forja/) y [content/intro/workspace/](content/intro/workspace/).
- Sólo algunos projects en `content/projects/` están en authoría real de proyecto.
- El resto del canon vive como **placeholder estructural honesto**, y eso es válido. No completar contenido inventado para "rellenar".

## Documentos que mandan (en este orden)

1. [README.md](../README.md) — portada y orientación general.
2. [CONVENTIONS.md](../CONVENTIONS.md) — reglas estructurales y operativas (slugs, layout de niveles, placeholders, outline, proyectos).
3. [estandar_editorial_forja.md](../estandar_editorial_forja.md) — voz, principios, contratos por tipo de archivo, workflow editorial. Lo que se necesita **al escribir**.
4. [refinamiento_editorial_forja.md](../refinamiento_editorial_forja.md) — reglas de prosa R1–R11, anti-patrones A1–A14, reglas por dominio B1–B5, protocolo de revisión con veredicto, verificación automática `forja editorial-stats`. Lo que se necesita **al revisar** (después del primer borrador). No releer mientras escribís: te frena.
5. `docs/forja-*.md` — canon curricular y de arquitectura:
   - [docs/forja-contenido.md](../docs/forja-contenido.md): plan curricular y caminos.
   - [docs/forja-proyectos.md](../docs/forja-proyectos.md): catálogo de proyectos y arcos.
   - [docs/forja-arquitectura.md](../docs/forja-arquitectura.md): estructura del repo, metadata, web, laboratorio.
   - [docs/forja-construccion.md](../docs/forja-construccion.md): orden maestro de construcción.
6. `metadata/levels.yaml`, `meta.yaml` por nivel y `project.yaml` por proyecto: **fuente de verdad estructural**. Mientras un nivel o proyecto esté en placeholder, no existe `README.md` en disco: la web sintetiza el cuerpo desde el YAML (ver `web/vite.config.ts`, `synthesizeLevelReadme` / `synthesizeProjectReadme`). La aparición de `outline.md` (niveles) o de un `README.md` raíz mantenido (proyectos) es la señal estructural de authoría real.

## Reglas operativas que se olvidan seguido

- Idioma de la prosa: español con tildes normales. Slugs y nombres de carpetas: ASCII `kebab-case`.
- Authoría real de un nivel **empieza por `outline.md`**, no por `chapters/` ni `exercises.md`.
- `00-introduccion.md` es obligatorio y usa exactamente ese nombre. El contrato editorial está en `estandar_editorial_forja.md` §5.4 (con epígrafe en §5.4.1). La plantilla vieja "Qué es / Qué cubre / Qué no cubre / Cómo trabajarlo / El nivel siguiente" está vetada (anti-patrón A6 del refinamiento).
- Nada queda colgado: si un tema se introduce parcial, se declara dónde se cierra (otro nivel, otro capítulo, etc.).
- Carpetas dummy de niveles/proyectos sin authoría real viven directamente bajo `content/theory/` o `content/projects/**/`, no en staging tipo `_planned/`.
- [libros-consulta/](../libros-consulta/) está fuera de Git; sólo material obtenido legalmente.

## Validación

- Web (desde host con Node): `cd web && npm run build`.
- Cualquier creación de contenido pasa primero por la **Regla número uno** de arriba

## Entornos

- **Dev container**: compilar/depurar C y Rust en Linux reproducible.
- **Host del usuario (Windows)**: correr la web (`npm run dev|build|preview`). Desde WSL o el devcontainer no se ve el Node del host.

## Para el agente

- No crear archivos `.md` "de resumen de cambios" salvo que se pidan.
- No agregar features, refactors o helpers fuera del pedido.
- Antes de redactar contenido editorial, releer [estandar_editorial_forja.md](../estandar_editorial_forja.md) (voz, principios, contratos, workflow).
- Al revisar contenido editorial ya escrito, consultar [refinamiento_editorial_forja.md](../refinamiento_editorial_forja.md) (R1–R11, A1–A14, protocolo, script).
- Antes de mover/crear estructura de niveles o proyectos, releer [CONVENTIONS.md](../CONVENTIONS.md).
- Memoria de repo relevante vive en `/memories/repo/forja-*.md` y se carga automáticamente; consultarla en vez de re-explorar desde cero.

## Protocolo del agente para escribir contenido editorial

El workflow editorial de §7 del estándar fue diseñado para autoría humana. Un agente tiende a comprimir las fases (escribe, revisa contra reglas y "aprueba" en una sola pasada), lo que produce prosa que cumple umbrales pero pierde la voz. Reglas explícitas para mitigarlo:

1. **Declaración previa obligatoria.** Antes de escribir o modificar `chapters/NN-*.md`, `00-introduccion.md`, `exercises*.md` o `outline.md` con authoría real, el agente declara en el chat, antes de invocar herramientas de escritura:
   - qué `outline.md` está siguiendo (ruta);
   - qué capítulo/sección previo del nivel leyó (ruta + 1 oración de qué deja firme);
   - qué capítulo/sección siguiente del nivel anticipa (ruta + 1 oración de qué tiene que asumir);
   - qué tipo de archivo va a producir según §5 del estándar.
   
   Si no puede dar las cuatro respuestas con archivos reales, no escribe: pide al usuario el contexto faltante.

2. **El agente nunca propone epígrafe.** El epígrafe del §5.4.1 requiere criterio cultural y verificación de fuentes que el agente no puede garantizar (alto riesgo de cita mal atribuida, cliché no detectado o "sospechosamente perfecta"). Si el `outline.md` no trae epígrafe y el agente está redactando un `00-introduccion.md`, deja un placeholder explícito `> <epígrafe pendiente: a definir por humano según §5.4.1>` y avisa al usuario. No improvisa cita ni busca en web "una cita sobre X".

3. **Borrador honesto, no falsa autoridad.** Cuando el agente escribe un primer borrador de contenido teórico, declara explícitamente al usuario que es **borrador para revisión humana**, no contenido aprobado. La pasada de pedagogía real (P3 materialidad genuina, P6 empatía estructural, R10/R11 entrada situada y transiciones que cargan continuidad) la valida el humano. El agente puede dejar un borrador con voz y estructura correctas; no puede certificar que sirva pedagógicamente sin revisión humana.

4. **Separar fases.** El agente cierra el primer borrador antes de aplicar refinamiento. No corrige R1–R11 mientras escribe el primer borrador. Esto reproduce la disciplina del §7.2 del estándar.

5. **Veredicto §6 del refinamiento es humano.** El agente puede correr `forja editorial-stats` y reportar celdas rojas, pero no llena la hoja de revisión ni emite veredicto APROBADO/RECHAZADO por su cuenta. Reporta el estado mecánico y deja la decisión al usuario.

Existe un prompt-template en [.github/prompts/escribir-capitulo.prompt.md](prompts/escribir-capitulo.prompt.md) que materializa este protocolo. Cuando el usuario lo invoca, el agente sigue esa secuencia paso a paso.
