/* =====================================================================
   TORNADA — CONFIGURACIÓN
   Todo lo que cambia (fechas, precios, enlaces, números) vive aquí.
   No hace falta tocar index.html ni gracias.html.
   Las fechas van en hora de Lima (-05:00). Formato: AAAA-MM-DDTHH:MM:SS-05:00
   Los textos entre corchetes [ASÍ] son datos pendientes.
   ===================================================================== */

window.TORNADA = {

  /* ---------- Evento ---------- */
  evento: {
    titulo: "Tornada",
    subtitulo: "El tiempo no existe",
    artista: "Katia Uriol",
    sencillo: "Curita (estoy sintiendo todo)",
    lugar: "Jazz Zone",
    direccion: "Av. La Paz 656, Pasaje El Suche, Miraflores, Lima",
    mapsUrl: "https://maps.app.goo.gl/aXGLLwpGmD28fWHK7",
    puertas: "2026-12-02T20:00:00-05:00",
    show:    "2026-12-02T20:30:00-05:00",
    fin:     "2026-12-02T22:00:00-05:00",
    aforo: 120
  },

  /* ---------- Tramos de precio ----------
     El tramo vigente se elige solo según la fecha.
     "opcionAirtable" debe ser IDÉNTICA a la opción del campo
     "Tipo de entrada" en tu formulario (mayúsculas y tildes incluidas). */
  tramos: [
    {
      id: "earlybird",
      nombre: "Early bird",
      precio: 25,
      inicio: "2026-11-06T00:00:00-05:00",
      fin:    "2026-11-12T23:59:59-05:00",
      online: true,
      opcionAirtable: "Early bird"
    },
    {
      id: "preventa",
      nombre: "Preventa",
      precio: 35,
      inicio: "2026-11-13T00:00:00-05:00",
      fin:    "2026-12-01T23:59:59-05:00",
      online: true,
      opcionAirtable: "Preventa"
    },
    {
      id: "puerta",
      nombre: "Puerta",
      precio: 40,
      inicio: "2026-12-02T00:00:00-05:00",
      fin:    "2026-12-02T22:00:00-05:00",
      online: false,
      nota: "El 2 de diciembre, sujeto a disponibilidad"
    }
  ],

  /* Entrada de estudiante: vale durante toda la venta online */
  estudiante: {
    nombre: "Estudiantes",
    precio: 25,
    inicio: "2026-11-06T00:00:00-05:00",
    fin:    "2026-12-01T23:59:59-05:00",
    condicion: "Muestra tu carnet vigente al ingresar.",
    opcionAirtable: "Estudiante"
  },

  /* Ponlo en true si se acaba el aforo: oculta el formulario y muestra "Agotado" */
  agotado: false,

  /* ---------- Pago ---------- */
  pago: {
    numero: "983545543",          // se muestra como 983 545 543
    titular: "Gabriel Ramos",
    metodos: "Yape o Plin",
    qrImagen: ""                  // [QR] ej.: "img/qr-yape.webp" — vacío = no se muestra
  },

  /* ---------- WhatsApp (alternativa al formulario) ---------- */
  whatsapp: {
    numero: "[NÚMERO WHATSAPP]",  // con código de país, sin + ni espacios: "51999888777"
    mensaje: "Hola, quiero comprar entradas para Tornada",
    agregarReferencia: true       // agrega "(de parte de …)" si el enlace trae ?v=
  },

  /* ---------- Formulario de Airtable ----------
     URL del embed: Airtable > formulario > Compartir > Embed > copia el "src".
     Debe verse así: https://airtable.com/embed/appXXXXXXXXXXXXXX/pagXXXXXXXXXXXXXX/form
     Los nombres de campo deben coincidir EXACTAMENTE con los del formulario. */
  airtable: {
    embedUrl: "https://airtable.com/embed/appsRxiggvGuilmcb/paghSEUNdhWa85BTe/form",
    campos: {
      vendidoPor: "Vendido por",
      origen: "Origen",
      tipoEntrada: "Tipo de entrada"
    },
    ocultarCampos: true,              // oculta "Vendido por" y "Origen" al comprador
    precargarTipoEntrada: false,      // el formulario actual no tiene campo "Tipo de entrada"
    alturaIframe: 1350
  },

  /* ---------- Seguimiento de ventas ----------
     Enlaces por vendedor: https://ruedacultural.github.io/tornada/?v=katia
     Enlaces por canal:    ...?utm_source=instagram&utm_medium=bio
     Se pueden combinar:   ...?v=katia&utm_source=instagram&utm_medium=historia
     El valor que llega a Airtable es el de la derecha; si "Vendido por" es una
     lista de opciones, esos textos deben existir en Airtable. */
  vendedores: {
    katia:   "Katia Uriol",
    gabriel: "Gabriel Ramos",
    ana:     "Ana Paula Gálvez",
    akemi:   "Akemi Toma",
    zirio:   "Zirio",
    klua:    "Klúa Music",
    jm:      "José Miguel Argüelles"
    // [AGREGA MÁS VENDEDORES AQUÍ]
  },
  vendedorPorDefecto: "Web",
  origenPorDefecto: "directo",

  /* ---------- Píxel de Meta (opcional) ----------
     Vacío = no se carga. Ej.: "1140337005351844" */
  metaPixelId: "",
  valorCompraReferencial: 30,         // S/ promedio para el evento Purchase

  /* ---------- Música ---------- */
  musica: {
    spotifyTrackId: "3CrjyK9wFTsGOTPnVLM2RU",
    youtubeId: "FPq0OP2crzo",
    appleMusicUrl: "https://music.apple.com/pe/album/curita-estoy-sintiendo-todo-single/6791065008"
  },

  /* ---------- Redes y contacto ---------- */
  redes: {
    katia: "https://www.instagram.com/katia.uriol/",
    rueda: "https://www.instagram.com/ruedacultural/",
    correo: "ruedacultural.producciones@gmail.com"
  },

  /* Permite probar la página en otra fecha con ?fecha=2026-11-20
     (solo cambia lo que ves tú; ponlo en false cuando termines de probar) */
  permitirSimularFecha: true
};
