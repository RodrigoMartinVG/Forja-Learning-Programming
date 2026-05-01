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

type NodePosition = {
  x: number;
  y: number;
};

function joinClasses(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function compactLabel(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function drawCurve(start: NodePosition, end: NodePosition) {
  const midX = (start.x + end.x) / 2;
  return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
}

function isActivationKey(key: string) {
  return key === "Enter" || key === " ";
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

  const groupsByAnchor = new Map(
    levels.map((level) => [level.id, { focused: [] as ProjectEntry[], integrating: [] as ProjectEntry[] }]),
  );

  for (const project of projects) {
    const bucket = groupsByAnchor.get(project.anchor_level);
    if (!bucket) {
      continue;
    }

    if (project.type === "integrating") {
      bucket.integrating.push(project);
    } else {
      bucket.focused.push(project);
    }
  }

  for (const bucket of groupsByAnchor.values()) {
    bucket.focused.sort((left, right) => left.title.localeCompare(right.title, "es"));
    bucket.integrating.sort((left, right) => left.title.localeCompare(right.title, "es"));
  }

  const maxIntegrating = Math.max(...levels.map((level) => groupsByAnchor.get(level.id)?.integrating.length ?? 0), 1);
  const maxFocused = Math.max(...levels.map((level) => groupsByAnchor.get(level.id)?.focused.length ?? 0), 1);

  const topStartY = 92;
  const columnGap = 228;
  const leftPadding = 160;
  const levelY = topStartY + maxIntegrating * 104 + 48;
  const bottomStartY = levelY + 136;
  const height = bottomStartY + maxFocused * 98 + 132;
  const width = leftPadding * 2 + (levels.length - 1) * columnGap + 48;

  const levelPositions = new Map<string, NodePosition>();
  levels.forEach((level, index) => {
    levelPositions.set(level.id, {
      x: leftPadding + index * columnGap,
      y: levelY,
    });
  });

  const projectPositions = new Map<string, NodePosition>();
  levels.forEach((level) => {
    const position = levelPositions.get(level.id);
    const bucket = groupsByAnchor.get(level.id);

    if (!position || !bucket) {
      return;
    }

    bucket.integrating.forEach((project, index) => {
      projectPositions.set(project.id, {
        x: position.x,
        y: topStartY + index * 104,
      });
    });

    bucket.focused.forEach((project, index) => {
      projectPositions.set(project.id, {
        x: position.x,
        y: bottomStartY + index * 98,
      });
    });
  });

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

  const activePathPairs = activePathLevels.slice(1).map((level, index) => [activePathLevels[index], level] as const);

  return (
    <svg
      className="curriculum-map-svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Mapa curricular de Forja con niveles y proyectos conectados"
    >
      <defs>
        <linearGradient id="path-ribbon-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(191, 217, 78, 0.1)" />
          <stop offset="50%" stopColor="rgba(237, 109, 59, 0.45)" />
          <stop offset="100%" stopColor="rgba(31, 109, 113, 0.45)" />
        </linearGradient>
      </defs>

      <rect className="map-wash" x="24" y="24" width={width - 48} height={height - 48} rx="36" />

      {levels.map((level) => {
        const position = levelPositions.get(level.id);

        if (!position) {
          return null;
        }

        return (
          <line
            key={`grid-${level.id}`}
            className="map-grid-line"
            x1={position.x}
            y1="40"
            x2={position.x}
            y2={height - 40}
          />
        );
      })}

      <text className="map-zone-label" x="54" y={topStartY - 26}>
        Proyectos integradores
      </text>
      <text className="map-zone-label" x="54" y={levelY - 28}>
        Niveles
      </text>
      <text className="map-zone-label" x="54" y={bottomStartY - 24}>
        Proyectos focalizados
      </text>

      {activePathPairs.map(([fromLevel, toLevel]) => {
        const from = levelPositions.get(fromLevel.id);
        const to = levelPositions.get(toLevel.id);

        if (!from || !to) {
          return null;
        }

        return (
          <g key={`path-${fromLevel.id}-${toLevel.id}`}>
            <path
              className="map-path-ribbon map-path-ribbon-base"
              d={drawCurve({ x: from.x, y: from.y }, { x: to.x, y: to.y })}
            />
            <path
              className="map-path-ribbon map-path-ribbon-glow"
              d={drawCurve({ x: from.x, y: from.y }, { x: to.x, y: to.y })}
            />
          </g>
        );
      })}

      {projects.map((project) => {
        const projectPosition = projectPositions.get(project.id);
        const levelPosition = levelPositions.get(project.anchor_level);
        const onPath = project.display_levels.some((levelId) => activePathLevelIds.has(levelId));
        const isSelected = selection.kind === "project" && selection.project.id === project.id;
        const isFocusRelated = focusProjectIds.has(project.id);

        if (!projectPosition || !levelPosition) {
          return null;
        }

        return (
          <path
            key={`edge-${project.id}`}
            className={joinClasses(
              "map-edge",
              project.type === "integrating" ? "is-integrating" : "is-focused",
              onPath ? "is-on-path" : "is-off-path",
              isSelected || isFocusRelated ? "is-highlighted" : undefined,
              mode === "focus" && !isSelected && !isFocusRelated ? "is-muted" : undefined,
            )}
            d={drawCurve(
              { x: levelPosition.x, y: levelPosition.y + 40 },
              { x: projectPosition.x, y: projectPosition.y + (project.type === "integrating" ? 74 : 2) },
            )}
          />
        );
      })}

      {mode === "focus" && selection.kind === "level"
        ? selection.level.prerequisites.map((levelId) => {
            const from = levelPositions.get(levelId);
            const to = levelPositions.get(selection.level.id);

            if (!from || !to) {
              return null;
            }

            return (
              <path
                key={`prereq-${levelId}-${selection.level.id}`}
                className="map-edge is-prereq is-highlighted"
                d={drawCurve({ x: from.x, y: from.y - 42 }, { x: to.x, y: to.y - 42 })}
              />
            );
          })
        : null}

      {levels.map((level) => {
        const position = levelPositions.get(level.id);
        const isSelected = selection.kind === "level" && selection.level.id === level.id;
        const isOnPath = activePathLevelIds.has(level.id);
        const isFocusRelated = focusLevelIds.has(level.id);

        if (!position) {
          return null;
        }

        return (
          <g
            key={level.id}
            className={joinClasses(
              "map-node",
              "map-level-node",
              isSelected ? "is-selected" : undefined,
              isOnPath ? "is-on-path" : "is-off-path",
              isFocusRelated ? "is-focus-related" : undefined,
              mode === "focus" && !isSelected && !isFocusRelated ? "is-muted" : undefined,
            )}
            transform={`translate(${position.x - 88} ${position.y - 44})`}
            role="button"
            tabIndex={0}
            aria-label={`Seleccionar nivel ${level.id}`}
            onClick={() => onSelectLevel(level.slug)}
            onKeyDown={(event) => {
              if (isActivationKey(event.key)) {
                event.preventDefault();
                onSelectLevel(level.slug);
              }
            }}
          >
            <title>{`${level.id} · ${level.title}`}</title>
            <rect className="map-node-shell" width="176" height="88" rx="28" />
            <text className="map-node-kicker" x="18" y="24">
              {level.id}
            </text>
            <text className="map-node-title" x="18" y="48">
              {compactLabel(level.title, 24)}
            </text>
            <text className="map-node-meta" x="18" y="68">
              {level.projects.length} proyectos enlazados
            </text>
          </g>
        );
      })}

      {projects.map((project) => {
        const position = projectPositions.get(project.id);
        const isSelected = selection.kind === "project" && selection.project.id === project.id;
        const isOnPath = project.display_levels.some((levelId) => activePathLevelIds.has(levelId));
        const isFocusRelated = focusProjectIds.has(project.id);

        if (!position) {
          return null;
        }

        return (
          <g
            key={project.id}
            className={joinClasses(
              "map-node",
              "map-project-node",
              project.type === "integrating" ? "type-integrating" : "type-focused",
              isSelected ? "is-selected" : undefined,
              isOnPath ? "is-on-path" : "is-off-path",
              isFocusRelated ? "is-focus-related" : undefined,
              mode === "focus" && !isSelected && !isFocusRelated ? "is-muted" : undefined,
            )}
            transform={`translate(${position.x - 92} ${position.y})`}
            role="button"
            tabIndex={0}
            aria-label={`Seleccionar proyecto ${project.title}`}
            onClick={() => onSelectProject(project.id)}
            onKeyDown={(event) => {
              if (isActivationKey(event.key)) {
                event.preventDefault();
                onSelectProject(project.id);
              }
            }}
          >
            <title>{`${project.title} · ${project.anchor_level}`}</title>
            <rect className="map-node-shell" width="184" height="76" rx="24" />
            <text className="map-node-kicker" x="18" y="22">
              {project.type === "integrating" ? "Integrador" : "Focalizado"}
            </text>
            <text className="map-node-title" x="18" y="44">
              {compactLabel(project.title, 22)}
            </text>
            <text className="map-node-meta" x="18" y="63">
              {compactLabel(project.languages.length > 0 ? project.languages.join(" + ") : "infra", 24)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}