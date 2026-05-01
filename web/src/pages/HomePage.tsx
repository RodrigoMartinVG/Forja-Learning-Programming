import { Link } from "react-router-dom";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { catalog } from "@/lib/catalog";

export function HomePage() {
  const firstLevels = catalog.levels.slice(0, 6);
  const featuredProjects = catalog.projects.slice(0, 8);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Base 2</p>
          <h2>El repo ya puede renderizar su propio mapa curricular.</h2>
          <p className="hero-copy">
            La web lee Markdown y YAML directamente desde `content/` y `metadata/`. No hay backend ni indices
            editados a mano: la navegacion sale del contenido local sembrado por el scaffolder.
          </p>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span>Niveles</span>
            <strong>{catalog.stats.levels}</strong>
          </article>
          <article className="stat-card">
            <span>Proyectos</span>
            <strong>{catalog.stats.projects}</strong>
          </article>
          <article className="stat-card">
            <span>Paths</span>
            <strong>{catalog.stats.paths}</strong>
          </article>
          <article className="stat-card accent-card">
            <span>Fases detectadas</span>
            <strong>{catalog.stats.phases}</strong>
          </article>
        </div>
      </section>

      <section className="panel-grid two-up">
        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Que es Forja</p>
            <h3>Resumen desde el README principal</h3>
          </div>
          <MarkdownArticle content={catalog.repoLead} />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Caminos sugeridos</p>
            <h3>Entradas rapidas al plan</h3>
          </div>
          <div className="stack-list">
            {catalog.paths.map((path) => (
              <Link key={path.id} className="path-card" to="/paths">
                <strong>{path.title}</strong>
                <span>{path.description}</span>
                <small>{path.levels.length} niveles</small>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="panel-grid two-up">
        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Primeros niveles</p>
            <h3>Entrada recomendada</h3>
          </div>
          <div className="stack-list compact-list">
            {firstLevels.map((level) => (
              <Link key={level.id} className="list-row" to={`/levels/${level.slug}`}>
                <div>
                  <strong>{level.id}</strong>
                  <span>{level.title}</span>
                </div>
                <small>{level.projects.length} proyectos</small>
              </Link>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Catalogo vivo</p>
            <h3>Proyectos listos para abrir</h3>
          </div>
          <div className="stack-list compact-list">
            {featuredProjects.map((project) => (
              <Link key={project.id} className="list-row" to={`/projects/${project.id}`}>
                <div>
                  <strong>{project.title}</strong>
                  <span>{project.type === "integrating" ? "Integrador" : "Focalizado"}</span>
                </div>
                <small>{project.display_levels.join(" · ")}</small>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}