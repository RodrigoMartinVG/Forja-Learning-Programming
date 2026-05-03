# Ejercicios - L0

Estos ejercicios buscan que el laboratorio deje de ser algo que solo "se abre" y pase a ser algo que podés verificar con evidencia.

## Ejercicio 1 - Dónde vive cada decisión

Corre:

```bash
sed -n '1,25p' .devcontainer/Dockerfile
jq '{dockerfile: .build.dockerfile, remoteUser: .remoteUser}' .devcontainer/devcontainer.json
sed -n '1,20p' verify-setup.sh
```

Pregunta: cuál de estos archivos declara la instalación de herramientas base como `clang`, `gdb` y `jq`?

- A. `.devcontainer/devcontainer.json`
- B. `.devcontainer/Dockerfile`
- C. `verify-setup.sh`

**Correcta:** B.

Verificación: en la salida del Dockerfile tiene que aparecer `apt-get install -y` seguido de esas herramientas.

## Ejercicio 2 - Qué archivo describe la apertura del contenedor

Corre:

```bash
jq '{dockerfile: .build.dockerfile, remoteUser: .remoteUser, terminal: .customizations.vscode.settings["terminal.integrated.defaultProfile.linux"]}' .devcontainer/devcontainer.json
```

Pregunta: qué archivo fija el `remoteUser` y la configuración de VS Code dentro del devcontainer?

- A. `.devcontainer/devcontainer.json`
- B. `.devcontainer/Dockerfile`
- C. `content/theory/L0-setup-laboratorio/meta.yaml`

**Correcta:** A.

Verificación: la salida JSON del comando debe mostrar `remoteUser` y la configuración del terminal leídos desde `devcontainer.json`.

## Ejercicio 3 - Contrato base versus snapshot manual

Corre:

```bash
bash verify-setup.sh | sed -n '1,12p'
grep -n '^run_check' verify-setup.sh | sed -n '1,12p'
bash content/theory/L0-setup-laboratorio/src/toolchain_snapshot.sh
```

Pregunta: cuál de estas herramientas aparece en el snapshot manual pero no se verifica con `run_check` en `verify-setup.sh`?

- A. `clang`
- B. `cargo`
- C. `rustc`

**Correcta:** C.

Verificación: `verify-setup.sh` tiene `run_check` para `cargo`, pero no para `rustc`; `toolchain_snapshot.sh` sí imprime `rustc --version`.

## Ejercicio 4 - Perfil base y nightly opcional

Corre:

```bash
jq -r '.build.args.FORJA_INSTALL_NIGHTLY' .devcontainer/devcontainer.json
grep -n 'nightly' verify-setup.sh
```

Pregunta: con la configuración actual del repo, qué pasa con nightly y `miri` en el perfil base?

- A. Se instalan y se exigen siempre.
- B. No se instalan por defecto; el script los marca como `skip` si no están.
- C. No aparecen ni en la build ni en la verificacion.

**Correcta:** B.

Verificación: `FORJA_INSTALL_NIGHTLY` vale `false` y `verify-setup.sh` tiene una rama que imprime `[skip] not installed in base profile`.

## Ejercicio 5 - Transferencia al proyecto

Corre:

```bash
grep -n '^run_check' verify-setup.sh | tail -n 8
```

Tarea: proponé un check nuevo para `devcontainer-setup` siguiendo este formato mínimo:

- herramienta
- comando exacto de verificacion
- por qué importa en Forja
- primer nivel o proyecto donde esperas usarla

La respuesta sigue siendo válida solo si puede agregarse al script usando el patrón `run_check "label" "comando"`.

