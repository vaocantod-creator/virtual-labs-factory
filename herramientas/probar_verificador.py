#!/usr/bin/env python3
"""Control negativo del verificador: inyecta defectos conocidos en una COPIA del repo y comprueba que cada uno se detecta.
Uso: python3 herramientas/probar_verificador.py     (codigo de salida 1 si algun defecto no se detecta o hay un falso positivo en la copia limpia)"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)


def copiar():
    d = tempfile.mkdtemp(prefix="vlf-neg-", dir=os.path.dirname(RAIZ))
    dst = os.path.join(d, "repo")
    shutil.copytree(RAIZ, dst, ignore=shutil.ignore_patterns(".git", "node_modules", "dist", "public"), symlinks=False)
    return d, dst


def verificar(repo):
    r = subprocess.run([sys.executable, os.path.join(repo, "herramientas", "proyecto.py"), "verificar"], capture_output=True, text=True)
    return r.returncode, r.stdout


def editar(repo, rel, f):
    p = os.path.join(repo, rel)
    t = open(p, encoding="utf-8").read()
    n = f(t)
    assert n != t, f"la inyeccion no cambio {rel}"
    open(p, "w", encoding="utf-8").write(n)


CASOS = [
    ("ruta inexistente citada", lambda r: editar(r, "docs/14-despliegue-laboratorio.md", lambda t: t + "\nVer `docs/lab-rbot/no-existe.md`.\n"), r"\[ruta\].*no-existe\.md"),
    ("cifra de pruebas incorrecta", lambda r: editar(r, "docs/lab-rbot/decisions/0004-modo-laboratorio-salas.md", lambda t: t.replace("52 comprobaciones", "51 comprobaciones", 1)), r"\[cifras\].*0004.*51.*servidor"),
    ("cifra de propiedades incorrecta", lambda r: editar(r, "README.md", lambda t: t.replace("103 propiedades", "100 propiedades", 1)), r"\[cifras\].*README.*100.*propiedades"),
    ("frase obsoleta reintroducida", lambda r: editar(r, "docs/14-despliegue-laboratorio.md", lambda t: t + "\nNota: no hay red UDP todavia.\n"), r"\[obsoleto\].*no hay red UDP"),
    ("ADR nuevo no mencionado en el README ni en estado.json", lambda r: open(os.path.join(r, "docs/lab-rbot/decisions/0005-prueba.md"), "w").write("# ADR-0005: prueba\n\n- **Estado:** propuesta\n"), r"\[(readme|estado)\].*ADR-0005"),
    ("documento nuevo en docs/ sin README ni resumen", lambda r: open(os.path.join(r, "docs/15-nuevo.md"), "w").write("# Nuevo\n"), r"\[(readme|indice)\].*15-nuevo"),
    ("codigo cambiado despues de las pruebas", lambda r: editar(r, "prototypes/rbot-web/bridge/puente.mjs", lambda t: t + "\n// cambio\n"), r"\[estado\].*codigo.*cambio"),
    ("indice desactualizado", lambda r: editar(r, "docs/INDEX.md", lambda t: t + "\nlinea manual\n"), r"\[indice\].*INDEX\.md.*desactualizado"),
    ("estado de un ADR cambiado a mano", lambda r: editar(r, "docs/lab-rbot/decisions/0001-seleccion-de-stack.md", lambda t: t.replace("ACEPTADA", "RECHAZADA", 1)), r"\[estado\].*ADR-0001"),
    ("la ultima corrida de pruebas tuvo un fallo", lambda r: editar(r, "docs/estado.json", lambda t: t.replace('"todo_ok": true', '"todo_ok": false', 1)), r"\[estado\].*fallos"),
    ("archivo del arbol del README que no existe", lambda r: editar(r, "README.md", lambda t: t.replace("  HEURISTICA.md                   <-", "  FANTASMA.md                     <- no existe\n  HEURISTICA.md                   <-", 1)), r"\[readme\].*FANTASMA"),
    ("resumen del indice de un doc que cambio", lambda r: editar(r, "docs/03-roadmap.md", lambda t: t + "\n- [x] algo nuevo\n"), r"\[indice\].*03-roadmap.*cambio"),
]

fallos = 0
d, base = copiar()
try:
    rc, out = verificar(base)
    ok = rc == 0
    print(f"{'OK ' if ok else 'FALLA'} copia limpia: sin errores (falsos positivos)" + ("" if ok else "\n" + out[:600]))
    fallos += 0 if ok else 1
    shutil.rmtree(d)
    for nombre, inyectar, esperado in CASOS:
        d, repo = copiar()
        try:
            inyectar(repo)
            rc, out = verificar(repo)
            detectado = rc == 1 and re.search(esperado, out) is not None
            print(f"{'OK ' if detectado else 'FALLA'} detecta: {nombre}")
            if not detectado:
                fallos += 1
                print("   salida:", out.strip()[:400].replace("\n", " | "))
        finally:
            shutil.rmtree(d, ignore_errors=True)
finally:
    shutil.rmtree(d, ignore_errors=True)
print(f"CONTROL NEGATIVO: {len(CASOS)} defectos inyectados, fallos {fallos}")
sys.exit(1 if fallos else 0)
