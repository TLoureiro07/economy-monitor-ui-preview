const fs = require('fs');
const path = require('path');

const luaPath = path.join(__dirname, '../../locales/locales.lua');
const outPath = path.join(__dirname, '../public/js/locales-en.js');
const txt = fs.readFileSync(luaPath, 'utf8');
const start = txt.indexOf('UiLocales = {');
const enStart = txt.indexOf('en = {', start);
let depth = 0;
let i = enStart + 'en = '.length;
for (; i < txt.length; i++) {
  if (txt[i] === '{') depth++;
  else if (txt[i] === '}') {
    depth--;
    if (depth === 0) {
      i++;
      break;
    }
  }
}
const block = txt.slice(enStart + 4, i);
const obj = {};
const re = /(\w+)\s*=\s*'((?:\\'|[^'])*)'/g;
let m;
while ((m = re.exec(block))) {
  obj[m[1]] = m[2].replace(/\\'/g, "'");
}
obj.brand = 'Economy Monitor (Demo)';
const js =
  'window.EIDemoLocales = ' +
  JSON.stringify({ en: obj, pt: { brand: 'Economy Monitor (Demo)' } }, null, 2) +
  ';\n';
fs.writeFileSync(outPath, js);
console.log('Wrote', Object.keys(obj).length, 'keys to', outPath);
