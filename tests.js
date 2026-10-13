// Chạy: node tests.js   (kiểm tra toàn bộ phần toán của trang web)
const T = require('./js/math.js');
let fail = 0;
const eq = (name, got, want, tol = 1e-6) => {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) fail++;
  console.log((ok ? 'OK   ' : 'FAIL ') + name + ' got=' + got + ' want=' + want);
};
eq('Heron 3-4-5', T.heron(3, 4, 5), 6);
eq('Heron 13-14-15', T.heron(13, 14, 15), 84);
eq('R 13-14-15', T.circumradius(13, 14, 15), 65 / 8);
eq('r 13-14-15', T.inradius(13, 14, 15), 4);
const v = T.solveSAS(8, 5, 45); // b=AC=8, c=AB=5
eq('VD1 BC^2 = 89-40√2', v.aSquare, 89 - 40 * Math.SQRT2);
eq('VD1 BC', v.a, Math.sqrt(89 - 40 * Math.SQRT2));
eq('VD1 B (tù)', v.B, 96.6, 0.05);
eq('VD1 C', v.C, 38.4, 0.05);
eq('VD1 tổng góc', v.B + v.C + 45, 180);
const sinB = 8 * Math.sin(T.rad(45)) / v.a;
eq('VD1 sinB -> 83.4 (cái bẫy)', T.deg(Math.asin(sinB)), 83.4, 0.05);
eq('Cosin A=90 -> Pytago', T.sideFromCosine(3, 4, 90).side, 5);
eq('Cosin A=60 b=c', T.sideFromCosine(5, 5, 60).side, 5);
eq('Angle 7-8-9', T.angleFromSides(7, 8, 9).deg, 48.1897, 1e-3);
eq('Angle clamp', T.angleFromSides(2, 1, 1).deg, 180);
const r = T.rightTriangle(3, 4);
eq('AH', r.AH, 2.4); eq('BH', r.BH, 1.8); eq('CH', r.CH, 3.2); eq('AM', r.AM, 2.5);
eq('1/AH^2', 1 / (r.AH ** 2), 1 / 9 + 1 / 16);
eq('AH.BC = AB.AC', r.AH * r.BC, 12);
eq('AH^2 = BH.CH', r.AH ** 2, r.BH * r.CH);
const t = T.triFromPoints({ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 0, y: 30 }, 10);
eq('triFromPoints a', t.a, 5); eq('triFromPoints S', t.S, 6); eq('A=90', t.A, 90);
eq('degenerate', T.triFromPoints({x:0,y:0},{x:10,y:0},{x:20,y:0},10).ok ? 1 : 0, 0);
console.log(T.fmt(5.6949, 2), T.fmt(-0.00001, 2));
process.exit(fail ? 1 : 0);
