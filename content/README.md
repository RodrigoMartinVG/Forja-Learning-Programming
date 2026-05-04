# Contenido de Forja

`content/` contiene todo el material curricular del proyecto.

Referencia editorial canónica: [estandar_editorial_forja.md](../estandar_editorial_forja.md)

## Estado editorial actual

El canon visible del repo ya esta sembrado estructuralmente, pero casi todo `content/` sigue en una mezcla de authoria real puntual y placeholders honestos.

Hoy:

- `content/theory/L0-setup-laboratorio/README.md` es el unico nivel con outline real completo.
- `content/projects/focused/devcontainer-setup/README.md` es el unico README raiz de proyecto en authoria real.
- El resto de niveles y proyectos puede existir todavia como estructura minima sin que eso convierta automaticamente ese material en authoria terminada.

## Ramas principales

- `theory/`: unidades conceptuales y niveles del plan
- `projects/`: proyectos focalizados e integradores

## Regla editorial

- `content/` es lo que la web realmente renderiza.
- Si un nivel o proyecto no esta escrito todavia, debe quedar como placeholder estructural honesto, no como simulacion de contenido final.
- La authoria real avanza por fases de nivel y fases de proyecto, siguiendo el orden definido en `docs/forja-construccion.md` y la estructura definida en metadata.

## Fuente de verdad

- La especificacion curricular de niveles vive en `docs/forja-contenido.md`.
- El catalogo consolidado de proyectos vive en `docs/forja-proyectos.md`.
- La estructura objetivo del repo vive en `docs/forja-arquitectura.md`.
- El orden de construccion vive en `docs/forja-construccion.md`.

## Relacion con metadata

- `content/theory/**/meta.yaml` replica la estructura necesaria para cada nivel.
- `content/projects/**/project.yaml` fija la relacion real entre cada proyecto y sus niveles.
- `metadata/` y `content/` deben poder leerse juntos sin contradicciones: canon y relaciones por un lado, cuerpo renderizable por el otro.
