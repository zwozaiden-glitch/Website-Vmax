const fs = require("fs");
const PVObf = require("../../obfuscator/luau-obfuscator.js");

const src = fs.readFileSync("t1-full.lua", "utf8");
const SEED = 42;
const code = PVObf.obfuscate(src, { strength: "max", seed: SEED }).code;
const s1 = Buffer.from(PVObf.obfuscate(src, { strength: "high", seed: SEED }).code, "utf8");

// unx key
const mSrc = code.match(/(\w+) = (\w+)\((\w+)\(([^)]*(?:\.\.[^)]*)*)\)\)/);
const unxName = mSrc[2];
const mUnx = code.match(new RegExp("\\b" + unxName + " = function\\(\\w+\\) local \\w+ = \\{([^}]*)\\}"));
function evalNum(s) {
  s = s.trim();
  if (s.startsWith("0x")) return parseInt(s, 16);
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  return Function("return (" + s + ")")();
}
const key = mUnx[1].split(",").map((s) => evalNum(s));
console.log("key", key);

// A table
const A = {}; // charCode -> index
for (const m of code.matchAll(/\w+ = \{/g)) {
  const open = m.index + m[0].length - 1;
  let d = 0, j = open;
  while (j < code.length) {
    if (code[j] === "{") d++;
    else if (code[j] === "}") { d--; if (d === 0) break; }
    j++;
  }
  const block = code.slice(open, j + 1);
  const entries = [...block.matchAll(/\[([^\]]+)\] = ([^,}]+)(?=[,}])/g)];
  if (entries.length === 64) {
    for (const e of entries) A[evalNum(e[1])] = evalNum(e[2]);
    break;
  }
}
// reverse alpha: index -> char
const alpha = [];
for (const [cc, idx] of Object.entries(A)) alpha[idx] = String.fromCharCode(parseInt(cc, 10));
console.log("alpha len", alpha.length, "missing", alpha.filter((c) => !c).length);

// expected enc
const xored = s1.map((b, i) => (b ^ key[i % key.length]) & 255);
let enc = "";
for (let i = 0; i < xored.length; i += 3) {
  const c0 = xored[i];
  const has1 = i + 1 < xored.length;
  const has2 = i + 2 < xored.length;
  const c1 = has1 ? xored[i + 1] : 0;
  const c2 = has2 ? xored[i + 2] : 0;
  const v = c0 * 65536 + c1 * 256 + c2;
  enc += alpha[(v >> 18) & 63];
  enc += alpha[(v >> 12) & 63];
  if (has1) enc += alpha[(v >> 6) & 63];
  if (has2) enc += alpha[v & 63];
}
console.log("expected enc len", enc.length);

// extract the actual chunk strings (robust scan; identify blob to skip)
function scanAt(i) {
  let j = i; // index of opening quote
  let raw = "";
  j++;
  while (j < code.length) {
    const c = code[j];
    if (c === "\\") { raw += code.substr(j, 4); j += 4; continue; }
    if (c === '"') break;
    raw += c;
    j++;
  }
  let out = "";
  for (let k = 0; k < raw.length; k++) {
    if (raw[k] === "\\") { out += String.fromCharCode(parseInt(raw.substr(k + 2, 2), 16)); k += 3; }
    else out += raw[k];
  }
  return out;
}
const catExpr = mSrc[4];
const ordered = [];
for (const m of catExpr.matchAll(/\b(\w+)\b/g)) if (!ordered.includes(m[1])) ordered.push(m[1]);
const cat = ordered.map((n) => scanAt(code.indexOf(n + ' = "') + n.length + 3)).join("");
console.log("cat len", cat.length);

// diff
let first = -1;
for (let i = 0; i < Math.min(enc.length, cat.length); i++) if (enc[i] !== cat[i]) { first = i; break; }
console.log("first char diff at", first);
if (first >= 0) {
  console.log("enc:", JSON.stringify(enc.slice(first - 20, first + 30)));
  console.log("cat:", JSON.stringify(cat.slice(first - 20, first + 30)));
}
console.log("enc tail len", enc.length, "cat tail len", cat.length);

// full Node decode of cat with the Luau formula
const n = cat.length;
const bytes = [];
for (let i = 0; i < n; i += 4) {
  const c0 = A[cat.charCodeAt(i)];
  const c1 = i + 1 < n ? A[cat.charCodeAt(i + 1)] : 0;
  const c2 = i + 2 < n ? A[cat.charCodeAt(i + 2)] : 0;
  const c3 = i + 3 < n ? A[cat.charCodeAt(i + 3)] : 0;
  const v = c0 * 262144 + c1 * 4096 + c2 * 64 + c3;
  bytes.push(Math.floor(v / 65536) % 256);
  if (i + 2 < n) bytes.push(Math.floor(v / 256) % 256);
  if (i + 3 < n) bytes.push(v % 256);
}
const h = Buffer.from(bytes.map((b, i) => (b ^ key[i % key.length]) & 255));
console.log("node decode:", h.length, "s1:", s1.length);
let fd = -1;
for (let i = 0; i < Math.min(h.length, s1.length); i++) if (h[i] !== s1[i]) { fd = i; break; }
console.log("node vs s1 first diff:", fd);
if (fd >= 0) {
  const a = Math.max(0, fd - 30), b = Math.min(h.length, fd + 40);
  console.log("h :", JSON.stringify(h.slice(a, b).toString("latin1")));
  console.log("s1:", JSON.stringify(s1.slice(a, b).toString("latin1")));
}
