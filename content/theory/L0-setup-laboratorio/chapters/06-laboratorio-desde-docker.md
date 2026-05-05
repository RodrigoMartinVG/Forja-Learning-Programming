# El laboratorio desde Docker (capítulo opcional)

> Este capítulo es **opcional**. No agrega nada que un nivel posterior necesite, y `L1` puede empezarse sin haberlo leído. Está pensado para quien, después de los cinco capítulos anteriores, quiera ver con sus propios ojos —y desde fuera del devcontainer— las piezas que el [capítulo 01](01-devcontainer.md) describió en clave conceptual: la imagen, el contenedor, el bind mount del repo. Si la pregunta *"¿qué es exactamente lo que VS Code está haciendo cuando dice 'Reopen in Container'?"* dejó alguna curiosidad pendiente, este capítulo la cierra.

## Por qué mirar el lab desde afuera

Hasta acá, todas las observaciones del nivel se hicieron desde dentro del contenedor: una terminal abierta por VS Code, comandos lanzados sobre el workspace montado, lecturas de archivos del repo a través de ese mount. Esa perspectiva alcanza para todo el trabajo cotidiano y es, deliberadamente, la que el resto del track va a usar.

Pero el [capítulo 01](01-devcontainer.md) afirmó cosas que desde adentro no se pueden comprobar del todo. *"La imagen es un objeto inmutable identificado por un hash"*: el hash existe, pero desde dentro del contenedor no se ve. *"El contenedor es una instancia de la imagen con su propio identificador"*: el identificador existe, pero el contenedor no se conoce a sí mismo desde adentro. *"El workspace es un bind mount, no una copia"*: el resultado se nota, pero el mount mismo —su origen en el host, su destino en el contenedor— sólo está completo si uno se ubica del lado de Docker.

Mirar el lab desde afuera no aporta una capacidad nueva; aporta una verificación. Permite confirmar que las piezas que el cap. 01 nombró existen como objetos manipulables, y no son sólo un modelo mental conveniente. Eso desmistifica al devcontainer: deja de ser un sistema mágico y pasa a ser una capa fina sobre tres comandos básicos de Docker.

## Las tres listas: imágenes, contenedores corriendo, contenedores totales

Tres comandos alcanzan para enumerar las piezas del lab tal como Docker las ve. Conviene ejecutarlos desde una terminal del **host**, no desde dentro del contenedor.

```bash
$ docker images
REPOSITORY              TAG       IMAGE ID       CREATED         SIZE
vsc-forja-...           latest    8a9c1e2f4b76   2 hours ago     1.42GB

$ docker ps
CONTAINER ID   IMAGE          STATUS         NAMES
3fa1c8d72eab   vsc-forja-...  Up 13 minutes  upbeat_shockley

$ docker ps -a
CONTAINER ID   IMAGE          STATUS                       NAMES
3fa1c8d72eab   vsc-forja-...  Up 13 minutes                upbeat_shockley
b71e229c0aa4   vsc-forja-...  Exited (137) 4 hours ago     stale_shannon
```

`docker images` lista imágenes locales: la que VS Code construyó a partir del `Dockerfile` aparece con un nombre que empieza con `vsc-forja-` (el prefijo `vsc-` lo agrega Dev Containers). El `IMAGE ID` es el hash que el cap. 01 mencionó, y la columna `CREATED` indica cuándo se hizo el último build —comparable contra la última modificación del `Dockerfile`.

`docker ps` lista contenedores que están corriendo *en este momento*. Con el devcontainer abierto, debería verse exactamente uno asociado a la imagen anterior. Si VS Code está cerrado, puede no haber ninguno.

`docker ps -a` (con `-a` de *all*) lista contenedores corriendo y detenidos. Es donde aparecen los rastros de sesiones anteriores: contenedores de rebuilds previos que quedaron parados, contenedores que terminaron con error. Cada `Rebuild Container` deja en general un contenedor nuevo y, según la versión de Dev Containers, puede dejar el viejo sin borrar. Esa acumulación es la causa más común de discos llenos en máquinas que llevan un rato usando devcontainers, y el remedio aparece más adelante en este capítulo.

## Inspeccionar un contenedor: el bind mount como objeto

Las listas anteriores sólo dan nombres. Para ver detalle, está `docker inspect`, que devuelve la descripción completa del objeto en JSON. Aquí interesa una rebanada chica: la sección `Mounts`, que muestra los mounts efectivamente activos.

```bash
$ docker inspect upbeat_shockley --format '{{json .Mounts}}' | jq
[
  {
    "Type": "bind",
    "Source": "/c/Users/.../Forja-Learning-Programming",
    "Destination": "/workspaces/Forja-Learning-Programming",
    "Mode": "rw",
    "RW": true,
    ...
  }
]
```

Esta es la prueba material de la afirmación central del cap. 01: el workspace es un bind mount. `Source` es la ruta del repo en el host —tal como la ve el sistema operativo de la máquina— y `Destination` es la ruta donde el contenedor lo ve. No hay copia: el mismo conjunto de archivos se observa desde dos lados. Cualquier edición en `Source` aparece inmediatamente en `Destination`, y viceversa, porque ambos nombran lo mismo.

Si en algún momento un archivo creado desde dentro del contenedor "no aparece" en el host, este `inspect` es la primera comprobación útil: confirma si el mount existe, hacia qué `Source` apunta, y con qué modo (`rw` para lectura/escritura, `ro` para sólo lectura).

`docker inspect` sin `--format` y sin `jq` devuelve el JSON entero, que incluye además las variables de entorno que el contenedor recibió, los puertos publicados, la imagen exacta de la que se instanció, y la fecha de creación. Es ruidoso para uso cotidiano; conviene filtrar campos puntuales con `--format`. Algunos atajos útiles:

```bash
$ docker inspect <nombre> --format '{{.Image}}'                     # imagen base
$ docker inspect <nombre> --format '{{.State.Status}}'              # corriendo / detenido
$ docker inspect <nombre> --format '{{.Config.WorkingDir}}'         # cwd al entrar
$ docker inspect <nombre> --format '{{json .Config.Env}}' | jq      # variables de entorno
```

## Ciclo de vida del contenedor

Hasta ahora, todo se hizo desde VS Code: abrir, cerrar, *Rebuild Container*. Los mismos eventos se pueden disparar desde Docker directamente. Este recorrido no se propone como flujo alternativo recomendado; el devcontainer en VS Code sigue siendo la forma estándar de operar el lab. La idea es ver con qué primitivas está construido lo que VS Code automatiza.

```bash
$ docker stop upbeat_shockley         # detiene el contenedor (lo deja en 'Exited')
$ docker start upbeat_shockley        # vuelve a arrancarlo (mismo contenedor, mismo estado)
$ docker exec -it upbeat_shockley bash  # abre una shell dentro de un contenedor corriendo
$ docker rm upbeat_shockley           # elimina el contenedor (debe estar detenido)
```

Cuatro observaciones que ordenan la pieza:

Primera: `stop` detiene, `start` retoma. Entre los dos, el contenedor **conserva** todo lo que tenía adentro: paquetes instalados manualmente con `apt`, archivos creados en `/tmp`, variables exportadas en una shell. Eso es lo que VS Code aprovecha cuando uno cierra y vuelve a abrir el editor sin pedir rebuild.

Segunda: `exec` es la primitiva de "abrir una nueva terminal dentro del contenedor". Cada terminal nueva que VS Code abre en el devcontainer es, por debajo, un `docker exec`. Por eso una variable exportada en una terminal no aparece en la siguiente: cada `exec` arranca una shell limpia.

Tercera: `rm` borra el contenedor. Lo que se pierde es exactamente lo que el cap. 01 listó como volátil: el sistema de archivos escribible por encima de la imagen. Lo que **no** se pierde es el repo en el host (vivía afuera) ni la imagen (es el molde, no la instancia). Después de un `rm`, la próxima vez que VS Code abra el devcontainer va a crear uno nuevo a partir de la misma imagen, y la sesión arrancará idéntica a la primera vez.

Cuarta: la diferencia entre `Rebuild Container` y `rm` + reabrir es exactamente esta: `Rebuild` reconstruye la imagen *y* recrea el contenedor; `rm` recrea sólo el contenedor. Si lo que cambió fue el `Dockerfile`, hace falta `Rebuild`. Si lo que se quiere es empezar el contenedor "limpio" sin reconstruir la imagen, alcanza con `rm` (y reabrir).

## Limpieza de objetos viejos

Cuando `docker ps -a` o `docker images` empiezan a acumular entradas viejas, el disco lo nota antes que el editor. Tres comandos cubren la limpieza ordinaria:

```bash
$ docker rm <id-de-contenedor-detenido>
$ docker rmi <id-de-imagen-no-usada>
$ docker system prune
```

`docker rm` y `docker rmi` borran objetos puntuales por id o nombre. `docker system prune` borra de una pasada todos los contenedores detenidos y todas las imágenes "dangling" (capas huérfanas que ya no pertenecen a ninguna imagen con tag). Es la operación correcta cuando la causa real del problema es disco lleno (el [capítulo 05](05-diagnostico.md) la mencionó al pasar en el escenario 1).

Una salvedad importante: `docker system prune -a` (con `-a`) borra también imágenes con tag que no tengan un contenedor activo apuntando a ellas. Eso incluye, potencialmente, la imagen del devcontainer si VS Code está cerrado. No es destructivo —se reconstruye con el siguiente `Rebuild`—, pero implica esperar el build entero la próxima vez. Conviene usarlo a propósito, no como reflejo.

## El lab sin devcontainer, sólo con Docker

Devcontainer es, en esencia, una manera estandarizada de combinar dos comandos de Docker: `build` y `run`. Reproducir el lab manualmente, sin VS Code y sin la extensión Dev Containers, es un buen ejercicio para confirmar que no hay magia.

Construir la imagen:

```bash
$ cd Forja-Learning-Programming
$ docker build -f .devcontainer/Dockerfile -t forja-lab .devcontainer
```

`-f` indica el `Dockerfile`; el último argumento (`.devcontainer`) es el **contexto de build** —la carpeta cuyos archivos pueden ser referenciados con `COPY`/`ADD` durante el build. `-t forja-lab` etiqueta la imagen resultante con un nombre legible; sin `-t`, la imagen queda accesible solo por hash.

Correr un contenedor a partir de esa imagen, montando el repo del host como workspace:

```bash
$ docker run -it --rm \
    -v "$PWD:/workspaces/Forja-Learning-Programming" \
    -w /workspaces/Forja-Learning-Programming \
    forja-lab bash
```

Esta es la pieza que materializa, en una sola línea, lo que el cap. 01 llamó *"el bind mount como puente con el host"*. Conviene leerla por flag:

- `-it` reserva una terminal interactiva (así `bash` recibe tu teclado y muestra prompts).
- `--rm` elimina el contenedor en cuanto la shell termina. Útil para sesiones efímeras: nada queda en `docker ps -a` después de salir.
- `-v "$PWD:/workspaces/Forja-Learning-Programming"` es **el bind mount del repo**: monta la carpeta actual del host (lado izquierdo del `:`) dentro del contenedor en la ruta `/workspaces/Forja-Learning-Programming` (lado derecho). Es el equivalente exacto del mount que `docker inspect` mostró en la sección anterior.
- `-w /workspaces/Forja-Learning-Programming` fija el directorio de trabajo de la shell al recién montado, así uno entra ya parado en el repo en lugar de en `/`.
- `forja-lab` es la imagen; `bash` es el comando a ejecutar dentro.

Una vez adentro, todo lo que el cap. 01 prometía sobre el bind mount se puede comprobar a mano: editar un archivo desde el contenedor con `echo hola > nota.md` y ver el archivo aparecer en el explorador del host; editar un archivo desde el host y ver el cambio reflejado dentro con `cat`.

Si se necesita exponer el repo en otra ruta del contenedor —por ejemplo en `/workspace` a secas, o sobre dos rutas distintas—, basta con repetir `-v` con otros pares `host:contenedor`. Cada `-v` es un mount independiente. Si se quiere que el contenedor vea el repo pero **no pueda modificarlo**, agregar `:ro` al final del valor:

```bash
-v "$PWD:/workspaces/Forja-Learning-Programming:ro"
```

Esa variante es útil cuando se quiere ejecutar algo dentro del contenedor con la garantía de que no va a alterar fuentes del host. No es el modo del devcontainer, que monta `rw`.

## Lo que este capítulo no se ocupa de cubrir

La lista de cosas que entran como "Docker" es enorme y queda casi entera fuera de `L0`. Para fijar expectativas, vale dejar nombrado lo que este capítulo deliberadamente no toca: redes y publicación de puertos (`-p`, `--network`), volúmenes nombrados como mecanismo distinto del bind mount, `docker compose` y orquestación de varios contenedores, multi-stage builds para imágenes más livianas, registries y `docker push`/`pull`. Cada uno de esos temas es legítimo, pero pertenece a niveles posteriores —`L20` y siguientes para procesos y aislamiento, y eventualmente al proyecto `minidocker` cuando aparezca— donde se aprenden por una razón concreta del track, no como excursión general por una herramienta.

Lo que este capítulo sí deja, después de los cinco anteriores, es una capacidad puntual: ante una duda sobre el lab que las observaciones desde dentro del contenedor no terminan de cerrar, el lector puede ubicarse del lado de Docker, listar las piezas, inspeccionar el bind mount, y comprobar si lo que el repo declaró efectivamente está en uso. Esa capacidad no es necesaria para avanzar a `L1`, pero es exactamente la clase de resorte que el resto del track agradece tener disponible cuando un síntoma raro aparece.
