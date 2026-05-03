# Metadata Global

Este directorio queda reservado para la metadata global que no se derive de forma directa del contenido local.

## Estado actual

- `levels.yaml`: catalogo canonico de niveles `L0-L57`
- `paths.yaml`: vistas de enfasis sobre ese canon; no reemplazan prerequisitos ni cambian el orden base
- `cross-refs.yaml`: relaciones teoria <-> proyectos y notas transversales

La metadata global ya existe como infraestructura material del repo actual. No esta "en siembra": ya es parte del producto y de la navegacion que consume la web.

## Regla importante

La fuente de verdad canonica de niveles vive aqui, en `levels.yaml`.

La metadata local de cada nivel y de cada proyecto sigue viviendo junto al contenido mediante `meta.yaml` y `project.yaml`, pero `meta.yaml` replica la informacion estructural de `levels.yaml` para mantener autocontenida cada carpeta de nivel.

Del mismo modo, `project.yaml` es la fuente de verdad local de cada proyecto: niveles asociados, prerequisitos, tags y fases o tramos visibles.

## Generacion y mantenimiento

- `metadata/levels.yaml` fija ids, slugs, prerequisitos y `theory_dir` canonicos para la web.
- `paths.yaml` y `cross-refs.yaml` complementan el catalogo de niveles con relaciones globales.
- La metadata local complementa al contenido del nivel o del proyecto; no reemplaza al catalogo canonico de niveles.

## Politica editorial

- `metadata/` puede existir completa antes de que toda la authoria real de `content/` exista.
- Un nivel o proyecto puede estar presente en metadata y seguir en placeholder estructural honesto dentro de `content/`.
- La metadata no debe fingir material inexistente: solo estructura, relaciones y orden real del canon.
