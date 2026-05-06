import json
d = json.load(open("metadata/editorial-stats-baseline.json", encoding="utf-8"))

def show(label, key):
    print(f"=== {label} > 0 ===")
    rows = sorted(d["files"], key=lambda f: -f["stats"][key])
    for f in rows:
        s = f["stats"]
        v = s[key]
        if v > 0:
            extra = s.get(f"{key}_breakdown", "")
            print(f"  {v:2d}  {f['path']}  {extra if extra else ''}")
    print()

show("INTENSIFICADORES (sin exactamente)", "intensificadores_total")
show("PARRAFOS MURALLA", "parrafos_muralla")
show("EM-DASH PARES EXCESIVOS", "em_dash_pares_excesivos")
show("ORACIONES LARGAS", "oraciones_largas")
print(f"em_dash_runs_largos total: {sum(f['stats']['em_dash_runs_largos'] for f in d['files'])}")
