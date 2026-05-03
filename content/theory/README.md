# Introduccion al Workspace

Si ya entendiste que es Forja como plataforma, el siguiente paso es mas operativo: entender como se usa este workspace sin perderse en el mapa.

Esta introduccion no es un nivel. Es la puerta de entrada editorial al workspace y al recorrido que arranca en `L0`.

## Que vas a encontrar en el workspace

El workspace de Forja organiza varias piezas a la vez:

- el mapa curricular general
- los niveles `L0-L57`
- los proyectos focalizados e integradores
- los documentos internos que sirven para diseñar y mantener el contenido

La relacion entre piezas es esta:

- `docs/forja-contenido.md` describe el mapa curricular completo
- `content/theory/Lx-.../chapters/` contiene el material teorico que se lee en la web
- `content/projects/**` materializa esa teoria en proyectos focalizados e integradores
- `content/theory/Lx-.../README.md` documenta el estado editorial de cada nivel; `outline.md` solo aparece cuando ese nivel entra en authoria real

## Como se recorre

La secuencia recomendada al entrar al workspace no es saltar al primer tema que suene atractivo. Conviene seguir una ruta corta y disciplinada:

1. leer esta introduccion para entender el mapa
2. abrir `L0` y recorrer sus capitulos en orden
3. ejecutar los comandos o mini-labs mientras lees
4. resolver `exercises.md` como verificacion observable
5. pasar al proyecto asociado cuando exista
6. volver al mapa para seguir el siguiente tramo del recorrido

La idea no es separar teoria y practica como si fueran dos productos distintos. El workspace existe justamente para hacer visible como se referencian entre si.

## Por que L0 viene primero

L0 no existe para enseñar Docker por hobby. Existe para eliminar una fuente de ruido que arruina todo lo demas: un laboratorio inconsistente.

Si el compilador, el debugger o el entorno cambian de una maquina a otra, despues es muy facil confundir un problema del setup con un problema del codigo. Por eso el primer nivel fija el contrato del entorno antes de entrar a C, Rust o sistemas POSIX.

## Ruta minima de entrada

Si estas entrando por primera vez, la secuencia recomendada es:

1. leer esta introduccion
2. abrir `L0` y leer `content/theory/L0-setup-laboratorio/chapters/00-introduccion.md`
3. recorrer `L0` completo
4. hacer `content/projects/focused/devcontainer-setup/`
5. volver al mapa y continuar con `L1`

## Estructura de un nivel

Un nivel canonico puede existir en dos estados.

Placeholder minimo:

```text
Lx-slug/
├── README.md
└── meta.yaml
```

Nivel en authoria real:

```text
Lx-slug/
├── README.md
├── chapters/
├── outline.md
├── src/
├── exercises.md
└── meta.yaml
```

Hoy solo `L0` esta en authoria real. El resto del canon puede quedarse en placeholder minimo sin fingir capitulos ni outlines todavia no escritos.

El catalogo canonico de niveles vive en `metadata/levels.yaml`.
