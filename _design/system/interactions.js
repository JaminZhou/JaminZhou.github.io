/* Progressive enhancement only: all product links/content exist in HTML. */
(() => {
  const applyTheme = value => {
    if (value === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = value;
    document.querySelectorAll('[data-theme-select]').forEach(select => { select.value = value; });
  };
  let saved = 'system';
  try { saved = localStorage.getItem('jamin-theme') || 'system'; } catch {}
  if (!['system', 'light', 'dark'].includes(saved)) saved = 'system';
  applyTheme(saved);
  document.querySelectorAll('[data-theme-select]').forEach(select => select.addEventListener('change', () => {
    applyTheme(select.value);
    try { localStorage.setItem('jamin-theme', select.value); } catch {}
  }));
  window.addEventListener('storage', event => {
    if (event.key === 'jamin-theme') applyTheme(['light','dark'].includes(event.newValue) ? event.newValue : 'system');
  });
  const menus = [...document.querySelectorAll('.locale-menu,.mobile-menu')];
  menus.forEach(menu => menu.addEventListener('toggle', () => {
    if (menu.open) menus.filter(other => other !== menu).forEach(other => { other.open = false; });
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') menus.forEach(menu => { if (menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
  });
  document.addEventListener('click', event => menus.forEach(menu => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
    else if (menu.open && event.target.closest('a')) menu.open = false;
  }));
  document.querySelectorAll('[data-catalog]').forEach(catalog => {
    const cards = [...catalog.querySelectorAll('.product-card')];
    catalog.querySelector('[data-filter-controls]').hidden = false;
    catalog.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      const choice = button.dataset.filter;
      catalog.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      let count = 0;
      cards.forEach(card => { card.hidden = choice !== 'all' && !card.dataset.platforms.split(' ').includes(choice); if (!card.hidden) count++; });
      const counter = catalog.querySelector('[data-catalog-count]');
      counter.textContent = `${count} ${counter.dataset.label}`;
      catalog.querySelector('[data-empty]').hidden = count !== 0;
    }));
  });
  const route = document.querySelector('[data-preview-route]');
  const width = document.querySelector('[data-preview-width]');
  const frame = document.querySelector('.preview-frame');
  if (route && frame) route.addEventListener('change', () => { frame.src = route.value; });
  if (width && frame) width.addEventListener('change', () => {
    document.querySelector('.preview-device').dataset.width = width.value;
    document.querySelector('.preview-label').textContent = width.value === 'full' ? 'Full width' : `${width.value} px`;
  });
})();
