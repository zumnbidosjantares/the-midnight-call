# gerar_offline.py — empacota o jogo inteiro num HTML so.
#
# POR QUE ISSO EXISTE
# O jogo e escrito em modulos JavaScript (import/export). Navegador nenhum
# carrega modulo por file://, entao clicar duas vezes no index.html sempre
# da tela preta — e por isso que existe o servidor local. So que servidor
# depende de Python instalado, de porta livre, de firewall... e em maquina
# alheia isso falha.
#
# Este script resolve na raiz: junta todos os modulos num unico arquivo
# JOGO_OFFLINE.html que abre com dois cliques, em qualquer maquina, sem
# instalar nada.
#
# COMO FUNCIONA
# Cada modulo vira uma funcao registrada num mapa, e os import/export sao
# reescritos para um require minimo. Cada modulo mantem o proprio escopo,
# entao nomes iguais em arquivos diferentes nao brigam (concatenar os
# arquivos direto quebraria: pixel.js e i18n.js exportam os dois um `line`).
#
# USO:  python ferramentas/gerar_offline.py

import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = os.path.join(RAIZ, 'js')
ENTRADA = 'main.js'
SAIDA = os.path.join(RAIZ, 'JOGO_OFFLINE.html')

RE_IMP_NOMEADO = re.compile(
    r"^[ \t]*import\s*\{([^}]*)\}\s*from\s*['\"]([^'\"]+)['\"]\s*;?[ \t]*$", re.M | re.S)
RE_IMP_NS = re.compile(
    r"^[ \t]*import\s*\*\s*as\s+(\w+)\s+from\s*['\"]([^'\"]+)['\"]\s*;?[ \t]*$", re.M)
RE_IMP_SIMPLES = re.compile(
    r"^[ \t]*import\s*['\"]([^'\"]+)['\"]\s*;?[ \t]*$", re.M)
RE_EXP_DECL = re.compile(
    r"^[ \t]*export\s+(const|let|var|function|class|async\s+function)\s+(\w+)", re.M)
RE_EXP_LISTA = re.compile(r"^[ \t]*export\s*\{([^}]*)\}\s*;?[ \t]*$", re.M)
RE_EXP_DEFAULT = re.compile(r"^[ \t]*export\s+default\s+([\w.]+)\s*;?[ \t]*$", re.M)


def resolver(origem, spec):
    """Caminho do modulo importado, relativo a pasta js/."""
    base = os.path.dirname(os.path.join(JS, origem))
    alvo = os.path.normpath(os.path.join(base, spec))
    return os.path.relpath(alvo, JS).replace('\\', '/')


def transformar(id_mod, codigo):
    exportados = []

    def sub_nomeado(m):
        nomes, spec = m.group(1), m.group(2)
        partes = []
        for p in nomes.split(','):
            p = p.strip()
            if not p:
                continue
            if ' as ' in p:
                de, para = [x.strip() for x in p.split(' as ')]
                partes.append('%s: %s' % (de, para))
            else:
                partes.append(p)
        return 'const { %s } = __req("%s");' % (', '.join(partes), resolver(id_mod, spec))

    codigo = RE_IMP_NOMEADO.sub(sub_nomeado, codigo)
    codigo = RE_IMP_NS.sub(
        lambda m: 'const %s = __req("%s");' % (m.group(1), resolver(id_mod, m.group(2))), codigo)
    codigo = RE_IMP_SIMPLES.sub(
        lambda m: '__req("%s");' % resolver(id_mod, m.group(1)), codigo)

    for m in RE_EXP_DECL.finditer(codigo):
        exportados.append((m.group(2), m.group(2)))
    codigo = RE_EXP_DECL.sub(lambda m: m.group(0).replace('export ', '', 1), codigo)

    for m in RE_EXP_LISTA.finditer(codigo):
        for p in m.group(1).split(','):
            p = p.strip()
            if not p:
                continue
            if ' as ' in p:
                de, para = [x.strip() for x in p.split(' as ')]
                exportados.append((para, de))
            else:
                exportados.append((p, p))
    codigo = RE_EXP_LISTA.sub('', codigo)

    for m in RE_EXP_DEFAULT.finditer(codigo):
        exportados.append(('default', m.group(1)))
    codigo = RE_EXP_DEFAULT.sub('', codigo)

    if 'export ' in codigo:
        sobrou = [l for l in codigo.splitlines() if re.match(r'\s*export\b', l)]
        raise SystemExit('ERRO: forma de export nao suportada em %s:\n  %s'
                         % (id_mod, '\n  '.join(sobrou)))

    # Getters preservam a ligacao viva: se o modulo reatribuir a variavel
    # (i18n faz isso com `lang`), quem importou enxerga o valor novo.
    regs = '\n'.join(
        '  Object.defineProperty(__exp, "%s", { get: function(){ return %s; }, enumerable: true });'
        % (nome, ref) for nome, ref in exportados)
    return codigo, regs


def coletar(id_mod, vistos, ordem):
    if id_mod in vistos:
        return
    vistos.add(id_mod)
    caminho = os.path.join(JS, id_mod)
    if not os.path.isfile(caminho):
        raise SystemExit('ERRO: modulo nao encontrado: %s' % caminho)
    with open(caminho, encoding='utf-8') as f:
        bruto = f.read()
    for m in list(RE_IMP_NOMEADO.finditer(bruto)) + list(RE_IMP_NS.finditer(bruto)):
        spec = m.group(2)
        coletar(resolver(id_mod, spec), vistos, ordem)
    ordem.append((id_mod, bruto))


def main():
    ordem = []
    coletar(ENTRADA, set(), ordem)

    pedacos = []
    for id_mod, bruto in ordem:
        codigo, regs = transformar(id_mod, bruto)
        pedacos.append('__mods["%s"] = function(__exp){\n%s\n%s\n};' % (id_mod, codigo, regs))
    print('  %d modulos empacotados' % len(ordem))

    with open(os.path.join(RAIZ, 'css', 'style.css'), encoding='utf-8') as f:
        css = f.read()
    with open(os.path.join(RAIZ, 'index.html'), encoding='utf-8') as f:
        html = f.read()

    # tira o link do css e a tag de modulo do html original
    html = re.sub(r'\s*<link rel="stylesheet"[^>]*>', '', html)
    html = re.sub(r'\s*<script type="module"[^>]*></script>', '', html)
    html = html.replace('</head>', '<style>\n%s\n</style>\n</head>' % css)

    runtime = (
        '<script>\n(function(){\n'
        'var __mods = {}, __cache = {};\n'
        'function __req(id){\n'
        '  if (__cache[id]) return __cache[id];\n'
        '  var e = {}; __cache[id] = e;\n'
        '  if (!__mods[id]) throw new Error("modulo ausente no pacote: " + id);\n'
        '  __mods[id](e); return e;\n'
        '}\n'
        + '\n'.join(pedacos) +
        '\n__req("%s");\n})();\n</script>' % ENTRADA
    )
    html = html.replace('</body>', runtime + '\n</body>')

    with open(SAIDA, 'w', encoding='utf-8') as f:
        f.write(html)
    print('  gerado: %s  (%.0f KB)' % (SAIDA, os.path.getsize(SAIDA) / 1024))


if __name__ == '__main__':
    main()
