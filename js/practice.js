/* Máy tính từng bước, ví dụ giải mẫu, bộ chọn công thức, trắc nghiệm, thẻ ghi nhớ */
(function () {
  const { K, rich, nt, ni, tx } = window.UI;
  const T = window.TM;
  const el = (tag, cls, html, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined && html !== '') e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const cs = (d) => Math.cos(T.rad(d)), sn = (d) => Math.sin(T.rad(d));

  /* ---------- máy tính từng bước ---------- */
  function calcBox(box, cfg) {
    box.classList.add('calc');
    el('b', '', cfg.title, box);
    const f = el('div', 'fields', '', box);
    const inputs = {};
    cfg.fields.forEach((fd) => {
      const lab = el('label', '', fd.label, f);
      const i = el('input', '', '', lab); i.type = 'number'; i.step = 'any'; i.inputMode = 'decimal'; i.value = fd.def; i.id = cfg.id + '-' + fd.id;
      inputs[fd.id] = i; i.addEventListener('input', run);
    });
    const ol = el('ol', 'steps', '', box);
    const note = el('div', '', '', box);
    function run() {
      const v = {};
      for (const k in inputs) v[k] = parseFloat(inputs[k].value.replace(',', '.'));
      ol.innerHTML = ''; note.innerHTML = '';
      if (Object.values(v).some((x) => !isFinite(x))) { note.innerHTML = '<div class="box warn">Hãy nhập đủ các số.</div>'; return; }
      const r = cfg.solve(v);
      if (r.err) { note.innerHTML = '<div class="box warn"><b>Chưa tính được</b>' + rich(r.err) + '</div>'; return; }
      r.steps.forEach((s) => el('li', '', rich(s), ol));
    }
    run();
  }

  const calcs = {
    cosSide: () => ({
      id: 'cs', title: 'Máy tính 1 — Biết 2 cạnh và góc xen giữa → tìm cạnh còn lại (định lí cosin)',
      fields: [{ id: 'b', label: 'Cạnh AC = b', def: 8 }, { id: 'c', label: 'Cạnh AB = c', def: 5 }, { id: 'A', label: 'Góc A (độ)', def: 45 }],
      solve: (v) => {
        if (v.b <= 0 || v.c <= 0) return { err: ' Độ dài cạnh phải lớn hơn 0.' };
        if (v.A <= 0 || v.A >= 180) return { err: ' Góc trong tam giác phải nằm giữa 0° và 180°.' };
        const r = T.sideFromCosine(v.b, v.c, v.A), m = 2 * v.b * v.c * cs(v.A);
        return { steps: [
          'Công thức: $BC^2=AB^2+AC^2-2\\cdot AB\\cdot AC\\cdot\\cos A$ (góc A nằm giữa hai cạnh AB, AC).',
          'Thay số: $BC^2=' + ni(v.c, 2) + '^2+' + ni(v.b, 2) + '^2-2\\cdot' + ni(v.c, 2) + '\\cdot' + ni(v.b, 2) + '\\cdot\\cos ' + ni(v.A, 1) + '^\\circ$',
          'Tính từng phần: $' + ni(v.c ** 2) + '+' + ni(v.b ** 2) + '-' + ni(m) + '=' + ni(r.square) + '$ (nhớ bấm máy ở chế độ <b>độ</b>).',
          'Lấy căn bậc hai: $BC=\\sqrt{' + ni(r.square) + '}\\approx' + nt(r.side) + '$ ✅'] };
      }
    }),
    cosAngle: () => ({
      id: 'ca', title: 'Máy tính 2 — Biết 3 cạnh → tìm góc (hệ quả của định lí cosin)',
      fields: [{ id: 'a', label: 'Cạnh a = BC', def: 7 }, { id: 'b', label: 'Cạnh b = AC', def: 8 }, { id: 'c', label: 'Cạnh c = AB', def: 9 }],
      solve: (v) => {
        if (v.a <= 0 || v.b <= 0 || v.c <= 0) return { err: ' Độ dài cạnh phải lớn hơn 0.' };
        if (!T.isTriangle(v.a, v.b, v.c)) return { err: ' Ba số này <b>không tạo thành tam giác</b>: tổng hai cạnh bé phải lớn hơn cạnh lớn nhất.' };
        const A = T.angleFromSides(v.a, v.b, v.c), B = T.angleFromSides(v.b, v.a, v.c), C = T.angleFromSides(v.c, v.a, v.b);
        const kind = (x) => (Math.abs(x - 90) < 0.005 ? 'vuông' : x < 90 ? 'nhọn' : 'tù');
        return { steps: [
          'Công thức: $\\cos A=\\dfrac{AB^2+AC^2-BC^2}{2\\cdot AB\\cdot AC}$ (cạnh đối của A, tức BC, đứng <b>sau</b> dấu trừ).',
          'Góc A: $\\cos A=\\dfrac{' + ni(v.c ** 2) + '+' + ni(v.b ** 2) + '-' + ni(v.a ** 2) + '}{2\\cdot' + ni(v.c, 2) + '\\cdot' + ni(v.b, 2) + '}=' + nt(A.cos, 4) + '\\Rightarrow A\\approx' + nt(A.deg, 2) + '^\\circ$ (góc ' + kind(A.deg) + ')',
          'Góc B: $\\cos B=\\dfrac{' + ni(v.c ** 2) + '+' + ni(v.a ** 2) + '-' + ni(v.b ** 2) + '}{2\\cdot' + ni(v.c, 2) + '\\cdot' + ni(v.a, 2) + '}=' + nt(B.cos, 4) + '\\Rightarrow B\\approx' + nt(B.deg, 2) + '^\\circ$ (góc ' + kind(B.deg) + ')',
          'Góc C: $\\cos C=\\dfrac{' + ni(v.b ** 2) + '+' + ni(v.a ** 2) + '-' + ni(v.c ** 2) + '}{2\\cdot' + ni(v.b, 2) + '\\cdot' + ni(v.a, 2) + '}=' + nt(C.cos, 4) + '\\Rightarrow C\\approx' + nt(C.deg, 2) + '^\\circ$ (góc ' + kind(C.deg) + ')',
          'Kiểm tra: $' + ni(A.deg) + '+' + ni(B.deg) + '+' + ni(C.deg) + '=' + nt(A.deg + B.deg + C.deg, 0) + '^\\circ$ ✅ <br><small>Cách bấm máy: nhấn SHIFT rồi cos (ra $\\cos^{-1}$), nhập phân số, bấm =.</small>'] };
      }
    }),
    sinRule: () => ({
      id: 'sr', title: 'Máy tính 3 — Biết cạnh a, góc A và góc B → tìm b, c, R (định lí sin)',
      fields: [{ id: 'a', label: 'Cạnh a = BC', def: 10 }, { id: 'A', label: 'Góc A (độ)', def: 60 }, { id: 'B', label: 'Góc B (độ)', def: 45 }],
      solve: (v) => {
        if (v.a <= 0) return { err: ' Độ dài cạnh phải lớn hơn 0.' };
        if (v.A <= 0 || v.B <= 0 || v.A + v.B >= 180) return { err: ' Hai góc A, B phải dương và có tổng nhỏ hơn 180°.' };
        const C = 180 - v.A - v.B, k = v.a / sn(v.A), b = k * sn(v.B), c = k * sn(C);
        return { steps: [
          'Góc thứ ba: $C=180^\\circ-A-B=180^\\circ-' + ni(v.A, 1) + '^\\circ-' + ni(v.B, 1) + '^\\circ=' + ni(C, 1) + '^\\circ$',
          'Định lí sin: $\\dfrac{a}{\\sin A}=\\dfrac{b}{\\sin B}=\\dfrac{c}{\\sin C}=2R$. Tỉ số đã biết: $\\dfrac{a}{\\sin A}=\\dfrac{' + ni(v.a, 2) + '}{\\sin ' + ni(v.A, 1) + '^\\circ}\\approx' + nt(k, 3) + '$',
          'Tìm b: $b=\\dfrac{a\\cdot\\sin B}{\\sin A}\\approx' + nt(k, 3) + '\\cdot\\sin ' + ni(v.B, 1) + '^\\circ\\approx' + nt(b) + '$',
          'Tìm c: $c\\approx' + nt(k, 3) + '\\cdot\\sin ' + ni(C, 1) + '^\\circ\\approx' + nt(c) + '$',
          'Bán kính đường tròn ngoại tiếp: $2R\\approx' + nt(k, 3) + '\\Rightarrow R\\approx' + nt(k / 2) + '$ ✅'] };
      }
    }),
    heron: () => ({
      id: 'he', title: 'Máy tính 4 — Biết 3 cạnh → diện tích S, R, r, đường cao (Heron)',
      fields: [{ id: 'a', label: 'Cạnh a', def: 13 }, { id: 'b', label: 'Cạnh b', def: 14 }, { id: 'c', label: 'Cạnh c', def: 15 }],
      solve: (v) => {
        if (v.a <= 0 || v.b <= 0 || v.c <= 0) return { err: ' Độ dài cạnh phải lớn hơn 0.' };
        if (!T.isTriangle(v.a, v.b, v.c)) return { err: ' Ba số này <b>không tạo thành tam giác</b>.' };
        const p = T.semiPerimeter(v.a, v.b, v.c), S = T.heron(v.a, v.b, v.c), R = T.circumradius(v.a, v.b, v.c), r = T.inradius(v.a, v.b, v.c);
        if (!isFinite(S) || !isFinite(R) || !(S > 0)) return { err: ' Số quá lớn hoặc quá nhỏ, máy không tính được. Hãy nhập các số vừa phải hơn.' };
        const eqs = (x) => (Math.abs(x - parseFloat(x.toFixed(2))) < 1e-9 ? '=' : '\\approx'); // '=' nếu đúng, '≈' nếu đã làm tròn
        return { steps: [
          'Nửa chu vi (chỉ <b>một nửa</b> chu vi!): $p=\\dfrac{a+b+c}{2}=\\dfrac{' + ni(v.a, 2) + '+' + ni(v.b, 2) + '+' + ni(v.c, 2) + '}{2}=' + ni(p) + '$',
          'Ba hiệu số: $p-a=' + ni(p - v.a) + ',\\ p-b=' + ni(p - v.b) + ',\\ p-c=' + ni(p - v.c) + '$',
          'Heron: $S=\\sqrt{p(p-a)(p-b)(p-c)}=\\sqrt{' + ni(p) + '\\cdot' + ni(p - v.a) + '\\cdot' + ni(p - v.b) + '\\cdot' + ni(p - v.c) + '}=' + ni(S) + '$',
          'Bán kính ngoại tiếp: $R=\\dfrac{abc}{4S}=\\dfrac{' + ni(v.a * v.b * v.c) + '}{4\\cdot' + ni(S) + '}' + eqs(R) + ni(R) + '$',
          'Bán kính nội tiếp: $r=\\dfrac{S}{p}=\\dfrac{' + ni(S) + '}{' + ni(p) + '}' + eqs(r) + ni(r) + '$',
          'Đường cao xuống cạnh a: từ $S=\\tfrac12 a\\cdot h_a$ suy ra $h_a=\\dfrac{2S}{a}=\\dfrac{2\\cdot' + ni(S) + '}{' + ni(v.a, 2) + '}' + eqs(2 * S / v.a) + ni(2 * S / v.a) + '$ ✅'] };
      }
    })
  };

  /* ---------- ví dụ giải mẫu (bấm "Bước tiếp theo") ---------- */
  function exampleBox(box, ex) {
    const h = el('div', '', '<b>' + ex.title + '</b>', box);
    el('div', 'rich', ex.problem, box);
    const ol = el('ol', 'steps', '', box);
    ex.steps.forEach((s, i) => { const li = el('li', i ? 'hidden' : '', rich(s), ol); });
    const ctl = el('div', 'presets', '', box);
    const next = el('button', 'chip on', 'Bước tiếp theo ▶', ctl); next.type = 'button';
    const all = el('button', 'chip', 'Hiện hết', ctl); all.type = 'button';
    const reset = el('button', 'chip', 'Làm lại', ctl); reset.type = 'button';
    const lis = () => [...ol.children];
    const upd = () => { const hid = lis().filter((l) => l.classList.contains('hidden')).length; next.disabled = all.disabled = hid === 0; next.style.opacity = hid ? 1 : .5; };
    next.addEventListener('click', () => { const l = lis().find((x) => x.classList.contains('hidden')); if (l) l.classList.remove('hidden'); upd(); });
    all.addEventListener('click', () => { lis().forEach((l) => l.classList.remove('hidden')); upd(); });
    reset.addEventListener('click', () => { lis().forEach((l, i) => l.classList.toggle('hidden', i > 0)); upd(); });
    upd();
  }

  function examples() {
    const out = [];
    // Khởi động: số nguyên, cos 60° = 1/2 nên tính nhẩm được
    out.push({
      title: 'Ví dụ khởi động: Tam giác ABC có AB = 3, AC = 8 và góc A = 60°. Tính BC.',
      problem: 'Đề cho hai cạnh AB = 3, AC = 8 và góc A = 60° nằm <b>giữa</b> hai cạnh đó. Cần tìm cạnh thứ ba BC. Số đẹp, tính nhẩm được!',
      steps: [
        '<b>Chọn công thức.</b> Hai cạnh + góc xen giữa ⇒ định lí cosin: $BC^2=AB^2+AC^2-2\\cdot AB\\cdot AC\\cdot\\cos A$.',
        '<b>Thay số.</b> $\\cos60^\\circ=\\tfrac12$ nên $BC^2=3^2+8^2-2\\cdot3\\cdot8\\cdot\\tfrac12$. Phần trừ: $2\\cdot3\\cdot8\\cdot\\tfrac12=24$. Vậy $BC^2=9+64-24=49$.',
        '<b>Lấy căn.</b> $BC=\\sqrt{49}=7$ ✅.'
      ]
    });
    // VD2: 3 cạnh 7 8 9
    const A2 = T.angleFromSides(7, 8, 9), B2 = T.angleFromSides(8, 7, 9), C2 = T.angleFromSides(9, 7, 8);
    out.push({
      title: 'Ví dụ 1: Tam giác có ba cạnh a = 7, b = 8, c = 9. Tính ba góc.',
      problem: 'Biết cả ba cạnh ⇒ tìm góc bằng <b>hệ quả của định lí cosin</b>. Nhớ: cạnh đối của góc cần tìm nằm ở <b>cuối tử số</b> và mang dấu <b>trừ</b> (ví dụ $b^2+c^2-a^2$ khi tìm góc A).',
      steps: [
        '<b>Góc A</b> (đối cạnh a = 7): $\\cos A=\\dfrac{b^2+c^2-a^2}{2bc}=\\dfrac{64+81-49}{2\\cdot8\\cdot9}=\\dfrac{96}{144}=' + nt(A2.cos, 4) + '\\Rightarrow A\\approx' + nt(A2.deg) + '^\\circ$',
        '<b>Góc B</b> (đối cạnh b = 8): $\\cos B=\\dfrac{a^2+c^2-b^2}{2ac}=\\dfrac{49+81-64}{2\\cdot7\\cdot9}=\\dfrac{66}{126}=' + nt(B2.cos, 4) + '\\Rightarrow B\\approx' + nt(B2.deg) + '^\\circ$',
        '<b>Góc C</b> (đối cạnh c = 9): $\\cos C=\\dfrac{a^2+b^2-c^2}{2ab}=\\dfrac{49+64-81}{2\\cdot7\\cdot8}=\\dfrac{32}{112}=' + nt(C2.cos, 4) + '\\Rightarrow C\\approx' + nt(C2.deg) + '^\\circ$',
        '<b>Kiểm tra:</b> $' + nt(A2.deg) + '+' + nt(B2.deg) + '+' + nt(C2.deg) + '=' + nt(A2.deg + B2.deg + C2.deg, 0) + '^\\circ$ ✅. Cạnh lớn nhất (9) đối diện góc lớn nhất (C) ✅.'
      ]
    });
    // VD3: sin
    const k3 = 10 / sn(60), b3 = k3 * sn(45), c3 = k3 * sn(75);
    out.push({
      title: 'Ví dụ 2: Tam giác ABC có a = 10, góc A = 60°, góc B = 45°. Tính b, c và bán kính đường tròn ngoại tiếp R.',
      problem: 'Có một cạnh và <b>góc đối diện nó</b> (a và A) ⇒ dùng <b>định lí sin</b>.',
      steps: [
        '<b>Góc C:</b> $C=180^\\circ-60^\\circ-45^\\circ=75^\\circ$.',
        '<b>Tỉ số chung:</b> $\\dfrac{a}{\\sin A}=\\dfrac{10}{\\sin60^\\circ}\\approx' + nt(k3, 3) + '$. Đây cũng chính là $2R$ ⇒ $R\\approx' + nt(k3 / 2) + '$.',
        '<b>Cạnh b</b> (đối góc B): $b=\\dfrac{a\\sin B}{\\sin A}\\approx' + nt(k3, 3) + '\\cdot\\sin45^\\circ\\approx' + nt(b3) + '$.',
        '<b>Cạnh c</b> (đối góc C): $c\\approx' + nt(k3, 3) + '\\cdot\\sin75^\\circ\\approx' + nt(c3) + '$.',
        '<b>Kiểm tra:</b> cạnh lớn nhất c đối diện góc lớn nhất C = 75° ✅.'
      ]
    });
    // VD diện tích: S = 1/2 bc sinA (b=8, c=5, A=30° => S=10, h_c=4)
    out.push({
      title: 'Ví dụ 3: Tam giác ABC có AC = 8, AB = 5 và góc A = 30°. Tính diện tích S và đường cao hạ từ C xuống AB.',
      problem: 'Có hai cạnh AB, AC và góc A <b>xen giữa</b> chúng ⇒ dùng $S=\\tfrac12\\,bc\\sin A$.',
      steps: [
        '<b>Chọn công thức.</b> $S=\\tfrac12\\,b\\,c\\sin A$ với $b=AC=8$, $c=AB=5$.',
        '<b>Thay số.</b> $\\sin30^\\circ=\\tfrac12$ nên $S=\\tfrac12\\cdot8\\cdot5\\cdot\\tfrac12=\\tfrac12\\cdot40\\cdot\\tfrac12=10$.',
        '<b>Đường cao từ C xuống AB.</b> Lấy AB = 5 làm đáy: $S=\\tfrac12\\cdot AB\\cdot h_c\\Rightarrow 10=\\tfrac12\\cdot5\\cdot h_c\\Rightarrow h_c=\\dfrac{2\\cdot10}{5}=4$.',
        '<b>Kiểm tra.</b> Chiều cao cũng bằng $b\\sin A=8\\cdot\\tfrac12=4$ ✅ (khớp với kết quả trên).'
      ]
    });
    // VD1 từ vở: AB=5, AC=8, A=45°
    const v = T.solveSAS(8, 5, 45), a = v.a, a2 = v.aSquare;
    const sinB = 8 * sn(45) / a, B1 = T.deg(Math.asin(sinB));
    out.push({
      title: 'Ví dụ 4 (bài mẫu): Cho tam giác ABC có AB = 5, AC = 8 và góc A = 45°. Tính độ dài cạnh và độ lớn các góc còn lại.',
      problem: 'Đề cho: $c=AB=5$, $b=AC=8$, $\\hat A=45^\\circ$. Cần tìm: cạnh $a=BC$, góc $B$, góc $C$.',
      steps: [
        '<b>Bước 1 — Đọc đề, vẽ hình, chọn công thức.</b> Góc A = 45° nằm <b>giữa</b> hai cạnh đã biết AB = 5 và AC = 8, tức là "hai cạnh + góc xen giữa" ⇒ dùng <b>định lí cosin</b> để tìm cạnh thứ ba: $BC^2=AB^2+AC^2-2\\cdot AB\\cdot AC\\cdot\\cos A$.',
        '<b>Bước 2 — Thay số.</b> $BC^2=5^2+8^2-2\\cdot5\\cdot8\\cdot\\cos45^\\circ=25+64-80\\cdot\\dfrac{\\sqrt2}{2}=89-40\\sqrt2\\approx' + nt(a2) + '$',
        '<b>Bước 3 — Lấy căn.</b> $BC=\\sqrt{89-40\\sqrt2}\\approx' + nt(a) + '$ ✅ (cạnh thứ ba ≈ ' + tx(a) + ').',
        '<b>Bước 4 — Tìm góc B bằng hệ quả cosin.</b> $\\cos B=\\dfrac{AB^2+BC^2-AC^2}{2\\cdot AB\\cdot BC}=\\dfrac{25+' + nt(a2) + '-64}{2\\cdot5\\cdot' + nt(a) + '}=' + nt(v.cosB, 4) + '$. Máy tính: SHIFT cos ⇒ $B\\approx' + nt(v.B) + '^\\circ$. <b>cos âm nên B là góc tù</b> ✅',
        '<b>Bước 5 — Góc C.</b> Ba góc cộng lại bằng 180°: $C=180^\\circ-45^\\circ-' + nt(v.B) + '^\\circ\\approx' + nt(v.C) + '^\\circ$ ✅',
        '<b>Bước 6 — Kiểm tra (bằng định lí sin).</b> $\\dfrac{BC}{\\sin A}=\\dfrac{' + nt(a) + '}{\\sin45^\\circ}\\approx' + nt(a / sn(45)) + '$ và $\\dfrac{AB}{\\sin C}=\\dfrac{5}{\\sin ' + nt(v.C) + '^\\circ}\\approx' + nt(5 / sn(v.C)) + '$ — hai số bằng nhau ✅.',
        '<b>⚠️ Cái bẫy:</b> nếu tìm góc B bằng định lí sin: $\\sin B=\\dfrac{AC\\cdot\\sin A}{BC}\\approx' + nt(sinB, 4) + '$, máy tính (SHIFT sin) chỉ trả về $' + nt(B1, 1) + '^\\circ$ — <b>sai</b>, vì ở bước 4 ta đã biết B là góc tù (cos B âm), nên loại góc nhọn này; góc thật là $180^\\circ-' + nt(B1, 1) + '^\\circ=' + nt(180 - B1, 1) + '^\\circ$. Một giá trị sin ứng với <b>hai</b> góc (nhọn và tù). Còn cos thì mỗi giá trị chỉ ứng với một góc ⇒ <b>cần tìm góc, hãy dùng cosin</b>.',
        '<b>Đáp số:</b> $BC\\approx' + nt(a) + '$; $\\hat B\\approx' + nt(v.B) + '^\\circ$; $\\hat C\\approx' + nt(v.C) + '^\\circ$.'
      ]
    });
    // VD4: Heron
    out.push({
      title: 'Ví dụ 5: Tam giác có ba cạnh 13, 14, 15. Tính diện tích S, bán kính ngoại tiếp R, bán kính nội tiếp r.',
      problem: 'Biết cả ba cạnh ⇒ diện tích dùng <b>công thức Heron</b>.',
      steps: [
        '<b>Nửa chu vi:</b> $p=\\dfrac{13+14+15}{2}=21$.',
        '<b>Heron:</b> $S=\\sqrt{21\\cdot(21-13)\\cdot(21-14)\\cdot(21-15)}=\\sqrt{21\\cdot8\\cdot7\\cdot6}=\\sqrt{7056}=84$.',
        '<b>Bán kính ngoại tiếp:</b> từ $S=\\dfrac{abc}{4R}$ ⇒ $R=\\dfrac{abc}{4S}=\\dfrac{13\\cdot14\\cdot15}{4\\cdot84}=\\dfrac{2730}{336}=\\dfrac{65}{8}=8{,}125$.',
        '<b>Bán kính nội tiếp:</b> từ $S=p\\cdot r$ ⇒ $r=\\dfrac{S}{p}=\\dfrac{84}{21}=4$.',
        '<b>Thêm:</b> đường cao xuống cạnh 14: $S=\\tfrac12\\cdot14\\cdot h_b\\Rightarrow h_b=\\dfrac{2\\cdot84}{14}=12$.'
      ]
    });
    // VD5: nhận dạng
    const C5 = T.angleFromSides(8, 5, 6);
    out.push({
      title: 'Ví dụ 6 (nhanh): Tam giác có ba cạnh 5, 6, 8. Góc lớn nhất là góc nhọn, vuông hay tù?',
      problem: 'Đặt $a=5$, $b=6$, $c=8$ (c là cạnh lớn nhất, đối diện góc C). Góc lớn nhất đối diện cạnh lớn nhất (8). Chỉ cần xét <b>dấu</b> của $\\cos C$ — thậm chí chỉ cần dấu của tử số.',
      steps: [
        '$\\cos C=\\dfrac{a^2+b^2-c^2}{2ab}=\\dfrac{25+36-64}{2\\cdot5\\cdot6}=\\dfrac{-3}{60}=-0{,}05$.',
        '$\\cos C<0$ nên <b>C là góc tù</b>, $C\\approx' + nt(C5.deg) + '^\\circ$. Mẹo: so sánh $c^2=64$ với $a^2+b^2=61$: nếu $c^2>a^2+b^2$ thì tù; bằng thì vuông; nhỏ hơn thì nhọn.'
      ]
    });
    return out;
  }

  /* ---------- bộ chọn công thức ---------- */
  const HELP = [
    ['Biết 2 cạnh + góc xen giữa, cần cạnh thứ 3', 'Định lí cosin', '$a^2=b^2+c^2-2bc\\cos A$ (góc A nằm giữa b và c). Xem Ví dụ 4 (bài mẫu).', 'cosin'],
    ['Biết cả 3 cạnh, cần tìm góc', 'Hệ quả của định lí cosin', '$\\cos A=\\dfrac{b^2+c^2-a^2}{2bc}$ rồi bấm SHIFT cos.', 'cosin'],
    ['Biết 2 góc và 1 cạnh, cần cạnh còn lại', 'Định lí sin', 'Tính góc thứ ba $C=180^\\circ-A-B$, rồi $\\dfrac{a}{\\sin A}=\\dfrac{b}{\\sin B}=\\dfrac{c}{\\sin C}$. Xem Ví dụ 2.', 'sin'],
    ['Biết 2 cạnh + góc KHÔNG xen giữa (ví dụ a, b, A)', 'Cẩn thận: có thể có hai đáp án', 'Tìm góc B bằng sin sẽ ra hai khả năng (nhọn/tù). Cách chắc chắn: dùng cosin $a^2=b^2+c^2-2bc\\cos A$ để tìm c, rồi hệ quả cosin để tìm góc.', 'sin'],
    ['Biết 1 cạnh + góc đối diện nó + (một góc khác hoặc một cạnh khác)', 'Định lí sin', '$\\dfrac{a}{\\sin A}=\\dfrac{b}{\\sin B}=\\dfrac{c}{\\sin C}=2R$. Cần góc thì nhớ cái bẫy hai đáp án (nhọn/tù).', 'sin'],
    ['Biết 2 góc, cần góc thứ 3', 'Tổng ba góc = 180°', '$C=180^\\circ-A-B$. Không cần định lí nào cả!', 'bat-dau'],
    ['Biết bán kính đường tròn ngoại tiếp R', 'Định lí sin hoặc S = abc/4R', '$a=2R\\sin A$; hoặc $S=\\dfrac{abc}{4R}$.', 'dientich'],
    ['Biết 2 cạnh + góc xen giữa, cần diện tích', 'S = ½ · cạnh · cạnh · sin(góc xen giữa)', '$S=\\tfrac12bc\\sin A$.', 'dientich'],
    ['Biết 3 cạnh, cần diện tích', 'Công thức Heron', '$S=\\sqrt{p(p-a)(p-b)(p-c)}$, $p=\\dfrac{a+b+c}{2}$.', 'dientich'],
    ['Biết diện tích và nửa chu vi, cần bán kính nội tiếp r', 'S = p · r', '$r=\\dfrac{S}{p}$.', 'dientich'],
    ['Biết đường cao và cạnh đáy tương ứng', 'S = ½ · đáy · đường cao', '$S=\\tfrac12a\\,h_a$.', 'dientich'],
    ['Tam giác vuông, biết 2 cạnh góc vuông, cần đường cao AH', 'Hệ thức đường cao', '$AH\\cdot BC=AB\\cdot AC$ hoặc $\\dfrac1{AH^2}=\\dfrac1{AB^2}+\\dfrac1{AC^2}$.', 'vuong'],
    ['Tam giác vuông, cần đoạn BH hoặc CH', 'Hệ thức hình chiếu', '$AB^2=BH\\cdot BC$, $AC^2=CH\\cdot CB$.', 'vuong']
  ];
  function helper(box) {
    el('b', '', 'Đề cho gì → dùng công thức nào? (bấm vào tình huống giống đề của bạn)', box);
    const list = el('div', '', '', box);
    const res = el('div', 'box ok', 'Chọn một tình huống phía trên 👆', box); res.setAttribute('aria-live', 'polite');
    HELP.forEach((h, i) => {
      const b = el('button', 'chip', h[0], list); b.type = 'button';
      b.addEventListener('click', () => {
        list.querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on');
        res.innerHTML = '<b>' + h[1] + '</b>' + rich(h[2]) + ' <a href="#' + h[3] + '">→ xem phần này</a>';
      });
    });
  }

  /* ---------- trắc nghiệm ---------- */
  const QUIZ = [
    ['Trong tam giác ABC, cạnh $a$ là cạnh nào?', ['AB', 'BC', 'AC', 'AH'], 1, '$a$ đối diện góc A nên là cạnh <b>không chứa chữ A</b>: BC.'],
    ['Định lí cosin viết cho cạnh BC là:', ['$BC^2=AB^2+AC^2-2\\,AB\\cdot AC\\cos A$', '$BC^2=AB^2+AC^2+2\\,AB\\cdot AC\\cos A$', '$BC^2=AB^2-AC^2-2\\,AB\\cdot AC\\cos A$', '$BC^2=AB^2+AC^2-2\\,AB\\cdot AC\\sin A$'], 0, 'Mẹo: $BC^2$ không có A; vế phải là hai cạnh có A, trừ đi 2 lần tích hai cạnh đó nhân cos A.'],
    ['Nếu góc A = 90° thì định lí cosin trở thành:', ['Định lí sin', 'Định lí Pytago', 'Công thức Heron', 'Không có gì xảy ra'], 1, '$\\cos90^\\circ=0$ nên phần bị trừ biến mất: $BC^2=AB^2+AC^2$.'],
    ['AB = 3, AC = 4, góc A = 60°. Khi đó $BC^2$ bằng:', ['25', '13', '37', '7'], 1, '$9+16-2\\cdot3\\cdot4\\cdot\\tfrac12=25-12=13$.'],
    ['Hệ quả đúng của định lí cosin là:', ['$\\cos A=\\dfrac{a^2+b^2-c^2}{2bc}$', '$\\cos A=\\dfrac{b^2+c^2-a^2}{2bc}$', '$\\cos A=\\dfrac{b^2+c^2+a^2}{2bc}$', '$\\cos A=\\dfrac{b^2+c^2-a^2}{2a}$'], 1, 'Cạnh đối của A (là $a$) bị trừ; mẫu số là 2 lần tích hai cạnh có chữ A (hai cạnh đi ra từ A).'],
    ['Tam giác có ba cạnh 3, 4, 5. Góc đối diện cạnh 5 bằng:', ['30°', '60°', '90°', '120°'], 2, '$\\cos C=\\dfrac{9+16-25}{24}=0$ ⇒ C = 90°.'],
    ['Nếu $\\cos A<0$ thì góc A là:', ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Không xác định'], 2, 'cos âm ⇔ góc lớn hơn 90° (góc tù).'],
    ['Tam giác có $AB=AC=2$ và góc A = 120°. $BC^2=$', ['4', '8', '12', '16'], 2, '$4+4-2\\cdot2\\cdot2\\cdot(-\\tfrac12)=8+4=12$. cos âm nên "trừ" thành "cộng".'],
    ['Định lí sin phát biểu rằng $\\dfrac{a}{\\sin A}$ bằng:', ['$R$', '$2R$', '$\\dfrac R2$', '$4R$'], 1, 'Tỉ số này bằng đường kính đường tròn ngoại tiếp: $2R$.'],
    ['$a=6$, góc A = 30°. Bán kính đường tròn ngoại tiếp R bằng:', ['3', '6', '12', '$6\\sqrt3$'], 1, '$2R=\\dfrac{6}{\\sin30^\\circ}=12$ ⇒ $R=6$.'],
    ['Đẳng thức nào <b>sai</b>?', ['$\\dfrac{a}{\\sin A}=\\dfrac{b}{\\sin B}$', '$\\dfrac{b}{\\sin B}=\\dfrac{c}{\\sin C}$', '$\\dfrac{a}{\\sin B}=\\dfrac{b}{\\sin A}$', '$a\\sin B=b\\sin A$'], 2, 'Cạnh phải đi với <b>góc đối diện</b> của nó: a đi với A, b đi với B.'],
    ['$a=4$, A = 30°, B = 90°. Cạnh b bằng:', ['2', '4', '8', '$4\\sqrt3$'], 2, '$b=\\dfrac{a\\sin B}{\\sin A}=\\dfrac{4\\cdot1}{0{,}5}=8$.'],
    ['Biết $\\sin B=0{,}9933$. Góc B có thể bằng:', ['Chỉ 83,4°', 'Chỉ 96,6°', 'Hoặc 83,4° hoặc 96,6°', 'Chỉ 6,6°'], 2, 'Hai góc bù nhau ($B$ và $180^\\circ-B$) có cùng sin. Đề chỉ cho sin B nên cả hai góc đều có thể. Muốn chọn một góc, cần thêm dữ kiện: ví dụ đề cho B nhọn (hoặc B tù), hoặc phép thử $A+B<180^\\circ$ làm một khả năng bị loại. Cách chắc chắn là dùng cosin B (cos có dấu nên chỉ cho một góc).'],
    ['Tam giác vuông cân, $b=c=4$, A = 90°. Diện tích $S=\\tfrac12bc\\sin A$ bằng:', ['4', '8', '16', '$8\\sqrt2$'], 1, '$\\tfrac12\\cdot4\\cdot4\\cdot1=8$.'],
    ['Hai cạnh 5 và 6, góc xen giữa 30°. Diện tích bằng:', ['7,5', '15', '$15\\sqrt3$', '30'], 0, '$\\tfrac12\\cdot5\\cdot6\\cdot\\sin30^\\circ=15\\cdot0{,}5=7{,}5$.'],
    ['Tam giác có ba cạnh 6, 8, 10. Nửa chu vi $p$ bằng:', ['24', '12', '10', '8'], 1, '$p=\\dfrac{6+8+10}{2}=12$ — là <b>một nửa</b> chu vi.'],
    ['Tam giác 3-4-5, công thức Heron cho diện tích:', ['6', '12', '$\\sqrt{12}$', '30'], 0, '$p=6$: $\\sqrt{6\\cdot3\\cdot2\\cdot1}=\\sqrt{36}=6$.'],
    ['$S=p\\cdot r$. Nếu $p=10$ và $r=2$ thì $S$ bằng:', ['5', '12', '20', '40'], 2, '$S=10\\cdot2=20$.'],
    ['Tam giác 3-4-5 có $R=2{,}5$. Dùng $S=\\dfrac{abc}{4R}$ được:', ['3', '6', '12', '60'], 1, '$\\dfrac{3\\cdot4\\cdot5}{4\\cdot2{,}5}=\\dfrac{60}{10}=6$.'],
    ['Tam giác ABC vuông tại A, $AB=6$, $AC=8$. Đường cao $AH$ bằng:', ['4,8', '5', '6,4', '10'], 0, '$BC=10$; $AH\\cdot BC=AB\\cdot AC\\Rightarrow AH=\\dfrac{48}{10}=4{,}8$.'],
    ['Tam giác vuông tại A, $AB=6$, $BC=10$. Đoạn $BH$ (H là chân đường cao) bằng:', ['3,6', '4,8', '6,4', '3'], 0, '$AB^2=BH\\cdot BC\\Rightarrow BH=\\dfrac{36}{10}=3{,}6$.'],
    ['Tam giác ABC vuông tại A, $BC=10$, M là trung điểm BC. $AM$ bằng:', ['10', '5', '2,5', '$5\\sqrt2$'], 1, 'Trung tuyến ứng với cạnh huyền bằng một nửa cạnh huyền: $AM=\\tfrac12BC=5$.'],
    ['Tam giác vuông tại A có $AB=3$, $AC=4$. Giá trị $\\dfrac1{AH^2}$ bằng:', ['$\\dfrac{1}{12}$', '$\\dfrac{7}{12}$', '$\\dfrac{25}{144}$', '$\\dfrac{1}{25}$'], 2, '$\\dfrac19+\\dfrac1{16}=\\dfrac{25}{144}$.'],
    ['Tìm một <b>góc</b> khi biết ba cạnh thì nên dùng:', ['Định lí sin', 'Hệ quả của định lí cosin', 'Công thức Heron', 'Định lí Pytago'], 1, 'Cosin cho đúng một góc; sin có thể ra hai góc (nhọn/tù).']
  ];
  function quiz(box) {
    let right = 0, answered = 0;
    const score = el('div', 'score', '', box); score.setAttribute('aria-live', 'polite');
    const upd = () => { score.textContent = 'Điểm: ' + right + '/' + QUIZ.length + ' (đã làm ' + answered + ')'; };
    upd();
    QUIZ.forEach((q, qi) => {
      const d = el('div', 'q', '', box);
      el('div', 'qt', (qi + 1) + '. ' + rich(q[0]), d);
      const o = el('div', 'opts', '', d);
      const exp = el('div', 'exp', '', d);
      const order = q[1].map((t, i) => i);
      for (let k = order.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); const tmp = order[k]; order[k] = order[j]; order[j] = tmp; } // xáo trộn để đáp án không dồn một chỗ
      order.forEach((i, pos) => {
        const t = q[1][i];
        const b = el('button', '', rich(t), o); b.type = 'button'; b.dataset.i = i;
        b.addEventListener('click', () => {
          if (d.classList.contains('done')) return;
          d.classList.add('done'); answered++;
          [...o.children].forEach((x) => { x.disabled = true; if (+x.dataset.i === q[2]) x.classList.add('right'); });
          if (i === q[2]) { right++; exp.innerHTML = '✅ <b>Đúng!</b> ' + rich(q[3]); } else { b.classList.add('wrong'); exp.innerHTML = '❌ <b>Chưa đúng.</b> ' + rich(q[3]); }
          upd();
        });
      });
    });
    const again = el('button', 'btn sec', 'Làm lại từ đầu', box); again.type = 'button';
    again.addEventListener('click', () => { box.innerHTML = ''; quiz(box); box.scrollIntoView({ behavior: 'smooth' }); });
  }

  /* ---------- thẻ ghi nhớ ---------- */
  const CARDS = [
    ['Định lí cosin cho cạnh BC', '$BC^2=AB^2+AC^2-2\\,AB\\cdot AC\\cos A$<br><small>Mẹo: BC² không có A; vế phải gồm hai cạnh có A và cos A.</small>'],
    ['Định lí cosin cho cạnh AC (= b)', '$AC^2=BC^2+AB^2-2\\,BC\\cdot AB\\cos B$<br><small>AC không có B ⇒ vế phải là hai cạnh có B (BC, BA) và cos B.</small>'],
    ['Định lí cosin cho cạnh AB (= c)', '$AB^2=BC^2+AC^2-2\\,BC\\cdot AC\\cos C$<br><small>AB không có C ⇒ hai cạnh có C (CB, CA) và cos C.</small>'],
    ['Hệ quả: cos A = ?', '$\\cos A=\\dfrac{b^2+c^2-a^2}{2bc}$<br><small>Bình phương hai cạnh có chữ A cộng nhau, trừ bình phương cạnh đối; mẫu: 2 lần tích hai cạnh có chữ A.</small>'],
    ['Hệ quả: cos B = ?', '$\\cos B=\\dfrac{a^2+c^2-b^2}{2ac}$'],
    ['Hệ quả: cos C = ?', '$\\cos C=\\dfrac{a^2+b^2-c^2}{2ab}$'],
    ['Khi góc A = 90°, cosin thành gì?', 'Định lí Pytago: $a^2=b^2+c^2$ (vì $\\cos90^\\circ=0$).'],
    ['Định lí sin', '$\\dfrac{a}{\\sin A}=\\dfrac{b}{\\sin B}=\\dfrac{c}{\\sin C}=2R$<br><small>Cạnh luôn đi với sin của góc ĐỐI DIỆN nó.</small>'],
    ['Diện tích: hai cạnh và góc xen giữa', '$S=\\tfrac12bc\\sin A=\\tfrac12ac\\sin B=\\tfrac12ab\\sin C$'],
    ['Diện tích theo R', '$S=\\dfrac{abc}{4R}$'],
    ['Diện tích theo r', '$S=p\\cdot r$, với $p=\\dfrac{a+b+c}{2}$'],
    ['Công thức Heron', '$S=\\sqrt{p(p-a)(p-b)(p-c)}$, $p=\\dfrac{a+b+c}{2}$'],
    ['Diện tích theo đường cao', '$S=\\tfrac12a\\,h_a=\\tfrac12b\\,h_b=\\tfrac12c\\,h_c$'],
    ['Tam giác vuông tại A: hai hệ thức với hình chiếu', '$AB^2=BH\\cdot BC$ và $AC^2=CH\\cdot CB$<br><small>Cạnh góc vuông² = hình chiếu × cạnh huyền.</small>'],
    ['Tam giác vuông tại A: đường cao', '$AH^2=BH\\cdot CH$; $AH\\cdot BC=AB\\cdot AC$; $\\dfrac1{AH^2}=\\dfrac1{AB^2}+\\dfrac1{AC^2}$'],
    ['Tam giác vuông tại A: trung tuyến AM', '$AM=\\tfrac12BC$ (trung tuyến ứng cạnh huyền bằng nửa cạnh huyền).']
  ];
  function flashcards(box) {
    let i = 0, flipped = false;
    const wrap = el('div', 'flash', '', box);
    const card = el('button', 'card', '', wrap); card.type = 'button'; card.setAttribute('aria-label', 'Thẻ ghi nhớ, bấm để lật');
    const front = el('div', 'face front', '', card), back = el('div', 'face back', '', card);
    const ctl = el('div', 'ctl', '', wrap);
    const prev = el('button', 'chip', '◀ Trước', ctl), cnt = el('span', '', '', ctl), nxt = el('button', 'chip', 'Sau ▶', ctl);
    prev.type = nxt.type = 'button';
    const show = () => {
      flipped = false; card.classList.remove('flip');
      front.innerHTML = '<div><b>' + rich(CARDS[i][0]) + '</b><br><small>(bấm vào thẻ để xem đáp án)</small></div>';
      back.innerHTML = '<div>' + rich(CARDS[i][1]) + '</div>';
      cnt.textContent = (i + 1) + ' / ' + CARDS.length;
    };
    card.addEventListener('click', () => { flipped = !flipped; card.classList.toggle('flip', flipped); });
    prev.addEventListener('click', () => { i = (i + CARDS.length - 1) % CARDS.length; show(); });
    nxt.addEventListener('click', () => { i = (i + 1) % CARDS.length; show(); });
    show();
  }

  window.Practice = { calcBox, calcs, exampleBox, examples, helper, quiz, flashcards, QUIZ };
})();
