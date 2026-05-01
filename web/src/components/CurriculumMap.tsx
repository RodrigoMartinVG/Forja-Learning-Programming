import type { LevelEntry, ProjectEntry } from "@/lib/catalog";

export type WorkspaceMode = "browse" | "focus";

export type WorkspaceSelection =
  | {
      kind: "level";
      level: LevelEntry;
    }
  | {
      kind: "project";
      project: ProjectEntry;
    };

type CurriculumMapProps = {
  levels: LevelEntry[];
  projects: ProjectEntry[];
  activePathLevels: LevelEntry[];
  mode: WorkspaceMode;
  selection: WorkspaceSelection;
  onSelectLevel: (slug: string) => void;
  onSelectProject: (projectId: string) => void;
};

function joinClasses(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function CurriculumMap({
  levels,
  projects,
  activePathLevels,
  mode,
  selection,
  onSelectLevel,
  onSelectProject,
}: CurriculumMapProps) {
  const activePathLevelIds = new Set(activePathLevels.map((level) => level.id));

  const groupsByAnchor = new Map(levels.map((level) => [level.id, [] as ProjectEntry[]]));

  for (const project of projects) {
    groupsByAnchor.get(project.anchor_level)?.push(project);
  }

  for (const projectList of groupsByAnchor.values()) {
    projectList.sort((left, right) => left.title.localeCompare(right.title, "es"));
  }

  const focusLevelIds = new Set<string>();
  const focusProjectIds = new Set<string>();

  if (selection.kind === "level") {
    focusLevelIds.add(selection.level.id);
    selection.level.prerequisites.forEach((levelId) => focusLevelIds.add(levelId));

    projects
      .filter((project) => project.display_levels.includes(selection.level.id))
      .forEach((project) => focusProjectIds.add(project.id));
  } else {
    focusProjectIds.add(selection.project.id);

    [
      selection.project.anchor_level,
      ...selection.project.display_levels,
      ...selection.project.required_levels,
      ...selection.project.expansion_levels,
    ].forEach((levelId) => focusLevelIds.add(levelId));
  }

  return (
    <nav className={`content-map mode-${mode}`} aria-label="Indice tipo mapa del contenido">
      <ol className="content-map-track">
        {levels.map((level) => {
          const levelProjects = groupsByAnchor.get(level.id) ?? [];
          const isSelectedLevel = selection.kind === "level" && selection.level.id === level.id;
          const isOnPath = activePathLevelIds.has(level.id);
          const isFocusRelated = focusLevelIds.has(level.id);

          return (
            <li
              key={level.id}
              className={joinClasses(
                "map-row",
                isOnPath && "is-on-path",
                isSelectedLevel && "is-selected",
                mode === "focus" && !isSelectedLevel && !isFocusRelated && "is-muted",
              )}
            >
              <button type="button" className="map-level-button" onClick={() => onSelectLevel(level.slug)}>
                <span className="map-level-id">{level.id}</span>
                <span className="map-level-title">{level.title}</span>
              </button>

              {levelProjects.length > 0 ? (
                <div className="map-project-list">
                  {levelProjects.map((project) => {
                    const isSelectedProject = selection.kind === "project" && selection.project.id === project.id;
                    const isProjectOnPath = project.display_levels.some((levelId) => activePathLevelIds.has(levelId));
                    const isFocusProject = focusProjectIds.has(project.id);

                    return (
                      <button
                        key={project.id}
                        type="button"
                        className={joinClasses(
                          "map-project-button",
                          project.type === "integrating" ? "type-integrating" : "type-focused",
                          isProjectOnPath && "is-on-path",
                          isSelectedProject && "is-selected",
                          mode === "focus" && !isSelectedProject && !isFocusProject && "is-muted",
                        )}
                        onClick={() => onSelectProject(project.id)}
                      >
                        <span className="map-project-type">{project.type === "integrating" ? "I" : "F"}</span>
                        <span className="map-project-text">{project.title}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}