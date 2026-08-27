/* ==========================================================================
   Protect-Vmax — Luau obfuscator core
   --------------------------------------------------------------------------
   Zero-dependency, browser + Node (UMD).

   Pipeline (strength "max"):
     1. parse            full Luau source -> AST
     2. mangle           scope-correct rename of every local/param/label
     3. globals          every global read/write redirected through a local
                         table  g["game"] -> g[<enc "game">]
     4. dead-code        random unreachable blocks sprinkled in
     5. strings          all string literals removed from the source and
                         stored in one XOR-obfuscated byte blob + lookup fn
     6. constants        numeric literals re-expressed
     7. CFF              blocks flattened into while/if state machines
     8. junk             unused helper functions
     9. emit             compact codegen  ->  layer 1 source
    10. final wrap       layer 1 source is XOR + custom-base64 encoded and
                         hidden inside a second, itself-mangled program
                         that decodes it in memory and runs it.

   The result is different on every run (random seed) and resists pattern
   based deobfuscators: nothing readable survives in the outer layer and the
   inner layer is fully mangled + string-encrypted.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PVObf = factory();
})(typeof self !== "undefined" ? self : globalThis, function () {
  "use strict";

  /* ------------------------------ utils ---------------------------------- */

  const KEYWORDS = new Set([
    "and", "break", "continue", "do", "else", "elseif", "end", "false",
    "for", "function", "goto", "if", "in", "local", "nil", "not", "or",
    "repeat", "return", "then", "true", "until", "while",
  ]);
  const NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
  // Luau compound assignments: += -= *= /= //= %= ..= ^=
  const COMPOUND = new Set(["+=", "-=", "*=", "/=", "%=", "^=", "//=", "..=", "&=", "|=", "<<=", ">>="]);

  class PVError extends Error {
    constructor(msg, line) {
      super(line ? msg + " (line " + line + ")" : msg);
      this.name = "PVObfError";
    }
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function utf8Bytes(str) {
    if (typeof TextEncoder !== "undefined") {
      return Array.from(new TextEncoder().encode(str));
    }
    // fallback (very old environments)
    const out = [];
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c >= 0xd800 && c < 0xdc00 && i + 1 < str.length) {
        const c2 = str.charCodeAt(++i);
        c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }

  /* ---------------------------- tokenizer -------------------------------- */

  const TWO_OPS = new Set(["==", "~=", "<=", ">=", "..", "//", "<<", ">>", "+=", "-=", "*=", "/=", "%=", "^=", "&=", "|="]);
  const ONE_OPS = new Set([".", "+", "-", "*", "/", "%", "^", "#", "(", ")", "{", "}", "[", "]", ":", ";", ",", "<", ">", "&", "|", "~", "="]);

  function longBracketCount(src, i) {
    // src[i] === '['
    if (src[i] !== "[") return -1;
    let j = i + 1;
    let eq = 0;
    while (src[j] === "=") { eq++; j++; }
    if (src[j] === "[") return eq;
    return -1;
  }

  function decodeEscape(src, i) {
    // src[i] === '\\'
    const c = src[i + 1];
    if (c === undefined) throw new PVError("unfinished escape");
    if (c === "\n") return { ch: "\n", next: i + 2 }; // line continuation
    if (c === "n") return { ch: "\n", next: i + 2 };
    if (c === "t") return { ch: "\t", next: i + 2 };
    if (c === "r") return { ch: "\r", next: i + 2 };
    if (c === "a") return { ch: "\a", next: i + 2 };
    if (c === "b") return { ch: "\b", next: i + 2 };
    if (c === "f") return { ch: "\f", next: i + 2 };
    if (c === "v") return { ch: "\v", next: i + 2 };
    if (c === "\\" || c === '"' || c === "'") return { ch: c, next: i + 2 };
    if (c === "x") {
      const h = src.substr(i + 2, 2);
      if (!/^[0-9a-fA-F]{2}$/.test(h)) throw new PVError("invalid \\x escape");
      return { ch: String.fromCharCode(parseInt(h, 16)), next: i + 4 };
    }
    if (c === "u") {
      const close = src.indexOf("}", i + 2);
      if (close === -1) throw new PVError("unterminated \\u escape");
      const h = src.substr(i + 2, close - i - 2);
      if (!/^[0-9a-fA-F]+$/.test(h)) throw new PVError("invalid \\u escape");
      let cp = parseInt(h, 16);
      if (cp > 0x10ffff) throw new PVError("invalid \\u escape");
      let out = "";
      if (cp > 0xffff) {
        cp -= 0x10000;
        out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
      } else out = String.fromCharCode(cp);
      return { ch: out, next: close + 1 };
    }
    if (c >= "0" && c <= "9") {
      let d = c;
      let k = i + 2;
      while (k < i + 4 && src[k] >= "0" && src[k] <= "9") { d += src[k]; k++; }
      const code = parseInt(d, 10);
      if (code > 255) throw new PVError("decimal escape too large");
      return { ch: String.fromCharCode(code), next: k };
    }
    return { ch: c, next: i + 2 };
  }

  function tokenize(src) {
    const toks = [];
    const n = src.length;
    let i = 0;
    let line = 1;

    function push(t, v, raw) {
      toks.push({ t, v, line, raw: raw !== undefined ? raw : String(v) });
    }
    function fail(msg) {
      const last = toks.length ? toks[toks.length - 1] : null;
      throw new PVError(msg, last ? last.line : line);
    }
    function bumpText(text) {
      for (let k = 0; k < text.length; k++) if (text[k] === "\n") line++;
    }

    while (i < n) {
      const c = src[i];
      if (c === "\n") { line++; i++; continue; }
      if (c === " " || c === "\t" || c === "\r" || c === "\v" || c === "\f") { i++; continue; }

      // comments
      if (c === "-" && src[i + 1] === "-") {
        const lb = longBracketCount(src, i + 2);
        if (lb !== -1) {
          const openLen = 2 + lb + 1;
          const close = "]".repeat(1) ;
          const closeMark = "]".concat("=".repeat(lb), "]");
          let j = i + openLen;
          let found = -1;
          while (j < n) {
            if (src.substr(j, closeMark.length) === closeMark) { found = j; break; }
            if (src[j] === "\n") line++;
            j++;
          }
          if (found === -1) fail("unterminated comment");
          i = found + closeMark.length;
          continue;
        }
        while (i < n && src[i] !== "\n") i++;
        continue;
      }

      // long strings
      if (c === "[") {
        const lb = longBracketCount(src, i);
        if (lb !== -1) {
          const openMark = "[".concat("=".repeat(lb), "[");
          const closeMark = "]".concat("=".repeat(lb), "]");
          let j = i + openMark.length;
          let found = -1;
          let val = "";
          while (j < n) {
            if (src.substr(j, closeMark.length) === closeMark) { found = j; break; }
            if (src[j] === "\n") line++;
            val += src[j];
            j++;
          }
          if (found === -1) fail("unterminated long string");
          const raw = src.substr(i, found + closeMark.length - i);
          push("str", val, raw);
          i = found + closeMark.length;
          continue;
        }
      }

      // quoted strings
      if (c === '"' || c === "'") {
        let j = i + 1;
        let val = "";
        let startLine = line;
        while (j < n) {
          const ch = src[j];
          if (ch === "\n") fail("unterminated string");
          if (ch === "\\") {
            const e = decodeEscape(src, j);
            val += e.ch;
            j = e.next;
            continue;
          }
          if (ch === c) break;
          val += ch;
          j++;
        }
        if (j >= n) fail("unterminated string");
        const raw = src.substr(i, j - i + 1);
        push("str", val, raw);
        i = j + 1;
        continue;
      }

      // numbers
      if ((c >= "0" && c <= "9") || (c === "." && src[i + 1] >= "0" && src[i + 1] <= "9")) {
        let j = i;
        if (src[j] === "0" && (src[j + 1] === "x" || src[j + 1] === "X")) {
          j += 2;
          const start = j;
          while (j < n && /[0-9a-fA-F_]/.test(src[j])) j++;
          if (j === start) fail("invalid hex number");
          if (src[j] === ".") {
            j++;
            while (j < n && /[0-9a-fA-F_]/.test(src[j])) j++;
          }
          if (src[j] === "p" || src[j] === "P") {
            j++;
            if (src[j] === "+" || src[j] === "-") j++;
            if (!/[0-9]/.test(src[j] || "")) fail("invalid hex exponent");
            while (j < n && /[0-9_]/.test(src[j])) j++;
          }
          const text = src.substr(i, j - i);
          let value;
          try { value = Number(text.replace(/_/g, "")); } catch (e) { value = NaN; }
          if (!isFinite(value)) fail("invalid number " + text);
          push("num", value, text.replace(/_/g, ""));
          i = j;
          continue;
        }
        while (j < n && /[0-9_]/.test(src[j])) j++;
        if (src[j] === ".") {
          j++;
          while (j < n && /[0-9_]/.test(src[j])) j++;
        }
        if (src[j] === "e" || src[j] === "E") {
          let k = j + 1;
          if (src[k] === "+" || src[k] === "-") k++;
          if (/[0-9]/.test(src[k] || "")) {
            j = k;
            while (j < n && /[0-9_]/.test(src[j])) j++;
          }
        }
        const text = src.substr(i, j - i).replace(/_/g, "");
        const value = Number(text);
        if (!isFinite(value)) fail("invalid number " + text);
        push("num", value, text);
        i = j;
        continue;
      }

      // labels  ::name::
      if (c === ":" && src[i + 1] === ":") {
        let j = i + 2;
        const startLine = line;
        while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
        if (j === i + 2 || src.substr(j, 2) !== "::") fail("invalid label");
        push("label", src.substr(i + 2, j - i - 2));
        i = j + 2;
        continue;
      }

      // names / keywords
      if (/[A-Za-z_]/.test(c)) {
        let j = i + 1;
        while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
        const w = src.substr(i, j - i);
        if (KEYWORDS.has(w)) push("kw", w);
        else push("name", w);
        i = j;
        continue;
      }

      // operators
      const three = src.substr(i, 3);
      if (three === "..." || three === "//=" || three === "<<=" || three === ">>=" || three === "..=") {
        push("op", three);
        i += 3;
        continue;
      }
      const two = src.substr(i, 2);
      if (TWO_OPS.has(two)) { push("op", two); i += 2; continue; }
      if (ONE_OPS.has(c)) { push("op", c); i += 1; continue; }

      fail("unexpected character " + JSON.stringify(c));
    }
    toks.push({ t: "eof", v: "", line, raw: "" });
    return toks;
  }

  /* ----------------------------- parser ----------------------------------- */

  function parse(src) {
    const toks = tokenize(src);
    let p = 0;

    function peek(k) { return toks[Math.min(p + (k || 0), toks.length - 1)]; }
    function next() { return toks[p++]; }
    function at(type, v) { const t = peek(); return t.t === type && (v === undefined || t.v === v); }
    function eat(type, v) {
      const t = peek();
      if (t.t !== type || (v !== undefined && t.v !== v)) {
        const want = v !== undefined ? type + " '" + v + "'" : type;
        throw new PVError("expected " + want + " but found " + desc(t), t.line);
      }
      return next();
    }
    function desc(t) {
      if (t.t === "eof") return "end of file";
      return "'" + t.raw + "'";
    }

    const CMP = new Set(["<", ">", "<=", ">=", "~=", "=="]);

    /* ---- expressions ---- */

    function strNode(tok) { return { t: "str", value: tok.v, raw: tok.raw }; }

    function fnParamsBody() {
      let params = [];
      let varargs = false;
      if (at("op", "(")) {
        next();
        while (!at("op", ")")) {
          if (at("op", "...")) {
            next();
            varargs = true;
            if (!at("op", ")")) throw new PVError("expected ')' after '...'");
            break;
          }
          params.push(eat("name").v);
          if (at("op", ",")) next();
          else if (!at("op", ")")) throw new PVError("expected ',' or ')' in parameters");
        }
        eat("op", ")");
      } else if (at("name")) {
        params = [next().v]; // method shorthand: function(self)
      }
      const body = block();
      eat("kw", "end");
      return { t: "fn", params, varargs, body };
    }

    function tableExpr() {
      eat("op", "{");
      const fields = [];
      for (;;) {
        const t = peek();
        if (t.t === "op" && t.v === "}") {
          // empty table, or a trailing comma:  { 1, 2, }
          next();
          return { t: "table", fields, vararg: false };
        }
        if (t.t === "op" && t.v === "...") {
          next();
          fields.push({ key: null, value: { t: "dots" }, vararg: true });
          if (!at("op", "}")) throw new PVError("expected '}' after '...'");
          break;
        }
        if (t.t === "name" && peek(1).t === "op" && peek(1).v === "=") {
          next(); next();
          const value = expr();
          fields.push({ key: { t: "name", name: t.v, _field: true }, value });
        } else if (t.t === "op" && t.v === "[") {
          next();
          const key = expr();
          eat("op", "]");
          eat("op", "=");
          const value = expr();
          fields.push({ key, value, bracket: true });
        } else {
          const value = expr();
          fields.push({ key: null, value });
        }
        if (at("op", ",")) { next(); continue; }
        if (at("op", "}")) break;
        throw new PVError("expected ',' or '}' in table constructor");
      }
      eat("op", "}");
      return { t: "table", fields, vararg: fields.length > 0 && fields[fields.length - 1].vararg };
    }

    // callers must have positioned the parser just inside the args
    function callArgsBody() {
      if (at("op", ")")) { next(); return []; }
      const args = exprList();
      eat("op", ")");
      return args;
    }

    function parsePrimary() {
      const t = peek();
      if (t.t === "name") { next(); return { t: "name", name: t.v }; }
      if (t.t === "num") { next(); return { t: "num", value: t.v, text: t.raw }; }
      if (t.t === "str") { next(); return strNode(t); }
      if (t.t === "kw") {
        if (t.v === "nil") { next(); return { t: "nil" }; }
        if (t.v === "true" || t.v === "false") { next(); return { t: "bool", value: t.v === "true" }; }
        if (t.v === "function") { next(); return fnParamsBody(); }
        if (t.v === "if") { next(); return ifExprRest(); }
        throw new PVError("unexpected keyword '" + t.v + "' in expression", t.line);
      }
      if (t.t === "op") {
        if (t.v === "(") { next(); const e = expr(); eat("op", ")"); return e; }
        if (t.v === "{") return tableExpr();
        if (t.v === "...") { next(); return { t: "dots" }; }
      }
      throw new PVError("unexpected " + desc(t) + " in expression", t.line);
    }

    function parsePostfix() {
      let e = parsePrimary();
      for (;;) {
        const t = peek();
        if (t.t === "op" && t.v === ".") {
          next();
          const nm = eat("name");
          e = { t: "index", table: e, key: { t: "name", name: nm.v, _field: true }, dot: true };
        } else if (t.t === "op" && t.v === "[") {
          next();
          const k = expr();
          eat("op", "]");
          e = { t: "index", table: e, key: k, dot: false };
        } else if (t.t === "op" && t.v === "(") {
          next();
          const args = callArgsBody();
          e = { t: "call", fn: e, args, method: false, member: null };
        } else if (t.t === "op" && t.v === "{") {
          const args = [tableExpr()];
          e = { t: "call", fn: e, args, method: false, member: null };
        } else if (t.t === "str") {
          next();
          e = { t: "call", fn: e, args: [strNode(t)], method: false, member: null };
        } else if (t.t === "op" && t.v === ":") {
          next();
          const nm = eat("name");
          eat("op", "(");
          const args = callArgsBody();
          e = { t: "call", fn: e, args, method: true, member: nm.v };
        } else break;
      }
      return e;
    }

    function parsePower() {
      const l = parsePostfix();
      if (at("op", "^")) {
        next();
        const r = parseUnary();
        return { t: "bin", op: "^", left: l, right: r };
      }
      return l;
    }

    function parseUnary() {
      const t = peek();
      if (t.t === "kw" && t.v === "not") { next(); return { t: "un", op: "not", expr: parseUnary() }; }
      if (t.t === "op" && (t.v === "-" || t.v === "~" || t.v === "#")) {
        next();
        return { t: "un", op: t.v, expr: parsePower() };
      }
      return parsePower();
    }

    function bin(op, l, r) { return { t: "bin", op, left: l, right: r }; }

    function parseMul() {
      let l = parseUnary();
      for (;;) {
        const t = peek();
        if (t.t === "op" && (t.v === "*" || t.v === "/" || t.v === "//" || t.v === "%")) {
          next(); l = bin(t.v, l, parseUnary());
        } else return l;
      }
    }
    function parseAdd() {
      let l = parseMul();
      for (;;) {
        const t = peek();
        if (t.t === "op" && (t.v === "+" || t.v === "-")) { next(); l = bin(t.v, l, parseMul()); }
        else return l;
      }
    }
    function parseShift() {
      let l = parseAdd();
      for (;;) {
        const t = peek();
        if (t.t === "op" && (t.v === "<<" || t.v === ">>")) { next(); l = bin(t.v, l, parseAdd()); }
        else return l;
      }
    }
    function parseBitAnd() {
      let l = parseShift();
      for (;;) {
        const t = peek();
        if (t.t === "op" && t.v === "&") { next(); l = bin("&", l, parseShift()); }
        else return l;
      }
    }
    function parseBitXor() {
      let l = parseBitAnd();
      for (;;) {
        const t = peek();
        if (t.t === "op" && t.v === "~") { next(); l = bin("~", l, parseBitAnd()); }
        else return l;
      }
    }
    function parseBitOr() {
      let l = parseBitXor();
      for (;;) {
        const t = peek();
        if (t.t === "op" && t.v === "|") { next(); l = bin("|", l, parseBitXor()); }
        else return l;
      }
    }
    function parseCmp() {
      let l = parseConcat();
      for (;;) {
        const t = peek();
        if (t.t === "op" && CMP.has(t.v)) { next(); l = bin(t.v, l, parseConcat()); }
        else return l;
      }
    }
    function parseConcat() {
      // right-associative, below '|', above comparisons
      let l = parseBitOr();
      for (;;) {
        if (at("op", "..")) { next(); l = bin("..", l, parseConcat()); }
        else return l;
      }
    }
    function parseAnd() {
      let l = parseCmp();
      for (;;) {
        if (at("kw", "and")) { next(); l = bin("and", l, parseCmp()); }
        else return l;
      }
    }
    function parseOr() {
      let l = parseAnd();
      for (;;) {
        if (at("kw", "or")) { next(); l = bin("or", l, parseAnd()); }
        else return l;
      }
    }

    function ifExprRest() {
      // 'if' already consumed
      const cond = expr();
      eat("kw", "then");
      const th = expr();
      const elseif = [];
      while (at("kw", "elseif")) {
        next();
        const c2 = expr();
        eat("kw", "then");
        elseif.push({ cond: c2, then: expr() });
      }
      let el = null;
      if (at("kw", "else")) { next(); el = expr(); }
      return { t: "ifexpr", cond, then: th, elseif, else: el };
    }

    function expr() {
      if (at("kw", "if")) { next(); return ifExprRest(); }
      return parseOr();
    }

    function exprList() {
      const list = [expr()];
      while (at("op", ",")) { next(); list.push(expr()); }
      return list;
    }

    /* ---- statements ---- */

    function block() {
      const stmts = [];
      for (;;) {
        const t = peek();
        if (t.t === "eof") break;
        if (t.t === "kw" && (t.v === "end" || t.v === "else" || t.v === "elseif" || t.v === "until")) break;
        if (t.t === "op" && t.v === ";") { next(); continue; }
        stmts.push(statement());
      }
      return stmts;
    }

    function validateLvalue(e) {
      if (e.t === "name") return;
      if (e.t === "index") { validateLvalue(e.table); return; }
      throw new PVError("cannot assign to this expression");
    }

    function statement() {
      const t = peek();
      if (t.t === "label") { next(); return { t: "label", name: t.v }; }
      if (t.t === "kw") {
        switch (t.v) {
          case "local": {
            next();
            if (at("kw", "function")) {
              // local function f() ... end — MUST keep this form: in Luau a
              // local's scope starts after the whole statement, so
              // `local f = function() f() end` cannot see f, while
              // `local function f() f() end` can (recursion).
              next();
              const nm = eat("name");
              const fn = fnParamsBody();
              return { t: "local", names: [nm.v], exprs: [fn], bare: false, localFn: true };
            }
            const names = [eat("name").v];
            while (at("op", ",")) { next(); names.push(eat("name").v); }
            let bare = true;
            let exprs = [];
            if (at("op", "=")) { next(); bare = false; exprs = exprList(); }
            return { t: "local", names, exprs, bare };
          }
          case "function": {
            next();
            const root = eat("name");
            const fields = [];
            while (at("op", ".")) { next(); fields.push({ name: eat("name").v }); }
            if (at("op", ":")) { next(); fields.push({ name: eat("name").v, method: true }); }
            const fn = fnParamsBody();
            return { t: "func", name: { root: root.v, fields }, params: fn.params, varargs: fn.varargs, body: fn.body };
          }
          case "if": {
            next();
            const cond = expr();
            eat("kw", "then");
            const th = block();
            const elseif = [];
            while (at("kw", "elseif")) {
              next();
              const c2 = expr();
              eat("kw", "then");
              elseif.push({ cond: c2, then: block() });
            }
            let el = [];
            if (at("kw", "else")) { next(); el = block(); }
            eat("kw", "end");
            return { t: "if", cond, then: th, elseif, else: el };
          }
          case "while": {
            next();
            const cond = expr();
            eat("kw", "do");
            const body = block();
            eat("kw", "end");
            return { t: "while", cond, body };
          }
          case "repeat": {
            next();
            const body = block();
            eat("kw", "until");
            const cond = expr();
            return { t: "repeat", cond, body };
          }
          case "for": {
            next();
            const nm = eat("name");
            if (at("op", "=")) {
              next();
              const start = expr();
              eat("op", ",");
              const limit = expr();
              let step = null;
              if (at("op", ",")) { next(); step = expr(); }
              eat("kw", "do");
              const body = block();
              eat("kw", "end");
              return { t: "nfor", name: nm.v, start, limit, step, body };
            }
            const names = [nm.v];
            while (at("op", ",")) { next(); names.push(eat("name").v); }
            eat("kw", "in");
            const exprs = exprList();
            eat("kw", "do");
            const body = block();
            eat("kw", "end");
            return { t: "gfor", names, exprs, body };
          }
          case "return": {
            next();
            const retTok = peek(-0); // (informational)
            let values = [];
            const t2 = peek();
            const stop = t2.t === "eof" ||
              (t2.t === "kw" && (t2.v === "end" || t2.v === "else" || t2.v === "elseif" || t2.v === "until")) ||
              (t2.t === "op" && (t2.v === ")" || t2.v === "]" || t2.v === "}"));
            if (!stop) {
              values = exprList();
              const nt = peek();
              const lastTok = toks[p - 1];
              const stopAfter = nt.t === "eof" ||
                (nt.t === "kw" && (nt.v === "end" || nt.v === "else" || nt.v === "elseif" || nt.v === "until")) ||
                (nt.t === "op" && (nt.v === ")" || nt.v === "]" || nt.v === "}"));
              if (nt.line === lastTok.line && !stopAfter) {
                throw new PVError("unexpected symbol after return", nt.line);
              }
            }
            return { t: "return", values };
          }
          case "break": next(); return { t: "break" };
          case "continue": next(); return { t: "continue" };
          case "goto": {
            next();
            const nm = eat("name");
            return { t: "goto", label: nm.v };
          }
          default:
            throw new PVError("unexpected keyword '" + t.v + "'", t.line);
        }
      }
      // expression statement / assignment
      const first = expr();
      const t2 = peek();
      if (t2.t === "op" && t2.v === ",") {
        // multi-target assignment:  a, b, c = 1, 2, 3
        const targets = [first];
        next();
        for (;;) {
          targets.push(expr());
          if (at("op", ",")) next();
          else break;
        }
        if (!at("op", "=")) throw new PVError("expected '=' in multi-assignment");
        next();
        const values = exprList();
        targets.forEach(validateLvalue);
        return { t: "assign", targets, values, op: "=" };
      }
      if (t2.t === "op" && (t2.v === "=" || COMPOUND.has(t2.v))) {
        const op = next().v;
        if (op === "=") {
          const targets = [first];
          while (at("op", ",")) { next(); targets.push(expr()); }
          const values = exprList();
          targets.forEach(validateLvalue);
          return { t: "assign", targets, values, op: "=" };
        }
        validateLvalue(first);
        const value = expr();
        if (at("op", ",")) throw new PVError("unexpected ',' after compound assignment");
        return { t: "assign", targets: [first], values: [value], op };
      }
      if (t2.t === "op" && t2.v === ";") next();
      if (first.t !== "call") throw new PVError("expected function call, found expression");
      return { t: "stmt", expr: first };
    }

    const chunk = { t: "chunk", stmts: block() };
    if (p < toks.length - 1) throw new PVError("unexpected " + desc(peek()));
    return chunk;
  }

  /* ------------------------- small AST helpers ---------------------------- */

  const num = (v) => ({ t: "num", value: v, text: String(v) });
  const name = (n) => ({ t: "name", name: n });
  const strRaw = (v) => ({ t: "str", value: v, raw: luaStrLiteral(utf8Bytes(v)) });
  const binNode = (op, l, r) => ({ t: "bin", op, left: l, right: r });
  const localOf = (n, e) => ({ t: "local", names: [n], exprs: [e], bare: false });
  const assignOp = (t, v, op) => ({ t: "assign", targets: [t], values: [v], op: op || "=" });

  function luaStrLiteral(bytes) {
    let out = '"';
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if (b >= 33 && b <= 126 && b !== 34 && b !== 92) out += String.fromCharCode(b);
      else out += "\\x" + b.toString(16).padStart(2, "0");
    }
    return out + '"';
  }

  /* ------------------------------ contexts -------------------------------- */

  function makeCtx(rng) {
    return {
      rng,
      globals: new Set(),
      allNames: new Set(),
      usedFresh: new Set(),
      freshName: function () {
        const chars = "abcdefghijklmnopqrstuvwxyz";
        for (let tries = 0; tries < 500; tries++) {
          const len = tries < 26 ? 1 : 2;
          let s = "";
          for (let k = 0; k < len; k++) s += chars[Math.floor(rng() * 26)];
          if (KEYWORDS.has(s) || this.allNames.has(s) || this.usedFresh.has(s)) continue;
          this.usedFresh.add(s);
          return s;
        }
        // practically unreachable: fall back to numbered
        let s = "q" + this.usedFresh.size;
        while (this.allNames.has(s) || this.usedFresh.has(s)) s += "z";
        this.usedFresh.add(s);
        return s;
      },
    };
  }

  function collectAllNames(ast) {
    const seen = new Set();
    function xExpr(e) {
      if (!e) return;
      switch (e.t) {
        case "name": seen.add(e.name); break;
        case "index": xExpr(e.table); if (!e.dot) xExpr(e.key); else seen.add(e.key.name); break;
        case "call": xExpr(e.fn); e.args.forEach(xExpr); break;
        case "un": xExpr(e.expr); break;
        case "bin": xExpr(e.left); xExpr(e.right); break;
        case "table":
          e.fields.forEach((f) => { if (f.key) { if (f.key.t === "name") seen.add(f.key.name); else xExpr(f.key); } xExpr(f.value); });
          break;
        case "fn": e.body.forEach(xStmt); break;
        case "ifexpr":
          xExpr(e.cond); xExpr(e.then);
          e.elseif.forEach((u) => { xExpr(u.cond); xExpr(u.then); });
          if (e.else) xExpr(e.else);
          break;
      }
    }
    function xStmt(s) {
      if (!s) return;
      switch (s.t) {
        case "local": s.names.forEach((n) => seen.add(n)); s.exprs.forEach(xExpr); break;
        case "assign": s.targets.forEach(xExpr); s.values.forEach(xExpr); break;
        case "if": xExpr(s.cond); s.then.forEach(xStmt); s.elseif.forEach((u) => { xExpr(u.cond); u.then.forEach(xStmt); }); s.else.forEach(xStmt); break;
        case "while": xExpr(s.cond); s.body.forEach(xStmt); break;
        case "repeat": s.body.forEach(xStmt); xExpr(s.cond); break;
        case "nfor": seen.add(s.name); xExpr(s.start); xExpr(s.limit); if (s.step) xExpr(s.step); s.body.forEach(xStmt); break;
        case "gfor": s.names.forEach((n) => seen.add(n)); s.exprs.forEach(xExpr); s.body.forEach(xStmt); break;
        case "return": s.values.forEach(xExpr); break;
        case "stmt": xExpr(s.expr); break;
        case "func":
          seen.add(s.name.root);
          s.name.fields.forEach((f) => seen.add(f.name));
          s.params.forEach((n) => seen.add(n));
          s.body.forEach(xStmt);
          break;
        case "goto": seen.add(s.label); break;
        case "label": seen.add(s.name); break;
      }
    }
    ast.stmts.forEach(xStmt);
    return seen;
  }

  /* --------------------------- pass: mangle -------------------------------- */

  function manglePass(ast, ctx) {
    const scopes = [];
    const labelScopes = [];

    function newScope() { scopes.push(new Map()); labelScopes.push(new Map()); }
    function popScope() { scopes.pop(); labelScopes.pop(); }
    // assigns fresh names and rewrites the array in place
    function declare(namesArr) {
      const sc = scopes[scopes.length - 1];
      for (let i = 0; i < namesArr.length; i++) {
        const nn = ctx.freshName();
        sc.set(namesArr[i], nn);
        namesArr[i] = nn;
      }
    }
    function resolve(nm, skipInner) {
      for (let i = scopes.length - 1 - (skipInner ? 1 : 0); i >= 0; i--) {
        const m = scopes[i].get(nm);
        if (m) return m;
      }
      return null;
    }
    function renameLabel(nm) {
      const l = labelScopes[labelScopes.length - 1];
      if (!l.has(nm)) l.set(nm, ctx.freshName());
      return l.get(nm);
    }

    newScope();
    let depth = 0; // 0 = directly in a local's own initializer
    let declaring = new Set();

    function xExpr(e) {
      if (!e) return e;
      switch (e.t) {
        case "name": {
          const skip = declaring.has(e.name) && depth === 0;
          const r = resolve(e.name, skip);
          if (r) e.name = r;
          else ctx.globals.add(e.name);
          break;
        }
        case "index":
          e.table = xExpr(e.table);
          if (e.dot) { /* field name: string, not a variable */ }
          else e.key = xExpr(e.key);
          break;
        case "call":
          e.fn = xExpr(e.fn);
          e.args = e.args.map(xExpr);
          break;
        case "un": e.expr = xExpr(e.expr); break;
        case "bin": e.left = xExpr(e.left); e.right = xExpr(e.right); break;
        case "table":
          e.fields.forEach((f) => {
            if (f.key) {
              if (f.key.t !== "name" || !f.key._field) f.key = xExpr(f.key);
            }
            f.value = xExpr(f.value);
          });
          break;
        case "fn": {
          depth++;
          const savedDeclaring = declaring;
          declaring = new Set();
          newScope();
          declare(e.params);
          e.body = xBlock(e.body);
          popScope();
          declaring = savedDeclaring;
          depth--;
          break;
        }
        case "ifexpr":
          e.cond = xExpr(e.cond);
          e.then = xExpr(e.then);
          e.elseif.forEach((u) => { u.cond = xExpr(u.cond); u.then = xExpr(u.then); });
          if (e.else) e.else = xExpr(e.else);
          break;
      }
      return e;
    }

    function xStmt(s) {
      if (!s) return s;
      switch (s.t) {
        case "local": {
          // Lua scoping: the local exists for the rest of the block (so
          // closures in the initializer capture it), but direct reads in the
          // initializer see the previous scope. We declare up-front and use
          // depth/declaring to implement the direct-read exception.
          if (!s.bare) {
            declare(s.names);
            const savedDeclaring = declaring;
            const savedDepth = depth;
            depth = 0;
            declaring = new Set(s.names);
            s.exprs = s.exprs.map(xExpr);
            declaring = savedDeclaring;
            depth = savedDepth;
          } else {
            declare(s.names);
          }
          break;
        }
        case "assign":
          s.targets = s.targets.map(xExpr);
          s.values = s.values.map(xExpr);
          break;
        case "if":
          s.cond = xExpr(s.cond);
          s.then = xBlock(s.then);
          s.elseif.forEach((u) => { u.cond = xExpr(u.cond); u.then = xBlock(u.then); });
          s.else = xBlock(s.else);
          break;
        case "while":
          s.cond = xExpr(s.cond);
          s.body = xBlock(s.body);
          break;
        case "repeat":
          s.body = xBlock(s.body);
          s.cond = xExpr(s.cond);
          break;
        case "nfor": {
          s.start = xExpr(s.start);
          s.limit = xExpr(s.limit);
          if (s.step) s.step = xExpr(s.step);
          newScope();
          const nmArr = [s.name];
          declare(nmArr);
          s.name = nmArr[0];
          s.body = xBlock(s.body);
          popScope();
          break;
        }
        case "gfor":
          s.exprs = s.exprs.map(xExpr);
          newScope();
          declare(s.names);
          s.body = xBlock(s.body);
          popScope();
          break;
        case "return":
          s.values = s.values.map(xExpr);
          break;
        case "stmt":
          s.expr = xExpr(s.expr);
          break;
        case "func": {
          const root = { t: "name", name: s.name.root };
          xExpr(root);
          s.name.root = root.name;
          newScope();
          declare(s.params);
          s.body = xBlock(s.body);
          popScope();
          break;
        }
        case "goto": s.label = renameLabel(s.label); break;
        case "label": s.name = renameLabel(s.name); break;
      }
      return s;
    }

    function xBlock(bs) { return bs.map(xStmt); }
    ast.stmts = xBlock(ast.stmts);
    popScope();
  }

  /* -------------------------- pass: globals -------------------------------- */

  const PROTECTED_GLOBALS = new Set(["_G", "_ENV", "rawget", "rawset", "rawlen"]);

  function globalsPass(ast, ctx) {
    const gs = Array.from(ctx.globals).filter(
      (g) => NAME_RE.test(g) && !PROTECTED_GLOBALS.has(g) && !ctx.usedFresh.has(g)
    );
    if (gs.length === 0) return 0;
    ctx.redirectedGlobals = new Set(gs);
    const gName = ctx.freshName();
    const order = shuffle(gs.slice(), ctx.rng);
    const fields = order.map((g) => ({
      key: strRaw(g),
      value: { t: "name", name: g, _rawGlobal: true },
    }));
    const gStmt = localOf(gName, { t: "table", fields, vararg: false });

    function repExpr(e) {
      if (!e) return e;
      switch (e.t) {
        case "name":
          if (!e._rawGlobal && ctx.redirectedGlobals.has(e.name)) {
            return { t: "index", table: name(gName), key: strRaw(e.name), dot: false };
          }
          break;
        case "index":
          e.table = repExpr(e.table);
          if (!e.dot) e.key = repExpr(e.key);
          break;
        case "call":
          e.fn = repExpr(e.fn);
          e.args = e.args.map(repExpr);
          break;
        case "un": e.expr = repExpr(e.expr); break;
        case "bin": e.left = repExpr(e.left); e.right = repExpr(e.right); break;
        case "table":
          e.fields.forEach((f) => { if (f.key && !(f.key.t === "name" && f.key._field)) f.key = repExpr(f.key); f.value = repExpr(f.value); });
          break;
        case "fn": e.body = repStmts(e.body); break;
        case "ifexpr":
          e.cond = repExpr(e.cond); e.then = repExpr(e.then);
          e.elseif.forEach((u) => { u.cond = repExpr(u.cond); u.then = repExpr(u.then); });
          if (e.else) e.else = repExpr(e.else);
          break;
      }
      return e;
    }
    function repStmts(stmts) {
      return stmts.map((s) => repStmt(s));
    }
    function repStmt(s) {
      if (!s) return s;
      switch (s.t) {
        case "local": if (!s.bare) s.exprs = s.exprs.map(repExpr); break;
        case "assign": s.targets = s.targets.map(repExpr); s.values = s.values.map(repExpr); break;
        case "if":
          s.cond = repExpr(s.cond);
          s.then = repStmts(s.then);
          s.elseif.forEach((u) => { u.cond = repExpr(u.cond); u.then = repStmts(u.then); });
          s.else = repStmts(s.else);
          break;
        case "while": s.cond = repExpr(s.cond); s.body = repStmts(s.body); break;
        case "repeat": s.body = repStmts(s.body); s.cond = repExpr(s.cond); break;
        case "nfor":
          s.start = repExpr(s.start); s.limit = repExpr(s.limit);
          if (s.step) s.step = repExpr(s.step);
          s.body = repStmts(s.body);
          break;
        case "gfor": s.exprs = s.exprs.map(repExpr); s.body = repStmts(s.body); break;
        case "return": s.values = s.values.map(repExpr); break;
        case "stmt": s.expr = repExpr(s.expr); break;
        case "func": {
          s.body = repStmts(s.body);
          const rootRep = repExpr({ t: "name", name: s.name.root });
          if (rootRep.t === "name") {
            s.name.root = rootRep.name;
          } else {
            // global root (or indexed root): `function g.h()` -> `g[enc h] = function() ... end`
            let target = rootRep;
            for (const f of s.name.fields) {
              target = { t: "index", table: target, key: strRaw(f.name), dot: false };
            }
            const fnExpr = { t: "fn", params: s.params, varargs: s.varargs, body: s.body };
            s.t = "assign";
            s.targets = [target];
            s.values = [fnExpr];
            delete s.name;
            delete s.params;
            delete s.varargs;
            delete s.body;
          }
          break;
        }
      }
      return s;
    }

    ast.stmts = [gStmt, ...ast.stmts.map((s) => s === gStmt ? s : repStmt(s))];
    return gs.length;
  }

  /* -------------------------- pass: strings -------------------------------- */

  function stringsPass(ast, ctx) {
    const Tname = ctx.freshName();
    const Dname = ctx.freshName();
    const entries = []; // { bytes, key, len }
    const index = new Map();

    function enc(value) {
      let e = index.get(value);
      if (!e) {
        const bytes = utf8Bytes(value);
        const klen = 2 + Math.floor(ctx.rng() * 6);
        const key = [];
        for (let i = 0; i < klen; i++) key.push(1 + Math.floor(ctx.rng() * 254));
        // byte offset (1-based) of this entry's payload inside the blob:
        // every earlier entry occupies 2 (len prefix) + len bytes
        let pos = 3; // first entry starts after its own 2-byte prefix
        for (const p of entries) pos += 2 + p.len;
        e = { bytes, key, len: bytes.length, pos };
        entries.push(e);
        index.set(value, e);
      }
      return e;
    }

    function callD(e) {
      const args = [num(e.pos), num(e.len)];
      e.key.forEach((k) => args.push(num(k)));
      return { t: "call", fn: name(Dname), args, method: false, member: null };
    }

    // first: turn field names (a.b / {b = }) into bracket string keys
    (function dotConvertStmts(stmts) {
      stmts.forEach(dotConvertStmt);
    })(ast.stmts);
    function dotConvertExpr(e) {
      if (!e) return;
      switch (e.t) {
        case "index":
          dotConvertExpr(e.table);
          if (e.dot && e.key.t === "name") { e.key = strRaw(e.key.name); e.dot = false; }
          else if (!e.dot) dotConvertExpr(e.key);
          break;
        case "call":
          dotConvertExpr(e.fn);
          e.args.forEach(dotConvertExpr);
          break;
        case "un": dotConvertExpr(e.expr); break;
        case "bin": dotConvertExpr(e.left); dotConvertExpr(e.right); break;
        case "table":
          e.fields.forEach((f) => {
            if (f.key && f.key.t === "name" && f.key._field) f.key = strRaw(f.key.name);
            else if (f.key) dotConvertExpr(f.key);
            dotConvertExpr(f.value);
          });
          break;
        case "fn": e.body.forEach(dotConvertStmt); break;
        case "ifexpr":
          dotConvertExpr(e.cond); dotConvertExpr(e.then);
          e.elseif.forEach((u) => { dotConvertExpr(u.cond); dotConvertExpr(u.then); });
          if (e.else) dotConvertExpr(e.else);
          break;
      }
    }
    function dotConvertStmt(s) {
      if (!s) return;
      switch (s.t) {
        case "local": if (!s.bare) s.exprs.forEach(dotConvertExpr); break;
        case "assign": s.targets.forEach(dotConvertExpr); s.values.forEach(dotConvertExpr); break;
        case "if":
          dotConvertExpr(s.cond); s.then.forEach(dotConvertStmt);
          s.elseif.forEach((u) => { dotConvertExpr(u.cond); u.then.forEach(dotConvertStmt); });
          s.else.forEach(dotConvertStmt);
          break;
        case "while": dotConvertExpr(s.cond); s.body.forEach(dotConvertStmt); break;
        case "repeat": s.body.forEach(dotConvertStmt); dotConvertExpr(s.cond); break;
        case "nfor":
          dotConvertExpr(s.start); dotConvertExpr(s.limit);
          if (s.step) dotConvertExpr(s.step);
          s.body.forEach(dotConvertStmt);
          break;
        case "gfor": s.exprs.forEach(dotConvertExpr); s.body.forEach(dotConvertStmt); break;
        case "return": s.values.forEach(dotConvertExpr); break;
        case "stmt": dotConvertExpr(s.expr); break;
        case "func": {
          if (s.name.fields.length > 0) {
            // `function a.b.c()` -> `a[enc b][enc c] = function() ... end`
            let target = { t: "name", name: s.name.root };
            for (const f of s.name.fields) {
              target = { t: "index", table: target, key: strRaw(f.name), dot: false };
            }
            const fnExpr = { t: "fn", params: s.params, varargs: s.varargs, body: s.body };
            const as = { t: "assign", targets: [target], values: [fnExpr] };
            s.t = "assign";
            s.targets = as.targets;
            s.values = as.values;
            delete s.name; delete s.params; delete s.varargs; delete s.body;
          } else {
            s.body.forEach(dotConvertStmt);
          }
          break;
        }
      }
    }

    // second: replace string literals with decode calls
    function repExpr(e) {
      if (!e) return e;
      switch (e.t) {
        case "str":
          if (e.noenc) return e;
          return callD(enc(e.value));
        case "index":
          e.table = repExpr(e.table);
          if (e.dot) {
            if (e.key.t === "name") { e.key = repExpr(strRaw(e.key.name)); e.dot = false; }
          } else e.key = repExpr(e.key);
          break;
        case "call":
          e.fn = repExpr(e.fn);
          e.args = e.args.map(repExpr);
          break;
        case "un": e.expr = repExpr(e.expr); break;
        case "bin": e.left = repExpr(e.left); e.right = repExpr(e.right); break;
        case "table":
          e.fields.forEach((f) => {
            if (f.key) {
              if (f.key.t === "name" && f.key._field) f.key = repExpr(strRaw(f.key.name));
              else f.key = repExpr(f.key);
            }
            f.value = repExpr(f.value);
          });
          break;
        case "fn": e.body = repStmts(e.body); break;
        case "ifexpr":
          e.cond = repExpr(e.cond); e.then = repExpr(e.then);
          e.elseif.forEach((u) => { u.cond = repExpr(u.cond); u.then = repExpr(u.then); });
          if (e.else) e.else = repExpr(e.else);
          break;
      }
      return e;
    }
    function repStmts(stmts) { return stmts.map((s) => repStmt(s)); }
    function repStmt(s) {
      if (!s) return s;
      switch (s.t) {
        case "local": if (!s.bare) s.exprs = s.exprs.map(repExpr); break;
        case "assign": s.targets = s.targets.map(repExpr); s.values = s.values.map(repExpr); break;
        case "if":
          s.cond = repExpr(s.cond); s.then = repStmts(s.then);
          s.elseif.forEach((u) => { u.cond = repExpr(u.cond); u.then = repStmts(u.then); });
          s.else = repStmts(s.else);
          break;
        case "while": s.cond = repExpr(s.cond); s.body = repStmts(s.body); break;
        case "repeat": s.body = repStmts(s.body); s.cond = repExpr(s.cond); break;
        case "nfor":
          s.start = repExpr(s.start); s.limit = repExpr(s.limit);
          if (s.step) s.step = repExpr(s.step);
          s.body = repStmts(s.body);
          break;
        case "gfor": s.exprs = s.exprs.map(repExpr); s.body = repStmts(s.body); break;
        case "return": s.values = s.values.map(repExpr); break;
        case "stmt": s.expr = repExpr(s.expr); break;
        case "func":
          s.name.root = (repExpr({ t: "name", name: s.name.root }) || {}).name || s.name.root;
          s.body = repStmts(s.body);
          break;
      }
      return s;
    }
    ast.stmts = ast.stmts.map((s) => repStmt(s));

    if (entries.length === 0) return { strings: 0, Tname, Dname };

    // build the obfuscated byte blob
    const data = [];
    for (const e of entries) {
      data.push((e.len >> 8) & 255, e.len & 255);
      for (let j = 0; j < e.bytes.length; j++) {
        data.push(((e.bytes[j] ^ e.key[j % e.key.length]) + j * 13) & 255);
      }
    }
    // junk entries (never referenced)
    const junk = 3 + Math.floor(ctx.rng() * 5);
    for (let i = 0; i < junk; i++) {
      const l = 1 + Math.floor(ctx.rng() * 24);
      data.push((l >> 8) & 255, l & 255);
      for (let j = 0; j < l; j++) data.push(1 + Math.floor(ctx.rng() * 254));
    }

    const Tstmt = localOf(Tname, { t: "str", value: "", raw: luaStrLiteral(data), noenc: true });
    const dSrc =
      "local function " + Dname + "(s, n, ...) " +
      "local k = {...} " +
      "local o = {} " +
      "for i = 0, n - 1 do " +
      "o[i + 1] = string.char(bit32.bxor((" + Tname + ":byte(s + i) - i * 13) % 256, k[i % #k + 1])) " +
      "end " +
      "return table.concat(o) " +
      "end";
    const dAst = parse(dSrc);
    // final order: [T blob, decode fn, ...rest]
    const rest = ast.stmts;
    ast.stmts = [Tstmt, ...dAst.stmts, ...rest];

    return { strings: entries.length, Tname, Dname };
  }

  /* ------------------------- pass: constants -------------------------------- */

  function constantsPass(ast, ctx) {
    function repExpr(e) {
      if (!e) return e;
      if (e.t === "num") {
        const v = e.value;
        if (Number.isInteger(v) && Math.abs(v) < 1073741824 && v !== 0 && v !== 1 && ctx.rng() < 0.75) {
          const r = ctx.rng();
          const a = Math.abs(v);
          if (r < 0.22) {
            e.text = (v < 0 ? "-0x" : "0x") + a.toString(16);
            e.effPrec = 12;
          } else if (r < 0.44 && a > 1) {
            const part = 1 + Math.floor(ctx.rng() * (a - 1));
            e.text = "(" + part + " + " + (v - part) + ")";
            e.effPrec = 12; // fully parenthesized group
          } else if (r < 0.62) {
            e.text = "(" + v + ") * 1";
            e.effPrec = 9; // top-level operator is *
          } else if (r < 0.81) {
            e.text = "(" + v + ") - 0";
            e.effPrec = 8; // top-level operator is -
          } else {
            e.text = "(" + v + ")";
            e.effPrec = 12;
          }
        }
        return e;
      }
      switch (e.t) {
        case "index": e.table = repExpr(e.table); if (!e.dot) e.key = repExpr(e.key); break;
        case "call": e.fn = repExpr(e.fn); e.args = e.args.map(repExpr); break;
        case "un": e.expr = repExpr(e.expr); break;
        case "bin": e.left = repExpr(e.left); e.right = repExpr(e.right); break;
        case "table":
          e.fields.forEach((f) => { if (f.key && !(f.key.t === "name" && f.key._field)) f.key = repExpr(f.key); f.value = repExpr(f.value); });
          break;
        case "fn": e.body = repStmts(e.body); break;
        case "ifexpr":
          e.cond = repExpr(e.cond); e.then = repExpr(e.then);
          e.elseif.forEach((u) => { u.cond = repExpr(u.cond); u.then = repExpr(u.then); });
          if (e.else) e.else = repExpr(e.else);
          break;
      }
      return e;
    }
    function repStmts(stmts) { return stmts.map((s) => repStmt(s)); }
    function repStmt(s) {
      if (!s) return s;
      switch (s.t) {
        case "local": if (!s.bare) s.exprs = s.exprs.map(repExpr); break;
        case "assign": s.targets = s.targets.map(repExpr); s.values = s.values.map(repExpr); break;
        case "if":
          s.cond = repExpr(s.cond); s.then = repStmts(s.then);
          s.elseif.forEach((u) => { u.cond = repExpr(u.cond); u.then = repStmts(u.then); });
          s.else = repStmts(s.else);
          break;
        case "while": s.cond = repExpr(s.cond); s.body = repStmts(s.body); break;
        case "repeat": s.body = repStmts(s.body); s.cond = repExpr(s.cond); break;
        case "nfor":
          s.start = repExpr(s.start); s.limit = repExpr(s.limit);
          if (s.step) s.step = repExpr(s.step);
          s.body = repStmts(s.body);
          break;
        case "gfor": s.exprs = s.exprs.map(repExpr); s.body = repStmts(s.body); break;
        case "return": s.values = s.values.map(repExpr); break;
        case "stmt": s.expr = repExpr(s.expr); break;
        case "func": s.body = repStmts(s.body); break;
      }
      return s;
    }
    ast.stmts = ast.stmts.map((s) => repStmt(s));
  }

  /* --------------------- passes: dead code + CFF --------------------------- */

  function deadStmts(ctx, k) {
    const out = [];
    for (let i = 0; i < k; i++) {
      const r = Math.floor(ctx.rng() * 4);
      const v = ctx.freshName();
      if (r === 0) {
        out.push(localOf(v, binNode("*", num(1 + Math.floor(ctx.rng() * 9)), num(0))));
      } else if (r === 1) {
        out.push({
          t: "if",
          cond: binNode(">", num(1), num(2)),
          then: [localOf(ctx.freshName(), num(3))],
          elseif: [],
          else: [],
        });
      } else if (r === 2) {
        out.push({
          t: "while",
          cond: { t: "bool", value: false },
          body: [localOf(ctx.freshName(), num(1))],
        });
      } else {
        out.push(localOf(v, binNode("and", { t: "bool", value: false }, { t: "bool", value: true })));
      }
    }
    return out;
  }

  function wrapCond(e, ctx) {
    const r = ctx.rng();
    if (r < 0.3) return binNode("or", e, { t: "bool", value: false });
    if (r < 0.6) return binNode("and", e, { t: "bool", value: true });
    if (r < 0.85) return e;
    return binNode("and", binNode("or", e, { t: "bool", value: false }), { t: "bool", value: true });
  }

  // A break/continue is "free" when it targets a loop OUTSIDE the block we
  // would wrap (it is not inside a loop statement and not inside a function).
  function hasFreeBreak(stmt) {
    if (!stmt) return false;
    switch (stmt.t) {
      case "break":
      case "continue":
        return true;
      case "while":
      case "repeat":
      case "nfor":
      case "gfor":
      case "fn":
      case "func":
        return false; // boundary
      case "if":
        return stmt.then.some(hasFreeBreak) ||
          stmt.elseif.some((u) => u.then.some(hasFreeBreak)) ||
          stmt.else.some(hasFreeBreak);
      default:
        return false; // no break/continue can hide in other statements
    }
  }
  function hasBreakers(stmts) {
    return stmts.some(
      (s) => s.t === "break" || s.t === "continue" || s.t === "goto" || s.t === "label" || hasFreeBreak(s)
    );
  }

  // every name referenced anywhere inside a statement (directly or in any
  // nested scope/function)
  function allRefsInStmt(s) {
    const refs = new Set();
    function xExpr(e) {
      if (!e) return;
      switch (e.t) {
        case "name": refs.add(e.name); break;
        case "index": xExpr(e.table); if (!e.dot) xExpr(e.key); break;
        case "call": xExpr(e.fn); e.args.forEach(xExpr); break;
        case "un": xExpr(e.expr); break;
        case "bin": xExpr(e.left); xExpr(e.right); break;
        case "table":
          e.fields.forEach((f) => {
            if (f.key) { if (f.key.t !== "name" || !f.key._field) xExpr(f.key); }
            xExpr(f.value);
          });
          break;
        case "fn": e.body.forEach(xStmt); break;
        case "ifexpr":
          xExpr(e.cond); xExpr(e.then);
          e.elseif.forEach((u) => { xExpr(u.cond); xExpr(u.then); });
          if (e.else) xExpr(e.else);
          break;
      }
    }
    function xStmt(x) {
      if (!x) return;
      switch (x.t) {
        case "local": if (!x.bare) x.exprs.forEach(xExpr); break;
        case "assign": x.targets.forEach(xExpr); x.values.forEach(xExpr); break;
        case "if":
          xExpr(x.cond); x.then.forEach(xStmt);
          x.elseif.forEach((u) => { xExpr(u.cond); u.then.forEach(xStmt); });
          x.else.forEach(xStmt);
          break;
        case "while": xExpr(x.cond); x.body.forEach(xStmt); break;
        case "repeat": x.body.forEach(xStmt); xExpr(x.cond); break;
        case "nfor":
          xExpr(x.start); xExpr(x.limit); if (x.step) xExpr(x.step);
          x.body.forEach(xStmt);
          break;
        case "gfor": x.exprs.forEach(xExpr); x.body.forEach(xStmt); break;
        case "return": x.values.forEach(xExpr); break;
        case "stmt": xExpr(x.expr); break;
        case "func":
          x.name.fields.forEach(() => {});
          xExpr({ t: "name", name: x.name.root });
          x.body.forEach(xStmt);
          break;
      }
    }
    xStmt(s);
    return refs;
  }

  // Can this block be flattened? Locals are hoisted above the while loop, so
  // a name must not be referenced before (or within) its own declaration.
  function canFlatten(stmts) {
    const declAt = [];
    const declCount = new Map();
    stmts.forEach((s, i) => {
      if (s.t === "local") {
        declAt[i] = s.names;
        s.names.forEach((n2) => declCount.set(n2, (declCount.get(n2) || 0) + 1));
      }
    });
    for (const cnt of declCount.values()) if (cnt > 1) return false;
    const refs = stmts.map(allRefsInStmt);
    stmts.forEach((s, i) => {
      if (!declAt[i]) return;
      // self reference in the initializer
      for (const n2 of declAt[i]) if (refs[i].has(n2)) return false;
      // anything earlier referencing a later declaration
      for (let j = i + 1; j < stmts.length; j++) {
        if (!declAt[j]) continue;
        for (const n2 of declAt[j]) if (refs[i].has(n2)) return false;
      }
    });
    return true;
  }

  function flattenBlock(stmts, ctx, count) {
    const n = stmts.length;
    if (n < 2 || hasBreakers(stmts) || !canFlatten(stmts)) return stmts;

    // hoist block locals above the loop
    const hoistNames = [];
    const moved = [];
    for (const s of stmts) {
      if (s.t === "local") {
        hoistNames.push(...s.names);
        if (!s.bare) {
          moved.push({ t: "assign", targets: s.names.map((nm) => name(nm)), values: s.exprs, op: "=" });
        }
      } else {
        moved.push(s);
      }
    }

    const perm = shuffle(Array.from({ length: moved.length }, (_, i) => i), ctx.rng);
    const c = ctx.freshName();
    const arms = [];
    for (let j = 0; j < moved.length; j++) {
      arms.push({ c: perm[j], stmts: [moved[perm[j]]] });
      if (ctx.rng() < 0.15 && j < moved.length - 1) {
        // provably unreachable arm
        arms.push({
          c: 1000 + Math.floor(ctx.rng() * 500),
          stmts: [
            {
              t: "if",
              cond: binNode("and", { t: "bool", value: false }, binNode("==", name(c), num(0))),
              then: deadStmts(ctx, 1),
              elseif: [],
              else: [],
            },
          ],
        });
      }
    }
    const ifStmt = {
      t: "if",
      cond: binNode("==", name(c), num(arms[0].c)),
      then: arms[0].stmts,
      elseif: arms.slice(1).map((a) => ({ cond: binNode("==", name(c), num(a.c)), then: a.stmts })),
      else: [],
    };
    const whileStmt = {
      t: "while",
      cond: binNode("<", name(c), num(moved.length)),
      body: [ifStmt, assignOp(name(c), binNode("+", name(c), num(1)))],
    };
    if (count) count.blocks++;
    const out = [];
    if (hoistNames.length) out.push({ t: "local", names: hoistNames, exprs: [], bare: true });
    out.push(localOf(c, num(0)), whileStmt);
    return out;
  }

  function cffPass(ast, ctx, stats) {
    // function bodies first (bottom-up via recursion on copy)
    function xStmt(s) {
      if (!s) return s;
      switch (s.t) {
        case "if":
          s.then = xBlock(s.then);
          s.elseif.forEach((u) => { u.then = xBlock(u.then); });
          s.else = xBlock(s.else);
          break;
        case "while": s.body = xBlock(s.body); break;
        case "repeat": s.body = xBlock(s.body); break;
        case "nfor": s.body = xBlock(s.body); break;
        case "gfor": s.body = xBlock(s.body); break;
        case "func":
          s.body = s.body.length >= 3 ? flattenBlock(s.body, ctx, stats) : xBlock(s.body);
          break;
      }
      return s;
    }
    function xBlock(bs) { return bs.map(xStmt); }
    ast.stmts = xBlock(ast.stmts);
    ast.stmts = flattenBlock(ast.stmts, ctx, stats);
  }

  function deadPass(ast, ctx, stats) {
    function addDead(stmts) {
      if (stmts.length === 0) return stmts;
      const out = stmts.slice();
      const k = 1 + Math.floor(ctx.rng() * (out.length > 8 ? 3 : 2));
      for (let i = 0; i < k; i++) {
        // Luau requires break/continue/return to be the LAST statement of a
        // block, so never insert after one.
        let safeEnd = out.length + 1;
        if (out.length > 0) {
          const last = out[out.length - 1];
          if (last.t === "break" || last.t === "continue" || last.t === "return") {
            safeEnd = out.length;
          }
        }
        const pos = Math.floor(ctx.rng() * safeEnd);
        out.splice(pos, 0, ...deadStmts(ctx, 1));
        stats.dead++;
      }
      return out;
    }
    function xStmt(s) {
      if (!s) return s;
      switch (s.t) {
        case "if":
          s.cond = wrapCond(s.cond, ctx);
          s.then = addDead(xBlock(s.then));
          s.elseif.forEach((u) => { u.cond = wrapCond(u.cond, ctx); u.then = addDead(xBlock(u.then)); });
          s.else = addDead(xBlock(s.else));
          break;
        case "while": s.cond = wrapCond(s.cond, ctx); s.body = addDead(xBlock(s.body)); break;
        case "repeat": s.cond = wrapCond(s.cond, ctx); s.body = addDead(xBlock(s.body)); break;
        case "nfor": s.body = addDead(xBlock(s.body)); break;
        case "gfor": s.body = addDead(xBlock(s.body)); break;
        case "func": s.body = s.body.length >= 2 ? addDead(xBlock(s.body)) : xBlock(s.body); break;
      }
      return s;
    }
    function xBlock(bs) { return bs.map(xStmt); }
    ast.stmts = addDead(ast.stmts.map(xStmt));
  }

  function junkPass(ast, ctx) {
    const k = 2 + Math.floor(ctx.rng() * 2);
    const pieces = [];
    for (let i = 0; i < k; i++) {
      const fn = ctx.freshName();
      const a = ctx.freshName();
      const b = ctx.freshName();
      const r = ctx.freshName();
      const iv = ctx.freshName();
      const snippet =
        "local " + fn + " = function(" + a + ", " + b + ") " +
        "local " + r + " = 0 " +
        "for " + iv + " = 1, " + a + " do " + r + " = " + r + " + " + iv + " * " + b + " end " +
        "return " + r + " end";
      const ast2 = parse(snippet);
      pieces.push(...ast2.stmts);
    }
    const start = Math.max(1, Math.floor(ctx.rng() * Math.max(1, ast.stmts.length)));
    ast.stmts.splice(start, 0, ...pieces);
  }

  /* ------------------------------ emitter ---------------------------------- */

  const BPREC = {
    "or": 1, "and": 2,
    "<": 3, ">": 3, "<=": 3, ">=": 3, "~=": 3, "==": 3,
    "..": 3.5,
    "|": 4, "~": 5, "&": 6, "<<": 7, ">>": 7,
    "+": 8, "-": 8, "*": 9, "/": 9, "//": 9, "%": 9, "^": 10,
  };

  function prec(e) {
    if (!e) return 12;
    // a num literal whose text was folded into an expression (e.g. "(10) - 0")
    // carries the precedence of that expression's top-level operator
    if (e.t === "num") return e.effPrec != null ? e.effPrec : 12;
    if (e.t === "bin") return BPREC[e.op] || 12;
    if (e.t === "un") return 11;
    if (e.t === "ifexpr") return 1;
    return 12;
  }

  function isIdentSafe(n) { return NAME_RE.test(n) && !KEYWORDS.has(n); }

  function emit(ast) {
    function es(e) {
      switch (e.t) {
        case "num":
          // a leading '-' would collide with a preceding unary minus and
          // turn "--5" into a comment
          return e.text.charAt(0) === "-" ? "(" + e.text + ")" : e.text;
        case "str": return e.raw;
        case "nil": return "nil";
        case "bool": return e.value ? "true" : "false";
        case "dots": return "...";
        case "name": return e.name;
        case "un": {
          const oe = es(e.expr);
          if (prec(e.expr) < 11) return e.op + "(" + oe + ")";
          if (e.op === "not") return "not " + oe;
          return e.op + oe;
        }
        case "bin": {
          const op = e.op;
          const p = BPREC[op];
          const l = es(e.left);
          const r = es(e.right);
          const lp = prec(e.left);
          const rp = prec(e.right);
          const L = lp < p ? "(" + l + ")" : l;
          let R;
          if (op === "^") R = rp <= 10 ? "(" + r + ")" : r;
          else R = rp < p ? r : (rp <= p ? "(" + r + ")" : r);
          return L + " " + op + " " + R;
        }
        case "index": {
          const tb = es(e.table);
          if (e.dot && e.key.t === "name" && isIdentSafe(e.key.name)) return tb + "." + e.key.name;
          return tb + "[" + es(e.key) + "]";
        }
        case "call": {
          let f = es(e.fn);
          // Luau requires parens around a bare function expression that is
          // called directly:  (function() end)()
          if (prec(e.fn) < 12 || e.fn.t === "fn") f = "(" + f + ")";
          const args = e.args.map(es).join(", ");
          return e.method ? f + ":" + e.member + "(" + args + ")" : f + "(" + args + ")";
        }
        case "table": {
          if (e.fields.length === 0) return "{}";
          const parts = [];
          for (const f of e.fields) {
            if (f.key === null) parts.push(es(f.value));
            else if (f.key.t === "name" && isIdentSafe(f.key.name)) parts.push(f.key.name + " = " + es(f.value));
            else parts.push("[" + es(f.key) + "] = " + es(f.value));
          }
          return "{" + parts.join(", ") + "}";
        }
        case "fn": {
          const ps = e.params.join(", ");
          const va = e.varargs ? (ps ? ", ..." : "...") : "";
          return "function(" + ps + va + ") " + emitBlock(e.body) + " end";
        }
        case "ifexpr": {
          let s = "if " + es(e.cond) + " then " + es(e.then);
          for (const u of e.elseif) s += " elseif " + es(u.cond) + " then " + es(u.then);
          if (e.else) s += " else " + es(e.else);
          return s;
        }
      }
      throw new PVError("unknown expr " + e.t);
    }

    function ss(s) {
      switch (s.t) {
        case "local": {
          if (s.localFn && s.names.length === 1 && s.exprs.length === 1 && s.exprs[0].t === "fn") {
            const f = s.exprs[0];
            const ps = f.params.join(", ");
            const va = f.varargs ? (ps ? ", ..." : "...") : "";
            return "local function " + s.names[0] + "(" + ps + va + ") " + emitBlock(f.body) + " end";
          }
          return "local " + s.names.join(", ") + (s.bare ? "" : " = " + s.exprs.map(es).join(", "));
        }
        case "assign": {
          const t = s.targets.map(es).join(", ");
          return s.op === "=" || !s.op
            ? t + " = " + s.values.map(es).join(", ")
            : t + " " + s.op + " " + es(s.values[0]);
        }
        case "if": {
          let r = "if " + es(s.cond) + " then " + emitBlock(s.then);
          for (const u of s.elseif) r += " elseif " + es(u.cond) + " then " + emitBlock(u.then);
          if (s.else.length) r += " else " + emitBlock(s.else);
          return r + " end";
        }
        case "while": return "while " + es(s.cond) + " do " + emitBlock(s.body) + " end";
        case "repeat": return "repeat " + emitBlock(s.body) + " until " + es(s.cond);
        case "nfor": {
          let r = "for " + s.name + " = " + es(s.start) + ", " + es(s.limit);
          if (s.step) r += ", " + es(s.step);
          return r + " do " + emitBlock(s.body) + " end";
        }
        case "gfor":
          return "for " + s.names.join(", ") + " in " + s.exprs.map(es).join(", ") + " do " + emitBlock(s.body) + " end";
        case "return":
          return s.values.length ? "return " + s.values.map(es).join(", ") : "return";
        case "break": return "break";
        case "continue": return "continue";
        case "goto": return "goto " + s.label;
        case "label": return "::" + s.name + "::";
        case "stmt": return es(s.expr);
        case "func": {
          let nm = s.name.root;
          for (const f of s.name.fields) nm += "." + f.name;
          const ps = s.params.join(", ");
          const va = s.varargs ? (ps ? ", ..." : "...") : "";
          return "function " + nm + "(" + ps + va + ") " + emitBlock(s.body) + " end";
        }
      }
      throw new PVError("unknown stmt " + s.t);
    }

    function emitBlock(stmts) {
      return stmts.map(ss).join(" ");
    }

    return ast.stmts.map(ss).join("\n");
  }

  /* --------------------------- top-level wrap -------------------------------- */

  function chunkUsesTopVarargs(ast) {
    let uses = false;
    function xExpr(e) {
      if (!e) return;
      switch (e.t) {
        case "dots": uses = true; break;
        case "index": xExpr(e.table); if (!e.dot) xExpr(e.key); break;
        case "call": xExpr(e.fn); e.args.forEach(xExpr); break;
        case "un": xExpr(e.expr); break;
        case "bin": xExpr(e.left); xExpr(e.right); break;
        case "table": e.fields.forEach((f) => { if (f.key) { if (f.key.t !== "name" || !f.key._field) xExpr(f.key); } xExpr(f.value); }); break;
        case "fn":
          if (!e.varargs) break;
          e.body.forEach(xStmt);
          break;
        case "ifexpr":
          xExpr(e.cond); xExpr(e.then);
          e.elseif.forEach((u) => { xExpr(u.cond); xExpr(u.then); });
          if (e.else) xExpr(e.else);
          break;
      }
    }
    function xStmt(s) {
      if (!s) return;
      switch (s.t) {
        case "local": if (!s.bare) s.exprs.forEach(xExpr); break;
        case "assign": s.targets.forEach(xExpr); s.values.forEach(xExpr); break;
        case "if":
          xExpr(s.cond); s.then.forEach(xStmt);
          s.elseif.forEach((u) => { xExpr(u.cond); u.then.forEach(xStmt); });
          s.else.forEach(xStmt);
          break;
        case "while": xExpr(s.cond); s.body.forEach(xStmt); break;
        case "repeat": s.body.forEach(xStmt); xExpr(s.cond); break;
        case "nfor": xExpr(s.start); xExpr(s.limit); if (s.step) xExpr(s.step); s.body.forEach(xStmt); break;
        case "gfor": s.exprs.forEach(xExpr); s.body.forEach(xStmt); break;
        case "return": s.values.forEach(xExpr); break;
        case "stmt": xExpr(s.expr); break;
        case "func":
          if (!s.varargs) break;
          s.body.forEach(xStmt);
          break;
      }
    }
    ast.stmts.forEach(xStmt);
    return uses;
  }

  /* --------------------------- final (outer) layer --------------------------- */

  function finalWrap(s1, rng, opts) {
    const bytes = utf8Bytes(s1);
    const keyLen = 1 + Math.floor(rng() * 3);
    const key = [];
    for (let i = 0; i < keyLen; i++) key.push(1 + Math.floor(rng() * 254));
    const xored = bytes.map((b, i) => (b ^ key[i % keyLen]) & 255);

    // custom base64 alphabet (printable, no quotes/backslash)
    const pool = " !#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~".split("");
    const alpha = shuffle(pool.slice(), rng).slice(0, 64);

    let enc = "";
    for (let i = 0; i < xored.length; i += 3) {
      const c0 = xored[i];
      const has1 = i + 1 < xored.length;
      const has2 = i + 2 < xored.length;
      const c1 = has1 ? xored[i + 1] : 0;
      const c2 = has2 ? xored[i + 2] : 0;
      const v = c0 * 65536 + c1 * 256 + c2;
      enc += alpha[(v >> 18) & 63];
      enc += alpha[(v >> 12) & 63];
      if (has1) enc += alpha[(v >> 6) & 63];
      if (has2) enc += alpha[v & 63];
    }

    // split into chunks
    const chunkSize = 1200 + Math.floor(rng() * 800);
    const chunks = [];
    for (let i = 0; i < enc.length; i += chunkSize) chunks.push(enc.substr(i, chunkSize));
    if (chunks.length === 0) chunks.push("");

    // names must be unique: two `local PX` in one block would shadow each
    // other and silently drop a chunk (birthday collisions are common)
    const pNames = [];
    const pUsed = new Set();
    for (let i = 0; i < chunks.length; i++) {
      let n;
      do {
        n = "P" + Math.floor(rng() * 9999);
      } while (pUsed.has(n));
      pUsed.add(n);
      pNames.push(n);
    }
    let tmpl = "";
    chunks.forEach((c, i) => {
      tmpl += "local " + pNames[i] + " = " + luaStrLiteral(utf8Bytes(c)) + "\n";
    });

    const aEntries = alpha.map((ch, i) => "[" + ch.charCodeAt(0) + "] = " + i).join(", ");
    tmpl += "local A = { " + aEntries + " }\n";

    const cvName = "cv" + Math.floor(rng() * 999);
    const decName = "dc" + Math.floor(rng() * 999);
    const unxName = "ux" + Math.floor(rng() * 999);
    tmpl +=
      "local function " + cvName + "(s, i, n) if i <= n then return A[s:byte(i)] end return 0 end\n" +
      "local function " + decName + "(s) local o = {} local n = #s local i = 1 " +
      "while i <= n do " +
      "local v = " + cvName + "(s, i, n) * 262144 + " + cvName + "(s, i + 1, n) * 4096 + " + cvName + "(s, i + 2, n) * 64 + " + cvName + "(s, i + 3, n) " +
      "o[#o + 1] = string.char(math.floor(v / 65536) % 256) " +
      "if i + 2 <= n then o[#o + 1] = string.char(math.floor(v / 256) % 256) end " +
      "if i + 3 <= n then o[#o + 1] = string.char(v % 256) end " +
      "i = i + 4 end return table.concat(o) end\n";
    const keySrc = key.map((k) => k).join(", ");
    tmpl +=
      "local function " + unxName + "(s) local k = { " + keySrc + " } local o = {} " +
      "for i = 1, #s do o[i] = string.char(bit32.bxor(s:byte(i), k[((i - 1) % #k) + 1])) end " +
      "return table.concat(o) end\n";
    const cat = pNames.join(" .. ");
    tmpl += "local src = " + unxName + "(" + decName + "(" + cat + "))\n";
    tmpl += "local f = loadstring(src)\n";
    if (opts && opts.module) tmpl += "return f()\n";
    else tmpl += "f()\n";

    const w = parse(tmpl);
    const wctx = makeCtx(rng);
    wctx.allNames = collectAllNames(w);
    // data strings must survive verbatim
    (function markData(stmts) {
      stmts.forEach((s) => {
        if (s.t === "local" && !s.bare && s.exprs.length === 1 && s.exprs[0].t === "str") s.exprs[0].noenc = true;
      });
    })(w.stmts);
    manglePass(w, wctx);
    globalsPass(w, wctx);
    stringsPass(w, wctx);
    constantsPass(w, wctx);
    if (opts && opts.strength === "max") {
      const stats = { dead: 0 };
      deadPass(w, wctx, stats);
      cffPass(w, wctx, { blocks: 0 });
    }
    return emit(w);
  }

  /* ------------------------------- public API ------------------------------- */

  const STRENGTHS = ["low", "medium", "high", "max"];

  function obfuscate(src, opts) {
    opts = opts || {};
    const strength = STRENGTHS.includes(opts.strength) ? opts.strength : "max";
    const seed = opts.seed != null ? (opts.seed >>> 0) : ((Date.now() * 2654435761) ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    const rng = mulberry32(seed);

    const ast = parse(src);
    const ctx = makeCtx(rng);
    ctx.allNames = collectAllNames(ast);

    manglePass(ast, ctx);
    let globalsCount = 0;
    if (strength !== "low") globalsCount = globalsPass(ast, ctx);
    const stats = { dead: 0 };
    if (strength !== "low") deadPass(ast, ctx, stats);
    const strInfo = stringsPass(ast, ctx);
    if (strength !== "low") constantsPass(ast, ctx);
    let cffBlocks = 0;
    if (strength === "high" || strength === "max") {
      junkPass(ast, ctx);
      const cstats = { blocks: 0 };
      cffPass(ast, ctx, cstats);
      cffBlocks = cstats.blocks;
    }

    // top-level main() wrapper (plain scripts only)
    const module = !!(opts && opts.module);
    const usesVarargs = chunkUsesTopVarargs(ast);
    if (!module && !usesVarargs && (strength === "high" || strength === "max")) {
      const m = ctx.freshName();
      ast.stmts = [
        localOf(m, { t: "fn", params: [], varargs: false, body: ast.stmts }),
        { t: "stmt", expr: { t: "call", fn: name(m), args: [], method: false, member: null } },
      ];
    }

    let code = emit(ast);
    const layers = 1;
    if (strength === "max" && !(opts && opts.wrap === false)) {
      code = finalWrap(code, rng, { module, strength });
    }

    return {
      code,
      stats: {
        strength,
        seed,
        module,
        layers: strength === "max" && !(opts && opts.wrap === false) ? 2 : layers,
        inputBytes: utf8Bytes(src).length,
        outputBytes: utf8Bytes(code).length,
        strings: strInfo.strings,
        globals: globalsCount,
        cffBlocks,
        deadBlocks: stats.dead,
      },
    };
  }

  return {
    obfuscate,
    parse,
    emit,
    tokenize,
    PVError,
  };
});
