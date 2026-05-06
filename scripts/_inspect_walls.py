"""Inspeccionar los párrafos > 10 oraciones para distinguir listas de prosa real."""
import sys, re, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from forja import strip_code_blocks, split_paragraphs, split_sentences

paths = [
    "content/theory/L3-pipeline-compilacion-c/chapters/00-introduccion.md",
    "content/theory/L4-build-system-rust/chapters/06-profiles.md",
    "content/intro/workspace/workspace.md",
    "content/theory/L0-setup-laboratorio/exercises/03-leer-verify-setup.md",
    "content/theory/L4-build-system-rust/exercises/01-crear-crate.md",
]
for p in paths:
    txt = pathlib.Path(p).read_text(encoding="utf-8")
    txt = strip_code_blocks(txt)
    paras = split_paragraphs(txt)
    print(f"\n### {p}")
    for i, par in enumerate(paras):
        sents = split_sentences(par)
        if len(sents) > 10:
            print(f"  párrafo #{i} con {len(sents)} oraciones — comienza: {par[:140]!r}")
            print(f"    ¿es lista? {par.lstrip().startswith(('-','*','1.','2.'))}")
            print(f"    contiene saltos a guión? {bool(re.search(r'\\n\\s*-', par))}")
