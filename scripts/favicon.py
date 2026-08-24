# -*- coding: utf-8 -*-
"""
SOM — genera los favicons a partir del emblema.

Google pide que el favicon sea cuadrado y múltiplo de 48px (48, 96, 144...).
El emblema original es 512x512 y pesa 263 KB: sirve como fuente, no como
favicon. Esto saca las medidas correctas y livianas.

    python scripts/favicon.py
"""

import os
from PIL import Image

MEDIDAS = [48, 96, 144, 192]
FUENTE = os.path.join('img', 'emblema.png')


def generar():
    base = Image.open(FUENTE).convert('RGBA')
    print('fuente: %dx%d, %.0f KB' % (
        base.size[0], base.size[1], os.path.getsize(FUENTE) / 1024.0))
    print()

    for m in MEDIDAS:
        salida = os.path.join('img', 'favicon-%d.png' % m)
        im = base.resize((m, m), Image.LANCZOS)
        im.save(salida, 'PNG', optimize=True)
        print('  %-22s %dx%d  %.0f KB' % (
            salida, m, m, os.path.getsize(salida) / 1024.0))

    # El .ico va en la raíz: es lo primero que pide Google y muchos
    # navegadores, aunque el HTML no lo declare.
    ico = 'favicon.ico'
    base.save(ico, 'ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print('  %-22s 16+32+48  %.0f KB' % (ico, os.path.getsize(ico) / 1024.0))


if __name__ == '__main__':
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(raiz)
    generar()
