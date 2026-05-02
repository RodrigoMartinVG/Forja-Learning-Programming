# Metadata Global

Este directorio queda reservado para la metadata global que no se derive de forma directa del contenido local.

## Archivos actuales de Base 2

- `levels.yaml`: catalogo canonico de niveles `L0-L49`
- `paths.yaml`: los cuatro caminos de navegacion
- `cross-refs.yaml`: relaciones teoria <-> proyectos y notas transversales

## Regla importante

La fuente de verdad canonica de niveles vive aqui, en `levels.yaml`.

La metadata local de cada nivel y de cada proyecto sigue viviendo junto al contenido mediante `meta.yaml` y `project.yaml`, pero `meta.yaml` replica la informacion estructural de `levels.yaml` para mantener autocontenida cada carpeta de nivel.

## Generacion y mantenimiento

- `metadata/levels.yaml` fija ids, slugs, prerequisitos y `theory_dir` canonicos para la web.
- `paths.yaml` y `cross-refs.yaml` complementan el catalogo de niveles con relaciones globales.
- La metadata local complementa al contenido del nivel o del proyecto; no reemplaza al catalogo canonico de niveles.
