-- operator precedence + assignment edge cases (regression tests for
-- constants-folding precedence bugs and multi-target assignment)
print(2 ^ 10)
print(10 // 3)
print(2 * 3 ^ 2)
print(-4 ^ 2)
print(2 ^ 3 ^ 2)
print(10 - 0 ^ 3)
print(1 + 2 * 3 ^ 2)
print(100 - 2 ^ 3)
print(7 % 4 + 1)
print(12 // 5 - 1)

local a, b = 1, 2
print(a, b)
a, b = b, a
print(a, b)
local c, d, e = 3, 4, 5
print(c, d, e)
c, d, e = e, c, d
print(c, d, e)

local function swap(x, y)
  local t = x
  x, y = y, t
  return x, y
end
local p, q = swap(7, 9)
print(p, q)

local s = "ab" .. "cd" .. (1 + 1)
print(#s)

local v = 2
v ^= 1
v = 16
v //= 2
v = 5
v -= 2
v += 3
v = 10
v %= 3
print(v)

local function fact(n)
  if n <= 1 then return 1 end
  return n * fact(n - 1)
end
print(fact(5))

local x = 2
local y = 10
print(x ^ y)
print(y - x ^ 1)
