/* Các hình tương tác (SVG) */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const { K, nt, COL } = window.UI;
  const Pal = COL; // màu đổi theo chế độ sáng/tối
  const T = window.TM;
  const $ = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const el = (tag, cls, html, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const sub = (P, Q) => ({ x: P.x - Q.x, y: P.y - Q.y });
  const norm = (v) => { const l = Math.hypot(v.x, v.y) || 1; return { x: v.x / l, y: v.y / l }; };
  const ok = (cond) => (cond ? '<span class="eqok">✓ bằng nhau</span>' : '<span class="bad">✗</span>');
  const near = (x, y) => Math.abs(x - y) < 1e-7 * Math.max(1, Math.abs(x), Math.abs(y));

  function svgPoint(svg, evt) {
    const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
    const m = svg.getScreenCTM(); return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 };
  }
  function label(parent, x, y, txt, color, size, anchor) {
    const t = $('text', { x, y, fill: color || 'currentColor', 'font-size': size || 16, 'font-weight': 700, 'text-anchor': anchor || 'middle', 'dominant-baseline': 'middle' }, parent);
    const i = String(txt).indexOf('_');
    if (i > 0) { // "h_a": chữ nhỏ hạ xuống làm chỉ số dưới
      t.appendChild(document.createTextNode(txt.slice(0, i)));
      const ts = $('tspan', { dy: Math.round((size || 16) * 0.3), 'font-size': Math.round((size || 16) * 0.72) }, t);
      ts.textContent = txt.slice(i + 1);
    } else t.textContent = txt;
    return t;
  }
  /* cung tròn tại đỉnh P giữa hai tia hướng tới Q và R, bán kính r */
  function arcPath(P, Q, R, r) {
    const u = norm(sub(Q, P)), v = norm(sub(R, P));
    const s = { x: P.x + u.x * r, y: P.y + u.y * r }, e = { x: P.x + v.x * r, y: P.y + v.y * r };
    const cross = u.x * v.y - u.y * v.x;
    return 'M' + s.x + ' ' + s.y + ' A' + r + ' ' + r + ' 0 0 ' + (cross > 0 ? 1 : 0) + ' ' + e.x + ' ' + e.y;
  }
  function rightMark(P, Q, R, s) {
    const u = norm(sub(Q, P)), v = norm(sub(R, P));
    const p1 = { x: P.x + u.x * s, y: P.y + u.y * s }, p3 = { x: P.x + v.x * s, y: P.y + v.y * s };
    const p2 = { x: p1.x + v.x * s, y: p1.y + v.y * s };
    return 'M' + p1.x + ' ' + p1.y + ' L' + p2.x + ' ' + p2.y + ' L' + p3.x + ' ' + p3.y;
  }

  /* ============ 1. Tam giác kéo thả: plain | cosin | sin | area ============ */
  function triLab(box, mode, title) {
    box.classList.add('lab');
    el('div', 'labtitle', title, box);
    const svg = $('svg', { viewBox: '0 0 400 290', role: 'img', 'aria-label': 'Tam giác ABC có thể kéo các đỉnh' }, box);
    const presets = el('div', 'presets', '', box);
    const help = el('div', 'labhelp', '👆 Kéo các điểm A, B, C (hoặc chọn gợi ý bên dưới) rồi xem số liệu thay đổi. Trên điện thoại: chạm vào điểm rồi kéo bằng ngón tay. Trên máy tính có bàn phím: bấm vào điểm rồi nhấn phím mũi tên.', box);
    const out = el('div', 'readout', '', box);
    const UNIT = 40;
    const P = { A: { x: 150, y: 60 }, B: { x: 50, y: 235 }, C: { x: 340, y: 235 } };
    const sets = {
      'Nhọn': () => ({ A: { x: 150, y: 60 }, B: { x: 50, y: 235 }, C: { x: 340, y: 235 } }),
      'Vuông tại A': () => { const th = T.rad(125); return { A: { x: 200 + 140 * Math.cos(th), y: 235 - 140 * Math.sin(th) }, B: { x: 60, y: 235 }, C: { x: 340, y: 235 } }; },
      'Tù tại A': () => ({ A: { x: 200, y: 160 }, B: { x: 60, y: 245 }, C: { x: 340, y: 245 } }),
      'Đều': () => ({ A: { x: 200, y: 44 }, B: { x: 90, y: 235 }, C: { x: 310, y: 235 } }),
      'Ngẫu nhiên': () => null
    };
    Object.keys(sets).forEach((k) => {
      const b = el('button', '', k, presets); b.type = 'button';
      b.addEventListener('click', () => {
        let s = sets[k]();
        if (!s) {
          for (let i = 0; i < 50; i++) {
            const r = () => ({ x: 30 + Math.random() * 340, y: 30 + Math.random() * 230 });
            const c = { A: r(), B: r(), C: r() };
            if (T.triFromPoints(c.A, c.B, c.C, UNIT).ok && T.triFromPoints(c.A, c.B, c.C, UNIT).S > 3) { s = c; break; }
          }
          if (!s) s = sets['Nhọn']();
        }
        P.A = s.A; P.B = s.B; P.C = s.C; draw();
      });
    });

    const g = $('g', {}, svg);
    const handles = {};
    ['A', 'B', 'C'].forEach((n) => {
      const h = $('circle', { r: 26, fill: 'rgba(79,70,229,.18)', stroke: Pal.indigo, 'stroke-width': 2, class: 'vtx', tabindex: 0, role: 'slider', 'aria-label': 'Điểm ' + n }, svg);
      handles[n] = h;
      let drag = false;
      const move = (x, y) => {
        const nx = T.clamp(x, 26, 374), ny = T.clamp(y, 26, 264);
        const old = P[n]; P[n] = { x: nx, y: ny };
        if (!T.triFromPoints(P.A, P.B, P.C, UNIT).ok) P[n] = old; // không cho tam giác bị "dẹt"
        draw();
      };
      h.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false }); // iOS: giữ trang đứng yên khi kéo điểm
      h.addEventListener('pointerdown', (e) => { drag = true; h.setPointerCapture(e.pointerId); e.preventDefault(); });
      h.addEventListener('pointermove', (e) => { if (drag) { const p = svgPoint(svg, e); move(p.x, p.y); } });
      const end = (e) => { drag = false; try { h.releasePointerCapture(e.pointerId); } catch (x) { /* ok */ } };
      h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end); h.addEventListener('lostpointercapture', () => { drag = false; });
      h.addEventListener('keydown', (e) => {
        const d = { ArrowLeft: [-4, 0], ArrowRight: [4, 0], ArrowUp: [0, -4], ArrowDown: [0, 4] }[e.key];
        if (d) { e.preventDefault(); move(P[n].x + d[0], P[n].y + d[1]); }
      });
    });

    const cx = (x) => T.clamp(x, 14, 386), cy = (y) => T.clamp(y, 14, 276); // nhãn không bị cắt khỏi khung
    function draw() {
      g.innerHTML = '';
      const t = T.triFromPoints(P.A, P.B, P.C, UNIT);
      const cen = { x: (P.A.x + P.B.x + P.C.x) / 3, y: (P.A.y + P.B.y + P.C.y) / 3 };
      // mode-specific
      if (mode === 'sin') {
        const { A, B, C } = P;
        const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
        const ux = ((A.x ** 2 + A.y ** 2) * (B.y - C.y) + (B.x ** 2 + B.y ** 2) * (C.y - A.y) + (C.x ** 2 + C.y ** 2) * (A.y - B.y)) / d;
        const uy = ((A.x ** 2 + A.y ** 2) * (C.x - B.x) + (B.x ** 2 + B.y ** 2) * (A.x - C.x) + (C.x ** 2 + C.y ** 2) * (B.x - A.x)) / d;
        const R = T.dist({ x: ux, y: uy }, A);
        $('circle', { cx: ux, cy: uy, r: R, fill: 'none', stroke: Pal.purple, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, g);
        $('line', { x1: ux, y1: uy, x2: A.x, y2: A.y, stroke: Pal.purple, 'stroke-width': 1.4 }, g);
        $('circle', { cx: ux, cy: uy, r: 3.5, fill: Pal.purple }, g);
        label(g, ux + 9, uy + 9, 'O', Pal.purple, 15);
        const mid = { x: (ux + A.x) / 2, y: (uy + A.y) / 2 };
        label(g, mid.x + 8, mid.y - 6, 'R', Pal.purple, 15);
      }
      if (mode === 'area') {
        const { A, B, C } = P;
        const u = norm(sub(C, B)); const k = (A.x - B.x) * u.x + (A.y - B.y) * u.y;
        const H = { x: B.x + u.x * k, y: B.y + u.y * k };
        $('line', { x1: B.x - u.x * 400, y1: B.y - u.y * 400, x2: C.x + u.x * 400, y2: C.y + u.y * 400, stroke: COL.a, 'stroke-width': 1, 'stroke-dasharray': '2 5', opacity: .5 }, g);
        $('line', { x1: A.x, y1: A.y, x2: H.x, y2: H.y, stroke: Pal.purple, 'stroke-width': 1.8, 'stroke-dasharray': '5 4' }, g);
        label(g, (A.x + H.x) / 2 + 10, (A.y + H.y) / 2, 'h_a', Pal.purple, 16, 'start');
        label(g, H.x, H.y + (A.y < H.y ? 12 : -12), 'H', Pal.purple, 15);
        // đường tròn nội tiếp
        const p = T.semiPerimeter(t.a, t.b, t.c), r = t.S / p;
        const I = { x: (t.a * A.x + t.b * B.x + t.c * C.x) / (t.a + t.b + t.c), y: (t.a * A.y + t.b * B.y + t.c * C.y) / (t.a + t.b + t.c) };
        $('circle', { cx: I.x, cy: I.y, r: r * UNIT, fill: 'rgba(245,158,11,.15)', stroke: Pal.amber, 'stroke-width': 1.5 }, g);
        label(g, I.x, I.y, 'r', Pal.amberTx, 15);
      }
      // 3 cạnh
      const sides = [['a', P.B, P.C, COL.a, P.A], ['b', P.A, P.C, COL.b, P.B], ['c', P.A, P.B, COL.c, P.C]];
      sides.forEach(([n, Q, R, col, opp]) => {
        $('line', { x1: Q.x, y1: Q.y, x2: R.x, y2: R.y, stroke: col, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
        const m = { x: (Q.x + R.x) / 2, y: (Q.y + R.y) / 2 };
        const o = norm(sub(m, opp));
        label(g, cx(m.x + o.x * 15), cy(m.y + o.y * 15), n, col, 18);
      });
      // góc
      [['A', P.A, P.B, P.C, COL.a, t.A], ['B', P.B, P.A, P.C, COL.b, t.B], ['C', P.C, P.A, P.B, COL.c, t.C]].forEach(([n, V, Q, R, col, ang]) => {
        if (Math.abs(ang - 90) < 0.8) $('path', { d: rightMark(V, Q, R, 13), fill: 'none', stroke: col, 'stroke-width': 2 }, g);
        else $('path', { d: arcPath(V, Q, R, 24), fill: col + '33', stroke: col, 'stroke-width': 2 }, g);
        const bis = norm({ x: norm(sub(Q, V)).x + norm(sub(R, V)).x, y: norm(sub(Q, V)).y + norm(sub(R, V)).y });
        label(g, cx(V.x + bis.x * 44), cy(V.y + bis.y * 44), Math.round(ang) + '°', col, 15);
        const o = norm(sub(V, cen));
        label(g, cx(V.x + o.x * 30), cy(V.y + o.y * 30), n, 'currentColor', 18);
        handles[n].setAttribute('cx', V.x); handles[n].setAttribute('cy', V.y);
        handles[n].setAttribute('aria-valuetext', 'Điểm ' + n + ' tại ' + Math.round(V.x) + ', ' + Math.round(V.y));
      });
      out.innerHTML = readout(t);
    }

    function readout(t) {
      const { a, b, c, A, B, C } = t;
      const cs = (x) => Math.cos(T.rad(x)), sn = (x) => Math.sin(T.rad(x));
      const kind = (x) => (Math.abs(x - 90) < 0.8 ? 'vuông' : x < 90 ? 'nhọn' : 'tù');
      const head = '<div class="row">' + K('\\sa=' + nt(a) + ',\\ \\sb=' + nt(b) + ',\\ \\sc=' + nt(c)) + '</div><div class="row">' + K('\\gA=' + nt(A, 1) + '^\\circ,\\ \\gB=' + nt(B, 1) + '^\\circ,\\ \\gC=' + nt(C, 1) + '^\\circ') + '</div>';
      if (mode === 'plain') {
        return head + '<div class="row">Cộng ba góc: ' + K(nt(A, 1) + '+' + nt(B, 1) + '+' + nt(C, 1) + '=180^\\circ') + ' ✓ (luôn luôn như vậy!)</div>';
      }
      if (mode === 'cosin') {
        const rows = [['a', 'b', 'c', 'A', A, '\\sa', '\\sb', '\\sc', '\\gA'], ['b', 'a', 'c', 'B', B, '\\sb', '\\sa', '\\sc', '\\gB'], ['c', 'a', 'b', 'C', C, '\\sc', '\\sa', '\\sb', '\\gC']];
        const val = { a, b, c };
        let h = head;
        rows.forEach(([x, y, z, G, ang, X, Y, Z, GG]) => {
          const lhs = val[x] ** 2, s = val[y] ** 2 + val[z] ** 2, m = 2 * val[y] * val[z] * cs(ang), rhs = s - m;
          h += '<div class="row">' + ok(near(lhs, rhs)) + ' ' + K(X + '^2=' + nt(lhs) + '\\ ;\\quad ' + Y + '^2+' + Z + '^2-2' + Y + Z + '\\cos ' + GG + '=' + nt(s) + '-' + nt(m) + '=' + nt(rhs)) + ' <small>(góc ' + G + ' ' + kind(ang) + (ang > 90.8 ? ' ⇒ cos âm ⇒ phần bị trừ thành phần cộng' : '') + ')</small></div>';
        });
        return h;
      }
      if (mode === 'sin') {
        const R = T.circumradius(a, b, c);
        const v = [a / sn(A), b / sn(B), c / sn(C), 2 * R];
        return head + '<div class="row"><span class="ib">' + K('\\dfrac{\\sa}{\\sin\\gA}=' + nt(v[0])) + '</span><span class="ib">' + K('\\dfrac{\\sb}{\\sin\\gB}=' + nt(v[1])) + '</span><span class="ib">' + K('\\dfrac{\\sc}{\\sin\\gC}=' + nt(v[2])) + '</span></div>' +
          '<div class="row">' + K('2R=2\\cdot' + nt(R) + '=' + nt(2 * R)) + ' ' + ok(near(v[0], v[1]) && near(v[1], v[2]) && near(v[2], v[3])) + ' <small>(ba tỉ số bằng nhau và bằng đường kính đường tròn ngoại tiếp)</small></div>';
      }
      // area
      const p = T.semiPerimeter(a, b, c), S = t.S, R = T.circumradius(a, b, c), r = S / p, ha = 2 * S / a;
      const items = [
        ['\\tfrac12\\,\\sb\\sc\\sin\\gA', 0.5 * b * c * sn(A)], ['\\tfrac12\\,\\sa\\sc\\sin\\gB', 0.5 * a * c * sn(B)], ['\\tfrac12\\,\\sa\\sb\\sin\\gC', 0.5 * a * b * sn(C)],
        ['\\dfrac{\\sa\\sb\\sc}{4R}\\ (R=' + nt(R) + ')', a * b * c / (4 * R)], ['p\\cdot r\\ (p=' + nt(p) + ',\\ r=' + nt(r) + ')', p * r],
        ['\\sqrt{p(p-\\sa)(p-\\sb)(p-\\sc)}', T.heron(a, b, c)], ['\\tfrac12\\,\\sa\\cdot h_a\\ (h_a=' + nt(ha) + ')', 0.5 * a * ha]
      ];
      return head + items.map((it) => '<div class="row">' + K('S=' + it[0] + '=' + nt(it[1])) + '</div>').join('') +
        '<div class="row">' + ok(items.every((it) => near(it[1], S))) + ' — cả 7 cách cho cùng một diện tích ' + K('S=' + nt(S)) + '</div>';
    }
    draw();
  }

  /* ============ 2. Hai cạnh cố định, xoay góc A (trực giác cosin) ============ */
  function cosRotateLab(box) {
    box.classList.add('lab');
    el('div', 'labtitle', 'Thí nghiệm: giữ nguyên hai cạnh b, c — xoay góc A và xem cạnh a thay đổi', box);
    const svg = $('svg', { viewBox: '0 0 400 250', role: 'img', 'aria-label': 'Hai cạnh AB và AC cố định, góc A thay đổi' }, box);
    const S = { b: 7, c: 5, A: 60 };
    const mk = (id, lab, min, max, step, key) => {
      const row = el('div', 'slider', '', box);
      el('label', '', lab, row).setAttribute('for', id);
      const inp = el('input', '', '', row); inp.type = 'range'; inp.id = id; inp.min = min; inp.max = max; inp.step = step; inp.value = S[key];
      const o = el('output', '', '', row);
      inp.addEventListener('input', () => { S[key] = +inp.value; draw(); });
      return o;
    };
    const ob = mk('sl-b', 'Cạnh AC = b', 2, 8, 0.5, 'b'), oc = mk('sl-c', 'Cạnh AB = c', 2, 8, 0.5, 'c'), oA = mk('sl-A', 'Góc A', 10, 170, 1, 'A');
    const out = el('div', 'readout', '', box);
    const g = $('g', {}, svg);
    function draw() {
      g.innerHTML = '';
      const s = 20, A = { x: 170, y: 215 };
      const C = { x: A.x + S.b * s, y: A.y };
      const al = T.rad(S.A);
      const B = { x: A.x + S.c * s * Math.cos(al), y: A.y - S.c * s * Math.sin(al) };
      $('line', { x1: B.x, y1: B.y, x2: C.x, y2: C.y, stroke: COL.a, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      $('line', { x1: A.x, y1: A.y, x2: C.x, y2: C.y, stroke: COL.b, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      $('line', { x1: A.x, y1: A.y, x2: B.x, y2: B.y, stroke: COL.c, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      if (Math.abs(S.A - 90) < 0.5) $('path', { d: rightMark(A, C, B, 14), fill: 'none', stroke: Pal.mark, 'stroke-width': 2 }, g);
      else $('path', { d: arcPath(A, C, B, 28), fill: COL.a + '33', stroke: COL.a, 'stroke-width': 2 }, g);
      label(g, A.x - 12, A.y + 12, 'A', 'currentColor', 18); label(g, B.x - 12 * Math.sign(Math.cos(al) || 1), B.y - 10, 'B', 'currentColor', 18); label(g, C.x + 14, C.y + 4, 'C', 'currentColor', 18);
      label(g, (A.x + C.x) / 2, A.y + 16, 'b', COL.b, 18);
      label(g, (A.x + B.x) / 2 - 12, (A.y + B.y) / 2 - 8, 'c', COL.c, 18);
      label(g, (B.x + C.x) / 2 + 12, (B.y + C.y) / 2 - 10, 'a ?', COL.a, 18);
      const r = T.sideFromCosine(S.b, S.c, S.A), pyth = Math.hypot(S.b, S.c), term = 2 * S.b * S.c * Math.cos(al);
      ob.textContent = nt0(S.b); oc.textContent = nt0(S.c); oA.textContent = S.A + '°';
      const msg = Math.abs(S.A - 90) < 0.5 ? '<b class="good">Góc A = 90° ⇒ cos A = 0 ⇒ phần bị trừ biến mất ⇒ đây chính là định lí Pytago!</b>'
        : S.A < 90 ? 'Góc A <b>nhỏ hơn 90°</b> ⇒ cos A dương ⇒ ta <b>trừ đi</b> một lượng ⇒ a <b>nhỏ hơn</b> ' + K('\\sqrt{b^2+c^2}=' + nt(pyth)) + ' (giá trị của a nếu góc A là 90°).'
          : 'Góc A <b>lớn hơn 90°</b> ⇒ cos A âm ⇒ trừ một số âm = <b>cộng thêm</b> ⇒ a <b>lớn hơn</b> ' + K('\\sqrt{b^2+c^2}=' + nt(pyth)) + ' (giá trị của a nếu góc A là 90°).';
      out.innerHTML = '<div class="row">' + K('\\sa^2=\\sb^2+\\sc^2-2\\sb\\sc\\cos\\gA=' + nt0(S.b ** 2) + '+' + nt0(S.c ** 2) + '-' + nt(term) + '=' + nt(r.square)) + '</div>' +
        '<div class="row">' + K('\\Rightarrow\\ \\sa=\\sqrt{' + nt(r.square) + '}\\approx' + nt(r.side)) + '</div><div class="row">' + msg + '</div>';
    }
    const nt0 = (x) => nt(x, x % 1 ? 2 : 0);
    draw();
  }

  /* ============ 3. Tam giác vuông tại A ============ */
  function rightLab(box) {
    box.classList.add('lab');
    el('div', 'labtitle', 'Tam giác ABC vuông tại A — chỉnh AB, AC rồi xem mọi hệ thức đều đúng', box);
    const svg = $('svg', { viewBox: '0 0 400 250', role: 'img', 'aria-label': 'Tam giác vuông tại A, đường cao AH, trung tuyến AM' }, box);
    const S = { AB: 3, AC: 4 };
    const mk = (id, lab, key) => {
      const row = el('div', 'slider', '', box);
      el('label', '', lab, row).setAttribute('for', id);
      const inp = el('input', '', '', row); inp.type = 'range'; inp.id = id; inp.min = 1; inp.max = 10; inp.step = 0.5; inp.value = S[key];
      const o = el('output', '', '', row);
      inp.addEventListener('input', () => { S[key] = +inp.value; draw(); });
      return o;
    };
    const o1 = mk('r-ab', 'Cạnh góc vuông AB', 'AB'), o2 = mk('r-ac', 'Cạnh góc vuông AC', 'AC');
    const out = el('div', 'readout', '', box);
    const g = $('g', {}, svg);
    function draw() {
      g.innerHTML = '';
      const t = T.rightTriangle(S.AB, S.AC);
      const sc = Math.min(330 / t.BC, 190 / t.AH);
      const B = { x: 35, y: 215 }, C = { x: 35 + t.BC * sc, y: 215 };
      const cb = t.AB / t.BC, sb = t.AC / t.BC;
      const A = { x: B.x + t.AB * sc * cb, y: B.y - t.AB * sc * sb };
      const H = { x: B.x + t.BH * sc, y: 215 }, M = { x: (B.x + C.x) / 2, y: 215 };
      $('polygon', { points: [A, B, C].map((p) => p.x + ',' + p.y).join(' '), fill: 'rgba(79,70,229,.07)', stroke: 'none' }, g);
      $('line', { x1: B.x, y1: B.y, x2: C.x, y2: C.y, stroke: COL.a, 'stroke-width': 4 }, g);
      $('line', { x1: A.x, y1: A.y, x2: C.x, y2: C.y, stroke: COL.b, 'stroke-width': 4 }, g);
      $('line', { x1: A.x, y1: A.y, x2: B.x, y2: B.y, stroke: COL.c, 'stroke-width': 4 }, g);
      $('line', { x1: A.x, y1: A.y, x2: H.x, y2: H.y, stroke: Pal.purple, 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, g);
      $('line', { x1: A.x, y1: A.y, x2: M.x, y2: M.y, stroke: Pal.amber, 'stroke-width': 2.5, 'stroke-dasharray': '2 4' }, g);
      $('path', { d: rightMark(A, B, C, 12), fill: 'none', stroke: Pal.mark, 'stroke-width': 2 }, g);
      $('path', { d: rightMark(H, A, C, 9), fill: 'none', stroke: Pal.purple, 'stroke-width': 1.6 }, g);
      label(g, A.x - 4, A.y - 14, 'A', 'currentColor', 18); label(g, B.x - 12, B.y + 6, 'B', 'currentColor', 18); label(g, C.x + 12, C.y + 6, 'C', 'currentColor', 18);
      label(g, H.x, H.y + 16, 'H', Pal.purple, 16); label(g, M.x, M.y + 16, 'M', Pal.amber, 16);
      label(g, (A.x + H.x) / 2 + 12, (A.y + H.y) / 2, 'AH', Pal.purple, 16);
      o1.textContent = nt(S.AB, 1).replace('{,}', ','); o2.textContent = nt(S.AC, 1).replace('{,}', ',');
      const r = t, f = (x) => nt(x);
      const row = (tex, good) => '<div class="row">' + ok(good) + ' ' + K(tex) + '</div>';
      out.innerHTML =
        '<div class="row">' + K('BC=\\sqrt{AB^2+AC^2}=\\sqrt{' + f(r.AB ** 2) + '+' + f(r.AC ** 2) + '}=' + f(r.BC)) + '</div>' +
        '<div class="row">' + K('AH=' + f(r.AH) + ',\\ BH=' + f(r.BH) + ',\\ CH=' + f(r.CH) + ',\\ AM=' + f(r.AM)) + '</div>' +
        row('\\dfrac1{AH^2}=' + f(1 / r.AH ** 2) + '\\ ;\\ \\dfrac1{AB^2}+\\dfrac1{AC^2}=' + f(1 / r.AB ** 2) + '+' + f(1 / r.AC ** 2) + '=' + f(1 / r.AB ** 2 + 1 / r.AC ** 2), near(1 / r.AH ** 2, 1 / r.AB ** 2 + 1 / r.AC ** 2)) +
        row('AH\\cdot BC=' + f(r.AH * r.BC) + '\\ ;\\ AB\\cdot AC=' + f(r.AB * r.AC), near(r.AH * r.BC, r.AB * r.AC)) +
        row('AH^2=' + f(r.AH ** 2) + '\\ ;\\ BH\\cdot CH=' + f(r.BH * r.CH), near(r.AH ** 2, r.BH * r.CH)) +
        row('AB^2=' + f(r.AB ** 2) + '\\ ;\\ BH\\cdot BC=' + f(r.BH * r.BC), near(r.AB ** 2, r.BH * r.BC)) +
        row('AC^2=' + f(r.AC ** 2) + '\\ ;\\ CH\\cdot CB=' + f(r.CH * r.BC), near(r.AC ** 2, r.CH * r.BC)) +
        row('AM=' + f(r.AM) + '\\ ;\\ \\tfrac12BC=' + f(r.BC / 2), near(r.AM, r.BC / 2)) +
        row('S=\\tfrac12AB\\cdot AC=' + f(r.S) + '\\ ;\\ \\tfrac12AH\\cdot BC=' + f(0.5 * r.AH * r.BC), near(r.S, 0.5 * r.AH * r.BC)) +
        row('BC^2=' + f(r.BC ** 2) + '\\ ;\\ AB^2+AC^2=' + f(r.AB ** 2 + r.AC ** 2), near(r.BC ** 2, r.AB ** 2 + r.AC ** 2));
    }
    draw();
  }

  /* ============ 4. Sin / cos là gì: điểm chạy trên nửa đường tròn ============ */
  function sincosLab(box) {
    box.classList.add('lab');
    el('div', 'labtitle', 'Sin và cos là gì? Kéo thanh trượt để quay góc α', box);
    const svg = $('svg', { viewBox: '0 0 400 230', role: 'img', 'aria-label': 'Nửa đường tròn bán kính 1, điểm P quay theo góc alpha' }, box);
    const row = el('div', 'slider', '', box);
    el('label', '', 'Góc α', row).setAttribute('for', 'sc-a');
    const inp = el('input', '', '', row); inp.type = 'range'; inp.id = 'sc-a'; inp.min = 0; inp.max = 180; inp.step = 1; inp.value = 40;
    const o = el('output', '', '', row);
    const out = el('div', 'readout', '', box);
    const g = $('g', {}, svg);
    function draw() {
      g.innerHTML = '';
      const al = +inp.value, r = 130, O = { x: 200, y: 195 };
      const P = { x: O.x + r * Math.cos(T.rad(al)), y: O.y - r * Math.sin(T.rad(al)) }, F = { x: P.x, y: O.y };
      $('path', { d: 'M' + (O.x - r) + ' ' + O.y + ' A' + r + ' ' + r + ' 0 0 1 ' + (O.x + r) + ' ' + O.y, fill: 'none', stroke: Pal.grey, 'stroke-width': 1.6 }, g);
      $('line', { x1: O.x - r - 15, y1: O.y, x2: O.x + r + 15, y2: O.y, stroke: Pal.grey, 'stroke-width': 1 }, g);
      // điểm "ma" ở góc 180° − α: cùng chiều cao (cùng sin) nhưng cos ngược dấu
      const Q = { x: O.x - r * Math.cos(T.rad(al)), y: P.y };
      if (Math.abs(al - 90) > 1 && al > 1 && al < 179) {
        $('line', { x1: P.x, y1: P.y, x2: Q.x, y2: Q.y, stroke: Pal.grey, 'stroke-width': 1.4, 'stroke-dasharray': '4 4' }, g);
        $('line', { x1: O.x, y1: O.y, x2: Q.x, y2: Q.y, stroke: Pal.grey, 'stroke-width': 1.6, 'stroke-dasharray': '4 4' }, g);
        $('circle', { cx: Q.x, cy: Q.y, r: 5, fill: 'none', stroke: Pal.grey, 'stroke-width': 2 }, g);
        label(g, Q.x + (Q.x >= O.x ? 6 : -6), Q.y - 14, '180°−α', Pal.mute, 14, Q.x >= O.x ? 'start' : 'end');
      }
      $('line', { x1: O.x, y1: O.y, x2: P.x, y2: P.y, stroke: Pal.indigo, 'stroke-width': 3.5 }, g);
      $('line', { x1: O.x, y1: O.y, x2: F.x, y2: F.y, stroke: COL.b, 'stroke-width': 4 }, g);
      $('line', { x1: F.x, y1: F.y, x2: P.x, y2: P.y, stroke: COL.a, 'stroke-width': 4 }, g);
      $('circle', { cx: P.x, cy: P.y, r: 6, fill: Pal.indigo }, g);
      if (al > 3 && al < 177) $('path', { d: 'M' + (O.x + 26) + ' ' + O.y + ' A26 26 0 0 0 ' + (O.x + 26 * Math.cos(T.rad(al))) + ' ' + (O.y - 26 * Math.sin(T.rad(al))), fill: 'none', stroke: Pal.indigo, 'stroke-width': 2 }, g);
      label(g, O.x + 40 * Math.cos(T.rad(al / 2)) + 4, O.y - 40 * Math.sin(T.rad(al / 2)) + 2, 'α', Pal.indigo, 17);
      label(g, (O.x + F.x) / 2, O.y + 14, 'cos α', COL.b, 16);
      label(g, F.x + (P.x >= O.x ? 24 : -24), (O.y + P.y) / 2, 'sin α', COL.a, 16);
      const c = Math.cos(T.rad(al)), s = Math.sin(T.rad(al));
      o.textContent = al + '°';
      const sign = al < 89.5 ? '<b class="good">α nhọn ⇒ cos dương</b>' : al > 90.5 ? '<b class="bad">α tù ⇒ cos ÂM</b> (đầu mút P đã sang bên trái)' : '<b>α = 90° ⇒ cos = 0</b>';
      out.innerHTML = '<div class="row">' + K('\\sin\\alpha=' + nt(s, 3) + '\\qquad \\cos\\alpha=' + nt(c, 3)) + '</div><div class="row">' + sign + '</div>' +
        '<div class="row"><small>Đường tròn có bán kính 1 nên "cạnh huyền = 1": cos = cạnh kề (đoạn xanh), sin = cạnh đối (đoạn đỏ). sin luôn ≥ 0 với góc từ 0° đến 180°.</small></div>' +
        '<div class="row"><small>Điểm mờ ở góc ' + K('180^\\circ-\\alpha') + ' nằm cùng độ cao với P: <b>cùng sin, nhưng cos ngược dấu</b>. Đó là lí do tìm góc bằng sin dễ ra hai đáp án (nhọn và tù).</small></div>';
    }
    inp.addEventListener('input', draw); draw();
  }

  /* ============ 5. Tên gọi: góc hoa - cạnh thường ============ */
  function namingLab(box) {
    box.classList.add('lab');
    el('div', 'labtitle', 'Bấm nút Góc A, B, C bên dưới để thấy cạnh đối diện của góc đó', box);
    const svg = $('svg', { viewBox: '0 0 400 240', role: 'img', 'aria-label': 'Tam giác ABC, góc và cạnh đối diện' }, box);
    const pick = el('div', 'presets', '', box);
    const out = el('div', 'readout', '', box);
    const A = { x: 150, y: 40 }, B = { x: 50, y: 195 }, C = { x: 350, y: 195 };
    const g = $('g', {}, svg);
    let sel = 'A';
    function draw() {
      g.innerHTML = '';
      const D = { A: [A, B, C, 'a', 'BC', COL.a], B: [B, A, C, 'b', 'AC', COL.b], C: [C, A, B, 'c', 'AB', COL.c] };
      const sides = { a: [B, C, COL.a], b: [A, C, COL.b], c: [A, B, COL.c] };
      Object.keys(sides).forEach((k) => {
        const [Q, R, col] = sides[k];
        const isSel = D[sel][3] === k;
        $('line', { x1: Q.x, y1: Q.y, x2: R.x, y2: R.y, stroke: isSel ? col : Pal.grey, 'stroke-width': isSel ? 6 : 3, 'stroke-linecap': 'round' }, g);
        const m = { x: (Q.x + R.x) / 2, y: (Q.y + R.y) / 2 }, o = norm(sub(m, { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 }));
        label(g, m.x + o.x * 16, m.y + o.y * 16, k, isSel ? col : Pal.mute, isSel ? 22 : 18);
      });
      const [V, Q, R, small, big, col] = D[sel];
      $('path', { d: arcPath(V, Q, R, 26), fill: col + '44', stroke: col, 'stroke-width': 2.5 }, g);
      [['A', A], ['B', B], ['C', C]].forEach(([n, p]) => {
        const o = norm(sub(p, { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 }));
        label(g, p.x + o.x * 20, p.y + o.y * 20, n, n === sel ? col : 'currentColor', n === sel ? 24 : 18);
      });
      out.innerHTML = '<div class="row">Góc <b style="color:' + col + '">' + sel + '</b> đối diện cạnh <b style="color:' + col + '">' + small + ' = ' + big + '</b> (cạnh <b>không chứa</b> chữ ' + sel + '). Quy ước: <b>chữ hoa</b> là góc/đỉnh, <b>chữ thường</b> cùng tên là cạnh đối diện nó.</div>';
      pick.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.k === sel));
    }
    ['A', 'B', 'C'].forEach((k) => {
      const b = el('button', 'chip', 'Góc ' + k, pick); b.type = 'button'; b.dataset.k = k;
      b.addEventListener('click', () => { sel = k; draw(); });
    });
    draw();
  }

  /* ============ 6. Hình tĩnh cho Ví dụ 4: AB = 5, AC = 8, góc A = 45° ============ */
  function exampleFigure(box) {
    box.classList.add('lab');
    el('div', 'labtitle', 'Hình cho Ví dụ 4: AB = 5, AC = 8, góc A = 45° (cạnh BC cần tìm)', box);
    const svg = $('svg', { viewBox: '0 0 400 230', role: 'img', 'aria-label': 'Tam giác ABC với AB bằng 5, AC bằng 8, góc A bằng 45 độ' }, box);
    const s = 24, A = { x: 90, y: 205 };
    const B = { x: A.x + 5 * s, y: A.y }, C = { x: A.x + 8 * s * Math.cos(T.rad(45)), y: A.y - 8 * s * Math.sin(T.rad(45)) };
    $('line', { x1: B.x, y1: B.y, x2: C.x, y2: C.y, stroke: COL.a, 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
    $('line', { x1: A.x, y1: A.y, x2: C.x, y2: C.y, stroke: COL.b, 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
    $('line', { x1: A.x, y1: A.y, x2: B.x, y2: B.y, stroke: COL.c, 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
    $('path', { d: arcPath(A, B, C, 34), fill: COL.a + '33', stroke: COL.a, 'stroke-width': 2 }, svg);
    label(svg, A.x - 14, A.y + 4, 'A', 'currentColor', 18); label(svg, B.x + 14, B.y + 4, 'B', 'currentColor', 18); label(svg, C.x + 12, C.y - 10, 'C', 'currentColor', 18);
    label(svg, (A.x + B.x) / 2, A.y + 18, 'c = 5', COL.c, 17);
    label(svg, (A.x + C.x) / 2 - 30, (A.y + C.y) / 2, 'b = 8', COL.b, 17);
    label(svg, (B.x + C.x) / 2 + 36, (B.y + C.y) / 2, 'a = ?', COL.a, 17);
    label(svg, A.x + 58, A.y - 12, '45°', COL.a, 15);
  }

  window.Labs = { triLab, cosRotateLab, rightLab, sincosLab, namingLab, exampleFigure };
})();
