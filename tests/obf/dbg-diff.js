const fs = require("fs");
const { execFileSync } = require("child_process");
const PVObf = require("../../obfuscator/luau-obfuscator.js");
const MARK = "###PVOBF_OUT###";
const src = fs.readFileSync("t1-full.lua", "utf8");
const stubFile = "work/combined-t1-full-low.lua";
const stub = fs.readFileSync(stubFile, "utf8");
const hdrEnd = stub.indexOf("setreadonly = function() end\n") + "setreadonly = function() end\n".length;
const header = stub.slice(0, hdrEnd);
const footer = stub.slice(stub.indexOf("\n__realPrint"));
function run(file) {
  const out = execFileSync("/home/user/tools/luau-src/luau", [file], { encoding: "utf8" });
  const i = out.indexOf(MARK);
  return out.slice(i + MARK.length + 1).split("\n");
}
const strength = process.argv[2] || "low";
const origLines = run(stubFile);
const res = PVObf.obfuscate(src, { strength });
fs.writeFileSync("work/diff-run.lua", header + res.code + footer, "utf8");
const obfLines = run("work/diff-run.lua");
console.log("strength:", strength, "| orig lines", origLines.length, "| obf lines", obfLines.length);
let shown = 0;
for (let i = 0; i < Math.max(origLines.length, obfLines.length); i++) {
  if (origLines[i] !== obfLines[i]) {
    console.log("DIFF line " + (i + 1));
    console.log("  orig:", JSON.stringify(origLines[i]));
    console.log("  obf :", JSON.stringify(obfLines[i]));
    if (++shown >= 6) break;
  }
}
