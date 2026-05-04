# Outline: L2 — Representación de la información

> Documento de diseño interno. No se sirve en la web. Guía para escribir capítulos y ejercicios de `L2`. Voz y prosa: [estandar_editorial_forja.md](../../../estandar_editorial_forja.md). Estructura: [CONVENTIONS.md](../../../CONVENTIONS.md).

---

## Metadatos

- **Prerrequisitos:** `L0`, `L1`.
- **Bloque editorial de entrada recomendado:** `content/theory/forja.md`, `content/theory/README.md`.
- **Proyectos asociados:** ninguno propio. Aporta base directa a proyectos de `L7+`.
- **Desbloquea:** `L3`.
- **Fuente curricular:** [docs/forja-contenido.md §6 L2](../../../docs/forja-contenido.md).

---

## Objetivo del nivel

Que la persona pueda mirar un dump de bytes y, sabiendo qué convención de lectura aplica (entero sin signo, complemento a dos, ASCII, UTF-8, little-endian, IEEE 754), explicar qué valor representa y qué pasaría si la convención cambiara.

---

## Contrato conceptual

Lo que `L2` debe dejar instalado:

- bit y byte como unidades materiales con ancho finito;
- el ancho como límite estructural: hay valores que no caben;
- entero sin signo y entero con signo en complemento a dos como dos convenciones distintas sobre el mismo patrón;
- overflow y truncado como consecuencias de operar dentro de un ancho;
- hexadecimal como representación compacta de patrones de bytes (no como sistema numérico independiente);
- ASCII como tabla mínima entre bytes y caracteres;
- UTF-8 como codificación de longitud variable, no equivalente a ASCII para todo el rango Unicode;
- endianness como convención de orden, no como propiedad del valor;
- floating point IEEE 754 a nivel intuición: signo, exponente, mantisa, sesgo, casos especiales, sin entrar en aritmética detallada.

Lo que `L2` **no** instala (se posterga con cita):

- aritmética binaria detallada de FP: queda fuera del track o en niveles avanzados;
- otras codificaciones (UTF-16, UTF-32, EBCDIC) más allá de mención breve;
- alineación, padding y layout de structs: aparecen en `L9` y siguientes;
- representación de instrucciones máquina: `L7`.

---

## Decisiones de diseño curricular

- **Hexadecimal se introduce temprano (capítulo 02), antes que las convenciones de signo**, porque todo el resto del nivel se apoya en lectura hex de patrones de bytes. Postergarlo obligaría a mostrar binarios largos o decimales sueltos sin apoyo material.
- **Complemento a dos no se presenta como "el truco"**, sino como la convención efectiva. Bit más significativo con peso negativo.
- **Overflow se trata como capítulo propio**, no como nota al pie. Es donde más bugs reales nacen.
- **ASCII y UTF-8 son capítulos separados**. Colapsarlos lleva a creer que UTF-8 es "ASCII en pocos bytes más".
- **Endianness se presenta sobre dumps reales**, comparando lectura LE y BE del mismo patrón.
- **Floating point se mantiene en plano intuitivo**: signo / exponente / mantisa, casos especiales, no aritmética de mantisa.

---

## Continuidad interna con niveles vecinos

Para el redactor, no para el cuerpo de capítulo (v2 §R7).

- **Desde `L1`:** la idea "el patrón material no trae interpretación pegada" se vuelve operativa acá: el mismo patrón se lee como sin signo, con signo o como caracter según convención.
- **Hacia `L3`:** los `.o` traen secciones binarias que solo se entienden con hex, endianness y ASCII en la cabeza.
- **Hacia `L7`:** la lectura de operandos inmediatos en assembly depende de complemento a dos.
- **Hacia `L8`/`L9`:** punteros como direcciones almacenadas dependen de endianness y ancho fijo.

---

## Capítulos

### Capítulo 00 — Introducción

**Archivo:** `chapters/00-introduccion.md`

**Objetivo:** abrir el problema del nivel — sin convenciones de lectura, un byte es ruido — y declarar que el nivel cambia la pregunta de "qué dice el byte" a "bajo qué convención lo leo".

**Problema técnico que abre:** el mismo `0xFF` puede ser 255, -1, una letra de Latin-1, parte de un caracter UTF-8 o un nibble de un float. Sin convención, no hay valor.

**Modelo mental que instala:** lectura de bytes como combinación obligatoria de patrón + convención.

**Secciones planificadas (H2):**
- `## El patrón sin convención no representa nada`
- `## Las convenciones que el nivel va a fijar`
- `## El dump hex como herramienta de trabajo del nivel`
- `## Lo que queda afuera y a qué nivel se posterga`

**Materialidad obligatoria:**
- al menos un caso de `0xFF` leído bajo tres convenciones distintas como anticipo;
- mención explícita de la herramienta de dump (`xxd`, `hexdump`) que va a aparecer a lo largo del nivel.

**Confusiones que desmonta:**
- "el byte vale tanto" como afirmación universal;
- creer que los caracteres son bytes 1-a-1.

**Cierre conceptual:** la persona sabe que toda lectura del nivel va a venir acompañada de la convención bajo la cual lee.

**Notas v2:** las exclusiones se mencionan en una oración breve. Nada de plantilla `Qué cubre / Qué no cubre / Cómo trabajarlo`.

---

### Capítulo 01 — Bit, byte y ancho finito

**Archivo:** `chapters/01-bits-bytes-ancho.md`

**Objetivo:** instalar bit y byte como unidades materiales y el ancho fijo como restricción estructural.

**Problema técnico que abre:** sin ancho explícito, "número entero" suena ilimitado y todo el resto del nivel pierde sentido.

**Modelo mental que instala:**
- bit: dígito binario;
- byte: 8 bits agrupados como unidad mínima de direccionamiento;
- ancho fijo: 8, 16, 32, 64 bits son los anchos típicos del nivel;
- 2^n valores distintos por cada n bits;
- ancho como cota dura, no recomendación.

**Secciones planificadas (H2):**
- `## Bit como dígito binario`
- `## Byte como agrupación de 8 bits`
- `## Cuántos valores caben en n bits`
- `## Ancho como límite estructural`
- `## Por qué los anchos típicos son potencias pequeñas de 2`

**Materialidad obligatoria:**
- tabla `n / 2^n` para n ∈ {1, 4, 8, 16, 32};
- al menos un patrón concreto de 8 bits y la cuenta de cuántos valores distintos abarca ese ancho.

**Confusiones que desmonta:**
- bit como sinónimo de byte;
- creer que los anchos son arbitrarios;
- esperar que un entero "siempre" pueda crecer.

**Cierre conceptual:** la persona puede decir cuántos valores distintos representa cualquier ancho típico y por qué ese número es exacto.

---

### Capítulo 02 — Hexadecimal como apoyo de lectura

**Archivo:** `chapters/02-hexadecimal.md`

**Objetivo:** introducir hex como representación compacta de patrones de bytes.

**Problema técnico que abre:** binarios de 8 bits son ilegibles a la vista; decimal pierde la estructura de medio byte.

**Modelo mental que instala:**
- 1 nibble = 4 bits = 1 dígito hex;
- 1 byte = 2 dígitos hex;
- hex no es "otro número": es otra escritura del mismo patrón;
- conversión nibble a nibble como técnica directa.

**Secciones planificadas (H2):**
- `## Por qué binario solo no alcanza`
- `## Nibbles y bytes en hex`
- `## Conversión nibble a nibble`
- `## Notación: prefijos `0x` y dumps tabulares`
- `## Hex en herramientas reales: `xxd` y `hexdump``

**Materialidad obligatoria:**
- tabla de los 16 dígitos hex con su patrón de 4 bits;
- al menos un dump real de un archivo corto (texto, archivo binario chico) con `xxd` o `hexdump`;
- ejemplo de conversión bidireccional: byte en binario ↔ byte en hex.

**Confusiones que desmonta:**
- hex como sistema numérico desligado;
- pensar que cada dígito hex es un byte;
- pensar que el prefijo `0x` cambia el valor.

**Cierre conceptual:** la persona puede mirar `0x4F` y nombrar sus dos nibbles binarios sin error.

---

### Capítulo 03 — Enteros sin signo

**Archivo:** `chapters/03-enteros-sin-signo.md`

**Objetivo:** fijar la convención más simple: cada bit pesa una potencia de 2 no negativa.

**Problema técnico que abre:** sin la convención sin signo bien instalada, lo demás se apila sobre tierra inestable.

**Modelo mental que instala:**
- bit i (de derecha a izquierda) pesa 2^i;
- rango: [0, 2^n - 1];
- conversión decimal → binario por divisiones, binario → decimal por suma de potencias;
- representación posicional: el patrón es la suma de los pesos de los bits encendidos.

**Secciones planificadas (H2):**
- `## Pesos por posición`
- `## Convertir binario a decimal sumando pesos`
- `## Convertir decimal a binario por divisiones`
- `## Rango y máximo de un ancho dado`
- `## Lectura combinada con hex`

**Materialidad obligatoria:**
- tabla de potencias de 2 hasta 2^15;
- ejemplo trabajado en ambas direcciones de conversión;
- una conversión hex → decimal sin pasar por binario explícito.

**Confusiones que desmonta:**
- bit más significativo como "el bit raro";
- creer que el rango llega a 2^n;
- creer que el orden lateral del binario no importa.

**Cierre conceptual:** la persona puede pasar entre binario, hex y decimal sobre patrones de hasta 16 bits sin titubear.

---

### Capítulo 04 — Complemento a dos

**Archivo:** `chapters/04-complemento-a-dos.md`

**Objetivo:** instalar complemento a dos como la convención con signo estándar.

**Problema técnico que abre:** existen valores negativos representables en el mismo ancho. La convención no puede ser "ponerle un signo arriba".

**Modelo mental que instala:**
- el bit más significativo pesa **negativo** en lugar de positivo;
- el resto de los bits pesan como en sin signo;
- rango asimétrico: [-2^(n-1), 2^(n-1) - 1];
- regla de inversión de signo: invertir bits y sumar 1 (consecuencia, no axioma);
- el patrón de bits no cambia: cambia la convención bajo la cual se lee.

**Secciones planificadas (H2):**
- `## El bit más significativo como peso negativo`
- `## Cálculo del valor en complemento a dos`
- `## Cómo cambia el rango`
- `## Inversión de signo como consecuencia mecánica`
- `## El mismo patrón leído sin signo y con signo`
- `## Por qué esta convención y no otra`

**Materialidad obligatoria:**
- tabla con los 8 patrones de 4 bits que tienen MSB encendido y su valor en sin signo y en complemento a dos;
- al menos dos ejemplos de inversión de signo paso a paso;
- caso del mínimo negativo (cuyo opuesto no cabe) explicado con el patrón concreto.

**Confusiones que desmonta:**
- creer que el bit de signo se descarta y el resto se lee igual;
- creer que rango simétrico;
- creer que `-x` siempre es representable.

**Cierre conceptual:** la persona puede mirar un patrón de 8 bits y dar dos valores: el sin signo y el con signo.

---

### Capítulo 05 — Overflow y truncado

**Archivo:** `chapters/05-overflow-truncado.md`

**Objetivo:** mostrar las dos consecuencias inevitables del ancho fijo.

**Problema técnico que abre:** los bugs aritméticos más comunes nacen acá. Un valor "casi correcto" suele ser un valor envuelto.

**Modelo mental que instala:**
- overflow: una operación aritmética produce un patrón cuyo valor "matemático" no cabe en el ancho;
- el valor que queda en memoria es el patrón truncado al ancho disponible;
- en aritmética modular, el resultado es el residuo módulo 2^n;
- en complemento a dos, el síntoma es cambio de signo;
- el overflow en sin signo y en con signo se manifiesta distinto pero es la misma mecánica subyacente.

**Secciones planificadas (H2):**
- `## Ancho fijo y resultado que no cabe`
- `## Truncado como resto módulo 2^n`
- `## Overflow en aritmética sin signo`
- `## Overflow en complemento a dos`
- `## Síntomas observables`
- `## Cómo aparece esto en debugging real`

**Materialidad obligatoria:**
- tabla con tres operaciones que producen overflow, su resultado matemático y su resultado en el ancho;
- ejemplo con ancho de 8 bits para que la cuenta sea legible;
- al menos un ejemplo de cambio de signo bajo complemento a dos.

**Confusiones que desmonta:**
- overflow como "número que se pone en rojo";
- creer que el compilador "lo arregla";
- creer que el bug aparece solo en valores muy grandes.

**Cierre conceptual:** la persona puede predecir el patrón resultante de un overflow elemental.

---

### Capítulo 06 — Texto como bytes: ASCII

**Archivo:** `chapters/06-texto-ascii.md`

**Objetivo:** instalar la lectura más simple de bytes como texto.

**Problema técnico que abre:** "el archivo es texto" oculta que en memoria hay bytes y que la lectura como texto exige una tabla de correspondencia.

**Modelo mental que instala:**
- ASCII = tabla de 7 bits que asocia patrones a caracteres;
- en disco y memoria los caracteres ASCII viven como bytes con el bit más significativo en cero;
- caracteres imprimibles vs caracteres de control;
- las cadenas son secuencias de bytes con alguna convención de fin (la más usual: byte 0).

**Secciones planificadas (H2):**
- `## La tabla ASCII como acuerdo`
- `## Imprimibles y caracteres de control`
- `## Cadenas como secuencias con fin acordado`
- `## Lectura de un archivo de texto con `xxd``
- `## Lo que ASCII no representa`

**Materialidad obligatoria:**
- subset de la tabla ASCII (al menos `0x20`–`0x7E`);
- dump real de un archivo de texto en inglés;
- mostrar la frontera entre rango ASCII y bytes con MSB encendido.

**Confusiones que desmonta:**
- ASCII como capaz de cualquier idioma;
- carácter como sinónimo de byte;
- olvidar el byte de fin de cadena.

**Cierre conceptual:** la persona puede leer un dump hex de texto en inglés sin tabla a la vista para los caracteres comunes.

---

### Capítulo 07 — UTF-8 y codificación de longitud variable

**Archivo:** `chapters/07-utf8.md`

**Objetivo:** mostrar que más allá de ASCII los caracteres requieren más de un byte y que UTF-8 codifica eso de forma autosincrónica.

**Problema técnico que abre:** "ASCII alcanza para todo" es falso fuera del rango anglosajón; tratar bytes y caracteres como uno solo produce truncamientos visibles.

**Modelo mental que instala:**
- code point Unicode: número entero que identifica un carácter abstracto;
- UTF-8: codificación que mapea cada code point a 1, 2, 3 o 4 bytes;
- los bytes de continuación tienen un patrón fijo de bits altos que permite reconocer límites;
- ASCII es subconjunto puro: code points 0–127 ocupan exactamente 1 byte y coinciden bit a bit con la tabla ASCII;
- contar caracteres no es lo mismo que contar bytes.

**Secciones planificadas (H2):**
- `## Code points y caracteres abstractos`
- `## Por qué un byte ya no alcanza`
- `## El esquema de bytes en UTF-8`
- `## Bits altos como marcadores de límite`
- `## ASCII como subconjunto puro`
- `## Caracteres no son bytes`

**Materialidad obligatoria:**
- tabla con los cuatro formatos de UTF-8 (1, 2, 3, 4 bytes) y los bits fijos de cabeza/continuación;
- dump real con al menos un caracter no-ASCII (`á`, `ñ`, `€`);
- conteo de caracteres y conteo de bytes lado a lado para una cadena no trivial.

**Confusiones que desmonta:**
- UTF-8 como "ASCII en uno o dos bytes";
- creer que `strlen` cuenta caracteres;
- creer que cualquier byte de un archivo UTF-8 representa un carácter.

**Cierre conceptual:** la persona puede mirar tres bytes seguidos en un dump UTF-8 y decir si forman un carácter de tres bytes o tres caracteres ASCII.

---

### Capítulo 08 — Endianness

**Archivo:** `chapters/08-endianness.md`

**Objetivo:** instalar endianness como convención de orden de bytes en valores multibyte.

**Problema técnico que abre:** un mismo entero de 32 bits en memoria puede leerse como dos valores distintos según en qué orden interpretemos los bytes; esto produce diagnósticos absurdos cuando se ignora.

**Modelo mental que instala:**
- valores multibyte se almacenan en memoria como secuencia de bytes individuales;
- little-endian: el byte menos significativo primero;
- big-endian: el byte más significativo primero;
- la elección es propiedad de la arquitectura, no del valor;
- los valores en registros y los valores impresos no muestran orden de bytes; los dumps de memoria sí.

**Secciones planificadas (H2):**
- `## Valores multibyte y orden de bytes`
- `## Little-endian y big-endian`
- `## Por qué el dump muestra el orden y la pantalla no`
- `## Endianness en x86-64: little-endian`
- `## Cómo se manifiesta el error de endianness`

**Materialidad obligatoria:**
- comparación tabular del mismo entero de 32 bits en LE y BE;
- al menos un dump real de un valor inicializado en C (programa simple compilado en `L0`/`L3`) leído con `xxd`;
- caso de mal diagnóstico ("este número es enorme y no debería") explicado por orden invertido.

**Confusiones que desmonta:**
- creer que el orden de bytes "depende de cómo se mire";
- creer que el valor cambia con la endianness;
- mezclar endianness con orden de bits dentro del byte.

**Cierre conceptual:** la persona puede mirar 4 bytes en LE y reconstruir el entero de 32 bits que representan.

---

### Capítulo 09 — Floating point como intuición

**Archivo:** `chapters/09-floating-point.md`

**Objetivo:** dar una intuición material del formato IEEE 754, sin entrar en aritmética detallada.

**Problema técnico que abre:** los `float` y `double` se tratan como cajas opacas y los errores típicos (`0.1 + 0.2 != 0.3`, NaN propagándose) se viven como brujería.

**Modelo mental que instala:**
- formato: signo (1 bit), exponente con sesgo (8 o 11 bits), mantisa fraccionaria (23 o 52 bits);
- el valor representado es signo · 2^(exponente - sesgo) · (1 + mantisa fraccionaria);
- existen valores especiales: cero, subnormales, infinitos, NaN;
- precisión finita: hay decimales que no son representables exactamente;
- comparación por igualdad de floats es frágil por construcción.

**Secciones planificadas (H2):**
- `## El formato en tres campos`
- `## Cómo se calcula el valor representado`
- `## El sesgo del exponente y por qué existe`
- `## Casos especiales: cero, infinitos, NaN, subnormales`
- `## Por qué `0.1 + 0.2` no da `0.3``
- `## Lo que sigue siendo dump hex y se lee igual`

**Materialidad obligatoria:**
- desglose de un `float` concreto (por ejemplo `1.0f`, `0.5f`) en signo, exponente y mantisa;
- tabla con los patrones especiales (0, ±∞, NaN);
- dump hex real de una variable `float` inicializada en C, leída con la convención IEEE.

**Confusiones que desmonta:**
- creer que `float` representa decimales arbitrarios sin error;
- creer que el sesgo del exponente es decorativo;
- creer que NaN se compara como cualquier valor.

**Cierre conceptual:** la persona puede mirar 4 bytes y decir si son un `float` válido y, en caso afirmativo, dar su valor aproximado.

---

## Ejercicios

`exercises/` con un archivo por ejercicio. Volumen alto.

### Ejercicio 01 — Conversiones binario / hex / decimal sin signo

- **Tipo:** ejercicio guiado con verificación.
- **Consigna:** seis patrones (tres en binario, tres en hex). Convertir cada uno al resto de las representaciones, sin signo.
- **Evidencia esperada:** tabla completa.
- **Error que detecta:** confundir hex con un sistema numérico independiente.

### Ejercicio 02 — Lectura del mismo byte bajo dos convenciones

- **Tipo:** clasificación.
- **Consigna:** cinco bytes con MSB encendido. Para cada uno, dar valor sin signo y valor en complemento a dos.
- **Evidencia esperada:** dos columnas de valor por fila.
- **Error que detecta:** leer ambos como sin signo o tratar el bit de signo aparte.

### Ejercicio 03 — Inversión de signo en complemento a dos

- **Tipo:** ejercicio guiado.
- **Consigna:** tres valores positivos en 8 bits; obtener el patrón de su negativo paso a paso.
- **Evidencia esperada:** tres líneas de cuenta + patrón resultante en hex.
- **Error que detecta:** olvidar el +1 final, o aplicar inversión bit-a-bit sin sumar.

### Ejercicio 04 — Predecir overflow

- **Tipo:** multiple choice con verificación.
- **Consigna:** tres operaciones aritméticas sobre ancho de 8 bits. Predecir patrón resultante e indicar si hay overflow sin signo, con signo, ambos o ninguno.
- **Evidencia esperada:** clasificación + patrón.
- **Error que detecta:** asociar overflow solo a "números muy grandes".

### Ejercicio 05 — Leer un dump ASCII

- **Tipo:** comando observable.
- **Consigna:** crear un archivo de texto en inglés con `echo`, mirarlo con `xxd`, transcribir los bytes a caracteres a mano y comparar.
- **Evidencia esperada:** archivo, dump, transcripción.
- **Error que detecta:** asumir que cada byte es siempre un carácter.

### Ejercicio 06 — Distinguir bytes ASCII de bytes UTF-8 multibyte

- **Tipo:** clasificación.
- **Consigna:** dado un dump con cadenas mezcladas (ASCII puro y caracteres acentuados), marcar dónde empieza y termina cada carácter.
- **Evidencia esperada:** dump anotado.
- **Error que detecta:** contar bytes como caracteres.

### Ejercicio 07 — Reconstruir un entero LE desde un dump

- **Tipo:** comando observable.
- **Consigna:** declarar un `uint32_t` con valor conocido en un programa C, compilarlo con la toolchain del laboratorio, dumpearlo con `xxd` y reconstruir el entero a mano desde los 4 bytes en LE.
- **Evidencia esperada:** programa, dump, cálculo de reconstrucción.
- **Error que detecta:** olvidar invertir el orden de bytes al reconstruir.

### Ejercicio 08 — Comparar LE y BE sobre el mismo valor

- **Tipo:** comparación.
- **Consigna:** para tres valores hexadecimales de 32 bits, escribir cómo aparecerían en dump LE y en dump BE.
- **Evidencia esperada:** tabla comparativa.
- **Error que detecta:** creer que la endianness cambia el valor.

### Ejercicio 09 — Desarmar un `float` en sus tres campos

- **Tipo:** ejercicio guiado.
- **Consigna:** dos `float` concretos (`1.0f` y un valor a elección). Aislar signo, exponente y mantisa, calcular el valor a partir de la fórmula, comparar con el valor original.
- **Evidencia esperada:** descomposición + cálculo.
- **Error que detecta:** olvidar el sesgo del exponente.

### Ejercicio 10 — Predecir el patrón de un valor especial

- **Tipo:** multiple choice con verificación.
- **Consigna:** identificar entre cuatro patrones cuál corresponde a `+0`, `-0`, `+∞` y `NaN`.
- **Evidencia esperada:** mapeo correcto.
- **Error que detecta:** asumir que `0.0f` y `-0.0f` tienen el mismo patrón.

### Ejercicio 11 — Diagnóstico cruzado

- **Tipo:** caso aplicado.
- **Consigna:** se presenta un valor en memoria que parece "muy grande". Dar tres convenciones bajo las cuales podría leerse y decidir cuál es la coherente con el contexto del programa que lo produjo.
- **Evidencia esperada:** tres valores + decisión justificada.
- **Error que detecta:** atribuir un solo valor al patrón sin justificar la convención.

---

## Pieza interactiva

- **Solapa recomendada:** `bit-explorer` (o equivalente declarado en el repo).
- **Rol:** introducir un patrón de bytes y leerlo bajo distintas convenciones (sin signo, complemento a dos, ASCII, UTF-8, LE/BE, IEEE 754) viendo el valor resultante. Sirve para ejercicios 02, 04, 06, 07, 08, 10, 11.
- **No reemplaza:** los capítulos. Es soporte de comprobación.

---

## Notas finales para el redactor

- Cada capítulo debe contener al menos un dump hex real o una tabla de patrones (v2 §R3).
- No mezclar capítulos de signo con capítulos de codificación de texto: son convenciones distintas, conviene mantenerlas separadas también en la prosa.
- En complemento a dos y en FP no apoyarse en metáforas. Apoyarse en patrones concretos.
- La transición a `L3` vive en el `README.md`.
