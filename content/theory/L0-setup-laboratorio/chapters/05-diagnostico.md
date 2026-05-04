# Diagnóstico y recuperación

## Cuando la rutina deja de pasar

La rutina del [capítulo anterior](04-workflow.md) funciona casi todos los días. La promesa de `L0` no es que nunca falle nada; es que cuando algo falle, el lector pueda ubicar el problema con precisión en lugar de reaccionar a ciegas. Este capítulo es el lugar donde esa promesa se hace concreta. Entra en cinco escenarios de fallo que aparecen en la práctica con cierta frecuencia, y para cada uno propone un orden de observación y una acción correctiva mínima.

La estructura de cada escenario es la misma. Primero se describe el síntoma como aparece desde la perspectiva del alumno: qué se intentó, qué se obtuvo, qué se esperaba. Después se identifica la capa probable, recorriendo la cadena que el [capítulo 01](01-devcontainer.md) instaló (archivos del repo, imagen, contenedor, workspace, toolchain). Después se propone un comando de comprobación que confirma o descarta esa hipótesis. Y por último se discute la acción correctiva mínima: el cambio más pequeño que resuelve el problema sin romper otra cosa.

Antes de los cinco escenarios, dos reglas de método que aplican a todos.

**Regla 1: nunca cambiar dos capas a la vez.** Si se sospecha del contenedor y de la toolchain, se prueba primero una hipótesis y, si descarta, recién entonces se mira la otra. Modificar simultáneamente el `Dockerfile` y reconstruir el contenedor mientras se altera el `PATH` produce una situación donde, si el problema desaparece, no se sabe cuál de los dos cambios lo resolvió. La economía de no superponer cambios paga después en capacidad de aprender de cada incidente.

**Regla 2: reconstruir solo cuando la observación lo pide.** *"Rebuild Container"* parece un botón inocente y a veces es la respuesta correcta, pero también borra evidencia. Si el contenedor que está roto contiene información útil sobre qué se rompió, reconstruirlo elimina esa información y, si el problema vuelve, el diagnóstico empieza de cero. El reflejo de reconstruir ante cualquier síntoma es una de las trampas típicas del nivel.

## Escenario 1: el contenedor no arranca

**Síntoma.** Al abrir VS Code, la propuesta *"Reopen in Container"* aparece, se acepta, y al cabo de unos segundos VS Code informa que el contenedor falló al iniciarse. Puede mostrar un mensaje genérico (*"Failed to start container"*) o derivar a una vista de log con un mensaje del runtime de Docker.

**Capa probable.** Tres candidatas, en este orden de probabilidad: la imagen no se construye correctamente (problema en el `Dockerfile`); Docker mismo no está corriendo en el host; o el host se quedó sin recursos para crear un contenedor (típicamente disco). La cuarta posibilidad —`devcontainer.json` malformado— es menos común porque se manifiesta antes con otro mensaje.

**Comprobación.** El primer paso es revisar el log que VS Code provee cuando ofrece *"Show Log"* en el aviso de error. Ese log incluye la salida del intento de build y la salida del intento de arranque. Si la línea de error está en una instrucción `RUN` del `Dockerfile`, la capa es la imagen. Si la línea de error es algo como *"Cannot connect to the Docker daemon"*, la capa es Docker en el host. Si menciona *"no space left on device"* o *"disk full"*, la capa es el disco.

**Acción correctiva mínima.** Si el problema está en el `Dockerfile` y se acaba de modificarlo, revertir ese cambio puntual y reintentar. Si el problema es Docker en el host, asegurarse de que el daemon esté corriendo (en Windows o macOS, abrir Docker Desktop). Si el problema es disco, liberar espacio antes de cualquier otra cosa, idealmente con `docker system prune` para borrar capas e imágenes no usadas.

## Escenario 2: una herramienta declarada no responde

**Síntoma.** Dentro de un contenedor que parece estar funcionando, una herramienta puntual falla con `command not found` o se invoca pero devuelve resultados extraños. La rutina del paso 3 reporta `[fail]` para esa herramienta. Otras herramientas siguen respondiendo bien.

**Capa probable.** Toolchain. Más adentro: o bien la herramienta no está instalada en la imagen (capa de instalación), o bien está instalada pero su directorio no entró al `PATH` de esta sesión (capa de disponibilidad), o bien hay dos versiones y el `PATH` resuelve a la equivocada.

**Comprobación.** Tres comandos en orden:

```bash
$ which <herramienta>
$ ls -la /usr/bin/<herramienta> /usr/local/bin/<herramienta>
$ echo "$PATH"
```

`which` confirma si el shell encuentra el ejecutable. Si lo encuentra, devuelve la ruta absoluta y el problema —si lo hay— está en la versión, no en la presencia. Si no lo encuentra, los siguientes comandos buscan el binario en las dos ubicaciones más probables: el `ls` confirma si el archivo existe en disco, y `echo "$PATH"` confirma qué directorios busca el shell.

Tres resultados posibles después de los tres comandos. Primero, el binario existe en disco y su directorio está en el `PATH`: `which` debería haberlo encontrado, así que algo más está mal (permisos del binario, sesión con `PATH` corrompido por un script de inicio). Segundo, el binario existe en disco pero su directorio no está en el `PATH`: el `Dockerfile` instaló la herramienta en un lugar que el shell no busca, lo que es un bug del `Dockerfile` que corregir. Tercero, el binario no existe en disco: la herramienta no quedó instalada en la imagen, y el problema está en la línea del `Dockerfile` que debería instalarla.

**Acción correctiva mínima.** Para los dos primeros casos, ajustar el `PATH` es solución temporal aceptable, pero la corrección durable está en el `Dockerfile`. Para el tercero, no hay atajo: hay que corregir la instalación en el `Dockerfile` y reconstruir la imagen. Antes de reconstruir, conviene leer la línea del `Dockerfile` que debería haber instalado esa herramienta, identificar por qué falló (paquete renombrado, repositorio no agregado, dependencia faltante), y solo entonces ejecutar *"Rebuild Container"*. Reconstruir sin haber localizado la causa suele reproducir el mismo fallo.

## Escenario 3: cambié el `Dockerfile` pero el contenedor no lo refleja

**Síntoma.** Se modificó el `Dockerfile` (agregar un paquete, ajustar una variable de entorno, cambiar un comando), se guardó el archivo, se abrió una nueva terminal dentro del contenedor, y el cambio no aparece. La herramienta agregada sigue ausente, o la variable nueva no está en el entorno.

**Capa probable.** Frontera entre archivos del repo e imagen. El [capítulo 01](01-devcontainer.md) llamó a esto la primera frontera de inconsistencia: el archivo está al día, pero la imagen no se reconstruyó.

**Comprobación.** Una sola pregunta: ¿se ejecutó *"Rebuild Container"* después de la modificación? Si la respuesta es *"sólo cerré y volví a abrir VS Code"*, el contenedor sigue corriendo bajo la imagen vieja. Una forma de confirmarlo desde dentro del contenedor:

```bash
$ ls -la /<ruta-instalada-por-el-cambio>
ls: cannot access '...': No such file or directory
```

Si lo que el cambio del `Dockerfile` debía instalar no existe en disco, la imagen activa no contiene ese cambio.

**Acción correctiva mínima.** *"Dev Containers: Rebuild Container"* desde la paleta de VS Code. Esto detiene el contenedor actual, lo elimina, reconstruye la imagen aplicando los cambios del `Dockerfile`, y crea un contenedor nuevo. Tomarse el tiempo de leer la salida del rebuild es importante: ahí aparecen los errores de instalación que, si se ignoran, llevan al escenario 2 una vez que el contenedor termina de arrancar.

## Escenario 4: el host y el contenedor parecen ver cosas distintas

**Síntoma.** Un archivo se editó desde VS Code en la ventana del host (antes de entrar al contenedor) y, al abrir el contenedor, no aparece. O al revés: se creó un archivo desde dentro del contenedor con `touch` y no aparece en el explorador del host. O un archivo que existe en ambos lados muestra contenidos distintos.

**Capa probable.** Workspace montado. La pieza que conecta host y contenedor está fallando o está mal interpretada.

**Comprobación.** Dos verificaciones complementarias:

```bash
$ pwd
$ realpath .
$ mount | grep workspaces
```

`pwd` y `realpath .` confirman dónde cree estar la sesión actual. `mount | grep workspaces` confirma si el directorio de trabajo del contenedor está efectivamente montado desde el host. Si el `mount` no muestra el bind correspondiente, el workspace no está conectado al host y los archivos del contenedor son una copia interna que no se sincroniza con nada.

Dos causas comunes de este síntoma cuando el mount sí está. Primera: VS Code está abierto sobre dos workspaces distintos (uno en el host, otro en el contenedor) que apuntan a directorios distintos. Lo que parece desincronización es en realidad que se están mirando dos lugares. Segunda: el archivo se creó en `/tmp` o en `/home/vscode` del contenedor, no en `/workspaces/...`, así que no está en el repo del host.

**Acción correctiva mínima.** Si el workspace no está montado, cerrar y reabrir el contenedor desde *"Reopen in Container"* en la ventana correcta de VS Code. Si el problema es de ruta dentro del contenedor, mover el archivo al lugar correcto con `mv`. Antes de declarar bug del laboratorio, descartar siempre la posibilidad de que la confusión sea de ruta: es la causa más común y la menos sospechada.

## Escenario 5: la rutina pasa pero un comando real falla

**Síntoma.** `verify-setup.sh` reporta `Setup verification passed`. El sanity check manual da resultados consistentes. Y aun así, un comando real —compilar un programa C de prueba, correr `cargo build` en un proyecto, ejecutar una herramienta sobre un archivo— falla con un error que parece del entorno.

**Capa probable.** Más allá del alcance del script. Como cerró el [capítulo 03](03-verify-setup.md), el script verifica disponibilidad y presencia, no comportamiento más allá de eso. Hay dos zonas frecuentes donde el síntoma vive: configuración del usuario (variables de entorno, archivos de configuración en `$HOME`), o estado del proyecto puntual sobre el que se está trabajando (caché de `cargo`, archivos `.o` viejos, dependencias rotas).

**Comprobación.** Reproducir el comando que falla con verbosidad aumentada o leyendo el mensaje de error con cuidado en lugar de descartarlo. Errores de compilación de C suelen ser muy descriptivos sobre qué archivo y qué línea fallan; errores de `cargo` suelen indicar el crate y la fase. Antes de sospechar del entorno, leer el error completo y aplicar el método de la regla 1: nunca cambiar dos capas. Si el error es de un proyecto puntual, intentar reproducirlo en un proyecto mínimo nuevo. Si el proyecto mínimo funciona, el problema vive en el proyecto puntual, no en el laboratorio.

**Acción correctiva mínima.** Resistir el reflejo de reconstruir el contenedor. Casi siempre, este escenario se resuelve a nivel proyecto: limpiar la caché de build (`cargo clean`, `rm *.o`), revisar las dependencias, leer el error específico. Reconstruir el contenedor tiene chance de "arreglar" el síntoma por casualidad, pero a costa de no aprender qué lo causaba realmente, lo que casi garantiza que vuelva.

## Cuándo sí reconstruir y cuándo no

Cerrar el capítulo conviene hacerlo con un mapa explícito de cuándo *"Rebuild Container"* es la herramienta correcta y cuándo es la trampa.

Reconstruir es correcto cuando se modificó el `Dockerfile` o el `devcontainer.json` y se quiere que el cambio entre en efecto (escenario 3). También es correcto cuando se identificó un problema concreto en la imagen y se corrigió la instrucción del `Dockerfile` que lo causaba (escenario 2 con causa identificada). En ambos casos, el rebuild materializa una intención concreta de cambio.

Reconstruir es trampa cuando se usa como reacción universal a cualquier síntoma raro, sin haber observado nada antes. Lo es porque destruye la evidencia, porque no garantiza nada (si el problema estaba en una instrucción del `Dockerfile` que sigue siendo la misma, va a reproducirse), y porque enseña a confiar en un botón en lugar de en la observación. Cada vez que aparece la tentación de reconstruir sin diagnóstico previo, la respuesta correcta es volver a la cadena del [capítulo 01](01-devcontainer.md), pasar por las cinco piezas, y solo después decidir.

Lo que `L0` deja, después del nivel completo, es exactamente esa capacidad: ante cualquier síntoma del laboratorio, ubicar la pieza, comprobarla con un comando concreto, y elegir la acción correctiva mínima. El resto del track va a apoyarse en que esa capacidad esté instalada.
