local nf = "\x00\x02\x9bM\x00\x02\x8c\xe3\x00\x09\xba\xb2\xbc\x8a\xb6\x19\x9d,\xe6\x00\x0b\xac\xa4\x13\x8e\x83F\x8d\xab\x16\x81\xe5\x00\x0c\xc7yq\x93~\x8bM\xb3\x82\xe8\x1cb\x00\x01U\x00\x02M\xa4"
local function lf(s, n, ...) local k = {...} local o = {} for i = 0, n - 1 do o[i + 1] = string.char(bit32.bxor((nf:byte(s + i) - i * 13) % 256, k[i % #k + 1])) end return table.concat(o) end
print(2 ^ 10)
print(10 // 3)
print(2 * 3 ^ 2)
print(-(4 ^ 2))
print(2 ^ (3 ^ 2))
print(10 - 0 ^ 3)
print(1 + 2 * 3 ^ 2)
print(100 - 2 ^ 3)
print(7 % 4 + 1)
print(12 // 5 - 1)
local f, j = 1, 2
print(f, j)
f, j = j, f
print(f, j)
local o, z, l = 3, 4, 5
print(o, z, l)
o, z, l = l, o, z
print(o, z, l)
local function k(h, u) local r = h h, u = u, r return h, u end
local m, g = k(7, 9)
print(m, g)
local i = lf(3, 2, 250, 34, 254) .. (lf(7, 2, 239, 178, 163, 128, 94, 11) .. 1 + 1)
print(#i)
local w = 2
w ^= 1
w = 16
w //= 2
w = 5
w -= 2
w += 3
w = 10
w %= 3
print(w)
local function uf(xc) if xc <= 1 then return 1 end return xc * uf(xc - 1) end
print(uf(5))
local hl = 2
local wj = 10
print(hl ^ wj)
print(wj - hl ^ 1)