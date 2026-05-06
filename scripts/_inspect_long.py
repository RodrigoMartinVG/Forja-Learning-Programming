"""Mostrar oraciones de >50 palabras."""
import sys, pathlib, json
sys.path.insert(0, "scripts")
from forja import strip_code_blocks, split_paragraphs, split_sentences

d = json.load(open("metadata/editorial-stats-baseline.json", encoding="utf-8"))
hot = sorted(d["files"], key=lambda f: -f["stats"]["oraciones_largas"])
for f in hot:
    s = f["stats"]
    if s["oraciones_largas"] >= 2:
        print(f"\n### {f['path']}  ({s['oraciones_largas']} oraciones largas)")
        txt = strip_code_blocks(pathlib.Path(f["path"]).read_text(encoding="utf-8"))
        for par in split_paragraphs(txt):
            for sent in split_sentences(par):
                wc = len(sent.split())
                if wc > 50:
                    print(f"  [{wc}p] {sent[:300]}")
                    print()
