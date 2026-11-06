# Tornada — página de venta de entradas

Concierto de lanzamiento de Katia Uriol · Jazz Zone · miércoles 2 de diciembre de 2026.
Una producción de Rueda Cultural. Se publica en GitHub Pages: `https://ruedacultural.github.io/tornada/`

## Estructura

```
tornada/
├── index.html            Página de venta (una sola página con scroll)
├── gracias.html          "Gracias por tu compra" + agregar al calendario
├── config.js             ← FECHAS, PRECIOS, NÚMEROS Y ENLACES (lo único que se edita)
├── css/estilos.css       Estilos de las dos páginas
├── js/app.js             Tramos automáticos, cuenta regresiva, prefill de Airtable, etc.
├── img/
│   ├── hero-katia-720.webp / hero-katia-1200.webp   Recorte de Katia en el tornado (hero)
│   ├── katia.webp        Retrato para la sección de artistas
│   ├── flyer.webp        Flyer completo (borrador)
│   ├── og.jpg            Vista previa al compartir (1080×1350)
│   ├── og-cuadrado.jpg   Alternativa cuadrada (1200×1200), por si WhatsApp recorta mal
│   ├── logo-rueda-blanco.svg / logo-rueda-vino.svg  Isologo vectorial (sacado del .ai)
│   ├── favicon.png / apple-touch-icon.png
│   └── qr-yape.webp      [QR] (opcional, súbelo tú y ponlo en config.js)
├── .nojekyll
└── README.md
```

## Pendientes (busca los corchetes)

| Marcador | Dónde | Qué poner |
|---|---|---|
| Campos `Vendido por` y `Origen` | Formulario de Airtable | Agrégalos como texto (pueden ir ocultos); sin ellos no se registra el seguimiento |
| `[NÚMERO WHATSAPP]` | config.js | Con código de país y sin espacios, p. ej. `51999888777` |
| `[QR]` | config.js → `pago.qrImagen` | `img/qr-yape.webp`, si tienes el QR |
| `[INSTAGRAM GABRIEL VARGAS]` y `[@USUARIO]` | index.html | Su Instagram (o borra el enlace) |
| `[NOMBRE DE LA PINTORA]` | index.html (comentario) | Cuando se confirme |
| `[FLYER FINAL]` | img/ | Reemplaza `hero-katia-*.webp`, `flyer.webp` y `og.jpg` con el flyer final (mismos nombres) |
| `metaPixelId` | config.js | Opcional: ID del píxel de Meta si harás pauta |

## Airtable: lo que debe coincidir

- Los nombres de campo de `config.js` → `airtable.campos` deben ser **idénticos** a los del formulario: `Vendido por`, `Origen`, `Tipo de entrada`.
- Las opciones de `Tipo de entrada` deben llamarse exactamente `Early bird`, `Preventa` y `Estudiante` (o cambia `opcionAirtable` en config.js).
- `Vendido por` y `Origen` conviene que sean **texto** (no lista de opciones): así entra cualquier valor sin errores.
- La redirección a `gracias.html` después de enviar el formulario requiere el plan Business de Airtable. Si no lo tienes, en el mensaje de confirmación del formulario pega el enlace `https://ruedacultural.github.io/tornada/gracias.html`.

## Enlaces de seguimiento

| Para | Enlace |
|---|---|
| Katia | `https://ruedacultural.github.io/tornada/?v=katia` |
| Bio de Instagram de Rueda | `…/tornada/?utm_source=instagram&utm_medium=bio` |
| Historia de Katia | `…/tornada/?v=katia&utm_source=instagram&utm_medium=historia` |
| Pauta de Meta | `…/tornada/?utm_source=meta&utm_medium=ads&utm_campaign=preventa` |

- `?v=` busca el código en `vendedores` (config.js) y manda el nombre completo a "Vendido por". Sin `?v=`, entra "Web".
- Los `utm_` se juntan en "Origen" (`instagram / historia / …`). Sin utm, se usa el sitio de procedencia (instagram, facebook, whatsapp…) o "directo".
- Ambos se guardan 30 días en el navegador: si la persona vuelve después sin el enlace, la venta se sigue atribuyendo.
- El botón de WhatsApp agrega "(de parte de Katia Uriol)" al mensaje cuando hay `?v=`, para atribuir también esas ventas.

## Probar en otras fechas

Agrega `?fecha=AAAA-MM-DD` a la URL: `?fecha=2026-11-20` (preventa), `?fecha=2026-12-02` (día del show, venta online cerrada), `?fecha=2026-12-03` (terminado). Antes del lanzamiento pon `permitirSimularFecha: false` en config.js.

## Publicar

1. Crea el repo `ruedacultural/tornada` y sube todo el contenido de esta carpeta a la raíz.
2. Settings → Pages → Source: `Deploy from a branch` → `main` / `(root)`.
3. Para refrescar la vista previa de WhatsApp/Facebook: https://developers.facebook.com/tools/debug/ (pega la URL y pulsa "Volver a extraer").

## Identidad visual

Sigue el Manual de identidad de Rueda Cultural (2026), sección "Universos de proyecto": el proyecto conserva su propio universo (la paleta de Tornada, el serif del flyer, curitas, rayitos, flores y brillos), y Rueda aporta la estructura y la firma: League Spartan + Manrope, la franja con el carmín #B51B35 de la línea "Producción de artes escénicas" y el pie en vino #661315 con el isologo en blanco. Myriad Pro no está en Google Fonts, así que el texto corrido va en Manrope.
