import { Link } from "react-router-dom";
import { catalog, findLevelById } from "@/lib/catalog";

export function PathsPage() {
  return (
    <div className="page-stack">
      <section className="panel page-intro">
        <p className="eyebrow">Navegacion</p>
        <h2>Cuatro recorridos para entrar al mismo repo</h2>
        <p>
          Los caminos viven en `metadata/paths.yaml` y la UI los renderiza sin una capa manual intermedia. Cada
          path muestra la secuencia declarada y deja saltar a cualquier nivel ya sembrado.
        </p>
      </section>

      <section className="card-grid">
        {catalog.paths.map((path) => (
          <article key={path.id} className="panel path-panel">
            <div className="panel-heading">
              <p className="eyebrow">{path.id}</p>
              <h3>{path.title}</h3>
            </div>
            <p>{path.description}</p>
            <div className="pill-list">
              {path.levels.map((levelId) => {
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
          </article>
        ))}
      </section>
    </div>
  );
}