/* Toán thuần (không đụng DOM) — chạy được cả trong trình duyệt lẫn node để kiểm thử. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TM = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const rad = (d) => (d * Math.PI) / 180;
  const deg = (r) => (r * 180) / Math.PI;
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  const dist = (P, Q) => Math.hypot(P.x - Q.x, P.y - Q.y);

  /* Định lí cosin: cạnh đối góc A khi biết hai cạnh kề b, c và góc A (độ) */
  function sideFromCosine(b, c, Adeg) {
    const sq = b * b + c * c - 2 * b * c * Math.cos(rad(Adeg));
    return { square: sq, side: Math.sqrt(Math.max(0, sq)) };
  }
  /* Hệ quả: góc đối cạnh a khi biết ba cạnh (độ). Kẹp [-1,1] chống sai số. */
  function angleFromSides(a, b, c) {
    const cosv = (b * b + c * c - a * a) / (2 * b * c);
    return { cos: cosv, deg: deg(Math.acos(clamp(cosv, -1, 1))) };
  }
  const isTriangle = (a, b, c) => a > 0 && b > 0 && c > 0 && a + b > c && a + c > b && b + c > a;
  const semiPerimeter = (a, b, c) => (a + b + c) / 2;
  function heron(a, b, c) {
    const p = semiPerimeter(a, b, c);
    return Math.sqrt(Math.max(0, p * (p - a) * (p - b) * (p - c)));
  }
  const circumradius = (a, b, c) => (a * b * c) / (4 * heron(a, b, c));
  const inradius = (a, b, c) => heron(a, b, c) / semiPerimeter(a, b, c);

  /* Tam giác từ 3 điểm (toạ độ pixel) -> số đo theo "đơn vị" = pixel / unit */
  function triFromPoints(A, B, C, unit) {
    unit = unit || 1;
    const a = dist(B, C) / unit, b = dist(A, C) / unit, c = dist(A, B) / unit;
    const cross = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
    const S = Math.abs(cross) / 2 / (unit * unit);
    const ok = isTriangle(a, b, c) && S > 0.12;
    const angA = angleFromSides(a, b, c).deg, angB = angleFromSides(b, a, c).deg;
    return { a, b, c, S, ok, A: angA, B: angB, C: 180 - angA - angB };
  }

  /* Tam giác vuông tại A: biết AB, AC -> các đoạn còn lại */
  function rightTriangle(AB, AC) {
    const BC = Math.hypot(AB, AC);
    const AH = (AB * AC) / BC;
    const BH = (AB * AB) / BC;
    const CH = (AC * AC) / BC;
    return { AB, AC, BC, AH, BH, CH, AM: BC / 2, S: (AB * AC) / 2 };
  }

  /* Giải đầy đủ ví dụ: biết b, c, góc A */
  function solveSAS(b, c, Adeg) {
    const { square, side: a } = sideFromCosine(b, c, Adeg);
    const B = angleFromSides(b, a, c); // góc đối b
    const Cg = 180 - Adeg - B.deg;
    return { a, aSquare: square, B: B.deg, cosB: B.cos, C: Cg };
  }

  /* Giá trị định dạng kiểu Việt Nam: dấu phẩy thập phân */
  function fmt(x, d) {
    d = d === undefined ? 2 : d;
    if (!isFinite(x)) return '—';
    let s = (Math.abs(x) < Math.pow(10, -d) / 2 ? 0 : x).toFixed(d);
    return s.replace('.', ',');
  }

  return { rad, deg, clamp, dist, sideFromCosine, angleFromSides, isTriangle, semiPerimeter,
    heron, circumradius, inradius, triFromPoints, rightTriangle, solveSAS, fmt };
});
