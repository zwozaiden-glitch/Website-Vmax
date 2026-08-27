const fs = require("fs");
const PVObf = require("../../obfuscator/luau-obfuscator.js");
const src = fs.readFileSync("t1-full.lua", "utf8");
const code = PVObf.obfuscate(src, { strength: "max", seed: 42 }).code;
const big = code.split("\n").find((l) => l.length > 1000);

function wordAt(s, i, w) {
  const before = i === 0 ? " " : s[i - 1];
  const after = s[i + w.length] || " ";
  return s.substr(i, w.length) === w && !/[A-Za-z0-9_]/.test(before) && !/[A-Za-z0-9_]/.test(after);
}
for (const m of big.matchAll(/\b(\w+) = function/g)) {
  const i = m.index;
  let d = 0, j = i;
  while (j < big.length) {
    if (wordAt(big, j, "function")) { d++; j += 8; continue; }
    if (wordAt(big, j, "end")) {
      d--;
      if (d === 0) {
        const fn = big.slice(i, j + 3);
        if (fn.length < 500) console.log("=== " + m[1] + " (" + fn.length + ") ===\n" + fn + "\n");
        break;
      }
      j += 3;
      continue;
    }
    j++;
  }
}
