"""Gera index.html autocontido (fontes e imagens embutidas em base64).
Uso: python3 build.py"""
import base64, re, pathlib, math, random
here = pathlib.Path(__file__).parent
src = (here / "deck.html").read_text(encoding="utf-8")
mime = {".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2"}

def data_uri(name):
    p = here / "assets" / name
    return f"data:{mime[p.suffix]};base64," + base64.b64encode(p.read_bytes()).decode()

# linhas topográficas (assinatura visual do deck Uai Sô!)
random.seed(7)
paths = []
for k in range(9):
    cy = 60 + k * 105
    pts = []
    for x in range(-40, 1680, 40):
        y = cy + 26 * math.sin(x / 170 + k * 0.9) + 14 * math.sin(x / 63 + k)
        pts.append(f"{x},{y:.1f}")
    paths.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="currentColor" stroke-width="1.6"/>')
topo = '<svg class="topo" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">' + "".join(paths) + "</svg>"

out = re.sub(r"\{\{(?:IMG|FONT):([^}]+)\}\}", lambda m: data_uri(m.group(1)), src)
out = out.replace("{{TOPO}}", topo)
(here.parent / "index.html").write_text(out, encoding="utf-8")
print("index.html", len(out) // 1024, "KB")
