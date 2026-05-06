# Refinamiento Editorial de Forja
## Reglas de prosa, anti-patrones, protocolo de revisión y verificación automática

> **Estado:** documento canónico de **revisión** del repo. Complementa al [estandar_editorial_forja.md](estandar_editorial_forja.md), que cubre voz, principios, contratos por tipo de archivo y workflow.
>
> **Cuándo usarlo:** después de cerrar el primer borrador, no antes. El estándar orienta al escribir; este documento opera al revisar. Intentar cumplir las reglas R1–R11 + A1–A14 mientras se redacta paraliza la prosa y produce texto rígido.

---

## Índice

1. Cómo usar este documento
2. Reglas de prosa de bajo nivel (R1–R11)
3. Reglas específicas para placeholders
4. Anti-patrones (A1–A14)
5. Reglas por dominio (B1–B5)
6. Protocolo de revisión con veredicto
7. Aplicación sobre `content/`
8. Verificación automática (`forja editorial-stats`)
9. Referencia interna de buena materialidad

---

## 1. Cómo usar este documento

El refinamiento aplica **sobre prosa ya escrita**, en pasadas sucesivas:

1. **Pasada de bloqueantes (§6.1):** detectar y corregir lo que rechaza el archivo automáticamente. Suele recortar volumen.
2. **Pasada mecánica con script (§8):** correr `forja editorial-stats` y atender las celdas rojas según el test del borrado (R1.bis).
3. **Pasada humana (§6.4):** completar la hoja de revisión leyendo el archivo entero. Esto valida lo que el script no ve: materialidad (R3), entrada situada (R10), transiciones (R11), reglas por dominio (§5).

El veredicto producido por §6 es binario: APROBADO o RECHAZADO. No hay zonas grises.

> El script y la lista de anti-patrones son **termómetros**, no jueces. Una celda roja invita a mirar el párrafo, no obliga a reescribirlo. El criterio final es humano y vive en §6.

---

## 2. Reglas de prosa de bajo nivel (R1–R11)

Esta sección gobierna las dimensiones donde el contenido se desvía de hecho aunque la voz general sea correcta.

### R1. Léxico de andamiaje sobrio

Existe un repertorio finito de muletillas que administran al lector en lugar de afirmar el hecho técnico. Su uso está **contado**, no prohibido.

**Catálogo cerrado de muletillas con presupuesto** (por capítulo de hasta ~800 palabras):

| Muletilla | Presupuesto máximo | Notas |
|---|---|---|
| `hace falta` / `hace falta entender` | 2 | Preferir afirmación directa del hecho |
| `alcanza con` / `para LX alcanza con` | 1 | |
| `queda firme` / `deja firme` / `dejar algo firme` | 1 | Evitar como cierre ritual |
| `conviene` / `sirve` / `es útil pensar` | 0 | Prohibido (ver A2) |
| `la regla práctica es` / `la idea operativa` | 0 | Prohibido (ver A2) |
| `hay que` (deóntico genérico) | 1 | Preferir el hecho |
| `tiene que quedar` / `tiene que quedar instalado` | 1 | |
| `eso obliga a`, `eso fuerza a` | 2 | Solo si la obligación es técnica, no didáctica |
| `lo importante es` / `lo importante no es X` | 0 | Prohibido (ver A1) |
| **Muletillas críticas hedge/atenuadoras**: `en realidad`, `de hecho`, `por supuesto`, `básicamente`, `obviamente`, `claramente`, `sin duda` | **2 (suma)** | Casi siempre borrables sin pérdida (test del borrado). Se permiten sólo cuando el contraste técnico es real (`la apariencia X, en realidad Y`) y queda mejor que la formulación directa. |
| **Intensificadores ornamentales**: `simplemente`, `realmente`, `efectivamente` | **3 (suma)** | Solo donde añadan precisión técnica real (`efectivamente está instalado`); vácuos como refuerzo retórico. Ver R1.bis. |
| **Intensificador técnico**: `exactamente` | **≤2 ornamentales** por archivo | Uso técnico legítimo y frecuente cuando precede número, identidad referencial (`exactamente lo mismo`, `exactamente esos tres`), pregunta de precisión (`qué hace exactamente`) o equivalencia (`equivale, exactamente, a …`). Se cuenta aparte; el límite aplica sólo a usos ornamentales (no técnicos). Ver R1.bis y §8. |

Pasarse del presupuesto agregado (suma sobre la fila) en un mismo capítulo cuenta como defecto en revisión.

**R1.bis — Intensificadores: el test del borrado.** Antes de aceptar una ocurrencia de `simplemente`, `realmente`, `efectivamente` o `exactamente`, leer la oración sin la palabra. Si la afirmación queda igual de fuerte y precisa, la palabra sobra.

Casos donde sí agrega y se preserva:
- contraste técnico (`no es exactamente lo que pasa: la traducción la hace el compilador`),
- confirmación empírica acotada (`efectivamente responde con código cero`),
- restricción de alcance (`la memoria es simplemente una secuencia de posiciones; nada más`),
- identidad referencial (`exactamente lo mismo`, `exactamente esos tres subpasos`, `qué hace exactamente`),
- equivalencia precisa (`equivale, exactamente, a "…"`).

Casos donde sobra y el revisor borra:
- refuerzo de una afirmación que ya es fuerte (`es exactamente eso`, `es simplemente la repetición de…`),
- pares hedge `efectivamente disponible`, `realmente apuntando`, `realmente vio` cuando la versión sin el adverbio dice lo mismo,
- aposición hueca (`Lo que parece X, exactamente para que Y se afirme con la práctica`).

La misma lógica se aplica a las **muletillas críticas hedge** (`en realidad`, `de hecho`, `por supuesto`, `básicamente`, `obviamente`, `claramente`, `sin duda`): casi siempre borrables. Se preservan sólo cuando el contraste técnico es real y la formulación directa pierde algo (`la apariencia X, en realidad Y` con X falso e Y verdadero).

**R1.ter — Raya larga (—) como inciso, no como comodín.** La raya es signo de inciso, no reemplazo universal de coma, paréntesis o punto seguido. Reglas:

- Máximo **dos pares de rayas por párrafo**. Tres pares en el mismo párrafo fragmentan la lectura y suelen indicar que una de las aclaraciones merecía oración propia o paréntesis. Dos pares se toleran si caen en oraciones distintas y cada glosa carga información distinta.
- Máximo **tres párrafos consecutivos** con incisos por raya. Un cuarto párrafo con raya en la misma sucesión indica que la raya se volvió mecanismo por defecto.
- Sustitutos preferidos cuando la relación no es estrictamente parentética: punto y coma para coordinación débil, paréntesis para acotación menor (especialmente si la glosa es enumerativa o nombra ejemplos), oración nueva para idea independiente.

La raya sigue siendo útil para definir un término con una glosa breve (`la idea —conocida históricamente como *stored-program*— suena obvia hoy`) o para introducir una enumeración breve en línea (`tres ingredientes —lectura/escritura, aritmética, salto condicional— alcanzan`). Lo que la regla veta es el uso ornamental.

### R2. Bullets vs prosa

Una lista de bullets es legítima cuando:

- los ítems son de la misma clase y son al menos tres
- el orden no importa o es deliberadamente paralelo
- la información cabría en una oración pero perdería contraste paralelo

Una lista de bullets **no** es legítima cuando:

- hay solo dos ítems (va como prosa con coordinación)
- los ítems son fragmentos de la misma oración partidos artificialmente
- repite, en bullets, lo que el párrafo previo ya dijo en prosa
- aparece como "Resumen operativo" / "Si este capítulo queda firme" duplicando lo dicho

**Antes (defectuoso):**

> No cambia:
> - cuántos bytes ocupa el valor
> - qué rango de direcciones ocupa
> - que la memoria cruda se recorra byte a byte

**Después (correcto):**

> No cambia ni cuántos bytes ocupa el valor, ni el rango de direcciones que ocupa, ni el hecho de que la memoria se recorra byte a byte.

### R3. Materialidad obligatoria por dominio

Si el dominio del capítulo permite un anclaje material, el capítulo lo incluye al menos una vez. Anclajes válidos: bloque de código, traza tabular, output de herramienta, dump hex, comando con su salida, error real reproducible.

Dominios donde la materialidad es exigible:

- representación de datos (bytes, hex, traza)
- pipeline de compilación (artefactos, comandos)
- ejecución (traza de estado, registros, memoria)
- linking (símbolos, errores reales)
- procesos, syscalls, IPC (`strace`, comandos)
- formatos binarios (hexdump, `readelf`, `objdump`)

Dominios donde la materialidad puede ser conceptual:

- discusiones de diseño puramente arquitectónicas
- introducciones de nivel (con tolerancia, no como excusa)

### R4. Repetición léxica controlada

En textos cortos y secos, la repetición léxica pesa. Reglas:

- ningún sustantivo o muletilla rectora se repite **más de 4 veces** en un capítulo de ~600–800 palabras, salvo que sea el término técnico central del capítulo (`pipeline` en L3/01, `endianness` en L2/06).
- el revisor cuenta sobre el cuerpo del capítulo, sin contar títulos ni bloques de código.

### R5. Aperturas y cierres no plantilla

Una apertura plantilla es una oración inicial cuya forma puede usarse intercambiablemente entre capítulos del mismo o de distinto nivel. Catálogo cerrado en A4.

Una apertura correcta nombra un problema técnico específico, no una intención didáctica. Cierres equivalentes.

### R6. Títulos por concepto técnico

Los títulos nombran el concepto del que trata la sección, no la intención del autor.

Catálogo cerrado de títulos vetados (A8).

### R7. Sin "El nivel siguiente" en capítulos

La transición curricular vive en el `README.md` del nivel (contrato §5.2 del estándar), no como sección de cierre del `00-introduccion.md` ni de los capítulos. Si el nivel siguiente importa para el cierre conceptual de un capítulo, su mención es una sola oración en prosa, sin título propio.

### R8. Una idea por párrafo

Un párrafo afirma un hecho técnico y opcionalmente lo califica. Si el párrafo encadena dos hechos independientes, se parte. Si el párrafo afirma menos de un hecho ("transición"), se elimina.

### R9. Fluidez sobre staccato

La prosa de Forja es sobria, no cortante. Sobriedad y staccato no son lo mismo: un texto puede ser preciso, impersonal y material, y aun así leerse con respiración natural. La voz correcta evita tanto el adorno como la fragmentación nerviosa.

Defectos típicos de staccato a evitar:

- **Cadena de oraciones de 4–8 palabras** sin coordinación ni subordinación. Tres oraciones cortas seguidas suelen indicar que faltaba una subordinada.
- **Punto donde correspondía coma o `;`**. Cortar artificialmente para parecer denso produce el efecto contrario: el lector reconstruye mentalmente la coordinación perdida.
- **Repetición de la misma estructura sintáctica** en oraciones contiguas (sujeto + verbo simple + objeto, tres veces seguidas).
- **Bullets como sustituto de subordinación**. Si tres ítems son fragmentos de una misma oración subordinada, va prosa con coordinación, no lista (ver R2).
- **Cierres de párrafo en una sola oración corta**, repetidos sistemáticamente, que producen el ritmo de "anuncio + sentencia" típico del aforismo.

Criterios positivos:

- Permitir oraciones de **distinta longitud** dentro de un mismo párrafo. La variación es ritmo, no decoración.
- Usar **subordinación causal o consecutiva** (`porque`, `de modo que`, `lo que produce`, `mientras que`) cuando la relación entre dos hechos lo pide. La conexión lógica se hace explícita en la sintaxis, no se delega al lector.
- Permitir el **`;`** cuando dos oraciones cortas comparten núcleo argumental.
- Mantener el párrafo como **unidad de respiración**: una idea desarrollada en 3–6 oraciones de longitud variada vale más que la misma idea repartida en 5 oraciones de 6 palabras.

Esto no autoriza prosa florida ni adjetivación. Adjetivos, adverbios de calificación (`claramente`, `evidentemente`, `naturalmente`) y comentarios meta siguen vetados por el resto del estándar. Fluidez aquí significa **continuidad sintáctica**, no embellecimiento.

**Antes (staccato defectuoso):**

> Un valor de 16 bits no cabe en un byte. Hace falta repartirlo en dos. Aparece un problema. Qué byte queda primero. La memoria avanza byte a byte. El orden importa.

**Después (fluido y sobrio):**

> Un valor de 16 bits no cabe en un byte y debe repartirse en dos posiciones consecutivas, lo que abre una pregunta inmediata: qué byte queda en la dirección menor. La memoria avanza byte a byte, pero el valor lógico depende del orden en que esos bytes se reconstruyan.

**Umbral de revisión:** si en un capítulo aparecen **tres o más párrafos** dominados por oraciones cortas de estructura SVO sin subordinación, el revisor lo marca como defecto de fluidez (suma a S8 en §6.2).

### R10. Entrada situada de capítulos, secciones y párrafos

Ni el capítulo, ni una sección dentro del capítulo, ni un párrafo nuevo, pueden empezar afirmando un hecho técnico aislado sin antes orientar al lector. Esa orientación no es relleno: es la diferencia entre un libro y una página de referencia.

**Entrada de capítulo.** El primer párrafo nombra el problema técnico real que el capítulo va a abordar y, cuando corresponda, lo conecta con lo que el lector ya viene cargando del capítulo o nivel anterior. La conexión es de **una a dos oraciones**, no un resumen. El problema se nombra antes de cualquier definición.

**Entrada de sección.** Una sección no abre afirmando una propiedad. Abre situando: por qué este recorte ahora, qué tensión del párrafo previo lo justifica, o qué pregunta queda en el aire que la sección viene a contestar. Una a tres oraciones bastan. Después aparece el contenido técnico.

**Entrada de párrafo.** Un párrafo nuevo no aterriza un hecho de golpe. La primera oración hace una de tres cosas: continúa lo que el párrafo anterior dejó pendiente, abre un aspecto distinto del mismo asunto declarándolo como tal, o introduce el ejemplo o materialidad que va a desarrollarse abajo. Solo después aparece el hecho central del párrafo.

**Lo que esta regla autoriza** (y que otras reglas podían leerse como prohibitivas):
- frases de situación tipo *"acá conviene detenerse en X"* (con `conviene` consumido bajo R1) o *"el detalle que cambia todo aparece cuando..."*;
- conexiones causales largas entre párrafos (`por eso`, `de ahí que`, `el motivo aparece más abajo`);
- preguntas retóricas **acotadas** que abren una sección, siempre que la sección las conteste de hecho y no se vuelvan tic estilístico;
- uso de pronombres y elipsis para no repetir el sustantivo técnico al inicio de cada párrafo.

**Lo que esta regla no autoriza:**
- pre-anuncios tipo `vamos a ver` (sigue vetado por A9);
- meta-discurso pedagógico tipo `lo importante es` (sigue vetado por A1);
- cierres ritualizados (siguen vetados por A4);
- títulos que nombran la intención del autor (siguen vetados por A5).

**Antes (defectuoso, abrupto):**

> ## La toolchain declarada
>
> Un Dockerfile declara paquetes. Esos paquetes pueden no estar instalados. La instalación es otra etapa.

**Después (correcto, situado):**

> ## La toolchain declarada
>
> El capítulo anterior dejó la idea de que el laboratorio se compone de piezas distintas. Una de esas piezas es la toolchain, y conviene mirarla con cuidado porque ahí aparece la primera grieta donde la intención del repo y la realidad del contenedor pueden separarse. Un `Dockerfile` declara paquetes. Eso significa que enumera lo que **pretende** instalar, no lo que finalmente está disponible cuando alguien abre una terminal dentro del contenedor.

**Umbral de revisión:** si una sección abre con una afirmación seca sin oración de situación, suma a S9 (ver §6.2). Si un capítulo entero arranca con un hecho aislado sin nombrar el problema y sin conectar con lo previo, es bloqueante (B9, ver §6.1).

### R11. Transiciones explícitas entre secciones

Dos secciones contiguas no son dos páginas de manual yuxtapuestas. La última oración de una sección, o la primera de la siguiente, hace visible la conexión: qué dejó cerrado la anterior, qué queda abierto, por qué la próxima se ocupa de eso.

La transición puede vivir en cualquiera de los dos lados (cierre de la anterior, apertura de la siguiente, no en ambos). Suele ser una sola oración. No es un resumen ni un anuncio. Es una articulación.

**Forma autorizada (cierre articulador):**

> Con el devcontainer separado en sus piezas, queda en pie una cuestión más concreta: cuáles de las herramientas que el repo declara instalar están realmente disponibles dentro del contenedor.

**Forma autorizada (apertura articuladora):**

> Las piezas del laboratorio quedaron separadas, pero esa separación todavía no dice nada sobre lo que ocurre dentro. La toolchain es el primer lugar donde esa pregunta tiene respuesta verificable.

Esta regla **no** autoriza secciones "El nivel siguiente" en cuerpo de capítulo (R7 sigue firme), ni cierres tipo `Con eso queda...` o `Ahora toca...` (siguen vetados en A4). La transición articula contenido técnico, no anuncia ritualmente el próximo movimiento.

**Umbral:** capítulo con tres o más fronteras entre secciones sin transición de ningún lado suma a S9.

---

## 3. Reglas específicas para placeholders

Un placeholder correcto:
- Declara su carácter de placeholder.
- No finge authoría real.
- Fija estado, prerrequisitos, artefactos esperables y próximo paso.
- Mantiene tono sobrio y estructura estable.

Un placeholder incorrecto:
- Intenta sonar como capítulo sin tener contenido.
- Usa entusiasmo, promesas o vaguedad para ocultar que todavía no existe authoría real.
- Reproduce la plantilla de un capítulo terminado (A6).

---

## 4. Anti-patrones (A1–A14)

Cada anti-patrón especifica: forma, umbral cuantitativo, ejemplo defectuoso, ejemplo aceptable.

### A1. Andamiaje declarado

**Forma:** marcar verbalmente la importancia o el modo de pensar antes de afirmar el hecho.

**Catálogo cerrado:**
- `Lo importante es...`
- `Lo importante no es X. Lo importante es Y.`
- `La intuición útil es...`
- `La tarea acá es...`
- `La pregunta útil es...`
- `La idea operativa es...`
- `La regla que conviene mantener es...`

**Umbral:** 0 ocurrencias por capítulo, salvo que destrabar el tramo dependa genuinamente de formular una pregunta explícita y la forma no se repita en cadena.

**Defectuoso:**

> Lo importante no es memorizar la cifra aislada. Lo importante es entender qué la produce: hay un ancho fijo, ese ancho fija cuántos patrones caben, la lectura unsigned los reparte sobre enteros no negativos.

**Aceptable:**

> Tres elementos producen el rango: el ancho fijo, la cantidad de patrones que ese ancho permite, y la convención unsigned que los reparte sobre enteros no negativos.

### A2. Verbo rector pedagógico

**Forma:** la voz administra al lector la conveniencia de adoptar el hecho, en lugar de afirmarlo.

**Catálogo cerrado:**
- `conviene`
- `sirve`
- `es útil pensar`
- `la regla práctica es`
- `vale la pena`
- `ayuda a entender que`

**Umbral:** 0 ocurrencias por capítulo. Sustituir por afirmación directa.

**Defectuoso:**

> Conviene pensar la memoria como direccionable por bytes.

**Aceptable:**

> La memoria es direccionable por bytes.

### A3. Negación correctiva serial

**Forma:** `No es X; es Y` o `No hace falta X; hace falta Y` como motor estructural de la sección.

**Umbral:** máximo **2** usos por capítulo, y nunca como apertura de párrafos consecutivos.

**Defectuoso (3 usos consecutivos):**

> No lo son. Son dos lecturas con roles distintos.
> El trabajo del nivel no es resumirlo como "incrementa un valor". El trabajo es poder mirar el estado.
> Eso no significa que todas avancen lineal. Significa que el avance secuencial es el caso base.

**Aceptable (uso puntual como corrección real):**

> Una palabra-byte no marca por sí sola si su contenido es código o dato; el rol surge de cómo la ejecución la usa.

### A4. Aperturas y cierres plantilla

**Forma:** primera o última oración cuya estructura puede mudarse a otro capítulo sin perder coherencia.

**Aclaración importante.** Esta regla no veta toda apertura que sitúe al lector. R10 exige situar. Lo que A4 veta es la **forma plantilla**: oraciones cuya estructura es intercambiable entre capítulos porque no nombra ningún problema técnico real. Una apertura situada que sí nombra el problema (ver R10) es correcta aunque mencione el capítulo anterior.

**Catálogo cerrado de aperturas vetadas:**
- `Una vez que X queda firme, aparece la pregunta...`
- `Una vez fijado que X, hace falta abrir...`
- `Decir que X todavía es una descripción demasiado comprimida...`
- `En uso cotidiano es fácil decir Y...`
- `LX dejó... LX+1 toma ese modelo y...`
- `El capítulo anterior dejó...` (vetado solo cuando es **la única** oración de situación; aceptable como parte de un párrafo que además nombra el problema técnico del capítulo nuevo)

**Catálogo cerrado de cierres vetados:**
- `Con eso ya queda...`
- `Ahora toca...`
- `El siguiente problema ya está planteado...`
- `Con esto ya se puede pasar al problema siguiente...`
- `Después de LX viene LX+1...` (en cuerpo de capítulo; permitido en README)
- `LX no necesita llevarlo más lejos. Necesita dejar algo firme:` + bullets.
- `X no es un ritual de tres palabras. Es la forma mínima de...` (cierre por reformulación).

**Umbral:** 0 en aperturas; 0 en cierres del cuerpo de capítulo.

### A5. Títulos metadidácticos

**Forma:** títulos que nombran la intención del autor o el meta-acto pedagógico, en lugar del concepto técnico.

**Catálogo cerrado vetado:**
- `Qué es este nivel`
- `Qué cubre`
- `Qué no cubre y por qué`
- `Qué toca superficialmente y por qué`
- `Cómo trabajarlo` / `Cómo trabajar el nivel`
- `El nivel siguiente`
- `Por qué [tema] aparece acá antes de LX`
- `Qué agrega LN sobre LM`
- `Qué deja afuera este modelo`
- `Resumen operativo`
- `Si este capítulo queda firme`

**Umbral:** 0 ocurrencias.

**Sustitución típica:** reemplazar por título-concepto o por una sola sección al inicio (sin título) que dé el contexto en 2–3 oraciones.

### A6. Plantilla de introducción de nivel

**Forma:** un `00-introduccion.md` cuya tabla de contenidos coincide con la de cualquier otro `00-introduccion.md` del repo.

**Umbral:** rechazo automático si tres o más títulos coinciden literal o estructuralmente con los de otra introducción del repo.

### A7. Bullets ceremoniales

**Forma:** lista de 2–3 ítems cortísimos que cabrían en una oración, o lista que repite contenido inmediato anterior.

**Umbral:** máximo **1** lista de cierre tipo "qué tiene que quedar" por capítulo, y solo si añade algo no dicho en prosa.

### A8. Cadena de "queda firme" / "deja firme"

**Forma:** uso ritual de la familia léxica "queda firme / deja firme / dejar algo firme / quedó firme / vuelve firme" como cierre de párrafos sucesivos o como motor argumental.

**Umbral:** ver R1 (1 por capítulo).

### A9. Pre-anuncio de estructura ("vamos a ver")

**Forma:** primera persona del plural didáctica anunciando lo que sigue.

**Catálogo:**
- `Vamos a ver`
- `Vamos a abrir`
- `Vamos a usar`
- `Nuestro programa`
- `Veremos`

**Umbral:** 0 ocurrencias.

**Aclaración.** Esta regla veta la primera persona plural didáctica, no la situación del lector. Frases impersonales que sitúan ("el capítulo abre con", "la sección parte de", "a continuación aparece") son legítimas bajo R10 y no caen en A9.

### A10. Repetición de la frase-tesis

**Forma:** la oración-tesis del capítulo se repite en distintos puntos en lugar de ser desarrollada.

**Umbral:** la misma idea formulada con palabras casi idénticas más de 2 veces en el capítulo.

### A11. Falsa dicotomía instalada

**Forma:** presentar como contraste central una oposición que no es estructural del dominio.

**Ejemplo defectuoso:** *"Materialidad antes que abstracción flotante"* usado dentro del cuerpo de un capítulo como si fuera una distinción del tema, cuando es una regla editorial. Las reglas editoriales no se exponen al lector.

**Umbral:** 0 ocurrencias en `chapters/`.

### A12. Auto-referencia editorial

**Forma:** el capítulo menciona el estándar, las decisiones del autor o la pedagogía Forja explícitamente.

**Catálogo:**
- `Forja escribe...`
- `el track quiere...`
- `parte del trabajo del nivel es...`
- `la disciplina del capítulo es...`

**Umbral:** 0 ocurrencias en `chapters/` y en `00-introduccion.md`. Permitido en `outline.md` y en documentos de diseño.

### A13. Encuadre deshonesto en listas de errores típicos

**Forma:** dentro de una lista presentada como *"errores recurrentes"*, *"malentendidos típicos"* o *"confusiones típicas"*, aparece un ítem que no es un malentendido sino un fenómeno técnico real. La lista pierde su contrato implícito y el lector queda sin saber si lo que está leyendo es algo que tiene que descartar o algo que tiene que internalizar.

**Ejemplo defectuoso (L1, primera pasada):** una lista titulada *"errores que este modelo explica"* incluye los tres primeros como malentendidos del programador novato (*"cambié el código y el programa sigue haciendo lo mismo"*) y luego, en cuarto lugar, *"mi programa modificó su propio código"*. Lo cuarto no es un malentendido: es un fenómeno real (JIT, self-modifying code, exploits) que el propio texto admite con "conceptualmente posible…".

**Forma correcta:** o se reformula la lista para que el ítem encaje ("fenómenos que este modelo deja explicables"), o se saca el ítem de la lista y se trata como observación aparte en su propio párrafo, declarando explícitamente que es de naturaleza distinta.

**Umbral:** 0 ítems mal-encuadrados por lista. El revisor relee el título de la lista contra cada ítem y pregunta: *¿este ítem cumple el contrato del título?*. Si la respuesta es "no, pero es interesante", el ítem no pertenece a esa lista.

### A14. Pregunta retórica torpe

**Forma:** una pregunta retórica encadena tres o más sustantivos abstractos en una sintaxis que el lector tiene que releer dos veces para parsear. La pregunta deja de funcionar como gancho y pasa a ser obstáculo.

**Ejemplo defectuoso:** *"¿qué es una transición recursiva sobre un estado observable sino algún algoritmo ejecutándose?"*. Tres abstractos encadenados (`transición`, `recursiva`, `estado observable`) más `sino + algún + gerundio`: el lector pierde el hilo de qué se está preguntando.

**Forma correcta:** misma idea con verbos más concretos y sintaxis directa. *"¿un estado observable que va cambiando paso a paso, bajo una regla fija, no es ya un algoritmo en ejecución?"*. La pregunta sigue siendo gancho conceptual, pero el lector la puede parsear de una sola lectura.

**Test operativo:** leer la pregunta en voz alta. Si el lector necesita volver al inicio antes de llegar al signo de cierre, la pregunta está mal formulada.

**Umbral:** preguntas retóricas en `chapters/` permitidas en cantidad acotada (R10 ya las autoriza), pero ninguna que falle el test operativo.

---

## 5. Reglas por dominio (B1–B5)

Las reglas generales aplican a todo contenido. Cada dominio agrega énfasis específicos que el revisor también verifica.

### B.1 Bajo nivel y representación de datos

- Razonar desde el hardware hacia arriba. Si el texto habla de un `struct`, mencionar su layout en memoria. Si habla de un cast, mencionar qué garantiza el estándar y qué no.
- Partir de bytes, layout, direcciones, ancho, secciones, dumps. No tratar tipos o strings como abstracciones flotantes.
- El modelo de memoria de C no es "variables en la stack": es segmentos, lifetime, linkage. Usar la terminología correcta desde el inicio.
- Términos de dominio que se usan con precisión, nunca casualmente: `alignment`, `padding`, `undefined behavior`, `strict aliasing`, `linkage`, `lifetime`, `calling convention`, `ABI`, `stack frame`, `prologue/epilogue`, `register spilling`, `inline`, `volatile`, `memory barrier`, `cache line`, `word size`.
- Materialidad típica: hexdump, comparación de byte bajo dos lecturas, tabla `dirección / byte` para endianness, traza de estado.

### B.2 Sistemas operativos

- Anclar en mecanismos concretos: cambio de contexto, page fault, syscall, VMA, PCB, descriptor de archivo.
- Evitar explicar el kernel como "la parte que gestiona recursos" sin más. Priorizar qué entra, qué cambia y qué costo concreto tiene.
- Materialidad típica: `strace`, `/proc`, salidas de `ps`, errores de `mmap`, traza de syscalls.

### B.3 Compiladores y toolchains

- Tratar cada fase como transformación de artefactos: `.c` → `.i` → `.s` → `.o` → ejecutable.
- Distinguir representación de entrada, salida e invariantes mínimos de cada fase.
- No usar "el compilador hace X" cuando la etapa relevante es preprocesador, assembler, linker o loader.
- Materialidad típica: `gcc -E`, `gcc -S`, `nm`, `objdump`, `readelf`, errores reales como `undefined reference`.

### B.4 Concurrencia y sincronización

- Razonar siempre desde el modelo de memoria: el compilador puede reordenar accesos a menos que exista una barrera (`memory_order_seq_cst`, `mfence`, un mutex). Sin barrera, el código es correcto en un modelo secuencial y roto en cualquier implementación real con múltiples cores.
- No usar "los threads comparten memoria" cuando lo relevante es espacio de direcciones virtual + sincronización.

### B.5 Formatos binarios y herramientas

- Anclar en hexdump, `readelf`, `objdump`, `file`. Si el texto introduce una sección o un header, el dump de esa sección o header aparece al menos una vez.
- Errores reales como anclaje: corrupción detectada, magic number incorrecto, offset fuera de rango.

---

## 6. Protocolo de revisión con veredicto

La revisión produce un **veredicto binario**: APROBADO / RECHAZADO. No hay zonas grises.

### 6.1 Checks bloqueantes (rechazo automático)

Cualquiera de estos rechaza el documento:

| ID | Check | Criterio de rechazo |
|---|---|---|
| B1 | Anti-patrones A1, A2, A9, A11, A12 | ≥1 ocurrencia |
| B2 | Anti-patrón A5 (títulos metadidácticos) | ≥1 título del catálogo |
| B3 | Anti-patrón A6 (plantilla de intro) | ≥3 títulos coincidentes con otra intro del repo |
| B4 | R7 (transición curricular en capítulo) | sección "El nivel siguiente" en `chapters/` |
| B5 | R3 (materialidad) | capítulo de >500 palabras en dominio material sin ningún anclaje |
| B6 | A4 (aperturas plantilla) | apertura del catálogo vetado |
| B7 | A4 (cierres plantilla) | cierre del catálogo vetado |
| B8 | Persona y modo (§3.1 estándar) | primera persona plural didáctica o segunda persona explícita en `chapters/` teóricos |
| B9 | R10 (entrada situada) | capítulo que arranca con un hecho técnico aislado sin nombrar el problema y sin conexión con lo previo |

### 6.2 Checks con presupuesto (suma de defectos)

Cada uno suma puntos. **Total ≥ 4 → rechazo. Total 2–3 → revisión obligatoria. Total 0–1 → aprobado.**

| ID | Check | Puntos por ocurrencia | Tope |
|---|---|---|---|
| S1 | A3 (negación correctiva serial) más allá del umbral | 1 por exceso | 3 |
| S2 | R1 muletillas excedidas (suma de presupuesto) | 1 por unidad excedida | 4 |
| S3 | A7 (bullets ceremoniales) | 1 por lista | 3 |
| S4 | R4 (repetición léxica) excedida | 1 por término | 2 |
| S5 | A10 (repetición de tesis) | 1 por reformulación | 2 |
| S6 | A8 (cadena de "queda firme") | 1 por uso más allá del 1 permitido | 3 |
| S7 | R2 (bullets ilegítimos según criterio) | 1 por lista | 3 |
| S8 | R8 (párrafos sin hecho técnico) | 1 por párrafo de transición vacía | 2 |
| S9 | R10/R11 (entradas o transiciones ausentes) | 1 por sección que abre seca o frontera sin transición | 4 |

### 6.3 Checks de continuidad (advertencia, no bloqueo)

| ID | Check | Severidad |
|---|---|---|
| C1 | El cierre del capítulo deja una consecuencia técnica específica | Advertencia si no |
| C2 | El primer párrafo nombra un problema técnico real | Advertencia si abre por intención didáctica |
| C3 | El capítulo se sostiene sin la transición a LX+1 | Advertencia si depende de ella |

### 6.4 Hoja de revisión

Para revisar un capítulo, completar:

```
Archivo: <ruta>
Tipo: <chapter | intro | readme | outline | exercise | design>
Palabras (cuerpo): N

Bloqueantes:
  B1 [ ]  B2 [ ]  B3 [ ]  B4 [ ]  B5 [ ]
  B6 [ ]  B7 [ ]  B8 [ ]  B9 [ ]

Presupuesto:
  S1: __  S2: __  S3: __  S4: __  S5: __
  S6: __  S7: __  S8: __  S9: __
  Total: __

Continuidad:
  C1 [ok|adv]  C2 [ok|adv]  C3 [ok|adv]

Veredicto: APROBADO | REVISION | RECHAZADO
Notas:
```

---

## 7. Aplicación sobre `content/`

Al re-redactar `content/`:

- **Textos de entrada al workspace:** orientan sin tutorializar. Aplican R7 (transiciones en README, no en cuerpo).
- **Niveles con authoría real:** se ajustan por voz (§3 estándar), prosa (§2 acá), contrato por archivo (§5 estándar) y anti-patrones (§4 acá), con veredicto producido por §6.
- **Proyectos o niveles placeholder:** normalizan tono y honestidad estructural (§3 acá). No inventan contenido ausente.

### 7.1 Pase de poda recomendado

Cuando se aplique este refinamiento a contenido preexistente, el orden de pase es:

1. Eliminar bloqueantes (B1–B9). Esto suele recortar el archivo.
2. Reescribir aperturas y cierres para sacarlos del catálogo vetado (A4).
3. Ajustar R1 (muletillas) y R4 (repetición léxica) por sustitución directa.
4. Convertir bullets ceremoniales en prosa (R2, A7).
5. Verificar veredicto de §6.

---

## 8. Verificación automática (`forja editorial-stats`)

> **El script es termómetro, no juez.** Detecta señales mecánicas que *suelen* coincidir con prosa floja —muletillas, intensificadores vacíos, em-dashes encadenados, oraciones desbordadas—. Una celda roja invita a mirar el párrafo, no obliga a reescribirlo. Si la oración larga tiene ritmo y se entiende, queda. Si la enumeración con dos puntos es la forma natural, queda. El refinamiento quiere quitar lo ornamental para que lo material respire, no producir prosa picada que cumple umbrales. La revisión humana de §6 es la única que decide.

El subcomando `python scripts/forja.py editorial-stats` mide la adherencia mecánica a las reglas R1, R1.bis, R1.ter, R3 (oración larga / párrafo muralla), A1–A5 sobre todo el contenido editorial real (intros + niveles con authoría real). Los documentos de diseño (`outline.md`, `laboratorio*.md`, `simulador*.md`) quedan exentos por §5.6 del estándar a menos que se pase `--include-design`.

### Uso

```bash
python scripts/forja.py editorial-stats                          # tabla de texto a stdout
python scripts/forja.py editorial-stats --format json --output metadata/editorial-stats-baseline.json
python scripts/forja.py editorial-stats --target content/theory/L5-...   # alcance restringido
python scripts/forja.py editorial-stats --strict                  # exit code 1 si hay celdas rojas
```

### Métricas y umbrales

| Métrica | Umbral por archivo | Regla origen |
|---|---|---|
| `muletillas_criticas_total` | ≤ 2 | R1 (catálogo hedge) |
| `intensificadores_total` (sin `exactamente`) | ≤ 3 | R1.bis |
| `exactamente_ornamental` | ≤ 2 | R1.bis (filtro contextual aplicado) |
| `parrafos_muralla` (>10 oraciones de prosa) | 0 | R8 / R9 |
| `oraciones_largas` (>60 palabras) | 0 | R9 |
| `em_dash_pares_excesivos` (>2 pares en un párrafo) | 0 | R1.ter |
| `em_dash_runs_largos` (>3 párrafos consecutivos con em-dash) | 0 | R1.ter |
| `frases_repetidas` (riesgo de muletilla) | ≤ 1 ocurrencia por archivo | A1, A2 |
| `apertura_formulaica` | 0 | A2, R10 |
| `preguntas_retoricas_seguidas` (≥3 párrafos seguidos terminando en `?`) | 0 | R9 |

### Cómo se distingue `exactamente` técnico de ornamental

`exactamente` cumple uso técnico legítimo en buena parte de los casos. El filtro contextual marca como **técnico** (no cuenta) si en su entorno inmediato aparece alguna señal:
- número, símbolo `$`, palabra de cantidad (`uno`, `dos`, `tres`, `N bytes`, `N líneas`),
- identidad referencial (`igual`, `lo mismo`, `lo que`, `este/esa/eso/aquel/...`),
- pregunta de precisión (`qué hace exactamente`, `cómo`, `dónde`, `cuál`),
- equivalencia (`equivale, exactamente, a "…"`, `exactamente como en L3`),
- verbo de precisión (`coincidir`, `representar`, `predecir`, `comportarse`, `consistir`, `ubicar`, `reproducir`, `vale`, `dar`).

Si ninguna señal está presente, cuenta como **ornamental** (refuerzo retórico vacío). El reporte JSON lista ejemplos con contexto (`exactamente_ejemplos`) para revisión manual.

### Frases con riesgo de muletilla (no son prohibiciones)

Algunas frases —`"es importante notar"`, `"vale la pena destacar"`, `"cabe destacar"`, `"como mencionamos"`, `"como ya vimos"`, `"el lector va a aprender / aprenderá"`— se monitorean con criterio de **repetición**, no de prohibición. Una sola aparición bien usada en un capítulo de 3000 palabras no enciende rojo. La métrica `frases_repetidas` cuenta la repetición máxima de cualquiera de esas frases en el archivo: si la misma frase aparece 2 o más veces, ya se volvió tic y la celda se marca.

El espíritu: el problema no es la frase en sí, es el reflejo de usarla cada vez que el texto necesita énfasis. Lo mismo aplica a las muletillas hedge (R1) y los intensificadores (R1.bis): el umbral está sobre el patrón, no sobre el caso aislado.

Las aperturas formulaicas (A2: `"en este capítulo veremos"`, `"vamos a ver"`, `"a lo largo de este…"`) sí tienen umbral 0, pero **sólo si aparecen como apertura del primer párrafo del archivo**. En medio del texto las mismas construcciones pueden ser legítimas.

### Falsos positivos conocidos

- **Listas numeradas o con bullets**: el splitter de párrafos descarta bloques que empiezan con `-`, `*`, `+`, `>`, `1.`, `2.`, etc. Una lista de 12 items no cuenta como párrafo muralla. Un item con sub-bullets sangrados puede unir varios items en un solo "párrafo" detectado: si la métrica marca rojo, inspeccionar antes de reescribir.
- **Em-dash en oraciones distintas del mismo párrafo**: 2 pares en oraciones separadas se toleran (ver R1.ter). El umbral marca rojo a partir de 3 pares.
- **`exactamente` con verbo no listado**: si una construcción técnica genuina queda marcada como ornamental, refinar el regex en `EXACTAMENTE_TECNICO_IZQUIERDA` o `EXACTAMENTE_TECNICO_DERECHA` (ver `scripts/forja.py`).

### Cuándo dejar una celda en rojo

No todas las celdas rojas tienen que volverse verdes. Si después de aplicar el test del borrado el texto está mejor con la palabra/frase, queda. Si la oración larga tiene subordinación legítima y se lee de corrido, queda. Lo que no debería pasar es ignorar el rojo sin haberlo mirado.

---

## 9. Referencia interna de buena materialidad

Cuando un revisor o autor necesite ver "qué cuenta como materialidad correcta", la pieza de referencia interna es:

- **Traza tabular de estado** en [content/theory/L1-modelo-mental-computadora/chapters/01-maquina-de-estado.md](content/theory/L1-modelo-mental-computadora/chapters/01-maquina-de-estado.md), donde una tabla `momento / pc / r0 / mem[40]` muestra el cambio de estado paso a paso.

Otras formas de materialidad aceptable, con ejemplo en repo:
- Cadena de artefactos del pipeline (`hello.c -> hello.i -> hello.s -> hello.o -> hello`) en L3/01.
- Comparación de byte bajo dos lecturas (`11111111` como `255` o `-1`) en L2/02.
- Tabla `dirección / byte` para endianness en L2/06.
