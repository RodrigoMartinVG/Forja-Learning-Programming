# Track Teorico

Este directorio alojara las unidades teoricas del plan.

## Slugs canonicos de nivel

- `L0-environment`
- `L1a-c-first-contact`
- `L1b-c-deep-fundamentals`
- `L2-c-memory`
- `L3a-rust-first-contact`
- `L3b-rust-ownership`
- `L4-rust-types-traits-ffi`
- `L5-posix-files`
- `L6-processes-signals`
- `L7-virtual-memory-elf`
- `L8-allocators`
- `L9-concurrency`
- `L10-advanced-concurrency`
- `L11-ipc`
- `L12-lexers-parsers`
- `L13-interpreters`
- `L14-type-systems`
- `L15-persistence`
- `L16-networking`
- `L17-performance`
- `L18-security`
- `L19-async-io`
- `L20-containers`
- `L21-orchestration`
- `L22-codegen-jit`
- `L23-kernel`

## Estructura esperada por nivel

Cada nivel deberia terminar con esta forma minima:

```text
Lx-slug/
├── README.md
├── src/
├── exercises.md
└── meta.yaml
```

En Base 0 este README fija los nombres; las carpetas concretas de nivel apareceran cuando el plan las vaya necesitando.
