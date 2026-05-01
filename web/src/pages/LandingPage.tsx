import { Link } from "react-router-dom";
import { catalog, findLevelById, type LevelEntry } from "@/lib/catalog";

function isLevelEntry(level: LevelEntry | undefined): level is LevelEntry {
  return Boolean(level);
}

export function LandingPage() {
  const primaryPath = catalog.paths[1] ?? catalog.paths[0];
  const previewLevels = primaryPath
    ? primaryPath.levels.map(findLevelById).filter(isLevelEntry).slice(0, 8)
    : catalog.levels.slice(0, 8);
  const previewProjects = catalog.projects
    .filter((project) => (primaryPath ? project.display_levels.some((levelId) => primaryPath.levels.includes(levelId)) : true))
    .slice(0, 8);

  return (
    <div className="landing-shell">
      <header className="landing-nav">
        <Link className="brand-mark" to="/">
          FORJA
        </Link>

        <nav className="landing-nav-group" aria-label="Navegacion de la landing">
          <a href="#surfaces">Surfaces</a>
          <a href="#paths">Paths</a>
          <Link className="button-link button-link-ghost" to="/workspace">
            Abrir workspace
          </Link>
        </nav>
      </header>

      <main className="landing-stack">
        <section className="landing-hero">
          <div className="landing-copy">
            <p className="eyebrow">Atlas operativo para aprender sistemas</p>
            <h1 className="landing-title">
              La landing orienta. El workspace ejecuta con mapa, dependencias y modo focus.
            </h1>
            <p className="landing-lede">
              Forja deja de parecer una lista plana de Markdown. La portada muestra el recorrido, los tracks y la
              promesa del sistema. El workspace baja al terreno: niveles, proyectos y cambio de modo entre navegar y
              estudiar una unidad o proyecto con menos ruido.
            </p>

            <div className="landing-actions">
              <Link className="button-link" to={primaryPath ? `/workspace?path=${primaryPath.id}` : "/workspace"}>
                Entrar al workspace
              </Link>
              {previewLevels[0] ? (
                <Link className="button-link button-link-muted" to={`/workspace?mode=focus&level=${previewLevels[0].slug}`}>
                  Abrir primera unidad en focus
                </Link>
              ) : null}
            </div>

            <div className="landing-metrics">
              <article className="metric-card">
                <span>Niveles</span>
                <strong>{catalog.stats.levels}</strong>
              </article>
              <article className="metric-card">
                <span>Proyectos</span>
                <strong>{catalog.stats.projects}</strong>
              </article>
              <article className="metric-card">
                <span>Paths</span>
                <strong>{catalog.stats.paths}</strong>
              </article>
              <article className="metric-card metric-card-accent">
                <span>Modo</span>
                <strong>Navegar / Focus</strong>
              </article>
            </div>
          </div>

          <div className="landing-atlas">
            <article className="atlas-preview-card atlas-preview-card-primary">
              <p className="eyebrow">Landing</p>
              <h2>Portada editorial con intencion</h2>
              <p>
                Presenta la vision del curriculum, las entradas recomendadas y la diferencia entre recorrer el atlas y
                sentarse a estudiar una pieza concreta.
              </p>
            </article>

            <article className="atlas-preview-card atlas-preview-card-contrast">
              <p className="eyebrow">Workspace</p>
              <h2>Mapa vivo, no menu lateral</h2>
              <p>
                Los niveles y proyectos se ven como nodos conectados. El path activo colorea el trayecto y el modo
                focus atenúa el resto para reducir el ruido visual.
              </p>
            </article>

            <div className="atlas-path-preview">
              <div className="landing-section-head compact-head">
                <div>
                  <p className="eyebrow">Path recomendado</p>
                  <h3>{primaryPath?.title ?? "Ruta inicial"}</h3>
                </div>
                <span>{primaryPath?.levels.length ?? 0} niveles</span>
              </div>

              <div className="path-level-track">
                {previewLevels.map((level) => (
                  <span key={level.id} className="path-level-pill">
                    {level.id}
                  </span>
                ))}
              </div>
            </div>

            <div className="atlas-preview-grid" aria-label="Vista previa de proyectos">
              {previewProjects.map((project) => (
                <div key={project.id} className="atlas-preview-chip">
                  <strong>{project.title}</strong>
                  <span>{project.type === "integrating" ? "Integrador" : "Focalizado"}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="surfaces" className="landing-section">
          <div className="landing-section-head">
            <div>
              <p className="eyebrow">Dos superficies, una sola narrativa</p>
              <h2>La portada seduce. El tablero organiza la ejecución.</h2>
            </div>
            <p>
              La web deja de ser genérica cuando cada superficie hace algo distinto: entrada emocional arriba, mapa y
              sesión de trabajo abajo.
            </p>
          </div>

          <div className="surface-grid">
            <article className="surface-card">
              <span className="surface-number">01</span>
              <h3>Landing con voz propia</h3>
              <p>
                Hero editorial, paths recomendados, lenguaje visual fuerte y una promesa clara: no entras a leer una
                wiki, entras a una ruta de formación técnica con identidad.
              </p>
            </article>

            <article className="surface-card">
              <span className="surface-number">02</span>
              <h3>Workspace como mapa</h3>
              <p>
                Un grafo horizontal con niveles al centro y proyectos orbitando arriba y abajo. El path seleccionado se
                ilumina y el inspector contextualiza lo que ves.
              </p>
            </article>

            <article className="surface-card">
              <span className="surface-number">03</span>
              <h3>Modo focus por unidad o proyecto</h3>
              <p>
                El tablero cambia de función: baja la saturación del mapa y convierte el panel derecho en una sesión de
                estudio con prerequisitos, contenido, ejercicios o stages.
              </p>
            </article>
          </div>
        </section>

        <section id="paths" className="landing-section path-gallery">
          <div className="landing-section-head">
            <div>
              <p className="eyebrow">Rutas de entrada</p>
              <h2>El path ya no es una nota: es un preset del workspace.</h2>
            </div>
            <p>
              Cada path abre el mapa con un filtro distinto. No cambia la verdad del curriculum, cambia el lente desde
              el que entras a recorrerlo.
            </p>
          </div>

          <div className="path-gallery-grid">
            {catalog.paths.map((path) => {
              const firstLevel = path.levels.map(findLevelById).filter(isLevelEntry)[0];

              return (
                <article key={path.id} className="path-card">
                  <div className="path-card-head">
                    <p className="eyebrow">{path.id}</p>
                    <h3>{path.title}</h3>
                  </div>

                  <p>{path.description}</p>

                  <div className="path-level-track">
                    {path.levels.slice(0, 8).map((levelId) => (
                      <span key={levelId} className="path-level-pill">
                        {levelId}
                      </span>
                    ))}
                  </div>

                  <div className="path-card-footer">
                    <span>{path.levels.length} niveles declarados</span>
                    <Link
                      className="path-launch"
                      to={firstLevel ? `/workspace?path=${path.id}&level=${firstLevel.slug}` : `/workspace?path=${path.id}`}
                    >
                      Abrir path
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="landing-cta-band">
          <div>
            <p className="eyebrow">Salida al tablero</p>
            <h2>El siguiente paso ya no es “leer más”. Es abrir el mapa y trabajar.</h2>
          </div>

          <div className="landing-actions">
            <Link className="button-link" to={primaryPath ? `/workspace?path=${primaryPath.id}` : "/workspace"}>
              Entrar al workspace
            </Link>
            <Link className="button-link button-link-ghost" to="/workspace?mode=focus">
              Ver modo focus
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}