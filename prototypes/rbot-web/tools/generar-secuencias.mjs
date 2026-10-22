// Genera las secuencias de prueba de paridad (fijas + aleatorias con semilla, reproducibles).
// Salida: tools/secuencias.txt (una por linea; "-" = vacia). La usan tanto el oraculo Java como el navegador.
import fs from 'node:fs';

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const fijas = [
  '', 'g', 'ggg', 'h', 'hhh', 'gh', 'hg', 'i', 'iii', 'j', 'jjj', 'ij',
  'a', 'aaaa', 'b', 'bbb', 'ab', 'c', 'cccc', 'd', 'ddd', 'cd', 'e', 'eeee', 'f', 'fff', 'ef',
  'g'.repeat(29), 'g'.repeat(30), 'g'.repeat(60), 'h'.repeat(31), 'i'.repeat(15), 'i'.repeat(16), 'j'.repeat(45),
  'gggiicceaafgjhb', 'ggggiiiihhhhjjjj',
  // estado final de la captura de Victor: vertical 58, azimut 76, elevacion -50
  'a'.repeat(58) + 'c'.repeat(38) + 'f'.repeat(25),
];
const rnd = mulberry32(20261022);
const letras = 'abcdefghij';
const aleatorias = [];
for (let n = 0; n < 40; n++) {
  const largo = 5 + Math.floor(rnd() * 120);
  let s = '';
  for (let i = 0; i < largo; i++) s += letras[Math.floor(rnd() * letras.length)];
  aleatorias.push(s);
}
const todas = [...fijas, ...aleatorias];
fs.writeFileSync(new URL('./secuencias.txt', import.meta.url), todas.map((s) => s || '-').join('\n') + '\n');
console.log(`${fijas.length} fijas + ${aleatorias.length} aleatorias = ${todas.length} secuencias`);
