# El laboratorio

Hay una diferencia enorme entre el programador que sabe que su entorno funciona y el que espera que funcione. En programación de sistemas esa diferencia importa todavía más, porque el entorno no es decorado: es parte del experimento.

Cuando escribís un programa que gestiona memoria manualmente, que manipula descriptores de archivo, que lanza procesos o que hace syscalls, el comportamiento que observás depende de la libc que tenés instalada, del compilador con sus flags exactas, de la versión del kernel y de una docena de variables más. Si dos personas trabajan con entornos diferentes y obtienen resultados distintos, no hay forma de saber si están aprendiendo algo distinto o si simplemente tienen distintas versiones de glibc.

Por eso Forja arranca con un laboratorio reproducible. No para esconder Linux debajo de una capa de abstracción, sino para tener un piso común desde el que mirar procesos, binarios, syscalls y memoria sin accidentes artificiales.

> Un buen comienzo en sistemas no es heroico. Es reproducible.

## Qué es un Dev Container (y qué no es)

El laboratorio de Forja es un **Dev Container**: un contenedor Docker configurado como ambiente de desarrollo e integrado directamente con VS Code. Antes de ver cómo se usa, conviene entender qué es un contenedor y en qué se diferencia de una máquina virtual.

Una **máquina virtual** emula hardware completo: tiene su propio kernel, su propia BIOS, su propia memoria asignada. Es fuerte en aislamiento pero cara en recursos.

Un **contenedor** no emula hardware. Comparte el kernel del host pero aísla el sistema de archivos, los procesos y la red usando mecanismos del propio kernel Linux: **namespaces** (para aislar procesos, red, montajes) y **cgroups** (para limitar recursos). El resultado es un proceso —o grupo de procesos— que cree estar en su propio Linux, pero realmente comparte el kernel con el host. Arranca en milisegundos y pesa mucho menos que una VM.

> **Nota sobre Windows y macOS**: ni Windows ni macOS tienen el kernel Linux. Docker Desktop en esos sistemas corre una VM Linux liviana (en Windows usa WSL2; en macOS usa una VM ligera de Apple). Dentro de esa VM corre Docker. El efecto práctico es que el contenedor tiene un kernel Linux real, aunque no es el kernel del sistema operativo host.

Para Forja esto es relevante porque `strace`, `perf`, y varias herramientas más usan características del kernel Linux directamente. En el contenedor funcionan de forma idéntica sin importar si el host es Windows, macOS o Linux nativo.

## Qué tiene instalado el laboratorio

El contenedor incluye el conjunto de herramientas necesarias para todos los niveles de Forja:

| Herramienta | Para qué | Aparece en |
|---|---|---|
| `gcc`, `clang` | Compilar C con distintos backends | L0 en adelante |
| `cargo`, `rustc` | Compilar Rust y gestionar dependencias | L3 en adelante |
| `gdb` | Debugger simbólico de bajo nivel | L0 en adelante |
| `valgrind` | Detección de errores de memoria | L0 en adelante |
| `strace` | Observar syscalls en tiempo real | L0 en adelante |
| `ltrace` | Observar llamadas a funciones de biblioteca | L2 en adelante |
| `perf` | Profiling de rendimiento | L17 en serio |
| `objdump`, `readelf` | Inspección de binarios y ELF | L1b, L7 |
| `nm` | Ver tabla de símbolos de un binario | L7, mini-linker |
| `clang-format`, `clang-tidy` | Formateo y análisis estático | todos los niveles |
| `make`, `cmake` | Sistemas de build | L0 en adelante |
| `python3` | Scripts de soporte y automatización | varios proyectos |
| `git` | Control de versiones | siempre |

Las herramientas marcadas "L17 en serio" o similares están instaladas desde L0 pero se usan superficialmente hasta llegar a su nivel natural. Eso es intencional: que la herramienta esté presente no significa que haya que dominarla ahora.

## Archivos montados vs copiados

Cuando VS Code abre el repositorio dentro del contenedor, los archivos del repositorio **no se copian** al contenedor. Se **montan**: el contenedor los ve como si fueran suyos, pero en realidad están en el sistema de archivos del host. Editás con VS Code en el host, ejecutás en Linux dentro del contenedor.

Esto tiene consecuencias prácticas:
- Un `git commit` desde la terminal del contenedor actúa sobre el repositorio real del host.
- Los archivos compilados (`.o`, ejecutables) se crean dentro del contenedor. Si borras el contenedor, esos archivos desaparecen. El código fuente no.
- Si el contenedor se cuelga o queda en estado inconsistente, podés destruirlo y reconstruirlo sin perder nada del repositorio.

## Cómo abrirlo

### Opción 1: VS Code + Docker (recomendada para trabajo local)

1. Instalá [Docker Desktop](https://www.docker.com/products/docker-desktop/) y [VS Code](https://code.visualstudio.com/).
   - En Windows, Docker Desktop requiere WSL2. El instalador lo configura automáticamente.
   - Alternativas a Docker Desktop: **Rancher Desktop** (open source, sin licencia comercial) o **Podman Desktop** funcionan también con devcontainers.
2. Instalá la extensión **Dev Containers** de VS Code (`ms-vscode-remote.remote-containers`).
3. Cloná el repositorio:
   ```bash
   git clone https://github.com/forja-lab/forja.git
   cd forja
   ```
4. Abrí VS Code en esa carpeta. Aparecerá una notificación: *"Reopen in Container"*. Hacé clic. (Si no aparece: `Ctrl+Shift+P` → `Dev Containers: Reopen in Container`.)
5. VS Code descarga la imagen, construye el contenedor y reabre el editor dentro de él. **La primera vez tarda varios minutos** porque descarga la imagen base y ejecuta el Dockerfile. Las veces siguientes son casi instantáneas porque Docker cachea las capas.

Desde ese momento, la terminal integrada de VS Code está dentro del contenedor Linux. Podés verificarlo:

```bash
uname -a          # debe mostrar Linux, no Darwin ni Windows
gcc --version     # debe responder
cargo --version   # debe responder
```

### Opción 2: GitHub Codespaces (sin instalación local)

GitHub Codespaces ejecuta exactamente el mismo devcontainer en la nube. Sin instalación local, sin requisitos de hardware:

1. Abrí el repositorio en GitHub.
2. Hacé clic en **Code → Codespaces → Create codespace on main**.
3. El ambiente arranca en minutos. Editás y ejecutás todo desde el navegador, o conectando VS Code local al Codespace.

La experiencia es idéntica a VS Code local. El plan gratuito de GitHub incluye horas de Codespaces suficientes para trabajar con Forja. El límite actual (2025) es 120 horas/mes en la cuenta free.

### Opción 3: Docker manual (cualquier editor)

Si preferís Neovim, Emacs, Zed o cualquier otro editor, podés construir y entrar al contenedor directamente:

```bash
# Construir la imagen (solo la primera vez, o después de cambiar el Dockerfile)
docker build -t forja-lab .devcontainer/

# Entrar con el repo montado
docker run -it --rm \
  -v "$(pwd):/workspace" \
  -w /workspace \
  forja-lab bash
```

La flag `-v "$(pwd):/workspace"` monta el directorio actual en `/workspace` dentro del contenedor. `-w /workspace` lo convierte en el directorio de trabajo inicial. `--rm` destruye el contenedor al salir (los archivos del repo quedan intactos por el montaje).

## Verificar que todo funciona

El repositorio incluye un script de verificación:

```bash
bash verify-setup.sh
```

El script comprueba que cada herramienta del laboratorio existe y responde, que `gcc` y `cargo` tienen versiones mínimas aceptables, y que el contenedor puede compilar y ejecutar un programa mínimo en C y en Rust. El output es explícito: si algo falla, te dice exactamente qué.

Ejecutalo la primera vez que abras el contenedor. Si en algún momento algo deja de funcionar (después de una actualización de Docker, por ejemplo), volvé a ejecutarlo para saber qué cambió.

## La anatomía del `.devcontainer/`

```
.devcontainer/
├── devcontainer.json    # Qué hace VS Code con el contenedor
└── Dockerfile           # Qué tiene instalado el contenedor
```

### `devcontainer.json`

Este archivo le dice a VS Code cómo levantar y configurar el contenedor:

```json
{
  "name": "Forja Lab",
  "build": { "dockerfile": "Dockerfile" },
  "customizations": {
    "vscode": {
      "extensions": ["ms-vscode.cpptools", "rust-lang.rust-analyzer"]
    }
  },
  "postCreateCommand": "bash verify-setup.sh"
}
```

- `build.dockerfile` apunta al Dockerfile que define la imagen.
- `customizations.vscode.extensions` lista las extensiones que VS Code instala automáticamente dentro del contenedor. Estas extensiones corren dentro del contenedor, no en el host — tienen acceso directo a los compiladores y pueden mostrar errores en tiempo real.
- `postCreateCommand` es un comando que se ejecuta una sola vez después de crear el contenedor por primera vez. En Forja ejecuta el script de verificación.

No hace falta modificar `devcontainer.json` para trabajar normalmente. Si necesitás agregar extensiones o configurar variables de entorno, este es el lugar.

### `Dockerfile`

El Dockerfile define la imagen: una pila de capas que parten de una imagen base y agregan herramientas:

```dockerfile
FROM ubuntu:24.04

# Herramientas del sistema
RUN apt-get update && apt-get install -y \
    gcc clang gdb valgrind strace ltrace \
    make cmake git python3 ...

# Rust via rustup
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
```

Cada `RUN` agrega una capa. Docker cachea las capas: si modificás solo la última línea del Dockerfile, reconstruir es rápido porque todas las capas anteriores ya están en caché. Si modificás una línea del medio, todas las capas posteriores se invalidan y se reconstruyen.

> **No necesitás entender Docker en profundidad para trabajar con Forja.** Containers y orquestación tienen su lugar en el mapa (L20, L21). Por ahora alcanza con saber que el Dockerfile existe, que podés agregar una herramienta con `apt-get install`, y que después de modificarlo necesitás reconstruir.

## Cómo reconstruir el contenedor

Si modificás el `Dockerfile` o si el contenedor queda en mal estado:

- **VS Code**: `Ctrl+Shift+P` → `Dev Containers: Rebuild Container`
- **Docker manual**: `docker build -t forja-lab .devcontainer/ --no-cache`

La reconstrucción descarta el contenedor anterior y crea uno nuevo desde el Dockerfile. Los archivos del repositorio no se tocan: están montados, no copiados.

> **Reiniciar vs reconstruir**: si el contenedor se cuelga o se comporta raro, muchas veces alcanza con reiniciarlo (`Dev Containers: Reopen in Container`) sin reconstruirlo. La reconstrucción completa es para cuando cambiás el Dockerfile o querés un estado perfectamente limpio.

## Sobre puertos y red

El contenedor tiene su propia red. Si en algún nivel (L16 en adelante) levantás un servidor HTTP o TCP dentro del contenedor, necesitás exponer el puerto explícitamente para accederlo desde el host.

En `devcontainer.json` se hace con:
```json
"forwardPorts": [8080, 9090]
```

Para L0 esto no importa. Pero cuando llegues a los niveles de red y te preguntes por qué no podés conectarte al servidor que corrés en el contenedor, volvé acá.

## Por qué esto es parte del contenido

El proyecto `devcontainer-setup` de este nivel no es burocracia. Documentar un ambiente, hacerlo reproducible y dejarlo verificable son habilidades de ingeniería real. Nadie en producción dice "en mi máquina funciona". La reproducibilidad es una disciplina, y Forja la instala desde el primer día.


Cuando escribís un programa que gestiona memoria manualmente, que manipula descriptores de archivo, que lanza procesos o que hace syscalls, el comportamiento que observás depende de la libc que tenés instalada, del compilador con sus flags exactas, de la versión del kernel y de una docena de variables más. Si dos personas trabajan con entornos diferentes y obtienen resultados distintos, es difícil saber qué están aprendiendo realmente y qué es ruido ambiental.

Por eso Forja arranca con un laboratorio reproducible. No para esconder Linux debajo de una capa de abstracción, sino para tener un piso común desde el que mirar procesos, binarios, syscalls y memoria sin accidentes artificiales.

> Un buen comienzo en sistemas no es heroico. Es reproducible.

## Qué es el devcontainer

El laboratorio de Forja es un **Dev Container**: un contenedor Docker configurado como ambiente de desarrollo, integrado directamente con VS Code. La idea es simple: en lugar de instalar herramientas en tu sistema operativo principal, arrancás un contenedor Linux que ya tiene todo instalado y listo.

El contenedor no reemplaza a Linux. Si tenés Linux nativo, el contenedor te da aislamiento y reproducibilidad sin contaminar tu sistema. Si trabajás en macOS o Windows (vía WSL2), el contenedor te da un Linux completo con el mismo conjunto de herramientas que usa cualquier otra persona que trabaje con Forja.

Lo que hay dentro del contenedor:

| Herramienta | Para qué |
|---|---|
| `gcc`, `clang` | Compilar C con distintos backends |
| `cargo`, `rustc` | Compilar Rust y gestionar dependencias |
| `gdb` | Debugger simbólico de bajo nivel |
| `valgrind` | Detección de errores de memoria |
| `strace` | Observar syscalls en tiempo real |
| `perf` | Profiling de rendimiento |
| `objdump`, `readelf` | Inspección de binarios y ELF |
| `clang-format`, `clang-tidy` | Formateo y análisis estático |
| `make`, `cmake` | Sistemas de build |
| `python3` | Scripts de soporte y automatización |

## Cómo abrirlo

### Opción 1: VS Code + Docker (recomendada para trabajo local)

1. Instalá [Docker Desktop](https://www.docker.com/products/docker-desktop/) y [VS Code](https://code.visualstudio.com/).
2. Instalá la extensión **Dev Containers** de VS Code (`ms-vscode-remote.remote-containers`).
3. Cloná el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/forja.git
   cd forja
   ```
4. Abrí VS Code en esa carpeta. Aparecerá una notificación: *"Reopen in Container"*. Hacé clic.
5. VS Code descarga la imagen, construye el contenedor y reabre el editor dentro de él. La primera vez tarda unos minutos; las siguientes son casi instantáneas.

Desde ese momento, la terminal integrada de VS Code ya está dentro del contenedor Linux. Los archivos de tu repositorio están montados: editás desde el host, ejecutás desde Linux.

### Opción 2: GitHub Codespaces (sin instalación local)

Si no podés o no querés instalar Docker, GitHub Codespaces ejecuta exactamente el mismo devcontainer en la nube:

1. Abrí el repositorio en GitHub.
2. Hacé clic en **Code → Codespaces → Create codespace on main**.
3. El ambiente arranca en minutos. Editás y ejecutás todo desde el navegador.

La experiencia es idéntica a VS Code local, solo que el contenedor corre en servidores de GitHub.

### Opción 3: Docker manual (sin VS Code)

Si preferís otro editor, podés construir y entrar al contenedor directamente:

```bash
# Construir la imagen
docker build -t forja-lab .devcontainer/

# Iniciar el contenedor con el repo montado
docker run -it --rm \
  -v "$(pwd):/workspace" \
  -w /workspace \
  forja-lab bash
```

Desde esa bash ya tenés todo el laboratorio disponible.

## Verificar que todo funciona

El repositorio incluye un script que verifica la instalación completa:

```bash
bash verify-setup.sh
```

El script comprueba que los binarios esperados existen, que `gcc` y `cargo` tienen versiones aceptables, y que el contenedor puede compilar y ejecutar un programa mínimo. Si algo falla, el output te dice exactamente qué falta.

## La anatomía del `.devcontainer/`

```
.devcontainer/
├── devcontainer.json    # Configuración del contenedor para VS Code
└── Dockerfile           # Imagen base + instalación de herramientas
```

**`devcontainer.json`** le dice a VS Code cómo levantar el contenedor: qué imagen usar, qué extensiones instalar automáticamente, qué variables de entorno configurar y qué puerto exponer. No hace falta tocarlo para trabajar normalmente.

**`Dockerfile`** define la imagen. Parte de Debian/Ubuntu slim y agrega las herramientas del laboratorio capa a capa. Si en algún momento necesitás agregar una herramienta que no está, este es el archivo correcto. Después de editarlo, reconstruís el contenedor desde VS Code con *"Rebuild Container"*.

## Cómo reconstruir el contenedor

Si modificás el `Dockerfile` o si algo en el contenedor queda en mal estado:

- **VS Code**: `Ctrl+Shift+P` → `Dev Containers: Rebuild Container`
- **Docker manual**: `docker build -t forja-lab .devcontainer/ --no-cache`

La reconstrucción descarta el estado del contenedor y produce uno nuevo desde el `Dockerfile`. Tus archivos del repositorio no se tocan porque están montados, no copiados.

## Por qué esto es parte del contenido

El proyecto `devcontainer-setup` de este nivel no es burocracia. Es la primera pieza real que construís: documentar tu ambiente, hacerlo reproducible, dejarlo verificable. Esas son habilidades de ingeniería real, no de principiante.

Nadie en producción dice "en mi máquina funciona". La reproducibilidad es una disciplina, y Forja la instala desde el primer día.
