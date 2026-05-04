# Make como automatización del pipeline

## Reglas, targets, prerrequisitos y recetas

Hasta acá el pipeline se manejó a mano: un comando para preprocesar, otro para compilar a assembly, otro para ensamblar, otro para enlazar. Para un programa con un solo `.c` esto es manejable. Para un programa con cinco `.c` y tres headers, hacerlo a mano es lento y propenso a errores: olvidar recompilar un `.o` cuando su `.c` cambió produce un ejecutable inconsistente.

`make` es la herramienta clásica de Unix para automatizar este trabajo. La idea central es expresar el build como un **grafo de dependencias entre archivos**: cada archivo del pipeline depende de los archivos que lo originan, y `make` se encarga de reconstruir lo necesario cuando algo cambia.

La unidad básica es la **regla**. Una regla tiene tres partes:

```
target: prerrequisitos
    receta
```

- **Target**: el archivo que la regla sabe producir (por ejemplo, `main.o`).
- **Prerrequisitos**: los archivos de los que depende el target (por ejemplo, `main.c` y `greet.h`).
- **Receta**: el comando o secuencia de comandos que produce el target a partir de los prerrequisitos.

Un detalle sintáctico crucial: la receta **debe empezar con un tab**, no con espacios. Si se usan espacios, `make` reporta un error oscuro (`missing separator`). Esta peculiaridad es una fuente histórica de fricción y rompe el primer Makefile que se escribe sin saberlo.

Un Makefile mínimo para [`src/split/`](../src/split/) es exactamente el que está en el repositorio:

```
CC := cc
CFLAGS := -Wall -Wextra -std=c11

app: main.o greet.o
	$(CC) main.o greet.o -o app

main.o: main.c greet.h
	$(CC) $(CFLAGS) -c main.c -o main.o

greet.o: greet.c greet.h
	$(CC) $(CFLAGS) -c greet.c -o greet.o

clean:
	rm -f app main.o greet.o
```

Cinco partes:

- Las dos primeras líneas (`CC :=`, `CFLAGS :=`) son **variables**: nombres que se expanden cuando aparecen como `$(CC)`, `$(CFLAGS)`. Permiten cambiar el compilador o las flags en un solo lugar sin tocar las recetas.
- La regla `app:` declara que para producir el ejecutable `app` hacen falta `main.o` y `greet.o`, y la receta es `cc main.o greet.o -o app`.
- Las reglas `main.o:` y `greet.o:` declaran cómo producir cada `.o` a partir del `.c` correspondiente y los headers que usa.
- La regla `clean:` no produce un archivo `clean`: es una **regla phony**, que solo existe para ejecutar la receta. Por convención, sirve para limpiar artefactos.

Cuando se invoca `make` sin argumentos, ejecuta la primera regla del archivo (`app` en este caso). Cuando se invoca `make X`, ejecuta la regla cuyo target es `X`.

## El grafo de dependencias del pipeline de C

`make` construye internamente un grafo dirigido a partir de las reglas:

```
                  app
                /     \
            main.o   greet.o
           /  |  \    /  |  \
        main.c |  greet.h  greet.c
              greet.h         (compartido entre los dos .o)
```

Cuando se le pide producir `app`, `make` recorre el grafo desde `app` hacia las hojas, verificando si cada target está al día respecto a sus prerrequisitos. La verificación se basa en **timestamps de modificación**: un target está al día si existe y su timestamp es más reciente que el de todos sus prerrequisitos.

Si un prerrequisito tiene un timestamp más reciente que el target, `make` ejecuta la receta del target para regenerarlo. La regeneración propaga: si `main.c` cambió, `main.o` se regenera, y entonces `app` —que depende de `main.o`— también. Si solo se tocó `greet.c`, `main.o` no se regenera (su prerrequisito `main.c` no cambió), pero `greet.o` y luego `app` sí.

## Qué reconstruye make y qué no

El comportamiento concreto se ve mejor con una secuencia de invocaciones desde estado limpio:

```
$ cd src/split
$ make clean       # asegurarse del estado limpio
$ make
cc -Wall -Wextra -std=c11 -c main.c -o main.o
cc -Wall -Wextra -std=c11 -c greet.c -o greet.o
cc main.o greet.o -o app
```

La primera invocación produce los dos `.o` y el ejecutable. Una segunda invocación inmediatamente después no hace nada:

```
$ make
make: 'app' is up to date.
```

`make` verificó timestamps, todo estaba al día, no ejecutó ninguna receta. Si ahora se toca solo `greet.c`:

```
$ touch greet.c
$ make
cc -Wall -Wextra -std=c11 -c greet.c -o greet.o
cc main.o greet.o -o app
```

Solo se regeneraron `greet.o` y `app`. `main.o` no se tocó, porque su prerrequisito `main.c` no cambió. Esta selectividad es la propiedad central de `make`: **no rehacer lo que no cambió**. Para programas con cientos de `.o`, la diferencia entre rehacer todo y rehacer solo lo necesario puede ser de minutos a segundos.

Si en lugar de `greet.c` se toca el header compartido `greet.h`:

```
$ touch greet.h
$ make
cc -Wall -Wextra -std=c11 -c main.c -o main.o
cc -Wall -Wextra -std=c11 -c greet.c -o greet.o
cc main.o greet.o -o app
```

Ahora `make` regenera los **dos** `.o`, porque ambos tienen `greet.h` como prerrequisito. Si el Makefile no hubiera declarado esa dependencia —por ejemplo, si la regla de `main.o` solo nombrara `main.c`—, `make` no habría regenerado `main.o` aunque el header compartido cambiara, y el ejecutable habría quedado inconsistente. Declarar correctamente las dependencias de headers es la fuente más común de bugs en Makefiles incipientes.

## Variables y reglas implícitas básicas

`make` tiene varias facilidades para reducir la repetición. Las dos más útiles en este nivel:

**Variables**. Como en el Makefile del split: `CC := cc`, `CFLAGS := -Wall -Wextra -std=c11`. Cuando la receta dice `$(CC) $(CFLAGS) -c main.c`, `make` expande las variables y ejecuta `cc -Wall -Wextra -std=c11 -c main.c`. Hay variables predefinidas: `$@` es el target de la regla actual, `$<` es el primer prerrequisito, `$^` es la lista completa de prerrequisitos. Una receta que use estas variables se vuelve más portable:

```
main.o: main.c greet.h
	$(CC) $(CFLAGS) -c $< -o $@
```

Equivale a la versión anterior pero no menciona `main.c` ni `main.o` directamente.

**Reglas implícitas**. `make` tiene reglas predefinidas para producir `.o` a partir de `.c` (con la receta `$(CC) $(CFLAGS) -c $< -o $@`). Si el target sigue ese patrón y los prerrequisitos están bien declarados, la receta puede omitirse. Esto permite simplificar Makefiles, pero también puede ocultar lo que está pasando: en este nivel las recetas se escriben explícitas para no perder de vista qué pasos ejecuta `make`.

## Errores frecuentes en Makefiles incipientes

Cuatro errores típicos al empezar con Makefiles:

- **Receta sin tab inicial**. Mensaje: `Makefile:N: *** missing separator. Stop.`. La receta empezó con espacios. Solución: reemplazar los espacios iniciales por un tab. Editores que convierten tabs a espacios automáticamente son la causa habitual.
- **Dependencias de headers omitidas**. Síntoma: cambiar un header no recompila los `.o` que lo usan, y el ejecutable queda inconsistente. Solución: agregar el header a los prerrequisitos de cada `.o` que lo incluye. Para proyectos grandes existe la flag `-MMD` de gcc que genera automáticamente los archivos de dependencias, contenido más avanzado.
- **Comando que no se ejecuta como se espera**. `make` ejecuta cada línea de la receta en un shell **nuevo**, así que `cd` en una línea no afecta a la siguiente. Solución: combinar comandos con `;` o `&&` en una sola línea, o usar la sintaxis `cd dir && comando`.
- **Reglas phony sin declarar**. Si existe un archivo llamado `clean` en el directorio, `make clean` lo va a tratar como target real con timestamp y puede no ejecutar la receta. Solución: declarar `.PHONY: clean` para forzar que la regla se ejecute siempre.

## El pipeline visto desde `make`

La integración con todo lo anterior del nivel: cada regla del Makefile corresponde a una etapa del pipeline. La receta de `main.o` es exactamente `gcc -c`, que ejecuta preprocesado + compilación + ensamblado y deja un `.o`. La receta de `app` es exactamente la invocación del linker, que toma los dos `.o` y los integra en un ejecutable. Las flags `-Wall`, `-Wextra`, `-std=c11` aparecen en `CFLAGS` y se aplican a las recetas que las usan.

Lo que `make` aporta no es etapas nuevas: es **automatización selectiva** de las etapas que ya se entienden. Cuando un Makefile parece mágico, casi siempre es porque está usando reglas implícitas o variables automáticas que esconden las recetas. Reescribir el Makefile con recetas explícitas suele desmontar la magia: las recetas son los mismos `gcc -c` y `gcc -o` de antes.

Una predicción sobre el Makefile del split, para cerrar el nivel: ¿qué se recompila si se modifica `greet.c`? La cadena de `make` empieza por verificar `app`, ve que depende de `main.o` y `greet.o`, verifica cada uno. `main.o` depende de `main.c` y `greet.h`, ninguno cambió: no se regenera. `greet.o` depende de `greet.c` y `greet.h`; `greet.c` cambió: se regenera. Como `greet.o` cambió, `app` también se regenera. Resultado: dos comandos ejecutados (`gcc -c greet.c` y `gcc main.o greet.o -o app`), uno omitido (`gcc -c main.c`).

Esa capacidad de predecir, mirando un Makefile y un cambio, exactamente qué archivos se van a regenerar, es el cierre operativo del nivel. Con ella instalada, los siguientes proyectos —`mini-make` y otros— no van a sentir el pipeline como caja negra: cada flag, cada regla, cada error tiene un origen identificable en una de las etapas que `L3` recorrió.
