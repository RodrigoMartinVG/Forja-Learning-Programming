import { Link } from "react-router-dom";
import { catalog } from "@/lib/catalog";

export function LandingPage() {
  const defaultPath = catalog.paths[1] ?? catalog.paths[0];

  return (
    <div className="landing-shell">
      <main className="landing-minimal">
        <p className="landing-mark">FORJA</p>

        <div className="landing-grid">
          <section className="landing-copy">
            <p className="landing-discipline">C / Rust / Unix / Memory / Concurrency / Compilers / Kernel</p>
            <h1 className="landing-title">Forja es un mapa de aprendizaje para programacion de sistemas.</h1>
            <p className="landing-lede">
              Reune teoria y proyectos practicos sobre C, Rust, memoria, procesos, concurrencia, redes,
              compiladores y kernel space. La landing lo presenta. El workspace abre el indice y el contenido de una
              unidad.
            </p>
            <p className="landing-stats">
              {catalog.stats.levels} niveles / {catalog.stats.projects} proyectos / {catalog.stats.paths} trayectos
            </p>

            <div className="landing-actions">
              <Link className="button-link" to={defaultPath ? `/workspace?path=${defaultPath.id}` : "/workspace"}>
                Abrir workspace
              </Link>
            </div>
          </section>

          <aside className="landing-outline" aria-label="Resumen estructural del proyecto">
            <div className="landing-outline-block">
              <span className="landing-outline-label">Scope</span>
              <p>C, Rust, sistemas operativos, memoria, IPC, networking, parsers, interpretes, codegen y kernel.</p>
            </div>

            <div className="landing-outline-block">
              <span className="landing-outline-label">Structure</span>
              <pre>{`content/theory\ncontent/projects\nmetadata\nweb/workspace`}</pre>
            </div>

            <div className="landing-outline-block">
              <span className="landing-outline-label">Method</span>
              <p>Leer teoria, abrir proyecto, estudiar una unidad y avanzar por fases.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}