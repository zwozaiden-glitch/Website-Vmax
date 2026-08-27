const fs = require("fs");
const { execFileSync } = require("child_process");

const code = fs.readFileSync("/tmp/str1.obf.lua", "utf8");
const lines = code.split("\n");
const l3 = lines[2];

// split into arms: the line is "while im < 15 do <arm0> elseif im == N <armN> ... im = im + 1 end"
const head = l3.slice(0, l3.indexOf("while"));
const tailStart = l3.lastIndexOf(" im = im + 1 end");
const chain = l3.slice(l3.indexOf("do ") + 3, tailStart);
const tail = l3.slice(tailStart);

// arms: "if im == N then BODY" / "elseif im == N then BODY"
const armRe = /((?:if|elseif) im == (\d+) then )((?:(?! elseif im == ).)*)/g;
const arms = [];
let m;
while ((m = armRe.exec(chain)) !== null) {
  arms.push({ cond: parseInt(m[2], 10), prefix: m[1], body: m[3] });
}
console.log("arms found:", arms.length, "conds:", arms.map((a) => a.cond).join(","));

function build(replaceCond) {
  let out = head + "while im < 15 do ";
  let first = true;
  const lastCond = arms[arms.length - 1].cond;
  for (const a of arms) {
    const kw = first ? "if" : "elseif";
    first = false;
    let body = a.body;
    if (a.cond === replaceCond) body = a.cond === lastCond ? "im = im end" : "im = im";
    out += kw + " im == " + a.cond + " then " + body;
  }
  // The last arm's body in the original chain ends right before ' im = im + 1 end';
  // our rebuild dropped the chain's closing 'end' — the last arm body ends with it in the original.
  out += tail;
  return lines[0] + "\n" + lines[1] + "\n" + out + "\n";
}

function run(text) {
  fs.writeFileSync("/tmp/bisect.lua", text);
  try {
    const out = execFileSync("/home/user/tools/luau-src/luau", ["/tmp/bisect.lua"], { encoding: "utf8" });
    return "OK " + out.trim();
  } catch (e) {
    return "ERR " + (e.stderr ? e.stderr.toString().split("\n")[0] : e.message).replace("/tmp/bisect.lua", "");
  }
}

console.log("baseline:", run(build(-1)));
for (const a of arms) {
  const r = run(build(a.cond));
  if (!r.startsWith("OK")) console.log("cond", a.cond, "->", r);
}
