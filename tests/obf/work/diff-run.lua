
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
local kt = "\x00\x05\xcc;\xcf\xc9e\x00\x06|\xaaE\xf9T\xbc\x00\x05\x95\xc1\x0f\x8f\xf9\x00\x05xh\x15\x8d\x91\x00\x05\x07\x19\x11\xaf\xaa\x00\x0c\x05\xedFB\x14meL\xa1\x89k\xcc\x00\x06\xa8`]\xd9}\x97\x00\x064!x\x1d\xf2U\x00\x05_Ohtw\x00\x05\xce\xd6M\x14k\x00\x03kx\x8b\x00\x03<Z;\x00\x01\xfc\x00\x033\xa9F\x00\x01\xb9\x00\x03\xb2\x1e\x97\x00\x04\xbf\xb0\xd1\xd0\x00\x03\xfa\xe6\x15\x00\x01X\x00\x01\x93\x00\x01\x1a\x00\x01\x01\x00\x03\xc1\xadq\x00\x03\xc8\xd4\xee\x00\x05\xad\x87\x14a\xb3\x00\x06|?\xbd\x22\xafj\x00\x05\x0a\xf3/\xd7\x90\x00\x02\x86\x12\x00\x047\xe3\x16g\x00\x07a\xe2\xae\x1b\xb4\x82\xfa\x00\x05b&\x8a\xbd\xb7\x00\x05\xa2,\x15VR\x00\x04f\x09\x91\x87\x00\x03\xa1Bu\x00\x04e\xbe\xf1\x9c\x00\x06\x8d\xa6\xf8v\x81\xf6\x00\x06\xfdL19\x20<\x00\x04\xb1\xe66\x06\x00\x18\xe1\xf1\xab#\x20\x80\xe3@g\x0d*6\xe26\xb4\xbbc\xcc\x916\x95\xfa\x01\xc3\x00\x10\xa7\xc8Z\x84\xae\xce\xddo\xbf\x9d3@\xfb\xf9\xe4f\x00\x01\xa8\x00\x06\xc1\x19\xae]&\x80\x00\x06\x1cW\xc0\x90\x98L\x00\x01\xee\x00\x05\xc1S\xe3\xb8\xb4\x00\x01R\x00\x027\xe8\x00\x021\xfc\x00\x03\x8f\xe2$\x00\x02x\x5c\x00\x01\xaf\x00\x04\x9f\x12\xe0\x8f\x00\x04xfU\xab\x00\x03\x09\xd5m\x00\x18.\xa7\x83<\xd6/\xe6\x87\xb9\xa8,\x0cE`\x95\xb7>\xb4_-\x1b*\x19d\x00\x04%v]\xd2\x00\x16v~\x80v\xc5\xe22\x88\xbc\xb9\xbe\xa9=--2[Zuar\xfc\x00\x0e\x1e\x96\x02E\xa8-\x8fn\xf3\xbc1\x90\x8a\x07"
local function hl(s, n, ...) local k = {...} local o = {} for i = 0, n - 1 do o[i + 1] = string.char(bit32.bxor((kt:byte(s + i) - i * (13) - 0) % (256), k[i % #k + 1])) end return table.concat(o) end
local xo = {[hl(3, 0x5, 169, 92, (199) - 0, 0xcd, (37 + 30))] = error, [hl((10) * 1, (6), 15, (173 + 75), (71) - 0, (183) - 0, (37 + 30))] = select, [hl((18) * 1, (2 + 3), 0xf7, (72 + 149), (67 + 62), (91))] = bit32, [hl((25) * 1, (5) - 0, 8, (41) - 0, (146) - 0)] = print, [hl(0x20, 5, 119, 109, (158) - 0, (250) * 1, (5) * 1, (179 + 20))] = pairs, [hl((39) - 0, (12) - 0, (118), 133, 88)] = setmetatable, [hl(0x35, (5 + 1), (219) - 0, 0x27, (49))] = string, [hl((61), 6, (93) - 0, (63 + 37), (1 + 62), 159, (172 + 32), (103))] = ipairs, [hl((69) * 1, (5) * 1, (47) * 1, 0x21)] = pcall, [hl(0x4c, (5), (186) * 1, 0xa8, (40 + 41), (129), (82) - 0, (108) - 0)] = table}
local function z(q, l) return q + l end
local function u(y, ...) local o = {...} return hl((9 + 74), (3), 0x3, (1 + 1), 81, 134) .. (y .. (hl(88, 0x3, (28) * 1, (35) - 0) .. #o)) end
local j = {[hl(0x5d, 1, 132, (37), 188, (81) - 0)] = 1, [hl((78 + 18), 3, 74, (188) - 0, (86) * 1, 0xdf, 238, (219), (203) - 0)] = (2) * 1, (2 + 1), [hl(0x65, 1, (223) * 1, 212)] = function(e, h) return h + e[hl((42 + 51), 1, (8 + 124), (37), 0xbc, (81))] end}
xo[hl(0x19, (5) * 1, (8), 41, (13 + 133))](j[hl((39 + 54), 1, (132), 0x25, 0xbc, (81) * 1)] + j[hl((70 + 26), 3, (74) - 0, (188) - 0, (38 + 48), 223, 0xee, (219) * 1, 203)] + j[1])
xo[hl((25), 5, 8, (20 + 21), (39 + 107))](j:f(j[hl(0x5d, 1, (132), (37) - 0, 188, 0x51)]))
local p = 0
for w = 1, (10) - 0 do p = p + w if 1 > (1 + 1) then local gi = 0x3 end local kl = (8) * 1 * 0 end
xo[hl(25, 5, 0x8, 41, 146)](p)
local rw = 1
for m = (2), 0xa, (1 + 1) do local pf = false and true rw = rw * m local gp = 0x3 * 0 end
xo[hl(25, (5) - 0, 8, (41), 146)](rw)
local qv, qi, hb = 0, 0, 0
for qq, mb in xo[hl((4 + 28), (5) * 1, (119), 0x6d, 0x9e, (248 + 2), (5), 0xc7)](j) do hb = hb + 1 local nj = false and true end
xo[hl(25, (4 + 1), 8, (41) - 0, (146) - 0)](hb)
local nn = 1
while nn < 5 do local mx = 9 * 0 nn = nn + 1 if nn == 0x3 and true then local ad = false and true local ef = false and true break end end
xo[hl((25) * 1, (5), (8), (41) - 0, 146)](nn)
local ap = 0
repeat ap = ap + 1 while false do local wz = 1 end until ap >= (4)
xo[hl(25, 5, (8) * 1, 41, (146) - 0)](ap)
if p > (40) - 0 or false then if 1 > (2) - 0 then local jo = 3 end xo[hl(0x19, (4 + 1), (8) * 1, (27 + 14), 0x92)](hl(104, (3) - 0, 0xd0, 120, 0x1a, 226, 0x89)) elseif p == 0 or false then xo[hl(25, 0x5, (8) - 0, (41) * 1, 0x92)](hl((109), (4) - 0, (197) * 1, (198))) local em = 8 * 0 else if 1 > (2) - 0 then local cj = (3) - 0 end xo[hl(0x19, (5), 8, (41) * 1, (146))](hl((115), 0x3, (48 + 103), (176) * 1, 0x9f, (8 + 31), 0xb2, (67) * 1)) end
local cy = xo[hl((10) - 0, (6) - 0, 15, (248) * 1, (71) * 1, (124 + 59), 67)](hl((120) - 0, 1, 0x7b, (106) - 0, (38) * 1, (7), 0x6b, (24) * 1), 1, 2, 0x3)
xo[hl(25, (5) * 1, (8) - 0, (13 + 28), (146) * 1)](cy)
xo[hl(0x19, (5) * 1, (7 + 1), (41) * 1, (146) * 1)](xo[hl(10, 6, (11 + 4), (248), (71) - 0, (183) - 0, 0x43)](0x2, hl((123) * 1, 1, 242, 0xe1, (250) * 1, 147, 0x68), hl(126, 1, (120) * 1, (227) - 0, (238)), hl(0x81, 1, (98), (55 + 189), (197), 0xf3, 0xda, (218 + 33))))
local function hm(gn) if gn < (1 + 1) then return gn end return hm(gn - 1) + hm(gn - 2) end
xo[hl((25) * 1, 0x5, (3 + 5), 41, (146) - 0)](hm((10)))
local ri = (function() local jz = 0 return function() jz = jz + 1 return jz * (2) * 1 end end)()
ri()
xo[hl((25), 5, 8, (41) * 1, 0x92)](ri())
local function cu() local yu = 0 local function ts() yu = yu + 1 end local function rp() return yu end return {[hl(0x84, (3) - 0, 0xa8, (206) - 0, 52, 245, 0x53, 213, 121)] = ts, [hl((137), 3, 175, (162), (90 + 70), 253, 0xef)] = rp} end
local cb = cu()
cb:inc()
cb:inc()
xo[hl((14 + 11), (5), (8) - 0, (41) * 1, 146)](cb:get())
local function cq(...) local wt = {...} local op = 0 for ln, wl in xo[hl(61, (6) * 1, (93) * 1, (100) - 0, 63, 159, (204), (103) * 1)](wt) do op = op + wl end return op end
xo[hl((25) - 0, (5) * 1, (8) - 0, 0x29, (146) - 0)](cq(1, 0x2, (3) * 1, (4) * 1))
xo[hl(0x19, 5, (8) * 1, (41) - 0, (16 + 130))](cq())
local vp = hl(0x8e, 5, (204), (112) * 1, (152), 0x33, 28)
xo[hl(25, (5) * 1, 0x8, (5 + 36), (146))](#vp, vp:sub((2) - 0, 3), vp:upper(), xo[hl((53), 6, 219, 39, (49))][hl(0x95, 6, 0x1a, (93), (209), (150) - 0)](hl((59 + 98), (5) - 0, 47, (119 + 11), 56, (149) - 0), 42, hl((20 + 144), (2), (233), 0x6e, (141) * 1, (5 + 134), 0x6a, (5) - 0)))
xo[hl((25) - 0, (5) * 1, (8) - 0, (41) - 0, (146) * 1)](hl(93, 1, 0x84, 0x25, (188) * 1, (65 + 16)):rep((3)))
local uo, vc = xo[hl(0x45, 5, 47, 33)](function() xo[hl(0x3, 0x5, (153 + 16), (78 + 14), (199) - 0, 0xcd, (67) * 1)](hl((168) * 1, (4) - 0, (85) * 1, (103 + 82), (4 + 143), 0x2d, (15) * 1, (55) - 0)) end)
xo[hl((6 + 19), 5, (8) - 0, 41, 0x92)](uo, vc)
local ms = xo[hl(0x27, 0xc, (34 + 84), 0x85, 0x58)]({}, {[hl(174, (7), 0x3e, (32 + 106), (38 + 215), (154), (228) - 0, (36), 0xd4)] = {[hl(0xb7, (5), (10), (124) - 0, (5 + 23), 0xfa, 236, (29 + 8), (5 + 2))] = hl(0xbe, 5, 213, (102 + 10), (58 + 79), 0x43, (122) * 1)}})
xo[hl(0x19, 5, (8) * 1, 41, (146) - 0)](ms[hl((120 + 63), 0x5, 10, (124), (13 + 15), (250), (236) - 0, 0x25, (3 + 4))])
local iv = xo[hl(18, 0x5, 0xf7, 221, (129) - 0, 91)][hl(197, (4) - 0, 4, 157, (25))]((3 + 2), 3) + xo[hl((18), (5) * 1, (3 + 244), 221, (129) * 1, (30 + 61))][hl(203, (1 + 2), (114 + 81), (90) * 1, 41, (254) - 0, (174 + 2), (60 + 4), (59))]((5), (2 + 1)) + xo[hl((18) * 1, (5) - 0, (77 + 170), (221) - 0, (129), (91))][hl(208, 4, 0x7, (201) - 0, 0xb8)]((5) * 1, (1 + 2)) + xo[hl((18), 0x5, (247) - 0, 221, 129, (91))][hl((128 + 86), (4 + 2), 0xe1, 0xea, (86 + 96), 38, (43) * 1, (193) * 1, 198)]((5), 0x2) + xo[hl(18, (5), (247) - 0, (221) * 1, (129) * 1, (91))][hl(222, 6, 0x8f, 76, (127), (22 + 101), (138) * 1)]((8) - 0, 1) + xo[hl((18) - 0, (5) - 0, (247) - 0, 221, 129, 0x5b)][hl(0xe6, (2 + 2), 211, 183, 0x73, 171, (254))]((5))
xo[hl(25, (5) - 0, 0x8, 41, 146)](iv)
local kh = 2 ^ 0xa
local uw = 10 // 0x3
local rv = (2) * 1 * 0
xo[hl(25, 5, 0x8, 41, (146))](kh, uw)
local zx = not false
local ay = 1 < (1 + 1) and (3) * 1 >= 3 or nil
xo[hl(25, 5, (2 + 6), 0x29, 0x92)](zx, ay == nil)
local function ao() return 1, 2, (2 + 1) end
local fj, mk, ys = ao()
xo[hl((22 + 3), (5) - 0, (8) - 0, (41) - 0, 0x92)](fj, mk, ys)
local zs = hl((184 + 52), (24) * 1, (140), 0x91, 0xfd, (136) * 1, (30 + 103), (53) * 1, 0xf9)
xo[hl(25, (5) - 0, 0x8, 0x29, (146))](#zs)
local hv = hl(262, (16) - 0, 208, 210, 52, (53) * 1, (90) - 0)
xo[hl((25) - 0, 5, (8), (41), 0x92)](#hv)
local ee = 0xFF
local bw = (87 + 63)
xo[hl((23 + 2), (4 + 1), (8), 41, 0x92)](ee, bw)
local nx = {[hl((10 + 113), 1, (242) - 0, 0xe1, 250, 0x93, (104))] = {[hl((124 + 2), 1, 0x78, (227), 238)] = {[hl((90 + 39), 1, (72 + 26), 0xf4, 197, 243, (144 + 74), 251)] = {[hl(0x118, 1, (204) - 0, (187) - 0, 0xf2, 194)] = (1 + 6)}}}}
xo[hl((25) - 0, (3 + 2), 8, 41, 0x92)](nx[hl((123) - 0, 1, (242) * 1, (225) - 0, 250, (147), 0x68)][hl(126, 1, 120, 227, (93 + 145))][hl((9 + 120), 1, (23 + 75), 244, (197) * 1, (243), (218) * 1, (251) * 1)][hl(0x118, 1, 204, 187, 242, (117 + 77))])
local function na() return xo[hl((39) * 1, (12) - 0, (118) - 0, (133), (26 + 62))]({}, {[hl((283) - 0, 0x6, 0x9e, 0x53, (247), 87)] = function() return (61 + 38) end}) end
xo[hl((25), (5) * 1, 8, (12 + 29), (146))](na()())
local rr = {}
for zb = 1, 0x6 do local wb = (3 + 1) * 0 if 1 > 2 then local mn = (1 + 2) end if (zb % (1 + 1) == 0 or false) and true then if 1 > (2) then local fi = (3) end continue end rr[#rr + 1] = zb end
xo[hl((25), 5, (8) - 0, (41), (146))](xo[hl(0x4c, (2 + 3), 186, (168), (81) * 1, 129, (82), (108) - 0)][hl((291), 6, (118 + 9), (37), 0xc8, (10) * 1, 5)](rr, hl(299, 1, (13 + 181), (39) * 1, (10 + 57), 36, (123), 196, 0xed)))
local vn = {}
for lz = 1, (5) - 0 do if lz == (3) - 0 and true then local fl = false and true continue end if 1 > (2) * 1 then local pm = 0x3 end if lz > (4) or false then while false do local ep = 1 end local nc = 0x5 * 0 break end vn[#vn + 1] = lz while false do local sw = 1 end end
xo[hl(0x19, (5) * 1, (8) - 0, (41), (114 + 32))](xo[hl(76, 0x5, (186) - 0, 168, 81, 129, 82, 0x6c)][hl(291, 6, (79 + 48), 37, (200) * 1, (10) - 0, (5))](vn, hl((299) - 0, 1, (194) - 0, (15 + 24), (67) - 0, (36), 123, 0xc4, 0xed)))
local function lr(qj, ...) return xo[hl((45 + 8), 6, (100 + 119), (39), (49) - 0)][hl((56 + 93), (6) * 1, (26), 93, (209) * 1, (150))](qj, ...) end
xo[hl((16 + 9), (5) - 0, 8, 0x29, (146) - 0)](lr(hl(0x12e, 5, (228) - 0, (40 + 13), 0xf4, (143 + 37)), hl((309) - 0, 1, (36) - 0, (142), 252, (36 + 20)), 0x5))
local function sm() local iy = 1 iy += (1 + 3) iy -= (2) * 1 iy *= 3 iy //= (1 + 1) iy %= (7) iy ^= (1 + 3) return iy end
xo[hl(25, 0x5, 8, 41, 0x92)](sm())
local function zc() local jk = hl(0x138, (2) * 1, (86) * 1, 185, (35) - 0, (151), (53 + 16)) jk ..= hl(0x13c, 0x2, 82, 0x8b) jk = xo[hl(18, 5, 247, (221), (129) - 0, (91))][hl(197, (3 + 1), 4, 157, (25) - 0)](#jk, 255) return jk end
xo[hl((25), (5), 8, (41), (146) * 1)](zc())
local pk = if 1 < (2) - 0 then hl(320, (1 + 2), (246) * 1, 176, (121) - 0, 0xc0, 220) else hl(0x145, (1 + 1), (10 + 12), 32, 239, 212)
xo[hl((1 + 24), (4 + 1), (8) - 0, (41) - 0, (21 + 125))](pk)
local ur = if 1 > (2) - 0 then 1 elseif (2) > 1 then 0x2 else (3) * 1
xo[hl(25, (4 + 1), (8), 41, (146) - 0)](ur)
local function ei() local fy = {[hl(329, 1, 193, 0x5)] = 1} fy[hl(0x14c, 4, (145 + 108), (112) - 0, (171) * 1, (24), (235) * 1, (129) - 0, 0xf)] = function() fy[hl((329) - 0, 1, 193, (4 + 1))] += 1 return fy[hl(0x149, 1, (193) * 1, 5)] end return fy:bump() + fy:bump() end
xo[hl(0x19, 5, (8), 0x29, 146)](ei())
local ym = function(zk) return function(cd) return function(wd) return zk + cd + wd end end end
xo[hl((25), 0x5, (8) * 1, (41), (146) * 1)](ym(1)((2) - 0)((3) * 1))
xo[hl(0x19, (5) - 0, (5 + 3), (10 + 31), (146))](hl((338), 4, (17 + 11), 0x36, (51 + 34), (225)))
__realPrint("###PVOBF_OUT###\n" .. table.concat(__out, "\n"))
