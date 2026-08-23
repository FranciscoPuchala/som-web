# -*- coding: utf-8 -*-
"""
SOM — aplica el SEO a las cuatro páginas.

Se ejecuta desde la raíz del proyecto:      python scripts/seo.py
Cuando tengas el dominio, cambiá BASE y volvé a correrlo. Reescribe las
etiquetas en su lugar, así que se puede correr las veces que haga falta.
"""

import io
import os
import re

# --------------------------------------------------------------------------
# CUANDO TENGAS EL DOMINIO, CAMBIÁ ESTA LÍNEA Y CORRÉ EL SCRIPT DE NUEVO.
# Con barra al final.
# --------------------------------------------------------------------------
BASE = 'https://franciscopuchala.github.io/som-web/'

AUTOR = 'Francisco Puchala'
MARCA = 'SOM — Sistema de Organización de Muestras'

# Por página: archivo -> (title, description, imagen para compartir)
PAGINAS = {
    'index.html': (
        'Software para laboratorios de microbiología de alimentos | SOM',
        'SOM gestiona el circuito completo del laboratorio, del ingreso de la '
        'muestra al Informe de Ensayo firmado. Se instala en tu servidor y '
        'funciona sin internet.',
        'img/compartir.png',
    ),
    'circuito.html': (
        'Cómo funciona: ingreso, resultados e informes | SOM',
        'Las tres etapas de SOM: ingreso con numeración automática, carga de '
        'resultados con valor de referencia al lado, y reporte de análisis.',
        'img/compartir.png',
    ),
    'informe.html': (
        'Informe de Ensayo con membrete y sello de acreditación | SOM',
        'El informe sale sobre la hoja membretada del laboratorio, con logo, '
        'acreditación y firma. Si la metodología está acreditada, el sistema '
        'pone el sello solo.',
        'img/compartir.png',
    ),
    'preguntas.html': (
        'Preguntas frecuentes sobre SOM | Software de laboratorio',
        'Si funciona sin internet, dónde quedan los datos, quién decide el '
        'sello de acreditación y cómo sale el conteo del mes. Las dudas más '
        'comunes, respondidas.',
        'img/compartir.png',
    ),
    'contacto.html': (
        'Qué incluye SOM y cómo contactarnos | Software de laboratorio',
        'Fichas de clientes, conteo mensual para facturar, catálogo propio de '
        'ensayos, usuarios con firma y respaldos automáticos. Escribinos por '
        'WhatsApp o por correo.',
        'img/compartir.png',
    ),
}

# Marcas para poder reescribir el bloque sin duplicarlo.
INI = '<!-- SEO:inicio -->'
FIN = '<!-- SEO:fin -->'


def bloque(archivo, titulo, desc, imagen):
    url = BASE + ('' if archivo == 'index.html' else archivo)
    img = BASE + imagen

    ld = (
        '{"@context":"https://schema.org","@type":"SoftwareApplication",'
        '"name":"SOM — Sistema de Organización de Muestras",'
        '"alternateName":"SOM",'
        '"applicationCategory":"BusinessApplication",'
        '"applicationSubCategory":"Sistema de gestión de laboratorio (LIMS)",'
        '"operatingSystem":"Servidor propio del laboratorio, red interna",'
        '"url":"' + BASE + '",'
        '"inLanguage":"es-UY",'
        '"description":"Sistema de gestión para laboratorios de microbiología '
        'de alimentos. Cubre el circuito completo, del ingreso de la muestra '
        'al Informe de Ensayo firmado. Se instala en un servidor del propio '
        'laboratorio y funciona sin conexión a internet.",'
        '"author":{"@type":"Person","name":"' + AUTOR + '"},'
        '"provider":{"@type":"Person","name":"' + AUTOR + '"},'
        '"areaServed":{"@type":"Country","name":"Uruguay"},'
        '"audience":{"@type":"Audience","audienceType":"Laboratorios de '
        'microbiología de alimentos"},'
        '"featureList":['
        '"Ingreso de muestras con numeración automática",'
        '"Carga de resultados con valores de referencia",'
        '"Informe de Ensayo sobre hoja membretada con firma",'
        '"Sello de acreditación según la metodología del catálogo",'
        '"Fichas de clientes con historial",'
        '"Conteo mensual por cliente para facturar",'
        '"Catálogo propio de ensayos, parámetros y metodologías",'
        '"Usuarios, roles y firmas escaneadas",'
        '"Respaldos automáticos programados",'
        '"Funciona sin conexión a internet"'
        ']}'
    )

    partes = [
        '    ' + INI,
        '    <title>' + titulo + '</title>',
        '    <meta name="description" content="' + desc + '" />',
        '    <link rel="canonical" href="' + url + '" />',
        '    <meta name="author" content="' + AUTOR + '" />',
        '    <meta name="robots" content="index, follow, max-image-preview:large" />',
        '',
        '    <!-- Vista previa al compartir (WhatsApp, LinkedIn, etc.) -->',
        '    <meta property="og:type" content="website" />',
        '    <meta property="og:site_name" content="' + MARCA + '" />',
        '    <meta property="og:locale" content="es_UY" />',
        '    <meta property="og:title" content="' + titulo + '" />',
        '    <meta property="og:description" content="' + desc + '" />',
        '    <meta property="og:url" content="' + url + '" />',
        '    <meta property="og:image" content="' + img + '" />',
        '    <meta property="og:image:width" content="1200" />',
        '    <meta property="og:image:height" content="630" />',
        '    <meta property="og:image:alt" content="SOM — Sistema de '
        'Organización de Muestras. Del ingreso de la muestra al Informe de '
        'Ensayo firmado." />',
        '    <meta name="twitter:card" content="summary_large_image" />',
        '    <meta name="twitter:title" content="' + titulo + '" />',
        '    <meta name="twitter:description" content="' + desc + '" />',
        '    <meta name="twitter:image" content="' + img + '" />',
        '',
        '    <script type="application/ld+json">' + ld + '</script>',
    ]

    # La página de preguntas lleva además marcado FAQPage: es lo que puede
    # hacer que Google muestre las preguntas desplegables en el resultado.
    if archivo == 'preguntas.html':
        partes.append('    <script type="application/ld+json">'
                      + faq_ld() + '</script>')

    partes.append('    ' + FIN)
    return '\n'.join(partes)


def faq_ld():
    """Saca las preguntas del propio HTML.

    Así el marcado y lo que se ve en pantalla no se pueden despegar: si
    mañana cambia una respuesta, el marcado cambia con ella.
    """
    import json
    html = io.open('preguntas.html', encoding='utf-8').read()
    pares = re.findall(
        r'<summary>(.*?)</summary>.*?<div class="faq__cuerpo">(.*?)</div>',
        html, re.S)
    items = []
    for pregunta, respuesta in pares:
        texto = re.sub(r'<[^>]+>', ' ', respuesta)
        items.append({
            '@type': 'Question',
            'name': ' '.join(pregunta.split()),
            'acceptedAnswer': {'@type': 'Answer', 'text': ' '.join(texto.split())},
        })
    return json.dumps(
        {'@context': 'https://schema.org', '@type': 'FAQPage',
         'mainEntity': items},
        ensure_ascii=False, separators=(',', ':'))


def aplicar():
    for archivo, (titulo, desc, imagen) in PAGINAS.items():
        s = io.open(archivo, encoding='utf-8').read()

        # Señal de región para el buscador.
        s = s.replace('<html lang="es">', '<html lang="es-UY">', 1)

        nuevo = bloque(archivo, titulo, desc, imagen)

        if INI in s:
            s = re.sub(re.escape(INI) + r'.*?' + re.escape(FIN), lambda m: nuevo,
                       s, count=1, flags=re.S)
        else:
            # Primera vez: reemplaza el <title> y la <meta description> viejos.
            s = re.sub(r'    <title>.*?</title>\n', '', s, count=1, flags=re.S)
            s = re.sub(r'    <meta\n      name="description"\n.*?\n    />\n', '',
                       s, count=1, flags=re.S)
            s = s.replace(
                '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
                '    <meta name="viewport" content="width=device-width, initial-scale=1" />\n'
                + nuevo, 1)

        io.open(archivo, 'w', encoding='utf-8').write(s)
        print('  %-16s %s' % (archivo, titulo[:52]))


def sitemap():
    from datetime import date
    hoy = date.today().isoformat()
    filas = []
    for archivo, prioridad in [('index.html', '1.0'), ('circuito.html', '0.8'),
                               ('informe.html', '0.9'), ('preguntas.html', '0.8'),
                               ('contacto.html', '0.7')]:
        url = BASE + ('' if archivo == 'index.html' else archivo)
        filas.append(
            '  <url>\n'
            '    <loc>' + url + '</loc>\n'
            '    <lastmod>' + hoy + '</lastmod>\n'
            '    <changefreq>monthly</changefreq>\n'
            '    <priority>' + prioridad + '</priority>\n'
            '  </url>')
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + '\n'.join(filas) + '\n</urlset>\n')
    io.open('sitemap.xml', 'w', encoding='utf-8').write(xml)
    print('  sitemap.xml      %d URLs' % len(filas))


def robots():
    txt = ('User-agent: *\n'
           'Allow: /\n'
           '\n'
           '# El video pesa 4,2 MB y no aporta al índice.\n'
           'Disallow: /video/\n'
           '\n'
           'Sitemap: ' + BASE + 'sitemap.xml\n')
    io.open('robots.txt', 'w', encoding='utf-8').write(txt)
    print('  robots.txt       ok')


if __name__ == '__main__':
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(raiz)
    print('Base: ' + BASE)
    print()
    aplicar()
    sitemap()
    robots()
    print('\nListo.')
