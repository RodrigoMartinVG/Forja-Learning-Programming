# Instrucciones y operandos

## El problema de leer instrucciones como un repertorio

Los capítulos anteriores trataron a las instrucciones como cosas que pasaban: aparecía `LOAD r0, [40]` en una posición de memoria, la CPU la ejecutaba, y la traza mostraba el efecto. Esa lectura alcanza para programas pequeños, pero se rompe rápido. Cuando aparezca un programa con doce instrucciones distintas y cinco clases de comportamiento mezcladas, leer cada instrucción de manera aislada vuelve la traza memorística: hay que recordar caso por caso qué hacía cada una, sin un esquema que organice la lectura.

Lo que falta es una **taxonomía operativa**: una forma de clasificar las instrucciones del ISA de juguete por lo que consultan y lo que modifican, de manera que cada nueva instrucción pueda ubicarse en una clase y, una vez ubicada, su comportamiento sobre el estado quede en gran parte determinado por la clase. Este capítulo construye esa taxonomía.

La promesa concreta es la siguiente: al terminar el capítulo, ante cualquier instrucción del ISA de juguete, debería ser posible predecir, sin tener que ejecutarla mentalmente paso por paso, qué partes del estado va a leer y qué partes va a modificar. Si esa predicción se vuelve directa, las trazas largas dejan de ser memorísticas.

## Operandos: qué consulta una instrucción

Antes de las clases, una idea transversal: **operandos**. Un operando de una instrucción es una pieza del estado que la instrucción nombra como entrada o salida. En `ADD r0, 1`, los operandos son `r0` (entrada y salida: se lee y se escribe) y `1` (entrada, una constante inmediata que no es parte del estado pero participa del cómputo). En `STORE r0, [40]`, los operandos son `r0` (entrada: se lee) y la posición de memoria 40 (salida: se escribe).

Los operandos pueden ser de tres clases en el ISA del nivel:

- **Registro**, nombrado directamente: `r0`, `r1`, etc.
- **Posición de memoria**, indicada con corchetes: `[40]`, o, más adelante, `[r1]` cuando la dirección viva en un registro.
- **Constante inmediata**, escrita como un número plano: `1`, `7`, `200`. No es parte del estado: es un valor literal que la instrucción trae consigo.

Aprender a identificar los operandos de cada instrucción y clasificarlos por tipo es la habilidad de fondo de todo el capítulo. La taxonomía que viene después es, en gran medida, una clasificación por qué tipos de operandos cada clase de instrucción usa.

## Movimiento entre registros

La primera clase es la más simple: instrucciones que copian un valor de un lugar a otro **sin tocar memoria**. En el ISA de juguete, esa clase está representada por `MOV`.

```text
MOV r1, r0
```

Esta instrucción copia el contenido de `r0` en `r1`. Antes de ejecutarla, los dos registros pueden tener cualquier valor; después, ambos tienen el valor que tenía `r0`. La memoria no se consulta y no se modifica. El `pc` avanza una posición, como en cualquier instrucción que no cambie explícitamente el flujo.

El comportamiento se puede resumir así: lee de un registro, escribe en otro registro, no toca memoria, avanza el `pc` por defecto. Cualquier `MOV` en el nivel sigue exactamente este patrón.

Una observación que evita una confusión recurrente: `MOV` no significa "mover" en el sentido de quitar de un lado y poner en otro. El registro fuente queda con su valor original; lo que se copia es el contenido. Después de `MOV r1, r0`, ambos registros contienen lo mismo. La palabra "movimiento" es histórica y no del todo precisa, pero está demasiado fijada para cambiarla; en la lectura mental funciona como "copia".

## Acceso a memoria: `LOAD` y `STORE`

La segunda clase es la que conecta registros con memoria. Como los dos lados son piezas del estado de naturaleza distinta —según fijó el [capítulo 03](03-cpu-registros.md)—, las instrucciones que las conectan son explícitamente dos, no una. La convención de sintaxis del ISA del nivel pone primero el registro y después la posición de memoria, en ambas instrucciones: el registro va al frente, lo que cambia entre `LOAD` y `STORE` es la dirección de la transferencia.

```text
LOAD r0, [40]
```

`LOAD` lee de memoria y escribe en registro. La instrucción consulta el contenido de la posición de memoria nombrada (40 en el ejemplo) y lo copia en el registro destino (`r0`). La memoria no cambia: `LOAD` es una lectura no destructiva. Lo que cambia es el registro destino, que pasa a contener el valor que estaba en la posición de memoria leída.

```text
STORE r0, [40]
```

`STORE` lee de registro y escribe en memoria. La instrucción consulta el contenido del registro fuente (`r0`) y lo copia en la posición de memoria destino (40). El registro no cambia: `STORE` lo lee, no lo modifica. Lo que cambia es la posición de memoria, que pasa a contener el valor que estaba en el registro.

La asimetría entre `LOAD` y `STORE` —cuál lee de dónde y cuál escribe dónde— es una fuente recurrente de confusión, sobre todo porque la sintaxis es casi idéntica: las dos escriben primero un registro y después una posición de memoria entre corchetes. La regla mnemónica que ayuda: `LOAD` "carga al registro" (el destino, el lado que cambia, es el registro de la izquierda); `STORE` "guarda en memoria" (el destino es la posición de memoria de la derecha). Si esa asociación no se asienta, la lectura de cualquier traza con accesos a memoria se vuelve ambigua: hace falta repetir la regla mnemónica hasta que sea reflejo.

### Direccionamiento directo e indirecto

Hasta acá, la posición de memoria fue siempre un número escrito explícitamente entre corchetes: `[40]`, `[50]`. Ese número es la dirección sobre la que se hace la operación, y forma parte de la instrucción misma. Esta forma se llama **direccionamiento directo**: la dirección está fija en el código, conocida en el momento en que la instrucción se escribe.

El ISA del nivel también admite una segunda forma, donde la dirección no es un número literal sino el **contenido de un registro**:

```text
LOAD r0, [r1]
STORE r0, [r1]
```

En `LOAD r0, [r1]`, los corchetes envuelven al registro `r1`. La instrucción se lee así: consultar el contenido de `r1` —ese contenido es una dirección de memoria—, ir a esa dirección, leer su contenido, y copiarlo en `r0`. Hay dos lecturas encadenadas: primero se lee el registro para obtener la dirección, después se lee la memoria en esa dirección para obtener el dato. `STORE r0, [r1]` funciona simétricamente: se lee `r1` para obtener la dirección destino, se lee `r0` para obtener el valor a guardar, y se escribe ese valor en la posición indicada por `r1`.

Esta forma se llama **direccionamiento indirecto**, y la diferencia con la directa es importante: la dirección sobre la que se opera ya no está fijada en el código, sino que **se calcula en tiempo de ejecución** mirando el estado del registro. Dos ejecuciones distintas del mismo `LOAD r0, [r1]` pueden leer posiciones de memoria distintas, según qué valor tenga `r1` en cada momento.

Una traza chica deja ver el efecto. Programa con estado inicial `pc = 0`, `r0 = 0`, `r1 = 0`, `mem[40] = 7`, `mem[41] = 9`:

| dirección | contenido |
| --------- | --------- |
| 0 | `MOV r1, 40` |
| 1 | `LOAD r0, [r1]` |
| 2 | `MOV r1, 41` |
| 3 | `LOAD r0, [r1]` |

Traza:

| momento | `pc` | `r0` | `r1` | `mem[40]` | `mem[41]` |
| ------- | ---- | ---- | ---- | --------- | --------- |
| inicio       | 0 | 0 | 0  | 7 | 9 |
| tras paso 1  | 1 | 0 | 40 | 7 | 9 |
| tras paso 2  | 2 | 7 | 40 | 7 | 9 |
| tras paso 3  | 3 | 7 | 41 | 7 | 9 |
| tras paso 4  | 4 | 9 | 41 | 7 | 9 |

Las dos instrucciones `LOAD r0, [r1]` —en las direcciones 1 y 3— son textualmente la misma instrucción, pero el paso 2 cargó un 7 en `r0` mientras que el paso 4 cargó un 9. La diferencia vive en el valor de `r1` en el momento de cada ejecución: 40 en el primer caso, 41 en el segundo. Para una instrucción de direccionamiento directo —`LOAD r0, [40]`—, la posición leída es siempre la misma, sin importar qué pase con los registros; para una de direccionamiento indirecto, la posición leída depende del estado.

La diferencia entre las dos formas se puede leer como dos cadenas de lectura distintas, una con un eslabón y otra con dos:

| forma | instrucción | cadena de lectura para obtener el dato |
|---|---|---|
| directo | `LOAD r0, [40]` | la dirección 40 viene en la instrucción → leer `mem[40]` → escribir en `r0` |
| indirecto | `LOAD r0, [r1]` | leer `r1` para obtener la dirección → leer `mem` en esa dirección → escribir en `r0` |

En el caso directo hay una sola lectura de memoria: la CPU ya tiene la dirección (40) en la instrucción misma y va directo a `mem[40]`. En el caso indirecto hay **dos** lecturas encadenadas: primero leer `r1` para obtener la dirección, después leer `mem` en esa dirección. Esta cadena de dos eslabones es la imagen mental que hace falta fijar; aparece otra vez, casi idéntica, cuando los punteros lleguen en `L9`.

Esa flexibilidad es la base mecánica de los **punteros**, una estructura que vuelve protagonista en [`L9`](../../L9-punteros-en-c/) cuando aparezca el lenguaje C: tener una dirección guardada en un registro o en memoria, y operar sobre ella indirectamente, es lo que permite recorrer arreglos, navegar listas enlazadas y pasar referencias entre funciones. En `L1` el direccionamiento indirecto aparece como mecanismo del ISA; en `L9` aparece como herramienta de programación. Las dos lecturas son la misma cosa vista en niveles distintos.

Una observación práctica que vale la pena anotar: el direccionamiento indirecto **no agrega instrucciones nuevas** al repertorio. `LOAD` y `STORE` siguen siendo las dos únicas instrucciones de acceso a memoria; lo que se expande es el rango de valores que el segundo operando puede tomar. Esa observación se reflejará en la taxonomía: la columna *lee de* / *escribe en* del cuadro va a tener "memoria" como destino, sin distinguir si la dirección vino directa o indirecta.

## Aritmética sobre registros

La tercera clase modifica el contenido de un registro aplicándole una operación aritmética con otro operando. En el ISA del nivel, las representantes son `ADD` y `SUB`.

```text
ADD r0, 1
```

Esta instrucción suma 1 al contenido de `r0` y guarda el resultado en `r0`. El primer operando es entrada y salida: se lee para tomar el valor actual y se escribe para guardar el resultado. El segundo operando es sólo entrada.

El segundo operando puede ser de tipos distintos:

- Constante inmediata: `ADD r0, 1` — sumar la constante 1.
- Otro registro: `ADD r0, r1` — sumar el contenido de `r1`.
- Posición de memoria: `ADD r0, [40]` — sumar el contenido de la posición 40.

En las dos primeras formas, la memoria no se toca. En la tercera, hay un acceso de lectura a memoria implícito: `ADD r0, [40]` lee el contenido de la posición 40 y lo usa como segundo sumando, sin modificarlo. El resultado se acumula en `r0`. La memoria no se escribe en ninguna de las tres formas; sólo el registro destino cambia.

`SUB` se comporta exactamente igual con resta en lugar de suma. La forma de leer cualquiera de las dos es la misma: identificar el primer operando (registro destino, lectura+escritura), identificar el segundo (entrada, puede ser inmediato, registro o memoria), y predecir el cambio en el registro destino.

## Instrucciones que cambian el `pc`

La cuarta clase es la única que toca el `pc` de manera explícita. Las otras tres clases dejan el `pc` avanzar por defecto a la siguiente posición; las instrucciones de control de flujo lo escriben con un valor distinto.

```text
JMP 7
```

`JMP` (jump, salto incondicional) escribe el `pc` con la dirección indicada como operando. Después de ejecutarse, el `pc` vale 7 sin importar qué valía antes. Como consecuencia, la siguiente instrucción que la CPU va a ejecutar es la que esté en la posición 7, no la que sigue secuencialmente al `JMP`. La memoria no se toca, los registros no cambian; el único efecto es la escritura del `pc`.

```text
JNZ r0, 7
```

`JNZ` (jump if not zero, salto condicional) escribe el `pc` con el valor indicado **sólo si** el contenido del registro evaluado es distinto de cero. Si `r0` es cero, el `pc` avanza por defecto y la instrucción no produce salto. Si `r0` es distinto de cero, el `pc` se escribe con 7 y la siguiente instrucción que se ejecuta vive en esa dirección.

Esta clase es la materia central del [capítulo 06](06-flujo-de-control.md), donde se discute cómo los loops y las bifurcaciones son consecuencias del comportamiento de estas dos instrucciones, no construcciones aparte. Acá se las introduce solamente como una clase más de la taxonomía: instrucciones que leen un registro (`JNZ`) o ningún operando del estado (`JMP`), y escriben el `pc`.

## Una taxonomía operativa para leer trazas

Las cuatro clases pueden resumirse en una tabla, que es la forma con la que el resto del nivel va a apoyarse en este capítulo:

| instrucción | clase | lee de | escribe en | cambia `pc` | efecto observable |
| ----------- | ----- | ------ | ---------- | ----------- | ----------------- |
| `MOV r1, r0` | movimiento | registro | registro | avance por defecto | el registro destino queda con el valor del fuente |
| `LOAD r0, [40]` | acceso a memoria (directo) | memoria | registro | avance por defecto | el registro destino queda con el contenido de la posición leída |
| `LOAD r0, [r1]` | acceso a memoria (indirecto) | memoria (dirección en `r1`) | registro | avance por defecto | igual que arriba, pero la dirección se obtiene de `r1` en tiempo de ejecución |
| `STORE r0, [40]` | acceso a memoria (directo) | registro | memoria | avance por defecto | la posición de memoria queda con el valor del registro |
| `STORE r0, [r1]` | acceso a memoria (indirecto) | registro | memoria (dirección en `r1`) | avance por defecto | igual que arriba, pero la dirección se obtiene de `r1` en tiempo de ejecución |
| `ADD r0, 1` | aritmética | registro + inmediato | registro | avance por defecto | el registro destino queda con el resultado de la operación |
| `ADD r0, [40]` | aritmética | registro + memoria | registro | avance por defecto | el registro destino queda con el resultado; la memoria no cambia |
| `JMP 7` | control de flujo | (nada del estado) | `pc` | salto incondicional | el `pc` queda con la dirección destino |
| `JNZ r0, 7` | control de flujo | registro | `pc` (condicional) | depende del registro | el `pc` queda con la dirección destino sólo si el registro era no-cero |

Esta tabla es la herramienta. No hace falta memorizarla en el sentido de poder recitarla; hace falta poder reconstruirla cuando se necesite, porque cada vez que aparezca una nueva instrucción en una traza, las preguntas a hacerse son las que las columnas representan: *¿de dónde lee? ¿dónde escribe? ¿toca el `pc`?*. Una persona que ante cualquier instrucción del ISA de juguete puede contestar las tres preguntas sin titubear, ya tiene el repertorio firme.

Para ejercitar esa habilidad, vale la pena mirar una traza que combine tres clases en pasos consecutivos. Considerar el siguiente programa, cargado a partir de la dirección 0, con estado inicial `pc = 0`, `r0 = 0`, `r1 = 0`, `mem[40] = 7`:

| dirección | contenido |
| --------- | --------- |
| 0 | `LOAD r0, [40]` |
| 1 | `MOV r1, r0` |
| 2 | `ADD r0, 1` |
| 3 | `STORE r0, [40]` |

La traza completa:

| momento | `pc` | `r0` | `r1` | `mem[40]` | clase |
| ------- | ---- | ---- | ---- | --------- | ----- |
| inicio       | 0 | 0 | 0 | 7 | (ninguna) |
| tras paso 1  | 1 | 7 | 0 | 7 | acceso a memoria (`LOAD`) |
| tras paso 2  | 2 | 7 | 7 | 7 | movimiento (`MOV`) |
| tras paso 3  | 3 | 8 | 7 | 7 | aritmética (`ADD`) |
| tras paso 4  | 4 | 8 | 7 | 8 | acceso a memoria (`STORE`) |

Tres clases aparecen en cuatro pasos, y la lectura de la traza se vuelve directa cuando la columna *clase* se completa por reconocimiento, no por análisis paso por paso. El paso 1 cambió `r0` (vino de memoria); el paso 2 copió `r0` en `r1` sin tocar nada más; el paso 3 modificó `r0` con aritmética; el paso 4 escribió `mem[40]` desde `r0`. Cada cambio se justifica por la clase de la instrucción que lo produjo. Las cuatro instrucciones del ejemplo usan direccionamiento directo; un caso explícito con direccionamiento indirecto ya quedó mostrado en la sección anterior del capítulo, y la cuarta clase —control de flujo— se trabaja con detalle en el [capítulo 06](06-flujo-de-control.md).

Con la taxonomía firme, el [capítulo 05](05-fetch-decode-execute.md) puede entrar a la pregunta que quedó suspendida desde el [capítulo 03](03-cpu-registros.md): qué pasa exactamente dentro de un paso, entre el momento en que el `pc` señala una instrucción y el momento en que el estado quedó modificado.
