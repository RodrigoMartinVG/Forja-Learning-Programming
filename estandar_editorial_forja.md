# Estándar Editorial de Forja
## Documento canónico de voz, criterio, forma, anti-patrones y protocolo de revisión

> **Estado:** estándar editorial canónico y único del repo. Las versiones previas (`estandar_editorial_forja_v2.md`, `guia_tono_contenido_tecnico_v3/v4.md`, `defectos_voz_prosa_tecnica.md`, `defectos_voz_prosa_tecnica_v2.md`, `defectos_voz_segunda_generacion.md`) fueron consolidadas en este archivo.
>
> **Estructura del repo (slugs, layout, ejercicios, outlines):** [CONVENTIONS.md](CONVENTIONS.md). Este documento no duplica esas reglas.

---

## Índice

1. Propósito y alcance
2. Relación con `CONVENTIONS.md`
3. La voz correcta
4. Principios positivos (P1–P6)
5. Reglas de prosa de bajo nivel (R1–R11)
6. Contrato por tipo de archivo
7. Anti-patrones (A1–A12) con catálogos cerrados, umbrales y ejemplos
8. Reglas específicas para placeholders
9. Protocolo de revisión con veredicto
10. Referencia interna de buena materialidad
11. Aplicación sobre `content/`

Apéndices:

- A. Pedagogía Forja (cómo se enseña)
- B. Reglas por dominio

---

## 1. Propósito y alcance

Este estándar existe para que el contenido de Forja suene, piense y se organice de forma consistente con el tipo de formación que el repo quiere producir, y para que cualquier revisor pueda verificarlo con criterios cerrados.

**Alcance:** todo contenido técnico y editorial del repo, con foco en `content/`, `docs/` y guías editoriales.

Dentro de `content/` aplica tanto a authoría real como a placeholders. La diferencia no es si el estándar aplica, sino el tipo de texto que corresponde producir:

- En authoría real, el estándar exige modelo mental, causalidad y evidencia material.
- En placeholders, exige sobriedad, honestidad estructural y no simular contenido terminado.

---

## 2. Relación con `CONVENTIONS.md`

Este archivo regula **cómo se escribe**: voz, prosa, anti-patrones, protocolo de revisión. [CONVENTIONS.md](CONVENTIONS.md) regula **cómo se organiza el repo**: slugs, layout de niveles y proyectos, estados (placeholder vs authoría real), contrato del `outline.md` como artefacto, proceso de diseño de dos pasadas, forma de los ejercicios. Cuando un tema cae en una zona gris, la regla es:

- si define **dónde vive un archivo o cómo se nombra**, vive en CONVENTIONS;
- si define **cómo suena el texto, qué palabras evitar, cómo revisar prosa**, vive acá.

La sección §10 de CONVENTIONS contiene la tabla de división de competencia.

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

- Permitido: presente impersonal (`la máquina ejecuta`, `hace falta distinguir` — pero ver R1), pasiva refleja (`se observa`, `se reconstruye`), nominalización cuando aclara (`la lectura unsigned reparte...`).
- Permitido en doses muy chicas, solo en ejercicios o instrucciones operativas: imperativo en vos rioplatense (`tomá`, `mirá`, `corré`). No en capítulos teóricos.
- Prohibido: primera persona del plural didáctica (`vamos a ver`, `nuestro programa`), segunda persona explícita en capítulos teóricos (`vos podés`, `tu programa`).

Excepción: el README de un nivel puede usar imperativo en su sección de "cómo recorrerlo" si la pieza es genuinamente operativa.

---

## 4. Principios positivos (P1–P5)

### P1. Modelo mental antes que taxonomía
Cada sección deja una distinción operativa, no una lista de términos.

### P2. Mecanismo antes que consigna
Cuando el tema lo permite, explicar qué produce el comportamiento y bajo qué condiciones se observa.

### P3. Materialidad antes que abstracción flotante
Anclar en archivos, comandos, artefactos, output, memoria, dumps, símbolos, objetos, ejecutables. Si un capítulo de 600+ palabras no tiene **ningún** anclaje material y el dominio lo permite, el capítulo no cumple P3 (ver §9).

### P4. Continuidad curricular explícita pero no invasiva
La relación con niveles vecinos existe, **una vez**, en el lugar correcto. No invade cada párrafo con recordatorios de alcance.

### P5. Densidad útil, no compresión defensiva
Se puede escribir corto. No se debe escribir críptico para parecer riguroso. No se debe inflar con bullets ceremoniales para parecer estructurado.

### P6. Empatía con la dificultad
Los temas del track son difíciles. La voz lo reconoce sin dramatizar y sin disculparse. Reconocer la dificultad significa, en concreto: situar al lector antes de pedirle el salto, nombrar dónde suele perderse la intuición, conectar el concepto nuevo con uno previo que ya quedó establecido, y dejar pistas explícitas cuando una distinción es contraintuitiva. Reconocer la dificultad **no** significa: pedir disculpas por la complejidad, anunciar que algo es difícil sin razonarlo, ni recurrir a metáforas reblandecidas. La empatía aquí es estructural —cómo se ordena el texto— no decorativa.

---

## 5. Reglas de prosa de bajo nivel (R1–R9)

Esta sección es nueva en v2 y gobierna las dimensiones donde el contenido se desvía de hecho aunque la voz general sea correcta.

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

Pasarse del presupuesto agregado (suma sobre la fila) en un mismo capítulo cuenta como defecto en revisión.

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

La transición curricular vive en el `README.md` del nivel (contrato §6.2), no como sección de cierre del `00-introduccion.md` ni de los capítulos. Si el nivel siguiente importa para el cierre conceptual de un capítulo, su mención es una sola oración en prosa, sin título propio.

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

**Umbral de revisión:** si en un capítulo aparecen **tres o más párrafos** dominados por oraciones cortas de estructura SVO sin subordinación, el revisor lo marca como defecto de fluidez (suma a S8 en §9.2).

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

**Umbral de revisión:** si una sección abre con una afirmación seca sin oración de situación, suma a S9 (nuevo, ver §9.2). Si un capítulo entero arranca con un hecho aislado sin nombrar el problema y sin conectar con lo previo, es bloqueante (B9, ver §9.1).

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

## 6. Contrato por tipo de archivo

### 6.1 `outline.md`
- Fija estructura, objetivo, preguntas guía y decisiones de diseño.
- No suena como capítulo terminado.
- Puede usar bullets densamente; ese es su modo natural.

### 6.2 `README.md` de nivel o proyecto
- Fija estado editorial, alcance, artefactos visibles, prerrequisitos y próximo paso.
- **Aloja la transición curricular hacia el nivel siguiente** (R7).
- En placeholders, declara honestamente que todavía no hay authoría real.

### 6.3 Capítulos (`chapters/NN-*.md`)
- Abren con un problema técnico o conceptual real (no con anuncio de intención).
- Desarrollan mecanismo, ejemplo material y consecuencia.
- Cierran con una idea retenible específica de ese capítulo. **No** con "consecuencia genérica" ni con pasarela hacia el siguiente.
- Contienen al menos un anclaje material si el dominio lo permite (R3).

### 6.4 `00-introduccion.md` de un nivel
Sub-contrato del 6.3 con regla extra:

- Nombra qué problema abre el nivel.
- Puede incluir, **una sola vez y en prosa breve**, qué deja afuera.
- **No** usa la plantilla `Qué es / Qué cubre / Qué no cubre / Cómo trabajarlo / El nivel siguiente`. Si el revisor encuentra esa estructura, el archivo se rechaza (A8).
- La transición a `LX+1` no aparece en el cuerpo. Vive en el `README.md` (R7, 6.2).

### 6.5 Ejercicios (`exercises.md` o `exercises/`)
- Ponen al lector a observar, distinguir, registrar o explicar.
- Permiten imperativo en segunda persona (3.1).
- No funcionan como mini ensayos pedagógicos previos al trabajo. La consigna llega rápido.

### 6.6 Documentos de diseño (`outline.md`, `simulador*.md`, `laboratorio*.md`, `*-arquitectura.md`)
Contienen explícitamente, en este orden:

1. Objetivo del documento (no del nivel).
2. Contrato conceptual (qué fija y qué no fija).
3. Decisiones tomadas, con su razón.
4. Decisiones pendientes o exclusiones declaradas.
5. Relación con el nivel y con artefactos hermanos.

No se disfrazan de capítulo. No se renderizan como teoría en `web/`.

### 6.7 `meta.yaml` y otros metadatos
Datos estructurales puros. No prosa. Si requieren explicación, va en el `README.md`.

### 6.8 `src/` y artefactos mínimos
- Sirven al nivel.
- No se expanden hasta tapar el modelo.
- No acumulan artefactos generados que no formen parte del contenido fuente.

### 6.9 Simetría artificial entre archivos distintos
Aunque dos archivos compartan nivel, **no deben sonar como la misma pieza con rótulo distinto**. README, capítulo, ejercicio y documento de diseño tienen contratos diferentes y deben mostrarlo.

---

## 7. Anti-patrones (A1–A12)

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
- `Después de LX viene LX+1...` (en cuerpo de capítulo; permitido en README, 6.2)
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

**Umbral:** 0 ocurrencias en `chapters/` y en `00-introduccion.md`. Permitido en `outline.md` y en documentos de diseño (6.6).

---

## 8. Reglas específicas para placeholders

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

## 9. Protocolo de revisión con veredicto

Esta sección reemplaza al protocolo abierto de v1. La revisión produce un **veredicto binario**: APROBADO / RECHAZADO. No hay zonas grises.

### 9.1 Checks bloqueantes (rechazo automático)

Cualquiera de estos rechaza el documento:

| ID | Check | Criterio de rechazo |
|---|---|---|
| B1 | Anti-patrones A1, A2, A9, A11, A12 | ≥1 ocurrencia |
| B2 | Anti-patrón A5 (títulos metadidácticos) | ≥1 título del catálogo |
| B3 | Anti-patrón A6 (plantilla de intro) | ≥3 títulos coincidentes con otra intro del repo |
| B4 | R7 (transición curricular en capítulo) | sección "El nivel siguiente" en `chapters/` |
| B5 | P3 + R3 (materialidad) | capítulo de >500 palabras en dominio material sin ningún anclaje |
| B6 | A4 (aperturas plantilla) | apertura del catálogo vetado |
| B7 | A4 (cierres plantilla) | cierre del catálogo vetado |
| B8 | Persona y modo (3.1) | primera persona plural didáctica o segunda persona explícita en `chapters/` teóricos |
| B9 | R10 (entrada situada) | capítulo que arranca con un hecho técnico aislado sin nombrar el problema y sin conexión con lo previo |

### 9.2 Checks con presupuesto (suma de defectos)

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

### 9.3 Checks de continuidad (advertencia, no bloqueo)

| ID | Check | Severidad |
|---|---|---|
| C1 | El cierre del capítulo deja una consecuencia técnica específica | Advertencia si no |
| C2 | El primer párrafo nombra un problema técnico real | Advertencia si abre por intención didáctica |
| C3 | El capítulo se sostiene sin la transición a LX+1 | Advertencia si depende de ella |

### 9.4 Hoja de revisión

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

## 10. Referencia interna de buena materialidad

Cuando un revisor o autor necesite ver "qué cuenta como materialidad correcta", la pieza de referencia interna es:

- **Traza tabular de estado** en [content/theory/L1-modelo-mental-computadora/chapters/01-maquina-de-estado.md](content/theory/L1-modelo-mental-computadora/chapters/01-maquina-de-estado.md), donde una tabla `momento / pc / r0 / mem[40]` muestra el cambio de estado paso a paso.

Otras formas de materialidad aceptable, con ejemplo en repo:
- Cadena de artefactos del pipeline (`hello.c -> hello.i -> hello.s -> hello.o -> hello`) en L3/01.
- Comparación de byte bajo dos lecturas (`11111111` como `255` o `-1`) en L2/02.
- Tabla `dirección / byte` para endianness en L2/06.

---

## 11. Aplicación sobre `content/`

Al re-redactar `content/`:

- **Textos de entrada al workspace:** orientan sin tutorializar. Aplican R7 (transiciones en README, no en cuerpo).
- **Niveles con authoría real:** se ajustan por voz (§3), prosa (§5), contrato por archivo (§6) y anti-patrones (§7), con veredicto producido por §9.
- **Proyectos o niveles placeholder:** normalizan tono y honestidad estructural (§8). No inventan contenido ausente.

### 11.1 Pase de poda recomendado

Cuando se aplique este estándar a contenido preexistente, el orden de pase es:

1. Eliminar bloqueantes (B1–B8). Esto suele recortar el archivo.
2. Reescribir aperturas y cierres para sacarlos del catálogo vetado (A4).
3. Ajustar R1 (muletillas) y R4 (repetición léxica) por sustitución directa.
4. Convertir bullets ceremoniales en prosa (R2, A7).
5. Verificar veredicto de §9.

---

## Apéndice A — Pedagogía Forja (cómo se enseña)

Este apéndice consolida los criterios pedagógicos sobre los que opera la voz definida en §3. Las reglas R1–R11 dicen cómo no debe sonar el texto; este apéndice dice qué tiene que estar haciendo el texto cuando suena bien.

### A.1 Nombrar el modelo incorrecto probable

Cuando el lector trae una intuición errada pero razonable, el texto la nombra y la reemplaza, en vez de actuar como si esa intuición no existiera.

Ejemplos típicos en el dominio Forja:

- "la memoria guarda texto o números por naturaleza"
- "compilar es una sola operación"
- "un objeto `.o` ya es casi un ejecutable"
- "`make` reemplaza el pipeline"
- "los threads comparten memoria" (cuando lo relevante es espacio de direcciones virtual y sincronización)

Nombrar el modelo incorrecto no es lo mismo que la negación correctiva serial (A3): la negación se cuida cuando es **el motor estructural** del capítulo. Una corrección puntual de un modelo previo está bien y suele ser indispensable.

### A.2 Patrón canónico: pregunta → mecanismo → artefacto → reaparición

El recorrido preferido de un capítulo o sección de Forja es:

1. **Pregunta o confusión real** que el tramo abre.
2. **Distinción o mecanismo** que la resuelve.
3. **Evidencia material** que la deja anclada (R3, §10).
4. **Dónde reaparece** más adelante en el track, si corresponde —en una sola frase, no como sección.

Ese orden no es decorativo: ordena la atención del lector y vuelve la prosa demostrable. Saltar del paso 1 al 3 sin pasar por el 2 produce manuales. Saltar del 2 al 4 sin pasar por el 3 produce abstracción flotante.

### A.3 El error enseña mejor que la receta

Siempre que el dominio lo permita, el texto muestra:

- la configuración correcta;
- la configuración incorrecta o incompleta;
- el síntoma observable;
- el mecanismo que conecta causa y síntoma.

Un error reproducible (`undefined reference`, segfault con dirección concreta, salida divergente entre dos lecturas del mismo byte) instala el modelo más rápido que tres definiciones bien formuladas. El error es materialidad pedagógica.

### A.4 Transferencia: del ejemplo al principio

Después del ejemplo, el texto formula —cuando corresponde— el principio general que el ejemplo deja instalado. Si no, el lector aprende el caso y pierde el criterio.

Esto **no** autoriza moralejas ni "lo importante es" (A1). Autoriza una oración técnica que nombre la propiedad general que el ejemplo concretó.

### A.5 Progresión antes que maximalismo

No todo lo verdadero debe decirse en el primer texto donde el tema aparece. Una explicación correcta puede decir explícitamente: esto entra ahora; esto se posterga; esto reaparece en `LX`; esto se retoma con precisión en `LY`. Eso no es debilidad, es diseño curricular.

La gestión de fronteras curriculares vive en aperturas, cierres o secciones específicas de frontera —no frase a frase dentro del desarrollo (A8 anti-patrón).

### A.6 Coherencia de nivel sobre brillo local

Un capítulo no "mejora" por volverse brillante si rompe el arco del nivel o contradice la progresión del track. La pregunta correcta no es *¿esto quedó interesante por sí solo?* sino *¿esto fortalece el modelo del nivel sin comerse niveles posteriores ni introducir incoherencias con los anteriores?*

### A.7 Empatía estructural, no decorativa

Reconocer la dificultad de un tema no es disculparse por ella ni anunciarla. Es ordenar el texto de modo que: el lector quede situado antes de pedirle un salto; las distinciones contraintuitivas queden marcadas como tales con una pista breve; la conexión con un concepto ya establecido sea visible. La empatía es estructura del texto (R10, R11), no adjetivación.

---

## Apéndice B — Reglas por dominio

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
