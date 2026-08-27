
local __out = {}
local __realPrint = print
print = function(...)
  local t = { ... }
  for i = 1, #t do t[i] = tostring(t[i]) end
  __out[#__out + 1] = table.concat(t, "\t")
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

local rb, sq, ya, i, h, u, w, k, j, m, r, cm, uc, g, os, kx, qh, fp, l, bz
local cz = 0
while cz < 48 do if cz == 46 then while false do local yt = 1 end elseif cz == 1178 then if false and cz == 0 then while false do local il = 1 end end elseif cz == 12 then ya[sq(0x3, 5, 0x78, 219)]((4 + 3) % (4) + 1) elseif cz == 32 then kx = function(ha, ur) local rl = 0 for wk = 1, ha do rl = rl + wk * ur end return rl end elseif cz == 9 then ya[sq((3) - 0, 5, (120), (185 + 34))](10 - 0 ^ 3) elseif cz == 40 then ya[sq((3) - 0, 0x5, (120), 0xdb)](g) elseif cz == 36 then g -= 2 elseif cz == 1472 then if false and cz == 0 then local nw = 3 * 0 end elseif cz == 33 then qh = function(ov, qf) local ny = 0 for yg = 1, ov do ny = ny + yg * qf end return ny end elseif cz == 24 then cm = (3 + 3) * 0 elseif cz == 25 then ya[sq(0x3, (3 + 2), (120) - 0, (175 + 44))](m, r) elseif cz == 17 then ya[sq((2 + 1), (5) - 0, (110 + 10), (84 + 135))](i, h) elseif cz == 8 then ya[sq((3) * 1, (5), (120) - 0, 0xdb)](0x2 ^ (3 ^ 2)) elseif cz == 47 then ya[sq(0x3, (5), (120), 0xdb)](bz - l ^ 1) elseif cz == 30 then g = (16) * 1 elseif cz == 39 then g %= (1 + 2) elseif cz == 1369 then if false and cz == 0 then while false do local rz = 1 end end elseif cz == 10 then ya[sq(3, (5), (53 + 67), (219) * 1)](1 + (2) * 1 * (1 + 2) ^ ((2) - 0)) elseif cz == 1452 then if false and cz == 0 then local ff = 1 * 0 end elseif cz == 14 then i, h = 1, (2) - 0 elseif cz == 45 then ya[sq(3, 5, (120) - 0, (219) - 0)](l ^ bz) elseif cz == 31 then os = function(gu, xi) local nn = 0 for bk = 1, gu do nn = nn + bk * xi end return nn end elseif cz == 37 then g += (3) elseif cz == 38 then g = (10) * 1 elseif cz == 23 then m, r = j(7, 0x9) elseif cz == 13 then ya[sq((3) - 0, 0x5, 0x78, 219)]((12) // (1 + 4) - 1) elseif cz == 44 then bz = (10) * 1 elseif cz == 21 then ya[sq(0x3, 5, 120, 219)](u, w, k) elseif cz == 0 then rb = "\x00\x05\x08\xb6+\xdc@\x00\x02\xd3=\x00\x02\x16\x07\x00\x06\x07.\x9e\xa2\x17Z\x00\x08\xc8\xa8\x04:\xa5|ow\x00\x01\x9b\x00\x12\xbd\xd1\x98\x84\xc1\x0e\x96\xb9Q(g\xfd,7\xf8\x94\x10\x82\x00\x0a\x82\x06\xea\xbd\xd2\xc5\x9dd\xd7\x96" elseif cz == 20 then u, w, k = k, u, w elseif cz == 15 then ya[sq(3, (5) - 0, (120) - 0, (219))](i, h) elseif cz == 35 then g = 5 elseif cz == 3 then if 1 > 2 then local cr = (3) - 0 end elseif cz == 43 then l = 2 elseif cz == 1105 then if false and cz == 0 then local za = false and true end elseif cz == 5 then ya[sq(3, (5), (120) - 0, 219)]((2 + 8) // (1 + 2)) elseif cz == 41 then fp = function(lh) if lh <= 1 then return 1 end return lh * fp(lh - 1) end elseif cz == 11 then ya[sq((2 + 1), (5), (120) * 1, 0xdb)]((100) - (1 + 1) ^ 0x3) elseif cz == 16 then i, h = h, i elseif cz == 29 then g ^= 1 elseif cz == 1172 then if false and cz == 0 then while false do local sx = 1 end end elseif cz == 2 then ya = {[sq((2 + 1), (5), (120), (9 + 210))] = print} elseif cz == 22 then j = function(o, z) local f = o o, z = z, f return o, z end elseif cz == 42 then ya[sq((2 + 1), 5, (120), 0xdb)](fp((5))) elseif cz == 27 then ya[sq(3, 5, (120) - 0, (219))](#uc) elseif cz == 18 then u, w, k = (3) * 1, (4), 0x5 elseif cz == 28 then g = (2) elseif cz == 1228 then if false and cz == 0 then local dt = 6 * 0 end elseif cz == 19 then ya[sq((3) * 1, (5) * 1, 120, 0xdb)](u, w, k) elseif cz == 1 then sq = function(s, n, ...) local k = {...} local o = {} for i = 0, n - 1 do o[i + 1] = string.char(bit32.bxor((rb:byte(s + i) - i * (13)) % ((256) * 1), k[i % #k + 1])) end return table.concat(o) end elseif cz == 4 then ya[sq((3) * 1, (5), 120, (145 + 74))](2 ^ ((10) - 0)) elseif cz == 26 then uc = sq(10, (2) - 0, (178), 82, (60 + 191), (49)) .. (sq(14, 2, 117, (158) * 1, 0x90) .. 1 + 1) elseif cz == 34 then g //= (2) - 0 elseif cz == 7 then ya[sq((3) * 1, 0x5, (120) * 1, (219))](-(4 ^ ((2) - 0))) elseif cz == 6 then ya[sq((3), 0x5, 120, (219) - 0)](2 * 3 ^ 2) end cz = cz + 1 end
__realPrint("###PVOBF_OUT###\n" .. table.concat(__out, "\n"))
