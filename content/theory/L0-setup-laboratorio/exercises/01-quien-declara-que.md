# Ejercicio 01 — Quién declara qué

## Contexto

El [capítulo 01](../chapters/01-devcontainer.md) presentó cinco piezas del laboratorio y, dentro de la primera (los archivos del repo), distinguió dos roles que conviven en `.devcontainer/`: `devcontainer.json` declara *cómo se usa* el contenedor desde VS Code (qué imagen, qué extensiones, qué configuración), y `Dockerfile` declara *qué hay adentro* del contenedor (qué paquetes, qué herramientas, qué usuario). La distinción es fácil de leer en abstracto y fácil de confundir cuando se está mirando un archivo concreto.

Este ejercicio fija la distinción con un análisis directo de los dos archivos del repo.

## Consigna

1. Abrir los archivos `.devcontainer/devcontainer.json` y `.devcontainer/Dockerfile` del repo, mirando cada uno por separado.
2. Para cada uno de los siguientes elementos, decidir en cuál de los dos archivos vive y, si vive en alguno, copiar la línea o bloque exacto donde aparece:
   - La imagen base sobre la que se construye el contenedor.
   - El usuario por defecto dentro del contenedor.
   - Las extensiones de VS Code que se instalan automáticamente.
   - El comando que instala `gcc` y `clang`.
   - La instrucción de remontar el workspace en `/workspaces/...`.
3. Producir una tabla con tres columnas: *elemento*, *archivo* (`devcontainer.json`, `Dockerfile`, o *"ninguno"*), *evidencia textual* (la línea exacta).

## Resultado esperado

Una tabla de cinco filas. Cada fila debe tener la columna *evidencia* con un fragmento literal del archivo, no una paráfrasis.

## Verificación

La distinción correcta para los cinco elementos es: imagen base → `Dockerfile` (instrucción `FROM`); usuario por defecto → `Dockerfile` (instrucción `USER` o equivalente, posiblemente referenciado desde `devcontainer.json` con `remoteUser`); extensiones → `devcontainer.json` (clave `customizations.vscode.extensions`); instalación de `gcc`/`clang` → `Dockerfile` (instrucción `RUN apt-get install ...`); remontaje de workspace → ninguno explícitamente, porque VS Code lo hace por defecto cuando se abre un repo con `.devcontainer/` (puede aparecer un `workspaceMount` en `devcontainer.json` solo si se sobrescribe el comportamiento por defecto).

Si una fila se contestó con un archivo distinto al esperado, el problema no es el ejercicio: es que la distinción entre los dos roles todavía no se sostiene. Releer la sección sobre `.devcontainer/` del [capítulo 01](../chapters/01-devcontainer.md) y repetir la clasificación.

## Criterio de finalización

Las cinco filas tienen evidencia textual literal y archivo correcto. La fila *"remontaje del workspace"* explica por qué no aparece en ninguno de los dos.
