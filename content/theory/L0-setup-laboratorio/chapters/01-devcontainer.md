# El devcontainer como contrato de trabajo

## El laboratorio no es una sola cosa

Cuando alguien abre el repo en VS Code y ve el aviso *"Reopen in Container"*, suele pensar que está por entrar a un único lugar: el devcontainer. La intuición es razonable, pero confunde. Lo que parece un solo bloque opaco está hecho, en realidad, de cinco piezas distintas que el resto del nivel va a separar con cuidado. Mantenerlas pegadas mentalmente es la causa silenciosa de buena parte de los problemas que aparecen después: comandos que "deberían funcionar" y no funcionan, archivos que se editan pero no se ven reflejados, herramientas que el repo declara y que sin embargo responden con `command not found`.

El objetivo de este capítulo es romper esa unidad aparente. Al final, en lugar de pensar *"todo vive dentro de Docker"*, va a quedar disponible un mapa más preciso: archivos en el repo, una imagen construida a partir de ellos, un contenedor que es una instancia viva de esa imagen, un workspace montado encima del contenedor, y una toolchain que habita ese workspace. Cada una de esas piezas tiene su propia vida, y los problemas se manifiestan casi siempre en la frontera entre dos.

## Las cinco piezas y por qué importan separadas

Empieza por nombrarlas, sin entrar todavía en cómo se relacionan. Las cinco piezas son: los **archivos del repo** que declaran el entorno, la **imagen** construida a partir de esos archivos, el **contenedor** que corre esa imagen, el **workspace** que el contenedor monta como espacio de trabajo, y la **toolchain** disponible dentro de ese workspace. Las tres primeras son objetos de Docker; la cuarta es un detalle de cómo VS Code conecta el host con el contenedor; la quinta es lo que el lector usa todos los días sin pensarlo.

La razón por la que importa separarlas no es taxonómica. Es operativa. Cada pieza puede estar en uno de varios estados, y los estados de las piezas no están sincronizados entre sí. El archivo del repo puede haberse modificado sin que la imagen se haya reconstruido. La imagen puede estar reconstruida sin que el contenedor activo lo refleje. El contenedor puede estar corriendo con el workspace montado correctamente y, aun así, una herramienta puntual puede no responder porque la capa de instalación correspondiente quedó fuera del build. Cuando un comando falla, la pregunta útil no es *"¿qué le pasa al devcontainer?"* sino *"¿en cuál de las cinco piezas está la inconsistencia?"*.

Ese cambio de pregunta es el aporte central del capítulo. Antes de explicar cómo se construye cada pieza, hace falta tenerlas presentes como entidades distinguibles. Lo que sigue las recorre una a una, en el orden en que cada una entra a existir.

## Los archivos del repo: la intención declarada

El laboratorio empieza en archivos de texto plano que viven en el repo y que cualquier editor puede leer. Son dos los que importan en este nivel: `.devcontainer/devcontainer.json` y el `Dockerfile` referenciado desde ese JSON. Ninguno de los dos hace nada por sí mismo. Son, en sentido estricto, declaraciones: describen qué laboratorio se quiere obtener, no el laboratorio en uso.

`devcontainer.json` describe **cómo abrir** el contenedor. Apunta al `Dockerfile`, fija qué carpetas se montan, declara extensiones de VS Code, variables de entorno, comandos a ejecutar después del primer arranque. Es responsabilidad de VS Code: la herramienta lo lee para saber con qué opciones lanzar el contenedor.

```bash
$ ls .devcontainer
Dockerfile  devcontainer.json
```

El `Dockerfile` describe **qué instalar** dentro de la imagen. Es responsabilidad de Docker: cuando llega el momento de construir la imagen, Docker lo ejecuta línea a línea, y el resultado de esa ejecución es la imagen.

La distinción no es académica. Modificar `devcontainer.json` cambia cómo se abre el contenedor en la próxima sesión. Modificar el `Dockerfile` cambia qué hay adentro, pero solo después de reconstruir la imagen. Confundir los roles es la causa más común de un síntoma típico: *"agregué un paquete al `devcontainer.json` y no aparece"*. El paquete tenía que ir al `Dockerfile`; lo que sí va al JSON son las opciones de apertura.

## La imagen: la materialización congelada

El paso siguiente convierte la declaración en algo concreto. Cuando Docker construye la imagen a partir del `Dockerfile`, recorre cada instrucción (`FROM`, `RUN`, `COPY`, `ENV` y otras) y produce, capa por capa, un sistema de archivos completo con todos los paquetes instalados. El resultado es la **imagen**: un objeto inmutable, identificado por un hash, que vive en el almacenamiento local de Docker.

Ese carácter inmutable es importante. Una vez construida, la imagen no cambia aunque el `Dockerfile` se modifique. El `Dockerfile` es la receta; la imagen es la torta horneada. Cambiar la receta no rehornea la torta. Para que la modificación llegue, hay que ejecutar el rebuild explícitamente, y la herramienta indicada para hacerlo en este nivel es el comando *"Dev Containers: Rebuild Container"* desde la paleta de VS Code.

```bash
$ docker images | head
REPOSITORY                          TAG       IMAGE ID       CREATED        SIZE
vsc-forja-...                       latest    8a9c1e2f4b76   2 hours ago    1.42GB
```

Aquí ya aparece la primera frontera donde se rompe la sincronía. El archivo del `Dockerfile` puede estar al día, pero la imagen registrada localmente puede ser de hace dos horas, dos días o dos semanas. Lo que esa imagen contiene es exactamente lo que estaba en el `Dockerfile` **en el momento del último build**. Nada más, nada menos. Diagnosticar esta brecha es revisar la fecha de la imagen y compararla con la última modificación del `Dockerfile`.

## El contenedor: la instancia viva

La imagen, por sí sola, no ejecuta nada. Es un molde. Cuando VS Code abre el devcontainer, lo que hace en concreto es pedirle a Docker que cree un **contenedor** a partir de esa imagen. El contenedor es una instancia: tiene su propio sistema de archivos (heredado de la imagen pero con escritura habilitada encima), su propio espacio de procesos, su propia red, y un identificador distinto del de la imagen.

Una imagen puede dar lugar a muchos contenedores; un contenedor pertenece a una sola imagen. Mientras el contenedor está corriendo, los cambios que se hacen dentro (instalar un paquete con `apt`, crear un archivo en `/tmp`, modificar variables de entorno) viven en el contenedor, no en la imagen. Si el contenedor se elimina, esos cambios se pierden. Esa volatilidad es deliberada y es lo que vuelve al laboratorio reproducible: la fuente de verdad es siempre el `Dockerfile`.

```bash
$ docker ps
CONTAINER ID   IMAGE         STATUS         NAMES
3fa1c8d72eab   vsc-forja...  Up 13 minutes  upbeat_shockley
```

El contenedor introduce la segunda frontera de inconsistencia posible. La imagen puede estar recién reconstruida y el contenedor activo puede seguir siendo el viejo, lanzado contra la imagen anterior. *"Rebuild Container"* fuerza la coherencia: detiene y elimina el contenedor existente, y crea uno nuevo a partir de la imagen recién construida. Sin ese paso, una imagen al día convive con un contenedor desactualizado.

## El workspace: el puente con el host

Hasta acá, todo lo descripto vive del lado de Docker. La pieza que falta es la que conecta el contenedor con el repo del host: el **workspace montado**. Cuando VS Code arranca el contenedor, monta la carpeta del repo del host (en este caso, el directorio de `Forja-Learning-Programming`) dentro del contenedor en una ruta conocida, típicamente `/workspaces/Forja-Learning-Programming`. La técnica subyacente es el bind mount de Docker: el contenedor no contiene una copia del repo, lo lee directamente del host a través del mount.

Esto tiene dos consecuencias prácticas que conviene retener desde ahora. La primera: los archivos editados desde el editor del host se ven inmediatamente desde dentro del contenedor, y los archivos creados desde la terminal del contenedor se ven inmediatamente desde el host. No hay copia ni sincronización; hay un único sistema de archivos visto desde dos lados. La segunda: cualquier modificación al `Dockerfile` o al `devcontainer.json` se observa desde el contenedor en cuanto se guarda en el host, pero su **efecto** en la imagen y en el contenedor sigue requiriendo el rebuild explícito. Ver el archivo nuevo y vivir bajo sus consecuencias son cosas distintas.

```bash
$ pwd
/workspaces/Forja-Learning-Programming
$ ls -la .devcontainer
total 16
drwxrwxr-x  2 vscode vscode 4096 May  4 13:02 .
drwxrwxr-x 13 vscode vscode 4096 May  4 13:02 ..
-rw-rw-r--  1 vscode vscode  812 May  4 13:02 Dockerfile
-rw-rw-r--  1 vscode vscode  654 May  4 13:02 devcontainer.json
```

## La toolchain: la pieza que se usa todo el día

La quinta pieza es la que el lector toca constantemente sin verla como pieza separada: la **toolchain** efectivamente disponible dentro del contenedor. Compiladores de C y de Rust, debugger, herramientas de inspección de binarios, intérpretes y todo lo que el `Dockerfile` haya instalado vía `apt`, `cargo` o equivalentes. Aquí solo importa nombrarla y dejar planteado el problema; el detalle queda para el [próximo capítulo](02-toolchain.md).

El planteo es el siguiente. La toolchain disponible dentro del contenedor es, en principio, la que el `Dockerfile` declaró instalar, pero esa equivalencia no es automática ni vitalicia. Una imagen vieja puede no incluir un paquete que el `Dockerfile` actual sí declara. Una capa de instalación puede haber fallado silenciosamente durante el build sin abortar la imagen. Una herramienta puede estar instalada y aun así no responder porque su `PATH` no quedó configurado en el contenedor. Que el repo declare una toolchain y que esa toolchain esté disponible son afirmaciones distintas, y este nivel se toma en serio esa distinción porque es donde nacen los falsos diagnósticos típicos: tratar como bug del programa lo que en realidad es ausencia silenciosa de una herramienta.

## Qué persiste y qué se reconstruye

Con las cinco piezas separadas, la pregunta de qué sobrevive a qué se vuelve respondible. Conviene fijar el mapa porque cada vez que algo *"se rompe"*, lo primero útil es saber qué se conservó y qué se rehizo.

Los archivos del repo persisten siempre: viven en disco del host, fuera del contenedor, y los cambios sobre ellos sobreviven al cierre de VS Code, a la eliminación del contenedor y a la eliminación de la imagen. La imagen persiste hasta que se decide reconstruirla; un *"Rebuild Container"* la rehace, un cierre normal del contenedor no. El contenedor persiste mientras VS Code lo deja vivo entre sesiones, pero es la pieza más volátil: cualquier rebuild lo reemplaza. El workspace montado **no tiene estado propio**: es una vista del host. Cualquier archivo creado dentro del workspace queda en el host. La toolchain hereda la persistencia de la imagen: lo que la imagen instaló sigue ahí mientras la imagen no se reconstruya.

Esa jerarquía de volatilidad invierte la intuición ingenua. El repo, que parece "lo de afuera", es lo más estable. El contenedor, que parece "el laboratorio", es lo más volátil. Un workflow saludable se apoya en esa asimetría: lo importante vive en archivos del repo, no dentro del contenedor.

## Dónde mira primero un diagnóstico

Cerrar el capítulo con un mapa de inspección hace que las piezas dejen de ser una lista y se conviertan en herramienta de trabajo. Ante un síntoma del laboratorio, el orden de revisión razonable sigue la cadena de construcción: archivos → imagen → contenedor → workspace → toolchain.

Si lo que se modificó es un archivo del repo, la pregunta es si la imagen ya fue reconstruida después de ese cambio. Si la imagen está al día, la pregunta es si el contenedor activo se relanzó contra la imagen nueva. Si el contenedor está al día, la pregunta es si el workspace está montado en la ruta esperada. Si el workspace está bien, la pregunta es si la herramienta puntual responde dentro del contenedor. Cada paso tiene un comando específico para responderlo, y los próximos capítulos los van a ir presentando.

Lo retenible de este capítulo, entonces, no es una definición sino una operación: ante cualquier discrepancia entre lo que el repo declara y lo que el contenedor hace, el lector ya puede señalar las cinco piezas posibles donde la inconsistencia podría estar viviendo. Esa capacidad de localizar la frontera correcta es la que el resto del nivel va a profundizar, empezando por la frontera donde más errores nacen: la toolchain.
