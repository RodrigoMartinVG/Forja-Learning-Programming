import { startTransition } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CurriculumMap, type WorkspaceMode, type WorkspaceSelection } from "@/components/CurriculumMap";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import {
  catalog,
  findLevelById,
  findLevelBySlug,
  findProjectById,
  listCrossRefsForLevel,
  listProjectsForLevel,
  type LevelEntry,
} from "@/lib/catalog";

function isLevelEntry(level: LevelEntry | undefined): level is LevelEntry {
  return Boolean(level);
}

function joinOrFallback(values: string[], fallback: string) {
  return values.length > 0 ? values.join(" · ") : fallback;
}

export function WorkspacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultPath = catalog.paths[1] ?? catalog.paths[0];
  const activeMode: WorkspaceMode = searchParams.get("mode") === "focus" ? "focus" : "browse";
  const activePath = catalog.paths.find((path) => path.id === searchParams.get("path")) ?? defaultPath ?? null;

  const rootLevel = catalog.levels[0];

  if (!rootLevel) {
    return null;
  }

  const activePathLevels = activePath
    ? activePath.levels.map(findLevelById).filter(isLevelEntry)
    : catalog.levels.slice(0, 8);

  const selectedProject = searchParams.get("project") ? findProjectById(searchParams.get("project")!) : undefined;
  const fallbackLevel = activePathLevels[0] ?? rootLevel;
  const selectedLevel = selectedProject
    ? undefined
    : (searchParams.get("level") ? findLevelBySlug(searchParams.get("level")!) : undefined) ?? fallbackLevel;
  const selection: WorkspaceSelection = selectedProject
    ? { kind: "project", project: selectedProject }
    : { kind: "level", level: selectedLevel ?? rootLevel };

  const activePhase =
    selection.kind === "project"
      ? selection.project.phases.find(
          (phase) => phase.language === searchParams.get("lang") && phase.phase === searchParams.get("phase"),
        )
      : undefined;

  const levelProjects = selection.kind === "level" ? listProjectsForLevel(selection.level.id) : [];
  const levelCrossRefs = selection.kind === "level" ? listCrossRefsForLevel(selection.level) : [];
  const projectLevels =
    selection.kind === "project" ? selection.project.display_levels.map(findLevelById).filter(isLevelEntry) : [];
  const projectRequiredLevels =
    selection.kind === "project" ? selection.project.required_levels.map(findLevelById).filter(isLevelEntry) : [];

  const focusPlan =
    selection.kind === "level"
      ? [
          selection.level.prerequisites.length > 0
            ? `Verifica prerequisitos: ${selection.level.prerequisites.join(" · ")}.`
            : "No hay prerequisitos declarados; puedes entrar directo.",
          `Lee el README de ${selection.level.id} y extrae el lenguaje tecnico dominante de la unidad.`,
          `Resuelve los ejercicios reservados y enlaza ${levelProjects.length} proyecto(s) del tramo.`,
        ]
      : [
          selection.project.required_levels.length > 0
            ? `Confirma los niveles requeridos: ${selection.project.required_levels.join(" · ")}.`
            : "El proyecto no declara niveles extra por fuera de su ancla.",
          `Usa el README del proyecto para fijar alcance, restricciones y lenguaje(s) de implementacion.`,
          selection.project.phases.length > 0
            ? `Elige una fase material y convierte el workspace en una sesion de ejecucion. Hay ${selection.project.phases.length} fase(s) detectadas.`
            : `Todavia no hay fases materiales; trabaja sobre el contrato de ${selection.project.stages.length} stage(s).`,
        ];

  function updateParams(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([key, value]) => {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });

    startTransition(() => {
      setSearchParams(next);
    });
  }

  function handleSelectLevel(slug: string) {
    updateParams({
      level: slug,
      project: undefined,
      lang: undefined,
      phase: undefined,
    });
  }

  function handleSelectProject(projectId: string) {
    updateParams({
      project: projectId,
      level: undefined,
      lang: undefined,
      phase: undefined,
    });
  }

  function handlePathSelect(pathId: string) {
    const nextPath = catalog.paths.find((path) => path.id === pathId);

    if (!nextPath) {
      return;
    }

    const nextPathLevels = nextPath.levels.map(findLevelById).filter(isLevelEntry);
    const nextDefaultLevel = nextPathLevels[0] ?? catalog.levels[0];
    const keepProject =
      selection.kind === "project" && selection.project.display_levels.some((levelId) => nextPath.levels.includes(levelId));
    const keepLevel = selection.kind === "level" && nextPath.levels.includes(selection.level.id);

    if (keepProject || keepLevel) {
      updateParams({ path: pathId });
      return;
    }

    updateParams({
      path: pathId,
      level: nextDefaultLevel.slug,
      project: undefined,
      lang: undefined,
      phase: undefined,
    });
  }

  function handlePhaseSelect(language: string, phaseId: string) {
    updateParams({
      lang: language,
      phase: phaseId,
    });
  }

  return (
    <div className="workspace-shell">
      <header className="workspace-topbar">
        <div className="workspace-brand">
          <Link className="brand-mark" to="/">
            FORJA
          </Link>
          <div className="workspace-brand-copy">
            <p className="eyebrow">Workspace</p>
            <h1>Atlas curricular con mapa y foco</h1>
          </div>
        </div>

        <div className="workspace-actions">
          <Link className="button-link button-link-ghost" to="/">
            Volver a landing
          </Link>
          <button className="button-link button-link-muted" type="button" onClick={() => updateParams({ mode: "focus" })}>
            Entrar a focus
          </button>
        </div>
      </header>

      <section className="workspace-stat-strip" aria-label="Resumen del tablero">
        <article className="workspace-stat-card">
          <span>Path activo</span>
          <strong>{activePath?.title ?? "Vista completa"}</strong>
        </article>
        <article className="workspace-stat-card">
          <span>Niveles visibles</span>
          <strong>{activePathLevels.length}</strong>
        </article>
        <article className="workspace-stat-card">
          <span>Catalogo</span>
          <strong>{catalog.stats.projects} proyectos</strong>
        </article>
        <article className="workspace-stat-card workspace-stat-card-accent">
          <span>Modo</span>
          <strong>{activeMode === "focus" ? "Focus" : "Navegar"}</strong>
        </article>
      </section>

      <section className="workspace-toolbar">
        <div className="workspace-toolbar-block">
          <p className="eyebrow">Modo</p>
          <div className="workspace-mode-switch" role="group" aria-label="Cambiar modo de trabajo">
            <button
              type="button"
              className={`mode-chip${activeMode === "browse" ? " is-active" : ""}`}
              onClick={() => updateParams({ mode: "browse" })}
            >
              Navegar
            </button>
            <button
              type="button"
              className={`mode-chip${activeMode === "focus" ? " is-active" : ""}`}
              onClick={() => updateParams({ mode: "focus" })}
            >
              Focus
            </button>
          </div>
        </div>

        <div className="workspace-toolbar-block workspace-toolbar-block-wide">
          <p className="eyebrow">Paths</p>
          <div className="path-switcher" role="group" aria-label="Cambiar path del workspace">
            {catalog.paths.map((path) => (
              <button
                key={path.id}
                type="button"
                className={`path-chip${activePath?.id === path.id ? " is-active" : ""}`}
                onClick={() => handlePathSelect(path.id)}
              >
                {path.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="workspace-grid">
        <section className="workspace-map-frame">
          <div className="workspace-panel-head">
            <div>
              <p className="eyebrow">Mapa vivo</p>
              <h2 className="workspace-title">Niveles al centro, proyectos orbitando arriba y abajo.</h2>
              <p className="workspace-subcopy">
                El path activo dibuja una cinta de avance. En modo focus, el mapa baja la saturacion de lo irrelevante
                y deja visibles solo el tramo y las dependencias cercanas.
              </p>
            </div>

            <div className="workspace-map-legend" aria-label="Leyenda del mapa">
              <span className="legend-pill legend-level">Nivel</span>
              <span className="legend-pill legend-focused">Proyecto focalizado</span>
              <span className="legend-pill legend-integrating">Proyecto integrador</span>
            </div>
          </div>

          <div className="workspace-map-scroll">
            <CurriculumMap
              levels={catalog.levels}
              projects={catalog.projects}
              activePathLevels={activePathLevels}
              mode={activeMode}
              selection={selection}
              onSelectLevel={handleSelectLevel}
              onSelectProject={handleSelectProject}
            />
          </div>
        </section>

        <aside className={`workspace-inspector is-${activeMode}`}>
          <div className="workspace-panel-head">
            <div>
              <p className="eyebrow">{activeMode === "focus" ? "Focus" : "Navegacion"}</p>
              <h2 className="workspace-title">{selection.kind === "level" ? selection.level.title : selection.project.title}</h2>
              <p className="workspace-subcopy">
                {selection.kind === "level"
                  ? `${selection.level.id} · ${selection.level.domain} · ${joinOrFallback(selection.level.prerequisites, "sin prerequisitos")}`
                  : `${selection.project.type === "integrating" ? "Proyecto integrador" : "Proyecto focalizado"} · ancla ${selection.project.anchor_level}`}
              </p>
            </div>
          </div>

          <div className="workspace-card-grid">
            <article className="workspace-card workspace-card-accent">
              <p className="eyebrow">Contexto activo</p>
              <h3>{activePath?.title ?? "Vista total"}</h3>
              <p>
                {activeMode === "focus"
                  ? "El inspector se transforma en una sesion de estudio: prerequisitos, contenido y siguiente paso concreto."
                  : "El inspector te deja leer el nodo actual sin perder el mapa general del curriculum."}
              </p>

              <div className="workspace-pill-row">
                {selection.kind === "level" ? (
                  <>
                    <span className="meta-pill">{selection.level.id}</span>
                    <span className="meta-pill">{selection.level.projects.length} proyectos</span>
                    <span className="meta-pill">{selection.level.domain}</span>
                  </>
                ) : (
                  <>
                    <span className="meta-pill">{selection.project.anchor_level}</span>
                    <span className="meta-pill">{selection.project.stages.length} stage(s)</span>
                    <span className="meta-pill">
                      {selection.project.languages.length > 0 ? selection.project.languages.join(" + ") : "infra"}
                    </span>
                  </>
                )}
              </div>
            </article>

            <article className="workspace-card">
              <p className="eyebrow">Saltos rapidos</p>
              <h3>{selection.kind === "level" ? "Proyectos del tramo" : "Niveles relacionados"}</h3>

              <div className="workspace-list">
                {selection.kind === "level"
                  ? levelProjects.slice(0, 6).map((project) => (
                      <button
                        key={project.id}
                        className="workspace-list-button"
                        type="button"
                        onClick={() => handleSelectProject(project.id)}
                      >
                        <strong>{project.title}</strong>
                        <span>{project.type === "integrating" ? "Integrador" : "Focalizado"}</span>
                      </button>
                    ))
                  : projectLevels.map((level) => (
                      <button
                        key={level.id}
                        className="workspace-list-button"
                        type="button"
                        onClick={() => handleSelectLevel(level.slug)}
                      >
                        <strong>{level.id}</strong>
                        <span>{level.title}</span>
                      </button>
                    ))}
              </div>

              {selection.kind === "level" && levelProjects.length === 0 ? <p className="workspace-empty">No hay proyectos visibles para este nivel.</p> : null}
            </article>
          </div>

          {activeMode === "browse" ? (
            <>
              <article className="workspace-card">
                <p className="eyebrow">Contenido</p>
                <h3>{selection.kind === "level" ? "README del nivel" : "README del proyecto"}</h3>
                <MarkdownArticle content={selection.kind === "level" ? selection.level.readme : selection.project.readme} />
              </article>

              <article className="workspace-card">
                <p className="eyebrow">Contexto extendido</p>
                <h3>{selection.kind === "level" ? "Ejercicios y cross refs" : "Stages y fases"}</h3>

                {selection.kind === "level" ? (
                  <>
                    <MarkdownArticle content={selection.level.exercises} />
                    {levelCrossRefs.length > 0 ? (
                      <div className="workspace-pill-row">
                        {levelCrossRefs.map((crossRef) => (
                          <span key={`${crossRef.theory}-${crossRef.projects.join("-")}`} className="meta-pill">
                            {crossRef.projects.join(" · ")}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="workspace-pill-row">
                      {selection.project.stages.map((stage) => (
                        <span key={stage.id} className="meta-pill">
                          {stage.label} · {stage.unlock_level}
                        </span>
                      ))}
                    </div>
                    {selection.project.phases.length > 0 ? (
                      <div className="workspace-phase-grid">
                        {selection.project.phases.map((phase) => (
                          <button
                            key={`${phase.language}-${phase.phase}`}
                            type="button"
                            className={`phase-chip${activePhase?.language === phase.language && activePhase.phase === phase.phase ? " is-selected" : ""}`}
                            onClick={() => handlePhaseSelect(phase.language, phase.phase)}
                          >
                            {phase.language} / {phase.phase}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="workspace-empty">No hay fases materiales cargadas todavia.</p>
                    )}
                  </>
                )}
              </article>
            </>
          ) : (
            <>
              <article className="workspace-card">
                <p className="eyebrow">Plan de sesion</p>
                <h3>{selection.kind === "level" ? "Como estudiar esta unidad" : "Como atacar este proyecto"}</h3>
                <ol className="workspace-bullets">
                  {focusPlan.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </article>

              {selection.kind === "level" ? (
                <>
                  <article className="workspace-card">
                    <p className="eyebrow">Lectura base</p>
                    <h3>README del nivel</h3>
                    <MarkdownArticle content={selection.level.readme} />
                  </article>

                  <article className="workspace-card">
                    <p className="eyebrow">Trabajo activo</p>
                    <h3>Ejercicios y proyectos desbloqueados</h3>
                    <MarkdownArticle content={selection.level.exercises} />

                    <div className="workspace-list">
                      {levelProjects.map((project) => (
                        <button
                          key={project.id}
                          className="workspace-list-button"
                          type="button"
                          onClick={() => handleSelectProject(project.id)}
                        >
                          <strong>{project.title}</strong>
                          <span>{project.display_levels.join(" · ")}</span>
                        </button>
                      ))}
                    </div>
                  </article>
                </>
              ) : (
                <>
                  <article className="workspace-card">
                    <p className="eyebrow">Brief</p>
                    <h3>README del proyecto</h3>
                    <MarkdownArticle content={selection.project.readme} />
                  </article>

                  <article className="workspace-card">
                    <p className="eyebrow">Condiciones de entrada</p>
                    <h3>Niveles requeridos y stages</h3>
                    <div className="workspace-pill-row">
                      {projectRequiredLevels.length > 0 ? (
                        projectRequiredLevels.map((level) => (
                          <button key={level.id} type="button" className="meta-pill" onClick={() => handleSelectLevel(level.slug)}>
                            {level.id}
                          </button>
                        ))
                      ) : (
                        <span className="meta-pill">Sin niveles extra</span>
                      )}
                    </div>

                    <div className="workspace-pill-row">
                      {selection.project.stages.map((stage) => (
                        <span key={stage.id} className="meta-pill">
                          {stage.label} · {stage.required_levels.join(" · ")}
                        </span>
                      ))}
                    </div>
                  </article>

                  {selection.project.phases.length > 0 ? (
                    <article className="workspace-card">
                      <p className="eyebrow">Fases</p>
                      <h3>{activePhase ? `${activePhase.language} / ${activePhase.phase}` : "Selecciona una fase"}</h3>
                      <div className="workspace-phase-grid">
                        {selection.project.phases.map((phase) => (
                          <button
                            key={`${phase.language}-${phase.phase}`}
                            type="button"
                            className={`phase-chip${activePhase?.language === phase.language && activePhase.phase === phase.phase ? " is-selected" : ""}`}
                            onClick={() => handlePhaseSelect(phase.language, phase.phase)}
                          >
                            {phase.language} / {phase.phase}
                          </button>
                        ))}
                      </div>

                      {activePhase ? (
                        <div className="workspace-focus-phase">
                          <MarkdownArticle content={activePhase.readme} />
                          <MarkdownArticle content={activePhase.studyGuide} />
                        </div>
                      ) : null}
                    </article>
                  ) : null}
                </>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}