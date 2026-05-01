# Track Practico

Este directorio alojara todos los proyectos del plan.

## Ramas

- `focused/`: proyectos pequenos y focalizados
- `integrating/`: proyectos integradores y multi-fase

## Convencion general

- Los nombres visibles pueden tener espacios o mayusculas.
- Los directorios usan slugs ASCII en kebab-case.
- La metadata local de cada proyecto se agregara en Base 2 mediante `project.yaml`.

## Estructura esperada por proyecto

```text
project-slug/
├── project.yaml
├── c/
│   └── phase-n/
└── rust/
    └── phase-n/
```

No todos los proyectos tienen ambos lenguajes. Los proyectos de kernel de L23 son mayoritariamente solo C, salvo `ebpf-tracer`, que sigue siendo dual.
