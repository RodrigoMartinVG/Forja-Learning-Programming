# Workflow del día cero

## De entender las piezas a usarlas todos los días

Los tres capítulos previos dejaron disponible algo distinto del laboratorio que se ve la primera vez: ya no es un bloque opaco sino cinco piezas distinguibles, con una toolchain donde declaración y disponibilidad pueden separarse, y con un script que verifica el contrato sin que cada chequeo haya que repetirlo a mano. Lo que queda por instalar es la rutina concreta para abrir el laboratorio cualquier día y empezar a trabajar sin ceremonia, pero también sin avanzar a ciegas.

Este capítulo presenta esa rutina como una secuencia corta de cinco pasos. La elección del número no es estética: cinco pasos cubren con bastante exactitud las cinco piezas del laboratorio del [primer capítulo](01-devcontainer.md), una pieza por paso. Cada paso produce evidencia observable en el momento, y esa evidencia sirve tanto para confirmar que se puede avanzar como para servir de punto de comparación si más tarde aparece un problema. No hay nada en la rutina que el lector no pueda hacer manualmente; el aporte es el orden y la exigencia de no saltearlo.

## La secuencia en cinco pasos

La rutina, en su forma más compacta, es la siguiente. Cada paso tiene un comando o acción concreta y una pregunta que ese paso responde.

**Paso 1 — Abrir el contenedor.** Desde VS Code, *"Dev Containers: Reopen in Container"* (o esperar a que la ventana lo proponga sola). Pregunta que responde: *"¿hay un contenedor activo basado en la imagen del repo, con el workspace montado?"*. La confirmación visible es que la barra inferior izquierda de VS Code muestra el indicador del devcontainer.

**Paso 2 — Confirmar el workspace.** En la primera terminal que se abra dentro del contenedor:

```bash
$ pwd
/workspaces/Forja-Learning-Programming
$ ls
content  CONVENTIONS.md  docs  README.md  scripts  templates  verify-setup.sh  web
```

Pregunta que responde: *"¿la terminal está parada en la raíz del repo, dentro del contenedor?"*. Si `pwd` devuelve algo distinto de `/workspaces/...`, o si `ls` no muestra los archivos esperados de la raíz, hay un problema en cómo se montó el workspace; detener la rutina acá hasta resolverlo.

**Paso 3 — Correr `verify-setup.sh`.** Desde la raíz del repo:

```bash
$ bash ./verify-setup.sh
```

Pregunta que responde: *"¿la toolchain declarada por el repo está disponible dentro del contenedor?"*. El detalle de cómo leer la salida está en el [capítulo 03](03-verify-setup.md). Para la rutina cotidiana, basta con observar el código de salida: si la última línea es `Setup verification passed`, el contrato del laboratorio se sostiene.

**Paso 4 — Sanity check manual mínimo.** Tres comandos cortos cuya elección se justifica abajo:

```bash
$ whoami
vscode
$ uname -a
Linux 3fa1c8d72eab 5.15.0 ... #1 SMP ... x86_64 GNU/Linux
$ cat /etc/os-release | head -3
PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"
NAME="Debian GNU/Linux"
VERSION_ID="12"
```

Pregunta que responde: *"¿el contenedor que está respondiendo es el contenedor que esperaba (no el host por error, no una imagen vieja)?"*. Es la verificación que `verify-setup.sh` no hace, y la siguiente sección la justifica con detalle.

**Paso 5 — Conservar la evidencia mínima.** No hace falta más que copiar las cuatro o cinco líneas más informativas de los pasos previos a un archivo de notas, o dejar la terminal abierta lo suficiente para volver a mirarla si después algo falla. Pregunta que responde: *"¿tengo a mano el estado del laboratorio al momento de empezar a trabajar, por si después necesito comparar?"*.

Los cinco pasos, ejecutados de corrido, toman menos de dos minutos cuando todo está sano. Cuando no lo está, el primero que falle señala con bastante precisión la capa donde vive el problema, lo que conecta directamente con el [capítulo de diagnóstico](05-diagnostico.md).

## Por qué `verify-setup.sh` no alcanza por sí solo

Una pregunta razonable, llegado este punto, es por qué la rutina no se reduce a abrir el contenedor y correr `verify-setup.sh`. Si el script verifica el contrato, ¿qué agrega lo demás? La respuesta tiene dos partes, una conceptual y otra empírica.

Conceptualmente, el script declara su alcance acotado. El cierre del [capítulo 03](03-verify-setup.md) listó exactamente lo que el script no comprueba: estado del workspace, identidad del contenedor activo, configuraciones de entorno, versiones contra mínimos. Cada una de esas zonas requiere su propia verificación. Pretender que el script las cubra rompería su simplicidad y volvería sus fallos más difíciles de leer.

Empíricamente, hay un tipo de falla que se manifiesta exactamente en la grieta entre el script y la realidad: el contenedor cargado que parece estar bien pero no es el correcto. Puede ocurrir, por ejemplo, si VS Code reabrió un contenedor viejo en lugar de construir uno nuevo, o si la terminal que parece estar dentro del contenedor quedó en una sesión del host. En esos casos, `verify-setup.sh` puede pasar (porque el host también tiene parte de la toolchain), o puede fallar de manera confusa, sin que el origen sea obvio. El sanity check manual del paso 4 pone evidencia adicional sobre la mesa antes de que el script corra.

## Por qué tres comandos para el sanity check, y por qué estos tres

`whoami`, `uname -a` y `cat /etc/os-release | head -3` se eligen porque cada uno aporta información que los otros dos no replican. Tres es el mínimo que distingue contenedor de host con cierta solidez sin volverse ritual.

`whoami` confirma el usuario. Dentro del contenedor del repo, el usuario por defecto es `vscode`. En el host, casi nunca lo es. Si el comando devuelve un usuario distinto del esperado, la sesión está en un lugar distinto del esperado, y nada de lo que siga puede asumirse correcto.

`uname -a` confirma el kernel y la arquitectura. La parte interesante para este chequeo no es tanto la versión exacta del kernel como el **hostname**, que en un contenedor es una cadena hexadecimal corta (el ID del contenedor) y en el host suele ser un nombre legible. Esa diferencia visual delata inmediatamente si la terminal está adentro o afuera.

`cat /etc/os-release | head -3` confirma la distribución. El devcontainer del repo se construye sobre Debian; la primera línea informativa es `PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"` o equivalente. Si el host tiene una distribución distinta (Ubuntu, Fedora, macOS, Windows con WSL bajo Ubuntu), el contraste es inmediato. Si el host también es Debian, los otros dos comandos siguen sirviendo para discriminar.

Existen otras combinaciones razonables —por ejemplo, sumar `id` o cambiar `os-release` por `cat /etc/debian_version`— y los ejercicios del nivel exploran algunas. Lo central no es la elección exacta de comandos sino el principio: tres señales independientes son suficientes y no abrumadoras.

## La evidencia mínima a conservar

El paso 5 puede sonar burocrático, pero tiene una función concreta. Cuando algún día algo deje de funcionar en un nivel posterior, la pregunta primera no es *"¿qué hice mal?"* sino *"¿qué cambió respecto del estado en que las cosas funcionaban?"*. Tener registrada la salida de los pasos 2, 3 y 4 del último día sano vuelve esa comparación trivial: se corren los mismos comandos, se contrastan las salidas, y la diferencia (si existe) es el primer lugar donde mirar.

La conservación no requiere infraestructura. Un archivo de texto suelto al lado del repo, con la fecha y la salida pegada, basta. Lo importante es que conservar evidencia sea parte de la rutina, no una tarea ocasional que se hace cuando ya se sospecha algo. Cuando ya se sospecha es tarde: el estado anterior ya no se puede capturar.

## La rutina como contrato con uno mismo

Repetir esta rutina exactamente igual cada vez tiene una ventaja que no es ahorro de tiempo: vuelve a la rutina misma observable. Si un día la secuencia se desvía —porque un comando falla, porque el output cambia, porque una herramienta tarda más de lo habitual— la diferencia salta a la vista solo si la versión "normal" está fuertemente fijada como referencia. La rutina es a la vez instrumento y patrón: instrumento para abrir el laboratorio sano, patrón contra el cual reconocer cualquier desvío.

Eso obliga a un cierto rigor inicial que después se vuelve costumbre: no saltearse el `pwd` aunque parezca obvio, no asumir que `verify-setup.sh` pasó porque ayer pasó, no omitir el sanity check porque "ya sé que estoy en el contenedor". La rigidez no es ceremonia; es la forma material de que la rutina pueda hablar cuando algo cambie.
