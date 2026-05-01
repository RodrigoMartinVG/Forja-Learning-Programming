import { parse } from "yaml";
import repoReadmeRaw from "../../../README.md?raw";

type RawModuleMap = Record<string, string>;

export type LevelMeta = {
  id: string;
  title: string;
  slug: string;
  domain: string;
  group?: string;
  sublevel_order?: number;
  order: number;
  theory_dir: string;
  projects: string[];
  prerequisites: string[];
};

export type StageMeta = {
  id: string;
  label: string;
  kind: string;
  required_levels: string[];
  unlock_level: string;
};

export type ProjectMeta = {
  id: string;
  codename: string;
  title: string;
  type: "focused" | "integrating";
  anchor_level: string;
  display_levels: string[];
  required_levels: string[];
  expansion_levels: string[];
  languages: string[];
  dir: string;
  stages: StageMeta[];
};

export type PathEntry = {
  id: string;
  title: string;
  description: string;
  levels: string[];
};

export type CrossRefEntry = {
  theory: string;
  projects: string[];
  note?: string;
};

export type PhaseEntry = {
  track: string;
  projectId: string;
  language: string;
  phase: string;
  readme: string;
  studyGuide: string;
  improvements: string;
};

export type LevelEntry = LevelMeta & {
  dirName: string;
  readme: string;
  exercises: string;
};

export type ProjectEntry = ProjectMeta & {
  track: "focused" | "integrating";
  readme: string;
  phases: PhaseEntry[];
};

const levelMetaModules = import.meta.glob("../../../content/theory/*/meta.yaml", {
  eager: true,
  import: "default",
  query: "?raw",
}) as RawModuleMap;

const levelReadmeModules = import.meta.glob("../../../content/theory/*/README.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as RawModuleMap;

const levelExercisesModules = import.meta.glob("../../../content/theory/*/exercises.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as RawModuleMap;

const projectMetaModules = import.meta.glob("../../../content/projects/*/*/project.yaml", {
  eager: true,
  import: "default",
  query: "?raw",
}) as RawModuleMap;

const projectReadmeModules = import.meta.glob("../../../content/projects/*/*/README.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as RawModuleMap;

const phaseReadmeModules = import.meta.glob("../../../content/projects/*/*/*/phase-*/README.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as RawModuleMap;

const phaseStudyGuideModules = import.meta.glob("../../../content/projects/*/*/*/phase-*/STUDY_GUIDE.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as RawModuleMap;

const phaseImprovementsModules = import.meta.glob("../../../content/projects/*/*/*/phase-*/IMPROVEMENTS.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as RawModuleMap;

const pathsRaw = Object.values(
  import.meta.glob("../../../metadata/paths.yaml", {
    eager: true,
    import: "default",
    query: "?raw",
  }) as RawModuleMap,
)[0] ?? "paths: []";

const crossRefsRaw = Object.values(
  import.meta.glob("../../../metadata/cross-refs.yaml", {
    eager: true,
    import: "default",
    query: "?raw",
  }) as RawModuleMap,
)[0] ?? "cross_refs: []";

function capture(source: string, expression: RegExp): RegExpMatchArray {
  const match = source.match(expression);
  if (!match) {
    throw new Error(`No se pudo resolver la ruta de contenido: ${source}`);
  }
  return match;
}

function buildLevels(): LevelEntry[] {
  return Object.entries(levelMetaModules)
    .map(([path, raw]) => {
      const match = capture(path, /content\/theory\/([^/]+)\/meta\.yaml$/);
      const dirName = match[1];
      const readmePath = path.replace("/meta.yaml", "/README.md");
      const exercisesPath = path.replace("/meta.yaml", "/exercises.md");
      const meta = parse(raw) as LevelMeta;

      return {
        ...meta,
        dirName,
        readme: levelReadmeModules[readmePath] ?? "",
        exercises: levelExercisesModules[exercisesPath] ?? "",
      };
    })
    .sort((left, right) => left.order - right.order);
}

function buildPhases(): PhaseEntry[] {
  return Object.entries(phaseReadmeModules)
    .map(([path, readme]) => {
      const match = capture(path, /content\/projects\/([^/]+)\/([^/]+)\/([^/]+)\/(phase-[^/]+)\/README\.md$/);
      const [, track, projectId, language, phase] = match;
      const studyGuidePath = path.replace("/README.md", "/STUDY_GUIDE.md");
      const improvementsPath = path.replace("/README.md", "/IMPROVEMENTS.md");

      return {
        track,
        projectId,
        language,
        phase,
        readme,
        studyGuide: phaseStudyGuideModules[studyGuidePath] ?? "",
        improvements: phaseImprovementsModules[improvementsPath] ?? "",
      };
    })
    .sort((left, right) => left.phase.localeCompare(right.phase));
}

function buildProjects(phases: PhaseEntry[]): ProjectEntry[] {
  return Object.entries(projectMetaModules)
    .map(([path, raw]) => {
      const match = capture(path, /content\/projects\/([^/]+)\/([^/]+)\/project\.yaml$/);
      const [, track] = match;
      const meta = parse(raw) as ProjectMeta;
      const readmePath = path.replace("/project.yaml", "/README.md");

      return {
        ...meta,
        track: track as ProjectEntry["track"],
        readme: projectReadmeModules[readmePath] ?? "",
        phases: phases.filter((phase) => phase.projectId === meta.id),
      };
    })
    .sort((left, right) => left.title.localeCompare(right.title, "es"));
}

function buildPaths(): PathEntry[] {
  const parsed = parse(pathsRaw) as { paths?: PathEntry[] };
  return parsed.paths ?? [];
}

function buildCrossRefs(): CrossRefEntry[] {
  const parsed = parse(crossRefsRaw) as { cross_refs?: CrossRefEntry[] };
  return parsed.cross_refs ?? [];
}

const phases = buildPhases();
const levels = buildLevels();
const projects = buildProjects(phases);
const paths = buildPaths();
const crossRefs = buildCrossRefs();

const levelsBySlug = new Map(levels.map((level) => [level.slug, level]));
const levelsById = new Map(levels.map((level) => [level.id, level]));
const levelsByDir = new Map(levels.map((level) => [level.dirName, level]));
const projectsById = new Map(projects.map((project) => [project.id, project]));

export const catalog = {
  repoReadme: repoReadmeRaw,
  repoLead: repoReadmeRaw.split("## Estado actual")[0].trim(),
  levels,
  projects,
  paths,
  phases,
  crossRefs,
  stats: {
    levels: levels.length,
    projects: projects.length,
    paths: paths.length,
    phases: phases.length,
  },
};

export function findLevelBySlug(slug: string) {
  return levelsBySlug.get(slug);
}

export function findLevelById(levelId: string) {
  return levelsById.get(levelId);
}

export function findLevelByCrossRef(theory: string) {
  return levelsByDir.get(theory) ?? levels.find((level) => level.slug === theory.toLowerCase());
}

export function findProjectById(projectId: string) {
  return projectsById.get(projectId);
}

export function listProjectsForLevel(levelId: string) {
  return projects.filter((project) => project.display_levels.includes(levelId));
}

export function listCrossRefsForLevel(level: LevelEntry) {
  return crossRefs.filter((crossRef) => findLevelByCrossRef(crossRef.theory)?.id === level.id);
}