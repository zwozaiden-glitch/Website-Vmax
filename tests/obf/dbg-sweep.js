const fs = require("fs");
const { execFileSync } = require("child_process");
const PVObf = require("../../obfuscator/luau-obfuscator.js");

const TESTFILE = process.argv[4] || "t1-full.lua";
const src = fs.readFileSync(TESTFILE, "utf8");
const stub = fs.readFileSync("work/combined-t1-full-low.lua", "utf8");
const hdrEnd = stub.indexOf("setreadonly = function() end\n") + "setreadonly = function() end\n".length;
const header = stub.slice(0, hdrEnd);
const footer = stub.slice(stub.indexOf("\n__realPrint"));
const MARK = "###PVOBF_OUT###";

function norm(s) {
  return s
    .replace(/\[string "[^"]*"\]:\d+/g, "<loc>")
    .replace(/[./][\w./-]+:\d+/g, "<loc>");
}
function run(file) {
  const out = execFileSync("/home/user/tools/luau-src/luau", [file], { encoding: "utf8" });
  const i = out.indexOf(MARK);
  return norm(out.slice(i + MARK.length + 1));
}
fs.writeFileSync("work/sweep-orig.lua", header + src + footer, "utf8");
const origOut = run("work/sweep-orig.lua");
const strength = process.argv[2] || "medium";
const N = parseInt(process.argv[3] || "40", 10);
let failures = 0;
for (let seed = 1; seed <= N; seed++) {
  const res = PVObf.obfuscate(src, { strength, seed });
  fs.writeFileSync("work/sweep.lua", res.code, "utf8");
  try {
    PVObf.parse(res.code);
  } catch (e) {
    console.log("seed", seed, "REPARSE FAIL:", e.message);
    failures++;
    continue;
  }
  fs.writeFileSync("work/sweep-run.lua", header + res.code + footer, "utf8");
  try {
    const obfOut = run("work/sweep-run.lua");
    if (obfOut !== origOut) {
      const a = origOut.split("\n");
      const b = obfOut.split("\n");
      let msg = "seed " + seed + " OUTPUT MISMATCH";
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if (a[i] !== b[i]) { msg += " @line" + (i + 1) + " orig=" + JSON.stringify(a[i]) + " obf=" + JSON.stringify(b[i]); break; }
      }
      console.log(msg);
      fs.writeFileSync("work/failing-seed-" + strength + "-" + seed + ".lua", res.code, "utf8");
      failures++;
      if (failures > 3) break;
    }
  } catch (e) {
    console.log("seed", seed, "RUN FAIL:", (e.stderr || "").split("\n")[0]);
    fs.writeFileSync("work/failing-seed-" + strength + "-" + seed + ".lua", res.code, "utf8");
    failures++;
    if (failures > 3) break;
  }
}
console.log(failures === 0 ? "all " + N + " seeds OK for " + strength : failures + " failures");
