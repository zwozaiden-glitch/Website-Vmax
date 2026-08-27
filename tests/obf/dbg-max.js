const fs = require("fs");
const { execFileSync } = require("child_process");
const PVObf = require("../../obfuscator/luau-obfuscator.js");

const src = fs.readFileSync("t1-full.lua", "utf8");
const res = PVObf.obfuscate(src, { strength: "max" });
const code = res.code;
const lines = code.split("\n");
console.log("max output lines:", lines.length);
// find the big while chain line
const big = lines.find((l) => l.length > 1000);
console.log("big line len", big.length);
// list arm bodies compactly
const parts = big.split(/ elseif \w+ == /);
console.log("first seg:", JSON.stringify(parts[0].slice(0, 120)));
for (let i = 1; i < parts.length; i += 1) {
  const cond = parts[i].split(" then ")[0];
  const body = parts[i].split(" then ")[1] || "";
  const b = body.slice(0, 100).replace(/\n/g, " ");
  console.log("cond", cond.padEnd(5), "|", b);
}
