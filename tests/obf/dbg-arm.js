const fs = require("fs");
const PVObf = require("../../obfuscator/luau-obfuscator.js");
const l3 = fs.readFileSync("work/high-out.lua", "utf8").split("\n")[2];
const head = "local tj = 0\n";
const parts = l3.split(" elseif tj == ");
const firstArm = parts[0].slice(parts[0].indexOf("then ") + 5);
const arms = [firstArm].concat(
  parts.slice(1).map((p) => p.slice(p.indexOf("then ") + 5))
);
console.log("num arms", arms.length);
for (let k = 1; k <= arms.length; k++) {
  const code =
    head +
    "while tj < 95 do " +
    "if tj == 0 then " +
    arms.slice(0, k).join(" elseif tj == 1 then ") +
    (k === arms.length ? "" : " end tj = tj + 1 end\n");
  try {
    PVObf.parse(code);
  } catch (e) {
    console.log("fails at arm", k, ":", e.message);
    console.log("arm body:", JSON.stringify(arms[k - 1].slice(0, 300)));
    break;
  }
}
