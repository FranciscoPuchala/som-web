/* ==========================================================================
   SOM — comportamiento de la página
   Sin dependencias. Todo degrada: si esto no corre, la página se lee igual.
   ========================================================================== */

(function () {
  'use strict';

  var raiz = document.documentElement;
  raiz.classList.remove('sin-js');

  var quietud = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------
     1. Interruptor claro / oscuro
     La preferencia elegida a mano gana sobre la del sistema operativo.
     ------------------------------------------------------------------ */

  var boton = document.querySelector('.tema');
  if (boton) {
    boton.addEventListener('click', function () {
      var actual = raiz.getAttribute('data-theme');
      var oscuroAhora = actual
        ? actual === 'dark'
        : !window.matchMedia('(prefers-color-scheme: light)').matches;
      var nuevo = oscuroAhora ? 'light' : 'dark';
      raiz.setAttribute('data-theme', nuevo);
      boton.setAttribute(
        'aria-label',
        nuevo === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
      );
      try {
        localStorage.setItem('som-tema', nuevo);
      } catch (e) {
        /* navegación privada: no pasa nada, vale para esta visita */
      }
    });
  }

  /* ------------------------------------------------------------------
     2. Datos de contacto
     Se leen de js/datos.js. Lo que falte queda como marcador visible.
     ------------------------------------------------------------------ */

  var D = window.SOM_DATOS || {};

  function marcador(texto) {
    var s = document.createElement('span');
    s.className = 'marcador';
    s.textContent = 'COMPLETAR: ' + texto;
    return s;
  }

  function texto(el, valor, pista) {
    if (valor) {
      el.textContent = valor;
    } else {
      el.textContent = '';
      el.appendChild(marcador(pista));
    }
  }

  var whatsappLimpio = (D.whatsapp || '').replace(/\D/g, '');

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-dato]'),
    function (el) {
      switch (el.getAttribute('data-dato')) {
        case 'nombre':
          texto(el, D.nombre, 'tu nombre en js/datos.js');
          break;

        case 'rol':
          if (D.rol) el.textContent = D.rol;
          break;

        case 'whatsapp':
          texto(
            el,
            whatsappLimpio ? D.whatsappVisible || '+' + whatsappLimpio : '',
            'WhatsApp en js/datos.js'
          );
          break;

        case 'email':
          texto(el, D.email, 'correo en js/datos.js');
          break;

        case 'dominio':
          el.textContent = D.dominio || 'som.com.uy';
          break;
      }
    }
  );

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-enlace]'),
    function (el) {
      var tipo = el.getAttribute('data-enlace');

      if (tipo === 'whatsapp') {
        if (!whatsappLimpio) {
          el.setAttribute('aria-disabled', 'true');
          el.removeAttribute('href');
          return;
        }
        el.href =
          'https://wa.me/' +
          whatsappLimpio +
          '?text=' +
          encodeURIComponent(
            'Hola, vi la página de SOM y quiero saber más sobre el sistema para mi laboratorio.'
          );
        el.rel = 'noopener';
        el.target = '_blank';
      }

      if (tipo === 'email') {
        if (!D.email) {
          el.setAttribute('aria-disabled', 'true');
          el.removeAttribute('href');
          return;
        }
        el.href =
          'mailto:' +
          D.email +
          '?subject=' +
          encodeURIComponent('Consulta por SOM');
      }
    }
  );

  /* ------------------------------------------------------------------
     3. Entradas al hacer scroll
     ------------------------------------------------------------------ */

  var observables = document.querySelectorAll(
    '.revelar, .etapa, .hoja, .argumento'
  );

  /* Sentido del scroll: bajando el contenido entra desde abajo, subiendo
     entra desde arriba. La clase vive en <html> y la CSS la lee. */
  var ultimoY = window.pageYOffset || 0;
  var pendiente = false;

  function anotarSentido() {
    var y = window.pageYOffset || 0;
    if (Math.abs(y - ultimoY) > 4) {
      raiz.classList.toggle('sube', y < ultimoY);
      raiz.classList.toggle('baja', y > ultimoY);
      ultimoY = y;
    }
    pendiente = false;
  }

  if (!quietud.matches) {
    window.addEventListener(
      'scroll',
      function () {
        if (pendiente) return;
        pendiente = true;
        window.requestAnimationFrame(anotarSentido);
      },
      { passive: true }
    );
  }

  if (!('IntersectionObserver' in window) || quietud.matches) {
    Array.prototype.forEach.call(observables, function (el) {
      el.classList.add('visible');
    });
  } else {
    /* Va y viene: al entrar se muestra, al salir se rearma. Así la animación
       vuelve a ocurrir cuando se scrollea para arriba. */
    var mirón = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          e.target.classList.toggle('visible', e.isIntersecting);
        });
      },
      { rootMargin: '-6% 0px -10% 0px', threshold: 0.08 }
    );

    Array.prototype.forEach.call(observables, function (el) {
      mirón.observe(el);
    });
  }

  /* Escalona los grupos, para que no entren todos de golpe. */
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-escalonar]'),
    function (grupo) {
      Array.prototype.forEach.call(grupo.children, function (hijo, i) {
        hijo.style.setProperty('--demora', i * 90 + 'ms');
      });
    }
  );

  /* ------------------------------------------------------------------
     4. Video — no baja un solo byte hasta que alguien aprieta play
     ------------------------------------------------------------------ */

  var caja = document.querySelector('.video');
  if (caja) {
    var tapa = caja.querySelector('.video__tapa');
    var peli = caja.querySelector('video');

    if (tapa && peli) {
      tapa.addEventListener('click', function () {
        caja.classList.add('corriendo');
        peli.setAttribute('preload', 'auto');
        peli.setAttribute('controls', '');
        peli.load();
        var intento = peli.play();
        if (intento && intento.catch) {
          /* Si el navegador no deja arrancar solo, quedan los controles. */
          intento.catch(function () {});
        }
        peli.focus();
      });
    }
  }

  /* ------------------------------------------------------------------
     5. "El dato viaja"
     La demostración del tercer argumento: lo que se escribe al ingresar
     la muestra no se vuelve a tipear — viaja hasta el informe.
     ------------------------------------------------------------------ */

  var viaje = document.querySelector('.viaje');
  if (viaje) {
    var paradas = viaje.querySelectorAll('.parada');
    var repetir = viaje.querySelector('.repetir');
    var relojes = [];
    var corriendo = false;

    function limpiar() {
      relojes.forEach(clearTimeout);
      relojes = [];
      Array.prototype.forEach.call(paradas, function (p) {
        p.classList.remove('activa');
      });
    }

    function correr() {
      if (corriendo) return;
      corriendo = true;
      limpiar();

      if (quietud.matches) {
        /* Sin movimiento: se muestra el resultado final, completo. */
        Array.prototype.forEach.call(paradas, function (p) {
          p.classList.add('activa');
        });
        corriendo = false;
        return;
      }

      Array.prototype.forEach.call(paradas, function (p, i) {
        relojes.push(
          setTimeout(function () {
            p.classList.add('activa');
            if (i === paradas.length - 1) corriendo = false;
          }, 500 + i * 900)
        );
      });
    }

    if ('IntersectionObserver' in window) {
      var ojo = new IntersectionObserver(
        function (entradas) {
          entradas.forEach(function (e) {
            if (e.isIntersecting) {
              correr();
            } else {
              /* Al salir se rearma, para que vuelva a correr si se sube. */
              corriendo = false;
              limpiar();
            }
          });
        },
        { threshold: 0.35 }
      );
      ojo.observe(viaje);
    } else {
      correr();
    }

    if (repetir) {
      repetir.addEventListener('click', function () {
        corriendo = false;
        limpiar();
        setTimeout(correr, 120);
      });
    }
  }

  /* ------------------------------------------------------------------
     6. Formulario
     Con endpoint configurado, envía por detrás. Sin endpoint, abre el
     correo con todo escrito. En los dos casos el mensaje llega.
     ------------------------------------------------------------------ */

  var form = document.querySelector('.formulario');
  if (form) {
    var aviso = form.querySelector('.form-estado');

    function decir(mensaje) {
      if (!aviso) return;
      aviso.textContent = mensaje;
      aviso.hidden = false;
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      /* Trampa para robots: si viene llena, es un robot. */
      var miel = form.querySelector('[name="empresa_web"]');
      if (miel && miel.value) return;

      var datos = new FormData(form);
      var nombre = (datos.get('nombre') || '').toString().trim();
      var laboratorio = (datos.get('laboratorio') || '').toString().trim();
      var correo = (datos.get('correo') || '').toString().trim();
      var mensaje = (datos.get('mensaje') || '').toString().trim();

      if (!nombre || !correo || !mensaje) {
        decir('Faltan el nombre, el correo o el mensaje.');
        return;
      }

      var cuerpo =
        'Nombre: ' +
        nombre +
        '\nLaboratorio: ' +
        (laboratorio || '—') +
        '\nCorreo: ' +
        correo +
        '\n\n' +
        mensaje;

      /* Camino A — hay servicio configurado. */
      if (D.formEndpoint) {
        decir('Enviando…');
        fetch(D.formEndpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: datos,
        })
          .then(function (r) {
            if (!r.ok) throw new Error('rechazado');
            form.reset();
            decir('Listo, el mensaje salió. Te contestamos a la brevedad.');
          })
          .catch(function () {
            decir(
              'No se pudo enviar. Escribinos directo por WhatsApp o por correo.'
            );
          });
        return;
      }

      /* Camino B — sin servicio: se abre el correo ya escrito. */
      if (!D.email) {
        decir(
          'Todavía falta cargar el correo de contacto en js/datos.js. Mientras tanto, escribinos por WhatsApp.'
        );
        return;
      }

      window.location.href =
        'mailto:' +
        D.email +
        '?subject=' +
        encodeURIComponent('Consulta por SOM — ' + (laboratorio || nombre)) +
        '&body=' +
        encodeURIComponent(cuerpo);

      decir('Se abrió tu programa de correo con el mensaje ya escrito.');
    });
  }
})();
