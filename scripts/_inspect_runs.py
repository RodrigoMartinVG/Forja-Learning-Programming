"""Encontrar las corridas de >3 párrafos consecutivos con em-dashes."""
import sys, pathlib
sys.path.insert(0, "scripts")
from forja import strip_code_blocks, split_paragraphs

paths = [
    "content/theory/L2-representacion-informacion/chapters/01-bits-bytes-ancho.md",
    "content/theory/L2-representacion-informacion/chapters/08-endianness.md",
]
for p in paths:
    txt = strip_code_blocks(pathlib.Path(p).read_text(encoding="utf-8"))
    paras = split_paragraphs(txt)
    print(f"\n### {p}")
    flags = [par.count("—") >= 2 for par in paras]
    run = 0
    runs = []
    for i, f in enumerate(flags):
        if f:
            run += 1
        else:
            if run >= 4:
                runs.append((i - run, i - 1, run))
            run = 0
    if run >= 4:
        runs.append((len(paras) - run, len(paras) - 1, run))
    for start, end, length in runs:
        print(f"  corrida párrafos {start}..{end} ({length} consecutivos)")
        for j in range(start, end + 1):
            print(f"    [{j}] {paras[j][:200]}")
            print()
