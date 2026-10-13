/* Hạ tầng chung: KaTeX, tiến độ học, thanh điều hướng */
(function () {
  /* chế độ tối: chọn màu sáng hơn cho nền tối (khớp với biến CSS --ca --cb --cc) */
  const isDark = () => { try { return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); } catch (e) { return false; } };
  const LIGHT = { a: '#e11d48', b: '#16a34a', c: '#2563eb', purple: '#7c3aed', indigo: '#4f46e5', amber: '#d97706', amberTx: '#b45309', mark: '#444444', grey: '#7c8498', mute: '#5b6478' };
  const DARK = { a: '#fb7185', b: '#4ade80', c: '#60a5fa', purple: '#a78bfa', indigo: '#8b93ff', amber: '#fbbf24', amberTx: '#fbbf24', mark: '#cbd5e1', grey: '#8a92a8', mute: '#a3abc0' };
  const COL = {};
  Object.keys(LIGHT).forEach((k) => Object.defineProperty(COL, k, { enumerable: true, get() { return (isDark() ? DARK : LIGHT)[k]; } }));
  const hx = (c) => c.replace('#', '');
  const macros = () => ({
    '\\sa': '\\textcolor{' + hx(COL.a) + '}{a}', '\\sb': '\\textcolor{' + hx(COL.b) + '}{b}', '\\sc': '\\textcolor{' + hx(COL.c) + '}{c}',
    '\\gA': '\\textcolor{' + hx(COL.a) + '}{A}', '\\gB': '\\textcolor{' + hx(COL.b) + '}{B}', '\\gC': '\\textcolor{' + hx(COL.c) + '}{C}',
    '\\BC': '\\textcolor{' + hx(COL.a) + '}{BC}', '\\AC': '\\textcolor{' + hx(COL.b) + '}{AC}', '\\AB': '\\textcolor{' + hx(COL.c) + '}{AB}',
    '\\CA': '\\textcolor{' + hx(COL.b) + '}{CA}'
  });
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  function K(tex, display) {
    try {
      if (window.katex) return window.katex.renderToString(tex, { throwOnError: false, strict: 'ignore', displayMode: !!display, macros: macros() });
    } catch (e) { /* rơi xuống bản chữ thô */ }
    return '<code>' + esc(tex) + '</code>';
  }
  /* "Chữ thường $\\sa^2$ chữ thường" -> HTML, phần giữa hai dấu $ là công thức */
  function rich(str) {
    return String(str).split('$').map((seg, i) => (i % 2 ? K(seg) : seg)).join('');
  }
  const nt = (x, d) => window.TM.fmt(x, d).replace(',', '{,}'); // số dùng trong TeX
  /* số nguyên thì không in đuôi ,00 (cho học sinh khỏi tưởng là đã làm tròn) */
  const ni = (x, d) => (isFinite(x) && Math.abs(x - Math.round(x)) < 1e-9 ? nt(Math.round(x), 0) : nt(x, d));
  const tx = (x, d) => window.TM.fmt(x, d);                      // số dùng trong chữ thường

  function renderStatic(root) {
    (root || document).querySelectorAll('.m,.mb').forEach((el) => {
      if (el.dataset.done) return;
      const t = el.dataset.tex || el.textContent;
      el.dataset.tex = t;
      el.innerHTML = K(t, el.classList.contains('mb'));
      el.dataset.done = '1';
    });
    (root || document).querySelectorAll('.rich').forEach((el) => {
      if (el.dataset.done) return;
      el.innerHTML = rich(el.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
      el.dataset.done = '1';
    });
  }

  /* ---- lưu tiến độ (có thể không dùng được: chế độ riêng tư) ---- */
  const KEY = 'tm10.done.v1';
  const store = {
    get() { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } }
  };
  let memory = null;
  function getDone() { if (memory === null) memory = store.get(); return memory; }

  function updateProgress() {
    const chaps = [...document.querySelectorAll('section.chap[data-track]')];
    const done = getDone();
    const n = chaps.filter((c) => done.includes(c.id)).length;
    const bar = document.getElementById('pbar'), txt = document.getElementById('ptxt');
    if (bar) bar.style.width = (chaps.length ? (n / chaps.length) * 100 : 0) + '%';
    if (txt) txt.textContent = n + '/' + chaps.length + ' phần đã học xong' + (n === chaps.length && n ? ' — Giỏi lắm! 🎉' : '');
    document.querySelectorAll('nav.top a[data-id]').forEach((a) => a.classList.toggle('done', done.includes(a.dataset.id)));
    chaps.forEach((c) => {
      const b = c.querySelector('.donebtn button');
      if (!b) return;
      const on = done.includes(c.id);
      b.classList.toggle('on', on);
      b.textContent = on ? '✓ Đã học xong phần này' : 'Đánh dấu: mình đã hiểu phần này';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function setup() {
    renderStatic();
    // nút "đã hiểu"
    document.querySelectorAll('section.chap[data-track]').forEach((c) => {
      const d = document.createElement('div'); d.className = 'donebtn';
      const b = document.createElement('button'); b.className = 'btn sec'; b.type = 'button';
      b.addEventListener('click', () => {
        let done = getDone().slice();
        done = done.includes(c.id) ? done.filter((x) => x !== c.id) : done.concat(c.id);
        memory = done; store.set(done); updateProgress();
      });
      d.appendChild(b); c.appendChild(d);
    });
    // thanh điều hướng
    const nav = document.querySelector('nav.top .wrap');
    document.querySelectorAll('section.chap[data-nav]').forEach((c) => {
      const a = document.createElement('a'); a.href = '#' + c.id; a.dataset.id = c.id; a.textContent = c.dataset.nav;
      nav.appendChild(a);
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            nav.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === e.target.id));
            const on = nav.querySelector('a.on'); if (on && on.scrollIntoView) { try { nav.scrollTo({ left: on.offsetLeft - 40, behavior: 'smooth' }); } catch (x) { /* ok */ } }
          }
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      document.querySelectorAll('section.chap[data-nav]').forEach((c) => io.observe(c));
    }
    updateProgress();
  }
  window.UI = { K, rich, nt, ni, tx, esc, COL, renderStatic, setup, updateProgress };
})();
