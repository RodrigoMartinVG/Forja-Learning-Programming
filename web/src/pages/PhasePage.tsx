import { useParams } from "react-router-dom";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import { findProjectById } from "@/lib/catalog";
import { NotFoundPage } from "./NotFoundPage";

export function PhasePage() {
  const { id, lang, phase } = useParams();
  const project = id ? findProjectById(id) : undefined;
  const phaseEntry = project?.phases.find((entry) => entry.language === lang && entry.phase === phase);

  if (!project || !phaseEntry) {
    return <NotFoundPage />;
  }

  return (
    <div className="page-stack">
      <section className="hero-panel compact-hero">
        <div>
          <p className="eyebrow">{project.title}</p>
          <h2>
            {lang} / {phase}
          </h2>
          <p className="hero-copy">Lectura directa del contenido de fase sembrado dentro del repositorio.</p>
        </div>
      </section>

      <section className="panel-grid two-up">
        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">README</p>
            <h3>Descripcion de la fase</h3>
          </div>
          <MarkdownArticle content={phaseEntry.readme} />
        </article>
        <article className="panel">
          <div className="panel-heading">
            <p className="eyebrow">Study Guide</p>
            <h3>Recorrido sugerido</h3>
          </div>
          <MarkdownArticle content={phaseEntry.studyGuide} />
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <p className="eyebrow">Improvements</p>
          <h3>Siguientes pasos</h3>
        </div>
        <MarkdownArticle content={phaseEntry.improvements} />
      </section>
    </div>
  );
}