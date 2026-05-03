# El devcontainer como contrato de trabajo

Una forma practica de pensar el devcontainer es esta: no es un detalle de tooling, es el contrato operativo minimo del repo.

## Los archivos que definen el entorno

Hay tres lugares que conviene ubicar de memoria:

- `.devcontainer/Dockerfile`: que se instala en la imagen
- `.devcontainer/devcontainer.json`: como VS Code abre el repo dentro del contenedor
- `verify-setup.sh`: que checks rapidos se consideran suficientes para dar el laboratorio por sano

Si no queda claro donde vive una decision del entorno, ese es el primer sitio para mirar.

## Imagen, contenedor y workspace

Conviene separar tres cosas que suelen mezclarse:

- imagen: receta versionada para construir el entorno base
- contenedor: instancia concreta creada a partir de esa imagen
- workspace: copia del repo que editas desde VS Code

La imagen cambia cuando cambia el Dockerfile y se reconstruye. El contenedor cambia cuando se crea de nuevo. El workspace es la copia del repo que se edita desde VS Code y puede persistir aunque el contenedor se descarte.

## Que persiste y que se reconstruye

Dos reglas practicas sirven mucho al principio:

1. Si cambias archivos del repo, el cambio suele estar en el workspace y no hace falta rebuild inmediato.
2. Si cambias la definicion del entorno, como el Dockerfile o algunas opciones del devcontainer, probablemente haga falta rebuild.

Esta diferencia importa porque evita dos errores opuestos:

- hacer rebuild por cualquier cosa y perder tiempo
- no hacer rebuild cuando el cambio vive en la imagen y concluir que "Docker no anda"

## Comprobacion rapida

Antes de seguir, conviene mirar el contrato real en archivos del repo:

```bash
ls -la .devcontainer
sed -n '1,40p' .devcontainer/Dockerfile
jq '{dockerfile: .build.dockerfile, remoteUser: .remoteUser}' .devcontainer/devcontainer.json
```

Si esos tres comandos todavia no dejan claro donde vive cada decision, todavia falta ubicar bien el contrato del entorno.

## Donde mirar cuando algo no coincide

Cuando el entorno declarado y el entorno observado dicen cosas distintas, usa esta secuencia:

1. confirmar que la terminal abierta pertenece al contenedor correcto
2. revisar el Dockerfile o `devcontainer.json` que deberian explicar el estado esperado
3. correr `bash verify-setup.sh`
4. decidir si el problema es falta de rebuild, PATH distinto o herramienta ausente

El objetivo de L0 no es memorizar cada detalle del contenedor. Es aprender a seguir esta cadena de evidencia sin improvisar.