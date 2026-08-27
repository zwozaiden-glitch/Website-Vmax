#!/usr/bin/env node
/* ==========================================================================
   Protect-Vmax — obfuscator test runner
   --------------------------------------------------------------------------
   For every tests/obf/t*.lua:
     1. parse + round-trip emit + re-parse (self consistency)
     2. obfuscate at every strength
     3. run original vs obfuscated under the Luau VM (stubbed Roblox
        environment), compare captured stdout
   Usage: node tests/obf/run-tests.js [--luau /path/to/luau]
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const PVObf = require("../../obfuscator/luau-obfuscator.js");

const LUAU =
  process.argv.includes("--luau")
    ? process.argv[process.argv.indexOf("--luau") + 1]
    : "/home/user/tools/luau-src/luau";
const dir = __dirname;
const work = path.join(dir, "work");
fs.mkdirSync(work, { recursive: true });

const MARK = "###PVOBF_OUT###";

const STUB_HEADER = `
local __out = {}
local __realPrint = print
print = function(...)
  local t = { ... }
  for i = 1, #t do t[i] = tostring(t[i]) end
  __out[#__out + 1] = table.concat(t, "\\t")
end
local function __svc(name)
  local s = { Name = name }
  s.GetService = function(self, n) return __svc(n) end
  return s
end
game = { GetService = function(self, n) return __svc(n) end, Players = __svc("Players") }
workspace = __svc("workspace")
script = __svc("script")
shared = {}
tick = function() return 1234.5 end
wait = function() return 0 end
spawn = function() end
task = { wait = function() end, delay = function() end, spawn = function() end }
warn = function() end
getgenv = function() return shared end
setclipboard = function() end
writefile = function() return true end
readfile = function() return "" end
isfile = function() return false end
makefolder = function() end
request = function() return { Status = 200, Body = "{}" } end
http_request = function() return { Status = 200, Body = "{}" } end
gethookmt = function() end
getrawmetatable = function() return {} end
setreadonly = function() end
`;

const STUB_FOOTER = `\n__realPrint("${MARK}\\n" .. table.concat(__out, "\\n"))\n`;

function runWithStubs(scriptPath) {
  const combined = path.join(work, "combined-" + path.basename(scriptPath));
  fs.writeFileSync(combined, STUB_HEADER + "\n" + fs.readFileSync(scriptPath, "utf8") + STUB_FOOTER, "utf8");
  const out = execFileSync(LUAU, [combined], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const i = out.indexOf(MARK);
  if (i === -1) throw new Error("no output marker:\n" + out);
  // error messages embed the script file path + line number — normalize so
  // obfuscated (relocated) code compares equal; double-wrapped (max) scripts
  // report [string "..."]:line instead, with per-seed source text
  return out
    .slice(i + MARK.length)
    .replace(/^\n/, "")
    .replace(/\[string "[^"]*"\]:\d+/g, "<loc>")
    .replace(/[./][\w./-]+:\d+/g, "<loc>");
}

const files = fs.readdirSync(dir).filter((f) => /^t\d+.*\.lua$/.test(f));
let pass = 0;
let failCount = 0;

for (const f of files) {
  const src = fs.readFileSync(path.join(dir, f), "utf8");
  const base = f.replace(/\.lua$/, "");

  // 1. parse + round trip
  try {
    const ast = PVObf.parse(src);
    const out1 = PVObf.emit(ast);
    PVObf.parse(out1);
  } catch (e) {
    console.log(`FAIL  ${f}  [round-trip] ${e.message}`);
    failCount++;
    continue;
  }

  let origOut = null;
  try {
    origOut = runWithStubs(path.join(dir, f));
  } catch (e) {
    console.log(`FAIL  ${f}  [original-run] ${e.message.split("\n")[0]}`);
    failCount++;
    continue;
  }

  for (const strength of ["low", "medium", "high", "max"]) {
    const obfPath = path.join(work, base + "-" + strength + ".lua");
    try {
      const res = PVObf.obfuscate(src, { strength });
      fs.writeFileSync(obfPath, res.code, "utf8");
      PVObf.parse(res.code); // must re-parse
      const obfOut = runWithStubs(obfPath);
      if (obfOut !== origOut) {
        throw new Error("output mismatch:\n--- orig ---\n" + origOut + "\n--- obf ---\n" + obfOut);
      }
      console.log(`PASS  ${f}  [${strength}]  ${res.stats.inputBytes}->${res.stats.outputBytes}B  (${origOut.split("\n").length} lines matched)`);
      pass++;
    } catch (e) {
      console.log(`FAIL  ${f}  [${strength}]  ${e.message.split("\n").slice(0, 3).join(" | ")}`);
      failCount++;
    }
  }
}

console.log("");
console.log(`${pass} passed, ${failCount} failed`);
process.exit(failCount ? 1 : 0);
