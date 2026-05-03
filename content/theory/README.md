# Introduccion al Workspace

Si ya entendiste que es Forja como plataforma, el siguiente paso es mas operativo: entender como se entra a este workspace y como se recorre sin perderse en el mapa.

Esta introduccion no es un nivel. Es la puerta de entrada editorial al workspace y al recorrido que arranca en `L0`.

Hay una regla operativa que conviene dejar explicita desde el principio: Forja se trabaja con el repositorio abierto en una IDE, idealmente VS Code, y con el contenedor Linux de ese mismo repo ya levantado. La web ayuda a navegar y leer, pero no reemplaza ese entorno de trabajo.

## Que vas a encontrar en el workspace

Al abrir Forja aparecen cuatro piezas principales:

- `Que es Forja`, para ubicar motivacion, expectativas y tono del plan
- esta introduccion, para entender por donde conviene entrar
- el mapa curricular con niveles `L0-L57`
- proyectos focalizados e integradores que reaparecen a medida que el recorrido avanza

No hace falta entender toda la estructura interna del repo para empezar. Al principio alcanza con distinguir que se lee, que se ejecuta y que se construye.

## Como se relacionan esas piezas

- `Que es Forja` explica por que existe la plataforma y que tipo de recorrido propone.
- `L0` fija el laboratorio para que el resto del plan no se apoye en un setup ambiguo.
- Los niveles desarrollan teoria, ejemplos y ejercicios observables.
- Los proyectos reutilizan y tensionan esa teoria en artefactos concretos.

## Como se recorre

La secuencia recomendada al entrar al workspace no es saltar al primer tema que suene atractivo. Conviene seguir una ruta corta y disciplinada:

1. leer `Que es Forja`
2. leer esta introduccion
3. abrir el repo en la IDE, entrar al devcontainer y dejar una terminal lista dentro del contenedor
4. abrir `L0` y recorrer sus capitulos en orden
5. ejecutar los comandos o mini-labs mientras se lee
6. resolver `exercises.md` como verificacion observable
7. pasar al proyecto asociado cuando exista
8. volver al mapa para seguir el siguiente tramo del recorrido

La idea no es separar teoria y practica como si fueran dos productos distintos. El workspace existe justamente para hacer visible como se referencian entre si.

## Por que L0 viene primero

L0 no existe para enseñar Docker por hobby. Existe para eliminar una fuente de ruido que arruina todo lo demas: un laboratorio inconsistente.

Si el compilador, el debugger o el entorno cambian de una maquina a otra, despues es muy facil confundir un problema del setup con un problema del codigo. Por eso el primer nivel fija el contrato del entorno antes de entrar a C, Rust o sistemas POSIX.

## Ruta minima de entrada

Si estas entrando por primera vez, la secuencia recomendada es:

1. leer `Que es Forja`
2. leer esta introduccion
3. abrir el repo en la IDE y entrar al devcontainer
4. abrir `L0` y empezar por `content/theory/L0-setup-laboratorio/chapters/00-introduccion.md`
5. recorrer `L0` completo
6. hacer `content/projects/focused/devcontainer-setup/`
7. volver al mapa y continuar con `L1`

## Que mirar dentro de un nivel

Cuando se abre un nivel, conviene distinguir cuatro piezas:

- `00-introduccion.md`, para ubicar el nivel en el mapa y entender que cubre y que no.
- los capitulos, donde vive el cuerpo principal del contenido.
- `exercises.md`, para verificar el recorrido con evidencia.
- el proyecto asociado, cuando exista, como siguiente paso natural del nivel.

No todos los niveles tienen hoy la misma profundidad editorial, pero la forma de entrar no cambia: primero las introducciones, despues `L0`, y recien ahi el resto del mapa.
