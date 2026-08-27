
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

local vz = "\x00\x03\xc6\x7f\xb0\x00\x03w9\x11\x00\x01u\x00\x03\xe2\xcem\x00\x01\xd7\x00\x03\xbfJ\x80\x00\x04\xcc\x09\xa0\x14\x00\x03$\xc7\xf1\x00\x01\xdd\x00\x01\xc9\x00\x01\xa3\x00\x01\xc3\x00\x03\xd3\xe2=\x00\x03\xb7\x8e\xc9\x00\x05-\xe9H\x06c\x00\x06F\xa9~1\xae\xfa\x00\x05Y\xfeT%\x8c\x00\x02#3\x00\x04~\x95\x8d\xb1\x00\x07\xdf~\x91\x15~\xbcF\x00\x05\xcb+\xf1Ky\x00\x05\xbd\x8f\x87\x15\x81\x00\x04\x94\x01\xb2\x18\x00\x03\xfc\xd5\x96\x00\x04\x8bc\x98{\x00\x06\x18t6\xa4F\xa1\x00\x06{\xa9\xc1\x87\xbd\xfc\x00\x04\xc8U\xdfy\x00\x18i}Y\xd3\xfe\x8d\xbf\xc8\xd3\xabz\x10\xd1\x12,/\x0d\x9ckCyr\x95a\x00\x10'\x9af>J\x7f\xb8\xcb\xee\xbf\xa0\xe4\xa4\xfb\xdaZ\x00\x01\xfa\x00\x06\x83\xb4\x7f\x04\x14Y\x00\x06tn\x07\x1a\xaa\xbb\x00\x01\x9c\x00\x05\x98\xc1\x81\x86v\x00\x01\xcb\x00\x029A\x00\x021\xd8\x00\x03\x10\xa1\xcd\x00\x02\xa9U\x00\x01\x80\x00\x04\x0cS\xf3~\x00\x04\xb0\xc3\xd5\x88\x00\x16x\xb3\xd4\x01\xe85\xf6\xf9#A\x09\x0b\x0b\x99\xd4\xe8\xfa\xc0\xf4\xd2%I\x00\x04ZF\xc9\x97\x00\x0c\xa3\xfc0U\xe7\x1d\xe8I\xc5'\xdc\x89\x00\x03\xb2\xce\x88"
local function ag(s, n, ...) local k = {...} local o = {} for i = 0, n - 1 do o[i + 1] = string.char(bit32.bxor((vz:byte(s + i) - i * 13) % 256, k[i % #k + 1])) end return table.concat(o) end
local function z(h, y) return h + y end
local function o(p, ...) local l = {...} return ag(3, 3, 174, 27, 182, 4, 207, 14, 134) .. (p .. (ag(8, 3, 87, 66, 202, 88, 229, 18, 164) .. #l)) end
local m = {[ag(13, 1, 13, 140, 124, 114, 200, 36, 87)] = 1, [ag(16, 3, 155, 225, 41, 181)] = 2, 3, [ag(21, 1, 177, 47, 131)] = function(e, q) return q + e[ag(13, 1, 13, 140, 124, 114, 200, 36, 87)] end}
print(m[ag(13, 1, 13, 140, 124, 114, 200, 36, 87)] + m[ag(16, 3, 155, 225, 41, 181)] + m[1])
print(m:f(m[ag(13, 1, 13, 140, 124, 114, 200, 36, 87)]))
local j = 0
for uq = 1, 10 do j = j + uq end
print(j)
local w = 1
for u = 2, 10, 2 do w = w * u end
print(w)
local wp, di, hq = 0, 0, 0
for ov, kl in pairs(m) do hq = hq + 1 end
print(hq)
local pc = 1
while pc < 5 do pc = pc + 1 if pc == 3 then break end end
print(pc)
local lg = 0
repeat lg = lg + 1 until lg >= 4
print(lg)
if j > 40 then print(ag(24, 3, 221, 84, 1, 159, 6, 54)) elseif j == 0 then print(ag(29, 4, 182, 153, 244, 130, 217)) else print(ag(35, 3, 73, 211, 179, 141)) end
local il = select(ag(40, 1, 254, 238), 1, 2, 3)
print(il)
print(select(2, ag(43, 1, 168, 195, 44, 79), ag(46, 1, 193, 14, 232, 18, 195, 96, 133), ag(49, 1, 160, 120, 157, 206, 81)))
local function jf(kz) if kz < 2 then return kz end return jf(kz - 1) + jf(kz - 2) end
print(jf(10))
local rw = (function() local qm = 0 return function() qm = qm + 1 return qm * 2 end end)()
rw()
print(rw())
local function ny() local sd = 0 local function qt() sd = sd + 1 end local function hx() return sd end return {[ag(52, 3, 186, 187, 64, 83)] = qt, [ag(57, 3, 208, 228, 219, 135, 242, 162, 108)] = hx} end
local qo = ny()
qo:inc()
qo:inc()
print(qo:get())
local function sa(...) local cj = {...} local gh = 0 for fw, qb in ipairs(cj) do gh = gh + qb end return gh end
print(sa(1, 2, 3, 4))
print(sa())
local dm = ag(62, 5, 76, 214)
print(#dm, dm:sub(2, 3), dm:upper(), string[ag(69, 6, 32, 243, 22, 103, 27, 205, 237)](ag(77, 5, 124, 149, 23, 219, 43, 166, 202), 42, ag(84, 2, 76, 77, 213, 213, 170, 27)))
print(ag(13, 1, 13, 140, 124, 114, 200, 36, 87):rep(3))
local aq, vq = pcall(function() error(ag(88, 4, 28, 231)) end)
print(aq, vq)
local wj = setmetatable({}, {[ag(94, 7, 128, 46, 30)] = {[ag(103, 5, 163, 123, 187, 72, 42, 188)] = ag(110, 5, 202, 237, 31, 130, 41, 163, 198)}})
print(wj[ag(103, 5, 163, 123, 187, 72, 42, 188)])
local vb = bit32[ag(117, 4, 246, 149)](5, 3) + bit32[ag(123, 3, 158, 167, 14, 44, 205, 107, 150)](5, 3) + bit32[ag(128, 4, 233, 46, 17, 38, 70)](5, 3) + bit32[ag(134, 6, 116, 20)](5, 2) + bit32[ag(142, 6, 9, 239, 207)](8, 1) + bit32[ag(150, 4, 170, 38)](5)
print(vb)
local oi = 2 ^ 10
local aw = 10 // 3
print(oi, aw)
local ii = not false
local sp = 1 < 2 and 3 >= 3 or nil
print(ii, sp == nil)
local function aa() return 1, 2, 3 end
local qf, df, ak = aa()
print(qf, df, ak)
local av = ag(156, 24, 4, 5, 83, 216, 163, 70, 29)
print(#av)
local ky = ag(182, 16, 80, 228, 56, 127, 54, 99, 55)
print(#ky)
local sb = 0xFF
local gn = 1.5e2
print(sb, gn)
local im = {[ag(43, 1, 168, 195, 44, 79)] = {[ag(46, 1, 193, 14, 232, 18, 195, 96, 133)] = {[ag(49, 1, 160, 120, 157, 206, 81)] = {[ag(200, 1, 158, 89)] = 7}}}}
print(im[ag(43, 1, 168, 195, 44, 79)][ag(46, 1, 193, 14, 232, 18, 195, 96, 133)][ag(49, 1, 160, 120, 157, 206, 81)][ag(200, 1, 158, 89)])
local function hs() return setmetatable({}, {[ag(203, 6, 220, 248, 6, 188, 140, 116)] = function() return 99 end}) end
print(hs()())
local zh = {}
for bi = 1, 6 do if bi % 2 == 0 then continue end zh[#zh + 1] = bi end
print(table[ag(211, 6, 23, 14, 131, 144)](zh, ag(219, 1, 176, 230, 12, 204, 137, 248)))
local qj = {}
for lp = 1, 5 do if lp == 3 then continue end if lp > 4 then break end qj[#qj + 1] = lp end
print(table[ag(211, 6, 23, 14, 131, 144)](qj, ag(219, 1, 176, 230, 12, 204, 137, 248)))
local function fs(oq, ...) return string[ag(69, 6, 32, 243, 22, 103, 27, 205, 237)](oq, ...) end
print(fs(ag(222, 5, 189, 199, 90, 122, 38), ag(229, 1, 189, 156, 95, 151, 134), 5))
local function fq() local tt = 1 tt += 4 tt -= 2 tt *= 3 tt //= 2 tt %= 7 tt ^= 4 return tt end
print(fq())
local function wk() local ph = ag(232, 2, 88, 86, 1, 108, 68, 189) ph ..= ag(236, 2, 82, 175, 208, 231, 135, 209, 214) ph = bit32[ag(117, 4, 246, 149)](#ph, 255) return ph end
print(wk())
local mm = if 1 < 2 then ag(240, 3, 105, 241, 192, 59, 140) else ag(245, 2, 199, 39, 136, 171, 244, 12)
print(mm)
local jn = if 1 > 2 then 1 elseif 2 > 1 then 2 else 3
print(jn)
local function sc() local dq = {[ag(249, 1, 238, 11, 70, 131)] = 1} dq[ag(252, 4, 110, 51, 180, 39, 169)] = function() dq[ag(249, 1, 238, 11, 70, 131)] += 1 return dq[ag(249, 1, 238, 11, 70, 131)] end return dq:bump() + dq:bump() end
print(sc())
local dh = function(ge) return function(ea) return function(wv) return ge + ea + wv end end end
print(dh(1)(2)(3))
print(ag(258, 4, 212, 217, 213, 4, 117, 25))
__realPrint("###PVOBF_OUT###\n" .. table.concat(__out, "\n"))
