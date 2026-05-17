  let currentFont = '';
  let loadedLink = null;
 
  const PAIRS = [
    { label: 'A + diagonal', chars: ['AV', 'AW', 'AY'] },
    { label: 'T mayúscula', chars: ['To', 'Te', 'Tu'] },
    { label: 'W + vocal', chars: ['WA', 'We', 'Wo'] },
    { label: 'F + minúscula', chars: ['fa', 'fo', 'fr'] },
    { label: 'Ligaduras', chars: ['fi', 'fl', 'ffi'] },
    { label: 'Números', chars: ['17', '74', '71'] },
  ];
 
  function extractFamily(url) {
    const m = url.match(/family=([^&:+]+)/);
    return m ? decodeURIComponent(m[1]).replace(/\+/g, ' ') : null;
  }
 
  function importFont() {
    const raw = document.getElementById('font-url-input').value.trim();
    const input = document.getElementById('font-url-input');
    if (!raw) { setStatus('Pegá una URL de Google Fonts.', 'err'); return; }
 
    let url = raw;
    const m = raw.match(/url\(['"]?(https?:\/\/[^'")\s]+)/);
    if (m) url = m[1];
    if (!url.startsWith('http')) { setStatus('URL no válida.', 'err'); input.classList.add('error'); return; }
 
    injectFont(url, input);
  }
 
  function injectFont(url, inputEl) {
    if (loadedLink) loadedLink.remove();
    setStatus('Cargando…', '');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => {
      if (inputEl) { inputEl.classList.remove('error'); inputEl.classList.add('success'); }
      // Try to pre-fill font-family input if it's empty
      const famInput = document.getElementById('font-family-input');
      if (!famInput.value.trim()) {
        const detected = extractFamily(url);
        if (detected) {
          famInput.value = detected;
          famInput.classList.add('active');
          document.getElementById('family-hint').textContent = 'Nombre detectado automáticamente.';
          document.getElementById('family-hint').className = 'import-status ok';
        }
      }
      setStatus('✓ Hoja de estilos cargada', 'ok');
      applyFontFamily();
      renderPairs();
    };
    link.onerror = () => { setStatus('Error al cargar.', 'err'); if (inputEl) inputEl.classList.add('error'); };
    document.head.appendChild(link);
    loadedLink = link;
  }
 
  function applyFontFamily() {
    const val = document.getElementById('font-family-input').value.trim();
    currentFont = val;
    document.getElementById('active-font-name').textContent = val || 'sistema (sans-serif)';
    const famInput = document.getElementById('font-family-input');
    famInput.classList.toggle('active', !!val);
    updatePreview();
    renderPairs();
  }
 
  function setStatus(msg, type) {
    const el = document.getElementById('import-status');
    el.textContent = msg;
    el.className = 'import-status' + (type ? ' ' + type : '');
  }
 
  function ff() {
    return currentFont ? `'${currentFont}', sans-serif` : 'sans-serif';
  }
 
  function updatePreview() {
    const fs  = document.getElementById('sl-fs').value;
    const fw  = document.getElementById('sl-fw').value;
    const ls  = parseFloat(document.getElementById('sl-ls').value).toFixed(3);
    const ws  = parseFloat(document.getElementById('sl-ws').value).toFixed(2);
    const lh  = parseFloat(document.getElementById('sl-lh').value).toFixed(2);
    const fk  = document.getElementById('tog-fk').checked;
    const tr  = document.getElementById('tog-tr').checked;
    const lig = document.getElementById('tog-lig').checked;
    const onum= document.getElementById('tog-onum').checked;
 
    document.getElementById('val-fs').textContent = fs + 'px';
    document.getElementById('val-fw').textContent = fw;
    document.getElementById('val-ls').textContent = ls + 'em';
    document.getElementById('val-ws').textContent = ws + 'em';
    document.getElementById('val-lh').textContent = lh;
 
    const h = document.getElementById('headline-el');
    Object.assign(h.style, {
      fontFamily: ff(), fontSize: fs + 'px', fontWeight: fw,
      letterSpacing: ls + 'em', wordSpacing: ws + 'em', lineHeight: lh,
      fontKerning: fk ? 'normal' : 'none',
      textRendering: tr ? 'optimizeLegibility' : 'auto',
      fontVariantLigatures: lig ? 'common-ligatures' : 'none',
      fontVariantNumeric: onum ? 'oldstyle-nums' : 'normal',
    });
 
    const b = document.getElementById('body-el');
    Object.assign(b.style, {
      fontFamily: ff(), letterSpacing: ls + 'em', wordSpacing: ws + 'em',
      lineHeight: lh, fontKerning: fk ? 'normal' : 'none',
      fontVariantLigatures: lig ? 'common-ligatures' : 'none',
    });
 
    document.querySelectorAll('.pair-glyph').forEach(el => {
      el.style.fontFamily = ff();
      el.style.fontWeight = fw;
    });
 
    document.getElementById('m-ls').textContent = ls + 'em';
    document.getElementById('m-fk').textContent = fk ? 'normal' : 'none';
    document.getElementById('m-lig').textContent = lig ? 'on' : 'off';
    document.getElementById('m-tr').textContent = tr ? 'optLeg' : 'auto';
 
    const lsn = parseFloat(ls);
    const rbEl = document.getElementById('rb-ls');
    const rbRec = document.getElementById('rb-rec');
    if (lsn >= -0.015 && lsn <= 0.025) {
      rbEl.textContent = '✓ Óptimo'; rbEl.className = 'rb-indicator rb-ok';
      rbRec.textContent = 'Espaciado ideal para lectura continua.';
    } else if ((lsn > 0.025 && lsn <= 0.08) || (lsn < -0.015 && lsn >= -0.06)) {
      rbEl.textContent = '⚠ Moderado'; rbEl.className = 'rb-indicator rb-warn';
      rbRec.textContent = lsn > 0 ? 'Generoso; ok en textos cortos o all-caps.' : 'Comprimido; apto para titulares grandes.';
    } else {
      rbEl.textContent = '✗ Extremo'; rbEl.className = 'rb-indicator rb-bad';
      rbRec.textContent = 'Dificulta la lectura en cualquier contexto.';
    }
 
    buildCSS(fs, fw, ls, ws, lh, fk, tr, lig, onum);
  }
 
  function p(prop, val, comment) {
    return `  <span class="tk">${prop}</span><span class="ts">:</span> <span class="tv">${val}</span><span class="ts">;</span>${comment ? `  <span class="tc">/* ${comment} */</span>` : ''}`;
  }
 
  function buildCSS(fs, fw, ls, ws, lh, fk, tr, lig, onum) {
    const fam = currentFont || 'sans-serif';
    const lines = [
      `<span class="tc">/* Titular */</span>`,
      `.headline {`,
      currentFont ? p('font-family', `'${fam}', sans-serif`, 'importá con @import') : null,
      p('font-size', fs + 'px'),
      p('font-weight', fw),
      p('line-height', lh),
      parseFloat(ls) !== 0 ? p('letter-spacing', ls + 'em') : null,
      parseFloat(ws) !== 0 ? p('word-spacing', ws + 'em') : null,
      p('font-kerning', fk ? 'normal' : 'none', fk ? 'activa tablas de la fuente' : ''),
      tr ? p('text-rendering', 'optimizeLegibility', 'solo en titulares') : null,
      p('font-variant-ligatures', lig ? 'common-ligatures' : 'none'),
      onum ? p('font-variant-numeric', 'oldstyle-nums') : null,
      `}`,
    ].filter(Boolean);
    document.getElementById('css-headline-out').innerHTML = lines.join('\n');
 
    const blines = [
      `<span class="tc">/* Cuerpo de texto */</span>`,
      `.body-text {`,
      currentFont ? p('font-family', `'${fam}', sans-serif`) : null,
      p('font-size', '16px', 'o 18px para mayor confort'),
      p('line-height', '1.65', 'mínimo recomendado'),
      p('font-kerning', 'normal', 'siempre activado'),
      p('font-variant-ligatures', 'common-ligatures'),
      p('letter-spacing', 'normal', 'no modificar en cuerpo'),
      `}`,
    ].filter(Boolean);
    document.getElementById('css-body-out').innerHTML = blines.join('\n');
  }
 
  function renderPairs() {
    const grid = document.getElementById('pairs-grid');
    grid.innerHTML = '';
    PAIRS.forEach(pair => {
      const card = document.createElement('div');
      card.className = 'pair-card';
      card.innerHTML = `<h4>${pair.label}</h4>`;
      pair.chars.forEach(ch => {
        const row = document.createElement('div');
        row.className = 'pair-row';
        row.innerHTML = `
          <div class="pair-item">
            <div class="pair-lbl">sin kerning</div>
            <div class="pair-glyph" style="font-kerning:none;">${ch}</div>
          </div>
          <div class="pair-divider"></div>
          <div class="pair-item">
            <div class="pair-lbl">con kerning</div>
            <div class="pair-glyph" style="font-kerning:normal;font-variant-ligatures:common-ligatures;">${ch}</div>
          </div>
        `;
        card.appendChild(row);
      });
      grid.appendChild(card);
    });
  }
 
  function updateTheme() {
    const t = document.getElementById('theme-select').value;
    const themes = {
      dark:  { bg: '#18181a', text: '#f0efe8' },
      light: { bg: '#ffffff', text: '#111111' },
      cream: { bg: '#f5f0e8', text: '#2a2218' },
    };
    const c = themes[t];
    ['preview-bg', 'body-bg'].forEach(id => {
      document.getElementById(id).style.background = c.bg;
    });
    document.getElementById('headline-el').style.color = c.text;
    document.getElementById('body-el').style.color = c.text;
  }
 
  function switchTab(id, btn) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + id).classList.add('active');
  }
 
  function copyCss(srcId, btnId) {
    const text = document.getElementById(srcId).innerText;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById(btnId);
      const orig = btn.textContent;
      btn.textContent = '✓ Copiado';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1800);
    });
  }
 
  function resetAll() {
    document.getElementById('sl-fs').value = 64;
    document.getElementById('sl-fw').value = 700;
    document.getElementById('sl-ls').value = 0;
    document.getElementById('sl-ws').value = 0;
    document.getElementById('sl-lh').value = 1.1;
    document.getElementById('tog-fk').checked = true;
    document.getElementById('tog-tr').checked = false;
    document.getElementById('tog-lig').checked = true;
    document.getElementById('tog-onum').checked = false;
    updatePreview();
  }
 
  document.getElementById('font-url-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); importFont(); }
  });
 
  renderPairs();
  updatePreview();