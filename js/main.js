// RB Obras y Reformas · web de muestra. Sin librerías. Solo fotos de obras (pedido del usuario: nada de vídeos).
// 1) Panel de obras: letras que giran hasta formar cada obra (como un panel de salidas).
// 2) Diario de un baño: la foto fija cambia según el día que estás leyendo.
// 3) Mapa de las islas: los puntos aparecen al llegar.
// 4) Ventana con las fotos de cada obra y formulario que abre WhatsApp.
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- cabecera ----------
const cab = $('.cab');
const alBajar = () => cab.classList.toggle('cab--baja', scrollY > 40);
addEventListener('scroll', alBajar, { passive: true }); alBajar();
$('.cab__menu')?.addEventListener('click', (e) => {
  const abierto = cab.classList.toggle('cab--abierta');
  e.currentTarget.setAttribute('aria-expanded', abierto);
});
$$('.cab__nav a').forEach((a) => a.addEventListener('click', () => { cab.classList.remove('cab--abierta'); $('.cab__menu')?.setAttribute('aria-expanded', 'false'); }));

// ---------- 1. panel de obras ----------
const CAR = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚ0123456789';
function preparaPanel(panel) {
  $$('[data-flap]', panel).forEach((celda) => {
    const txt = celda.dataset.flap.toUpperCase();
    const pals = txt.split(' ');
    celda.textContent = '';
    const vis = document.createElement('span'); vis.className = 'sr'; vis.textContent = celda.dataset.flap; celda.appendChild(vis);
    pals.forEach((pal, ip) => {
      const g = document.createElement('span'); g.className = 'pal'; g.setAttribute('aria-hidden', 'true');
      [...pal].forEach((ch) => {
        const t = document.createElement('span'); t.className = 'ficha'; t.dataset.ch = ch; t.textContent = quieto ? ch : ' ';
        g.appendChild(t);
      });
      celda.appendChild(g);
    });
  });
}
function giraPanel(panel) {
  if (quieto) return;
  $$('.fila', panel).forEach((fila, i) => {
    $$('.ficha', fila).forEach((t, j) => {
      const fin = t.dataset.ch; const vueltas = 3 + ((j * 7 + i * 3) % 6);
      let n = 0;
      const paso = () => {
        t.classList.remove('gira'); void t.offsetWidth; t.classList.add('gira');
        const k = CAR.indexOf(fin);
        t.textContent = n >= vueltas || k < 0 ? fin : CAR[(k + (vueltas - n) * 5) % CAR.length];
        if (n++ < vueltas) setTimeout(paso, 62);
      };
      setTimeout(paso, i * 130 + j * 14);
    });
  });
}
$$('.panel').forEach((panel) => {
  preparaPanel(panel);
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { giraPanel(panel); io.disconnect(); } }, { threshold: 0.2 });
  io.observe(panel);
});

// ---------- 4. ventana con las fotos de la obra ----------
const ventana = $('#ventana');
function abreObra(btn) {
  const fotos = JSON.parse(btn.dataset.fotos);
  const cont = $('.ventana__fotos', ventana);
  cont.innerHTML = fotos.map((f, i) => `<picture><source type="image/avif" srcset="${f}-720.avif"><img src="${f}-720.webp" width="720" height="960" alt="${btn.dataset.titulo} · foto ${i + 1}" ${i ? 'loading="lazy"' : ''} decoding="async"></picture>`).join('');
  cont.scrollLeft = 0;
  $('.ventana__fecha', ventana).textContent = btn.dataset.fecha;
  $('.ventana__titulo', ventana).textContent = btn.dataset.titulo;
  $('.ventana__texto', ventana).textContent = btn.dataset.texto;
  $('.ventana__ig', ventana).href = btn.dataset.ig;
  ventana.showModal();
}
$$('[data-fotos]').forEach((b) => b.addEventListener('click', () => abreObra(b)));
ventana?.addEventListener('click', (e) => { if (e.target === ventana) ventana.close(); });
$('.ventana__cerrar')?.addEventListener('click', () => ventana.close());

// ---------- 2. diario de un baño ----------
const diario = $('.diario');
if (diario) {
  const fotos = $$('.diario__foto', diario);
  const dias = $$('.dia', diario);
  const etiqueta = $('.diario__dia', diario);
  const barra = $('.diario__barra i', diario);
  let actual = -1;
  const pon = (i) => {
    if (i === actual) return; actual = i;
    dias.forEach((d, k) => d.classList.toggle('dia--activo', k === i));
    fotos.forEach((f, k) => f.classList.toggle('diario__foto--ve', k === i));
    etiqueta.textContent = dias[i].dataset.etiqueta;
    barra.style.transform = `scaleX(${(i + 1) / dias.length})`;
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) pon(dias.indexOf(e.target)); }), { rootMargin: '-48% 0px -48% 0px' });
  dias.forEach((d) => io.observe(d));
  pon(0);
}

// ---------- 3. mapa ----------
const mapa = $('.islas__mapa');
if (mapa) new IntersectionObserver(([e], o) => { if (e.isIntersecting) { mapa.classList.add('islas__mapa--ve'); o.disconnect(); } }, { threshold: 0.3 }).observe(mapa);

// ---------- entradas suaves ----------
const entra = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('ve'); entra.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
$$('.aparece').forEach((el) => entra.observe(el));

// ---------- formulario → WhatsApp ----------
const form = $('#presupuesto');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(form);
  const lineas = [
    'Hola RB, quiero pedir presupuesto.',
    `Tipo de obra: ${f.get('tipo')}`,
    f.get('zona') ? `Zona: ${f.get('zona')}` : '',
    f.get('detalle') ? `Lo que necesito: ${f.get('detalle')}` : '',
    f.get('nombre') ? `Me llamo ${f.get('nombre')}.` : '',
  ].filter(Boolean);
  open(`https://wa.me/${form.dataset.tel}?text=${encodeURIComponent(lineas.join('\n'))}`, '_blank', 'noopener');
});
