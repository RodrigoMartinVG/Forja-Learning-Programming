# Workflow del día cero

Una buena parte de L0 consiste en fijar una rutina corta y repetible. Si el arranque del laboratorio depende de pasos vagos, los errores se esconden fácil.

Esa rutina parte de una condición obligatoria para todo el curso: el repo tiene que estar abierto en la IDE y el devcontainer de ese mismo repo tiene que estar operativo. Si una persona solo mira la web o solo lee Markdown fuera de ese entorno, se pierde una parte central del método.

## Secuencia mínima de arranque

La rutina base de Forja para abrir el laboratorio es:

1. abrir el repo desde VS Code
2. entrar al devcontainer
3. abrir una terminal dentro del contenedor
4. correr `bash verify-setup.sh`
5. hacer un sanity check manual con algunas herramientas clave

El paso 5 importa porque el script resume, pero no reemplaza, el modelo mental del entorno.

## Verificación con verify-setup.sh

`verify-setup.sh` cumple una función muy concreta: decirte rápido si el piso mínimo del laboratorio está presente.

Lo útil no es solo el exit code. Lo útil es entender:

- qué herramientas chequea
- cómo reporta `[ok]` y `[fail]`
- qué parte del entorno queda fuera del chequeo

Si una herramienta esperada no aparece ahí, eso no significa que esté prohibida. Significa que todavía no forma parte del contrato base y tal vez deba agregarse en `devcontainer-setup`.

Una inspección rápida útil es esta:

```bash
bash verify-setup.sh | sed -n '1,8p'
grep -n '^run_check' verify-setup.sh | sed -n '1,8p'
```

La primera salida muestra el estado observado. La segunda muestra el contrato que produce ese estado.

## Un primer sanity check manual

Después del script conviene hacer una comprobación manual mínima. Por ejemplo:

```bash
bash content/theory/L0-setup-laboratorio/src/toolchain_snapshot.sh
```

Ese snapshot no reemplaza la verificación oficial; sirve para mirar el entorno con más contexto y dejar un punto de comparación cuando algo cambia.

## Qué evidencia conviene guardar

L0 también entrena una costumbre útil: dejar evidencia corta cuando el entorno falla o cambia.

Ejemplos útiles:

- salida de `verify-setup.sh`
- versión de una herramienta clave antes y después de un rebuild
- nota breve sobre qué archivo cambiaste y por qué hiciste rebuild

Eso simplifica mucho la conversación técnica cuando un problema reaparece más adelante.