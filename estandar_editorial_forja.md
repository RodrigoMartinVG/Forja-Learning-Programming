# Estándar Editorial de Forja
## Documento canónico de voz, principios, contratos por tipo de archivo y workflow

> **Estado:** estándar editorial canónico del repo. Cubre lo que se necesita **al escribir**: voz, principios pedagógicos, contratos por tipo de archivo, workflow editorial.
>
> **Refinamiento de prosa, anti-patrones y verificación automática:** [refinamiento_editorial_forja.md](refinamiento_editorial_forja.md). Ese documento se usa **al revisar**, después de cerrar el primer borrador.
>
> **Estructura del repo (slugs, layout, ejercicios, outlines):** [CONVENTIONS.md](CONVENTIONS.md). Este documento no duplica esas reglas.

---

## Índice

1. Propósito y alcance
2. Cómo se relacionan los tres documentos canónicos
3. La voz correcta
4. Principios positivos (P1–P6)
5. Contrato por tipo de archivo
6. Pedagogía Forja (cómo se enseña)
7. Workflow editorial (incluye §7.7 cuando el agente escribe)

---

## 1. Propósito y alcance

Este estándar existe para que el contenido de Forja suene, piense y se organice de forma consistente con el tipo de formación que el repo quiere producir.

**Alcance:** todo contenido técnico y editorial del repo, con foco en `content/`, `docs/` y guías editoriales.

Dentro de `content/` aplica tanto a authoría real como a placeholders. La diferencia no es si el estándar aplica, sino el tipo de texto que corresponde producir:

- En authoría real, el estándar exige modelo mental, causalidad y evidencia material.
- En placeholders, exige sobriedad, honestidad estructural y no simular contenido terminado.

---

## 2. Cómo se relacionan los tres documentos canónicos

Forja tiene tres documentos canónicos que se usan en momentos distintos del trabajo editorial:

| Documento | Rige | Cuándo se consulta |
|---|---|---|
| [CONVENTIONS.md](CONVENTIONS.md) | **Estructura del repo**: slugs, layout, ubicaciones, estados (placeholder vs authoría real), proceso de diseño, contrato del `outline.md` como artefacto. | Antes de **crear o mover** archivos de contenido. |
| `estandar_editorial_forja.md` (este) | **Cómo se escribe**: voz, principios, contratos por tipo de archivo, workflow editorial. | Antes y durante **la redacción**. |
| [refinamiento_editorial_forja.md](refinamiento_editorial_forja.md) | **Cómo se revisa**: reglas de prosa R1–R11, anti-patrones A1–A14, reglas por dominio, protocolo de revisión, verificación automática. | Después de **cerrar el primer borrador**. |

Cuando un tema cae en una zona gris, la regla es:

- si define **dónde vive un archivo o cómo se nombra**, vive en CONVENTIONS;
- si define **cómo suena el texto al escribirlo o qué pieza estructural cumple cada archivo**, vive en este estándar;
- si define **qué errores buscar en un texto ya escrito**, vive en el refinamiento.

La sección §10 de CONVENTIONS contiene la tabla de división de competencia entre CONVENTIONS y este estándar.

---

## 3. La voz correcta

La voz de Forja es:

- sobria
- directa
- material
- técnicamente precisa
- pedagógicamente deliberada
- coherente con el mapa largo del track
- empática con la dificultad real del tema

No suena como:

- divulgación entusiasta
- academia despegada del trabajo real
- tutorialismo paternalista
- folklore de seniority
- marketing técnico
- documentación de referencia (manuales tipo Intel SDM, páginas `man`, especificaciones)

El texto no tiene que impresionar. Tiene que instalar criterio reusable.

**Aclaración de registro.** Sobriedad no es sequedad. El modelo mental implícito es el de un buen libro de sistemas (Patterson & Hennessy, Bryant & O'Hallaron, Tanenbaum), no el de la documentación de referencia de un fabricante. La voz acompaña al lector mientras avanza: lo sitúa antes de exigirle un salto, nombra la dificultad cuando aparece, conecta lo nuevo con lo que ya quedó establecido. La precisión técnica y la calidez pedagógica conviven; ninguna excusa la ausencia de la otra. Un capítulo que afirma hechos correctos pero deja al lector sin contexto, sin transición y sin reconocimiento de la dificultad falla por igual que uno con prosa florida.

### 3.1 Persona y modo verbal

Regla única: **voz impersonal por defecto**.

- Permitido: presente impersonal (`la máquina ejecuta`, `hace falta distinguir`), pasiva refleja (`se observa`, `se reconstruye`), nominalización cuando aclara (`la lectura unsigned reparte...`).
- Permitido en doses muy chicas, solo en ejercicios o instrucciones operativas: imperativo en vos rioplatense (`tomá`, `mirá`, `corré`). No en capítulos teóricos.
- Prohibido: primera persona del plural didáctica (`vamos a ver`, `nuestro programa`), segunda persona explícita en capítulos teóricos (`vos podés`, `tu programa`).

Excepción: el README de un nivel puede usar imperativo en su sección de "cómo recorrerlo" si la pieza es genuinamente operativa.

---

## 4. Principios positivos (P1–P6)

### P1. Modelo mental antes que taxonomía
Cada sección deja una distinción operativa, no una lista de términos.

### P2. Mecanismo antes que consigna
Cuando el tema lo permite, explicar qué produce el comportamiento y bajo qué condiciones se observa.

### P3. Materialidad antes que abstracción flotante
Anclar en archivos, comandos, artefactos, output, memoria, dumps, símbolos, objetos, ejecutables. Si un capítulo de 600+ palabras no tiene **ningún** anclaje material y el dominio lo permite, el capítulo no cumple P3.

### P4. Continuidad curricular explícita pero no invasiva
La relación con niveles vecinos existe, **una vez**, en el lugar correcto. No invade cada párrafo con recordatorios de alcance.

### P5. Densidad útil, no compresión defensiva
Se puede escribir corto. No se debe escribir críptico para parecer riguroso. No se debe inflar con bullets ceremoniales para parecer estructurado.

### P6. Empatía con la dificultad
Los temas del track son difíciles. La voz lo reconoce sin dramatizar y sin disculparse. Reconocer la dificultad significa, en concreto: situar al lector antes de pedirle el salto, nombrar dónde suele perderse la intuición, conectar el concepto nuevo con uno previo que ya quedó establecido, y dejar pistas explícitas cuando una distinción es contraintuitiva. Reconocer la dificultad **no** significa: pedir disculpas por la complejidad, anunciar que algo es difícil sin razonarlo, ni recurrir a metáforas reblandecidas. La empatía aquí es estructural —cómo se ordena el texto— no decorativa.

---

## 5. Contrato por tipo de archivo

### 5.1 `outline.md`
- Fija estructura, objetivo, preguntas guía y decisiones de diseño.
- No suena como capítulo terminado.
- Puede usar bullets densamente; ese es su modo natural.

### 5.2 `README.md` de nivel o proyecto
- Fija estado editorial, alcance, artefactos visibles, prerrequisitos y próximo paso.
- **Aloja la transición curricular hacia el nivel siguiente** (regla R7 del refinamiento).
- En placeholders, declara honestamente que todavía no hay authoría real.

### 5.3 Capítulos (`chapters/NN-*.md`)
- Abren con un problema técnico o conceptual real (no con anuncio de intención).
- Desarrollan mecanismo, ejemplo material y consecuencia.
- Cierran con una idea retenible específica de ese capítulo. **No** con "consecuencia genérica" ni con pasarela hacia el siguiente.
- Contienen al menos un anclaje material si el dominio lo permite (P3).

### 5.4 `00-introduccion.md` de un nivel

Sub-contrato del 5.3 con regla extra:

- Nombra qué problema abre el nivel.
- Puede incluir, **una sola vez y en prosa breve**, qué deja afuera.
- **No** usa la plantilla `Qué es / Qué cubre / Qué no cubre / Cómo trabajarlo / El nivel siguiente`. Si el revisor encuentra esa estructura, el archivo se rechaza (anti-patrón A6 del refinamiento).
- La transición a `LX+1` no aparece en el cuerpo. Vive en el `README.md` (5.2).

#### 5.4.1 Epígrafe del nivel

La introducción de cada nivel **abre con un epígrafe**: una cita de un científico, filósofo, ensayista, escritor o personaje de ficción identificable, que dialogue de forma **tangencial o parabólica** con el tema del nivel. Es parte del canon editorial de Forja: todo `00-introduccion.md` con authoría real lleva epígrafe. La única excepción admisible está al final de esta subsección.

**Dónde y cómo aparece.**

- Encima del primer heading `##` del archivo, después del `# Título`. Nunca en otro capítulo del nivel; sólo en `00-introduccion.md`.
- Formato: blockquote con la cita, salto de línea, atribución precedida por em-dash y entre cursivas, con la obra o fuente cuando exista.
- Idioma: la cita va traducida al español. Si la formulación original en otro idioma agrega valor (juego de palabras, cadencia), se permite citar en idioma original y agregar la traducción debajo entre paréntesis.
- Para personajes de ficción, la atribución nombra al personaje y la obra: `— Ivan Karamázov, en Los hermanos Karamázov, F. Dostoyevski`. No se atribuye a la persona del autor lo que dice el personaje.

**Forma canónica.**

```markdown
# Introducción

> La cita, breve, una a tres líneas como mucho.
> — *Atribución, Obra (año si corresponde)*

## Primera sección
```

**Reglas de selección.**

- **Tangencial, no literal.** La cita ilumina el tema desde un ángulo oblicuo: una metáfora, una analogía, una observación general que el lector puede reinterpretar a la luz del nivel. Si la cita habla *literalmente* del tema técnico, sobra.
- **Verificable.** Sólo se usan citas con fuente identificable (libro, ensayo, carta, entrevista, capítulo, episodio). Si la atribución es dudosa, se prefijea con "Atribuida a" o se descarta. No se usan citas pescadas de listas de internet sin verificación.
- **No-cliché.** Quedan vetadas las citas archirepetidas en formación técnica, además de cualquier variante reconocible de las mismas. Lista no exhaustiva:
  - Newton sobre los hombros de gigantes.
  - Galileo sobre el universo escrito en lenguaje matemático.
  - Clarke sobre tecnología avanzada indistinguible de la magia.
  - Dijkstra sobre que la informática no es más sobre computadoras que la astronomía sobre telescopios.
  - Knuth sobre la optimización prematura.
  - Brooks sobre nueve mujeres y un bebé.
  - "KISS", "YAGNI", "en mi máquina funciona", "no es un bug, es un feature", "si no está roto no lo arregles", "la mejor línea de código es la que no se escribe", "mide dos veces, corta una", "primero resuelve el problema, luego escribe el código", "si te tomó más de diez minutos hacerlo dos veces, automatízalo".
  - Cualquier cita motivacional genérica de la industria del software, aforismos de management, y frases de redes sociales atribuidas vagamente a Einstein, Twain, Borges o similares sin fuente firme.
- **No epígrafes en cadena.** Un epígrafe por nivel. No se acumulan dos citas. No se anida una cita técnica debajo de una literaria.

**Guiño interno (canónico, una vez por nivel).**

A lo largo del nivel se retoma, **una sola vez**, una imagen, palabra o estructura del epígrafe, integrándola con naturalidad en la prosa de un capítulo intermedio. El guiño no es comentario sobre la cita ni explicación de ella: es eco de vocabulario o de forma, suficientemente sutil como para que un lector que no haya registrado el epígrafe lea el pasaje sin tropiezo. Reglas:

- **No en `00-introduccion.md`**: el epígrafe ya está ahí; el guiño vive en otro capítulo.
- **No en el último capítulo**: cerrar un nivel "volviendo" a la cita es gesto retórico previsible y queda vetado.
- **No nombrar al autor citado** dentro del guiño ("como decía X…"). El eco es léxico o estructural, no atribuido.
- **Una sola vez por nivel**. Repetir el guiño lo convierte en motivo decorativo y lo destruye.
- Si la cita admite subversión o lectura irónica desde el contenido técnico, esa es una forma legítima del guiño (ejemplo: contrastar con Humpty Dumpty para fijar que las convenciones no son arbitrarias).

**Cuándo no usar epígrafe (excepción).**

Si después de búsqueda honesta no aparece una cita que cumpla todas las reglas anteriores, el nivel abre sin epígrafe y sin guiño. Es preferible la ausencia limpia a una cita débil, literal, mal atribuida o decorativa. Esta excepción se documenta en el `outline.md` del nivel con una línea: *"sin epígrafe: <razón>"*. No se ejerce por comodidad.

**Registro en el `outline.md`.**

El `outline.md` del nivel registra el epígrafe como parte del diseño del Capítulo 00, en un bloque dedicado dentro de la entrada de ese capítulo. El bloque incluye:

- la cita elegida y su atribución completa (con obra y año cuando exista);
- una línea breve sobre por qué es tangencial al tema y no cae en la lista de vetos;
- el capítulo donde va a aparecer el guiño y la imagen, palabra o estructura que se retoma.

Si el epígrafe se descarta, el bloque queda como `**Epígrafe:** sin epígrafe — <razón>`. La regla §7 de [CONVENTIONS.md](CONVENTIONS.md) exige que esta decisión esté tomada **antes** de redactar `00-introduccion.md`: el epígrafe forma parte del outline, igual que los objetivos del capítulo y las secciones planificadas.

**Selección humana, no automatizada.** La elección del epígrafe la hace una persona. Las reglas de no-cliché y verificabilidad exigen criterio cultural y comprobación de fuentes que un agente automatizado no puede garantizar (riesgo de cita mal atribuida, cliché no detectado, o construcción "sospechosamente perfecta" que delata IA). Si quien redacta el `00-introduccion.md` es un agente y el outline no trae epígrafe, deja un placeholder explícito (`> <epígrafe pendiente: a definir por humano según §5.4.1>`) y avisa. No improvisa.

### 5.5 Ejercicios (`exercises.md` o `exercises/`)
- Ponen al lector a observar, distinguir, registrar o explicar.
- Permiten imperativo en segunda persona (3.1).
- No funcionan como mini ensayos pedagógicos previos al trabajo. La consigna llega rápido.

### 5.6 Documentos de diseño (`outline.md`, `simulador*.md`, `laboratorio*.md`, `*-arquitectura.md`)
Contienen explícitamente, en este orden:

1. Objetivo del documento (no del nivel).
2. Contrato conceptual (qué fija y qué no fija).
3. Decisiones tomadas, con su razón.
4. Decisiones pendientes o exclusiones declaradas.
5. Relación con el nivel y con artefactos hermanos.

No se disfrazan de capítulo. No se renderizan como teoría en `web/`.

### 5.7 `meta.yaml` y otros metadatos
Datos estructurales puros. No prosa. Si requieren explicación, va en el `README.md`.

### 5.8 `src/` y artefactos mínimos
- Sirven al nivel.
- No se expanden hasta tapar el modelo.
- No acumulan artefactos generados que no formen parte del contenido fuente.

### 5.9 Simetría artificial entre archivos distintos
Aunque dos archivos compartan nivel, **no deben sonar como la misma pieza con rótulo distinto**. README, capítulo, ejercicio y documento de diseño tienen contratos diferentes y deben mostrarlo.

---

## 6. Pedagogía Forja (cómo se enseña)

Esta sección consolida los criterios pedagógicos sobre los que opera la voz definida en §3. Las reglas R1–R11 del refinamiento dicen cómo no debe sonar el texto; esta sección dice qué tiene que estar haciendo el texto cuando suena bien.

### 6.1 Nombrar el modelo incorrecto probable

Cuando el lector trae una intuición errada pero razonable, el texto la nombra y la reemplaza, en vez de actuar como si esa intuición no existiera.

Ejemplos típicos en el dominio Forja:

- "la memoria guarda texto o números por naturaleza"
- "compilar es una sola operación"
- "un objeto `.o` ya es casi un ejecutable"
- "`make` reemplaza el pipeline"
- "los threads comparten memoria" (cuando lo relevante es espacio de direcciones virtual y sincronización)

Nombrar el modelo incorrecto no es lo mismo que la negación correctiva serial (anti-patrón A3 del refinamiento): la negación se cuida cuando es **el motor estructural** del capítulo. Una corrección puntual de un modelo previo está bien y suele ser indispensable.

### 6.2 Patrón canónico: pregunta → mecanismo → artefacto → reaparición

El recorrido preferido de un capítulo o sección de Forja es:

1. **Pregunta o confusión real** que el tramo abre.
2. **Distinción o mecanismo** que la resuelve.
3. **Evidencia material** que la deja anclada (P3).
4. **Dónde reaparece** más adelante en el track, si corresponde —en una sola frase, no como sección.

Ese orden no es decorativo: ordena la atención del lector y vuelve la prosa demostrable. Saltar del paso 1 al 3 sin pasar por el 2 produce manuales. Saltar del 2 al 4 sin pasar por el 3 produce abstracción flotante.

### 6.3 El error enseña mejor que la receta

Siempre que el dominio lo permita, el texto muestra:

- la configuración correcta;
- la configuración incorrecta o incompleta;
- el síntoma observable;
- el mecanismo que conecta causa y síntoma.

Un error reproducible (`undefined reference`, segfault con dirección concreta, salida divergente entre dos lecturas del mismo byte) instala el modelo más rápido que tres definiciones bien formuladas. El error es materialidad pedagógica.

### 6.4 Transferencia: del ejemplo al principio

Después del ejemplo, el texto formula —cuando corresponde— el principio general que el ejemplo deja instalado. Si no, el lector aprende el caso y pierde el criterio.

Esto **no** autoriza moralejas ni "lo importante es" (anti-patrón A1 del refinamiento). Autoriza una oración técnica que nombre la propiedad general que el ejemplo concretó.

### 6.5 Progresión antes que maximalismo

No todo lo verdadero debe decirse en el primer texto donde el tema aparece. Una explicación correcta puede decir explícitamente: esto entra ahora; esto se posterga; esto reaparece en `LX`; esto se retoma con precisión en `LY`. Eso no es debilidad, es diseño curricular.

La gestión de fronteras curriculares vive en aperturas, cierres o secciones específicas de frontera —no frase a frase dentro del desarrollo (anti-patrón A8 del refinamiento).

### 6.6 Coherencia de nivel sobre brillo local

Un capítulo no "mejora" por volverse brillante si rompe el arco del nivel o contradice la progresión del track. La pregunta correcta no es *¿esto quedó interesante por sí solo?* sino *¿esto fortalece el modelo del nivel sin comerse niveles posteriores ni introducir incoherencias con los anteriores?*

### 6.7 Empatía estructural, no decorativa

Reconocer la dificultad de un tema no es disculparse por ella ni anunciarla. Es ordenar el texto de modo que: el lector quede situado antes de pedirle un salto; las distinciones contraintuitivas queden marcadas como tales con una pista breve; la conexión con un concepto ya establecido sea visible. La empatía es estructura del texto, no adjetivación.

---

## 7. Workflow editorial

El estándar y el refinamiento se aplican en momentos distintos del trabajo. Mezclarlos —intentar cumplir las reglas R1–R11 + A1–A14 mientras se redacta— paraliza la prosa y produce texto sobre-corregido sin voz.

### 7.1 Antes de empezar

Releer:

- §3 (voz), §4 (principios), §5 (contrato del tipo de archivo que vas a escribir) y §6 (pedagogía Forja) de **este documento**.
- El `outline.md` del nivel o la entrada correspondiente del documento de diseño relevante.
- Si es un capítulo: el capítulo anterior y el siguiente del mismo nivel, para saber qué deja firme el previo y qué necesita asumir el próximo (continuidad curricular, P4).

**No releer ahora** las reglas R1–R11 ni los anti-patrones A1–A14 del [refinamiento](refinamiento_editorial_forja.md). Te frenan.

### 7.2 Primer borrador

- Escribir desde la voz, no desde la regla.
- Apoyarse en lo material (artefactos, comandos, dumps, errores reales) — eso es P3 y se cumple si pensaste el contenido bien, no si memorizaste la regla.
- No releer mientras escribís. Cerrar el primer borrador entero antes de cualquier corrección.

### 7.3 Revisión humana (sin script)

- Leer el archivo entero, idealmente en voz alta. Lo que suena raro al oído ya identifica el grueso de los problemas mecánicos.
- Marcar con `[?]` lo que duda, sin arreglar todavía.
- Esta pasada es la única que detecta lo que el script no ve: P3 materialidad real (no anclaje formal), R10 entrada situada, R11 transiciones que cargan continuidad, B1–B5 del refinamiento (reglas por dominio).

### 7.4 Revisión mecánica (con script)

Correr el verificador:

```bash
python scripts/forja.py editorial-stats --target content/theory/<nivel>
```

Para cada celda roja: aplicar el **test del borrado** (R1.bis del refinamiento). ¿La oración pierde algo si quito esa palabra/frase? Si no pierde, borrar. Si pierde, dejar y registrar por qué.

No reescribir para que el script quede verde. Reescribir para que la frase sea más limpia. El verde es consecuencia.

Detalles operativos del script (umbrales, métricas, falsos positivos): §8 del [refinamiento](refinamiento_editorial_forja.md).

### 7.5 Revisión final con veredicto

Completar la hoja de revisión definida en §6.4 del [refinamiento](refinamiento_editorial_forja.md). El veredicto es binario: APROBADO o RECHAZADO.

Si después de la pasada mecánica el archivo sigue con celdas rojas que vos juzgás bien usadas, la regla está clara: el script es termómetro, no juez. Anotar la decisión y dejar el rojo.

### 7.6 El espíritu

Este estándar y el refinamiento existen para **quitar lo ornamental para que lo material respire**. No para producir prosa picada que cumple umbrales. La voz, los principios y los contratos por tipo de archivo (este documento) son el contenido estable. Las reglas mecánicas (refinamiento) son herramientas para detectar los desvíos más comunes, no la definición de buena prosa.

Si en algún momento el conjunto de reglas se vuelve un manifiesto que mata el texto en lugar de afilarlo, el problema está en la aplicación, no en el contenido. Releer §3 (voz) y §6 (pedagogía) suele recalibrar.

### 7.7 Cuando el agente escribe

El workflow de §7.1–§7.5 fue pensado para autoría humana. Un agente automatizado tiende a comprimir todas las fases en un único turno: lee reglas, redacta, "valida" y entrega. Esa compresión es exactamente el modo de fallo que el split estándar/refinamiento busca evitar.

Para que un agente produzca contenido que respete el espíritu del estándar:

- **Declaración previa obligatoria.** Antes de tocar el archivo, el agente declara qué outline sigue, qué capítulo previo leyó, qué capítulo siguiente anticipa y qué tipo de archivo va a producir según §5. Sin esos cuatro datos con archivos reales, no escribe.
- **Borrador honesto, no falsa autoridad.** Lo que produce el agente es **borrador para revisión humana**, no contenido aprobado. La pasada pedagógica real (P3 materialidad genuina, P6 empatía, R10/R11 continuidad) la valida una persona.
- **Epígrafe humano.** El agente no propone epígrafe (ver §5.4.1, "Selección humana, no automatizada"). Si falta, deja placeholder y avisa.
- **Veredicto humano.** El agente puede correr `forja editorial-stats` y reportar celdas rojas, pero no llena la hoja de revisión §6.4 del refinamiento ni emite APROBADO/RECHAZADO. Reporta estado mecánico y deja la decisión.

El protocolo operativo concreto vive en [.github/copilot-instructions.md](.github/copilot-instructions.md) ("Protocolo del agente para escribir contenido editorial") y en el prompt-template [.github/prompts/escribir-capitulo.prompt.md](.github/prompts/escribir-capitulo.prompt.md).
