# Forja — Propuestas de ampliación
## Observaciones y agregados sugeridos sin quitar nada del plan actual

> Este documento recoge sugerencias de alto valor para ampliar Forja sin recortar contenido existente.
> La idea no es redistribuir ni reemplazar nada, sino agregar capas, puentes y niveles opcionales que
> mejoren la continuidad pedagógica y reduzcan vacíos entre bloques.

---

## 1. Lectura general del plan

El plan ya tiene una columna vertebral muy fuerte:

- laboratorio y herramientas
- modelo mental de máquina
- C y Rust como lenguajes troncales
- POSIX y sistemas
- concurrencia e IPC
- compiladores
- persistencia, redes, contenedores y kernel

Eso está bien. El punto a mejorar no es la dirección general, sino la **densidad de los puentes**.

Hoy el mapa tiene varias zonas donde el salto conceptual es correcto, pero algo brusco. En vez de tocar lo existente, conviene agregar material intermedio para que el avance se sienta más continuo.

Los dos temas que más valor agregan son:

1. **runtimes**
2. **recolección de basura (GC)**

Ambos merecen tratamiento explícito, no solo menciones laterales dentro de otros proyectos.

---

## 2. Qué agregaría en general

### 2.1 Una capa explícita de formatos y serialización

Entre ELF/linking y persistencia faltaría una familia de contenidos dedicada a:

- formatos binarios
- serialización y deserialización
- versionado de estructuras en disco
- checksums y detección de corrupción
- compatibilidad hacia atrás y hacia adelante
- diseño de wire formats

Esto ayudaría a conectar de forma más natural:

- `mini-linker`
- `KVolt`
- `MiniSQL`
- `mini-broker`
- `mini-dns-resolver`
- `tinyssh`

La ganancia es grande porque enseña una habilidad transversal: **diseñar datos que sobrevivan fuera de la memoria del proceso**.

### 2.2 Una capa más visible de Rust avanzado

Rust ya está bien cubierto en lo esencial, pero convendría agregar contenido explícito sobre:

- `Rc`, `Arc`, `Weak`
- `RefCell`, `Cell`, interior mutability
- `Pin` y auto-referencias
- `Send` y `Sync`
- `unsafe` como frontera de diseño, no como truco
- patrones de APIs seguras encima de primitivas inseguras

Esto no solo mejora la cobertura de Rust, también prepara mejor el terreno para:

- async runtimes
- estructuras concurrentes
- embebido y FFI
- componentes del ecosistema systems

### 2.3 Una capa de POSIX más fina

Entre procesos, archivos y redes convendría agregar piezas muy concretas de Unix real:

- `openat`, `mkdirat`, `renameat2`
- `fcntl`
- `poll`, `select`, `epoll` como evolución histórica
- PTY/TTY y control de terminal
- `dup2`, redirecciones avanzadas
- `statx`, `inotify` más a fondo
- `prctl`, `setrlimit`, `capabilities` en versión de usuario

Eso ayuda mucho a `mish`, `tinyssh`, `mini-debugger` y al salto posterior hacia kernel space.

### 2.4 Una capa de formatos de ejecución

Además de formatos de datos, conviene agregar una capa sobre **formatos de ejecución**:

- bytecode
- IR simple
- máquinas virtuales pequeñas
- pipelines de interpretación
- embedding de lenguajes
- hosts y plugins

Esto prepara tanto los compiladores como los runtimes.

---

## 3. Dónde agregar runtimes

Este es, para mí, el agregado más interesante.

### 3.1 Por qué runtime merece un bloque propio

Un runtime no es solo “código que corre algo”.
Es la capa que administra:

- ejecución
- scheduling
- eventos
- stack y frames
- aislamiento entre tareas
- interacción con I/O
- hooks de GC y/o finalización
- integración con FFI
- errores y unwinding
- políticas de consumo de recursos

Eso es un área distinta tanto de compiladores como de sistemas POSIX. Vale la pena nombrarla.

### 3.2 Dónde lo pondría

La mejor ubicación pedagógica sería **después de L32 y antes de L43**, o como un bloque paralelo que nazca entre compiladores e I/O asíncrono.

La razón es simple:

- L31–L32 ya te dan parser e intérprete
- L33–L34 te dan tipos e inferencia
- recién después conviene formalizar cómo se ejecuta un programa completo

Si se agrega un bloque nuevo, podría llamarse algo como:

**Bloque 7.5 — Runtimes y máquinas virtuales**

o

**Bloque 8 bis — Ejecución administrada**

### 3.3 Qué debería cubrir ese bloque

Un bloque de runtimes podría incluir:

- interpretes con dispatch explícito
- VMs de stack vs VMs de registro
- bytecode simple
- call frames y stack frames
- scheduling cooperativo
- event loop básico
- coroutines
- trampolines
- integración con `Future`/`Waker`
- embedding de un lenguaje dentro de otro host
- límites entre runtime, standard library y sistema operativo

### 3.4 Proyectos que encajan muy bien

Sin quitar nada, yo agregaría proyectos como:

- **mini-vm**: una máquina virtual de stack sencilla
- **bytecode-interpreter**: un intérprete de bytecode para un lenguaje mínimo
- **coroutine-runtime**: scheduler cooperativo con tareas livianas
- **embed-host**: host que carga scripts o plugins
- **tiny-async-executor**: executor propio antes del runtime async grande

### 3.5 Relación con el plan actual

Este bloque se conecta de forma natural con:

- `Lógico`
- `Semtex`
- `async-runtime`
- `JIT-Brain`
- `tinyssh`
- `HTTP server`

En particular, `async-runtime` pasa a verse como la culminación de una familia de runtimes, no como un proyecto aislado.

---

## 4. Dónde agregar GC

### 4.1 Por qué GC merece un tratamiento explícito

La recolección de basura es demasiado importante para quedar escondida solo como una fase interna de `Lógico`.

GC enseña cosas que no aparecen con fuerza en otros lugares:

- rastreo de raíces
- graph traversal sobre objetos vivos
- mutator vs collector
- write barriers
- generación y promoción
- compactación
- fragmentación
- finalización
- interacción con allocators y runtimes

Es un tema distinto de “malloc y free”. Complementa, no reemplaza.

### 4.2 Dónde lo pondría

Hay dos ubicaciones muy buenas:

#### Opción A: entre L24 y L25

Crear un bloque nuevo después de allocators:

**Bloque 3.5 — Memoria administrada y GC**

Ventaja: el alumno primero entiende la memoria manual y luego la administrada, antes de entrar a concurrencia.

#### Opción B: entre L32 y L35

Crear un bloque puente entre intérpretes y persistencia:

**Bloque 7.5 — Runtimes, GC y memoria administrada**

Ventaja: GC aparece junto con intérpretes, lenguajes y runtimes, que es donde más naturalmente vive.

Mi preferencia sería **la opción A para el GC “fundamental”** y dejar una segunda reapertura más adelante dentro del bloque de runtimes.

### 4.3 Qué debería cubrir ese bloque

Un bloque de GC bien armado podría incluir:

- modelo de objetos y heap
- raíces
- mark and sweep
- tracing de grafos de objetos
- sweep y free lists
- compactación
- generational GC
- barreras de escritura
- finalizers y weak references
- interacción con arenas y allocators
- stop-the-world vs incremental

### 4.4 Proyectos que encajan muy bien

Sin tocar nada actual, agregaría:

- **gc-lab**: collector mark-sweep mínimo
- **managed-heap**: heap de objetos con roots explícitas
- **mini-lang-gc**: intérprete pequeño con heap administrado
- **generational-gc-demo**: demo de generaciones y promoción
- **runtime-heap**: heap + object model + visitor/trace

### 4.5 Relación con `Lógico`

`Lógico` ya menciona un GC mark-and-sweep usando `custom-malloc`, así que es un candidato natural para reapertura. Pero eso no alcanza como cobertura del tema.

La mejor lectura sería:

- el bloque de GC enseña el modelo
- `Lógico` lo aplica
- `custom-malloc` le da soporte de memoria
- `JIT-Brain` permite ver la evolución hacia ejecución más cercana al metal

---

## 5. Cómo unir runtime y GC en una misma línea pedagógica

Estos dos temas se benefician mucho si se los piensa como un arco común:

1. representación de datos y memoria
2. allocators
3. GC
4. runtime
5. intérpretes / VMs
6. async executors
7. JIT
8. embedding y plugins

Ese arco es muy potente porque enseña que un lenguaje no es solo sintaxis:

- necesita heap
- necesita política de memoria
- necesita scheduler o loop
- necesita manejo de errores
- necesita integración con el sistema operativo

En ese sentido, runtime y GC no son “extras”; son una parte esencial de la formación de systems bien completa.

---

## 6. Agregados concretos que yo introduciría

### 6.1 Nuevos microbloques sugeridos

Sin borrar nada de lo actual, se podrían sumar estos bloques auxiliares:

#### Bloque A — Formatos y serialización
Contenido:

- representación binaria
- checksums
- compatibilidad de formatos
- codecs simples
- versiones de esquema

#### Bloque B — Rust avanzado
Contenido:

- `Rc` / `Arc`
- `RefCell` / `Cell`
- `Pin`
- `Send` / `Sync`
- `unsafe` idiomático

#### Bloque C — Runtimes y VMs
Contenido:

- bytecode
- frames
- dispatch
- embeddings
- coroutines
- event loop

#### Bloque D — Memoria administrada y GC
Contenido:

- roots
- tracing
- compactación
- generaciones
- barreras
- finalización

#### Bloque E — POSIX fino
Contenido:

- `fcntl`
- `openat`
- PTY/TTY
- `dup2`
- `epoll`
- `statx`

### 6.2 Proyectos nuevos de alto valor

Yo sumaría, como mínimo, estos:

- `format-lab`
- `bytecode-vm`
- `gc-lab`
- `mini-runtime`
- `coroutine-executor`
- `object-store-format`
- `pty-shell-lab`

No todos tienen que ser grandes. Algunos pueden ser muy focalizados y otros más integradores.

---

## 7. Cómo evaluaría el lugar de runtime y GC dentro del mapa actual

### 7.1 Runtime

Mi veredicto es que **runtime merece bloque propio**.
No lo pondría solo como subtítulo de `async-runtime` o `Lógico`, porque perdería identidad conceptual.

Lo más sano es tratarlo como una capa de diseño que aparece:

- primero como runtime de intérprete
- después como runtime de VM
- después como runtime de tareas / async
- finalmente como runtime de sistema o plugin host

Eso le da continuidad y evita que sea solo un proyecto aislado.

### 7.2 GC

Mi veredicto es que **GC merece bloque propio o, como mínimo, una subrama fuerte**.
Tiene suficiente peso teórico y práctico como para no quedar subsumido por `Lógico`.

Idealmente:

- un bloque teórico introductorio
- una aplicación directa en `Lógico`
- una reapertura posterior con generational/compacting GC

---

## 8. Orden recomendado de incorporación

Sin eliminar nada, la secuencia de agregados que más valor me da sería:

1. formatos y serialización
2. POSIX fino
3. Rust avanzado
4. GC
5. runtimes y VMs
6. async executor ampliado
7. embedding y plugins

Ese orden respeta bastante bien la progresión actual y refuerza los puntos donde hoy hay más salto.

---

## 9. Resumen ejecutivo

Si tuviera que condensarlo en una frase:

**Forja está muy fuerte en teoría y en proyectos, pero ganaría muchísimo si agrega una capa explícita de formatos/serialización, un bloque serio de GC, y un bloque propio de runtimes y máquinas virtuales.**

Eso no reemplaza nada. Solo hace que el mapa gane más continuidad, más profundidad y más “segunda mitad” real en la formación.

---

## 10. Próximo paso sugerido

La mejor evolución sería convertir estas ideas en una **versión extendida del mapa curricular**, con:

- nuevos bloques opcionales
- nuevos proyectos propuestos
- ubicación exacta de cada agregado
- dependencias mínimas para no romper la progresión

