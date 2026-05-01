#!/usr/bin/env python3
"""
TerraScan — Script de reconstruction
Usage: python3 rebuild.py
Lit les 4 fichiers sources et assemble index.html
"""
import re, subprocess, sys, shutil

def build():
    with open("src/terrascan_head.html") as f: head = f.read()
    with open("src/terrascan.css") as f: css = f.read()
    with open("src/terrascan_body.html") as f: body = f.read()
    with open("src/terrascan.js") as f: js = f.read()

    # Valider JS
    with open("/tmp/ts_check.js","w") as f2: f2.write(js)
    r = subprocess.run(["node","--check","/tmp/ts_check.js"],capture_output=True,text=True)
    if r.returncode != 0:
        print("❌ JS invalide:", r.stderr[:200])
        sys.exit(1)
    print("✅ JS valide")

    # Vérifier divs
    html_p = head + body
    o = len(re.findall(r"<div[^>]*>", html_p))
    cl = html_p.count("</div>")
    if o != cl:
        print(f"⚠️  Divs déséquilibrés: {o}/{cl}")
    else:
        print(f"✅ Divs: {o}/{cl}")

    # Assembler
    final = head + "<style>\n" + css + "\n</style>\n" + body + "<script>\n" + js + "\n</script>\n</html>\n"

    with open("public/index.html","w") as f2: f2.write(final)
    shutil.copy("public/index.html","../index.html") if __import__("os").path.exists("../index.html") else None
    print(f"✅ Build OK — {len(final):,} chars → public/index.html")

if __name__ == "__main__":
    build()
