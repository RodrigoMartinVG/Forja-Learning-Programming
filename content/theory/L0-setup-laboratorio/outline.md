# Outline: L0 — Setup del laboratorio

> Documento de diseño interno. No se sirve en la web. Guía para escribir capítulos y ejercicios de `L0`. La voz, prosa y anti-patrones aplicables están en [estandar_editorial_forja.md](../../../estandar_editorial_forja.md). Las reglas estructurales viven en [CONVENTIONS.md](../../../CONVENTIONS.md).

---

## Metadatos

- **Prerrequisitos:** ninguno.
- **Bloque editorial de entrada recomendado:** `content/theory/forja.md`, `content/theory/README.md`.
- **Proyecto asociado:** `content/projects/focused/devcontainer-setup`.
- **Desbloquea:** `L1`.
- **Fuente curricular:** [docs/forja-contenido.md §6 L0](../../../docs/forja-contenido.md).

---

## Objetivo del nivel

Que la persona pueda abrir el repo en el devcontainer declarado, identificar las piezas que definen el laboratorio, comprobar que las herramientas que el repo declara realmente están disponibles, ejecutar la verificación base y diagnosticar un fallo de entorno sin confundirlo con un fallo del código de un nivel posterior.

---

## Contrato conceptual

Lo que `L0` debe dejar instalado al final:

- el laboratorio es un contrato observable: archivos en el repo + imagen + contenedor + workspace + herramientas disponibles;
- imagen, contenedor y workspace son piezas distintas con vidas propias;
- una toolchain declarada por el repo no es lo mismo que una toolchain efectivamente disponible dentro del contenedor;
- `verify-setup.sh` formaliza ese contrato y deja evidencia explícita;
- frente a un fallo, hay un orden de observación antes de cambiar archivos o reconstruir.

Lo que `L0` **no** instala (se posterga con cita):

- Docker como dominio general (queda fuera del track).
- Uso de `gdb`, sanitizers, `strace`, `valgrind`: se cubren en `L5` y `L6`. `L0` solo verifica que estas herramientas estén disponibles, no enseña a usarlas.
- Internals del kernel del contenedor: queda para `L51` y siguientes.
- C y Rust como lenguajes: la toolchain aparece como pieza declarada, no como contenido a aprender.

---

## Decisiones de diseño curricular

- `L0` no es un curso de Docker. Es la unidad donde se vuelve material un laboratorio reproducible.
- La verificación de presencia de herramientas de observabilidad (`gdb`, `strace`, `valgrind`, sanitizers vía flags de compilador) se cubre acá como *disponibilidad*, no como *uso*. Cierra la brecha del bullet curricular *"sanity checks de debugging y observabilidad"* sin invadir el contenido de `L5`/`L6`.
- La toolchain C y Rust tiene capítulo propio. Aparece como contrato declarado por el repo y comprobable, no como asunto colateral del script.
- El proyecto `devcontainer-setup` es la prolongación natural del nivel: el nivel deja la rutina, el proyecto profundiza la construcción y modificación del laboratorio.
- Los ejercicios producen evidencia observable (rutas, output de comandos, diferencias entre dos comandos). No piden ensayos.

---

## Continuidad interna con niveles vecinos

Información para el redactor, no para el cuerpo del capítulo (v2 §R7).

- **Hacia `L1`:** `L0` deja un laboratorio que `L1` puede usar para correr el simulador y revisar trazas sin contaminación de entorno.
- **Hacia `L5`/`L6`:** las herramientas de observabilidad ya estarán instaladas y verificadas; allí se aprende a usarlas.
- **Hacia el proyecto `devcontainer-setup`:** este proyecto cuestiona y modifica el laboratorio; depende de que el lector haya entendido las piezas que `L0` separa.

---

## Capítulos

### Capítulo 00 — Introducción

**Archivo:** `chapters/00-introduccion.md`

**Objetivo:** abrir el problema del nivel — sin laboratorio sano, los errores de los niveles posteriores se leen mal — y nombrar las piezas que el nivel va a separar.

**Problema técnico que abre:** un mismo síntoma (un comando falla) puede provenir del repo, de la imagen, del contenedor, del workspace montado o de la toolchain. Sin separar capas, todo síntoma se convierte en hipótesis errante.

**Modelo mental que instala:** el laboratorio como cadena observable de piezas distinguibles, no como caja única.

**Secciones planificadas (H2):**
- `## El laboratorio como contrato observable`
- `## Las piezas que el nivel separa`
- `## Las herramientas como objeto de comprobación, no de uso`
- `## El recorrido del nivel en cuatro pasos`

**Materialidad obligatoria:** mención de `devcontainer.json`, `Dockerfile`, `verify-setup.sh` con sus rutas reales en el repo.

**Confusiones que desmonta:**
- `L0` como introducción ornamental antes del contenido "real";
- abrir VS Code como prueba suficiente de entorno;
- atribuir a C/Rust un fallo que en realidad es del laboratorio.

**Cierre conceptual:** la persona sabe qué cuatro piezas va a inspeccionar y por qué orden.

**Notas v2 para el redactor:** este capítulo es el que más riesgo tiene de caer en la plantilla `Qué es / Qué cubre / Qué no cubre / Cómo trabajarlo / El nivel siguiente`. Esa plantilla está vetada (v2 §A5/§A6/§B4). Las exclusiones se declaran en una oración breve dentro de prosa, no como sección. La transición a `L1` vive en el `README.md` del nivel, no acá.

---

### Capítulo 01 — El devcontainer como contrato de trabajo

**Archivo:** `chapters/01-devcontainer.md`

**Objetivo:** separar Dockerfile, `devcontainer.json`, imagen construida, contenedor corriendo y workspace montado como piezas distintas con responsabilidades distintas.

**Problema técnico que abre:** muchos fallos nacen de mezclar "el archivo del repo cambió" con "la imagen se reconstruyó" con "el contenedor lo está viendo".

**Modelo mental que instala:**
- archivo del repo declara intención;
- imagen materializa esa intención una vez;
- contenedor instancia la imagen con un workspace montado encima;
- modificar el archivo no implica reconstruir la imagen, ni reconstruir la imagen implica reabrir el contenedor.

**Secciones planificadas (H2):**
- `## Los archivos del repo que declaran el entorno`
- `## La imagen como materialización única`
- `## El contenedor como instancia con vida propia`
- `## El workspace montado y los volúmenes`
- `## Qué persiste y qué se reconstruye`
- `## Dónde mira primero un diagnóstico`

**Materialidad obligatoria:**
- ruta y lectura corta de `devcontainer.json`;
- ruta y lectura corta del `Dockerfile`;
- al menos un comando que muestre el contenedor activo y el workspace montado.

**Confusiones que desmonta:**
- todo "vive dentro de Docker" sin capas;
- cualquier cambio requiere rebuild completo;
- el contenedor ve exactamente lo mismo que el host.

**Cierre conceptual:** la persona puede señalar qué archivo del repo toca mirar primero cuando algo no coincide con lo esperado.

---

### Capítulo 02 — La toolchain declarada y la toolchain disponible

**Archivo:** `chapters/02-toolchain.md`

**Objetivo:** distinguir entre las herramientas que el repo declara instalar y las herramientas que efectivamente responden dentro del contenedor.

**Problema técnico que abre:** un `Dockerfile` que enumera paquetes no garantiza que el contenedor activo los tenga; una imagen vieja, un cache stale o un layer omitido producen una brecha silenciosa entre intención y realidad.

**Modelo mental que instala:**
- la toolchain de C (compilador, ensamblador, linker, debugger);
- la toolchain de Rust (`rustc`, `cargo`, formateadores y linters declarados);
- las herramientas de observabilidad presentes a nivel disponibilidad (`gdb`, `strace`, `valgrind`, soporte de sanitizers en el compilador);
- la diferencia entre **declarar**, **instalar** y **estar disponible** en una sesión concreta.

**Secciones planificadas (H2):**
- `## Toolchain declarada por el repo`
- `## Toolchain de C: compilador, linker, debugger`
- `## Toolchain de Rust: rustc, cargo y satélites`
- `## Herramientas de observabilidad como presencia comprobable`
- `## Declarar, instalar y estar disponible no son lo mismo`
- `## Comprobaciones puntuales con `--version` y `which``

**Materialidad obligatoria:**
- al menos un fragmento del `Dockerfile` que instale toolchain;
- comandos `--version` para `cc`/`gcc`, `rustc`, `cargo`, `gdb`, `strace`;
- al menos una comprobación con `which` para mostrar la ruta efectiva dentro del contenedor.

**Confusiones que desmonta:**
- "si está en el `Dockerfile`, está disponible";
- creer que `L0` enseña a usar `gdb` o sanitizers (solo verifica presencia);
- mezclar la versión que muestra el host con la que muestra el contenedor.

**Cierre conceptual:** la persona puede listar las piezas mínimas de toolchain que el repo declara y comprobar individualmente que cada una responde.

**Conexión interna:** este capítulo es prerrequisito directo de `verify-setup.sh` (cap. 03), que automatiza estas mismas comprobaciones.

---

### Capítulo 03 — `verify-setup.sh` como contrato observable

**Archivo:** `chapters/03-verify-setup.md`

**Objetivo:** entender `verify-setup.sh` como la formalización ejecutable del contrato del laboratorio.

**Problema técnico que abre:** sin un script de verificación, el contrato del laboratorio queda en la cabeza del que lo armó. Cualquier divergencia se descubre tarde y como fallo del nivel siguiente.

**Modelo mental que instala:**
- el script comprueba presencia de archivos, presencia de herramientas y, donde aplique, comportamiento mínimo;
- distingue éxito y fallo de forma binaria pero deja rastro de qué se comprobó;
- complementa pero no reemplaza el sanity check manual.

**Secciones planificadas (H2):**
- `## Qué clases de checks hace el script`
- `## Cómo lee evidencia el script y cómo la presenta`
- `## Salida esperable cuando el laboratorio está sano`
- `## Salida esperable cuando algo falta`
- `## Lo que el script no comprueba y por qué`

**Materialidad obligatoria:**
- lectura comentada de fragmentos representativos del script;
- output real (o representativo) con el laboratorio sano;
- output real (o representativo) con un check fallando deliberadamente.

**Confusiones que desmonta:**
- usar el script como oráculo sin leer qué valida;
- creer que "verify pasa" implica que cualquier cosa del nivel siguiente va a funcionar;
- creer que el script reemplaza el diagnóstico.

**Cierre conceptual:** la persona puede mirar el output del script y traducir cada línea a un check del contrato del laboratorio.

---

### Capítulo 04 — Workflow del día cero

**Archivo:** `chapters/04-workflow.md`

**Objetivo:** convertir el contrato y la verificación en una rutina corta y repetible.

**Problema técnico que abre:** sin secuencia mínima fija, cada arranque depende de memoria borrosa.

**Modelo mental que instala:**
- una secuencia de cinco pasos cubre el arranque en condiciones normales;
- cada paso produce evidencia conservable;
- la evidencia sirve para avanzar o para diagnosticar, sin esfuerzo extra.

**Secciones planificadas (H2):**
- `## Secuencia de arranque en cinco pasos`
- `## Qué confirma cada paso`
- `## El sanity check manual mínimo`
- `## Evidencia que se conserva`
- `## La rutina que conviene repetir igual cada vez`

**Materialidad obligatoria:**
- comandos exactos del sanity check manual (al menos `pwd`, `ls`, una comprobación de toolchain, una comprobación dentro del contenedor);
- ejemplo de "evidencia mínima" con tres o cuatro líneas anotadas.

**Confusiones que desmonta:**
- la automatización como excusa para no entender qué se está comprobando;
- la rutina como ritual sin observación.

**Cierre conceptual:** la persona puede repetir la rutina sin releer el capítulo y sabe qué evidencia conservar.

---

### Capítulo 05 — Diagnóstico y recuperación

**Archivo:** `chapters/05-diagnostico.md`

**Objetivo:** dar un playbook inicial para los fallos más frecuentes del laboratorio.

**Problema técnico que abre:** la reacción espontánea ante un fallo suele mezclar síntomas de capas distintas y romper más que arreglar.

**Modelo mental que instala:**
- síntoma → capa probable → comprobación dirigida → cambio mínimo;
- reconstruir solo cuando la observación lo pide;
- nunca cambiar varias capas a la vez.

**Secciones planificadas (H2):**
- `## Fallo de arranque del contenedor`
- `## Herramienta declarada que no responde`
- `## Cambio en Dockerfile que el contenedor no refleja`
- `## Diferencias entre host y contenedor`
- `## Cuándo reconstruir y cuándo no`

**Materialidad obligatoria:**
- al menos tres escenarios con su comando de comprobación y su acción correctiva;
- mensaje real (o representativo) por cada escenario.

**Confusiones que desmonta:**
- reconstruir a ciegas ante cualquier síntoma;
- suponer que un comando fallido ya explica la causa;
- mezclar host y contenedor.

**Cierre conceptual:** la persona puede ubicar un fallo en una capa concreta antes de actuar.

---

### Capítulo 06 — El laboratorio desde Docker (opcional)

**Archivo:** `chapters/06-laboratorio-desde-docker.md`

**Estatus:** opcional. No es prerrequisito de `L1`. Pensado como profundización para quien quiera ver con sus propios ojos las piezas del cap. 01 desde el lado de Docker.

**Objetivo:** materializar las afirmaciones del capítulo 01 desde fuera del devcontainer: que la imagen tiene un id, que el contenedor es una instancia listable, que el workspace es un bind mount con `Source` y `Destination`, y que devcontainer es una capa fina sobre `docker build` + `docker run` con `-v`.

**Problema técnico que abre:** desde dentro del contenedor no se puede comprobar la existencia material de la imagen, del contenedor mismo ni del bind mount. Eso deja al cap. 01 sosteniéndose por confianza en su propio modelo. Mirar desde Docker cierra esa brecha.

**Modelo mental que instala:**
- el devcontainer es `docker build` + `docker run -v` automatizados por VS Code;
- `docker ps`, `docker images`, `docker inspect` son la perspectiva externa que confirma el modelo del cap. 01;
- `stop`/`start`/`exec`/`rm` son las primitivas que VS Code dispara por debajo;
- el bind mount del repo se puede reproducir manualmente con `-v "$PWD:/workspaces/<repo>"`.

**Secciones planificadas (H2):**
- `## Por qué mirar el lab desde afuera`
- `## Las tres listas: imágenes, contenedores corriendo, contenedores totales`
- `## Inspeccionar un contenedor: el bind mount como objeto`
- `## Ciclo de vida del contenedor`
- `## Limpieza de objetos viejos`
- `## El lab sin devcontainer, sólo con Docker`
- `## Lo que este capítulo no se ocupa de cubrir`

**Materialidad obligatoria:**
- `docker images`, `docker ps`, `docker ps -a` con output representativo;
- `docker inspect` filtrado a `.Mounts` mostrando `Source` y `Destination`;
- comandos `docker stop` / `start` / `exec` / `rm` con su efecto;
- comando completo de `docker build` apuntando a `.devcontainer/Dockerfile`;
- comando completo de `docker run -it --rm -v "$PWD:/workspaces/..." -w /workspaces/... forja-lab bash`.

**Confusiones que desmonta:**
- el devcontainer como sistema mágico sin equivalente explícito en `docker`;
- creer que una nueva terminal del devcontainer es un contenedor nuevo (es un `docker exec`);
- creer que `Rebuild Container` y `rm` + reabrir son lo mismo;
- mezclar bind mounts con volúmenes nombrados (sólo se cubre el primero).

**Fuera de alcance dentro del capítulo:**
- redes y publicación de puertos;
- volúmenes nombrados;
- `docker compose`;
- multi-stage builds;
- registries.

**Cierre conceptual:** la persona puede listar las piezas del lab desde fuera, comprobar el bind mount con `docker inspect`, y reproducir el levantamiento del lab sin VS Code si hace falta.

---

## Ejercicios

`exercises.md` único (volumen bajo, contenido no especialmente independiente entre ejercicios).

### Ejercicio 01 — Identificar quién declara qué

- **Tipo:** comando observable + clasificación.
- **Consigna:** abrir `devcontainer.json` y `Dockerfile` y completar una tabla de tres filas: archivo, qué declara, qué no declara.
- **Evidencia esperada:** rutas correctas, una afirmación verificable por archivo.
- **Error que detecta:** confundir `devcontainer.json` (cómo abrir) con `Dockerfile` (qué instalar).

### Ejercicio 02 — Comprobar disponibilidad de toolchain

- **Tipo:** comando observable.
- **Consigna:** correr `--version` para `cc`, `rustc`, `cargo`, `gdb`, `strace`, dentro del contenedor. Registrar versión y ruta efectiva con `which`.
- **Evidencia esperada:** una línea por herramienta con versión y ruta.
- **Error que detecta:** dar por instalado lo que no respondió, o copiar la versión del host.

### Ejercicio 03 — Leer la salida de `verify-setup.sh`

- **Tipo:** comando observable + interpretación.
- **Consigna:** correr `verify-setup.sh` y, para cada línea de output, decir qué pieza del contrato comprueba.
- **Evidencia esperada:** mapeo línea-a-check.
- **Error que detecta:** tratar el script como caja negra.

### Ejercicio 04 — Provocar un check fallando

- **Tipo:** comando observable, modificación reversible.
- **Consigna:** romper deliberadamente una condición que el script comprueba (renombrar un archivo, deshabilitar un alias, mover el script a otra ruta) y observar la diferencia en el output. Restaurar.
- **Evidencia esperada:** output del script en estado roto, descripción de la diferencia, evidencia de restauración.
- **Error que detecta:** romper sin observar, o no saber cómo el script convierte ausencia en fallo.

### Ejercicio 05 — Sanity check manual de tres comandos

- **Tipo:** comando observable.
- **Consigna:** elegir tres comandos cortos que aporten información independiente sobre el laboratorio (ejemplos válidos: `pwd`, `whoami`, `uname -a`, `ls -la /workspace`, `cat /etc/os-release`). Justificar por qué cada uno aporta señal distinta.
- **Evidencia esperada:** tres comandos con su output y una oración de justificación cada uno.
- **Error que detecta:** elegir comandos redundantes o decorativos.

### Ejercicio 06 — Diagnóstico dirigido

- **Tipo:** multiple choice con verificación.
- **Consigna:** se presenta un síntoma ("`cargo` no responde dentro del contenedor"). Cuatro opciones de capa (archivo del repo, imagen, contenedor, host). Marcar la respuesta correcta y proponer un comando que la confirme.
- **Evidencia esperada:** opción correcta marcada, comando que la confirma, output del comando.
- **Error que detecta:** elegir reconstruir como reacción universal.

### Ejercicio 07 — Proponer un check nuevo

- **Tipo:** diseño + comando observable.
- **Consigna:** proponer una condición observable del laboratorio que `verify-setup.sh` no comprueba hoy. Escribir el comando que la verificaría. Justificar por qué suma señal y no ruido.
- **Evidencia esperada:** comando viable + justificación de una oración.
- **Error que detecta:** checks subjetivos o redundantes con uno existente.

---

## Pieza interactiva

Ninguna en `L0`. El "laboratorio" del nivel es el propio devcontainer. Toda observación se hace contra archivos y comandos reales del repo.

---

## Notas finales para el redactor

- El nivel debe sentirse como contrato operativo, no como tutorial de Docker. Cada explicación se ancla en archivos del repo o comandos observables.
- Los cinco capítulos canónicos forman cadena: piezas → toolchain → verificación → workflow → diagnóstico. No reordenar.
- El capítulo 06 es opcional y posterior al cierre canónico. No debe convertirse en prerrequisito ni mencionarse desde los capítulos 01–04 como dependencia. El capítulo 05 puede referirlo únicamente como recurso para diagnósticos que requieran perspectiva externa al contenedor.
- Si al escribir un capítulo aparece un H2 fuera de los planificados, primero verificar que no caiga en v2 §A5 antes de incorporarlo.
- La transición hacia `L1` y la conexión con el proyecto `devcontainer-setup` se mencionan en el `README.md` del nivel, no en el cuerpo de los capítulos.
