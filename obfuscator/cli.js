#!/usr/bin/env node
/* ==========================================================================
   Protect-Vmax — obfuscator CLI
   --------------------------------------------------------------------------
   Usage:
     node obfuscator/cli.js <input.lua> [output.lua] [options]
       --strength low|medium|high|max   (default: max)
       --seed <n>                       deterministic seed
       --module                         treat input as a Luau module
       --no-wrap                        skip the final encoded outer layer
       --check                          parse only (syntax check)
   ========================================================================== */
const fs = require("fs");
const path = require("path");
const PVObf = require("./luau-obfuscator.js");

function fail(msg) {
  console.error("error: " + msg);
  process.exit(1);
}

function usage() {
  console.log(
    [
      "Protect-Vmax Luau obfuscator",
      "",
      "Usage: node obfuscator/cli.js <input.lua> [output.lua] [options]",
      "  --strength low|medium|high|max   default: max",
      "  --seed <n>                       deterministic output",
      "  --module                         input is a Luau module",
      "  --no-wrap                        skip final encoded layer",
      "  --check                          parse only (syntax check)",
    ].join("\n")
  );
}

const argv = process.argv.slice(2);
if (argv.includes("-h") || argv.includes("--help") || argv.length === 0) {
  usage();
  process.exit(argv.length === 0 ? 1 : 0);
}

let input = null;
let output = null;
const opts = { strength: "max" };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--strength") opts.strength = argv[++i];
  else if (a === "--seed") opts.seed = parseInt(argv[++i], 10);
  else if (a === "--module") opts.module = true;
  else if (a === "--no-wrap") opts.wrap = false;
  else if (a === "--check") opts.check = true;
  else if (!input) input = a;
  else if (!output) output = a;
  else fail("unexpected argument " + a);
}
if (!input) fail("missing input file");
if (!fs.existsSync(input)) fail("no such file: " + input);

const src = fs.readFileSync(input, "utf8");
const t0 = Date.now();

try {
  if (opts.check) {
    PVObf.parse(src);
    console.log("OK: parsed " + input + " (" + src.length + " chars) in " + (Date.now() - t0) + "ms");
    process.exit(0);
  }

  const res = PVObf.obfuscate(src, opts);
  const outPath = output || input.replace(/\.luau?$/i, "") + ".obf.lua";
  fs.writeFileSync(outPath, res.code, "utf8");

  const s = res.stats;
  console.log("Protect-Vmax obfuscator — " + s.strength);
  console.log("  in:      " + input);
  console.log("  out:     " + outPath);
  console.log("  size:    " + s.inputBytes + " -> " + s.outputBytes + " bytes (" + (s.outputBytes / Math.max(1, s.inputBytes)).toFixed(2) + "x)");
  console.log("  layers:  " + s.layers + (s.module ? " (module)" : ""));
  console.log("  strings: " + s.strings + " encrypted | globals: " + s.globals + " | CFF: " + s.cffBlocks + " | dead: " + s.deadBlocks);
  console.log("  seed:    " + s.seed);
  console.log("  time:    " + (Date.now() - t0) + "ms");
  console.log("");
  console.log("loader:");
  console.log('loadstring(game:HttpGet("<host-url>/' + path.basename(outPath) + '"))()');
} catch (e) {
  if (e instanceof PVObf.PVError) fail("obfuscation failed: " + e.message);
  throw e;
}
