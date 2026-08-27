const fs = require("fs");
const { execFileSync } = require("child_process");
const PVObf = require("../../obfuscator/luau-obfuscator.js");

const src = fs.readFileSync("t1-full.lua", "utf8");
const SEED = 42;
const code = PVObf.obfuscate(src, { strength: "max", seed: SEED }).code;
const s1 = Buffer.from(PVObf.obfuscate(src, { strength: "high", seed: SEED }).code, "utf8");
const big = code.split("\n").find((l) => l.length > 1000);

// extract the whole while chain (line 3) plus the two locals lines — that's
// everything; instead of arm surgery, build a harness that runs the chain and
// dumps bytes of the decoded source var BEFORE the loadstring call.
// Find the loadstring arm: 'VN = GT[rw(...)](SRCV)'
const mSrc = code.match(/(\w+) = (\w+)\((\w+)\(([^)]*(?:\.\.[^)]*)*)\)\)/);
const [ , srcVar, unxName, dcName, catExpr ] = mSrc;
// find 'fvar = gtbl[rw(...)](srcvar)' — the statement after srcVar assignment
const idx = big.indexOf("](" + srcVar + ")");
const stmtStart = big.lastIndexOf(" = ", idx);
const afterSpace = big.lastIndexOf(" ", stmtStart) + 1; // position of '='
let nameBegin = afterSpace - 1;
while (nameBegin > 0 && /[A-Za-z0-9_]/.test(big[nameBegin - 1])) nameBegin--;
const stmtEnd = idx + srcVar.length + 3; // '](' + var + ')'
const fvar = big.slice(nameBegin, afterSpace - 1);
// dump probe: replace that statement
const probe =
  "do local __t = {} for __i = 1, #" + srcVar + " do __t[__i] = tostring(" + srcVar + ":byte(__i)) end print(\"##BYTES##\" .. table.concat(__t, \",\")) end";
const mod = big.slice(0, nameBegin) + probe + big.slice(stmtEnd);
// neutralize the f() call arm
const mod2 = mod.replace(fvar + "()", "if false then " + fvar + "() end");
fs.writeFileSync("/tmp/maxdump.lua", code.split("\n")[0] + "\n" + code.split("\n")[1] + "\n" + mod2 + "\n", "utf8");

const out = execFileSync("/home/user/tools/luau-src/luau", ["/tmp/maxdump.lua"], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});
const line = out.split("\n").find((l) => l.startsWith("##BYTES##"));
if (!line) { console.log("no dump:", out.slice(0, 400)); process.exit(1); }
const nums = line.slice("##BYTES##".length).split(",").map(Number);
const h = Buffer.from(nums);
let fd = -1;
for (let i = 0; i < Math.min(h.length, s1.length); i++) if (h[i] !== s1[i]) { fd = i; break; }
console.log("luau decoded:", h.length, "s1:", s1.length, "first diff:", fd);
if (fd >= 0) {
  const a = Math.max(0, fd - 40), b = Math.min(h.length, fd + 40);
  console.log("luau:", h.slice(a, b).toString("latin1"));
  console.log("s1  :", s1.slice(a, b).toString("latin1"));
  // also char index in base64: byte fd -> group fd/3, char 4*group
  console.log("byte", fd, "-> b64 char", Math.floor(fd / 3) * 4);
}
