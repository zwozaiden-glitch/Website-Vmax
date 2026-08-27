const fs = require("fs");
const { execFileSync } = require("child_process");
const PVObf = require("../../obfuscator/luau-obfuscator.js");

const src = fs.readFileSync("t1-full.lua", "utf8");
const res = PVObf.obfuscate(src, { strength: "max" });
const code = res.code;

// find 'qn = ss[cq(...)](gp)' — the loadstring assignment; replace with byte dump of gp
const idx = code.indexOf("= ss[cq(");
const start = code.lastIndexOf(" ", idx) + 1; // start of 'qn'
// gp is the arg inside the final ')('
const paren = code.indexOf("](gp)", idx);
const end = paren + 5;
const probe =
  "do local __t = {} for __i = 1, #gp do __t[__i] = tostring(gp:byte(__i)) end print(table.concat(__t, \",\")) end";
const mod = code.slice(0, start) + probe + code.slice(end);
// also kill the qn() call arm so it doesn't crash
const mod2 = mod.replace("qn()", "if false then qn() end");
fs.writeFileSync("work/max-probe.lua", mod2, "utf8");

const stub = fs.readFileSync("work/combined-t1-full-low.lua", "utf8");
const hdrEnd = stub.indexOf("setreadonly = function() end\n") + "setreadonly = function() end\n".length;
const header = stub.slice(0, hdrEnd);
const footer = stub.slice(stub.indexOf("\n__realPrint"));
fs.writeFileSync("work/max-probe-run.lua", header + mod2 + footer, "utf8");

const out = execFileSync("/home/user/tools/luau-src/luau", ["work/max-probe-run.lua"], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});
const lines = out.split("\n");
const dumpLine = lines.find((l) => l.length > 10000 && /^\d+(,\d+)*$/.test(l.trim()));
if (!dumpLine) {
  console.log("NO DUMP FOUND");
  console.log(out.slice(0, 500));
  process.exit(1);
}
const nums = dumpLine.trim().split(",").map(Number);
const h = Buffer.from(nums);
const s1 = fs.readFileSync("work/s1.lua", "utf8");
const s1b = Buffer.from(s1, "utf8");
console.log("h bytes", h.length, "s1 bytes", s1b.length);
let first = -1;
for (let i = 0; i < Math.min(h.length, s1b.length); i++) if (h[i] !== s1b[i]) { first = i; break; }
console.log("first diff at", first);
if (first >= 0) {
  const a = Math.max(0, first - 40), b = Math.min(h.length, first + 60);
  console.log("h :", JSON.stringify(h.slice(a, b).toString("latin1")));
  console.log("s1:", JSON.stringify(s1b.slice(a, b).toString("latin1")));
}
