# Laboratorio interactivo de representacion para L2

> Documento de diseno interno para una futura solapa propia del nivel.
>
> Este artefacto no reemplaza capitulos ni ejercicios. Define una pieza interactiva grande, pensada para volver visible lo que `L2` explica sobre bits, bytes, texto simple, ancho finito, overflow, hexadecimal, endianness y aproximacion finita.

## Objetivo

Construir un laboratorio interactivo que haga visible, paso a paso y con varias vistas sincronizadas, como un mismo patron finito de bits y bytes puede leerse de formas distintas.

La primera version tiene que servir para reforzar lo que ya explican los capitulos de `L2`, no para adelantar semanticas de C, detalles normativos completos de IEEE 754 ni formatos binarios de `L3` o niveles posteriores.

## Por que va en una solapa propia

Esta pieza no conviene vivir como capitulo de teoria ni como ejercicio aislado.

- como capitulo seria demasiado grande y con demasiado estado propio
- como ejercicio quedaria subrepresentada, porque no es una practica acotada sino una herramienta de exploracion
- como solapa propia puede tener buffer editable, vistas sincronizadas, operaciones, presets y memoria visible sin deformar la lectura del nivel

Nombre recomendado de la futura solapa: `laboratorio`.

## Contrato conceptual

El laboratorio tiene que respetar estas distinciones desde la primera version:

- **buffer canonico**: patron real de bits y bytes que se toma como fuente de verdad
- **interpretacion**: lectura actual de ese buffer como unsigned, signed, hexadecimal, bytes en memoria o float de juguete
- **operacion**: accion que cambia el buffer, por ejemplo sumar con ancho fijo, truncar, extender o reescribir bytes
- **reinterpretacion**: cambio de lectura sin cambiar el buffer

Regla didactica importante: la interfaz tiene que distinguir con claridad cuando paso una de estas dos cosas:

- **mismos bits, nuevo significado**
- **nuevos bits, misma interpretacion**

Ese punto no es solo tecnico. Refuerza exactamente la idea central de `L2`: el patron material no trae significado pegado de antemano.

## Modelo base de memoria para L2

La primera version debe asumir un modelo simple y pedagogicamente fuerte: **memoria direccionable por bytes**.

Eso implica:

- una direccion nombra un byte
- las direcciones crudas avanzan de a una unidad: `0`, `1`, `2`, `3`, ...
- un valor de 16 bits ocupa 2 direcciones consecutivas
- un valor de 32 bits ocupa 4 direcciones consecutivas
- un valor de 64 bits ocupa 8 direcciones consecutivas

Ejemplo didactico minimo:

- si una vista activa interpreta un `u32` empezando en `mem[20]`, ese valor ocupa `mem[20]`, `mem[21]`, `mem[22]` y `mem[23]`
- la memoria no "salta de 4 en 4" por si sola
- lo que cambia es la **ventana tipada** con la que una persona decide leer varios bytes como un solo valor logico

La interfaz tiene que volver visible esta diferencia con dos nociones separadas:

- **cursor por byte**: recorre direcciones una por una
- **ventana tipada**: agrupa 1, 2, 4 u 8 bytes y los interpreta como una unidad logica

Ese contraste es una de las piezas mas valiosas de `L2`, porque prepara el terreno para punteros, arrays, layout, hexdumps y formatos binarios sin introducir todavia un lenguaje concreto.

Esta parte de memoria no deberia darse por cerrada en la v1 si todavia faltan estas tres cosas:

- poder ver exactamente que rango de direcciones ocupa un valor multi-byte
- poder mover la ventana tipada sin perder de vista que las direcciones crudas siguen avanzando byte a byte
- poder mostrar que una escritura parcial sobre algunos bytes cambia otras lecturas tipadas mas grandes que los contienen

## Que muestra L2 en la v1

La v1 tiene que ser austera y alineada con el outline ya escrito.

Estado visible en `L2`:

- ancho activo: `8`, `16`, `32` o `64` bits
- buffer de bits agrupado por nibbles y bytes
- bytes individuales con direccion explicita
- vista hexadecimal sincronizada
- vista ASCII simple sincronizada
- vista decimal unsigned sincronizada
- vista decimal signed sincronizada
- indicador de rango valido para el ancho actual
- indicador de overflow, carry o truncado cuando corresponda
- selector little endian / big endian para vistas multi-byte
- modo float de juguete o escena especifica para aproximacion finita

Estado que no conviene exponer todavia en la primera cara del laboratorio:

- IEEE 754 completo con todos sus casos especiales
- formatos binarios reales como ELF o protocolos de red completos
- semantica de casts, promociones y UB de C
- tipos concretos de Rust
- UTF completo y serializacion compleja como eje central

Se puede conservar la idea de formato o protocolo como horizonte, pero no deben dominar la interfaz de `L2`.

## Interacciones principales

La interfaz debe permitir un conjunto chico de acciones con efecto visible inmediato:

- activar o desactivar bits individuales
- escribir un valor en decimal, binario o hexadecimal y ver como cambia el buffer
- cambiar el ancho de la ventana tipada
- reinterpretar el mismo buffer como unsigned o signed
- reinterpretar un rango como ASCII simple sin cambiar la memoria
- alternar entre little endian y big endian en vistas multi-byte
- sumar o restar con ancho fijo para hacer visible overflow y truncado
- extender o truncar un valor para comparar rango y perdida de informacion
- mover el cursor por byte y ver que bytes exactos quedan contenidos por la ventana tipada

Las operaciones deben dejar rastro textual corto. Ejemplos utiles:

- `mismos bits; nueva lectura signed`
- `resultado fuera de rango; se conservaron los 8 bits bajos`
- `u32 en little endian ocupa mem[20..23]`

Tambien conviene admitir estas dos operaciones porque vuelven mucho mas concreta la memoria real del nivel:

- **sobrescritura parcial**: cambiar solo 1 o 2 bytes dentro de una ventana mas grande
- **extension**: pasar de 8 a 16 o 32 bits con zero extension o sign extension

## Escenas y presets curriculares

Los presets no deben ser meros ejemplos sueltos. Conviene pensarlos como escenas del nivel:

- **mismo byte, dos lecturas**: `11111111` como unsigned y signed
- **overflow unsigned**: `255 + 1` en 8 bits
- **overflow signed**: `127 + 1` en 8 bits
- **nibbles y hex**: pasar entre binario y hexadecimal viendo agrupamiento por 4 bits
- **un valor, cuatro bytes**: un `u32` repartido en cuatro direcciones consecutivas
- **texto simple y valor logico**: ver que `42` como ASCII no es lo mismo que `42` como entero
- **UTF-8 y bytes de continuacion**: mirar una secuencia muy chica para distinguir byte de inicio, byte de continuacion y cursor material frente a cursor de decodificacion
- **little vs big endian**: mismo valor logico, distinto orden de bytes en memoria
- **truncado**: tomar un valor de 16 o 32 bits y recortarlo a 8 bits
- **sobrescribir el medio**: escribir un `u16` dentro del rango que hoy ocupa un `u32` y ver como cambia la lectura grande
- **extender sin signo / extender con signo**: mostrar por que `0xFF` no se prolonga igual si se lo lee como unsigned o signed
- **float de juguete**: representar un decimal que no entra exacto y mostrar aproximacion

En esa escena de UTF-8 conviene dejar una mención breve, sin intentar dar assembly todavía, a que la misma intuición estructural reaparece más adelante en encodings de instrucciones y opcodes de longitud variable: ciertos bytes iniciales orientan cómo debe continuar la decodificación.

Mas adelante podrian vivir en archivos versionados junto al nivel y ser leidos por la web como escenas del laboratorio.

## Alineacion con capitulos

La pieza interactiva tiene que reforzar el orden del nivel, no competir con el.

- `00`: abrir el laboratorio y entender que hay un buffer material y varias lecturas posibles
- `01`: usar la vista de bits, bytes y direccion por byte
- `02`: comparar unsigned y complemento a dos sobre el mismo patron
- `03`: ejecutar sumas y truncados con ancho fijo
- `04`: usar hexadecimal como vista practica del mismo buffer
- `05`: leer texto simple y una escena de UTF-8 con prefijos y bytes de continuacion como otra interpretacion del mismo buffer
- `06`: ver como un valor multi-byte ocupa direcciones consecutivas y cambia su orden segun endianness
- `07`: usar una escena acotada de float de juguete para fijar aproximacion finita

La regla es simple: el laboratorio nunca debe mostrar como sabido algo que el nivel todavia no explico.

## Layout recomendado

Una primera cara razonable podria separar cuatro zonas:

- **buffer canonico**: bits y agrupamiento por bytes
- **memoria**: bytes con direcciones explicitas
- **interpretaciones**: unsigned, signed, hex y, cuando corresponda, float
- **historial corto**: que cambio en la ultima operacion y si hubo perdida, reinterpretacion o overflow

No conviene caer en un dashboard lleno de cifras. La interfaz tiene que guiar la lectura de una sola transformacion por vez.

## Que no conviene mezclar todavia

Vale la pena mostrar una version del laboratorio ya en `L2`, pero no conviene convertirla en un simulador completo de maquina.

Lo que si pertenece a `L2`:

- buffer por bytes
- ventanas tipadas
- ocupacion de varias direcciones consecutivas
- endianness
- overflow, truncado y extension
- reinterpretacion frente a conversion

Lo que conviene dejar para `L7` y assembly:

- registros visibles como `r0`, `r1`, `rax`, etc.
- instrucciones `LOAD`, `STORE`, `MOV` como eje de la interfaz
- `pc`, fetch, decode y execute
- stack, calling convention y addressing modes mas realistas
- alineacion y acceso no alineado como problema tecnico principal

La regla practica es esta: en `L2` la memoria debe verse como bytes y lecturas tipadas. En `L7`, esa misma memoria puede reaparecer como destino de instrucciones reales. No hace falta esperar hasta assembly para mostrarla, pero tampoco conviene adelantar toda la maquina ahora.

## Errores y mensajes

El laboratorio tiene que tratar el error como parte del aprendizaje.

Los mensajes deberian distinguir:

- valor fuera del rango representable para el ancho actual
- truncado por recorte de bytes
- reinterpretacion sin cambio de buffer
- imposibilidad de leer una ventana tipada si faltan bytes suficientes

Y mostrar, cuando corresponda:

- patron antes y despues
- bytes afectados
- rango valido para la vista activa
- direccion inicial y direccion final de la ventana tipada

## Crecimiento por niveles

El laboratorio de `L2` no debe nacer como herramienta aislada, sino como parte de una linea mas larga del track.

Idea general:

- `L2`: patrones finitos, ancho, endian, overflow, aproximacion
- `L3`: leer bytes y hex dentro de artefactos del pipeline de compilacion
- `L7`: reencontrar esas mismas ideas en instrucciones reales, immediatos y disassembly
- niveles posteriores: layout de structs, formatos binarios, serializacion, object layout, `xxd`, `od`, `objdump`, hexdumps y memoria observada por debugger

La continuidad importante no es visual. Es conceptual: una misma persona aprende a no confundir valor abstracto, patron material y lectura tipada.

## Orden recomendado de implementacion

1. definir el buffer canonico y las vistas sincronizadas minimas
2. construir la escena base de bits, bytes y hex
3. agregar unsigned, signed y complemento a dos
4. sumar overflow y truncado con ancho fijo
5. agregar la vista de memoria byte a byte con ventana tipada
6. recien despues abrir little/big endian y la escena de float de juguete

## Criterio de exito para la v1

La v1 esta bien si una persona puede:

- cambiar un bit y ver todas las lecturas afectadas
- explicar por que un mismo patron puede leerse distinto sin haber cambiado
- ver que las direcciones crudas avanzan de a bytes aunque un valor logico ocupe varios bytes
- reconstruir un valor multi-byte mirando memoria y sabiendo el endianness
- provocar overflow o truncado y describir exactamente que informacion se perdio

Si eso ya se entiende, `L2` deja de ser una lista de definiciones y pasa a ser una experiencia concreta de representacion.