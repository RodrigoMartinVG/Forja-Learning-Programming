import { startTransition } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CurriculumMap, type WorkspaceMode, type WorkspaceSelection } from "@/components/CurriculumMap";
import { MarkdownArticle } from "@/components/MarkdownArticle";
import {
  catalog,
  findLevelById,
  findLevelBySlug,
  findProjectById,
  listProjectsForLevel,
  type LevelEntry,
} from "@/lib/catalog";

function isLevelEntry(level: LevelEntry | undefined): level is LevelEntry {
  return Boolean(level);
}

function joinValues(values: string[], fallback: string) {
  return values.length > 0 ? values.join(" / ") : fallback;
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
    : catalog.levels;

  const selectedProject = searchParams.get("project") ? findProjectById(searchParams.get("project")!) : undefined;
  const fallbackLevel = activePathLevels[0] ?? rootLevel;
  const selectedLevel = selectedProject
    ? undefined
    : (searchParams.get("level") ? findLevelBySlug(searchParams.get("level")!) : undefined) ?? fallbackLevel;
  const selection: WorkspaceSelection = selectedProject
    ? { kind: "project", project: selectedProject }
    : { kind: "level", level: selectedLevel ?? rootLevel };

  const selectedPhase =
    selection.kind === "project"
      ? selection.project.phases.find(
          (phase) => phase.language === searchParams.get("lang") && phase.phase === searchParams.get("phase"),
        ) ?? selection.project.phases[0]
      : undefined;

  const levelProjects = selection.kind === "level" ? listProjectsForLevel(selection.level.id) : [];
  const projectLevels =
    selection.kind === "project" ? selection.project.display_levels.map(findLevelById).filter(isLevelEntry) : [];
  const projectRequiredLevels =
    selection.kind === "project" ? selection.project.required_levels.map(findLevelById).filter(isLevelEntry) : [];

  const focusPlan =
    selection.kind === "level"
      ? [
          selection.level.prerequisites.length > 0
            ? `Verifica prerequisitos: ${selection.level.prerequisites.join(" / ")}.`
            : "No hay prerequisitos declarados; puedes entrar directo.",
          `Lee el README de ${selection.level.id} y fija los conceptos tecnicos de la unidad.`,
          `Resuelve ejercicios y conecta ${levelProjects.length} proyecto(s) del tramo.`,
        ]
      : [
          selection.project.required_levels.length > 0
            ? `Confirma niveles requeridos: ${selection.project.required_levels.join(" / ")}.`
            : "El proyecto no declara niveles extra por fuera de su ancla.",
          `Usa el README para fijar alcance, restricciones y lenguaje(s) de implementacion.`,
          selection.project.phases.length > 0
            ? `Trabaja una fase material y usa el contenido asociado como guia de ejecucion.`
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
    const nextDefaultLevel = nextPathLevels[0] ?? rootLevel;
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
      <aside className="workspace-index">
        <div className="workspace-index-head">
          <Link className="workspace-mark" to="/">
            FORJA
          </Link>

          {catalog.paths.length > 0 ? (
            <label className="workspace-select-field">
              <span>Trayecto</span>
              <select
                className="workspace-select"
                value={activePath?.id ?? ""}
                onChange={(event) => handlePathSelect(event.target.value)}
              >
                {catalog.paths.map((path) => (
                  <option key={path.id} value={path.id}>
                    {path.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <CurriculumMap
          levels={catalog.levels}
          projects={catalog.projects}
          activePathLevels={activePathLevels}
          mode={activeMode}
          selection={selection}
          onSelectLevel={handleSelectLevel}
          onSelectProject={handleSelectProject}
        />
      </aside>

      <main className="workspace-document">
        <div className="document-topbar">
          <Link className="document-back" to="/">
            Volver
          </Link>

          <div className="document-mode-switch" role="group" aria-label="Cambiar modo de lectura">
            <button
              type="button"
              className={`mode-toggle${activeMode === "browse" ? " is-active" : ""}`}
              onClick={() => updateParams({ mode: "browse" })}
            >
              Navegar
            </button>
            <button
              type="button"
              className={`mode-toggle${activeMode === "focus" ? " is-active" : ""}`}
              onClick={() => updateParams({ mode: "focus" })}
            >
              Focus
            </button>
          </div>
        </div>

        <header className="document-header">
          <p className="eyebrow">
            {selection.kind === "level"
              ? selection.level.id
              : selection.project.type === "integrating"
                ? "Proyecto integrador"
                : "Proyecto focalizado"}
          </p>
          <h1 className="document-title">
            {selection.kind === "level" ? selection.level.title : selection.project.title}
          </h1>
          <p className="document-meta">
            {selection.kind === "level"
              ? `${selection.level.id} / ${selection.level.domain} / prerequisitos: ${joinValues(selection.level.prerequisites, "ninguno")}`
              : `${selection.project.anchor_level} / ${joinValues(selection.project.languages, "infraestructura")} / ${selection.project.stages.length} stage(s)`}
          </p>
        </header>

        <div className="document-scroll">
          <section className="document-section document-section-intro">
            <div className="document-status-line">
              <span>{activePath ? activePath.title : "Catalogo completo"}</span>
              <span>{activeMode === "focus" ? "Modo focus" : "Modo navegar"}</span>
            </div>

            <div className="document-inline-links">
              {selection.kind === "level"
                ? levelProjects.length > 0
                  ? levelProjects.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        className="document-link"
                        onClick={() => handleSelectProject(project.id)}
                      >
                        {project.title}
                      </button>
                    ))
                  : [
                      <span key="empty-level-projects" className="document-empty">
                        Sin proyectos visibles para este nivel.
                      </span>,
                    ]
                : projectLevels.length > 0
                  ? projectLevels.map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        className="document-link"
                        onClick={() => handleSelectLevel(level.slug)}
                      >
                        {level.id}
                      </button>
                    ))
                  : [
                      <span key="empty-project-levels" className="document-empty">
                        Sin niveles relacionados.
                      </span>,
                    ]}
            </div>
          </section>

          {activeMode === "browse" ? (
            selection.kind === "level" ? (
              <>
                <section className="document-section">
                  <h2>Resumen</h2>
                  <MarkdownArticle content={selection.level.readme} />
                </section>

                <section className="document-section">
                  <h2>Ejercicios</h2>
                  <MarkdownArticle content={selection.level.exercises} />
                </section>
              </>
            ) : (
              <>
                <section className="document-section">
                  <h2>Brief</h2>
                  <MarkdownArticle content={selection.project.readme} />
                </section>

                <section className="document-section">
                  <h2>Stages</h2>
                  <ul className="document-list">
                    {selection.project.stages.map((stage) => (
                      <li key={stage.id}>
                        <strong>{stage.label}</strong>
                        <span>unlock: {stage.unlock_level}</span>
                        <span>required: {joinValues(stage.required_levels, "ninguno")}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="document-section">
                  <h2>Fases</h2>

                  {selection.project.phases.length > 0 ? (
                    <>
                      <div className="document-phase-tabs">
                        {selection.project.phases.map((phase) => (
                          <button
                            key={`${phase.language}-${phase.phase}`}
                            type="button"
                            className={`phase-tab${selectedPhase?.language === phase.language && selectedPhase.phase === phase.phase ? " is-selected" : ""}`}
                            onClick={() => handlePhaseSelect(phase.language, phase.phase)}
                          >
                            {phase.language} / {phase.phase}
                          </button>
                        ))}
                      </div>

                      {selectedPhase ? (
                        <div className="document-phase-content">
                          <MarkdownArticle content={selectedPhase.readme} />
                          {selectedPhase.studyGuide ? <MarkdownArticle content={selectedPhase.studyGuide} /> : null}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="document-empty">Todavia no hay fases materiales en este proyecto.</p>
                  )}
                </section>
              </>
            )
          ) : selection.kind === "level" ? (
            <>
              <section className="document-section">
                <h2>Ruta de estudio</h2>
                <ol className="focus-list">
                  {focusPlan.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>

              <section className="document-section">
                <h2>Material base</h2>
                <MarkdownArticle content={selection.level.readme} />
              </section>

              <section className="document-section">
                <h2>Ejercicios</h2>
                <MarkdownArticle content={selection.level.exercises} />
              </section>
            </>
          ) : (
            <>
              <section className="document-section">
                <h2>Plan de ataque</h2>
                <ol className="focus-list">
                  {focusPlan.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>

              <section className="document-section">
                <h2>Brief</h2>
                <MarkdownArticle content={selection.project.readme} />
              </section>

              <section className="document-section">
                <h2>Requisitos</h2>

                <div className="document-inline-links">
                  {projectRequiredLevels.length > 0 ? (
                    projectRequiredLevels.map((level) => (
                      <button
                        key={level.id}
                        type="button"
                        className="document-link"
                        onClick={() => handleSelectLevel(level.slug)}
                      >
                        {level.id}
                      </button>
                    ))
                  ) : (
                    <span className="document-empty">Sin niveles adicionales.</span>
                  )}
                </div>

                <ul className="document-list">
                  {selection.project.stages.map((stage) => (
                    <li key={stage.id}>
                      <strong>{stage.label}</strong>
                      <span>unlock: {stage.unlock_level}</span>
                      <span>required: {joinValues(stage.required_levels, "ninguno")}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="document-section">
                <h2>Fases</h2>

                {selection.project.phases.length > 0 ? (
                  <>
                    <div className="document-phase-tabs">
                      {selection.project.phases.map((phase) => (
                        <button
                          key={`${phase.language}-${phase.phase}`}
                          type="button"
                          className={`phase-tab${selectedPhase?.language === phase.language && selectedPhase.phase === phase.phase ? " is-selected" : ""}`}
                          onClick={() => handlePhaseSelect(phase.language, phase.phase)}
                        >
                          {phase.language} / {phase.phase}
                        </button>
                      ))}
                    </div>

                    {selectedPhase ? (
                      <div className="document-phase-content">
                        <MarkdownArticle content={selectedPhase.readme} />
                        {selectedPhase.studyGuide ? <MarkdownArticle content={selectedPhase.studyGuide} /> : null}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="document-empty">Todavia no hay fases materiales en este proyecto.</p>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}