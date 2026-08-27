const fs = require("fs");
const PVObf = require("../../obfuscator/luau-obfuscator.js");

const src = fs.readFileSync("t1-full.lua", "utf8");
const SEED = 42; const res = PVObf.obfuscate(src, { strength: "max", seed: SEED });
fs.writeFileSync("work/s1.lua", PVObf.obfuscate(src, { strength: "high", seed: SEED }).code, "utf8");
const code = res.code;

// 1. A table: the arm with exactly 64 [code] = index entries
function evalNum(s) {
  s = s.trim();
  if (s.startsWith("0x")) return parseInt(s, 16);
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  return Function("return (" + s + ")")();
}
const A = {};
let aCount = 0;
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
    aCount = 64;
    break;
  }
}
console.log("A entries", aCount);

// 2. the decoded-src statement:  SRC = UNX( DC( CAT ) )  where CAT contains ' .. '
const mSrc = code.match(/(\w+) = (\w+)\((\w+)\(([^)]*(?:\.\.[^)]*)*)\)\)/);
if (!mSrc) { console.log("SRC stmt not found"); process.exit(1); }
const [ , srcVar, unxName, dcName, catExpr ] = mSrc;
console.log("src var", srcVar, "unx", unxName, "dc", dcName);

// 3. chunk literals used in the concat expr — robust escape-aware scan
function luaStrVal(raw) {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "\\") {
      if (raw[i + 1] === "x") { out += String.fromCharCode(parseInt(raw.substr(i + 2, 2), 16)); i += 3; }
      else if (raw[i + 1] === "n") out += "\n";
      else if (raw[i + 1] === "t") out += "\t";
      else out += raw[i + 1];
      i++;
    } else out += raw[i];
  }
  return out;
}
function scanChunk(n) {
  const i = code.indexOf(n + ' = "');
  if (i === -1) throw new Error("chunk " + n + " not found");
  let j = i + n.length + 4; // after opening quote
  let raw = "";
  while (j < code.length) {
    const c = code[j];
    if (c === "\\") { raw += code.substr(j, 4); j += 4; continue; }
    if (c === '"') break;
    raw += c;
    j++;
  }
  return luaStrVal(raw);
}
const ordered = [];
for (const m of catExpr.matchAll(/\b(\w+)\b/g)) {
  if (!ordered.includes(m[1])) ordered.push(m[1]);
}
const catOrdered = ordered.map(scanChunk).join("");
console.log("chunk order", ordered.join(" .. "), "total chars", catOrdered.length);

// 4. unx key
const mUnx = code.match(new RegExp("\\b" + unxName + " = function\\(\\w+\\) local \\w+ = \\{([^}]*)\\}"));
const key = mUnx[1].split(",").map((s) => evalNum(s.trim()));
console.log("unx key", key);

// 5. decode: base64 (A map) then xor
function luaStrVal(raw) {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "\\") {
      if (raw[i + 1] === "x") { out += String.fromCharCode(parseInt(raw.substr(i + 2, 2), 16)); i += 3; }
      else if (raw[i + 1] === "n") out += "\n";
      else if (raw[i + 1] === "t") out += "\t";
      else out += raw[i + 1];
      i++;
    } else out += raw[i];
  }
  return out;
}
const n = catOrdered.length;
const bytes = [];
for (let i = 0; i < n; i += 4) {
  const c0 = A[catOrdered.charCodeAt(i)];
  const c1 = i + 1 < n ? A[catOrdered.charCodeAt(i + 1)] : 0;
  const c2 = i + 2 < n ? A[catOrdered.charCodeAt(i + 2)] : 0;
  const c3 = i + 3 < n ? A[catOrdered.charCodeAt(i + 3)] : 0;
  const v = c0 * 262144 + c1 * 4096 + c2 * 64 + c3;
  bytes.push(Math.floor(v / 65536) % 256);
  if (i + 2 < n) bytes.push(Math.floor(v / 256) % 256);
  if (i + 3 < n) bytes.push(v % 256);
}
const h = Buffer.from(bytes.map((b, i) => (b ^ key[i % key.length]) & 255));
const s1 = Buffer.from(fs.readFileSync("work/s1.lua", "utf8"), "utf8");
console.log("decoded", h.length, "s1", s1.length);
let first = -1;
for (let i = 0; i < Math.min(h.length, s1.length); i++) if (h[i] !== s1[i]) { first = i; break; }
console.log("first diff at", first);
if (first >= 0) {
  const a = Math.max(0, first - 50), b = Math.min(h.length, first + 70);
  console.log("dec:", JSON.stringify(h.slice(a, b).toString("latin1")));
  console.log("s1 :", JSON.stringify(s1.slice(a, b).toString("latin1")));
}
