# Outline: L1 — Modelo mental de una computadora

> Documento de diseño interno. No se sirve en la web. Guía para escribir capítulos y ejercicios de `L1`. Voz y prosa: [estandar_editorial_forja.md](../../../estandar_editorial_forja.md). Estructura: [CONVENTIONS.md](../../../CONVENTIONS.md).

---

## Metadatos

- **Prerrequisitos:** `L0`.
- **Bloque editorial de entrada recomendado:** `content/theory/forja.md`, `content/theory/README.md`.
- **Proyectos asociados:** ninguno.
- **Desbloquea:** `L2`.
- **Fuente curricular:** [docs/forja-contenido.md §6 L1](../../../docs/forja-contenido.md).

---

## Objetivo del nivel

Que la persona pueda describir un programa en ejecución como una máquina de estado mínima donde CPU, registros, memoria, instrucciones y `pc` cambian según un ciclo observable, sin necesitar todavía ni representación binaria precisa ni assembly real.

---

## Contrato conceptual

Lo que `L1` debe dejar instalado:

- una máquina mínima compuesta por CPU, registros, memoria direccionable, programa cargado y `pc`;
- la noción de **estado** como información actual del conjunto, y de **transición** como cambio producido por una instrucción;
- la idea de **programa almacenado**: las instrucciones también viven en memoria;
- la distinción entre **rol** e **interpretación**: un mismo bloque material puede leerse como instrucción o como dato según cómo lo use la ejecución;
- el ciclo `fetch → decode → execute` como apertura mínima del paso interno;
- el `pc` como ancla del flujo, su avance secuencial por defecto, su cambio bajo saltos;
- la diferencia entre **source**, **código cargado en memoria**, **datos** y **proceso en ejecución**.

Lo que `L1` **no** instala (se posterga con cita):

- representación binaria precisa de instrucciones y datos: `L2`;
- pipeline de compilación: `L3`;
- assembly real con ISA concreta: `L7`;
- detalles físicos del procesador, MMU, cache, pipelines hardware: queda fuera del track o en niveles avanzados;
- sistema operativo como capa formal: aparece desde `L20`.

---

## Decisiones de diseño curricular

- El nivel trabaja sobre **trazas tabulares de estado**. La traza es la materialidad principal del nivel, no los diagramas.
- Se usa un ISA de juguete (instrucciones nominales tipo `LOAD`, `STORE`, `MOV`, `ADD`, `JNZ`) sin sintaxis real de x86 ni ARM. Esto evita confundir el modelo con una ISA específica antes de `L7`.
- Se separan registros y memoria por **función y costo conceptual**, no por hardware real.
- El `pc` aparece desde el primer capítulo como parte explícita del estado.
- Se posterga deliberadamente cualquier discusión de pipelines de hardware, predicción de saltos o microarquitectura.
- Hay un capítulo dedicado a **flujo de control** (saltos, loops como consecuencia, no como construcción del lenguaje) porque es fuente principal de confusión cuando aparecen punteros a función o saltos relativos en niveles posteriores.

---

## Continuidad interna con niveles vecinos

Para el redactor, no para el cuerpo del capítulo (v2 §R7).

- **Hacia `L2`:** la idea de "el patrón material no trae interpretación pegada" ya queda preparada acá con la distinción rol/interpretación. `L2` la profundiza con bits, bytes y convenciones de lectura.
- **Hacia `L3`:** la diferencia source / código cargado / proceso es base directa del pipeline.
- **Hacia `L7`:** todo lo que acá aparece como ISA de juguete reaparece como x86-64 con sintaxis y registros reales.
- **Hacia `L9`/`L12`:** la idea de que una dirección nombra una posición es prerrequisito de punteros y de layout de proceso.

---

## Capítulos

### Capítulo 00 — Introducción

**Archivo:** `chapters/00-introduccion.md`

**Objetivo:** abrir el problema del nivel — sin modelo mínimo, el resto del track se vuelve vocabulario sin ancla — y declarar que el nivel trabaja con un ISA de juguete y trazas de estado.

**Problema técnico que abre:** "la computadora ejecuta código" es una descripción inservible para diagnosticar nada. Hace falta un modelo donde el cambio sea observable.

**Modelo mental que instala:** una máquina como conjunto de piezas que cambian de estado bajo instrucciones; un nivel que se ataca con trazas, no con metáforas.

**Secciones planificadas (H2):**
- `## El problema del modelo mínimo`
- `## Las piezas que el nivel separa`
- `## La traza como herramienta de trabajo`
- `## El ISA de juguete y por qué no es x86 todavía`

**Materialidad obligatoria:**
- mención explícita de CPU, registros, memoria, `pc`, programa;
- una primera traza de tres filas como anticipo de la herramienta de todo el nivel;
- referencia a la solapa `simulador` del nivel.

**Confusiones que desmonta:**
- `L1` como assembly disfrazado;
- la máquina como masa indiferenciada;
- "todavía no hay bits" leído como "no hay materialidad".

**Cierre conceptual:** la persona sabe qué clase de modelo va a construir y por qué la traza es el modo de trabajo.

**Notas v2 para el redactor:** este capítulo es el que más riesgo tiene de caer en plantilla. Las exclusiones (representación binaria, pipeline, assembly real) van en una sola oración en prosa, no como sección. La transición a `L2` vive en el `README.md`.

---

### Capítulo 01 — La computadora como máquina de estado

**Archivo:** `chapters/01-maquina-de-estado.md`

**Objetivo:** instalar estado, instrucción y transición como triada operativa, antes de nombrar las piezas.

**Problema técnico que abre:** mientras el código se vea como secuencia mágica de acciones, no hay base para diagnosticar nada de lo que viene después.

**Modelo mental que instala:**
- estado = información actual del conjunto;
- instrucción = descripción de una transformación;
- transición = paso de un estado al siguiente bajo una instrucción.

**Secciones planificadas (H2):**
- `## Estado, instrucción y transición`
- `## Programa almacenado`
- `## Rol e interpretación: la materia y la lectura`
- `## El estado mínimo que vamos a observar` (revisar a la luz de v2 §A9: si el "vamos a" cae en plural didáctico, sustituir por `## Las piezas del estado mínimo`)
- `## Una primera traza de juguete`

**Materialidad obligatoria:**
- programa de juguete de 3-4 instrucciones (al estilo `LOAD r0, [40]; ADD r0, 1; STORE r0, [40]`);
- traza tabular completa con columnas `momento / pc / r0 / mem[40]`;
- al menos una mención de "el mismo bloque material puede leerse como instrucción o como dato según cómo lo use la ejecución".

**Confusiones que desmonta:**
- código y dato como sustancias distintas;
- ejecución como fenómeno mágico;
- programa almacenado como trivia histórica.

**Cierre conceptual:** la persona puede describir una ejecución como secuencia de transiciones bajo instrucciones, y nombrar el estado mínimo.

---

### Capítulo 02 — Memoria como espacio direccionable

**Archivo:** `chapters/02-memoria.md`

**Objetivo:** fijar la memoria como un espacio donde cada posición tiene un nombre (la dirección) y se accede por ese nombre.

**Problema técnico que abre:** sin la idea explícita de dirección, "la memoria" suena como un único saco indiferenciado y todos los conceptos posteriores (punteros, stack, layout) quedan apoyados en intuiciones inconsistentes.

**Modelo mental que instala:**
- memoria como secuencia de posiciones identificadas por dirección;
- una dirección es un nombre, no un valor especial;
- el contenido de una posición es el valor;
- el contenido puede ser leído como dato o como instrucción según el rol que cumpla en la ejecución.

**Secciones planificadas (H2):**
- `## Direcciones como nombres de posiciones`
- `## Contenido y dirección no son la misma cosa`
- `## Lectura y escritura como operaciones distintas`
- `## Memoria como soporte de instrucciones y de datos`
- `## Lo que el nivel todavía no asume sobre memoria`

**Materialidad obligatoria:**
- tabla `dirección / contenido` con al menos seis filas;
- ejemplo donde la misma posición se lee primero como instrucción y después como dato (o viceversa) en una traza distinta;
- cita explícita de la diferencia entre "dirección 40" y "el valor 40 que está en la dirección 40".

**Confusiones que desmonta:**
- dirección como cantidad mística;
- memoria como caja negra del proceso;
- creer que la posición de la instrucción y la del dato viven en mundos separados.

**Cierre conceptual:** la persona puede mirar una tabla de memoria y distinguir nombre y contenido.

---

### Capítulo 03 — CPU y registros

**Archivo:** `chapters/03-cpu-registros.md`

**Objetivo:** ubicar la CPU como pieza que ejecuta el paso actual y a los registros como estado de trabajo cercano y pequeño.

**Problema técnico que abre:** la CPU se confunde a menudo con "toda la computadora" y los registros con "memoria cualquiera". Sin separación, las explicaciones posteriores de calling conventions, stack frames y debugging se desploman.

**Modelo mental que instala:**
- CPU = ejecutor del paso actual;
- registros = piezas pequeñas, nombradas, accesibles instantáneamente, que la CPU usa como cuaderno inmediato;
- la diferencia entre operar "en registro" y "en memoria" es funcional, no decorativa.

**Secciones planificadas (H2):**
- `## La CPU como ejecutor del paso actual`
- `## Registros como cuaderno cercano`
- `## Operar en registro vs operar en memoria`
- `## Cuántos registros y por qué este número no importa todavía`
- `## El `pc` como un registro especial`

**Materialidad obligatoria:**
- traza donde una instrucción mueva valores entre registros sin tocar memoria;
- traza donde la dirección de acceso a memoria viva en un registro;
- comparación visible de dos pasos consecutivos: uno con escritura en registro, otro con escritura en memoria.

**Confusiones que desmonta:**
- CPU como sinónimo de "la computadora";
- registro como una posición de memoria más;
- `pc` como instrucción en sí mismo y no como dirección de la próxima instrucción.

**Cierre conceptual:** la persona puede ubicar dónde vive el cambio en cada paso (registro / memoria / `pc`).

---

### Capítulo 04 — Instrucciones y operandos

**Archivo:** `chapters/04-instrucciones-operandos.md`

**Objetivo:** clasificar las instrucciones del ISA de juguete según qué consultan y qué modifican.

**Problema técnico que abre:** sin clases distinguibles, todas las instrucciones se ven iguales y la lectura de trazas se vuelve memorística.

**Modelo mental que instala:**
- instrucciones de movimiento entre registros (`MOV`);
- instrucciones que tocan memoria (`LOAD`, `STORE`);
- instrucciones aritméticas (`ADD`, `SUB`);
- instrucciones de control de flujo (`JMP`, `JNZ`);
- cada clase consulta y modifica partes distintas del estado.

**Secciones planificadas (H2):**
- `## Operandos: qué consulta una instrucción`
- `## Movimiento entre registros`
- `## Acceso a memoria: `LOAD` y `STORE``
- `## Aritmética sobre registros`
- `## Instrucciones que cambian el `pc``
- `## Una taxonomía operativa para leer trazas`

**Materialidad obligatoria:**
- tabla con cinco columnas: instrucción / lee de / escribe en / cambia `pc` / efecto observable;
- al menos una traza que combine las cuatro clases.

**Confusiones que desmonta:**
- `MOV` como sinónimo de cualquier traslado de valor;
- creer que aritmética implica acceso a memoria;
- creer que toda instrucción cambia todo el estado.

**Cierre conceptual:** la persona puede tomar una instrucción del ISA de juguete y predecir qué partes del estado cambian.

---

### Capítulo 05 — El ciclo fetch-decode-execute

**Archivo:** `chapters/05-fetch-decode-execute.md`

**Objetivo:** abrir el paso interno mínimo entre "el `pc` señala una instrucción" y "el estado quedó modificado".

**Problema técnico que abre:** "la CPU ejecuta instrucciones" no permite seguir cómo la próxima instrucción ingresa al paso actual ni cómo deja al estado.

**Modelo mental que instala:**
- `fetch`: localización de la instrucción en memoria a partir del `pc`;
- `decode`: reconocimiento de qué tipo de transformación describe;
- `execute`: aplicación efectiva sobre el estado;
- esos tres subpasos no son ritual: cada uno responde a una pregunta distinta.

**Secciones planificadas (H2):**
- `## Fetch: localizar la instrucción señalada por el `pc``
- `## Decode: reconocer qué clase de instrucción es`
- `## Execute: aplicar el efecto sobre el estado`
- `## Un ciclo paso a paso sobre la traza de juguete`
- `## Por qué los tres subpasos no son cosméticos`

**Materialidad obligatoria:**
- una traza donde cada paso macro se descomponga visiblemente en `fetch / decode / execute`;
- ejemplo de instrucción donde decode aclara la diferencia entre dos clases (por ejemplo `ADD r0, 1` vs `ADD r0, [40]`).

**Confusiones que desmonta:**
- los tres términos como ritual sin contenido operativo;
- decode como traducción a binario (no se asume binario todavía);
- execute como acción única indistinguible.

**Cierre conceptual:** la persona puede descomponer un paso de la traza en sus tres subpasos y decir qué pieza del estado cambió en cada uno.

---

### Capítulo 06 — Flujo de control: program counter, saltos y loops

**Archivo:** `chapters/06-flujo-de-control.md`

**Objetivo:** mostrar que el flujo también es estado y que loops y bifurcaciones no son construcciones del lenguaje sino consecuencias del cambio del `pc`.

**Problema técnico que abre:** si los saltos se ven como "ir a otra línea" y los loops como construcción sintáctica, después no se entienden punteros a función, retorno de funciones, ni siquiera el `ret` de cualquier ABI real.

**Modelo mental que instala:**
- el `pc` avanza por defecto a la siguiente dirección;
- una instrucción puede escribir el `pc` con una dirección distinta;
- los loops emergen cuando esa dirección apunta a una posición previa bajo cierta condición;
- no hay diferencia material entre "salto hacia adelante" y "salto hacia atrás".

**Secciones planificadas (H2):**
- `## El `pc` como parte observable del estado`
- `## Avance secuencial por defecto`
- `## Saltos incondicionales`
- `## Saltos condicionales sobre el estado`
- `## Loops como consecuencia, no como construcción`
- `## El flujo como información que la traza también captura`

**Materialidad obligatoria:**
- traza con `pc` avanzando linealmente;
- traza con `pc` saltando hacia adelante;
- traza con `pc` saltando hacia atrás formando un loop, con condición observable que lo detiene.

**Confusiones que desmonta:**
- salto como "ir a otra línea" sin pasar por el estado;
- loop como construcción sintáctica;
- creer que la dirección de salto es siempre conocida en tiempo de compilación.

**Cierre conceptual:** la persona puede tomar una traza y reconocer si el `pc` avanzó por defecto, saltó por una condición o cerró un loop.

---

### Capítulo 07 — Código, datos y programa en ejecución

**Archivo:** `chapters/07-codigo-datos-programa.md`

**Objetivo:** separar source, código cargado en memoria, datos en memoria y proceso en ejecución como capas distintas que comparten modelo pero no identidad.

**Problema técnico que abre:** si estas capas quedan colapsadas, después se confunden archivo en disco, layout de proceso, ejecutable y proceso vivo.

**Modelo mental que instala:**
- source = texto que el programador edita;
- código cargado = instrucciones presentes en memoria, ya en forma ejecutable;
- datos = valores presentes en memoria sobre los que opera la ejecución;
- proceso en ejecución = el conjunto de estado más programa cargado evolucionando bajo el ciclo.

**Secciones planificadas (H2):**
- `## Source no es programa cargado`
- `## Código y datos comparten memoria pero no rol`
- `## Proceso en ejecución como estado evolucionando`
- `## Por qué este modelo explica errores que vendrán después`
- `## Lo que `L2`, `L3` y `L7` van a volver más concreto`

**Materialidad obligatoria:**
- contraste tabular entre las cuatro capas;
- ejemplo de un error conceptual típico que nace de mezclar capas (por ejemplo "cambié el archivo y el proceso ya corriendo no se enteró").

**Confusiones que desmonta:**
- source como "el programa";
- proceso como sinónimo de archivo en disco;
- código y datos como entidades aisladas que nunca comparten modelo de memoria.

**Cierre conceptual:** la persona puede nombrar las cuatro capas sin colapsarlas y reconocer cuál de ellas falla en un escenario dado.

---

## Ejercicios

`exercises/` con un archivo por ejercicio. Volumen alto, conviene granularidad.

### Ejercicio 01 — Completar una traza simple

- **Tipo:** comando observable + tabla.
- **Consigna:** dado un programa de juguete y un estado inicial, completar la traza tabular fila por fila.
- **Evidencia esperada:** tabla completa con `pc` y todos los registros y posiciones que cambian.
- **Error que detecta:** describir "qué hace" sin nombrar qué cambió.

### Ejercicio 02 — Identificar la clase de instrucción

- **Tipo:** multiple choice con verificación.
- **Consigna:** seis instrucciones del ISA de juguete; clasificar cada una en MOV / acceso a memoria / aritmética / control de flujo. Para cada una, indicar qué partes del estado cambia.
- **Evidencia esperada:** clasificación correcta + columna de efecto.
- **Error que detecta:** confundir aritmética sobre registro con acceso a memoria.

### Ejercicio 03 — Distinguir registro de memoria

- **Tipo:** clasificación + traza.
- **Consigna:** dadas tres trazas, decir en cada una si el cambio principal ocurrió solo en registros, solo en memoria o en ambos.
- **Evidencia esperada:** clasificación + justificación apoyada en las filas de la traza.
- **Error que detecta:** mirar el resultado y no las filas intermedias.

### Ejercicio 04 — Predecir el `pc` siguiente

- **Tipo:** multiple choice con verificación.
- **Consigna:** ante un salto condicional con un estado dado, predecir la siguiente dirección. Tres variantes con condiciones distintas.
- **Evidencia esperada:** dirección correcta y razón apoyada en el valor del registro evaluado.
- **Error que detecta:** tratar la bifurcación como regla textual.

### Ejercicio 05 — Reconocer un loop en una traza

- **Tipo:** lectura + reporte.
- **Consigna:** dada una traza de 12-15 pasos donde el `pc` salta hacia atrás bajo cierta condición, identificar el cuerpo del loop, su condición de salida y el número de iteraciones.
- **Evidencia esperada:** rango de direcciones del cuerpo, condición exacta, conteo de iteraciones.
- **Error que detecta:** tratar el loop como construcción y no como consecuencia.

### Ejercicio 06 — Descomponer un paso en fetch / decode / execute

- **Tipo:** descomposición.
- **Consigna:** sobre tres pasos consecutivos, escribir las tres líneas de fetch, decode y execute.
- **Evidencia esperada:** nueve líneas (tres por paso) con la pieza del estado consultada y la modificada.
- **Error que detecta:** colapsar los tres subpasos en uno.

### Ejercicio 07 — Mismo bloque material, dos roles

- **Tipo:** clasificación + razonamiento.
- **Consigna:** dado un programa donde una posición de memoria se lee primero como instrucción y luego como dato, identificar el momento del cambio de rol.
- **Evidencia esperada:** posición y momentos donde cambia el rol.
- **Error que detecta:** insistir en que el rol está pegado a la materia.

### Ejercicio 08 — Ubicar la capa del error

- **Tipo:** multiple choice con verificación.
- **Consigna:** se describen tres situaciones (un archivo editado y guardado, un proceso ya corriendo, un valor en memoria que cambió). Identificar a qué capa pertenece cada una.
- **Evidencia esperada:** capa correcta por situación.
- **Error que detecta:** colapsar source, código cargado y proceso.

### Ejercicio 09 — Comparar dos snapshots

- **Tipo:** comparación.
- **Consigna:** dos snapshots del mismo proceso, separados por dos pasos de ejecución. Decir qué cambió: solo registros, solo memoria, solo `pc`, o combinaciones.
- **Evidencia esperada:** lista de cambios por pieza.
- **Error que detecta:** llamar "cambio de programa" a cualquier diferencia de estado.

### Ejercicio 10 — Programa de juguete propio

- **Tipo:** diseño + traza.
- **Consigna:** escribir un programa de 5-7 instrucciones del ISA de juguete que use al menos una instrucción de cada clase y produzca un loop con condición de salida observable. Trazarlo completo.
- **Evidencia esperada:** programa + traza completa.
- **Error que detecta:** programas que no ejercitan flujo de control o que no terminan.

---

## Pieza interactiva

- **Solapa recomendada:** `simulador`.
- **Documento de diseño hermano:** `simulador.md`, `simulador-layouts.md`, `simulator-presets/`.
- **Rol:** ejecutar el ISA de juguete paso a paso, mostrando estado completo (registros, memoria, `pc`) en cada transición. Sirve como verificación material para los ejercicios.
- **No reemplaza:** los capítulos. Es apoyo de observación.

---

## Notas finales para el redactor

- La traza tabular es la forma material principal del nivel. Si un capítulo no tiene al menos una traza, falta materialidad (v2 §R3).
- El ISA de juguete debe usarse de forma consistente entre capítulos. No introducir variantes de sintaxis que confundan.
- No mencionar x86, ARM ni ninguna ISA real más allá de una nota breve en la introducción.
- La transición a `L2` vive en el `README.md`, no como sección de cierre de los capítulos.
