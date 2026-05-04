# Ejercicio 04 — Provocar y restaurar un check fallando

## Contexto

`verify-setup.sh` ha venido pasando hasta acá como una caja que, en condiciones normales, devuelve todo `[ok]`. Esa estabilidad es buena señal pero también esconde el comportamiento del script bajo fallo, que es el que más importa cuando algo realmente sale mal. El [capítulo 03](../chapters/03-verify-setup.md) y el [capítulo 05](../chapters/05-diagnostico.md) discutieron cómo se ve un fallo en abstracto. Este ejercicio lo provoca de manera controlada para verlo en concreto, y después restaura todo a su estado original.

El cambio que se va a introducir es trivial y reversible. La habilidad que se ejercita es disciplinada: provocar un fallo de manera tal que se sepa cómo deshacerlo antes de hacerlo.

## Consigna

1. Antes de tocar nada, ejecutar `bash ./verify-setup.sh` y guardar la salida completa en un archivo `salida-antes.txt`.
2. Elegir una herramienta no crítica que el script verifica (por ejemplo, `hyperfine` o `jq` o `yq`). No elegir compiladores ni `gdb`.
3. Modificar temporalmente el `PATH` de la sesión actual de manera que esa herramienta deje de ser encontrable, sin desinstalar nada. Una forma:
   ```bash
   $ export PATH="$(echo "$PATH" | sed 's|/usr/local/bin:||')"
   ```
   Adaptar la modificación según dónde esté instalada la herramienta elegida (usar el `which` previo del [ejercicio 02](02-disponibilidad-toolchain.md) para saberlo).
4. Confirmar el efecto con `which <herramienta>`: debe devolver vacío o error.
5. Volver a correr `bash ./verify-setup.sh` y guardar la salida en `salida-fallo.txt`.
6. Comparar `salida-antes.txt` y `salida-fallo.txt` con `diff` y registrar la diferencia.
7. Cerrar la terminal (o reabrir una nueva) para que el `PATH` modificado deje de tener efecto.
8. Volver a correr `bash ./verify-setup.sh` y comprobar que la salida vuelve a ser igual a `salida-antes.txt`.

## Resultado esperado

Tres archivos: `salida-antes.txt`, `salida-fallo.txt`, y la salida del `diff` entre ambos. Más una nota corta describiendo qué herramienta se eligió, qué se modificó del `PATH`, y qué línea de la salida del script cambió de `[ok]` a `[fail]`.

## Verificación

El `diff` debe mostrar exactamente una línea cambiada: la fila correspondiente a la herramienta elegida, que pasa de `[ok]` a `[fail]`. El resto de las filas debe quedar idéntico. Si el `diff` muestra más cambios, la modificación de `PATH` afectó a más herramientas que la elegida (porque el directorio retirado contenía varias), y eso es información válida: confirma que esas herramientas comparten directorio.

Después de cerrar la terminal, la salida del script debe volver a ser idéntica a `salida-antes.txt`. Si no vuelve, el cambio no fue puramente de sesión y hay que revisar si algo se modificó fuera (un `~/.bashrc`, por ejemplo). Esa revisión también es parte del ejercicio si ocurre.

## Criterio de finalización

Los tres archivos existen, el `diff` muestra cambio mínimo y reversible, y la salida después de cerrar la terminal vuelve al estado original. Si la reversión requirió algo más que cerrar la terminal, queda anotado qué se hizo y por qué.
