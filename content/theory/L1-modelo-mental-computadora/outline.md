# Outline: L1 - Modelo mental de una computadora

## Metadatos
- Prerequisitos: `L0`.
- Introducción general recomendada: `content/theory/forja.md` y `content/theory/README.md`.
- Proyectos asociados: ninguno.
- Resultado esperado: una forma mínima, operativa y consistente de pensar CPU, registros, memoria, instrucciones y programa en ejecución.
- Desbloquea: `L2`.

## Objetivo

Que la persona pueda describir un programa en ejecución como una máquina de estado mínima, distinguiendo CPU, registros, memoria, direcciones, código y datos, sin necesitar todavía el detalle binario de `L2` ni el pipeline de compilación de `L3`.

## Preguntas guía

- Qué modelo mínimo de computadora hace falta para no tratar al código como magia.
- Qué papel cumple la CPU y por qué no alcanza con decir "ejecuta instrucciones".
- Cómo se relacionan registros, memoria y direcciones.
- Qué cambia concretamente en el ciclo fetch-decode-execute.
- Qué diferencia hay entre source, código cargado, datos y programa en ejecución.
- Por qué este modelo evita confusiones futuras sobre punteros, stack, debugging y comportamiento observable.

## Capítulos

### Capítulo 00 - Introducción
**Archivo:** `chapters/00-introduccion.md`
**Objetivo:** ubicar L1 en el mapa, fijar sus límites y explicar por qué este modelo mental viene antes de representación binaria, compilación y assembly.
**Secciones:**
- `## Qué es este nivel`
- `## Qué cubre`
- `## Qué toca superficialmente y por qué`
- `## Qué no cubre y por qué`
- `## Cómo trabajarlo`
- `## El nivel siguiente`

**Notas:** esta introducción debe apoyarse en `content/theory/README.md`, no repetir la presentación general de Forja y dejar claro que L1 sigue siendo trabajo dentro del repo abierto y del contenedor operativo.

### Capítulo 01 - La computadora como máquina de estado
**Archivo:** `chapters/01-maquina-de-estado.md`
**Objetivo:** reemplazar la intuición vaga de "la computadora corre código" por un modelo mínimo de estado + instrucciones + transiciones.
**Secciones:**
- `## Dato e instrucción: cambia la lectura, no la materia`
- `## Von Neumann sin folklore`
- `## El modelo mínimo que hace falta`
- `## Estado, instrucciones y transiciones`
- `## Entrada, salida y entorno`
- `## Qué deja afuera este modelo`

**Notas:** este capítulo no debe convertirse en historia de la computación ni en electrónica. Tiene que fijar una intuición operativa, simple y reusable. Conviene entrar primero por una intuición cotidiana sobre lectura y rol, después por la idea de programa almacenado y recién entonces formalizar CPU, memoria, program counter y traza. Si aparece un término técnico antes de su definición, tiene que quedar glosado en el mismo momento. También conviene fijar temprano que la diferencia entre dato e instrucción es de interpretación y rol dentro de la ejecución, no de "materia" distinta.

### Capítulo 02 - CPU, registros y memoria
**Archivo:** `chapters/02-cpu-registros-memoria.md`
**Objetivo:** distinguir claramente los roles de CPU, registros, memoria y direcciones antes de hablar de representación binaria o punteros formales.
**Secciones:**
- `## CPU como ejecutor`
- `## Registros: estado cercano y pequeño`
- `## Memoria: espacio direccionable`
- `## Direcciones no son valores misteriosos`
- `## El program counter como ancla del flujo`

**Notas:** este capítulo debería anclar temprano con trazas o diagramas del repo. Puede nombrar stack pointer o registros especiales solo como intuición, sin abrir todavía el detalle que llegará después.

### Capítulo 03 - El ciclo fetch-decode-execute
**Archivo:** `chapters/03-fetch-decode-execute.md`
**Objetivo:** mostrar paso a paso qué significa que una instrucción cambie el estado de la máquina.
**Secciones:**
- `## Qué significa fetch`
- `## Qué significa decode`
- `## Qué significa execute`
- `## Cómo avanza o cambia el program counter`
- `## Saltos, bifurcaciones y loops`

**Notas:** el recorrido debería apoyarse en una traza pequeña y repetible. No hace falta assembly real todavía, pero sí hace falta que el lector pueda seguir una secuencia concreta de cambios de estado.

### Capítulo 04 - Código, datos y programa en ejecución
**Archivo:** `chapters/04-codigo-datos-programa.md`
**Objetivo:** separar source, código cargado, datos y proceso como programa en ejecución, sin adelantarse al detalle de sistemas operativos.
**Secciones:**
- `## Código y datos viven en memoria`
- `## El source no es el programa en ejecución`
- `## Qué significa que un proceso tenga estado`
- `## Por qué este modelo explica muchos errores`
- `## Lo que L2, L3 y L7 vuelven más concreto`

**Notas:** la palabra proceso entra acá de manera mínima, como programa con estado en ejecución. Scheduler, syscalls y aislamiento quedan fuera.

## Ejercicios

- Dada una traza simple, identificar qué cambia en PC, registros y memoria después de cada instrucción.
- Clasificar afirmaciones típicas como confusión entre CPU, registro, memoria, dirección, código o dato.
- Explicar qué cambia y qué no cambia cuando una instrucción salta a otra dirección.
- Distinguir source, ejecutable, memoria cargada y programa en ejecución en ejemplos concretos.
- Justificar con ejemplos por qué este nivel va antes de `L2`, `L3` y `L7`.

## Decisiones de diseño

- `L1` no es un curso de electrónica ni de arquitectura de hardware; es el modelo mental mínimo para leer el resto del track con menos magia.
- La representación binaria se posterga a `L2`; este nivel solo necesita una noción operativa de dirección y estado.
- El pipeline de compilación se posterga a `L3`; no conviene mezclar todavía source, compilador y ejecutable con demasiados pasos técnicos.
- La alfabetización assembly se posterga a `L7`; primero hace falta entender qué cambia en la máquina, después cómo se ve eso en una notación concreta.
- No hay proyecto asociado porque `L1` funciona como base conceptual para varios niveles posteriores, no como disparador directo de un artefacto canónicamente separado.