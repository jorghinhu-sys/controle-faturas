#!/usr/bin/env python3
"""Monta o app publicado a partir de src/: um único index.html (CSS e JS embutidos) e o sw.js com a versão.
Uso: python3 build.py   (troque o número em src/version.txt a cada publicação)"""
import pathlib, sys
root = pathlib.Path(__file__).resolve().parent
src = root / 'src'
version = (src / 'version.txt').read_text(encoding='utf-8').strip()
css = (src / 'app.css').read_text(encoding='utf-8')
parts = sorted((src / 'js').glob('*.js'))
js = "(function(){\n'use strict';\n" + '\n'.join(p.read_text(encoding='utf-8') for p in parts) + "\n})();"
html = (src / 'index.html').read_text(encoding='utf-8')
assert '/*__CSS__*/' in html and '/*__JS__*/' in html
out = html.replace('/*__CSS__*/', css).replace('/*__JS__*/', js).replace('__VERSION__', version)
assert '</script>' not in js, 'o JS não pode conter </script>'
(root / 'index.html').write_text(out, encoding='utf-8')
(root / 'sw.js').write_text((src / 'sw.js').read_text(encoding='utf-8').replace('__VERSION__', version), encoding='utf-8')
print('ok: versão', version, '-', len(out), 'bytes,', len(parts), 'arquivos JS')
