/* ==========================================================================
   SOM — comportamiento de la página
   Sin dependencias. Todo degrada: si esto no corre, la página se lee igual.
   ========================================================================== */

(function () {
  'use strict';

  var raiz = document.documentElement;
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
        /* navegación privada: vale para esta visita y listo */
      }
    });
  }

  /* ------------------------------------------------------------------
     2. Encabezado de vidrio
     Al despegarse del tope se le cierra el vidrio y aparece la sombra.
     ------------------------------------------------------------------ */

  var cabecera = document.querySelector('.cabecera');
  if (cabecera) {
    var marcarCabecera = function () {
      cabecera.classList.toggle('pegada', (window.pageYOffset || 0) > 8);
    };
    marcarCabecera();
    window.addEventListener('scroll', marcarCabecera, { passive: true });
  }

  /* ------------------------------------------------------------------
     2b. Menú del celular
     Las tres rayas. Se cierra al elegir una página, con Escape, tocando
     afuera, o al agrandar la ventana hasta el ancho de escritorio.
     ------------------------------------------------------------------ */

  var botonMenu = document.querySelector('.menu');
  var navegacion = document.querySelector('.nav');

  if (botonMenu && navegacion && cabecera) {
    var abrirCerrar = function (abrir) {
      cabecera.classList.toggle('abierta', abrir);
      botonMenu.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      botonMenu.setAttribute(
        'aria-label',
        abrir ? 'Cerrar el menú' : 'Abrir el menú'
      );
    };

    var estaAbierto = function () {
      return cabecera.classList.contains('abierta');
    };

    botonMenu.addEventListener('click', function () {
      abrirCerrar(!estaAbierto());
    });

    /* Al elegir una página, el panel se cierra solo. */
    Array.prototype.forEach.call(
      navegacion.querySelectorAll('a'),
      function (a) {
        a.addEventListener('click', function () {
          abrirCerrar(false);
        });
      }
    );

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && estaAbierto()) {
        abrirCerrar(false);
        botonMenu.focus();
      }
    });

    document.addEventListener('click', function (ev) {
      if (!estaAbierto()) return;
      if (cabecera.contains(ev.target)) return;
      abrirCerrar(false);
    });

    /* Si se agranda la ventana con el menú abierto, el panel deja de
       existir: hay que dejar el botón en estado coherente. */
    var anchoEscritorio = window.matchMedia('(min-width: 46.0625rem)');
    var alCambiarAncho = function (e) {
      if (e.matches && estaAbierto()) abrirCerrar(false);
    };
    if (anchoEscritorio.addEventListener) {
      anchoEscritorio.addEventListener('change', alCambiarAncho);
    } else if (anchoEscritorio.addListener) {
      anchoEscritorio.addListener(alCambiarAncho);
    }
  }

  /* ------------------------------------------------------------------
     3. Scroll reveal
     Se dispara a medida que se baja y queda. No se rearma al subir: la
     animación ocurre una vez por elemento, como corresponde.
     ------------------------------------------------------------------ */

  var animables = document.querySelectorAll('[data-rev]');

  /* Escalona a los hermanos de una misma fila. */
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-escalonar]'),
    function (grupo) {
      Array.prototype.forEach.call(grupo.children, function (hijo, i) {
        hijo.style.setProperty('--d', i * 110 + 'ms');
      });
    }
  );

  if (!('IntersectionObserver' in window) || quietud.matches) {
    Array.prototype.forEach.call(animables, function (el) {
      el.classList.add('visto');
    });
  } else {
    var mirón = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('visto');
          mirón.unobserve(e.target);
          /* Terminada la entrada, se suelta el will-change. */
          setTimeout(function () {
            e.target.style.willChange = 'auto';
          }, 1200);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );

    Array.prototype.forEach.call(animables, function (el) {
      mirón.observe(el);
    });
  }

  /* Lo que ya está en pantalla al cargar entra enseguida, sin esperar
     a que alguien scrollee. */
  window.addEventListener('load', function () {
    Array.prototype.forEach.call(animables, function (el) {
      var caja = el.getBoundingClientRect();
      if (caja.top < window.innerHeight * 0.92) el.classList.add('visto');
    });
  });

  /* ------------------------------------------------------------------
     4. Movimiento ambiente
     Nada de esto es contenido: si no corre, no se pierde información.
     Por eso se arma desde acá y no ensucia el HTML.
     ------------------------------------------------------------------ */

  if (!quietud.matches) {
    /* --- Barra de avance del scroll --- */
    var barra = document.createElement('div');
    barra.className = 'avance';
    document.body.appendChild(barra);

    var pidiendo = false;
    var pintarAvance = function () {
      var alto =
        document.documentElement.scrollHeight - window.innerHeight;
      var r = alto > 0 ? (window.pageYOffset || 0) / alto : 0;
      barra.style.transform = 'scaleX(' + Math.min(1, Math.max(0, r)) + ')';
      pidiendo = false;
    };
    pintarAvance();
    window.addEventListener(
      'scroll',
      function () {
        if (pidiendo) return;
        pidiendo = true;
        window.requestAnimationFrame(pintarAvance);
      },
      { passive: true }
    );
    window.addEventListener('resize', pintarAvance, { passive: true });

    /* --- Chispas que suben por la portada --- */
    var portada = document.querySelector('.portada');
    if (portada) {
      var campo = document.createElement('div');
      campo.className = 'chispas';
      campo.setAttribute('aria-hidden', 'true');

      for (var i = 0; i < 14; i++) {
        var ch = document.createElement('span');
        ch.className = 'chispa';
        ch.style.left = (Math.random() * 100).toFixed(2) + '%';
        ch.style.setProperty('--tam', (2 + Math.random() * 4).toFixed(1) + 'px');
        ch.style.setProperty('--vida', (14 + Math.random() * 14).toFixed(1) + 's');
        ch.style.setProperty('--espera', (Math.random() * -22).toFixed(1) + 's');
        ch.style.setProperty('--alto', (45 + Math.random() * 45).toFixed(0) + 'vh');
        ch.style.setProperty(
          '--desvio',
          (Math.random() * 90 - 45).toFixed(0) + 'px'
        );
        ch.style.setProperty('--brillo', (0.2 + Math.random() * 0.4).toFixed(2));
        campo.appendChild(ch);
      }
      portada.insertBefore(campo, portada.firstChild);
    }

    /* --- Anillos que salen del emblema --- */
    var emblema = document.querySelector('.portada__emblema');
    if (emblema && emblema.parentNode) {
      var nido = document.createElement('div');
      nido.style.position = 'relative';
      nido.style.display = 'inline-block';
      nido.setAttribute('aria-hidden', 'false');
      emblema.parentNode.insertBefore(nido, emblema);
      nido.appendChild(emblema);
      for (var a = 0; a < 3; a++) {
        var anillo = document.createElement('span');
        anillo.className = 'aureola';
        anillo.setAttribute('aria-hidden', 'true');
        nido.appendChild(anillo);
      }
    }

    /* --- Reflejo que sigue al cursor sobre las tarjetas --- */
    var tarjetas = document.querySelectorAll(
      '.hoy__paso, .incluye__item, .argumento, .bifurca__lado, .canal, .parada'
    );
    Array.prototype.forEach.call(tarjetas, function (t) {
      t.addEventListener(
        'pointermove',
        function (ev) {
          var c = t.getBoundingClientRect();
          t.style.setProperty('--mx', ((ev.clientX - c.left) / c.width) * 100 + '%');
          t.style.setProperty('--my', ((ev.clientY - c.top) / c.height) * 100 + '%');
        },
        { passive: true }
      );
    });
  }

  /* ------------------------------------------------------------------
     5. Visor de capturas
     Cada captura tiene un enlace a la imagen completa. Sin este bloque el
     enlace igual funciona: abre el archivo. Con este bloque, lo abre en un
     visor con zoom, arrastre y navegación entre capturas.
     ------------------------------------------------------------------ */

  var lupas = document.querySelectorAll('.lupa');

  if (lupas.length && typeof HTMLDialogElement === 'function') {
    /* Una ficha por captura de la página. */
    var capturas = Array.prototype.map.call(lupas, function (a) {
      var fig = a.closest('figure') || a.parentNode;
      var img = fig.querySelector('img');
      var rot = fig.querySelector('.marco__url');
      return {
        url: a.getAttribute('href'),
        titulo: rot
          ? rot.textContent.trim()
          : (img && img.getAttribute('alt')) || 'Captura',
        alt: (img && img.getAttribute('alt')) || '',
      };
    });

    var visor = document.createElement('dialog');
    visor.className = 'visor';
    visor.innerHTML =
      '<div class="visor__caja">' +
      '<div class="visor__barra">' +
      '<button class="visor__btn" data-v="antes" type="button" aria-label="Captura anterior">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<button class="visor__btn" data-v="luego" type="button" aria-label="Captura siguiente">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>' +
      '<p class="visor__titulo"></p>' +
      '<button class="visor__btn" data-v="zoom" type="button" aria-label="Ver al tamaño real">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6M11 8v6"/></svg></button>' +
      '<button class="visor__btn" data-v="cerrar" type="button" aria-label="Cerrar el visor">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '</div>' +
      '<div class="visor__lienzo"><img alt=""></div>' +
      '<div class="visor__pie">' +
      '<span class="visor__ayuda">Clic en la imagen para acercar &middot; ' +
      '<kbd>&larr;</kbd> <kbd>&rarr;</kbd> para cambiar &middot; <kbd>Esc</kbd> para cerrar</span>' +
      '<span class="visor__cuenta"></span>' +
      '</div>' +
      '</div>';
    document.body.appendChild(visor);

    var vImg = visor.querySelector('.visor__lienzo img');
    var vLienzo = visor.querySelector('.visor__lienzo');
    var vTitulo = visor.querySelector('.visor__titulo');
    var vCuenta = visor.querySelector('.visor__cuenta');
    var vAntes = visor.querySelector('[data-v="antes"]');
    var vLuego = visor.querySelector('[data-v="luego"]');
    var indice = 0;

    function mostrar(i) {
      indice = (i + capturas.length) % capturas.length;
      var c = capturas[indice];
      vImg.src = c.url;
      vImg.alt = c.alt;
      vTitulo.textContent = c.titulo;
      vCuenta.textContent = indice + 1 + ' / ' + capturas.length;
      visor.classList.remove('cerca');
      vLienzo.scrollTop = 0;
      vLienzo.scrollLeft = 0;
      var solaUna = capturas.length < 2;
      vAntes.disabled = solaUna;
      vLuego.disabled = solaUna;
    }

    function alternarZoom() {
      var acercando = !visor.classList.contains('cerca');
      visor.classList.toggle('cerca', acercando);
      if (acercando) {
        /* Al acercar, quedar centrado en vez de en la esquina. */
        vLienzo.scrollLeft = (vLienzo.scrollWidth - vLienzo.clientWidth) / 2;
        vLienzo.scrollTop = (vLienzo.scrollHeight - vLienzo.clientHeight) / 4;
      }
    }

    function abrir(i) {
      mostrar(i);
      document.body.style.overflow = 'hidden';
      visor.showModal();
    }

    Array.prototype.forEach.call(lupas, function (a, i) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        abrir(i);
      });

      /* La imagen dentro de la página también abre el visor. */
      var fig = a.closest('figure') || a.parentNode;
      var img = fig.querySelector('img');
      if (img) {
        img.addEventListener('click', function () {
          abrir(i);
        });
      }
    });

    visor.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-v]');
      if (b) {
        var q = b.getAttribute('data-v');
        if (q === 'cerrar') visor.close();
        if (q === 'antes') mostrar(indice - 1);
        if (q === 'luego') mostrar(indice + 1);
        if (q === 'zoom') alternarZoom();
        return;
      }
      if (ev.target === vImg) {
        alternarZoom();
        return;
      }
      /* Un clic en el vacío cierra. */
      if (ev.target === visor || ev.target === vLienzo) visor.close();
    });

    visor.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowLeft') {
        ev.preventDefault();
        mostrar(indice - 1);
      }
      if (ev.key === 'ArrowRight') {
        ev.preventDefault();
        mostrar(indice + 1);
      }
    });

    /* Arrastrar con el mouse cuando está acercada. */
    var arrastre = null;
    vLienzo.addEventListener('pointerdown', function (ev) {
      if (!visor.classList.contains('cerca') || ev.target !== vImg) return;
      arrastre = {
        x: ev.clientX,
        y: ev.clientY,
        l: vLienzo.scrollLeft,
        t: vLienzo.scrollTop,
      };
      vLienzo.classList.add('arrastrando');
      vLienzo.setPointerCapture(ev.pointerId);
    });
    vLienzo.addEventListener('pointermove', function (ev) {
      if (!arrastre) return;
      vLienzo.scrollLeft = arrastre.l - (ev.clientX - arrastre.x);
      vLienzo.scrollTop = arrastre.t - (ev.clientY - arrastre.y);
    });
    ['pointerup', 'pointercancel'].forEach(function (n) {
      vLienzo.addEventListener(n, function () {
        arrastre = null;
        vLienzo.classList.remove('arrastrando');
      });
    });

    /* Al cerrar, la página de atrás vuelve a scrollear. */
    visor.addEventListener('close', function () {
      document.body.style.overflow = '';
    });
  }

  /* ------------------------------------------------------------------
     6. Datos de contacto
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

      if (tipo === 'zeng') {
        /* Sin URL cargada, el nombre queda como texto simple: no es un
           error, es una elección válida. */
        if (!D.zengUrl) {
          el.removeAttribute('href');
          el.style.pointerEvents = 'none';
          el.style.color = 'inherit';
          el.style.textDecoration = 'none';
          return;
        }
        el.href = D.zengUrl;
        el.rel = 'noopener';
        el.target = '_blank';
      }
    }
  );

  /* ------------------------------------------------------------------
     7. Video — no baja un solo byte hasta que alguien aprieta play
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
     8. "El dato viaja"
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
          }, 600 + i * 950)
        );
      });
    }

    /* Mientras el bloque está en pantalla el recorrido se repite solo. Al
       salir se detiene, para no gastar nada de fondo. */
    var bucle = null;

    function arrancarBucle() {
      correr();
      if (bucle || quietud.matches) return;
      bucle = setInterval(function () {
        corriendo = false;
        limpiar();
        setTimeout(correr, 400);
      }, 5200);
    }

    function pararBucle() {
      clearInterval(bucle);
      bucle = null;
    }

    if ('IntersectionObserver' in window) {
      var ojo = new IntersectionObserver(
        function (entradas) {
          entradas.forEach(function (e) {
            if (e.isIntersecting) arrancarBucle();
            else pararBucle();
          });
        },
        { threshold: 0.35 }
      );
      ojo.observe(viaje);
    } else {
      correr();
    }

    /* Con la pestaña de fondo no tiene sentido seguir animando. */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pararBucle();
    });

    if (repetir) {
      repetir.addEventListener('click', function () {
        corriendo = false;
        limpiar();
        setTimeout(correr, 140);
      });
    }
  }

  /* ------------------------------------------------------------------
     9. Formulario
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
