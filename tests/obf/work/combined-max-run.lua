
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

local ii = "\x00\x03\x1e\xb9L\x00\x03\xd91\xda\x00\x01\x9e\x00\x03\x97\x0f\xae\x00\x01H\x00\x03\xfeb\x0b\x00\x04I\xe9\x03`\x00\x03\x10F\xed\x00\x01\x81\x00\x01\xfb\x00\x01+\x00\x01\x85\x00\x03UVy\x00\x039'D\x00\x05k\xc5\xd5\x0f\x9d\x00\x06\xfe}5.0L\x00\x05q\xa6\xad\x98\xc2\x00\x02,\x9f\x00\x04%\x10\x0bQ\x00\x07\xa9\x92\x8c\xbf\xf2\xbf\xdc\x00\x05c\xb2\xec\x8e\xe3\x00\x05H5\xb4p\x8f\x00\x04\xa2[\xc8r\x00\x03\xd6\x82\xe3\x00\x040\xab\x04G\x00\x06\x1f$\xd4A6\xe7\x00\x06\xbe\x97\xbe\xb7\xde\xce\x00\x04tb\xda\x82\x00\x18\xaf\xf9\xbf\x7f\xa9\x09C\xfb\xaa\xeedJV\x01$n\xc7\x8b\xf8\x0d\xae\x0d\xd9t\x00\x10P=mX;E\xc8\xd4\xad\xa0\xc8\xc9\xe8\xe5\x09\xed\x00\x01\x8a\x00\x06<.\x8b)F\xbf\x00\x06f<\xcb\xda\x84\xf9\x00\x01\xea\x00\x05q\xf1\x84\xe2b\x00\x012\x00\x02B\xc9\x00\x026\x17\x00\x03\xbe\x9f\xfb\x00\x02\xfdW\x00\x01\x9e\x00\x04D\xbe\x98\xbd\x00\x04\x11\xb3\xf9\x1f\x00\x09=^\xecv1\xec\x0a\x0cq\x00\x02BY\x00\x04~w\xd5c\x00\x15\xf9iE\xe6T\x1c\x04\xbc\xfcw\xc7M\xf7k]\x7f\xeb\xce\xca\xf6\xca\x00\x10O\xc9\xde\xa9\x22-\x8f\xc8\xb8\x16W\x89\xc6\xcc.\x8d\x00\x15`\x81}\xe1\xeb\xd1\xaa\xc8]\xf1\xc5P\xb8\xb1\xc2\xa3-\x19\x12\xbb\xd3"
local pw = function(s, n, ...) local k = {...} local o = {} for i = 0, n - 1 do o[i + 1] = string.char(bit32.bxor((ii:byte(s + i) - i * 13) % 256, k[i % #k + 1])) end return table.concat(o) end
local o = function(p, h) return p + h end
local e = function(z, ...) local y = {...} return pw(3, 3, 118, 197, 18, 80, 249) .. (z .. (pw(8, 3, 249, 74, 253, 29) .. #y)) end
local j = {[pw(13, 1, 230, 187, 29, 24, 141, 239)] = 1, [pw(16, 3, 238, 34)] = 2, 3, [pw(21, 1, 46, 69, 199, 175, 248)] = function(l, fz) return fz + l[pw(13, 1, 230, 187, 29, 24, 141, 239)] end}
print(j[pw(13, 1, 230, 187, 29, 24, 141, 239)] + j[pw(16, 3, 238, 34)] + j[1])
print(j:f(j[pw(13, 1, 230, 187, 29, 24, 141, 239)]))
local w = 0
for m = 1, 10 do w = w + m end
print(w)
local q = 1
for u = 2, 10, 2 do q = q * u end
print(q)
local ro, qv, bf = 0, 0, 0
for ui, ic in pairs(j) do bf = bf + 1 end
print(bf)
local zj = 1
while zj < 5 do zj = zj + 1 if zj == 3 then break end end
print(zj)
local su = 0
repeat su = su + 1 until su >= 4
print(su)
if w > 40 then print(pw(24, 3, 156, 60, 150, 6)) elseif w == 0 then print(pw(29, 4, 51, 185, 155, 86)) else print(pw(35, 3, 125, 80, 183)) end
local yw = select(pw(40, 1, 162, 202), 1, 2, 3)
print(yw)
print(select(2, pw(43, 1, 154, 83, 37, 37), pw(46, 1, 73, 121, 22, 225, 249, 138, 28), pw(49, 1, 230, 16, 238, 55, 146)))
local wu = function(oi) if oi < 2 then return oi end return wu(oi - 1) + wu(oi - 2) end
print(wu(10))
local ax = (function() local zu = 0 return function() zu = zu + 1 return zu * 2 end end)()
ax()
print(ax())
local mg = function() local gg = 0 local jf = function() gg = gg + 1 end local lv = function() return gg end return {[pw(52, 3, 60, 39)] = jf, [pw(57, 3, 94, 127)] = lv} end
local qo = mg()
qo:inc()
qo:inc()
print(qo:get())
local zx = function(...) local ac = {...} local jq = 0 for eb, la in ipairs(ac) do jq = jq + la end return jq end
print(zx(1, 2, 3, 4))
print(zx())
local pt = pw(62, 5, 10, 178, 217, 225)
print(#pt, pt:sub(2, 3), pt:upper(), string[pw(69, 6, 152, 31, 105, 106, 157, 127, 119)](pw(77, 5, 84, 253, 190), 42, pw(84, 2, 67, 249, 106)))
print(pw(13, 1, 230, 187, 29, 24, 141, 239):rep(3))
local jk, wm = pcall(function() error(pw(88, 4, 71, 108, 158)) end)
print(jk, wm)
local pu = setmetatable({}, {[pw(94, 7, 246, 218, 27)] = {[pw(103, 5, 11, 192, 190)] = pw(110, 5, 63, 71, 232, 37, 63, 210, 102)}})
print(pu[pw(103, 5, 11, 192, 190)])
local pq = bit32[pw(117, 4, 192, 47)](5, 3) + bit32[pw(123, 3, 180, 26, 187)](5, 3) + bit32[pw(128, 4, 82, 230, 133, 82, 52, 253)](5, 3) + bit32[pw(134, 6, 115, 100, 210)](5, 2) + bit32[pw(142, 6, 204, 249)](8, 1) + bit32[pw(150, 4, 22, 59, 175, 47, 195, 15)](5)
print(pq)
local iu = 2 ^ 10
local wz = 10 // 3
print(iu, wz)
local cr = not false
local oa = 1 < 2 and 3 >= 3 or nil
print(cr, oa == nil)
local gz = function() return 1, 2, 3 end
local fb, ij, ud = gz()
print(fb, ij, ud)
local nm = pw(156, 24, 194, 153, 201, 44, 28)
print(#nm)
local vj = pw(182, 16, 39, 89)
print(#vj)
local lh = 0xFF
local lj = 1.5e2
print(lh, lj)
local ej = {[pw(43, 1, 154, 83, 37, 37)] = {[pw(46, 1, 73, 121, 22, 225, 249, 138, 28)] = {[pw(49, 1, 230, 16, 238, 55, 146)] = {[pw(200, 1, 238, 86)] = 7}}}}
print(ej[pw(43, 1, 154, 83, 37, 37)][pw(46, 1, 73, 121, 22, 225, 249, 138, 28)][pw(49, 1, 230, 16, 238, 55, 146)][pw(200, 1, 238, 86)])
local ts = function() return setmetatable({}, {[pw(203, 6, 99, 126, 18)] = function() return 99 end}) end
print(ts()())
local ri = {}
for xo = 1, 6 do if xo % 2 == 0 then continue end ri[#ri + 1] = xo end
print(table[pw(211, 6, 5, 64, 223, 208, 49, 204, 192)](ri, pw(219, 1, 198, 249, 70, 166)))
local ux = {}
for xl = 1, 5 do if xl == 3 then continue end if xl > 4 then break end ux[#ux + 1] = xl end
print(table[pw(211, 6, 5, 64, 223, 208, 49, 204, 192)](ux, pw(219, 1, 198, 249, 70, 166)))
local ar = function(zr, ...) return string[pw(69, 6, 152, 31, 105, 106, 157, 127, 119)](zr, ...) end
print(ar(pw(222, 5, 84, 151, 87, 158, 74, 54), pw(229, 1, 68, 13, 7, 186, 115, 202, 144), 5))
local pk = function() local sf = 1 sf += 4 sf -= 2 sf *= 3 sf //= 2 sf %= 7 sf ^= 4 return sf end
print(pk())
local vt = function() local wq = pw(232, 2, 35, 222, 240, 48, 96, 7) wq ..= pw(236, 2, 85, 110, 237) wq = bit32[pw(117, 4, 192, 47)](#wq, 255) return wq end
print(vt())
local kw = if 1 < 2 then pw(240, 3, 199, 247, 146, 166, 223, 230, 6) else pw(245, 2, 147, 37, 101, 130, 123, 240)
print(kw)
local vs = if 1 > 2 then 1 elseif 2 > 1 then 2 else 3
print(vs)
local wg = function() local sp = {[pw(249, 1, 240, 207, 116)] = 1} sp[pw(252, 4, 38, 196, 19, 230)] = function() sp[pw(249, 1, 240, 207, 116)] += 1 return sp[pw(249, 1, 240, 207, 116)] end return sp:bump() + sp:bump() end
print(wg())
local il = function(hr) return function(lu) return function(ft) return hr + lu + ft end end end
print(il(1)(2)(3))
print(pw(258, 4, 117, 201, 177, 157, 34))
__realPrint("###PVOBF_OUT###\n" .. table.concat(__out, "\n"))