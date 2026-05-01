import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="landing-shell">
      <section className="not-found-card">
        <p className="eyebrow">404</p>
        <h1 className="landing-title">Esta ruta no existe dentro del atlas actual.</h1>
        <p className="landing-lede">
          Puedes volver a la landing o entrar directo al workspace para seguir recorriendo niveles y proyectos.
        </p>
        <div className="landing-actions">
          <Link className="button-link" to="/">
            Volver a landing
          </Link>
          <Link className="button-link button-link-muted" to="/workspace">
            Abrir workspace
          </Link>
        </div>
      </section>
    </div>
  );
}