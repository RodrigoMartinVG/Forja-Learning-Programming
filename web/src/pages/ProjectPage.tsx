import { Link, useParams } from "react-router-dom";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { findLevelById, findProjectById } from "@/lib/catalog";
import { NotFoundPage } from "./NotFoundPage";

export function ProjectPage() {
  const { id } = useParams();
  const project = id ? findProjectById(id) : undefined;

  if (!project) {
    return <NotFoundPage />;
  }

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <div>
          <p className="eyebrow">{project.type === "integrating" ? "Integrador" : "Focalizado"}</p>
          <h2>{project.title}</h2>
          <p className="hero-copy">
            Anchor: {project.anchor_level}. Visible en {project.display_levels.join(" · ")}. Lenguajes:{" "}
            {project.languages.length > 0 ? project.languages.join(" + ") : "infraestructura"}.
          </p>
        </div>

        <div className="pill-list">
          {project.display_levels.map((levelId) => {
            const level = findLevelById(levelId);
            return level ? (
              <Link key={levelId} className="pill" to={`/levels/${level.slug}`}>
                {levelId}
              </Link>
            ) : (
              <span key={levelId} className="pill muted-pill">
                {levelId}
              </span>
            );
          })}
        </div>
      </section>

      <section className="panel-grid two-up">
        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">README</p>
            <h3>Estado del proyecto</h3>
          </div>
          <MarkdownArticle content={project.readme} />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Stages</p>
            <h3>Contrato de construccion</h3>
          </div>
          <div className="timeline">
            {project.stages.map((stage) => (
              <article key={stage.id} className="timeline-item">
                <strong>{stage.label}</strong>
                <span>unlock: {stage.unlock_level}</span>
                <small>required: {stage.required_levels.join(" · ")}</small>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <p className="eyebrow">Fases implementadas</p>
          <h3>Contenido ejecutable detectado en el repo</h3>
        </div>
        {project.phases.length === 0 ? (
          <p className="empty-state">Todavia no hay fases materiales dentro de este proyecto.</p>
        ) : (
          <div className="stack-list compact-list">
            {project.phases.map((phase) => (
              <Link key={`${phase.language}-${phase.phase}`} className="list-row" to={`/projects/${project.id}/${phase.language}/${phase.phase}`}>
                <div>
                  <strong>
                    {phase.language} / {phase.phase}
                  </strong>
                  <span>README + Study Guide</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}