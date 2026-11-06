/* =====================================================================
   TORNADA — Lógica de la página
   Lee todo desde config.js (window.TORNADA). No hace falta editar este archivo.
   ===================================================================== */
(function () {
  'use strict';

  var C = window.TORNADA;
  if (!C) { console.error('Falta config.js'); return; }

  var TZ = 'America/Lima';
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };
  var params = new URLSearchParams(location.search);
  var pagina = document.body.getAttribute('data-pagina');

  /* ---------- Fecha actual (con simulación ?fecha= para probar) ---------- */
  function ahora() {
    var f = C.permitirSimularFecha && params.get('fecha');
    if (f) {
      var iso = /^\d{4}-\d{2}-\d{2}$/.test(f) ? f + 'T12:00:00-05:00' : f;
      var d = new Date(iso);
      if (!isNaN(d)) return d;
    }
    return new Date();
  }
  var D = function (iso) { return new Date(iso); };

  /* ---------- Formatos en hora de Lima ---------- */
  function fmt(fecha, opciones) {
    return new Intl.DateTimeFormat('es-PE', Object.assign({ timeZone: TZ }, opciones)).format(fecha);
  }
  function diaLargo(f) { return fmt(f, { weekday: 'long', day: 'numeric' }); }          // "jueves 12"
  function diaMes(f) { return fmt(f, { day: 'numeric', month: 'long' }); }              // "12 de noviembre"
  function mesDe(f) { return fmt(f, { month: 'long' }).toLowerCase(); }
  function diaNum(f) { return fmt(f, { day: 'numeric' }); }
  function rango(ini, fin) {
    var a = D(ini), b = D(fin);
    if (mesDe(a) === mesDe(b)) return 'Del ' + diaNum(a) + ' al ' + diaMes(b);
    return 'Del ' + diaMes(a) + ' al ' + diaMes(b);
  }
  function soles(n) { return 'S/ ' + n; }
  function numeroBonito(n) { return String(n).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'); }
  function pendiente(v) { return !v || /\[.*\]/.test(v); }

  /* ---------- Estado de la venta ---------- */
  function estadoVenta(now) {
    var tramos = C.tramos;
    var vigente = null;
    for (var i = 0; i < tramos.length; i++) {
      if (now >= D(tramos[i].inicio) && now <= D(tramos[i].fin)) { vigente = tramos[i]; break; }
    }
    var estado;
    if (now > D(C.evento.fin)) estado = 'terminado';
    else if (C.agotado) estado = 'agotado';
    else if (now < D(tramos[0].inicio)) estado = 'antes';
    else if (vigente && vigente.online) estado = 'online';
    else if (vigente && !vigente.online) estado = 'puerta';
    else estado = 'antes';
    return { estado: estado, tramo: vigente };
  }

  /* ---------- Seguimiento: vendedor (?v=) y origen (utm_) ---------- */
  var REF_KEY = 'tornada_ref';
  var REF_DIAS = 30;

  function leerGuardado() {
    try {
      var r = JSON.parse(localStorage.getItem(REF_KEY) || 'null');
      if (r && (Date.now() - r.t) < REF_DIAS * 864e5) return r;
    } catch (e) {}
    return null;
  }
  function origenDesdeReferrer() {
    if (!document.referrer) return '';
    try {
      var h = new URL(document.referrer).hostname.replace(/^www\.|^l\.|^lm\.|^m\./, '');
      if (h === location.hostname) return '';
      if (/instagram/.test(h)) return 'instagram';
      if (/facebook|fb\./.test(h)) return 'facebook';
      if (/whatsapp|wa\.me/.test(h)) return 'whatsapp';
      if (/tiktok/.test(h)) return 'tiktok';
      if (/google/.test(h)) return 'google';
      if (/t\.co|twitter|x\.com/.test(h)) return 'x';
      return h;
    } catch (e) { return ''; }
  }
  function seguimiento() {
    var guardado = leerGuardado() || {};
    var codigo = (params.get('v') || params.get('vendedor') || '').trim().toLowerCase();
    var vendedor = codigo ? (C.vendedores[codigo] || codigo) : '';

    var utm = ['utm_source', 'utm_medium', 'utm_campaign']
      .map(function (k) { return (params.get(k) || '').trim(); })
      .filter(Boolean).join(' / ');
    var origen = utm || origenDesdeReferrer();

    var ref = {
      vendedor: vendedor || guardado.vendedor || '',
      origen: origen || guardado.origen || '',
      t: Date.now()
    };
    if (vendedor || origen) {
      try { localStorage.setItem(REF_KEY, JSON.stringify(ref)); } catch (e) {}
    }
    return {
      vendedor: ref.vendedor || C.vendedorPorDefecto,
      origen: ref.origen || C.origenPorDefecto,
      tieneVendedor: !!ref.vendedor
    };
  }

  /* ---------- Píxel de Meta (opcional) ---------- */
  function cargarPixel() {
    if (!C.metaPixelId) return;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    fbq('init', C.metaPixelId);
    fbq('track', 'PageView');
  }
  var enviados = {};
  function evento(nombre, datos) {
    if (enviados[nombre] || typeof window.fbq !== 'function') return;
    enviados[nombre] = true;
    window.fbq('track', nombre, datos || {});
  }

  /* ---------- Enlaces de WhatsApp ---------- */
  function urlWhatsApp(ref, extra) {
    var msg = C.whatsapp.mensaje;
    if (extra) msg += extra;
    if (C.whatsapp.agregarReferencia && ref.tieneVendedor) msg += ' (de parte de ' + ref.vendedor + ')';
    var num = String(C.whatsapp.numero).replace(/\D/g, '');
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);
  }
  function prepararWhatsApp(ref, extra) {
    var url = urlWhatsApp(ref, extra);
    $$('[data-wa]').forEach(function (a) {
      a.href = url;
      a.addEventListener('click', function () { evento('Contact'); });
      if (pendiente(C.whatsapp.numero)) a.title = 'Falta el número de WhatsApp en config.js';
    });
  }

  /* =====================================================================
     PÁGINA PRINCIPAL
     ===================================================================== */
  function inicio() {
    var now = ahora();
    var ev = estadoVenta(now);
    var ref = seguimiento();

    /* Textos de pago desde config */
    var valores = {
      'pago.metodos': C.pago.metodos,
      'pago.titular': C.pago.titular,
      'pago.numeroFormato': numeroBonito(C.pago.numero)
    };
    $$('[data-cfg]').forEach(function (el) {
      var k = el.getAttribute('data-cfg');
      if (valores[k]) el.textContent = valores[k];
    });

    pintarPrecios(now, ev);
    avisoTramo(ev);
    barra(ev);
    estadoCompra(ev, ref);
    prepararWhatsApp(ref, ev.estado === 'agotado' ? '. ¿Hay lista de espera?' : (ev.estado === 'puerta' ? '. ¿Todavía hay entradas en puerta?' : ''));
    copiarNumero();
    qr();
    musica();
    ocultarBarra();

    $$('[data-compra]').forEach(function (a) { a.addEventListener('click', function () { evento('InitiateCheckout'); }); });
    var form = $('#form-marco');
    if (form && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) evento('InitiateCheckout'); });
      }, { threshold: 0.25 }).observe(form);
    }
    var maps = $('[data-href-maps]');
    if (maps) maps.href = C.evento.mapsUrl;
  }

  /* ---------- Tarjetas de precio ---------- */
  function pintarPrecios(now, ev) {
    var cont = $('#precios-lista');
    if (!cont) return;
    var html = '';

    C.tramos.forEach(function (t) {
      var ini = D(t.inicio), fin = D(t.fin);
      var clase = now > fin ? 'pasado' : (now >= ini ? 'vigente' : 'proximo');
      var sello = clase === 'pasado' ? 'Cerró' : clase === 'vigente' ? (t.online ? 'Vigente' : 'Hoy') : (t.online ? 'Desde el ' + diaMes(ini) : 'En puerta');
      var fechas = t.online ? rango(t.inicio, t.fin) : (t.nota || diaMes(ini));
      html += tarjeta(clase, t.nombre, t.precio, sello, fechas, '');
    });

    var e = C.estudiante;
    var cerrado = now > D(e.fin) || now < D(e.inicio);
    html += tarjeta('estudiante' + (cerrado ? ' cerrado' : ''), e.nombre, e.precio,
      cerrado ? 'Solo venta online' : 'Con carné',
      'Toda la venta online (hasta el ' + diaMes(D(e.fin)) + ')', e.condicion);

    cont.innerHTML = html;
  }
  function tarjeta(clase, nombre, precio, sello, fechas, condicion) {
    return '<article class="precio ' + clase + '">' +
      '<span class="precio__sello">' + sello + '</span>' +
      '<h3 class="precio__nombre">' + nombre + '</h3>' +
      '<p class="precio__monto"><small>S/</small>' + precio + '</p>' +
      '<p class="precio__fechas">' + fechas + '</p>' +
      (condicion ? '<p class="precio__condicion">' + condicion + '</p>' : '') +
      '</article>';
  }

  /* ---------- Aviso del tramo vigente + cuenta regresiva ---------- */
  function avisoTramo(ev) {
    var caja = $('#tramo-aviso'), etq = $('#tramo-etiqueta'), reloj = $('#tramo-reloj');
    if (!caja) return;

    if (ev.estado === 'online') {
      var t = ev.tramo;
      var f = D(t.fin);
      etq.textContent = t.nombre + ' a ' + soles(t.precio) + ' hasta el ' + diaLargo(f) + (mesDe(f) !== mesDe(ahora()) ? ' de ' + mesDe(f) : '');
      caja.hidden = false;
      var tick = function () {
        var ms = D(t.fin) - ahora();
        if (ms <= 0) { location.reload(); return; }
        reloj.textContent = 'Cierra en ' + restante(ms);
      };
      tick();
      setInterval(tick, 30000);
    } else if (ev.estado === 'puerta') {
      etq.textContent = 'Hoy: entradas en puerta a ' + soles(ev.tramo.precio);
      reloj.textContent = 'Sujeto a disponibilidad';
      caja.hidden = false;
    } else if (ev.estado === 'agotado') {
      etq.textContent = 'Entradas agotadas';
      reloj.textContent = '';
      caja.hidden = false;
    } else if (ev.estado === 'antes') {
      etq.textContent = 'La venta empieza el ' + diaLargo(D(C.tramos[0].inicio));
      caja.hidden = false;
    }
  }
  function restante(ms) {
    var min = Math.floor(ms / 60000);
    var d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
    if (d >= 1) return d + (d === 1 ? ' día ' : ' días ') + h + ' h';
    if (h >= 1) return h + ' h ' + m + ' min';
    return m + ' min';
  }

  /* ---------- Formulario, avisos de venta y botones ---------- */
  function estadoCompra(ev, ref) {
    var abierta = $('#venta-abierta'), cerrada = $('#venta-cerrada');
    var mensajes = {
      antes: 'La venta online empieza el <b>' + diaLargo(D(C.tramos[0].inicio)) + ' de ' + mesDe(D(C.tramos[0].inicio)) + '</b>. Vuelve pronto.',
      puerta: '<b>La venta online cerró.</b> Hoy puedes comprar tu entrada en la puerta del Jazz Zone a ' + soles(ev.tramo ? ev.tramo.precio : '') + ', sujeto a disponibilidad. Puertas 7:30 p. m.',
      agotado: '<b>Entradas agotadas.</b> Escríbenos por WhatsApp para entrar a la lista de espera.',
      terminado: '<b>Gracias por ser parte de Tornada.</b> Síguenos en Instagram para enterarte de lo que viene.'
    };
    if (ev.estado !== 'online') {
      abierta.hidden = true;
      cerrada.innerHTML = mensajes[ev.estado] || '';
      cerrada.hidden = false;
      if (ev.estado === 'terminado') {
        $$('.alternativa').forEach(function (x) { x.hidden = true; });
        $$('[data-compra]').forEach(function (a) { a.textContent = 'Ver más'; });
      }
      return;
    }
    montarFormulario(ev, ref);
  }

  function montarFormulario(ev, ref) {
    var iframe = $('#form-airtable'), aviso = $('#form-pendiente');
    var A = C.airtable;
    if (pendiente(A.embedUrl)) { iframe.hidden = true; aviso.hidden = false; return; }

    var q = [];
    var add = function (campo, valor, ocultar) {
      if (!campo || !valor) return;
      var n = encodeURIComponent(campo);
      q.push('prefill_' + n + '=' + encodeURIComponent(valor));
      if (ocultar) q.push('hide_' + n + '=true');
    };
    add(A.campos.vendidoPor, ref.vendedor, A.ocultarCampos);
    add(A.campos.origen, ref.origen, A.ocultarCampos);
    if (A.precargarTipoEntrada && ev.tramo) add(A.campos.tipoEntrada, ev.tramo.opcionAirtable, false);

    var url = A.embedUrl + (A.embedUrl.indexOf('?') > -1 ? '&' : '?') + q.join('&');
    iframe.style.height = (A.alturaIframe || 1350) + 'px';
    iframe.src = url;
  }

  /* ---------- Barra fija ---------- */
  function barra(ev) {
    var p = $('#barra-precio'), s = $('#barra-sub');
    if (!p) return;
    if (ev.estado === 'online') {
      p.textContent = ev.tramo.nombre + ' ' + soles(ev.tramo.precio);
      s.textContent = 'Estudiantes ' + soles(C.estudiante.precio) + ' · Mié 2 dic';
    } else if (ev.estado === 'puerta') {
      p.textContent = 'Hoy en puerta ' + soles(ev.tramo.precio);
    } else if (ev.estado === 'agotado') {
      p.textContent = 'Agotado';
    } else if (ev.estado === 'terminado') {
      $('#barra').hidden = true;
    }
  }
  function ocultarBarra() {
    var b = $('#barra');
    var zonas = [$('#comprar'), $('.hero__ficha')].filter(Boolean);
    if (!b || !('IntersectionObserver' in window)) return;
    var visibles = new Set();
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target); });
      b.classList.toggle('oculta', visibles.size > 0);
    }, { threshold: 0.05 });
    zonas.forEach(function (z) { obs.observe(z); });
  }

  /* ---------- Copiar número de Yape/Plin ---------- */
  function copiarNumero() {
    var btn = $('#copiar-numero');
    if (!btn) return;
    var txt = $('.copiar__txt', btn);
    btn.addEventListener('click', function () {
      var num = C.pago.numero;
      var listo = function () {
        btn.classList.add('ok'); txt.textContent = '¡Copiado! ' + numeroBonito(num);
        setTimeout(function () { btn.classList.remove('ok'); txt.textContent = 'Copiar número'; }, 2500);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(num).then(listo, respaldo);
      } else respaldo();
      function respaldo() {
        var ta = document.createElement('textarea');
        ta.value = num; ta.setAttribute('readonly', ''); ta.style.position = 'absolute'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); listo(); } catch (e) { txt.textContent = numeroBonito(num); }
        document.body.removeChild(ta);
      }
    });
  }

  function qr() {
    var f = $('#qr');
    if (!f || !C.pago.qrImagen) return;
    $('img', f).src = C.pago.qrImagen;
    f.hidden = false;
  }

  /* ---------- Música: Spotify + fachada de YouTube ---------- */
  function musica() {
    var M = C.musica;
    var sp = $('[data-src-spotify]');
    if (sp && M.spotifyTrackId) sp.src = 'https://open.spotify.com/embed/track/' + M.spotifyTrackId + '?utm_source=generator';
    var a;
    if ((a = $('[data-href-spotify]'))) a.href = 'https://open.spotify.com/track/' + M.spotifyTrackId;
    if ((a = $('[data-href-youtube]'))) a.href = 'https://www.youtube.com/watch?v=' + M.youtubeId;
    if ((a = $('[data-href-apple]'))) a.href = M.appleMusicUrl;

    var yt = $('#yt');
    if (!yt || !M.youtubeId) return;
    $('img', yt).src = 'https://i.ytimg.com/vi/' + M.youtubeId + '/hqdefault.jpg';
    yt.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + M.youtubeId + '?autoplay=1&rel=0';
      f.title = 'Curita — video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      yt.innerHTML = '';
      yt.appendChild(f);
    }, { once: true });
  }

  /* =====================================================================
     PÁGINA DE GRACIAS
     ===================================================================== */
  function gracias() {
    var E = C.evento;
    var utc = function (iso) { return D(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
    var titulo = 'Tornada — Katia Uriol';
    var detalle = 'Concierto de lanzamiento de “' + E.sencillo + '”.\nPuertas 7:30 p. m. · Show 8:30 p. m.\nIngreso libre: llega temprano para elegir mesa.\nUna producción de Rueda Cultural.';
    var lugar = E.lugar + ', ' + E.direccion;

    var g = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(titulo) +
      '&dates=' + utc(E.puertas) + '/' + utc(E.fin) +
      '&details=' + encodeURIComponent(detalle) +
      '&location=' + encodeURIComponent(lugar);

    var ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Rueda Cultural//Tornada//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:tornada-20261202@ruedacultural',
      'DTSTAMP:' + utc(new Date().toISOString()),
      'DTSTART:' + utc(E.puertas),
      'DTEND:' + utc(E.fin),
      'SUMMARY:' + titulo,
      'DESCRIPTION:' + detalle.replace(/\n/g, '\\n').replace(/,/g, '\\,'),
      'LOCATION:' + lugar.replace(/,/g, '\\,'),
      'BEGIN:VALARM', 'TRIGGER:-PT3H', 'ACTION:DISPLAY', 'DESCRIPTION:Hoy es Tornada', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');

    var a;
    if ((a = $('#cal-google'))) a.href = g;
    if ((a = $('#cal-ics'))) a.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
    if ((a = $('[data-href-maps]'))) a.href = E.mapsUrl;

    prepararWhatsApp(seguimiento(), '. Ya llené el formulario.');

    /* Compra registrada → evento Purchase (una vez por sesión) */
    if (C.metaPixelId) {
      var ya = false;
      try { ya = sessionStorage.getItem('tornada_purchase') === '1'; } catch (e) {}
      if (!ya) {
        evento('Purchase', { value: C.valorCompraReferencial, currency: 'PEN' });
        try { sessionStorage.setItem('tornada_purchase', '1'); } catch (e) {}
      }
    }
  }

  /* ---------- Arranque ---------- */
  cargarPixel();
  if (pagina === 'inicio') inicio();
  if (pagina === 'gracias') gracias();
})();
