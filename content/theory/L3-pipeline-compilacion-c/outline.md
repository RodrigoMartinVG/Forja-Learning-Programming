# Outline: L3 — Pipeline de compilación de C

> Documento de diseño interno. No se sirve en la web. Guía para escribir capítulos y ejercicios de `L3`. Voz y prosa: [estandar_editorial_forja.md](../../../estandar_editorial_forja.md). Estructura: [CONVENTIONS.md](../../../CONVENTIONS.md).

---

## Metadatos

- **Prerrequisitos:** `L0`, `L1`, `L2`.
- **Bloque editorial de entrada recomendado:** `content/intro/forja/forja.md`, `content/intro/workspace/workspace.md`.
- **Proyectos asociados:** preparación directa para proyectos `mini-make` y similares en `L7+`.
- **Desbloquea:** `L4`.
- **Fuente curricular:** [docs/forja-contenido.md §6 L3](../../../docs/forja-contenido.md).

---

## Objetivo del nivel

Que la persona pueda tomar un `.c` simple, ejecutar el pipeline paso a paso (preprocesado, compilación a assembly, ensamblado, linking), inspeccionar cada artefacto intermedio (`.i`, `.s`, `.o`, ejecutable), reconocer en cada uno qué información apareció y qué quedó sin resolver, y diagnosticar errores de pipeline ubicándolos en la etapa correcta.

---

## Contrato conceptual

Lo que `L3` debe dejar instalado:

- el pipeline de C como cadena de etapas con artefactos materiales entre ellas: `.c → .i → .s → .o → ejecutable`;
- el preprocesador como manipulación textual sin conocimiento del lenguaje;
- el compilador como traductor de C a assembly específico de la arquitectura;
- el ensamblador como traductor de assembly a código objeto con secciones y símbolos;
- el linker como integrador que resuelve referencias entre objetos y bibliotecas y produce un ejecutable o una biblioteca;
- la diferencia entre **biblioteca estática** (incorporada al ejecutable en tiempo de link) y **biblioteca dinámica** (resuelta en tiempo de carga);
- las flags principales del compilador como modificadores observables del artefacto (no como conjuro);
- `make` como herramienta para automatizar el pipeline en función de dependencias entre archivos.

Lo que `L3` **no** instala (se posterga con cita):

- contenido del assembly generado más allá del reconocimiento estructural: `L7`;
- formato detallado de ELF y secciones internas: `L4`;
- carga del ejecutable, layout de proceso, stack, heap: `L4`/`L9`;
- relocations precisas y dynamic linker en detalle: `L4` y siguientes;
- alternativas de compiladores (`clang` vs `gcc`) más allá de mención breve: queda fuera.

---

## Decisiones de diseño curricular

- **Cinco artefactos materiales** (`.c`, `.i`, `.s`, `.o`, ejecutable) son el eje. Cada uno tiene capítulo o sección dedicada.
- **Símbolos y referencias no resueltas** se separan del capítulo de linking en un capítulo propio. Son la confusión número uno del nivel.
- **Estático vs dinámico** se trata como capítulo independiente, no como apéndice del linker.
- **Flags y herramientas de inspección** (`gcc -E -S -c`, `nm`, `objdump`, `file`, `readelf`) se introducen junto a los artefactos que sirven para inspeccionar, no en un bloque aparte.
- **`make`** cierra el nivel como automatización del pipeline ya entendido. No se introduce antes.
- **No se usan demos abstractas**: todos los ejemplos parten de un `.c` concreto que el lector puede compilar en su laboratorio.

---

## Continuidad interna con niveles vecinos

Para el redactor, no para el cuerpo del capítulo (v2 §R7).

- **Desde `L0`:** la toolchain ya verificada se usa intensivamente.
- **Desde `L2`:** las secciones binarias del `.o` se interpretan con hex, endianness, ASCII.
- **Hacia `L4`:** el `.o` y el ejecutable se abren como archivos ELF con secciones, tablas de símbolos y relocations.
- **Hacia `L7`:** el `.s` deja de ser "intermediario opaco" y se vuelve contenido principal.
- **Hacia proyectos:** este nivel es prerrequisito directo de cualquier proyecto que toque `make`, `gcc`, `nm`, `objdump`, `ld`.

---

## Capítulos

### Capítulo 00 — Introducción

**Archivo:** `chapters/00-introduccion.md`

**Objetivo:** abrir el problema del nivel — `gcc archivo.c -o programa` esconde un pipeline con varias etapas y no entender la cadena hace que cualquier error suene como "no compila" — y declarar que el nivel separa cada etapa con artefactos materiales.

**Problema técnico que abre:** errores como "símbolo no encontrado", "referencia indefinida", "shared library not found", "undefined reference to printf" todos se confunden si el pipeline es una sola caja.

**Modelo mental que instala:** el pipeline como secuencia de transformaciones, con artefactos materiales que se pueden inspeccionar entre etapa y etapa.

**Secciones planificadas (H2):**
- `## Por qué un solo comando esconde un pipeline`
- `## Las cuatro etapas y los cinco artefactos`
- `## Inspeccionar entre etapas como método de trabajo`
- `## Los errores típicos y la etapa donde nacen`

**Materialidad obligatoria:**
- mención del `.c` que se va a usar a lo largo del nivel (programa pequeño con `printf` y una función propia);
- diagrama simple en prosa de las cuatro etapas con los artefactos entre ellas;
- al menos tres ejemplos breves de error con la etapa donde se origina.

**Confusiones que desmonta:**
- "compilar" como acción única;
- "no compila" como diagnóstico final;
- creer que los artefactos intermedios son ocultos por necesidad técnica.

**Cierre conceptual:** la persona sabe qué cinco artefactos van a ser inspeccionados.

**Epígrafe:**

> Un hombre estira el alambre; otro lo endereza; un tercero lo corta; un cuarto lo afila.
> — *Adam Smith, sobre la fábrica de alfileres, en La riqueza de las naciones (1776)*

Tangencial: una operación que parece atómica («hacer un alfiler») en realidad es una cadena de pasos especializados encadenados. Misma forma estructural que `gcc hello.c -o hello` esconde cuatro etapas. Fuente firme, autor del XVIII en otro dominio.

**Guiño previsto:** [01-source-artefactos-ejecutable.md](chapters/01-source-artefactos-ejecutable.md), tras listar las herramientas de inspección. Eco estructural usando el término que Smith acuñó: *«esa **división del trabajo** entre herramientas es el reflejo de la división del trabajo entre etapas»*. Sin nombrar a Smith ni a los alfileres.

**Notas v2:** este capítulo es de máximo riesgo de plantilla (`Qué cubre / Qué no cubre / Cómo trabajarlo / El nivel siguiente`). Vetada por v2 §A5/§A6/§B4. Las exclusiones se mencionan en una oración. La transición a `L4` vive en el `README.md`.

---

### Capítulo 01 — Source, artefactos y ejecutable

**Archivo:** `chapters/01-source-artefactos-ejecutable.md`

**Objetivo:** fijar los cinco artefactos como cosas distintas con identidad propia.

**Problema técnico que abre:** "el programa" se usa indistintamente para el `.c`, el `.o`, el ejecutable y el proceso vivo, lo que vuelve cualquier conversación de debugging ambigua.

**Modelo mental que instala:**
- `.c`: texto fuente leído por el preprocesador;
- `.i`: texto preprocesado leído por el compilador;
- `.s`: assembly leído por el ensamblador;
- `.o`: código objeto con secciones binarias y símbolos sin resolver completamente;
- ejecutable: binario relocado y enlazado, listo para que el SO lo cargue;
- ninguno de estos cinco es "el programa" sin contexto: cada uno es un artefacto en una etapa del pipeline.

**Secciones planificadas (H2):**
- `## Los cinco artefactos materiales`
- `## Qué se puede inspeccionar en cada uno`
- `## Cuál sirve para qué pregunta`
- `## Herramientas básicas de inspección por artefacto`
- `## Por qué hablar de "el programa" no alcanza`

**Materialidad obligatoria:**
- comando único que produce los cinco artefactos a partir del mismo `.c` (`gcc -E`, `gcc -S`, `gcc -c`, link final);
- listado real de los cinco archivos en disco con `ls -l`;
- comando `file` aplicado a cada uno con su salida.

**Confusiones que desmonta:**
- "el ejecutable es lo único real";
- creer que `.o` y ejecutable son el mismo formato con otro nombre;
- creer que el `.s` es un archivo de log.

**Cierre conceptual:** la persona puede listar los cinco artefactos en disco y dar un comando de inspección por cada uno.

---

### Capítulo 02 — Preprocesado

**Archivo:** `chapters/02-preprocesado.md`

**Objetivo:** mostrar que el preprocesador hace manipulación textual sin entender C.

**Problema técnico que abre:** muchos errores que parecen del compilador en realidad provienen de `#include` o macros mal pensadas. Sin separar la etapa, se diagnostican mal.

**Modelo mental que instala:**
- inclusión textual de headers como pegado de archivos;
- expansión de macros como reemplazo textual;
- compilación condicional como filtrado de líneas;
- el resultado es un `.i`: C válido sin directivas;
- el preprocesador no chequea sintaxis de C: pega y reemplaza.

**Secciones planificadas (H2):**
- `## `#include` como inserción textual`
- `## Macros como reemplazo textual`
- `## Compilación condicional`
- `## El `.i` como C sin directivas`
- `## Errores que nacen acá y se ven más adelante`

**Materialidad obligatoria:**
- ejecución de `gcc -E hello.c -o hello.i` con el `.c` del nivel;
- comparación corta entre `.c` y `.i` (longitud de archivo, primeras y últimas líneas, presencia de declaraciones traídas por `<stdio.h>`);
- ejemplo de macro mal hecha cuyo error se manifiesta en compilación pero se origina en preprocesado.

**Confusiones que desmonta:**
- preprocesador como parte del compilador;
- creer que macros son funciones;
- pensar que el `.i` es para los humanos.

**Cierre conceptual:** la persona sabe cuándo el problema del error está en el `.i` y no en el `.c` original.

---

### Capítulo 03 — Compilación a assembly

**Archivo:** `chapters/03-compilacion-assembly.md`

**Objetivo:** mostrar el `.s` como artefacto observable que vincula C con la arquitectura.

**Problema técnico que abre:** el `.s` se trata como caja negra y por eso parece imposible saber qué eligió hacer el compilador.

**Modelo mental que instala:**
- el compilador traduce C a assembly de una arquitectura específica;
- el resultado depende de flags como `-O0`, `-O2`;
- el `.s` es texto y se puede leer (al menos estructuralmente);
- en este nivel solo se reconocen formas, no se interpretan instrucciones individuales.

**Secciones planificadas (H2):**
- `## Del C al assembly como traducción`
- `## El `.s` como texto inspeccionable`
- `## Lo que reconocemos sin saber assembly todavía`
- `## El efecto visible del nivel de optimización`
- `## Lo que se posterga al nivel de assembly`

**Materialidad obligatoria:**
- `gcc -S -O0` y `gcc -S -O2` sobre el mismo `.c`;
- comparación de tamaño de los dos `.s` y de la cantidad de líneas;
- identificación visual de `main:`, `.text`, etiquetas de funciones, sin entrar a interpretar instrucciones.

**Confusiones que desmonta:**
- el `.s` como log opaco;
- creer que C se traduce a "instrucciones máquina" sin pasar por assembly;
- esperar que el nivel enseñe a leer assembly (no lo hace, lo posterga).

**Cierre conceptual:** la persona puede mirar dos `.s` del mismo `.c` con flags distintas y reconocer que son artefactos diferentes.

---

### Capítulo 04 — Ensamblado y código objeto

**Archivo:** `chapters/04-ensamblado-codigo-objeto.md`

**Objetivo:** abrir el `.o` como archivo binario con secciones y símbolos.

**Problema técnico que abre:** los `.o` se ven como "compilados" y por eso parece sorprendente que un programa que "compiló" no enlace.

**Modelo mental que instala:**
- el ensamblador toma `.s` y produce `.o` con secciones binarias (`.text`, `.data`, `.rodata`, `.bss`);
- las secciones contienen código y datos en su forma binaria final;
- el `.o` no es ejecutable: contiene direcciones provisionales y referencias sin resolver;
- el `.o` ya tiene una **tabla de símbolos** que nombra qué define y qué necesita.

**Secciones planificadas (H2):**
- `## Del assembly al `.o``
- `## Secciones del `.o``
- `## La tabla de símbolos como contrato del archivo`
- `## Por qué un `.o` no es ejecutable todavía`
- `## Inspección con `objdump` y `nm``

**Materialidad obligatoria:**
- `gcc -c` sobre el `.c` del nivel;
- `file hello.o` con su salida;
- `nm hello.o` con su salida y lectura de las columnas (tipo de símbolo, nombre);
- `objdump -h hello.o` mostrando secciones.

**Confusiones que desmonta:**
- `.o` como sinónimo de ejecutable;
- creer que el `.o` "ya tiene todo";
- creer que la tabla de símbolos es interna y no se inspecciona.

**Cierre conceptual:** la persona puede listar las secciones de un `.o` y leer su tabla de símbolos.

---

### Capítulo 05 — Símbolos y referencias no resueltas

**Archivo:** `chapters/05-simbolos-referencias.md`

**Objetivo:** instalar la noción de símbolo definido vs símbolo referenciado y por qué un `.o` puede tener referencias pendientes.

**Problema técnico que abre:** "undefined reference to ..." es la cara visible de no entender qué resuelve el linker. Sin distinguir definición y referencia, el error es ruido.

**Modelo mental que instala:**
- definición: el símbolo aparece en este `.o` con cuerpo asociado (función o dato);
- referencia: el símbolo se nombra desde este `.o`, pero su definición está en otro lado;
- `nm` lo muestra con códigos distintos (`T`, `D`, `U` y otros);
- las referencias `U` deben ser resueltas en linking; si ninguna unidad las define, falla.

**Secciones planificadas (H2):**
- `## Definir y referenciar son cosas distintas`
- `## Los códigos de `nm` que importan en este nivel`
- `## Por qué quedan referencias sin resolver al final del `.c``
- `## El error "undefined reference" como síntoma`
- `## Símbolos locales y símbolos globales`

**Materialidad obligatoria:**
- `nm hello.o` con su salida real comentada por columnas;
- ejemplo concreto que provoque "undefined reference" (declarar y usar una función que no se define en ningún `.o` ni biblioteca);
- al menos un símbolo `U` correspondiente a `printf`, con explicación de dónde se va a resolver.

**Confusiones que desmonta:**
- creer que toda referencia tiene que vivir en el mismo `.c`;
- creer que `printf` "está en C";
- creer que el linker y el compilador detectan el mismo error.

**Cierre conceptual:** la persona puede mirar un `nm` y predecir si esos `.o` van a enlazar entre sí, o qué falta.

---

### Capítulo 06 — Linking

**Archivo:** `chapters/06-linking.md`

**Objetivo:** mostrar al linker como integrador que combina `.o` y bibliotecas, resuelve referencias y produce el ejecutable.

**Problema técnico que abre:** el linker es donde se manifiestan los errores que no se vieron antes. Sin entender qué hace, los mensajes son crípticos.

**Modelo mental que instala:**
- el linker recibe varios `.o` y bibliotecas;
- combina secciones equivalentes (todas las `.text` de los `.o` se unifican);
- resuelve cada referencia `U` buscando una definición en otro `.o` o biblioteca;
- asigna direcciones definitivas (relocation) hasta donde corresponde según el tipo de salida;
- emite ejecutable, biblioteca estática (`.a`) o biblioteca dinámica (`.so`), según la invocación.

**Secciones planificadas (H2):**
- `## Lo que recibe y lo que produce el linker`
- `## Combinación de secciones de varios `.o``
- `## Resolución de referencias`
- `## Asignación de direcciones`
- `## Errores típicos y a qué corresponde cada uno`

**Materialidad obligatoria:**
- compilación final del programa del nivel a ejecutable;
- `file hello` y `nm hello` mostrando que las referencias antes pendientes ahora están resueltas;
- al menos un caso con dos `.c` que se compilan en `.o` separados y se enlazan después.

**Confusiones que desmonta:**
- linker como parte del compilador sin diferencia funcional;
- creer que el ejecutable contiene los `.o` literales;
- creer que el linker compila código.

**Cierre conceptual:** la persona puede explicar qué hace el linker en una invocación real y reconocer mensajes típicos del paso.

---

### Capítulo 07 — Bibliotecas estáticas y dinámicas

**Archivo:** `chapters/07-libs-estaticas-dinamicas.md`

**Objetivo:** distinguir los dos modos de uso de bibliotecas externas.

**Problema técnico que abre:** "no encuentra la librería" puede ser problema de link, de carga, de variable de entorno o de empaquetado, según el modo. Sin distinguir, no se puede diagnosticar.

**Modelo mental que instala:**
- biblioteca estática (`.a`): archivos de `.o` empacados que el linker copia adentro del ejecutable;
- biblioteca dinámica (`.so`): archivo aparte que el ejecutable referencia y el dynamic linker carga al ejecutar;
- el ejecutable estático no depende del archivo `.a` después del link;
- el ejecutable dinámico sí depende del `.so` en runtime;
- `ldd` muestra dependencias dinámicas; `nm` y `objdump` ayudan a confirmar qué se incrustó.

**Secciones planificadas (H2):**
- `## Biblioteca estática como empaquetado de `.o``
- `## Biblioteca dinámica como dependencia en runtime`
- `## Tamaño y dependencias resultantes`
- `## Cuándo se manifiesta el error en cada modo`
- `## Inspección con `ldd` y `nm``

**Materialidad obligatoria:**
- enlazar el programa del nivel contra `libm` en modo dinámico (default) y observar `ldd`;
- al menos un experimento con linking estático parcial (`-static` o equivalente disponible en el laboratorio) y comparación de tamaños del ejecutable;
- al menos un caso de error de carga simulado (renombrar una `.so` esperada o `LD_LIBRARY_PATH` apuntando mal) con diagnóstico.

**Confusiones que desmonta:**
- creer que `.a` y `.so` son intercambiables;
- creer que el error de "shared library not found" es un error de compilación;
- creer que el ejecutable "incluye" la `.so`.

**Cierre conceptual:** la persona puede decir, dado un ejecutable, de qué `.so` depende y por qué.

---

### Capítulo 08 — Flags del compilador como modificadores observables

**Archivo:** `chapters/08-flags.md`

**Objetivo:** desactivar la magia alrededor de las flags más comunes.

**Problema técnico que abre:** las flags se copian de tutoriales sin saber qué cambian. Cuando un build no se comporta igual que otro, no hay base para entender por qué.

**Modelo mental que instala:**
- cada flag modifica un artefacto observable: cambian el `.s`, el `.o` o el ejecutable;
- las clases relevantes en este nivel: nivel de optimización (`-O0`/`-O1`/`-O2`), información de debug (`-g`), warnings (`-Wall`, `-Wextra`), búsqueda de includes y libs (`-I`, `-L`, `-l`), control de etapa (`-E`, `-S`, `-c`).

**Secciones planificadas (H2):**
- `## Flag como modificación observable de un artefacto`
- `## Niveles de optimización y su efecto en el `.s``
- `## Información de debug y su efecto en el `.o` y el ejecutable`
- `## Warnings como filtro temprano`
- `## Búsqueda de headers y bibliotecas`
- `## Cómo elegir la flag mirando el efecto, no el manual`

**Materialidad obligatoria:**
- comparación tabular: misma compilación con `-O0` vs `-O2` (tamaños de `.s`, `.o` y ejecutable);
- compilación con y sin `-g` y comparación de tamaños del `.o`;
- al menos un warning real producido al compilar con `-Wall`.

**Confusiones que desmonta:**
- flag como talismán;
- `-g` como "modo más lento";
- `-O2` como "siempre mejor".

**Cierre conceptual:** la persona puede tomar una flag desconocida, compilar con y sin ella, y describir el cambio en el artefacto resultante.

---

### Capítulo 09 — Make como automatización del pipeline

**Archivo:** `chapters/09-make.md`

**Objetivo:** mostrar `make` como expresión de las dependencias entre artefactos del pipeline ya entendido.

**Problema técnico que abre:** sin automatización, un proyecto con varios `.c` se vuelve frágil; con `make` mal entendido, el build se vuelve mágico.

**Modelo mental que instala:**
- una **regla** declara: para producir cierto target, hace falta cierto conjunto de prerrequisitos y se ejecuta cierta receta;
- `make` recompila lo que cambió y lo que depende de lo que cambió, mirando timestamps;
- los `.o` dependen de los `.c` y de los headers; el ejecutable depende de los `.o` y bibliotecas.

**Secciones planificadas (H2):**
- `## Reglas, targets, prerrequisitos y recetas`
- `## El grafo de dependencias del pipeline de C`
- `## Qué reconstruye make y qué no`
- `## Variables y reglas implícitas básicas`
- `## Errores frecuentes en Makefiles incipientes`

**Materialidad obligatoria:**
- Makefile pequeño que produzca el ejecutable del nivel a partir de uno o dos `.c`;
- ejecución de `make` desde estado limpio y desde estado parcialmente construido (cambiando solo un `.c`);
- comparación de qué se reconstruye en cada caso.

**Confusiones que desmonta:**
- `make` como script;
- creer que `make` mira el contenido de los archivos;
- creer que las recetas son cualquier cosa: son comandos del shell.

**Cierre conceptual:** la persona puede leer un Makefile pequeño y predecir qué se va a recompilar al modificar un archivo concreto.

---

## Ejercicios

`exercises/` con un archivo por ejercicio. Volumen alto.

### Ejercicio 01 — Producir los cinco artefactos

- **Tipo:** comando observable.
- **Consigna:** a partir del `hello.c` del nivel, generar `.i`, `.s`, `.o` y ejecutable. Listar los cinco archivos con `ls -l` y aplicar `file` a cada uno.
- **Evidencia esperada:** cinco archivos + listado + salidas de `file`.
- **Error que detecta:** confundir `gcc` directo con la cadena por etapas.

### Ejercicio 02 — Comparar `.c` y `.i`

- **Tipo:** comparación observable.
- **Consigna:** medir longitud (en líneas) del `.c` y del `.i`, identificar tres declaraciones traídas por `<stdio.h>` que aparezcan en el `.i`.
- **Evidencia esperada:** dos longitudes + tres declaraciones citadas.
- **Error que detecta:** creer que `.i` es solo "el `.c` con comentarios sacados".

### Ejercicio 03 — Comparar `.s` con dos niveles de optimización

- **Tipo:** comparación observable.
- **Consigna:** generar `.s` con `-O0` y con `-O2`, comparar tamaños y cantidad de etiquetas.
- **Evidencia esperada:** dos archivos + tabla comparativa.
- **Error que detecta:** suponer que la salida es la misma.

### Ejercicio 04 — Leer la tabla de símbolos del `.o`

- **Tipo:** comando observable + interpretación.
- **Consigna:** correr `nm hello.o` y clasificar cada línea como definición o referencia.
- **Evidencia esperada:** salida de `nm` con anotación por símbolo.
- **Error que detecta:** ignorar los `U` o tratarlos como errores.

### Ejercicio 05 — Provocar y leer "undefined reference"

- **Tipo:** experimento con error reproducible.
- **Consigna:** declarar y llamar una función no definida, intentar enlazar, capturar el mensaje del linker. Definirla en otro `.c`, recompilar y reenlazar.
- **Evidencia esperada:** mensaje original + estado final con éxito.
- **Error que detecta:** atribuir el error al compilador.

### Ejercicio 06 — Enlazar varios `.o`

- **Tipo:** comando observable.
- **Consigna:** dividir el programa del nivel en dos `.c` con una función pasando de uno a otro. Compilar a `.o` por separado y enlazar.
- **Evidencia esperada:** comandos por etapa + ejecutable funcional.
- **Error que detecta:** mezclar `gcc` directo con la cadena por etapas.

### Ejercicio 07 — Inspeccionar dependencias dinámicas

- **Tipo:** comando observable.
- **Consigna:** correr `ldd` sobre el ejecutable del nivel y describir cada dependencia.
- **Evidencia esperada:** salida + descripción.
- **Error que detecta:** suponer que el ejecutable es autosuficiente.

### Ejercicio 08 — Provocar error de biblioteca dinámica

- **Tipo:** experimento con error reproducible.
- **Consigna:** alterar `LD_LIBRARY_PATH` o el nombre esperado de una `.so` para forzar fallo de carga; capturar el mensaje y diagnosticar.
- **Evidencia esperada:** mensaje + diagnóstico.
- **Error que detecta:** confundir error de carga con error de link.

### Ejercicio 09 — Efecto observable de una flag

- **Tipo:** comparación observable.
- **Consigna:** elegir una flag (`-g`, `-O2`, `-Wall`) y compilar con y sin ella. Medir tamaño del `.o`/ejecutable y/o capturar warnings.
- **Evidencia esperada:** dos compilaciones + diferencia citada.
- **Error que detecta:** copiar flags sin observar efecto.

### Ejercicio 10 — Makefile mínimo

- **Tipo:** comando observable + diseño.
- **Consigna:** escribir un Makefile que produzca el ejecutable a partir de dos `.c`. Verificar que `make` no rehaga nada cuando todo está al día.
- **Evidencia esperada:** Makefile + dos ejecuciones (limpia y al día) con su salida.
- **Error que detecta:** declarar dependencias mal o escribir recetas sin tab inicial.

### Ejercicio 11 — Predicción de recompilación

- **Tipo:** multiple choice con verificación.
- **Consigna:** sobre el Makefile del ejercicio 10, indicar qué archivos se recompilan al tocar un header común usado por uno solo de los `.c`. Verificar con `make`.
- **Evidencia esperada:** predicción + verificación.
- **Error que detecta:** olvidar dependencias de headers.

### Ejercicio 12 — Diagnóstico cruzado por etapa

- **Tipo:** clasificación.
- **Consigna:** se presentan cinco mensajes de error reales del pipeline. Para cada uno, identificar la etapa donde se origina y el comando con el que confirmarlo.
- **Evidencia esperada:** mapeo error → etapa → comando.
- **Error que detecta:** colapsar todos los errores en "no compila".

---

## Pieza interactiva

- Ninguna interactiva propia del nivel. La materialidad la aportan los comandos `gcc`, `nm`, `objdump`, `file`, `ldd`, `make` ejecutados en el laboratorio.
- Se puede considerar a futuro un mapa visual estático del pipeline en la solapa del nivel; queda como decisión opcional para `forja-construccion.md`.

---

## Notas finales para el redactor

- Cada capítulo debe contener al menos un comando real con su salida o un fragmento de artefacto inspeccionable (v2 §R3).
- Mantener el mismo `.c` de referencia a lo largo del nivel para que cada etapa se observe sobre el mismo material.
- No introducir lectura de assembly más allá del reconocimiento estructural; el contenido detallado de assembly pertenece a `L7`.
- No abrir el formato ELF en este nivel; pertenece a `L4`.
- La transición a `L4` vive en el `README.md` del nivel.
