#!/usr/bin/env python3

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import Counter, defaultdict
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


def create_level(level: dict[str, object], force: bool) -> None:
    level_dir = THEORY_ROOT / level_dir_name(level)
    level_dir.mkdir(parents=True, exist_ok=True)

    context = {
        "level_id": level["id"],
        "level_title": level["title"],
        "level_slug": level["slug"],
        "level_projects": format_bullets(level["projects"], "Sin proyectos asociados todavia."),
        "level_prerequisites": format_bullets(level["prerequisites"], "Sin prerequisitos declarados."),
    }
    write_file(level_dir / "README.md", render_template(TEMPLATES_ROOT / "level" / "README.md.tpl", context), force)
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
        if not level_dir.exists():
            failures.append(f"missing {level_dir.relative_to(ROOT).as_posix()}")

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

    print("Forja scaffold validation passed.")
    return 0


# ---------------------------------------------------------------------------
# editorial-stats: medición de adherencia al estándar editorial v2
# ---------------------------------------------------------------------------

EDITORIAL_DEFAULT_TARGETS = [
    "content/intro/forja",
    "content/intro/workspace",
    "content/theory/L0-setup-laboratorio",
    "content/theory/L1-modelo-mental-computadora",
    "content/theory/L2-representacion-informacion",
    "content/theory/L3-pipeline-compilacion-c",
    "content/theory/L4-build-system-rust",
]

# Documentos de diseño (§6.6 estándar): contrato más laxo, excluidos por defecto.
EDITORIAL_DESIGN_DOC_NAMES = {"outline.md"}
EDITORIAL_DESIGN_DOC_PREFIXES = ("laboratorio", "simulador")

# Muletillas críticas (R1): presupuesto agregado por archivo = 2.
MULETILLAS_CRITICAS = [
    "conviene", "básicamente", "obviamente", "claramente",
    "de hecho", "en realidad", "por supuesto", "sin duda",
]

# Intensificadores ornamentales (R1.bis): presupuesto agregado por archivo = 3.
# `exactamente` se trata aparte (uso técnico legítimo dominante).
INTENSIFICADORES = ["simplemente", "realmente", "efectivamente"]

# `exactamente`: solo cuenta como ornamental si NO matchea ninguna señal técnica
# en su contexto inmediato (±15 caracteres). Ver analyze_exactamente().
EXACTAMENTE_TECNICO_DERECHA = re.compile(
    r"^\s*(?:\$|\d|un[ao]?\b|uno\b|dos\b|tres\b|cuatro\b|cinco\b|seis\b|siete\b|ocho\b|nueve\b|diez\b|n\b|N\b|"
    r"igual\b|lo\s+mismo\b|lo\s+que\b|la\s+misma\b|el\s+mismo\b|los\s+mismos\b|las\s+mismas\b|"
    r"este\b|esta\b|esto\b|esa\b|ese\b|esos\b|esas\b|estos\b|estas\b|aquell|"
    r"como\s+en\b|qu[ée]\b|c[óo]mo\b|d[óo]nde\b|cu[áa]l\b|cu[áa]ndo\b|cu[áa]nto\b|"
    r"eso\b|la\s+lista\b|la\s+cadena\b|byte\b|bytes\b|l[íi]nea\b|l[íi]neas\b|"
    r"[\"«:,])",
    re.IGNORECASE,
)
EXACTAMENTE_TECNICO_IZQUIERDA = re.compile(
    r"(?:\bqu[ée]\b|\bcu[áa]l\b|\bd[óo]nde\b|\bcu[áa]ndo\b|\bc[óo]mo\b|\bcu[áa]nto\b|\bpor\s+qu[ée]\b|"
    r"\bsignifica\b|\bsignifican\b|\bequivale,?\s*|\bcontiene\b|\bcontienen\b|\blist[óo]\b|\blistan\b|"
    r"\bcompila\b|\bcompilan\b|\bes\b|\bson\b|\bsigue\b|\bsiguen\b|\bser\b|\bhace\b|\bhacen\b|"
    r"\bcoincid\w*|\brepresent\w*|\bpredec\w*|\bpredic\w*|\bcomport\w*|\bconsist\w*|\bubicar\b|\bubica\b|\breproduc\w*|\bda\b|\bdan\b|\bvale\b|\bvalen\b|\bdescrib\w*)\s+(?:\w+\s+){0,3}$",
    re.IGNORECASE,
)

# Frases con riesgo de muletilla (A1, A2): una vez puede estar bien usada;
# repetirla en el mismo archivo la convierte en tic. Umbral por repetición, no por aparición.
# Las que son apertura formuláica ("en este capítulo veremos", "vamos a ver", "a lo largo de")
# ya están cubiertas por APERTURAS_FORMULAICAS y no se repiten acá.
FRASES_RIESGO_MULETILLA = [
    "el lector va a aprender",
    "el lector aprenderá",
    "es importante notar",
    "vale la pena destacar",
    "cabe destacar",
    "como mencionamos",
    "como ya vimos",
]

# Aperturas formulaicas (A2): primer párrafo de capítulo no debe empezar con esto.
APERTURAS_FORMULAICAS = [
    r"^en este cap[íi]tulo\b",
    r"^vamos a ver\b",
    r"^como (?:ya )?vimos\b",
    r"^a lo largo de\b",
    r"^bienvenid[oa]s?\b",
]

# Umbrales (verde si la métrica cumple, rojo si la viola).
UMBRALES = {
    "muletillas_criticas_total": 2,        # ≤ 2 por archivo
    "intensificadores_total": 3,           # ≤ 3 por archivo (sin contar `exactamente`)
    "exactamente_ornamental": 2,           # ≤ 2 usos no técnicos por archivo
    "parrafos_muralla": 0,                 # 0 párrafos > 10 oraciones
    "oraciones_largas": 0,                 # 0 oraciones > 60 palabras
    "em_dash_runs_largos": 0,              # 0 corridas > 3 párrafos consecutivos con em-dash
    "em_dash_pares_excesivos": 0,          # 0 párrafos con > 2 pares de em-dash
    "frases_repetidas": 1,                 # 1 ocurrencia está bien; 2+ es muletilla
    "apertura_formulaica": 0,              # 0/1 por archivo
    "preguntas_retoricas_seguidas": 0,     # 0 corridas de ≥3 párrafos terminados en ?
}

# Headers de tabla en el mismo orden que UMBRALES, más identificación.
METRIC_KEYS = list(UMBRALES.keys())


def is_editorial_design_doc(path: Path) -> bool:
    name = path.name.lower()
    if name in EDITORIAL_DESIGN_DOC_NAMES:
        return True
    return any(name.startswith(p) for p in EDITORIAL_DESIGN_DOC_PREFIXES)


def iter_editorial_files(targets: list[Path], include_design: bool) -> list[Path]:
    out: list[Path] = []
    for target in targets:
        if not target.exists():
            continue
        for md in sorted(target.rglob("*.md")):
            if not include_design and is_editorial_design_doc(md):
                continue
            out.append(md)
    return out


def strip_code_blocks(text: str) -> str:
    """Quita ```fenced``` blocks y `inline` para no contaminar conteos."""
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"`[^`\n]+`", "", text)
    return text


def split_paragraphs(text: str) -> list[str]:
    parts = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    # Filtrar bloques que parecen tablas, headings o listas: la regla R3
    # ("párrafo > 10 oraciones") aplica a prosa, no a enumeraciones.
    out: list[str] = []
    for p in parts:
        head = p.lstrip()
        if head.startswith(("|", "#", "- ", "* ", "+ ", "> ")):
            continue
        if re.match(r"^\d+[.)]\s", head):
            continue
        out.append(p)
    return out


def split_sentences(paragraph: str) -> list[str]:
    # Aproximación: dividir por . ! ? seguidos de espacio o fin.
    # Conservar abreviaciones comunes intactas no es crítico aquí.
    raw = re.split(r"(?<=[.!?])\s+", paragraph.strip())
    return [s for s in raw if s]


def count_word(text_lower: str, word: str) -> int:
    # word boundary que acepte tildes
    pat = r"(?<![a-záéíóúñü])" + re.escape(word) + r"(?![a-záéíóúñü])"
    return len(re.findall(pat, text_lower))


def analyze_exactamente(text: str) -> tuple[int, int, list[str]]:
    """Devuelve (total, ornamental, ejemplos_ornamentales).

    Una ocurrencia de `exactamente` se considera **técnica** (no cuenta) si en su
    contexto inmediato aparece alguna señal: número, identidad referencial
    (`igual`, `lo mismo`, `este/esa/...`), pregunta de precisión (`qué/cómo/...`),
    cita, dos puntos, o verbo equivalencial. Si ninguna señal está presente,
    cuenta como **ornamental**.
    """
    pat = re.compile(r"(?<![a-záéíóúñü])exactamente(?![a-záéíóúñü])", re.IGNORECASE)
    total = 0
    ornamental = 0
    ejemplos: list[str] = []
    for m in pat.finditer(text):
        total += 1
        start, end = m.span()
        izq = text[max(0, start - 60):start]
        der = text[end:end + 60]
        es_tecnico = bool(
            EXACTAMENTE_TECNICO_DERECHA.match(der)
            or EXACTAMENTE_TECNICO_IZQUIERDA.search(izq)
        )
        if not es_tecnico:
            ornamental += 1
            if len(ejemplos) < 5:
                ctx = (izq + "**exactamente**" + der).replace("\n", " ").strip()
                ejemplos.append(ctx)
    return total, ornamental, ejemplos


def analyze_text(text: str) -> dict[str, object]:
    text_clean = strip_code_blocks(text)
    text_lower = text_clean.lower()

    # Muletillas críticas e intensificadores
    muletillas_breakdown: Counter[str] = Counter()
    for w in MULETILLAS_CRITICAS:
        c = count_word(text_lower, w)
        if c:
            muletillas_breakdown[w] = c
    muletillas_total = sum(muletillas_breakdown.values())

    intensificadores_breakdown: Counter[str] = Counter()
    for w in INTENSIFICADORES:
        c = count_word(text_lower, w)
        if c:
            intensificadores_breakdown[w] = c
    intensificadores_total = sum(intensificadores_breakdown.values())

    # `exactamente` se mide aparte con filtro contextual.
    exactamente_total, exactamente_ornamental, exactamente_ejemplos = analyze_exactamente(text_clean)

    # Frases vetadas
    # Frases con riesgo de muletilla: contamos la repetición máxima de
    # cualquiera de las frases. Una vez puede estar bien usada; 2+ es muletilla.
    repetidas_breakdown: Counter[str] = Counter()
    for f in FRASES_RIESGO_MULETILLA:
        c = text_lower.count(f)
        if c:
            repetidas_breakdown[f] = c
    frases_repetidas = max(repetidas_breakdown.values()) if repetidas_breakdown else 0

    # Análisis por párrafo
    paragraphs = split_paragraphs(text_clean)
    parrafos_muralla = 0
    oraciones_largas = 0
    em_dash_pares_excesivos = 0
    em_dash_flags: list[bool] = []
    preguntas_flags: list[bool] = []
    sentence_counts: list[int] = []
    word_counts: list[int] = []

    for p in paragraphs:
        sentences = split_sentences(p)
        sentence_counts.append(len(sentences))
        if len(sentences) > 10:
            parrafos_muralla += 1
        for s in sentences:
            wc = len(s.split())
            word_counts.append(wc)
            if wc > 60:
                oraciones_largas += 1
        # Em-dash: pares "— … —"; cuento las apariciones de — y divido /2.
        em_count = p.count("—")
        em_pairs = em_count // 2
        if em_pairs > 2:
            em_dash_pares_excesivos += 1
        em_dash_flags.append(em_count >= 2)
        preguntas_flags.append(p.rstrip().endswith("?"))

    # Corridas de em-dashes (>3 consecutivos con em-dash)
    em_dash_runs_largos = 0
    run = 0
    for f in em_dash_flags:
        run = run + 1 if f else 0
        if run == 4:  # justo cuando supera 3
            em_dash_runs_largos += 1
    # Corridas de preguntas retóricas (≥3 consecutivos terminando en ?)
    preguntas_retoricas_seguidas = 0
    run = 0
    for f in preguntas_flags:
        run = run + 1 if f else 0
        if run == 3:
            preguntas_retoricas_seguidas += 1

    # Apertura formulaica: primer párrafo significativo (post-frontmatter/heading).
    apertura_formulaica = 0
    primera = next((p for p in paragraphs), "").lower().lstrip("> *_-")
    for pat in APERTURAS_FORMULAICAS:
        if re.match(pat, primera):
            apertura_formulaica = 1
            break

    return {
        "paragraphs": len(paragraphs),
        "sentences": sum(sentence_counts),
        "words": sum(word_counts),
        "muletillas_criticas_total": muletillas_total,
        "muletillas_criticas_breakdown": dict(muletillas_breakdown),
        "intensificadores_total": intensificadores_total,
        "intensificadores_breakdown": dict(intensificadores_breakdown),
        "exactamente_total": exactamente_total,
        "exactamente_ornamental": exactamente_ornamental,
        "exactamente_ejemplos": exactamente_ejemplos,
        "frases_repetidas": frases_repetidas,
        "frases_repetidas_breakdown": dict(repetidas_breakdown),
        "parrafos_muralla": parrafos_muralla,
        "oraciones_largas": oraciones_largas,
        "em_dash_pares_excesivos": em_dash_pares_excesivos,
        "em_dash_runs_largos": em_dash_runs_largos,
        "preguntas_retoricas_seguidas": preguntas_retoricas_seguidas,
        "apertura_formulaica": apertura_formulaica,
    }


def red_cells(stats: dict[str, object]) -> list[str]:
    out = []
    for k, threshold in UMBRALES.items():
        v = stats.get(k, 0)
        if isinstance(v, int) and v > threshold:
            out.append(k)
    return out


def level_of(path: Path) -> str:
    parts = path.relative_to(ROOT).parts
    # content/intro/<x>/... or content/theory/Lx-.../...
    if len(parts) >= 3 and parts[0] == "content" and parts[1] == "intro":
        return f"intro/{parts[2]}"
    if len(parts) >= 3 and parts[0] == "content" and parts[1] == "theory":
        return parts[2]
    return "?"


def format_text_report(rows: list[tuple[Path, dict]], totals: dict, verbose: bool) -> str:
    lines: list[str] = []
    lines.append("Forja editorial-stats — adherencia al estándar v2")
    lines.append("=" * 70)
    lines.append("")
    by_level: dict[str, list] = defaultdict(list)
    for path, stats in rows:
        by_level[level_of(path)].append((path, stats))

    for lvl in sorted(by_level):
        lvl_rows = by_level[lvl]
        lvl_red = sum(1 for _, s in lvl_rows if red_cells(s))
        lines.append(f"## {lvl}  ({len(lvl_rows)} archivos, {lvl_red} con celdas rojas)")
        for path, stats in lvl_rows:
            rels = path.relative_to(ROOT).as_posix()
            red = red_cells(stats)
            tag = "  ROJO" if red else "  ok"
            lines.append(f"  {tag}  {rels}")
            if red or verbose:
                summary_bits = []
                for k in METRIC_KEYS:
                    v = stats.get(k, 0)
                    threshold = UMBRALES[k]
                    if v > threshold or verbose:
                        marker = "!" if v > threshold else " "
                        summary_bits.append(f"{marker}{k}={v}/{threshold}")
                if summary_bits:
                    lines.append("        " + ", ".join(summary_bits))
                if verbose:
                    if stats["muletillas_criticas_breakdown"]:
                        lines.append(f"        muletillas: {stats['muletillas_criticas_breakdown']}")
                    if stats["intensificadores_breakdown"]:
                        lines.append(f"        intensifs:  {stats['intensificadores_breakdown']}")
                    if stats["frases_repetidas_breakdown"]:
                        lines.append(f"        repetidas:  {stats['frases_repetidas_breakdown']}")
        lines.append("")

    lines.append("## Totales globales")
    lines.append(f"  archivos analizados: {totals['files']}")
    lines.append(f"  archivos con celdas rojas: {totals['files_red']}")
    for k in METRIC_KEYS:
        lines.append(f"  {k}: {totals[k]}")
    lines.append("")
    lines.append("Umbrales: " + ", ".join(f"{k}≤{v}" for k, v in UMBRALES.items()))
    return "\n".join(lines)


def emit_csv(rows: list[tuple[Path, dict]], stream) -> None:
    writer = csv.writer(stream)
    headers = ["path", "level", "paragraphs", "sentences", "words"] + METRIC_KEYS + ["red_cells"]
    writer.writerow(headers)
    for path, stats in rows:
        rel = path.relative_to(ROOT).as_posix()
        red = red_cells(stats)
        row = [rel, level_of(path), stats["paragraphs"], stats["sentences"], stats["words"]]
        row += [stats.get(k, 0) for k in METRIC_KEYS]
        row += [";".join(red)]
        writer.writerow(row)


def emit_json(rows: list[tuple[Path, dict]], totals: dict) -> str:
    payload = {
        "totals": totals,
        "thresholds": UMBRALES,
        "files": [
            {
                "path": p.relative_to(ROOT).as_posix(),
                "level": level_of(p),
                "stats": s,
                "red_cells": red_cells(s),
            }
            for p, s in rows
        ],
    }
    return json.dumps(payload, indent=2, ensure_ascii=False)


def editorial_stats(args: argparse.Namespace) -> int:
    targets = [ROOT / t for t in (args.target or EDITORIAL_DEFAULT_TARGETS)]
    files = iter_editorial_files(targets, include_design=args.include_design)
    rows: list[tuple[Path, dict]] = []
    totals: dict = {k: 0 for k in METRIC_KEYS}
    totals["files"] = 0
    totals["files_red"] = 0
    for f in files:
        text = f.read_text(encoding="utf-8")
        stats = analyze_text(text)
        rows.append((f, stats))
        totals["files"] += 1
        if red_cells(stats):
            totals["files_red"] += 1
        for k in METRIC_KEYS:
            totals[k] += int(stats.get(k, 0))

    if args.format == "csv":
        if args.output:
            with open(args.output, "w", encoding="utf-8", newline="") as fh:
                emit_csv(rows, fh)
            print(f"escrito: {args.output}")
        else:
            emit_csv(rows, sys.stdout)
    elif args.format == "json":
        out = emit_json(rows, totals)
        if args.output:
            Path(args.output).write_text(out, encoding="utf-8")
            print(f"escrito: {args.output}")
        else:
            print(out)
    else:
        text = format_text_report(rows, totals, verbose=args.verbose)
        if args.output:
            Path(args.output).write_text(text, encoding="utf-8")
            print(f"escrito: {args.output}")
        else:
            print(text)

    return 1 if totals["files_red"] and args.strict else 0


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

    subparsers.add_parser("validate", help="Validate the Forja scaffold")

    stats = subparsers.add_parser(
        "editorial-stats",
        help="Mide adherencia al estándar editorial v2 sobre intros + L0–L4",
    )
    stats.add_argument(
        "--target", action="append",
        help="Ruta relativa a la raíz; repetible. Default: intros + L0–L4.",
    )
    stats.add_argument(
        "--include-design", action="store_true",
        help="Incluir outline.md y laboratorio-v2*.md (excluidos por defecto, §6.6)",
    )
    stats.add_argument("--format", choices=["text", "csv", "json"], default="text")
    stats.add_argument("--output", help="Escribir a archivo en vez de stdout")
    stats.add_argument("--verbose", action="store_true", help="Mostrar todos los campos por archivo")
    stats.add_argument("--strict", action="store_true", help="Exit 1 si hay archivos en rojo")

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
    if args.subcommand == "editorial-stats":
        return editorial_stats(args)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())