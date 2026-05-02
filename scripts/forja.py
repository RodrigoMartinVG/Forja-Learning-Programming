#!/usr/bin/env python3

from __future__ import annotations

import argparse
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
THEORY_ROOT = ROOT / "content" / "theory"
PROJECT_ROOTS = {
    "focused": ROOT / "content" / "projects" / "focused",
    "integrating": ROOT / "content" / "projects" / "integrating",
}
METADATA_ROOT = ROOT / "metadata"
TEMPLATES_ROOT = ROOT / "templates"


def parse_scalar(value: str) -> object:
    if value == "":
        return ""
    if value.startswith('"') and value.endswith('"'):
        return value[1:-1].replace('\\"', '"')
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        if not inner:
            return []
        return [parse_scalar(part.strip()) for part in inner.split(",")]
    if value.lstrip("-").isdigit():
        return int(value)
    return value


def load_yaml_sequence(path: Path, root_key: str) -> list[dict[str, object]]:
    if not path.exists():
        return []

    items: list[dict[str, object]] = []
    current: dict[str, object] | None = None
    in_root = False

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue

        if not in_root:
            if raw_line.strip() == f"{root_key}:":
                in_root = True
            continue

        if raw_line.startswith("  - "):
            if current is not None:
                items.append(current)
            current = {}
            entry = raw_line[4:]
            if entry:
                key, value = entry.split(":", 1)
                current[key.strip()] = parse_scalar(value.strip())
            continue

        if current is None:
            continue

        stripped = raw_line.strip()
        if ":" not in stripped:
            continue
        key, value = stripped.split(":", 1)
        current[key.strip()] = parse_scalar(value.strip())

    if current is not None:
        items.append(current)

    return items


def load_levels_catalog() -> list[dict[str, object]]:
    levels = load_yaml_sequence(METADATA_ROOT / "levels.yaml", "levels")
    enriched: list[dict[str, object]] = []

    for level in levels:
        item = dict(level)
        item["dir_name"] = Path(str(item["theory_dir"])).name
        enriched.append(item)

    return enriched


def load_paths_catalog() -> list[dict[str, object]]:
    return load_yaml_sequence(METADATA_ROOT / "paths.yaml", "paths")


def load_cross_refs_catalog() -> list[dict[str, object]]:
    return load_yaml_sequence(METADATA_ROOT / "cross-refs.yaml", "cross_refs")


LEVELS = load_levels_catalog()


PROJECT_TITLES = {
    "devcontainer-setup": "Devcontainer Setup",
    "hello-c": "hello-c",
    "caesar-cipher": "caesar-cipher",
    "word-count": "word-count",
    "stringlib": "stringlib",
    "elf-explorer": "elf-explorer",
    "getopt-impl": "getopt-impl",
    "dynamic-array": "dynamic-array",
    "hello-rust": "hello-rust",
    "fizzbuzz-rust": "fizzbuzz-rust",
    "mini-calculator": "mini-calculator",
    "data-structures-rust": "data-structures-rust",
    "custom-iterator": "custom-iterator",
    "parser-combinators": "parser-combinators",
    "ffi-demo": "ffi-demo",
    "spl_stat": "spl_stat",
    "spl_ls": "spl_ls",
    "spl_du": "spl_du",
    "file-monitor": "file-monitor",
    "spl_pstree": "spl_pstree",
    "impl_abort": "impl_abort",
    "impl_alarm": "impl_alarm",
    "scheduler-sim": "scheduler-sim",
    "mini-debugger": "mini-debugger",
    "mish": "mish",
    "vma-explorer": "vma-explorer",
    "cow-demo": "cow-demo",
    "spl_cp": "spl_cp",
    "mini-linker": "mini-linker",
    "custom-malloc": "custom-malloc",
    "thread-pool": "thread-pool",
    "prod-cons": "prod-cons",
    "rwlock-impl": "rwlock-impl",
    "impl_arc": "impl_arc",
    "lock-free-queue": "lock-free-queue",
    "rcu-demo": "rcu-demo",
    "named-pipe-sem": "named-pipe-sem",
    "ipc-explorer": "ipc-explorer",
    "miniqueue": "miniqueue",
    "regex-engine": "regex-engine",
    "expr-parser": "expr-parser",
    "semtex": "Semtex",
    "logico": "Logico",
    "kvolt": "KVolt",
    "minisql": "MiniSQL",
    "http-server": "HTTP server",
    "shell-remoto-tcp": "shell remoto TCP",
    "minisync": "minisync",
    "mini-dns-resolver": "mini-dns-resolver",
    "mini-tcpdump": "mini-tcpdump",
    "http2-server": "http2-server",
    "websocket-server": "websocket-server",
    "tcp-ip-stack": "TCP/IP stack",
    "perf-benchmarks": "perf-benchmarks",
    "flamegraph-lab": "flamegraph-lab",
    "cache-locality-exp": "cache-locality-exp",
    "false-sharing-exp": "false-sharing-exp",
    "tinyssh": "tinyssh",
    "impl_script": "impl_script",
    "async-runtime": "async-runtime",
    "io_uring-echo": "io_uring-echo",
    "minidocker": "minidocker",
    "orquestador": "orquestador",
    "jit-brain": "JIT-Brain",
    "char-driver": "char-driver",
    "ram-filesystem": "RAM-FileSystem",
    "kvm-mini-hypervisor": "KVM mini-hypervisor",
    "ebpf-tracer": "ebpf-tracer",
    "mem-cache": "mem-cache",
    "mini-broker": "mini-broker",
    "raft-lite": "raft-lite",
}


INTEGRATING_PROJECTS = {
    "mini-debugger",
    "mish",
    "custom-malloc",
    "miniqueue",
    "semtex",
    "logico",
    "kvolt",
    "minisql",
    "http-server",
    "minisync",
    "tcp-ip-stack",
    "tinyssh",
    "async-runtime",
    "minidocker",
    "orquestador",
    "jit-brain",
    "kvm-mini-hypervisor",
    "mem-cache",
    "mini-broker",
    "raft-lite",
}

C_ONLY_PROJECTS = {
    "hello-c",
    "caesar-cipher",
    "word-count",
    "stringlib",
    "elf-explorer",
    "char-driver",
    "ram-filesystem",
    "kvm-mini-hypervisor",
}

RUST_ONLY_PROJECTS = {
    "hello-rust",
    "fizzbuzz-rust",
    "mini-calculator",
    "data-structures-rust",
    "custom-iterator",
    "parser-combinators",
    "impl_arc",
    "async-runtime",
}

NO_LANGUAGE_PROJECTS = {"devcontainer-setup"}

PATHS = load_paths_catalog()

CROSS_REFS = load_cross_refs_catalog()


def yaml_quote(value: str) -> str:
    return '"' + value.replace('"', '\\"') + '"'


def yaml_list(values: list[str]) -> str:
    if not values:
        return "[]"
    return "[" + ", ".join(values) + "]"


def level_theory_dir(level: dict[str, object]) -> str:
    theory_dir = level.get("theory_dir")
    if theory_dir:
        return str(theory_dir)
    return f"content/theory/{level['dir_name']}"


def level_dir_name(level: dict[str, object]) -> str:
    dir_name = level.get("dir_name")
    if dir_name:
        return str(dir_name)
    return Path(level_theory_dir(level)).name


def render_template(path: Path, context: dict[str, str]) -> str:
    content = path.read_text(encoding="utf-8")
    for key, value in context.items():
        content = content.replace("{{" + key + "}}", value)
    return content


def write_file(path: Path, content: str, force: bool) -> None:
    if path.exists() and not force:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.rstrip() + "\n", encoding="utf-8")


def touch_file(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text("", encoding="utf-8")


def stage_slug(project_id: str) -> str:
    return project_id.replace("_", "-")


def project_languages(project_id: str) -> list[str]:
    if project_id in NO_LANGUAGE_PROJECTS:
        return []
    if project_id in C_ONLY_PROJECTS:
        return ["c"]
    if project_id in RUST_ONLY_PROJECTS:
        return ["rust"]
    return ["c", "rust"]


def project_catalog() -> list[dict[str, object]]:
    ordered: dict[str, dict[str, object]] = {}

    for level in LEVELS:
        for project_id in level["projects"]:
            item = ordered.setdefault(
                project_id,
                {
                    "id": project_id,
                    "title": PROJECT_TITLES[project_id],
                    "type": "integrating" if project_id in INTEGRATING_PROJECTS else "focused",
                    "display_levels": [],
                },
            )
            item["display_levels"].append(level["id"])

    projects = []
    for project_id, item in ordered.items():
        display_levels = item["display_levels"]
        anchor_level = display_levels[0]
        expansion_levels = display_levels[1:]
        stages = []

        if item["type"] == "integrating" and len(display_levels) > 1:
            for index, level_id in enumerate(display_levels):
                stages.append(
                    {
                        "id": f"{stage_slug(project_id)}-{level_id.lower()}",
                        "label": f"Tramo {level_id}",
                        "kind": "project-stage",
                        "required_levels": display_levels[: index + 1],
                        "unlock_level": level_id,
                    }
                )
        else:
            label = "Fase base" if item["type"] == "integrating" else "Fase unica"
            stages.append(
                {
                    "id": f"{stage_slug(project_id)}-main",
                    "label": label,
                    "kind": "project-stage",
                    "required_levels": [anchor_level],
                    "unlock_level": anchor_level,
                }
            )

        track = item["type"]
        project_dir = PROJECT_ROOTS[track] / project_id
        projects.append(
            {
                "id": project_id,
                "codename": project_id,
                "title": item["title"],
                "type": item["type"],
                "anchor_level": anchor_level,
                "display_levels": display_levels,
                "required_levels": [anchor_level],
                "expansion_levels": expansion_levels,
                "languages": project_languages(project_id),
                "dir": project_dir.relative_to(ROOT).as_posix(),
                "track": track,
                "stages": stages,
            }
        )

    return projects


def level_meta(level: dict[str, object]) -> str:
    lines = [
        f"id: {level['id']}",
        f"title: {yaml_quote(level['title'])}",
        f"slug: {yaml_quote(level['slug'])}",
        f"domain: {level['domain']}",
    ]
    if level.get("group"):
        lines.append(f"group: {level['group']}")
    if level.get("sublevel_order"):
        lines.append(f"sublevel_order: {level['sublevel_order']}")
    lines.extend(
        [
            f"order: {level['order']}",
            f"theory_dir: {level_theory_dir(level)}",
            f"projects: {yaml_list(level['projects'])}",
            f"prerequisites: {yaml_list(level['prerequisites'])}",
        ]
    )
    return "\n".join(lines)


def project_meta(project: dict[str, object]) -> str:
    lines = [
        f"id: {project['id']}",
        f"codename: {project['codename']}",
        f"title: {yaml_quote(project['title'])}",
        f"type: {project['type']}",
        f"anchor_level: {project['anchor_level']}",
        f"display_levels: {yaml_list(project['display_levels'])}",
        f"required_levels: {yaml_list(project['required_levels'])}",
        f"expansion_levels: {yaml_list(project['expansion_levels'])}",
        f"languages: {yaml_list(project['languages'])}",
        f"dir: {project['dir']}",
        "stages:",
    ]
    for stage in project["stages"]:
        lines.extend(
            [
                f"  - id: {stage['id']}",
                f"    label: {yaml_quote(stage['label'])}",
                f"    kind: {stage['kind']}",
                f"    required_levels: {yaml_list(stage['required_levels'])}",
                f"    unlock_level: {stage['unlock_level']}",
            ]
        )
    return "\n".join(lines)


def paths_yaml() -> str:
    lines = ["paths:"]
    for path in PATHS:
        lines.extend(
            [
                f"  - id: {path['id']}",
                f"    title: {yaml_quote(path['title'])}",
                f"    description: {yaml_quote(path['description'])}",
                f"    levels: {yaml_list(path['levels'])}",
            ]
        )
    return "\n".join(lines)


def cross_refs_yaml() -> str:
    lines = ["cross_refs:"]
    for cross_ref in CROSS_REFS:
        lines.extend(
            [
                f"  - theory: {cross_ref['theory']}",
                f"    projects: {yaml_list(cross_ref['projects'])}",
            ]
        )
        note = cross_ref.get("note")
        if note:
            lines.append(f"    note: {yaml_quote(note)}")
    return "\n".join(lines)


def format_bullets(items: list[str], empty_message: str) -> str:
    if not items:
        return f"- {empty_message}"
    return "\n".join(f"- {item}" for item in items)


def level_outline(level: dict[str, object]) -> str:
    prerequisites = ", ".join(level["prerequisites"]) if level["prerequisites"] else "ninguno"
    projects = ", ".join(level["projects"]) if level["projects"] else "ninguno"

    return "\n".join(
        [
            f"# Outline: {level['id']} - {level['title']}",
            "",
            "## Metadatos",
            f"- Prerequisitos: {prerequisites}.",
            f"- Proyectos asociados: {projects}.",
            "",
            "## Objetivo",
            "",
            f"Definir la unidad teorica canonica de {level['id']} antes de escribir su contenido definitivo.",
            "",
            "## Capitulos",
            "",
            "### Capitulo 00 - Introduccion",
            "**Archivo:** `chapters/00-introduccion.md`",
            "**Objetivo:** presentar el mapa del nivel cuando se escriba el contenido.",
            "**Secciones:**",
            "- `## Pendiente`",
            "",
            "**Notas:** nivel resembrado desde cero; contenido aun no escrito.",
            "",
            "## Ejercicios",
            "",
            "Pendientes.",
            "",
            "## Decisiones de diseno",
            "",
            "- Este nivel existe como unidad canonica independiente.",
            "- El cuerpo definitivo se escribira mas adelante en `chapters/`.",
        ]
    )


def create_level(level: dict[str, object], force: bool) -> None:
    level_dir = THEORY_ROOT / level_dir_name(level)
    level_dir.mkdir(parents=True, exist_ok=True)
    touch_file(level_dir / "src" / ".gitkeep")
    touch_file(level_dir / "chapters" / ".gitkeep")

    context = {
        "level_id": level["id"],
        "level_title": level["title"],
        "level_slug": level["slug"],
        "level_projects": format_bullets(level["projects"], "Sin proyectos asociados todavia."),
        "level_prerequisites": format_bullets(level["prerequisites"], "Sin prerequisitos declarados."),
    }
    write_file(level_dir / "README.md", render_template(TEMPLATES_ROOT / "level" / "README.md.tpl", context), force)
    write_file(level_dir / "exercises.md", render_template(TEMPLATES_ROOT / "level" / "exercises.md.tpl", context), force)
    write_file(level_dir / "outline.md", level_outline(level), force)
    write_file(level_dir / "meta.yaml", level_meta(level), force)


def create_project(project: dict[str, object], force: bool) -> None:
    project_dir = PROJECT_ROOTS[project["track"]] / project["id"]
    project_dir.mkdir(parents=True, exist_ok=True)

    context = {
        "project_id": project["id"],
        "project_title": project["title"],
        "project_track": "integrador" if project["type"] == "integrating" else "focalizado",
        "project_levels": format_bullets(project["display_levels"], "Sin niveles visibles todavia."),
        "project_languages": format_bullets(project["languages"], "Infraestructura comun del repo."),
    }
    write_file(project_dir / "README.md", render_template(TEMPLATES_ROOT / "project" / "README.md.tpl", context), force)
    write_file(project_dir / "project.yaml", project_meta(project), force)

    for language in project["languages"]:
        touch_file(project_dir / language / ".gitkeep")


def seed_base2(force: bool) -> None:
    for level in LEVELS:
        create_level(level, force)
    for project in project_catalog():
        create_project(project, force)
    write_file(METADATA_ROOT / "paths.yaml", paths_yaml(), force)
    write_file(METADATA_ROOT / "cross-refs.yaml", cross_refs_yaml(), force)


def add_level(args: argparse.Namespace) -> None:
    level = {
        "id": args.id,
        "dir_name": args.dir_name,
        "slug": args.slug,
        "title": args.title,
        "domain": args.domain,
        "order": args.order,
        "prerequisites": args.prerequisite,
        "projects": args.project,
    }
    if args.group:
        level["group"] = args.group
    if args.sublevel_order:
        level["sublevel_order"] = args.sublevel_order
    create_level(level, args.force)


def build_project(args: argparse.Namespace) -> dict[str, object]:
    display_levels = args.display_level or [args.anchor_level]
    stages = []
    if args.track == "integrating" and len(display_levels) > 1:
        for index, level_id in enumerate(display_levels):
            stages.append(
                {
                    "id": f"{stage_slug(args.id)}-{level_id.lower()}",
                    "label": f"Tramo {level_id}",
                    "kind": "project-stage",
                    "required_levels": display_levels[: index + 1],
                    "unlock_level": level_id,
                }
            )
    else:
        stages.append(
            {
                "id": f"{stage_slug(args.id)}-main",
                "label": "Fase base" if args.track == "integrating" else "Fase unica",
                "kind": "project-stage",
                "required_levels": [args.anchor_level],
                "unlock_level": args.anchor_level,
            }
        )

    return {
        "id": args.id,
        "codename": args.id,
        "title": args.title,
        "type": args.track,
        "anchor_level": args.anchor_level,
        "display_levels": display_levels,
        "required_levels": [args.anchor_level],
        "expansion_levels": display_levels[1:],
        "languages": [] if args.no_language else args.language,
        "dir": (PROJECT_ROOTS[args.track] / args.id).relative_to(ROOT).as_posix(),
        "track": args.track,
        "stages": stages,
    }


def add_project(args: argparse.Namespace) -> None:
    create_project(build_project(args), args.force)


def project_path(project_id: str) -> tuple[Path, dict[str, object] | None]:
    catalog = {project["id"]: project for project in project_catalog()}
    for track, root in PROJECT_ROOTS.items():
        path = root / project_id
        if path.exists():
            return path, catalog.get(project_id)
    return PROJECT_ROOTS["focused"] / project_id, catalog.get(project_id)


def phase_readme(project_id: str, title: str, language: str, phase_name: str) -> str:
    template_dir = TEMPLATES_ROOT / "project" / f"phase-{language}"
    return render_template(
        template_dir / "README.md.tpl",
        {
            "project_id": project_id,
            "project_title": title,
            "phase_name": phase_name,
            "language": language,
        },
    )


def add_phase(args: argparse.Namespace) -> None:
    project_dir, catalog = project_path(args.project_id)
    title = catalog["title"] if catalog else args.project_id
    phase_name = f"phase-{args.phase}"
    phase_dir = project_dir / args.language / phase_name
    phase_dir.mkdir(parents=True, exist_ok=True)

    write_file(phase_dir / "README.md", phase_readme(args.project_id, title, args.language, phase_name), args.force)
    write_file(
        phase_dir / "STUDY_GUIDE.md",
        "\n".join(
            [
                f"# {title} - {phase_name} - Study Guide",
                "",
                "## Recorrido sugerido",
                "- Leer el README de la fase.",
                "- Ejecutar el binario o los tests que correspondan.",
                "- Marcar dudas sobre ownership, syscalls o estructura de datos segun el caso.",
            ]
        ),
        args.force,
    )
    write_file(
        phase_dir / "IMPROVEMENTS.md",
        "\n".join(
            [
                f"# {title} - {phase_name} - Improvements",
                "",
                "- Agregar tests de borde.",
                "- Mejorar mensajes de error y trazas de depuracion.",
                "- Documentar tradeoffs de implementacion.",
            ]
        ),
        args.force,
    )

    if args.language == "c":
        touch_file(phase_dir / "tests" / "fixtures" / ".gitkeep")
        write_file(
            phase_dir / "Makefile",
            "\n".join(
                [
                    "CC ?= gcc",
                    "CFLAGS ?= -Wall -Wextra -Werror -std=c11 -g",
                    "TARGET := main",
                    "",
                    "all: $(TARGET)",
                    "",
                    "$(TARGET): src/main.c",
                    "\t$(CC) $(CFLAGS) $< -o $@",
                    "",
                    "clean:",
                    "\trm -f $(TARGET)",
                ]
            ),
            args.force,
        )
        write_file(
            phase_dir / "src" / "main.c",
            "\n".join(
                [
                    "#include <stdio.h>",
                    "",
                    "int main(void) {",
                    f"    puts(\"{title} - {phase_name} - c\");",
                    "    return 0;",
                    "}",
                ]
            ),
            args.force,
        )
    else:
        touch_file(phase_dir / "tests" / ".gitkeep")
        write_file(
            phase_dir / "Cargo.toml",
            "\n".join(
                [
                    "[package]",
                    f"name = \"{args.project_id}-{phase_name}\"",
                    "version = \"0.1.0\"",
                    "edition = \"2024\"",
                    "",
                    "[dependencies]",
                ]
            ),
            args.force,
        )
        write_file(
            phase_dir / "src" / "main.rs",
            "\n".join(
                [
                    "fn main() {",
                    f"    println!(\"{title} - {phase_name} - rust\");",
                    "}",
                ]
            ),
            args.force,
        )


def validate() -> int:
    failures: list[str] = []

    for level in LEVELS:
        level_dir = THEORY_ROOT / level_dir_name(level)
        for relative in ["README.md", "exercises.md", "outline.md", "meta.yaml", "chapters/.gitkeep", "src/.gitkeep"]:
            path = level_dir / relative
            if not path.exists():
                failures.append(f"missing {path.relative_to(ROOT).as_posix()}")

    for project in project_catalog():
        project_dir = PROJECT_ROOTS[project["track"]] / project["id"]
        for relative in ["README.md", "project.yaml"]:
            path = project_dir / relative
            if not path.exists():
                failures.append(f"missing {path.relative_to(ROOT).as_posix()}")
        for language in project["languages"]:
            path = project_dir / language / ".gitkeep"
            if not path.exists():
                failures.append(f"missing {path.relative_to(ROOT).as_posix()}")

    for relative in ["metadata/levels.yaml", "metadata/paths.yaml", "metadata/cross-refs.yaml"]:
        path = ROOT / relative
        if not path.exists():
            failures.append(f"missing {relative}")

    if failures:
        for failure in failures:
            print(failure, file=sys.stderr)
        return 1

    print("Base 2 scaffold validation passed.")
    return 0


def parser() -> argparse.ArgumentParser:
    command = argparse.ArgumentParser(description="Forja scaffolding helpers")
    subparsers = command.add_subparsers(dest="subcommand", required=True)

    seed = subparsers.add_parser("seed-base2", help="Create the Base 2 content scaffold")
    seed.add_argument("--force", action="store_true", help="Overwrite existing files")

    level = subparsers.add_parser("add-level", help="Create a level scaffold")
    level.add_argument("--id", required=True)
    level.add_argument("--dir-name", required=True)
    level.add_argument("--slug", required=True)
    level.add_argument("--title", required=True)
    level.add_argument("--domain", required=True, choices=["languages", "systems", "compilers", "advanced"])
    level.add_argument("--order", required=True, type=int)
    level.add_argument("--group")
    level.add_argument("--sublevel-order", type=int)
    level.add_argument("--prerequisite", action="append", default=[])
    level.add_argument("--project", action="append", default=[])
    level.add_argument("--force", action="store_true")

    project = subparsers.add_parser("add-project", help="Create a project scaffold")
    project.add_argument("--id", required=True)
    project.add_argument("--title", required=True)
    project.add_argument("--track", required=True, choices=["focused", "integrating"])
    project.add_argument("--anchor-level", required=True)
    project.add_argument("--display-level", action="append", default=[])
    project.add_argument("--language", action="append", default=[])
    project.add_argument("--no-language", action="store_true")
    project.add_argument("--force", action="store_true")

    phase = subparsers.add_parser("add-phase", help="Create a phase scaffold")
    phase.add_argument("--project-id", required=True)
    phase.add_argument("--language", required=True, choices=["c", "rust"])
    phase.add_argument("--phase", required=True)
    phase.add_argument("--force", action="store_true")

    subparsers.add_parser("validate", help="Validate the Base 2 scaffold")

    return command


def main() -> int:
    args = parser().parse_args()
    if args.subcommand == "seed-base2":
        seed_base2(args.force)
        return 0
    if args.subcommand == "add-level":
        add_level(args)
        return 0
    if args.subcommand == "add-project":
        add_project(args)
        return 0
    if args.subcommand == "add-phase":
        add_phase(args)
        return 0
    if args.subcommand == "validate":
        return validate()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())