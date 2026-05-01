import { Link, useParams } from "react-router-dom";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { findLevelBySlug, listCrossRefsForLevel, listProjectsForLevel } from "@/lib/catalog";
import { NotFoundPage } from "./NotFoundPage";

export function LevelPage() {
  const { slug } = useParams();
  const level = slug ? findLevelBySlug(slug) : undefined;

  if (!level) {
    return <NotFoundPage />;
  }

  const projects = listProjectsForLevel(level.id);
  const crossRefs = listCrossRefsForLevel(level);

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <div>
          <p className="eyebrow">{level.id}</p>
          <h2>{level.title}</h2>
          <p className="hero-copy">
            Dominio: {level.domain}. Prerequisitos: {level.prerequisites.length > 0 ? level.prerequisites.join(" · ") : "ninguno"}.
          </p>
        </div>
        <div className="pill-list">
          {level.projects.map((projectId) => (
            <span key={projectId} className="pill muted-pill">
              {projectId}
            </span>
          ))}
        </div>
      </section>

      <section className="panel-grid two-up">
        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Teoria</p>
            <h3>README del nivel</h3>
          </div>
          <MarkdownArticle content={level.readme} />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Ejercicios</p>
            <h3>Reserva operativa</h3>
          </div>
          <MarkdownArticle content={level.exercises} />
        </article>
      </section>

      <section className="panel-grid two-up">
        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Proyectos visibles</p>
            <h3>Desbloqueos del nivel</h3>
          </div>
          <div className="stack-list compact-list">
            {projects.map((project) => (
              <Link key={project.id} className="list-row" to={`/projects/${project.id}`}>
                <div>
                  <strong>{project.title}</strong>
                  <span>{project.type === "integrating" ? "Integrador" : "Focalizado"}</span>
                </div>
                <small>{project.languages.length > 0 ? project.languages.join(" + ") : "infra"}</small>
              </Link>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Cross refs</p>
            <h3>Relaciones globales</h3>
          </div>
          {crossRefs.length === 0 ? (
            <p className="empty-state">No hay relaciones globales extra para este nivel todavia.</p>
          ) : (
            <div className="stack-list">
              {crossRefs.map((crossRef) => (
                <article key={`${crossRef.theory}-${crossRef.projects.join("-")}`} className="note-card">
                  <strong>{crossRef.projects.join(" · ")}</strong>
                  {crossRef.note ? <p>{crossRef.note}</p> : null}
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}