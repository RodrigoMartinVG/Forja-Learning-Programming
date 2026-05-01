import { NavLink, Outlet } from "react-router-dom";
import { catalog } from "@/lib/catalog";

export function Shell() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-lockup">
          <p className="brand-kicker">Forja</p>
          <h1 className="brand-title">Plataforma de aprendizaje de programacion de sistemas</h1>
          <p className="brand-copy">
            Navegacion estatica renderizada desde el propio repo: teoria, proyectos, fases y caminos.
          </p>
        </div>

        <nav className="main-nav" aria-label="Navegacion principal">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/paths">Caminos</NavLink>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            Repo
          </a>
        </nav>

        <div className="header-stats" aria-label="Resumen del catalogo">
          <div>
            <span>niveles</span>
            <strong>{catalog.stats.levels}</strong>
          </div>
          <div>
            <span>proyectos</span>
            <strong>{catalog.stats.projects}</strong>
          </div>
          <div>
            <span>paths</span>
            <strong>{catalog.stats.paths}</strong>
          </div>
        </div>
      </header>

      <main className="page-frame">
        <Outlet />
      </main>
    </div>
  );
}