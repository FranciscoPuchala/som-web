# -*- coding: utf-8 -*-
"""
SOM — genera la imagen de vista previa (1200x630).

Es la tarjeta que aparece cuando se pega el link en WhatsApp, LinkedIn o
Telegram. Se guarda en img/compartir.png.

    python scripts/imagen_compartir.py
"""

import os

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ANCHO, ALTO = 1200, 630

FONDO = (5, 8, 15)
TEXTO = (240, 244, 250)
SUAVE = (150, 163, 186)
VERDE = (45, 212, 191)
AZUL = (107, 179, 255)

FUENTES = os.path.join('C:' + os.sep, 'Windows', 'Fonts')


def fuente(archivo, tam):
    try:
        return ImageFont.truetype(os.path.join(FUENTES, archivo), tam)
    except OSError:
        return ImageFont.load_default()


def halos(base):
    """Pinta los dos resplandores de la marca sobre todo el lienzo.

    Se calculan pixel por pixel sobre el lienzo entero en vez de pegar
    cuadrados con máscara: sobre un fondo casi negro, el borde del cuadrado
    pegado se nota como una línea recta aunque la máscara valga 1 o 2.
    """
    y, x = np.mgrid[0:ALTO, 0:ANCHO].astype(np.float32)
    lienzo = np.array(base, dtype=np.float32)

    # (centro x, centro y, radio, color, fuerza)
    for cx, cy, radio, color, fuerza in [
        (250, 60, 900, VERDE, 0.34),
        (1050, 170, 820, AZUL, 0.30),
    ]:
        dist = np.sqrt((x - cx) ** 2 + (y - cy) ** 2) / radio
        # Caída suave que llega a cero: 1 - t², recortada.
        caida = np.clip(1.0 - dist ** 2, 0.0, 1.0) ** 1.6 * fuerza
        for c in range(3):
            lienzo[:, :, c] += caida * color[c]

    return Image.fromarray(np.clip(lienzo, 0, 255).astype(np.uint8))


def generar():
    # Los dos halos de la marca: verde agua del sistema, azul del emblema.
    img = halos(Image.new('RGB', (ANCHO, ALTO), FONDO))

    d = ImageDraw.Draw(img)

    # Emblema
    try:
        em = Image.open(os.path.join('img', 'emblema.png')).convert('RGBA')
        em = em.resize((132, 132), Image.LANCZOS)
        img.paste(em, (80, 96), em)
    except OSError:
        pass

    # Textos
    d.text((80, 268), 'SOM', font=fuente('segoeuib.ttf', 116), fill=TEXTO)
    d.text((80, 400), 'Sistema de Organización de Muestras',
           font=fuente('segoeui.ttf', 38), fill=SUAVE)

    d.text((80, 470),
           'Del ingreso de la muestra al Informe de Ensayo firmado.',
           font=fuente('segoeuib.ttf', 30), fill=VERDE)

    d.text((80, 522),
           'Para laboratorios de microbiología de alimentos  ·  Funciona sin internet',
           font=fuente('segoeui.ttf', 25), fill=SUAVE)

    # Filete inferior con el degradado de la marca.
    alto_filete = 8
    for x in range(ANCHO):
        t = x / float(ANCHO - 1)
        c = tuple(int(VERDE[i] + (AZUL[i] - VERDE[i]) * t) for i in range(3))
        d.line([(x, ALTO - alto_filete), (x, ALTO)], fill=c)

    salida = os.path.join('img', 'compartir.png')
    img.save(salida, 'PNG', optimize=True)
    peso = os.path.getsize(salida) / 1024.0
    print('  %s  %dx%d  %.0f KB' % (salida, ANCHO, ALTO, peso))


if __name__ == '__main__':
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(raiz)
    generar()
