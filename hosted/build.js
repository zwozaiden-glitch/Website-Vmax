#!/usr/bin/env node
/* Rebuilds hosted/vmax-demo.lua from hosted/vmax-demo-src.lua at "max"
   strength. The demo contains no real API token — it is safe to host
   publicly. Usage: node hosted/build.js [seed] */
const fs = require("fs");
const path = require("path");
const PVObf = require("../obfuscator/luau-obfuscator.js");

const dir = __dirname;
const src = fs.readFileSync(path.join(dir, "vmax-demo-src.lua"), "utf8");
const seed = process.argv[2] ? (parseInt(process.argv[2], 10) >>> 0) : undefined;
const res = PVObf.obfuscate(src, { strength: "max", seed });
const out = path.join(dir, "vmax-demo.lua");
fs.writeFileSync(out, res.code, "utf8");
console.log("hosted/vmax-demo.lua");
console.log("  in:    " + res.stats.inputBytes + " bytes");
console.log("  out:   " + res.stats.outputBytes + " bytes (" + (res.stats.outputBytes / res.stats.inputBytes).toFixed(1) + "x)");
console.log("  seed:  " + res.stats.seed);
console.log("  layers: " + res.stats.layers + " | strings: " + res.stats.strings + " | globals: " + res.stats.globals + " | cff: " + res.stats.cffBlocks);
