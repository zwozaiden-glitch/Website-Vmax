const fs = require("fs");
const code = fs.readFileSync("/tmp/str1.obf.lua", "utf8");
const l3 = code.split("\n")[2];
const m = l3.match(/ox = "((?:[^"\\]|\\.)*)"/);
const raw = m[1];
const bytes = [];
for (let i = 0; i < raw.length; i++) {
  if (raw[i] === "\\") { bytes.push(parseInt(raw.substr(i + 2, 2), 16)); i += 3; }
  else bytes.push(raw.charCodeAt(i));
}
// build pos->entry map (1-based data start)
const entries = [];
let idx = 0; // 0-based index of the 2-byte length prefix
while (idx + 1 < bytes.length) {
  const len = (bytes[idx] << 8) | bytes[idx + 1];
  const data = bytes.slice(idx + 2, idx + 2 + len);
  entries.push({ pos: idx + 3, len, data }); // 1-based data start
  idx += 2 + len;
}
console.log("blob entries (pos:len):", entries.map((e) => e.pos + ":" + e.len).join(" "));

function ev(a) {
  a = a.trim();
  if (a.startsWith("0x")) return parseInt(a, 16);
  if (/^-?\d+$/.test(a)) return parseInt(a, 10);
  try {
    return Function("return (" + a + ")")();
  } catch (err) {
    console.log("EV FAIL on:", JSON.stringify(a), err.message);
    return NaN;
  }
}
const calls = [];
for (let i = l3.indexOf("pt("); i !== -1; i = l3.indexOf("pt(", i + 1)) {
  let d = 0, j = i + 2;
  while (j < l3.length) {
    if (l3[j] === "(") d++;
    else if (l3[j] === ")") { d--; if (d === 0) break; }
    j++;
  }
  const inner = l3.slice(i + 3, j);
  const args = [];
  let depth = 0, cur = "";
  for (const ch of inner) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { args.push(cur); cur = ""; }
    else cur += ch;
  }
  args.push(cur);
  calls.push(args.map(ev));
}
for (const c of calls) {
  const pos0 = c[0], len = c[1], key = c.slice(2);
  const e = entries.find((x) => x.pos === pos0);
  if (!e || e.len !== len) {
    console.log("BROKEN  pos=" + pos0 + " len=" + len + "  (entry: " + (e ? e.pos + ":" + e.len : "none") + ")");
    continue;
  }
  let out = "";
  for (let j = 0; j < len; j++) {
    const encB = e.data[j];
    const rawByte = (((encB - j * 13) % 256) + 256) % 256;
    out += String.fromCharCode(rawByte ^ key[j % key.length]);
  }
  console.log("ok      pos=" + pos0 + " len=" + len + " -> " + JSON.stringify(out));
}
