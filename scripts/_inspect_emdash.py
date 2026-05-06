"""Mostrar los párrafos con > 1 par de em-dashes."""
import sys, pathlib
sys.path.insert(0, "scripts")
from forja import strip_code_blocks, split_paragraphs

paths = [
    "content/theory/L2-representacion-informacion/chapters/07-utf8.md",
    "content/theory/L1-modelo-mental-computadora/chapters/07-codigo-datos-programa.md",
    "content/theory/L2-representacion-informacion/chapters/01-bits-bytes-ancho.md",
    "content/theory/L2-representacion-informacion/chapters/06-texto-ascii.md",
    "content/theory/L3-pipeline-compilacion-c/chapters/00-introduccion.md",
]
for p in paths:
    txt = strip_code_blocks(pathlib.Path(p).read_text(encoding="utf-8"))
    print(f"\n### {p}")
    for i, par in enumerate(split_paragraphs(txt)):
        em = par.count("—")
        if em // 2 > 1:
            print(f"  párrafo #{i} con {em} em-dashes ({em//2} pares):")
            print(f"    {par[:400]}")
            print()
