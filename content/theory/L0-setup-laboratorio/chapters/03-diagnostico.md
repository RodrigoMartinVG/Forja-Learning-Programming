# Diagnostico y recuperacion

En L0 no alcanza con que el laboratorio ande una vez. Tambien hace falta saber recuperarlo cuando deja de coincidir con lo que declara el repo.

## Fallos de arranque

Primer caso tipico: VS Code no logra abrir el devcontainer o el build falla al principio.

Antes de cambiar archivos del repo, conviene distinguir:

- Docker Desktop o el daemon no estan corriendo
- la imagen necesita rebuild por un cambio reciente
- el error viene de red o de descarga de paquetes

Esa separacion evita diagnosticos vagos como "el contenedor esta roto".

## Herramienta declarada pero no disponible

Si el Dockerfile dice que una herramienta deberia existir pero en terminal no aparece, la pregunta correcta no es "por que no anda?" sino "en que capa se rompio?".

Revisa, en este orden:

1. la instalacion realmente ocurre en el Dockerfile
2. hubo rebuild despues del cambio
3. el binario quedo en una ruta del `PATH`
4. `verify-setup.sh` o tu check manual estan preguntando por el nombre correcto

Una cadena de evidencia minima para este caso puede salir de estos comandos:

```bash
grep -n 'cargo-expand' .devcontainer/Dockerfile
grep -n 'cargo expand' verify-setup.sh
command -v cargo-expand || true
```

Con eso ya podes separar "nunca se instala", "se instala pero no se verifica" y "se instala pero no esta visible en PATH".

## Cambios en Dockerfile que no aparecen

Este es el error mas comun del dia cero: editar el Dockerfile y seguir usando un contenedor viejo.

La regla practica es simple: si la definicion de la imagen cambia, espera hacer rebuild. Si no lo haces, observas el estado viejo y el repo parece mentir.

Para anclar esa regla en archivos del repo:

```bash
grep -n 'FORJA_INSTALL_NIGHTLY' .devcontainer/Dockerfile .devcontainer/devcontainer.json
```

Ese par de referencias muestra que una parte del estado del contenedor se decide antes de abrir la terminal.

## Host y contenedor diciendo cosas distintas

A veces el host y el contenedor muestran versiones o paths distintos. Eso no es automaticamente un bug. Muchas veces solo significa que estas mezclando dos entornos.

Para L0, la prioridad es que el recorrido documentado funcione dentro del contenedor. El host importa como plataforma para lanzar VS Code y Docker, no como referencia principal de toolchain.

Cuando el problema persiste, documenta el sintoma exacto y vuelve al contrato:

- que archivo declara el estado esperado
- que comando muestra el estado observado
- que paso de reconstruccion o verificacion ya probaste

Ese formato hace el problema mucho mas tratable que un "no me anda" generico.