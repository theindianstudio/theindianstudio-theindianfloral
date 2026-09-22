// The Indian Floral — hero slideshow, header, mobile menu, WhatsApp enquiry.

const WHATSAPP_NUMBER = window.TIF_WHATSAPP || '';   // set in assets/config.js

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- header: solid once the hero is scrolled past ---------- */
const header = document.querySelector('.site-header');
const hero = document.querySelector('.hero');
// pages without a photo hero (the shop) keep the solid header all the time
const setSolid = () => header.classList.toggle('solid', !hero || window.scrollY > hero.offsetHeight - 90);
setSolid();
window.addEventListener('scroll', setSolid, { passive: true });
window.addEventListener('resize', setSolid);

/* ---------- mobile menu ---------- */
const menu = document.getElementById('menu');
const nav = document.getElementById('nav');
const closeMenu = () => { header.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
menu.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ---------- hero slideshow ---------- */
if (hero) {
const slides = [...document.querySelectorAll('.slide')];
const dots = [...document.querySelectorAll('.dots button')];
const caption = document.getElementById('caption');
let current = 0, timer = null;

function show(i) {
  current = (i + slides.length) % slides.length;
  slides.forEach((s, k) => s.classList.toggle('is-active', k === current));
  dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === current)));
  caption.textContent = slides[current].dataset.caption;
}
function play() { if (!reduceMotion) { stop(); timer = setInterval(() => show(current + 1), 6000); } }
function stop() { clearInterval(timer); }

dots.forEach((d, k) => d.addEventListener('click', () => { show(k); play(); }));
hero.addEventListener('mouseenter', stop);
hero.addEventListener('mouseleave', play);
hero.addEventListener('focusin', stop);
hero.addEventListener('focusout', play);
document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));
play();
}

/* ---------- enquiry form -> WhatsApp ---------- */
const form = document.getElementById('enquiry');
const error = document.getElementById('form-error');

function waLink(text) {
  const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
}

form?.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(form);
  const missing = ['name', 'phone'].filter(k => !String(f.get(k) || '').trim());
  form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  if (missing.length) {
    missing.forEach(k => form.elements[k].setAttribute('aria-invalid', 'true'));
    error.textContent = 'Please add your name and phone number so we can reply.';
    error.hidden = false;
    form.elements[missing[0]].focus();
    return;
  }
  error.hidden = true;
  const date = f.get('date') ? new Date(f.get('date')).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'not decided yet';
  const text = [
    'Hello The Indian Floral!',
    `Name: ${f.get('name')}`,
    `Phone: ${f.get('phone')}`,
    `For: ${f.get('type')}`,
    `Date: ${date}`,
    f.get('message') ? `Details: ${f.get('message')}` : '',
  ].filter(Boolean).join('\n');
  window.open(waLink(text), '_blank', 'noopener');
});

/* floating button: open WhatsApp directly when a number is set */
if (WHATSAPP_NUMBER) {
  const fab = document.getElementById('wa-float');
  fab.href = waLink('Hello The Indian Floral! I would like to order flowers.');
  fab.target = '_blank';
  fab.rel = 'noopener';
}

document.getElementById('year').textContent = new Date().getFullYear();
