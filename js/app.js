/* Kerning Explorer — Vanilla JS */

// ── State ──
let currentFont = '';
let loadedLink = null;
let activeElement = 'h1';

const ELEMENT_DEFAULTS = {
  h1: { fs: 48, fw: 300, ls: 0, ws: 0, lh: 1.2, fk: true, tr: false, lig: true, onum: false },
  h2: { fs: 32, fw: 500, ls: 0, ws: 0, lh: 1.3, fk: true, tr: false, lig: true, onum: false },
  p:  { fs: 16, fw: 500, ls: 0, ws: 0, lh: 1.65, fk: true, tr: false, lig: true, onum: false },
};

let elements = JSON.parse(JSON.stringify(ELEMENT_DEFAULTS));

const PAIRS = [
  { label: 'A + diagonal', chars: ['AV', 'AW', 'AY'] },
  { label: 'T mayúscula', chars: ['To', 'Te', 'Tu'] },
  { label: 'W + vocal', chars: ['WA', 'We', 'Wo'] },
  { label: 'F + minúscula', chars: ['fa', 'fo', 'fr'] },
  { label: 'Ligaduras', chars: ['fi', 'fl', 'ffi'] },
  { label: 'Números', chars: ['17', '74', '71'] },
];

// ── Cached DOM refs ──
const $ = id => document.getElementById(id);

const dom = {};
function cacheDom() {
  const ids = [
    'hamburger-btn', 'theme-select', 'custom-bg', 'custom-text', 'custom-colors',
    'drawer-overlay', 'aside-panel',
    'import-section', 'font-url-input', 'import-status', 'font-family-input',
    'drop-zone', 'font-file-input',
    'sl-fs', 'sl-fw', 'sl-ls', 'sl-ws', 'sl-lh',
    'val-fs', 'val-fw', 'val-ls', 'val-ws', 'val-lh',
    'tog-fk', 'tog-tr', 'tog-lig', 'tog-onum',
    'element-select', 'preview-bg',
    'el-h1', 'el-h2', 'el-p',
    'font-name-inline',
    'rb-ls', 'rb-rec',
    'm-ls', 'm-fk', 'm-lig', 'm-tr',
    'css-headline-out', 'css-subheading-out', 'css-body-out',
    'pairs-grid', 'pairs-empty',
    'tab-css', 'toast',
  ];
  ids.forEach(id => { dom[id] = $(id); });
}

// ── Debounce ──
function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// ── Utilities ──
function extractFamily(url) {
  const m = url.match(/family=([^&:+]+)/);
  return m ? decodeURIComponent(m[1]).replace(/\+/g, ' ') : null;
}

function setStatus(msg, type) {
  dom['import-status'].textContent = msg;
  dom['import-status'].className = 'import__status' + (type === 'err' ? ' is-err' : type === 'ok' ? ' is-ok' : '');
}

function showToast(msg) {
  dom.toast.textContent = msg;
  dom.toast.classList.add('is-visible');
  setTimeout(() => dom.toast.classList.remove('is-visible'), 2000);
}

function setLoading(on) {
  document.querySelector('.import__btn').classList.toggle('is-loading', on);
}

function ff() {
  return currentFont ? `'${currentFont}', sans-serif` : 'sans-serif';
}

// ── Font import ──
function importFont() {
  const raw = dom['font-url-input'].value.trim();
  if (!raw) { setStatus('Pegá una URL de Google Fonts.', 'err'); return; }

  let url = raw;
  const m = raw.match(/url\(['"]?(https?:\/\/[^'")\s]+)/);
  if (m) url = m[1];
  if (!url.startsWith('http')) { setStatus('URL no válida.', 'err'); dom['font-url-input'].classList.add('is-error'); return; }

  if (!url.includes('fonts.googleapis.com')) {
    setStatus('La URL debe ser de fonts.googleapis.com', 'err');
    dom['font-url-input'].classList.add('is-error');
    return;
  }

  injectFont(url, dom['font-url-input']);
}

function injectFont(url, inputEl) {
  if (loadedLink) loadedLink.remove();
  setStatus('Cargando…', '');
  setLoading(true);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;

  const timeout = setTimeout(() => {
    setStatus('Timeout: la respuesta tardó demasiado.', 'err');
    if (inputEl) inputEl.classList.add('is-error');
    setLoading(false);
    link.remove();
  }, 10000);

  link.onload = () => {
    clearTimeout(timeout);
    setLoading(false);
    if (inputEl) { inputEl.classList.remove('is-error'); inputEl.classList.add('is-ok'); }
    if (!dom['font-family-input'].value.trim()) {
      const detected = extractFamily(url);
      if (detected) {
        dom['font-family-input'].value = detected;
        dom['font-family-input'].classList.add('is-active');
        dom['import-status'].textContent = 'Nombre detectado automáticamente.';
        dom['import-status'].className = 'import__status is-ok';
      }
    }
    setStatus('✓ Hoja de estilos cargada', 'ok');
    applyFontFamily();
    renderPairs();
  };

  link.onerror = () => {
    clearTimeout(timeout);
    setLoading(false);
    setStatus('Error al cargar. Verificá que la URL sea correcta.', 'err');
    if (inputEl) inputEl.classList.add('is-error');
    link.remove();
  };

  document.head.appendChild(link);
  loadedLink = link;
}

function applyFontFamily() {
  const val = dom['font-family-input'].value.trim();
  currentFont = val;
  dom['font-name-inline'].textContent = val || 'sistema (sans-serif)';
  dom['font-family-input'].classList.toggle('is-active', !!val);
  updatePreview();
  renderPairs();
}

function loadLocalFont(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['ttf', 'otf', 'woff', 'woff2'].includes(ext)) {
    showToast('Formato no soportado. Usá .ttf, .otf, .woff o .woff2');
    return;
  }
  const url = URL.createObjectURL(file);
  const familyName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');

  const style = document.createElement('style');
  style.textContent = `@font-face { font-family: '${familyName}'; src: url('${url}'); }`;
  document.head.appendChild(style);

  dom['font-family-input'].value = familyName;
  dom['font-url-input'].value = '';
  currentFont = familyName;
  applyFontFamily();
  renderPairs();
  showToast(`✓ "${familyName}" cargada desde archivo local`);
}

// ── Controls sync ──
function syncControlsToElement(el) {
  const s = elements[el];
  dom['sl-fs'].value = s.fs;
  dom['sl-fw'].value = s.fw;
  dom['sl-ls'].value = s.ls;
  dom['sl-ws'].value = s.ws;
  dom['sl-lh'].value = s.lh;
  dom['tog-fk'].checked = s.fk;
  dom['tog-tr'].checked = s.tr;
  dom['tog-lig'].checked = s.lig;
  dom['tog-onum'].checked = s.onum;
}

function readControlsToElement(el) {
  const s = elements[el];
  s.fs  = parseFloat(dom['sl-fs'].value);
  s.fw  = parseFloat(dom['sl-fw'].value);
  s.ls  = parseFloat(dom['sl-ls'].value);
  s.ws  = parseFloat(dom['sl-ws'].value);
  s.lh  = parseFloat(dom['sl-lh'].value);
  s.fk  = dom['tog-fk'].checked;
  s.tr  = dom['tog-tr'].checked;
  s.lig = dom['tog-lig'].checked;
  s.onum = dom['tog-onum'].checked;
}

// ── Persistence ──
function saveState() {
  localStorage.setItem('kerningExplorer', JSON.stringify({
    elements,
    theme: dom['theme-select'].value,
    customBg: dom['custom-bg'].value,
    customText: dom['custom-text'].value,
    font: currentFont,
    fontUrl: dom['font-url-input'].value,
    activeElement,
  }));
}

function saveToUrl() {
  const p = new URLSearchParams();
  for (const el of ['h1', 'h2', 'p']) {
    const s = elements[el];
    p.set(el + '.fs', s.fs);
    p.set(el + '.fw', s.fw);
    p.set(el + '.ls', s.ls);
    p.set(el + '.ws', s.ws);
    p.set(el + '.lh', s.lh);
    p.set(el + '.fk', s.fk ? '1' : '0');
    p.set(el + '.tr', s.tr ? '1' : '0');
    p.set(el + '.lig', s.lig ? '1' : '0');
    p.set(el + '.onum', s.onum ? '1' : '0');
  }
  p.set('theme', dom['theme-select'].value);
  if (dom['theme-select'].value === 'custom') {
    p.set('cbg', dom['custom-bg'].value);
    p.set('ctx', dom['custom-text'].value);
  }
  if (currentFont) p.set('font', currentFont);
  p.set('active', activeElement);
  history.replaceState(null, '', location.pathname + '?' + p.toString());
}

const debouncedSave = debounce(() => { saveState(); saveToUrl(); }, 300);

function loadFromUrl() {
  const p = new URLSearchParams(location.search);
  if (p.size === 0) return false;

  for (const el of ['h1', 'h2', 'p']) {
    const s = elements[el];
    if (p.has(el + '.fs'))  s.fs  = parseFloat(p.get(el + '.fs'));
    if (p.has(el + '.fw'))  s.fw  = parseFloat(p.get(el + '.fw'));
    if (p.has(el + '.ls'))  s.ls  = parseFloat(p.get(el + '.ls'));
    if (p.has(el + '.ws'))  s.ws  = parseFloat(p.get(el + '.ws'));
    if (p.has(el + '.lh'))  s.lh  = parseFloat(p.get(el + '.lh'));
    if (p.has(el + '.fk'))  s.fk  = p.get(el + '.fk') === '1';
    if (p.has(el + '.tr'))  s.tr  = p.get(el + '.tr') === '1';
    if (p.has(el + '.lig')) s.lig = p.get(el + '.lig') === '1';
    if (p.has(el + '.onum')) s.onum = p.get(el + '.onum') === '1';
  }

  if (p.has('theme')) dom['theme-select'].value = p.get('theme');
  if (p.has('cbg')) dom['custom-bg'].value = p.get('cbg');
  if (p.has('ctx')) dom['custom-text'].value = p.get('ctx');
  if (p.has('active')) activeElement = p.get('active');

  if (p.has('font')) {
    dom['font-family-input'].value = p.get('font');
    applyFontFamily();
  }

  dom['element-select'].value = activeElement;
  syncControlsToElement(activeElement);
  return true;
}

function loadState() {
  try {
    const raw = localStorage.getItem('kerningExplorer');
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s.elements) {
      for (const el of ['h1', 'h2', 'p']) {
        if (s.elements[el]) Object.assign(elements[el], s.elements[el]);
      }
    }
    if (s.theme) dom['theme-select'].value = s.theme;
    if (s.customBg) dom['custom-bg'].value = s.customBg;
    if (s.customText) dom['custom-text'].value = s.customText;
    if (s.fontUrl) dom['font-url-input'].value = s.fontUrl;
    if (s.font) {
      dom['font-family-input'].value = s.font;
      if (s.fontUrl) injectFont(s.fontUrl, null);
      else applyFontFamily();
    }
    if (s.activeElement) activeElement = s.activeElement;
    dom['element-select'].value = activeElement;
    syncControlsToElement(activeElement);
    updateTheme();
  } catch (_) {}
}

// ── Share ──
function shareState() {
  saveToUrl();
  navigator.clipboard.writeText(location.href).then(() => showToast('✓ URL copiada para compartir'));
}

// ── Preview ──
function updatePreview() {
  readControlsToElement(activeElement);

  const s = elements[activeElement];
  const fsPx = s.fs;
  const fsRem = (fsPx / 16).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  dom['val-fs'].textContent = fsRem + 'rem (' + fsPx + 'px)';
  dom['val-fw'].textContent = s.fw;
  const lsEm = parseFloat(s.ls).toFixed(3);
  const lsRem = (s.ls * fsPx / 16).toFixed(3);
  dom['val-ls'].textContent = lsEm + 'em (' + lsRem + 'rem)';
  const wsEm = parseFloat(s.ws).toFixed(2);
  const wsRem = (s.ws * fsPx / 16).toFixed(3);
  dom['val-ws'].textContent = wsEm + 'em (' + wsRem + 'rem)';
  dom['val-lh'].textContent = parseFloat(s.lh).toFixed(2);

  const fontVal = ff();
  for (const el of ['h1', 'h2', 'p']) {
    const s = elements[el];
    const node = dom['el-' + el];
    Object.assign(node.style, {
      fontFamily: fontVal,
      fontSize: s.fs + 'px',
      fontWeight: s.fw,
      letterSpacing: s.ls + 'em',
      wordSpacing: s.ws + 'em',
      lineHeight: s.lh,
      fontKerning: s.fk ? 'normal' : 'none',
      fontVariantLigatures: s.lig ? 'common-ligatures' : 'none',
      textRendering: s.tr ? 'optimizeLegibility' : 'auto',
      fontVariantNumeric: s.onum ? 'oldstyle-nums' : 'normal',
    });
  }

  document.querySelectorAll('.pairs__glyph').forEach(el => {
    el.style.fontFamily = fontVal;
    el.style.fontWeight = elements[activeElement].fw;
  });

  dom['m-ls'].textContent = parseFloat(s.ls).toFixed(3) + 'em';
  dom['m-fk'].textContent = s.fk ? 'normal' : 'none';
  dom['m-lig'].textContent = s.lig ? 'on' : 'off';
  dom['m-tr'].textContent = s.tr ? 'optLeg' : 'auto';

  if (s.ls >= -0.015 && s.ls <= 0.025) {
    dom['rb-ls'].className = 'readability is-ok';
    dom['rb-rec'].textContent = 'Espaciado ideal para lectura continua.';
  } else if ((s.ls > 0.025 && s.ls <= 0.08) || (s.ls < -0.015 && s.ls >= -0.06)) {
    dom['rb-ls'].className = 'readability is-warn';
    dom['rb-rec'].textContent = s.ls > 0 ? 'Generoso; ok en textos cortos o all-caps.' : 'Comprimido; apto para titulares grandes.';
  } else {
    dom['rb-ls'].className = 'readability is-bad';
    dom['rb-rec'].textContent = 'Dificulta la lectura en cualquier contexto.';
  }

  if (dom['tab-css'].classList.contains('is-active')) buildCSS();
  debouncedSave();
}

// ── CSS generation ──
function cssLine(prop, val, comment) {
  return `  <span class="code__prop">${prop}</span><span class="code__sep">:</span> <span class="code__val">${val}</span><span class="code__sep">;</span>${comment ? `  <span class="code__cmt">/* ${comment} */</span>` : ''}`;
}

function buildCSS() {
  const fam = currentFont || 'sans-serif';

  function block(label, selector, s) {
    const lines = [
      `<span class="code__cmt">/* ${label} */</span>`,
      `${selector} {`,
    ];
    if (currentFont) lines.push(cssLine('font-family', `'${fam}', sans-serif`));
    lines.push(cssLine('font-size', (s.fs / 16).toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + 'rem'));
    lines.push(cssLine('font-weight', s.fw));
    if (parseFloat(s.ls) !== 0) lines.push(cssLine('letter-spacing', s.ls + 'em'));
    if (parseFloat(s.ws) !== 0) lines.push(cssLine('word-spacing', s.ws + 'em'));
    if (parseFloat(s.lh) !== 1.65) lines.push(cssLine('line-height', s.lh));
    lines.push(cssLine('font-kerning', s.fk ? 'normal' : 'none', s.fk ? 'activa tablas de la fuente' : ''));
    if (!s.lig) lines.push(cssLine('font-variant-ligatures', 'none'));
    if (s.tr) lines.push(cssLine('text-rendering', 'optimizeLegibility', 'solo en titulares'));
    if (s.onum) lines.push(cssLine('font-variant-numeric', 'oldstyle-nums'));
    lines.push('}');
    return lines;
  }

  dom['css-headline-out'].innerHTML = block('h1 — Titular', '.headline', elements.h1).join('\n');
  dom['css-subheading-out'].innerHTML = block('h2 — Subtítulo', '.subheading', elements.h2).join('\n');
  dom['css-body-out'].innerHTML = block('p — Párrafo', '.body-text', elements.p).join('\n');
}

// ── Pairs ──
function renderPairs() {
  const grid = dom['pairs-grid'];
  const empty = dom['pairs-empty'];
  const hasFont = !!currentFont;

  empty.style.display = hasFont ? 'none' : 'block';
  grid.style.display = hasFont ? 'grid' : 'none';

  grid.innerHTML = '';
  PAIRS.forEach(pair => {
    const card = document.createElement('div');
    card.className = 'pairs__card';
    card.innerHTML = `<h4>${pair.label}</h4>`;
    pair.chars.forEach(ch => {
      const row = document.createElement('div');
      row.className = 'pairs__row';
      row.innerHTML = `
        <div class="pairs__item">
          <div class="pairs__label">sin kerning</div>
          <div class="pairs__glyph" style="font-kerning:none;">${ch}</div>
        </div>
        <div class="pairs__divider"></div>
        <div class="pairs__item">
          <div class="pairs__label">con kerning</div>
          <div class="pairs__glyph" style="font-kerning:normal;font-variant-ligatures:common-ligatures;">${ch}</div>
        </div>
      `;
      card.appendChild(row);
    });
    grid.appendChild(card);
  });
}

// ── Theme ──
const THEMES = {
  dark:  { bg: 'hsl(214, 5%, 11%)', text: 'hsl(215, 25%, 85%)' },
  light: { bg: 'hsl(215, 25%, 85%)', text: 'hsl(214, 5%, 11%)' },
  cream: { bg: 'hsl(36, 44%, 76%)', text: 'hsl(25, 20%, 15%)' },
};

function updateTheme() {
  const t = dom['theme-select'].value;
  if (t === 'custom') {
    dom['custom-colors'].classList.add('is-visible');
    applyCustomTheme();
    return;
  }
  dom['custom-colors'].classList.remove('is-visible');
  const c = THEMES[t];
  dom['preview-bg'].style.background = c.bg;
  dom['el-h1'].style.color = c.text;
  dom['el-h2'].style.color = c.text;
  dom['el-p'].style.color = c.text;
}

function applyCustomTheme() {
  const bg = dom['custom-bg'].value;
  const text = dom['custom-text'].value;
  dom['preview-bg'].style.background = bg;
  dom['el-h1'].style.color = text;
  dom['el-h2'].style.color = text;
  dom['el-p'].style.color = text;
}

// ── Tabs ──
function switchTab(id, btn) {
  document.querySelectorAll('.tabs__item').forEach(t => {
    t.classList.remove('is-active');
    t.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.tabs__panel').forEach(t => t.classList.remove('is-active'));
  btn.classList.add('is-active');
  btn.setAttribute('aria-selected', 'true');
  $('tab-' + id).classList.add('is-active');
  if (id === 'css') buildCSS();
  if (window.innerWidth <= 768 && dom['aside-panel'].classList.contains('is-open')) toggleDrawer();
}

function copyCss(srcId) {
  const text = $(srcId).innerText;
  navigator.clipboard.writeText(text).then(() => showToast('✓ CSS copiado al portapapeles'));
}

// ── Drawer / Accordion ──
function toggleDrawer() {
  dom['aside-panel'].classList.toggle('is-open');
  dom['drawer-overlay'].classList.toggle('is-active');
  dom['hamburger-btn'].classList.toggle('is-active');
}

function toggleAccordion(id) {
  $(id).classList.toggle('is-open');
}

// ── Element selection ──
function setActiveElement(el) {
  activeElement = el;
  document.querySelectorAll('.preview__el').forEach(e => {
    e.classList.remove('is-active');
    e.setAttribute('contenteditable', 'false');
  });
  const active = $('el-' + el);
  active.classList.add('is-active');
  active.setAttribute('contenteditable', 'true');
  syncControlsToElement(el);
  updatePreview();
}

function resetAll() {
  elements = JSON.parse(JSON.stringify(ELEMENT_DEFAULTS));
  dom['element-select'].value = 'h1';
  activeElement = 'h1';
  localStorage.removeItem('kerningExplorer');
  syncControlsToElement('h1');
  setActiveElement('h1');
}

// ── Event binding ──
function bindEvents() {
  // Header
  dom['hamburger-btn'].addEventListener('click', toggleDrawer);
  dom['drawer-overlay'].addEventListener('click', toggleDrawer);

  // Theme
  dom['theme-select'].addEventListener('change', updateTheme);
  dom['custom-bg'].addEventListener('input', applyCustomTheme);
  dom['custom-text'].addEventListener('input', applyCustomTheme);

  // Import section
  dom['import-section'].querySelector('.accordion__toggle').addEventListener('click', () => toggleAccordion('import-section'));
  dom['font-family-input'].addEventListener('input', applyFontFamily);
  dom['font-url-input'].addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); importFont(); }
  });
  document.querySelector('.import__btn').addEventListener('click', importFont);

  // Sliders — debounced
  const sliderIds = ['sl-fs', 'sl-fw', 'sl-ls', 'sl-ws', 'sl-lh'];
  const debouncedUpdate = debounce(updatePreview, 16);
  sliderIds.forEach(id => {
    dom[id].addEventListener('input', debouncedUpdate);
  });

  // Toggles
  const toggleIds = ['tog-fk', 'tog-tr', 'tog-lig', 'tog-onum'];
  toggleIds.forEach(id => {
    dom[id].addEventListener('change', updatePreview);
  });

  // Element selector
  dom['element-select'].addEventListener('change', e => setActiveElement(e.target.value));

  // Tabs
  document.querySelectorAll('.tabs__item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('aria-controls').replace('tab-', '');
      switchTab(id, btn);
    });
  });

  // Copy CSS buttons
  document.querySelectorAll('.code__copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.closest('.code').querySelector('.code__pre');
      if (pre) copyCss(pre.id);
    });
  });

  // Actions
  document.querySelector('.actions__btn:not(.actions__btn--share)').addEventListener('click', resetAll);
  document.querySelector('.actions__btn--share').addEventListener('click', shareState);

  // Drop zone
  const zone = dom['drop-zone'];
  const fileInput = dom['font-file-input'];
  if (zone && fileInput) {
    zone.addEventListener('click', () => fileInput.click());
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('is-dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-dragover'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('is-dragover');
      const file = e.dataTransfer.files[0];
      if (file) loadLocalFont(file);
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) loadLocalFont(fileInput.files[0]);
      fileInput.value = '';
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    const tag = e.target.tagName;
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable;

    if (e.key === 'Escape') {
      if (dom['aside-panel'].classList.contains('is-open')) toggleDrawer();
      return;
    }

    if (isInput) return;

    switch (e.key) {
      case '1': dom['element-select'].value = 'h1'; setActiveElement('h1'); break;
      case '2': dom['element-select'].value = 'h2'; setActiveElement('h2'); break;
      case '3': dom['element-select'].value = 'p';  setActiveElement('p');  break;
      case 'k': case 'K':
        dom['tog-fk'].checked = !dom['tog-fk'].checked;
        updatePreview(); break;
      case 'l': case 'L':
        dom['tog-lig'].checked = !dom['tog-lig'].checked;
        updatePreview(); break;
      case 'r': case 'R':
        dom['tog-tr'].checked = !dom['tog-tr'].checked;
        updatePreview(); break;
      case 'n': case 'N':
        dom['tog-onum'].checked = !dom['tog-onum'].checked;
        updatePreview(); break;
      case 's': case 'S':
        e.preventDefault(); shareState(); break;
      case 'z': case 'Z':
        resetAll(); break;
    }
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  cacheDom();
  bindEvents();
  renderPairs();
  setActiveElement('h1');
  updatePreview();
  if (!loadFromUrl()) loadState();
});
