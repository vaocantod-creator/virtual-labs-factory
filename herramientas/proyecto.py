#!/usr/bin/env python3
"""Memoria economica del proyecto virtual-labs-factory (solo biblioteca estandar de Python 3).

Problema que resuelve: el estado del proyecto vivia copiado en muchos documentos y cada copia envejecia distinto, y entender el
repo costaba ~155.000 tokens. Aqui hay una sola fuente de cifras (docs/estado.json, salida real de las pruebas), un indice
compacto (docs/INDEX.md) y un verificador de coherencia.

Comandos:
  indice                    regenera docs/INDEX.md (determinista: sin fechas de ejecucion de este comando)
  verificar [--remoto]      comprueba coherencia; codigo de salida 1 si hay ERROR. --remoto compara con GitHub (arbol de hashes)
  estado <resultados.json>  fusiona la salida de tools/correr-todo.mjs en docs/estado.json (+ huella del codigo y ADRs)
  resumir <ruta> <texto|=>  fija el resumen de una linea de un documento ("=" conserva el texto y refresca su hash)
  seccion <ruta> <titulo>   imprime SOLO una seccion de un documento (busqueda por fragmento del titulo, sin acentos)
  publicar <mensaje> [--aplicar]  sube a GitHub SOLO lo que difiere (por hash). Sin --aplicar solo muestra el plan. No borra nada remoto.
  todo [--remoto]           indice + verificar

Opciones globales: --raiz DIR (por defecto, el repo que contiene esta carpeta).
"""
import argparse
import hashlib
import json
import os
import re
import sys
import unicodedata
import urllib.request

IGNORAR_DIRS = {".git", "node_modules", "dist", "public", "__pycache__"}
IGNORAR_ARCHIVOS = {".resultados.json"}
GENERADOS = {"docs/INDEX.md", "docs/estado.json"}  # no se listan en el indice (su tamano cambia al generarlo)
EXT_CODIGO = {".ts", ".mjs", ".sh", ".java", ".html"}
SIN_RESUMEN = {"docs/lab-instrumentacion/transcripciones.md"}  # datos crudos: se indexan sin exigir resumen


def sin_acentos(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


def sha_blob(b):
    return hashlib.sha1(b"blob %d\0" % len(b) + b).hexdigest()


def tokens(n):
    return int(n / 3.5)


class Repo:
    def __init__(self, raiz):
        self.raiz = os.path.abspath(raiz)
        self.config = self._json("herramientas/verificador.json", {})

    def ruta(self, rel):
        return os.path.join(self.raiz, rel)

    def _json(self, rel, defecto):
        try:
            with open(self.ruta(rel), encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return defecto

    def archivos(self):
        out = []
        for r, ds, fs in os.walk(self.raiz):
            ds[:] = sorted(d for d in ds if d not in IGNORAR_DIRS)
            for f in sorted(fs):
                if f in IGNORAR_ARCHIVOS:
                    continue
                full = os.path.join(r, f)
                if os.path.islink(full):
                    continue
                out.append(os.path.relpath(full, self.raiz).replace(os.sep, "/"))
        return sorted(out)

    def texto(self, rel):
        with open(self.ruta(rel), encoding="utf-8", errors="replace") as f:
            return f.read()

    def bytes(self, rel):
        with open(self.ruta(rel), "rb") as f:
            return f.read()

    def mds(self):
        return [p for p in self.archivos() if p.endswith(".md")]

    def huella_codigo(self):
        """Hash de todo el codigo ejecutable bajo prototypes/ (sin .md): ata las cifras de las pruebas a una version concreta del codigo."""
        h = hashlib.sha1()
        for p in self.archivos():
            if p.startswith("prototypes/") and not p.endswith(".md"):
                h.update(p.encode())
                h.update(self.bytes(p))
        return h.hexdigest()[:16]


# ---------------------------------------------------------------- utilidades de markdown
def encabezados(texto):
    """[(nivel, titulo, linea_1_based)] ignorando bloques de codigo."""
    out, en_codigo = [], False
    for i, l in enumerate(texto.splitlines(), 1):
        if l.lstrip().startswith("```"):
            en_codigo = not en_codigo
            continue
        if en_codigo:
            continue
        m = re.match(r"^(#{1,4})\s+(.*\S)\s*$", l)
        if m:
            out.append((len(m.group(1)), m.group(2), i))
    return out


def linea_estado(texto):
    for l in texto.splitlines()[:14]:
        m = re.search(r"\*\*Estado:?\*\*:?\s*(.+)|^>?\s*Estado:\s*(.+)", l)
        if m:
            s = (m.group(1) or m.group(2)).strip()
            s = re.sub(r"[*`]", "", s)
            return s[:110]
    return ""


def enlaces_a_docs(texto, propio):
    out = set()
    for m in re.finditer(r"`?((?:docs/)?(\d\d)-[a-z0-9-]+\.md)`?", texto):
        if m.group(1).endswith(propio):
            continue
        out.add(m.group(2))
    return sorted(out)


def proposito_codigo(texto, ext):
    lineas = texto.splitlines()
    if ext == ".sh":
        for l in lineas[1:8]:
            if l.startswith("#"):
                return l.lstrip("# ").strip()[:110]
        return ""
    for l in lineas[:14]:
        s = l.strip()
        if s.startswith("//"):
            return s.lstrip("/ ").strip()[:110]
        if s.startswith("/**"):
            r = s[3:].strip(" */")
            if r:
                return r[:110]
            continue
        if s.startswith("*") and not s.startswith("*/"):
            return s.lstrip("* ").strip()[:110]
        if s.startswith("<title>") or "<title>" in s:
            m = re.search(r"<title>(.*?)</title>", s)
            if m:
                return m.group(1)[:110]
    return ""


# ---------------------------------------------------------------- estado
def cargar_estado(repo):
    return repo._json("docs/estado.json", None)


def adrs_del_repo(repo):
    out = []
    for p in repo.mds():
        m = re.search(r"decisions/(\d{4})-.*\.md$", p)
        if not m or m.group(1) == "0000":
            continue
        t = repo.texto(p)
        h1 = next((h[1] for h in encabezados(t) if h[0] == 1), p)
        out.append({"id": "ADR-" + m.group(1), "archivo": p, "titulo": re.sub(r"^ADR-\d{4}:\s*", "", h1)[:100], "estado": linea_estado(t)})
    return sorted(out, key=lambda a: a["id"])


def cmd_estado(repo, resultados):
    with open(resultados, encoding="utf-8") as f:
        res = json.load(f)
    previo = cargar_estado(repo) or {}
    nuevo = {
        "descripcion": "Fuente unica de las cifras de verificacion. Generado por herramientas/proyecto.py estado a partir de prototypes/rbot-web/tools/correr-todo.mjs. No editar a mano las cifras.",
        "ejecutado": res["generado"][:10],
        "huella_codigo": repo.huella_codigo(),
        "node": res.get("node"),
        "todo_ok": res["todo_ok"],
        "pruebas": {r["id"]: {k: r[k] for k in ("descripcion", "total", "fallos", "ok", "segundos") if k in r} | ({"entregados": r["entregados"]} if "entregados" in r else {}) for r in res["resultados"]},
        "adrs": adrs_del_repo(repo),
        # Lista mantenida a mano: lo que NO se ha comprobado. Se conserva entre regeneraciones.
        "no_comprobado": previo.get("no_comprobado", []),
    }
    with open(repo.ruta("docs/estado.json"), "w", encoding="utf-8") as f:
        json.dump(nuevo, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"docs/estado.json escrito: {len(nuevo['pruebas'])} grupos de pruebas, huella {nuevo['huella_codigo']}, todo_ok={nuevo['todo_ok']}")


# ---------------------------------------------------------------- indice
def generar_indice(repo):
    est = cargar_estado(repo)
    res = repo._json("docs/indice-resumenes.json", {})
    L = []
    L.append("# INDICE del proyecto (generado: no editar)\n")
    L.append("> Generado por `python3 herramientas/proyecto.py indice`. Se lee ANTES que cualquier documento: dice que hay, en que estado, y donde (con lineas) para leer solo lo necesario.")
    L.append("> Leer una seccion: `python3 herramientas/proyecto.py seccion <ruta> <titulo>`. Comprobar coherencia: `python3 herramientas/proyecto.py verificar`.\n")
    if est:
        L.append(f"## Estado verificado (de `docs/estado.json`, pruebas del {est['ejecutado']}, huella de codigo `{est['huella_codigo']}`)\n")
        for k, v in est["pruebas"].items():
            marca = "OK " if v.get("ok") else "FALLA"
            cifra = f"{v['total']} (fallos {v['fallos']})" if v.get("total") is not None else "sin cifra"
            L.append(f"- {marca} `{k}`: {cifra} — {v.get('descripcion','')}")
        L.append("")
        L.append("**ADR:** " + "; ".join(f"{a['id']} {a['titulo'][:55]} [{a['estado'][:40]}]" for a in est["adrs"]))
        L.append("")
        if est["no_comprobado"]:
            L.append("**NO comprobado (no darlo por hecho):** " + "; ".join(est["no_comprobado"]))
            L.append("")
    else:
        L.append("## Estado verificado\n\n_Falta `docs/estado.json`: ejecutar `tools/correr-todo.mjs` y `proyecto.py estado`._\n")

    L.append("## Documentos\n")
    total_tok = 0
    for p in repo.mds():
        if p in GENERADOS:
            continue
        t = repo.texto(p)
        n = len(t)
        total_tok += tokens(n)
        h = encabezados(t)
        h1 = next((x[1] for x in h if x[0] == 1), "")
        r = res.get(p)
        resumen = r["resumen"] if r else "(SIN RESUMEN)"
        viejo = r and r.get("sha") != hashlib.sha1(t.encode("utf-8")).hexdigest()
        cab = f"### `{p}` (~{tokens(n)} tok)"
        est_l = linea_estado(t)
        L.append(cab + (f" — Estado: {est_l}" if est_l else ""))
        L.append(f"{h1[:90]}. {resumen}" + (" **[resumen posiblemente desactualizado]**" if viejo else ""))
        if n > 5000 and p not in SIN_RESUMEN:
            sec = [f"{x[1][:38]} (L{x[2]})" for x in h if x[0] == 2]
            if sec:
                L.append("Secciones: " + " · ".join(sec))
        elif p in SIN_RESUMEN:
            L.append("Datos crudos: no leer completo; usar `seccion`.")
        enl = enlaces_a_docs(t, os.path.basename(p))
        if enl:
            L.append("Enlaza: docs " + ",".join(enl))
        L.append("")
    L.append(f"_Total de documentos: {len([m for m in repo.mds() if m not in GENERADOS])}, ~{total_tok} tokens si se leyeran todos._\n")

    L.append("## Codigo y datos (proposito = primer comentario del archivo)\n")
    for p in repo.archivos():
        ext = os.path.splitext(p)[1]
        base = os.path.basename(p)
        if p.endswith(".md"):
            continue
        if ext in EXT_CODIGO or base == "Dockerfile":
            t = repo.texto(p)
            L.append(f"- `{p}` ({len(t.splitlines())} lineas): {proposito_codigo(t, ext) or '-'}")
        elif p.startswith(("prototypes/", "docs/")) and ext in (".json", ".txt", ".png", ".jpg"):
            if base in ("package-lock.json",) or p in GENERADOS:
                continue
            L.append(f"- `{p}` ({os.path.getsize(repo.ruta(p))} bytes): datos/config")
    L.append("")
    return "\n".join(L)


def cmd_indice(repo):
    txt = generar_indice(repo)
    with open(repo.ruta("docs/INDEX.md"), "w", encoding="utf-8") as f:
        f.write(txt)
    print(f"docs/INDEX.md escrito: {len(txt)} caracteres, ~{tokens(len(txt))} tokens")


def cmd_resumir(repo, ruta, texto):
    res = repo._json("docs/indice-resumenes.json", {})
    if ruta not in repo.mds():
        sys.exit(f"No existe {ruta}")
    h = hashlib.sha1(repo.texto(ruta).encode("utf-8")).hexdigest()
    if texto == "=":
        if ruta not in res:
            sys.exit("No hay resumen previo que conservar")
        res[ruta]["sha"] = h
    else:
        res[ruta] = {"resumen": texto.strip(), "sha": h}
    with open(repo.ruta("docs/indice-resumenes.json"), "w", encoding="utf-8") as f:
        json.dump(dict(sorted(res.items())), f, indent=1, ensure_ascii=False)
        f.write("\n")
    print("ok", ruta)


def cmd_seccion(repo, ruta, titulo):
    cand = [p for p in repo.mds() if p == ruta or p.endswith("/" + ruta) or os.path.basename(p).startswith(ruta) or ruta in p]
    if len(cand) != 1:
        sys.exit(f"'{ruta}' coincide con {len(cand)} archivos: {cand[:8]}")
    p = cand[0]
    t = repo.texto(p)
    hs = encabezados(t)
    q = sin_acentos(titulo).lower()
    for i, (nivel, tit, linea) in enumerate(hs):
        if q in sin_acentos(tit).lower():
            fin = len(t.splitlines()) + 1
            for nivel2, _, l2 in hs[i + 1:]:
                if nivel2 <= nivel:
                    fin = l2
                    break
            lineas = t.splitlines()[linea - 1:fin - 1]
            print(f"# {p} L{linea}-{fin - 1}\n" + "\n".join(lineas))
            return
    sys.exit("No hay una seccion cuyo titulo contenga '%s'. Disponibles: %s" % (titulo, " | ".join(x[1][:40] for x in hs if x[0] <= 3)))


# ---------------------------------------------------------------- verificar
class Informe:
    def __init__(self):
        self.errores, self.avisos = [], []

    def error(self, cat, msg):
        self.errores.append((cat, msg))

    def aviso(self, cat, msg):
        self.avisos.append((cat, msg))


def verif_rutas(repo, inf):
    cfg = repo.config
    existentes = set(repo.archivos())
    dirs = {os.path.dirname(p) for p in existentes}
    while any(dirs):
        dirs |= {os.path.dirname(d) for d in dirs if d}
        if all(os.path.dirname(d) == "" or os.path.dirname(d) in dirs for d in dirs if d):
            break
    ext_ok = (".md", ".json", ".mjs", ".ts", ".sh", ".html", ".png", ".jpg", ".txt")
    tops = ("docs/", "prototypes/", "skills/", "templates/", "agents/", "reports/", "herramientas/")
    externas = set(cfg.get("rutas_externas", [])) | set(cfg.get("rutas_futuras", {}))
    pref_ext = tuple(cfg.get("prefijos_externos", []))
    basenames = {os.path.basename(e) for e in existentes}
    base_alt = ["", "prototypes/rbot-web/", "prototypes/rbot-oracle/", "docs/", "docs/lab-rbot/", "docs/lab-rbot/decisions/"]
    for p in repo.mds():
        propio_dir = os.path.dirname(p)
        en_codigo = False
        for n, linea in enumerate(repo.texto(p).splitlines(), 1):
            if linea.lstrip().startswith("```"):
                en_codigo = not en_codigo
                continue
            for m in re.finditer(r"`([^`\s]+)`", linea):
                c = m.group(1).rstrip(".,;:)")
                if not re.fullmatch(r"[\w./@-]+", c) or c.startswith(("http", "/", "~", "./", "../")):
                    continue
                if any(x in c for x in ("NN", "*", "<", ">", "{", "$")) or c in externas or c.startswith(pref_ext):
                    continue
                if not (c.endswith(ext_ok) or c.startswith(tops)):
                    continue
                if os.path.basename(c) in externas or c.endswith(".java"):
                    continue
                cand = [c, os.path.join(propio_dir, c)] + [b + c for b in base_alt]
                cand = [os.path.normpath(x).replace(os.sep, "/") for x in cand]
                if any(x in existentes or x in dirs or x.rstrip("/") in dirs for x in cand):
                    continue
                # referencia corta por numero: `docs/10`, `docs/01-05` -> existe algun docs/10-*.md
                m2 = re.fullmatch(r"docs/(\d\d)(?:-\d\d)?", c)
                if m2 and any(e.startswith(f"docs/{m2.group(1)}-") for e in existentes):
                    continue
                # nombre suelto sin carpeta (`vistas.ts`, `laboratorio.sh`): vale si existe en cualquier carpeta
                if "/" not in c and c in basenames:
                    continue
                inf.error("ruta", f"{p}:{n}: cita `{c}` que no existe")


def verif_cifras(repo, inf, est):
    if not est:
        inf.aviso("cifras", "no hay docs/estado.json: no se pueden comprobar las cifras")
        return
    for p in repo.mds():
        if p in SIN_RESUMEN:
            continue
        for n, linea in enumerate(repo.texto(p).splitlines(), 1):
            for regla in repo.config.get("cifras", []):
                for m in re.finditer(regla["patron"], linea):
                    for g, id_ in enumerate(regla["ids"], 1):
                        real = est["pruebas"].get(id_, {}).get("total")
                        if real is None:
                            inf.aviso("cifras", f"{p}:{n}: cita `{id_}` pero estado.json no tiene su cifra")
                        elif int(m.group(g)) != real:
                            inf.error("cifras", f"{p}:{n}: dice {m.group(g)} para `{id_}`, estado.json dice {real}")


def verif_frases(repo, inf):
    for regla in repo.config.get("frases_obsoletas", []):
        rx = re.compile(regla["patron"], re.I)
        salvo = re.compile(regla["salvo"], re.I) if regla.get("salvo") else None
        for p in repo.mds():
            if p in SIN_RESUMEN or p in regla.get("excepto_en", []):
                continue
            for n, linea in enumerate(repo.texto(p).splitlines(), 1):
                if rx.search(linea) and not (salvo and salvo.search(linea)):
                    inf.error("obsoleto", f"{p}:{n}: «{regla['patron']}» — {regla['motivo']}")


def verif_readme(repo, inf):
    if "README.md" not in repo.archivos():
        inf.error("readme", "no hay README.md")
        return
    t = repo.texto("README.md")
    docs_reales = {os.path.basename(p) for p in repo.mds() if re.match(r"docs/\d\d-", p)}
    citados = set(re.findall(r"\b(\d\d-[a-z0-9-]+\.md)\b", t))
    for f in sorted(docs_reales - citados):
        inf.error("readme", f"docs/{f} existe pero el README no lo menciona")
    for f in sorted(citados - docs_reales):
        inf.error("readme", f"el README menciona {f} y no existe en docs/")
    for a in adrs_del_repo(repo):
        if a["id"] not in t:
            inf.error("readme", f"{a['id']} existe ({a['archivo']}) y el README no lo menciona")
    for d in ("prototypes/rbot-web", "prototypes/rbot-oracle", "templates", "skills"):
        if any(p.startswith(d + "/") for p in repo.archivos()) and d.split("/")[-1] not in t:
            inf.error("readme", f"la carpeta {d}/ existe y el README no la menciona")
    # elementos del arbol del README: "  nombre   <- ..." deben existir
    for m in re.finditer(r"^\s{2,}([\w./-]+/?)\s{2,}<-", t, re.M):
        nombre = m.group(1)
        existe = any(x == nombre or x.endswith("/" + nombre.rstrip("/")) or x.startswith(nombre) or ("/" + nombre) in "/" + x for x in repo.archivos())
        if not existe:
            inf.error("readme", f"el arbol del README lista `{nombre}` y no existe")


def verif_estado(repo, inf, est):
    if not est:
        return
    if not est.get("todo_ok"):
        malas = [k for k, v in est["pruebas"].items() if not v.get("ok")]
        inf.error("estado", f"la ultima ejecucion de pruebas tuvo fallos en: {malas}")
    if est.get("huella_codigo") != repo.huella_codigo():
        inf.error("estado", "el codigo de prototypes/ cambio despues de la ultima ejecucion de pruebas: las cifras de docs/estado.json ya no describen este codigo. Volver a ejecutar tools/correr-todo.mjs y `estado`")
    reales = {a["id"] for a in adrs_del_repo(repo)}
    registrados = {a["id"] for a in est.get("adrs", [])}
    if reales != registrados:
        inf.error("estado", f"los ADR de estado.json no coinciden con los del repo: {sorted(reales ^ registrados)}")
    else:
        por_id = {a["id"]: a for a in adrs_del_repo(repo)}
        for a in est["adrs"]:
            if por_id[a["id"]]["estado"] != a["estado"]:
                inf.error("estado", f"{a['id']}: el estado en estado.json difiere del documento; regenerar con `estado`")


def verif_indice(repo, inf):
    res = repo._json("docs/indice-resumenes.json", {})
    mds = repo.mds()
    for p in mds:
        if p in SIN_RESUMEN or p in GENERADOS:
            continue
        if p not in res:
            inf.error("indice", f"{p}: sin resumen (usar `resumir`)")
        elif res[p].get("sha") != hashlib.sha1(repo.texto(p).encode("utf-8")).hexdigest():
            inf.aviso("indice", f"{p}: cambio desde que se escribio su resumen; releerlo y `resumir {p} =` o reescribirlo")
    for p in set(res) - set(mds):
        inf.error("indice", f"{p}: tiene resumen pero el archivo ya no existe")
    actual = repo.texto("docs/INDEX.md") if "docs/INDEX.md" in repo.archivos() else ""
    if actual != generar_indice(repo):
        inf.error("indice", "docs/INDEX.md esta desactualizado: ejecutar `proyecto.py indice`")


def verif_skills(repo, inf):
    for p in repo.archivos():
        if p.startswith("skills/") and p.endswith("SKILL.md"):
            m = re.search(r"^description:\s*(.+)$", repo.texto(p), re.M)
            if m:
                d = m.group(1).strip().strip("\"'")
                if len(d) > 60:
                    inf.aviso("skill", f"{p}: description de {len(d)} caracteres (regla de docs/07: <=60, se paga en cada turno)")


def token_github():
    for ruta in ("/opt/data/.env", os.path.expanduser("~/.env")):
        try:
            for l in open(ruta, encoding="utf-8"):
                if l.startswith("GITHUB_TOKEN="):
                    return l.split("=", 1)[1].strip().strip("\"'")
        except OSError:
            pass
    return os.environ.get("GITHUB_TOKEN")


def verif_remoto(repo, inf):
    tok = token_github()
    cfg = repo.config.get("remoto", {})
    api = f"https://api.github.com/repos/{cfg.get('repo', 'vaocantod-creator/virtual-labs-factory')}/git/trees/{cfg.get('rama', 'main')}?recursive=1"
    hdr = {"Accept": "application/vnd.github+json"}
    if tok:
        hdr["Authorization"] = f"Bearer {tok}"
    try:
        with urllib.request.urlopen(urllib.request.Request(api, headers=hdr), timeout=60) as r:
            arbol = json.load(r)
    except Exception as e:  # red, limite de API o credenciales: no es un fallo del repo
        inf.aviso("remoto", f"no se pudo consultar GitHub ({type(e).__name__}); se omite la comparacion")
        return
    if arbol.get("truncated"):
        inf.aviso("remoto", "el arbol remoto vino truncado: comparacion incompleta")
    rem = {t["path"]: t["sha"] for t in arbol["tree"] if t["type"] == "blob"}
    loc = {p: sha_blob(repo.bytes(p)) for p in repo.archivos()}
    for p in sorted(set(loc) - set(rem)):
        inf.error("remoto", f"{p}: esta en local y NO en GitHub")
    for p in sorted(set(rem) - set(loc)):
        inf.error("remoto", f"{p}: esta en GitHub y NO en local")
    for p in sorted(p for p in loc if p in rem and loc[p] != rem[p]):
        inf.error("remoto", f"{p}: distinto entre local y GitHub")


def cmd_verificar(repo, remoto):
    inf = Informe()
    est = cargar_estado(repo)
    verif_rutas(repo, inf)
    verif_cifras(repo, inf, est)
    verif_frases(repo, inf)
    verif_readme(repo, inf)
    verif_estado(repo, inf, est)
    verif_indice(repo, inf)
    verif_skills(repo, inf)
    if remoto:
        verif_remoto(repo, inf)
    for cat, m in inf.errores:
        print(f"ERROR [{cat}] {m}")
    for cat, m in inf.avisos:
        print(f"AVISO [{cat}] {m}")
    print(f"VERIFICACION: {len(inf.errores)} errores, {len(inf.avisos)} avisos ({len(repo.archivos())} archivos){' [con comparacion remota]' if remoto else ''}")
    return 1 if inf.errores else 0


# ---------------------------------------------------------------- publicar
def cmd_publicar(repo, mensaje, aplicar):
    import base64
    tok = token_github()
    if not tok:
        sys.exit("No hay GITHUB_TOKEN (se busca en /opt/data/.env o en el entorno)")
    cfg = repo.config.get("remoto", {})
    nombre = cfg.get("repo", "vaocantod-creator/virtual-labs-factory")
    rama = cfg.get("rama", "main")
    hdr = {"Authorization": f"Bearer {tok}", "Accept": "application/vnd.github+json", "Content-Type": "application/json"}

    def api(url, datos=None, metodo=None):
        req = urllib.request.Request(url, data=json.dumps(datos).encode() if datos is not None else None, headers=hdr, method=metodo)
        with urllib.request.urlopen(req, timeout=90) as r:
            return json.load(r)

    arbol = api(f"https://api.github.com/repos/{nombre}/git/trees/{rama}?recursive=1")
    if arbol.get("truncated"):
        sys.exit("El arbol remoto vino truncado: no se publica a ciegas")
    rem = {t["path"]: t["sha"] for t in arbol["tree"] if t["type"] == "blob"}
    loc = {p: sha_blob(repo.bytes(p)) for p in repo.archivos() if os.path.getsize(repo.ruta(p)) <= 900_000}
    nuevos = sorted(p for p in loc if p not in rem)
    cambiados = sorted(p for p in loc if p in rem and loc[p] != rem[p])
    solo_remoto = sorted(set(rem) - set(loc))
    print(f"Plan: {len(nuevos)} nuevos, {len(cambiados)} modificados, {len(solo_remoto)} solo en remoto (no se tocan)")
    for p in nuevos:
        print("  + ", p)
    for p in cambiados:
        print("  ~ ", p)
    for p in solo_remoto:
        print("  ? solo remoto (revisar a mano):", p)
    if not aplicar:
        print("Simulacion: usar --aplicar para subir.")
        return 0
    fallos = 0
    for p in nuevos + cambiados:
        cuerpo = {"message": mensaje, "content": base64.b64encode(repo.bytes(p)).decode(), "branch": rama}
        if p in rem:
            cuerpo["sha"] = rem[p]
        for intento in (1, 2):
            try:
                c = api(f"https://api.github.com/repos/{nombre}/contents/{p}", cuerpo, "PUT")["commit"]["sha"][:7]
                print(f"  {c} {p}")
                break
            except Exception as e:
                if intento == 2:
                    fallos += 1
                    print(f"  FALLO {p}: {type(e).__name__} {str(e)[:80]}")
    print(f"Publicados {len(nuevos) + len(cambiados) - fallos} de {len(nuevos) + len(cambiados)}")
    return 1 if fallos else 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("comando", choices=["indice", "verificar", "estado", "resumir", "seccion", "publicar", "todo"])
    ap.add_argument("args", nargs="*")
    ap.add_argument("--raiz", default=os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    ap.add_argument("--remoto", action="store_true")
    ap.add_argument("--aplicar", action="store_true")
    a = ap.parse_args()
    repo = Repo(a.raiz)
    c = a.comando
    if c == "indice":
        cmd_indice(repo)
    elif c == "verificar":
        sys.exit(cmd_verificar(repo, a.remoto))
    elif c == "estado":
        if len(a.args) != 1:
            sys.exit("uso: estado <resultados.json>")
        cmd_estado(repo, a.args[0])
    elif c == "resumir":
        if len(a.args) != 2:
            sys.exit("uso: resumir <ruta> <texto|=>")
        cmd_resumir(repo, *a.args)
    elif c == "seccion":
        if len(a.args) != 2:
            sys.exit("uso: seccion <ruta> <titulo>")
        cmd_seccion(repo, *a.args)
    elif c == "publicar":
        if len(a.args) != 1:
            sys.exit("uso: publicar <mensaje> [--aplicar]")
        sys.exit(cmd_publicar(repo, a.args[0], a.aplicar))
    elif c == "todo":
        cmd_indice(repo)
        sys.exit(cmd_verificar(repo, a.remoto))


if __name__ == "__main__":
    main()
