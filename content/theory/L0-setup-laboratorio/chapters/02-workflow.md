# Workflow del dia cero

Una buena parte de L0 consiste en fijar una rutina corta y repetible. Si el arranque del laboratorio depende de pasos vagos, los errores se esconden facil.

Esa rutina parte de una condicion obligatoria para todo el curso: el repo tiene que estar abierto en la IDE y el devcontainer de ese mismo repo tiene que estar operativo. Si una persona solo mira la web o solo lee Markdown fuera de ese entorno, se pierde una parte central del metodo.

## Secuencia minima de arranque

La rutina base de Forja para abrir el laboratorio es:

1. abrir el repo desde VS Code
2. entrar al devcontainer
3. abrir una terminal dentro del contenedor
4. correr `bash verify-setup.sh`
5. hacer un sanity check manual con algunas herramientas clave

El paso 5 importa porque el script resume, pero no reemplaza, el modelo mental del entorno.

## Verificacion con verify-setup.sh

`verify-setup.sh` cumple una funcion muy concreta: decirte rapido si el piso minimo del laboratorio esta presente.

Lo util no es solo el exit code. Lo util es entender:

- que herramientas chequea
- como reporta `[ok]` y `[fail]`
- que parte del entorno queda fuera del chequeo

Si una herramienta esperada no aparece ahi, eso no significa que este prohibida. Significa que todavia no forma parte del contrato base y tal vez deba agregarse en `devcontainer-setup`.

Una inspeccion rapida util es esta:

```bash
bash verify-setup.sh | sed -n '1,8p'
grep -n '^run_check' verify-setup.sh | sed -n '1,8p'
```

La primera salida muestra el estado observado. La segunda muestra el contrato que produce ese estado.

## Un primer sanity check manual

Despues del script conviene hacer una comprobacion manual minima. Por ejemplo:

```bash
bash content/theory/L0-setup-laboratorio/src/toolchain_snapshot.sh
```

Ese snapshot no reemplaza la verificacion oficial; sirve para mirar el entorno con mas contexto y dejar un punto de comparacion cuando algo cambia.

## Que evidencia conviene guardar

L0 tambien entrena una costumbre util: dejar evidencia corta cuando el entorno falla o cambia.

Ejemplos utiles:

- salida de `verify-setup.sh`
- version de una herramienta clave antes y despues de un rebuild
- nota breve sobre que archivo cambiaste y por que hiciste rebuild

Eso simplifica mucho la conversacion tecnica cuando un problema reaparece mas adelante.