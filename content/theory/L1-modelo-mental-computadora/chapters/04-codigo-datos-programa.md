# Código, datos y programa en ejecución

Después de `03` ya hay una forma concreta de leer una ejecución: el `pc` apunta a una instrucción, la CPU la trae, la interpreta y cambia una parte del estado. Pero todavía queda una confusión muy común: mezclar el source que una persona escribe, el código que la máquina termina leyendo, los datos con los que ese código trabaja y el programa mientras se está ejecutando.

En este capítulo conviene separar esas piezas antes de entrar a compilación real, procesos del sistema operativo o assembly concreto. Si esa separación no queda firme ahora, más adelante es fácil decir frases como "el source está en memoria", "el proceso es el archivo" o "cambiar el código" sin distinguir qué cosa está cambiando realmente.

Vamos a apoyarnos en el mismo ejemplo de los capítulos anteriores:

```text
100: LOAD r0, [40]
101: ADD  r0, [41]
102: STORE r0, [42]
103: HALT
```

Y en este estado inicial:

| Pieza | Valor inicial |
|---|---|
| `pc` | `100` |
| `r0` | `0` |
| `mem[40]` | `7` |
| `mem[41]` | `5` |
| `mem[42]` | `0` |

## Código y datos viven en memoria

En `01` ya apareció la idea fuerte: dato e instrucción no son dos materias distintas. En `02` esa idea quedó más concreta cuando vimos una tabla de memoria donde unas direcciones se leían como instrucciones y otras como datos.

Con el ejemplo actual, una vista mínima de memoria puede volver a escribirse así:

| Dirección | Rol en este momento | Contenido |
|---|---|---|
| `40` | dato | `7` |
| `41` | dato | `5` |
| `42` | dato | `0` |
| `100` | código | `LOAD r0, [40]` |
| `101` | código | `ADD r0, [41]` |
| `102` | código | `STORE r0, [42]` |
| `103` | código | `HALT` |

Eso permite fijar una distinción importante:

- **código cargado** es la parte de memoria que la CPU puede ir leyendo como secuencia de instrucciones
- **datos** son valores que esas instrucciones consultan o modifican mientras se ejecutan

En este punto no hace falta discutir todavía permisos de memoria, segmentos reales o formato de ejecutables. Lo que hace falta es que deje de sonar raro que código y datos vivan en el mismo modelo de memoria, aunque cumplan roles distintos.

También conviene notar que el rol no depende solo de la dirección escrita en una tabla, sino del uso que se hace de ella. `100` aparece como dirección de instrucción porque el `pc` la señala como próximo paso. `40` aparece como dirección de dato porque `LOAD r0, [40]` la usa para leer un valor.

## El source no es el programa en ejecución

Hasta acá venimos usando instrucciones ya cargadas en memoria. Pero eso no es lo mismo que el **source**.

Para este nivel conviene usar estas definiciones mínimas:

- **source**: el texto que una persona escribe o edita, por ejemplo dentro del repo
- **código cargado**: la forma en que ese programa ya está disponible para ser leído por la CPU dentro de memoria
- **programa en ejecución**: ese código cargado junto con un estado actual que va cambiando paso a paso

Una analogía útil es esta:

- el source se parece a una receta escrita en un cuaderno
- el código cargado se parece a la secuencia de pasos ya preparada para ser seguida por una máquina concreta
- el programa en ejecución se parece a la cocina mientras la receta realmente se está llevando a cabo, con ingredientes ya usados, otros todavía intactos y un paso actual en curso

Con el ejemplo del nivel, el source no es esta tabla:

| Dirección | Contenido |
|---|---|
| `100` | `LOAD r0, [40]` |
| `101` | `ADD r0, [41]` |
| `102` | `STORE r0, [42]` |
| `103` | `HALT` |

Esa tabla ya representa código disponible para la ejecución. El source es otra cosa: una descripción humana del programa, alojada en archivos del repo, que todavía no estamos describiendo en detalle porque ese puente le toca a `L3`.

Por ahora alcanza con esta idea: la CPU no hace fetch sobre un archivo del repo ni sobre el texto que una persona lee en el editor. Hace fetch sobre código ya cargado en memoria.

## Qué significa que un proceso tenga estado

La palabra **proceso** suele venir más cargada de detalles de sistema operativo de los que L1 necesita. Acá conviene usarla en un sentido mínimo: un programa mientras se ejecuta, junto con el estado actual que hace que esa ejecución esté en un punto concreto y no en otro.

Con esa definición, estas dos descripciones no nombran lo mismo aunque el código cargado sea el mismo:

| Caso | Estado relevante |
|---|---|
| inicio | `pc=100`, `r0=0`, `mem[40]=7`, `mem[41]=5`, `mem[42]=0` |
| después de `ADD r0, [41]` | `pc=102`, `r0=12`, `mem[40]=7`, `mem[41]=5`, `mem[42]=0` |

En ambos casos el código cargado en `100..103` puede ser exactamente el mismo, pero el programa en ejecución no está en la misma situación. Cambió el `pc`, cambió `r0` y, por lo tanto, cambió lo que puede pasar después.

Eso ayuda a fijar otra distinción:

- **programa como código cargado**: la secuencia de instrucciones disponible en memoria
- **proceso o programa en ejecución**: ese código más un estado actual que incluye dónde va la ejecución y qué valores relevantes tiene la máquina en ese momento

Esa diferencia parece pequeña, pero tiene mucho alcance. Sin ella es fácil hablar del programa como si fuera una cosa quieta, cuando en realidad durante la ejecución existe una historia de estados que cambia a cada paso.

## Por qué este modelo explica muchos errores

Separar source, código cargado, datos y programa en ejecución no es solo una prolijidad conceptual. Sirve para explicar errores muy comunes.

Por ejemplo, estas frases mezclan planos distintos:

- "el programa está en el archivo" mezcla source con código cargado
- "la CPU está leyendo el source" mezcla el texto humano con la secuencia real de instrucciones que fetch va tomando
- "el bug está en el código" puede ocultar que el problema real está en los datos de entrada o en un estado inesperado del programa durante la ejecución
- "es el mismo programa, así que debería hacer lo mismo" puede olvidar que el mismo código cargado puede ejecutarse con datos o estados distintos

En el ejemplo del nivel, no es lo mismo preguntar:

- qué instrucciones están cargadas en `100..103`
- qué valores tienen `mem[40]`, `mem[41]` y `mem[42]`
- en qué paso de ejecución está el `pc`

Las tres preguntas hablan del mismo sistema, pero no del mismo plano.

Eso también deja mejor preparado el terreno para más adelante:

- cuando aparezca debugging, hará falta distinguir entre el archivo fuente y el estado actual del programa
- cuando aparezca compilación, hará falta separar el texto fuente de los artefactos que terminan ejecutándose
- cuando aparezcan punteros y memoria en C, hará falta no confundir dirección, valor y región de código o datos

## Lo que L2, L3 y L7 vuelven más concreto

En este punto ya alcanza con una imagen bastante firme:

- hay source que una persona escribe
- hay código cargado que la CPU puede leer como instrucciones
- hay datos que ese código consulta o modifica
- hay un programa en ejecución cuyo estado cambia paso a paso

Los niveles siguientes le van a dar más cuerpo a cada parte de esa imagen:

- `L2` hará más concreta la materia de los datos y de la memoria: bits, bytes, enteros, overflow, representación
- `L3` hará más concreto el puente entre source y programa ejecutable: compilación, ensamblado, linking y artefactos
- `L7` hará más concreta la forma de las instrucciones reales cuando aparezca assembly

L1 no necesita abrir todavía esos detalles. Su trabajo es más austero y más importante: dejar de hablar como si source, código, datos y ejecución fueran la misma cosa. Cuando esa separación queda firme, el resto del track deja de apoyarse en intuiciones borrosas.