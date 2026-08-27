const fs = require("fs");
const PVObf = require("../../obfuscator/luau-obfuscator.js");

const src = fs.readFileSync("t1-full.lua", "utf8");
const SEED = 42;
const code = PVObf.obfuscate(src, { strength: "max", seed: SEED }).code;
const s1 = Buffer.from(PVObf.obfuscate(src, { strength: "high", seed: SEED }).code, "utf8");
console.log("s1 bytes:", s1.length, "-> expected b64 chars:", Math.ceil(s1.length / 3) * 4);

const mSrc = code.match(/(\w+) = (\w+)\((\w+)\(([^)]*(?:\.\.[^)]*)*)\)\)/);
const catExpr = mSrc[4];
const ordered = [];
for (const m of catExpr.matchAll(/\b(\w+)\b/g)) {
  if (!ordered.includes(m[1])) ordered.push(m[1]);
}
let total = 0;
for (const n of ordered) {
  const i = code.indexOf(n + ' = "');
  if (i === -1) { console.log(n, "NOT FOUND"); continue; }
  let j = i + n.length + 4; // after opening quote
  let len = 0;
  while (j < code.length) {
    const c = code[j];
    if (c === "\\") { j += 4; len++; continue; } // \xNN only
    if (c === '"') break;
    j++;
    len++;
  }
  total += len;
  console.log(n, "len", len, "raw", j - (i + n.length + 4) - 1, "at", i);
}
console.log("total decoded chars:", total);
