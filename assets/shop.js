// The Indian Floral — gift shop: product cards, cart, and checkout that sends the order on WhatsApp.
// Used by index.html (featured gifts) and shop.html (all gifts).
(() => {
  const PRODUCTS = window.TIF_PRODUCTS || [];
  const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  const inr = n => '₹' + n.toLocaleString('en-IN');
  const KEY = 'tif-cart';

  // cart = { productId: qty }, remembered in this browser only
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { cart = {}; }
  for (const id of Object.keys(cart)) if (!byId[id]) delete cart[id];
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch { /* private mode: cart lasts this visit */ } };

  /* ---------- product cards ---------- */
  function card(p) {
    const media = p.img
      ? `<img src="${p.img}" alt="${p.name}" loading="lazy" style="object-position:${p.pos || 'center'}">`
      : `<div class="ph ph-${p.collection}"><img src="assets/logo/flower-fullcolour.svg" alt="" loading="lazy"><span>Photo coming soon</span></div>`;
    return `<article class="product" data-collection="${p.collection}">
      <div class="p-media">${media}<span class="p-tag">${p.collection === 'forever' ? 'Ships across India' : 'Hosur & Bengaluru'}</span></div>
      <div class="p-body">
        <h3>${p.name}</h3>
        <p>${p.blurb}</p>
        <div class="p-foot"><span class="p-price">${inr(p.price)}</span>
          <button class="btn btn-dark btn-small" data-add="${p.id}">Add to bag</button></div>
      </div></article>`;
  }

  document.querySelectorAll('[data-products]').forEach(grid => {
    const which = grid.dataset.products;               // 'featured' | 'all'
    const list = which === 'featured'
      ? PRODUCTS.filter(p => p.collection === 'forever').slice(0, 4)
      : PRODUCTS;
    grid.innerHTML = list.map(card).join('');
  });

  /* filter chips on the shop page */
  const chips = document.querySelectorAll('[data-filter]');
  chips.forEach(chip => chip.addEventListener('click', () => {
    chips.forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
    const f = chip.dataset.filter;
    document.querySelectorAll('.product').forEach(el => { el.hidden = f !== 'all' && el.dataset.collection !== f; });
  }));

  /* ---------- bag drawer ---------- */
  const drawer = document.getElementById('bag');
  if (!drawer) return;
  const itemsEl = drawer.querySelector('.bag-items');
  const totalEl = drawer.querySelector('.bag-total');
  const countEls = document.querySelectorAll('.bag-count');
  const emptyEl = drawer.querySelector('.bag-empty');
  const checkout = drawer.querySelector('.bag-checkout');
  const freshNote = drawer.querySelector('.bag-fresh-note');

  function render() {
    const lines = Object.entries(cart).filter(([, q]) => q > 0);
    const count = lines.reduce((s, [, q]) => s + q, 0);
    const total = lines.reduce((s, [id, q]) => s + byId[id].price * q, 0);
    countEls.forEach(el => { el.textContent = count; el.hidden = count === 0; });
    emptyEl.hidden = count > 0;
    checkout.hidden = count === 0;
    freshNote.hidden = !lines.some(([id]) => byId[id].collection === 'fresh');
    itemsEl.innerHTML = lines.map(([id, q]) => `
      <li><div><p class="bi-name">${byId[id].name}</p><p class="bi-price">${inr(byId[id].price)} each</p></div>
        <div class="qty" role="group" aria-label="Quantity of ${byId[id].name}">
          <button type="button" data-dec="${id}" aria-label="One less">−</button><span>${q}</span>
          <button type="button" data-inc="${id}" aria-label="One more">+</button></div></li>`).join('');
    totalEl.textContent = inr(total);
  }

  const open = () => { drawer.hidden = false; requestAnimationFrame(() => drawer.classList.add('open')); drawer.querySelector('.bag-close').focus(); };
  const close = () => { drawer.classList.remove('open'); setTimeout(() => { drawer.hidden = true; }, 250); };

  document.addEventListener('click', e => {
    const t = e.target.closest('button, a');
    if (!t) return;
    if (t.dataset.add) { cart[t.dataset.add] = (cart[t.dataset.add] || 0) + 1; save(); render(); open();
      t.textContent = 'Added ✓'; setTimeout(() => { t.textContent = 'Add to bag'; }, 1400); }
    if (t.dataset.inc) { cart[t.dataset.inc]++; save(); render(); }
    if (t.dataset.dec) { cart[t.dataset.dec]--; if (cart[t.dataset.dec] <= 0) delete cart[t.dataset.dec]; save(); render(); }
    if (t.matches('[data-open-bag]')) { e.preventDefault(); open(); }
    if (t.matches('.bag-close') || t.matches('[data-keep-shopping]')) close();
  });
  drawer.addEventListener('click', e => { if (e.target === drawer) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) close(); });

  /* ---------- checkout -> WhatsApp ---------- */
  const err = drawer.querySelector('.form-error');
  checkout.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(checkout);
    const need = ['name', 'phone', 'address'].filter(k => !String(f.get(k) || '').trim());
    checkout.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    if (need.length) {
      need.forEach(k => checkout.elements[k].setAttribute('aria-invalid', 'true'));
      err.textContent = 'Please add your name, phone and delivery address.';
      err.hidden = false; checkout.elements[need[0]].focus(); return;
    }
    err.hidden = true;
    const lines = Object.entries(cart).map(([id, q]) => `• ${q} × ${byId[id].name} (${inr(byId[id].price * q)})`);
    const total = Object.entries(cart).reduce((s, [id, q]) => s + byId[id].price * q, 0);
    const text = ['Hello The Indian Floral! I would like to order:', ...lines, `Total: ${inr(total)}`, '',
      `Name: ${f.get('name')}`, `Phone: ${f.get('phone')}`, `Deliver to: ${f.get('address')}`,
      f.get('when') ? `Delivery date: ${f.get('when')}` : '', f.get('note') ? `Card message: ${f.get('note')}` : '']
      .filter(Boolean).join('\n');
    const num = window.TIF_WHATSAPP || '';
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });

  render();
})();
