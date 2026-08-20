# Sitio web de SOM

Sitio estático de cuatro páginas para **SOM — Sistema de Organización de
Muestras**. Sin framework, sin compilación y sin dependencias externas: son
archivos sueltos que andan subidos a cualquier lado.

```
index.html      Portada, video del recorrido y el problema
circuito.html   Las tres etapas + la demostración "el dato viaja"
informe.html    El Informe de Ensayo, el sello y por qué sin internet
contacto.html   Qué incluye, capturas y los tres canales de contacto

css/som.css     Toda la hoja de estilos
js/datos.js     <-- EL ÚNICO ARCHIVO QUE TENÉS QUE EDITAR
js/som.js       Comportamiento
fonts/          Archivo e IBM Plex Mono, servidas desde acá
img/  video/    Material de la instalación de demostración
```

---

## 1. Lo primero: completar tus datos

Abrí **`js/datos.js`** y llenalo. Es el único archivo que hay que tocar.

Todo lo que quede vacío aparece en la página como un **marcador naranja que
dice COMPLETAR**. Cuando lo llenes, el marcador desaparece solo y los botones
empiezan a funcionar. No hay que buscar nada dentro del HTML.

| Campo | Qué va |
|---|---|
| `nombre` | Tu nombre, como querés que figure al pie |
| `rol` | Una línea corta debajo. Opcional |
| `whatsapp` | Con código de país, sin espacios ni `+`. Uruguay es `598` |
| `whatsappVisible` | El mismo número, formateado lindo para mostrar |
| `email` | Tu correo de contacto |
| `formEndpoint` | Opcional, ver abajo |
| `dominio` | Cuando lo compres |

### El formulario

Una página estática no puede recibir envíos por sí sola: necesita un servicio
que los reciba. Por eso el formulario tiene dos modos:

- **Sin `formEndpoint`** (como está ahora): el botón abre el programa de correo
  con el mensaje ya escrito y dirigido a tu `email`. **Anda desde el primer
  día, sin contratar nada.**
- **Con `formEndpoint`**: el mensaje se envía por detrás, sin que la persona
  salga de la página. Necesitás una cuenta gratuita en
  [formspree.io](https://formspree.io) o [web3forms.com](https://web3forms.com):
  te dan una dirección, la pegás ahí y listo.

---

## 2. Verlo en tu computadora

No alcanza con hacer doble clic en `index.html`: las tipografías y algunas
funciones necesitan un servidor. Desde esta carpeta:

```bash
python -m http.server 8080
```

Y abrí <http://localhost:8080>. Con `Ctrl+C` lo cortás.

---

## 3. Publicarlo en GitHub Pages

El repositorio ya está iniciado y con el primer commit hecho. Falta subirlo,
y eso **lo tenés que hacer vos** porque requiere tu cuenta.

1. Entrá a <https://github.com/new> y creá un repositorio **público** llamado
   por ejemplo `som-web`. **No** le agregues README ni `.gitignore`, tiene que
   quedar vacío.
2. Volvé a esta carpeta y corré, cambiando `TU-USUARIO`:

   ```bash
   git remote add origin https://github.com/TU-USUARIO/som-web.git
   git branch -M main
   git push -u origin main
   ```

3. En el repositorio, andá a **Settings → Pages**. En *Source* elegí
   **Deploy from a branch**, rama `main`, carpeta `/ (root)`. Guardá.
4. A los dos o tres minutos la página queda en
   `https://TU-USUARIO.github.io/som-web/`.

Para actualizarla después de cualquier cambio:

```bash
git add -A
git commit -m "Actualizo los datos de contacto"
git push
```

### Dos cosas a tener en cuenta

- **El repositorio es público.** El video y las capturas quedan a la vista de
  cualquiera. Son de la instalación de demostración con datos inventados, así
  que no hay información de nadie ahí adentro — pero conviene saberlo.
- **Todas las rutas del sitio son relativas** (`./img/...`), justamente para
  que funcione en `usuario.github.io/som-web/` y no sólo en la raíz de un
  dominio. Si movés archivos de lugar, mantené esa forma.

---

## 4. Pasar al dominio propio

Cuando compres el dominio, no hay que rehacer nada:

1. En **Settings → Pages → Custom domain** escribí tu dominio.
2. En el panel de tu proveedor de dominio, apuntá los registros DNS a GitHub
   Pages (te muestra cuáles en esa misma pantalla).
3. Marcá **Enforce HTTPS** cuando se habilite.
4. Anotá el dominio en `js/datos.js`, en el campo `dominio`.

También podés olvidarte de GitHub y subir la carpeta entera por FTP a
cualquier hosting: son archivos estáticos, andan igual.

---

## 5. Decisiones técnicas, por si mañana hay que tocarlo

- **Tipografías propias.** Archivo e IBM Plex Mono están descargadas en
  `fonts/` en vez de pedirlas a Google. El sitio no depende de ningún servicio
  externo, que es exactamente lo que vende el producto.
- **El video no se descarga solo.** Tiene `preload="none"` y una tapa con
  botón de play. Nadie gasta 4,2 MB de datos sin pedirlo.
- **Claro y oscuro.** Oscuro por defecto, claro si el sistema operativo lo
  pide, y un interruptor en el encabezado que gana sobre las dos cosas. La
  elección se guarda en el navegador.
- **Movimiento reducido.** Con `prefers-reduced-motion` activo, todas las
  animaciones se apagan y no se pierde ningún contenido.
- **Sin JavaScript** la página se lee entera igual: nada queda escondido.
- **Contraste.** Sobre el azul tinta, los enlaces usan un verde agua más claro
  (`#2ec4b0`) porque el `#0d7a6f` del sistema no llega al mínimo de lectura.
  El `#0d7a6f` queda para rellenos de botón con texto blanco.

---

## 6. Lo que la página NO dice, a propósito

- **Nada de precios.** No están definidos.
- **Ningún cliente ni testimonio.** El laboratorio que ya usa SOM no está
  mencionado ni aludido, porque todavía no autorizó. Cuando lo autorice, se
  agrega.
- **Ningún número inventado** de años, muestras o tiempo ahorrado.
- Todas las páginas aclaran al pie que **las capturas y el video son de una
  instalación de demostración con datos inventados**.
