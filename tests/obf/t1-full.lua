-- comprehensive Luau syntax test
local function add(a, b) return a + b end

local function greet(name, ...)
  local rest = { ... }
  return "hi " .. name .. " n=" .. #rest
end

local t = { x = 1, ["y z"] = 2, 3, f = function(self, v) return v + self.x end }
print(t.x + t["y z"] + t[1])
print(t:f(t.x))

local sum = 0
for i = 1, 10 do
  sum = sum + i
end
print(sum)

local prod = 1
for i = 2, 10, 2 do
  prod = prod * i
end
print(prod)

local k, v, c = 0, 0, 0
for k, v in pairs(t) do
  c = c + 1
end
print(c)

local i2 = 1
while i2 < 5 do
  i2 = i2 + 1
  if i2 == 3 then break end
end
print(i2)

local n = 0
repeat
  n = n + 1
until n >= 4
print(n)

if sum > 40 then
  print("big")
elseif sum == 0 then
  print("zero")
else
  print("mid")
end

local r = select("#", 1, 2, 3)
print(r)
print(select(2, "a", "b", "c"))

local function fib(n)
  if n < 2 then return n end
  return fib(n - 1) + fib(n - 2)
end
print(fib(10))

local closure = (function()
  local c = 0
  return function()
    c = c + 1
    return c * 2
  end
end)()
closure()
print(closure())

local function makeCounter()
  local count = 0
  local function inc() count = count + 1 end
  local function get() return count end
  return { inc = inc, get = get }
end
local ctr = makeCounter()
ctr:inc()
ctr:inc()
print(ctr:get())

local function sumVar(...)
  local args = { ... }
  local s = 0
  for _, v in ipairs(args) do s = s + v end
  return s
end
print(sumVar(1, 2, 3, 4))
print(sumVar())

local s = "a\nb\tc"
print(#s, s:sub(2, 3), s:upper(), string.format("%d-%s", 42, "ok"))
print(("x"):rep(3))

local ok, err = pcall(function() error("boom") end)
print(ok, err)

local mt = setmetatable({}, { __index = { hello = "world" } })
print(mt.hello)

local bits = bit32.band(5, 3) + bit32.bor(5, 3) + bit32.bxor(5, 3) + bit32.lshift(5, 2) + bit32.rshift(8, 1) + bit32.bnot(5)
print(bits)

local pow = 2 ^ 10
local flo = 10 // 3
print(pow, flo)

local notv = not false
local cmp = 1 < 2 and 3 >= 3 or nil
print(notv, cmp == nil)

local function retMulti()
  return 1, 2, 3
end
local a1, b1, c1 = retMulti()
print(a1, b1, c1)

local long = [[multi
line "string"
here]]
print(#long)

local long2 = [==[with ]] brackets]==]
print(#long2)

local hex = 0xFF
local sci = 1.5e2
print(hex, sci)

local nested = { a = { b = { c = { d = 7 } } } }
print(nested.a.b.c.d)

local function chained()
  return setmetatable({}, { __call = function() return 99 end })
end
print(chained()())

local labels = {}
for idx = 1, 6 do
  if idx % 2 == 0 then
    continue
  end
  labels[#labels + 1] = idx
end
print(table.concat(labels, ","))

local withSkip = {}
for g = 1, 5 do
  if g == 3 then
    continue
  end
  if g > 4 then
    break
  end
  withSkip[#withSkip + 1] = g
end
print(table.concat(withSkip, ","))

local function myfmt(f, ...)
  return string.format(f, ...)
end
print(myfmt("%s=%d", "v", 5))

local function assignFn()
  local x = 1
  x += 4
  x -= 2
  x *= 3
  x //= 2
  x %= 7
  x ^= 4
  return x
end
print(assignFn())

local function concatAssign()
  local s = "ab"
  s ..= "cd"
  s = bit32.band(#s, 255)
  return s
end
print(concatAssign())

local ifexpr = if 1 < 2 then "yes" else "no"
print(ifexpr)
local ifexpr2 = if 1 > 2 then 1 elseif 2 > 1 then 2 else 3
print(ifexpr2)

local function selfRef()
  local state = { n = 1 }
  function state.bump()
    state.n += 1
    return state.n
  end
  return state:bump() + state:bump()
end
print(selfRef())

local deep = function(a)
  return function(b)
    return function(c)
      return a + b + c
    end
  end
end
print(deep(1)(2)(3))

print("done")
