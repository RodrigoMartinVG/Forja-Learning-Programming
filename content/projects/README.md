# Track Practico

Este directorio alojara todos los proyectos del plan.

## Ramas

- `focused/`: proyectos pequenos y focalizados
- `integrating/`: proyectos integradores y multi-fase

## Convencion general

- Los nombres visibles pueden tener espacios o mayusculas.
- Los directorios usan slugs ASCII en kebab-case.
- `project.yaml` es la fuente de verdad estructural de cada proyecto.

## Estado editorial actual

- `content/projects/focused/devcontainer-setup/README.md` es, por ahora, el unico README de proyecto con authoria real.
- El resto de los `README.md` dentro de `content/projects/**` se tratan como placeholders estructurales.
- Mientras un proyecto siga en placeholder, la verdad sobre niveles visibles, lenguajes y reaperturas vive en `project.yaml`.

## Estructura esperada por proyecto

```text
project-slug/
├── project.yaml
├── c/
│   └── phase-n/
└── rust/
    └── phase-n/
```

No todos los proyectos tienen ambos lenguajes. Los proyectos de kernel de L25 son mayoritariamente solo C, salvo `ebpf-tracer`, que sigue siendo dual.
