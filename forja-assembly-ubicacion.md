# Forja — Dónde va el assembly y con qué contenido

> Análisis de la distribución del contenido de arquitectura/assembly a través del plan curricular. El argumento central: el contenido de assembly no es un bloque monolítico sino tres capas conceptualmente distintas que pertenecen a tres momentos distintos del recorrido.

> Premisa de diseño: este análisis no supone caminos separados por lenguaje. En Forja, C y Rust forman una base común; la pregunta no es a qué lenguaje "pertenece" el assembly, sino dónde cae la primera ancla pedagógica fuerte de cada capa y dónde conviene volver a verla con más profundidad.

---

## El problema de partida

El plan actual concentra en L0 el siguiente contenido de arquitectura:

- Complemento a dos y UB de signed overflow
- Qué es un registro y por qué hay un número fijo
- Leer assembly x86-64 en general
- Stack frames en hardware — `rsp`, `rbp`, calling conventions
- Caller-saved vs callee-saved registers
- El flujo de `call` → prólogo → cuerpo → epílogo → `ret`
- La syscall cruda en Linux x86_64 (registros, instrucción `syscall`, clobbering)
- Un mini-lab de compilar con `-S`, comparar `-O0` vs `-O2`, seguir con gdb

La justificación implícita es que todo esto se necesita para "entender lo que el debugger muestra". Es parcialmente cierto, pero esconde que son tres cosas distintas con tres momentos de madurez distintos en el recorrido.

---

## Las tres capas

### Capa 1 — Representación de datos en hardware

**Qué es**: cómo los enteros viven en bits, por qué el complemento a dos existe, qué significa overflow en hardware vs en C.

**Por qué es diferente**: no requiere haber visto assembly. Es teoría de representación, no teoría de ejecución. Un usuario que recién entra al plan necesita esto para entender por qué un entero con signo puede desbordarse hacia negativo en hardware y por qué eso es UB en C, aunque no lo sea a nivel del CPU. Esa base después le sirve igual para C y para Rust.

**Dónde pertenece**: **L0, como está.** Es el contenido de arquitectura que sí es verdaderamente prerrequisito antes del primer contacto serio con código compilado del plan. En la práctica aparece antes de C porque C abre el recorrido, pero no es una capa "de C": también alimenta el modelo mental que después usa Rust.

**Contenido recomendado**:
- Representación binaria de enteros sin signo
- Complemento a dos — la representación de negativos que hace que la aritmética funcione igual para el hardware
- Por qué `UINT_MAX + 1 == 0` (wrap defined) y `INT_MAX + 1` es UB en C pero no en hardware
- Tamaños de tipos en C — por qué `int` no es siempre 32 bits y por qué existe `stdint.h`
- Una oración de contexto: "el CPU tiene un número fijo de registros, vamos a verlos en detalle en L1b cuando leamos el output del compilador"

**Referencia**: CS:APP capítulo 2 — asignarlo aquí como lectura que acompaña L0/L1a.

---

### Capa 2 — Leer assembly como herramienta de comprensión del código compilado

**Qué es**: entender el assembly que el compilador genera a partir de código que el usuario ya escribió y compiló. No es aprender assembly como lenguaje; es usarlo como lente para ver lo que el compilador decide. En la primera pasada del plan, esa ancla aparece en C; más adelante el mismo modelo reaparece al mirar FFI, syscalls, disassembly y codegen desde Rust.

**Por qué es diferente**: requiere haber escrito y compilado programas simples. No tiene sentido hablar de prólogos de función, caller-saved registers o el efecto de `-O2` sobre un loop si el usuario no tiene todavía un modelo de lo que es una función, un stack frame conceptual o un loop con variable de inducción. La abstracción precede a la implementación.

**Dónde pertenece**: **L1b**, como primera ancla profunda, integrado con el proyecto `elf-explorer`.

El `elf-explorer` ya pide: *"ver secciones, símbolos, assembly generado, prólogos y epílogos, instrucciones `call`/`ret`"*. El contenido teórico de esta capa es exactamente el fundamento de ese proyecto. Poner la teoría fuerte en L0 y el proyecto en L1b crea una brecha innecesaria; anclar la profundidad en L1b los une.

Esto no define un "camino C" separado de un "camino Rust". L1b es el primer hogar fuerte de esta capa porque Forja entra a la caja de herramientas compiladas por C antes de Rust y porque `elf-explorer` vive ahí. El mismo modelo vuelve a ser útil más adelante en L4 (FFI, `libc`, `nix`, `RawFd`), en L19 (runtime e I/O) y en L22 (codegen y calling convention).

**Contenido recomendado para la unidad teórica en L1b**:

*El modelo de ejecución en hardware*:
- Qué es un registro — `rax`, `rbx`, `rcx`, `rdx`, `rsi`, `rdi`, `rsp`, `rbp`, `r8`–`r15` — y el registro de instrucción `rip`
- La distinción entre registros de propósito general y registros de control
- El stack como región de memoria que crece hacia abajo — `rsp` como puntero al tope actual

*Calling conventions x86-64 (System V AMD64 ABI)*:
- Los seis registros de argumentos enteros: `rdi`, `rsi`, `rdx`, `rcx`, `r8`, `r9`
- El registro de retorno: `rax`
- Caller-saved vs callee-saved — qué tiene que preservar quien llama y quién es llamado
- El stack frame: `call` empuja `rip`, el prólogo empuja `rbp` y ajusta `rsp`, el epílogo los restaura, `ret` vuelve
- Por qué hay variables en registros y variables en el stack (spilling)

*Leer assembly generado*:
- Las instrucciones más frecuentes: `mov`, `lea`, `push`, `pop`, `add`, `sub`, `cmp`, `jmp`, `je`/`jne`/`jl`/etc., `call`, `ret`
- Sintaxis AT&T vs Intel — cuál muestra gcc por default, cuál muestra objdump por default, cómo cambiar
- Cómo reconocer en el assembly: una asignación, un if, un loop, una llamada a función
- Qué hace el compilador con `-O0` (mínimo: todo en stack, muy literal) vs `-O2` (inlining, eliminación de loads/stores redundantes, loop unrolling básico)
- Cómo una variable local puede desaparecer del assembly optimizado (y por qué `volatile` existe)

**El mini-lab** conviene desdoblarlo en dos escalones:

*En L0, versión mínima e instrumental*:
- Compilar un programa pequeño con `-S` y ver que existe un `.s`
- Reconocer una vez `call`/`ret` sin pedir comprensión profunda del ABI
- Ver con `strace` que una llamada de biblioteca termina cruzando a una syscall

*En L1b, versión completa*:
- Compilar un programa con `-S` y leer el `.s`
- Comparar `-O0` vs `-O2` sobre el mismo código
- Ubicar prólogo y epílogo en el output
- Seguir una llamada con `gdb` (`disas`, `stepi`, `info registers`, `x/8gx $rsp`)
- Contrastar `write()` vía libc con `syscall(2)` — este último punto se puede mencionar aquí y profundizarse del todo en L6

**Referencia**: CS:APP capítulo 3 — asignarlo en L1b como lectura que acompaña el mini-lab y el `elf-explorer`.

---

### Capa 3 — La syscall cruda como mecanismo del kernel

**Qué es**: cómo el código de usuario cruza la frontera hacia el kernel — número de syscall en `rax`, argumentos en los registros de convención, la instrucción `syscall`, el retorno en `rax`, el clobbering de `rcx` y `r11`.

**Por qué es diferente**: no es sobre leer assembly del compilador. Es sobre el protocolo entre userspace y el kernel. Para que esto tenga sentido el usuario necesita saber qué es un proceso, qué es el espacio de usuario, qué hace libc arriba de las syscalls, y por qué alguien querría evitar libc y llamar directamente. Sin ese contexto es memorización de registros sin motivación.

**Dónde pertenece**: **L6 — Procesos y señales**, como explicación completa del mecanismo.

L6 ya cubre: *"La frontera userspace↔kernel en Linux x86_64 — qué pasos concretos sigue una syscall: código C o Rust llama a un wrapper, el wrapper prepara registros, ejecuta `syscall`..."*. El contenido de L0 sobre syscalls crudas no debería competir con eso como segunda teoría completa. La solución no es borrar L0 por completo, sino dejar allí una preview instrumental mínima y consolidar el modelo real en L6.

**Contenido recomendado para la unidad teórica en L6** (expandiendo lo que ya hay):

*El protocolo de syscall en Linux x86_64*:
- El número de syscall en `rax` — la tabla de syscalls del kernel como un array de función
- Los seis registros de argumento: `rdi`, `rsi`, `rdx`, `r10`, `r8`, `r9` — nota: `r10` en lugar de `rcx` respecto a la calling convention normal, y por qué
- La instrucción `syscall` — qué hace en hardware: guarda `rip` en `rcx`, guarda `rflags` en `r11`, salta al kernel entry point
- Por qué `rcx` y `r11` quedan clobbered después de `syscall` — el kernel los usa internamente
- El retorno en `rax` — valores negativos indican error (el negativo del errno)
- Cómo libc traduce ese retorno negativo a `-1` + `errno`

*Las cuatro formas de llamar a una syscall desde C/Rust*:
- Vía libc (la forma normal): `write(fd, buf, n)` — libc hace todo el trabajo
- Vía `syscall(2)` de libc: `syscall(SYS_write, fd, buf, n)` — libc acomoda los registros pero el usuario elige la syscall
- Vía el crate `libc` en Rust: equivalente al anterior, con tipos Rust
- Vía el crate `nix` en Rust: API ergonómica con tipos propios, internamente usa `libc`
- Vía un stub mínimo en assembly (rarísimo en producción, útil para entender el protocolo)

*Por qué importa saber esto*:
- Para entender qué hace strace — es exactamente un interceptador de estas fronteras
- Para entender por qué algunas funciones de libc pueden fallar de formas que el código C no anticipa
- Para poder escribir código que evita libc en contextos donde no está disponible (embedded, early boot)
- Como base para L23 (kernel space) donde el código vive del otro lado de esa frontera

---

## Resumen de la redistribución

| Contenido | Ahora en | Propuesta |
|---|---|---|
| Complemento a dos, UB de overflow, tamaños de tipos | L0 | **L0** — se queda |
| "Los registros existen" (una oración de contexto) | L0 | **L0** — se queda y sirve de puente hacia L1b |
| Registros x86-64, calling conventions, stack frames | L0 | **L1b** — primera ancla profunda, reutilizable después en Rust y JIT |
| Caller-saved / callee-saved | L0 | **L1b** |
| Prólogo / epílogo / `call` / `ret` | L0 | **L1b** |
| Leer assembly generado, `-O0` vs `-O2` | L0 | **L1b** |
| Mini-lab con `-S`, gdb, comparar optimizaciones | L0 | **L0** (preview corto) + **L1b** (versión completa) |
| Syscall cruda — registros, `syscall`, clobbering | L0 | **L0** (preview instrumental) + **L6** (modelo completo) |
| Referencia CS:APP cap. 2 | L0 | **L0** (acompañar con L1a) |
| Referencia CS:APP cap. 3 | L0 | **L1b** — ancla principal; L0 solo puede mencionarlo como lectura adelantada opcional |

---

## Qué gana el plan con este movimiento

**L0 recupera su foco sin vaciarse de más.** Queda como un nivel de toolchain y observabilidad básica: mantiene complemento a dos, una intuición mínima de registros, una muestra corta de assembly y una preview instrumental de la frontera de syscall. Eso alcanza para que strace, gdb y el compilador no parezcan magia, sin convertir L0 en un curso comprimido de ABI.

**L1b gana cohesión.** El `elf-explorer` pasa de ser un proyecto que se introduce un poco en el vacío a tener un fundamento teórico completo inmediatamente anterior. La secuencia queda: aprender C profundo → entender qué genera el compilador → leer ese output con herramientas. Es una progresión natural, y además deja una base que luego se reaprovecha en Rust, FFI y codegen.

**L6 elimina la duplicación fuerte.** La syscall cruda explicada con contexto de procesos es más útil que la misma información explicada antes de que el usuario sepa qué es un proceso. Y strace — que se introduce en L0 — puede referenciarse desde L0 sin explicar el mecanismo completo: basta con "muestra las syscalls que hace un programa; el cómo lo veremos en L6".

**La decisión deja de depender de un falso camino C vs Rust.** Como todos los caminos reales del plan comparten L0-L4, la discusión correcta no es qué lenguaje se deja afuera, sino dónde cae la primera explicación ligera, dónde cae la primera explicación profunda y dónde se completa el modelo kernel/userspace.

**La carga cognitiva de L0 baja sin perder poder instrumental.** Actualmente un usuario que llega a Forja tiene que procesar toolchain + arquitectura antes de escribir una línea seria del plan. Con la redistribución, L0 es ejecutable en un día o dos y desbloquea L1a/L3a sin dejar al usuario ciego frente a strace, gdb o un `.s` generado por el compilador.

---

## Una nota sobre la referencia CS:APP

CS:APP capítulos 2 y 3 son los mejores capítulos del libro pero son densos. Asignarlos ambos a L0 crea una expectativa de lectura muy pesada antes de arrancar. La distribución propuesta los separa naturalmente:

- **Cap. 2** (representación de datos) → L0/L1a — lectura paralela al primer contacto con tipos C
- **Cap. 3** (assembly x86-64) → L1b — lectura paralela al `elf-explorer` y al mini-lab fuerte; en L0 solo puede aparecer como referencia opcional para quien quiera mirar antes de tiempo

Así cada capítulo tiene un proyecto o nivel concreto que lo ancla y que le da al usuario un motivo inmediato para leerlo.
