local aa = "\x00\x05c\xa2\x8f\xf6g\x00\x0c>4\xc0\xfe\xaa\x17z\x91\x1bM\x01V\x00\x05\xbc\xfbf\xb1*\x00\x06\xe1\xcd*\xe7\xe62\x00\x05\xdejd\xe9\x86\x00\x06\xa5\xdaq\xcc\x03\x86\x00\x05\x0b\x91\x10U\x20\x00\x05\xb1\xcf\xaf\xda\x04\x00\x06\xe0\xa2@D\x85\xdc\x00\x05y\x9fX\xc1\x9c\x00\x03uQ\xe8\x00\x03\xe5S\x9f\x00\x01\x05\x00\x03\x02\x97\xa2\x00\x01\xc4\x00\x03\xec\xb1;\x00\x04\x8e\x03\xa9-\x00\x033K\xde\x00\x01U\x00\x01\x0e\x00\x01\x8f\x00\x01>\x00\x03\x98\xadC\x00\x03x\xde\x9c\x00\x05\xdff\x1b\x07\x11\x00\x06D@\xf2\xba\xf8\x97\x00\x058\xcc\xbfH\xf6\x00\x02\xa7d\x00\x04\xe89\x97f\x00\x07\xd2\x8f\xfa\x0a\xed-C\x00\x05&\x84\x14I\xb1\x00\x05`b\xd5$\xdf\x00\x04\xabj\xc1\x7f\x00\x03\xcc\xb3\xde\x00\x04\xe2\xa8\xf9\x19\x00\x06\x9eW\xdd\x91\x1e\x01\x00\x06\x9c\xf2Z\x1c\x16=\x00\x04/\xd82`\x00\x18\x14G\xc04Z\x01c\x81\x0c\x91\xf1w\xa6\xe4n\xd3\xf1\x8aE<\xa6-[\xda\x00\x100+i\xf3\x9bk\xb4\xdf\x8dz\xdcV\xc8\xbb\x05\x9a\x00\x01:\x00\x06\xee\xdf\xd2\xf7\x15\xf8\x00\x06\xce2\xddP\x00\x7f\x00\x01\x9b\x00\x05\x22A\xdaIW\x00\x01\xf5\x00\x02\xbc\xbb\x00\x02\x1b\xa5\x00\x03\x04\x07Z\x00\x02o\xf9\x00\x01P\x00\x04l/\xec\x83\x00\x04\xdd\xaa\xed\xeb\x00\x02um\x00\x0e\xaf!|\xef\xfeQ\x1e\xf7W3c\xd2\xd9\xc4\x00\x0a\xabw,\xab\x04\xafgh\x1d`"
local function yq(s, n, ...) local k = {...} local o = {} for i = 0, n - 1 do o[i + 1] = string.char(bit32.bxor((aa:byte(s + i) - i * 0xd) % 256, k[i % #k + 1])) end return table.concat(o) end
local on = {[yq((3) * 1, (5) * 1, 1, (30 + 222))] = bit32, [yq((2 + 8), (12) * 1, (77) - 0, (35 + 31), 0xd2, (29 + 157), 0x13, (162) - 0)] = setmetatable, [yq(24, 5, (204) - 0, 156, (37) - 0, 0xe4, 0x82)] = print, [yq(31, (6) * 1, (146), (180), (98) - 0, (169) * 1, 220, 0x96)] = string, [yq(39, (5) * 1, (174) - 0, 62, 0x2b)] = pcall, [yq((46) * 1, (6), (105 + 99), (189) - 0, 0x36)] = ipairs, [yq((54), (5) * 1, (110) * 1, 0xf6, 132, 65, (158) * 1)] = error, [yq(61, (5) * 1, (37 + 156), 163, (252) * 1)] = pairs, [yq((68) * 1, (1 + 5), 147, (34 + 206), (74) * 1, (120) - 0, (50) * 1, (239) - 0, 217)] = select, [yq(76, 5, 13, (243) * 1, 92, (246))] = table}
local function e(q, h) return q + h end
local function p(l, ...) local o = {...} return yq(83, 3, 0x1d, (45) - 0, (31 + 207), (19) - 0, (30 + 2)) .. (l .. (yq(0x58, (3) * 1, 0xc5, (29 + 11), (160 + 24), 40) .. #o)) end
local y = {[yq((93), 1, 0x7d, (130) - 0, 0xd4)] = 1, [yq((96) * 1, 3, (56 + 67), (170) * 1, (242) * 1, (174) * 1, (107) - 0, (7))] = (2) * 1, (1 + 2), [yq((101), 1, 162, (163) - 0, (25 + 30), (127) - 0)] = function(u, j) return j + u[yq((68 + 25), 1, (125), 130, 0xd4)] end}
on[yq(24, (5), (9 + 195), (156) * 1, (26 + 11), (228) - 0, (77 + 53))](y[yq(93, 1, (125) * 1, (130) - 0, (212) * 1)] + y[yq((68 + 28), (3) * 1, 123, (170), (242) - 0, (174), 0x6b, (4 + 3))] + y[1])
on[yq(0x18, 5, 204, (51 + 105), (37) * 1, 228, (130) - 0)](y:f(y[yq((93) - 0, 1, (125), (130), (69 + 143))]))
local w = 0
for z = 1, 10 do w = w + z local qn = false and true end
on[yq(24, (5) - 0, (204), (156) * 1, 37, (228), (130) * 1)](w)
local hs = 1
for jg = 2, 10, 0x2 do while false do local fr = 1 end hs = hs * jg end
on[yq((8 + 16), 0x5, 204, (81 + 75), 0x25, 228, 130)](hs)
local m, uf, ua = 0, 0, 0
for gy, ls in on[yq((60 + 1), (5), (193) * 1, (163) - 0, 252)](y) do local pn = false and true ua = ua + 1 end
on[yq((24), (3 + 2), 204, (156) * 1, 0x25, (18 + 210), 130)](ua)
local rd = 1
while rd < 0x5 and true do rd = rd + 1 if rd == (3) then while false do local fp = 1 end local zk = false and true break end while false do local py = 1 end end
if 1 > (2) then local eo = 3 end
on[yq(0x18, (5), 0xcc, (156) * 1, 37, (228) - 0, (35 + 95))](rd)
local ff = 0
repeat local tp = false and true local ct = (2) * 1 * 0 ff = ff + 1 until ff >= (4) - 0
on[yq((24), (5) - 0, (204) - 0, 156, (37), (228) * 1, (128 + 2))](ff)
if w > 0x28 and true then local bf = 0x9 * 0 on[yq((24) * 1, 5, 0xcc, (156), (37) * 1, (228), (130))](yq(0x68, (3) - 0, (142) * 1, (205), 70, 0x8f, (14), (41), (154))) local re = false and true elseif w == 0 or false then local ox = false and true local ik = (9) * 1 * 0 on[yq((24) * 1, (5) - 0, (204) - 0, 0x9c, (17 + 20), 0xe4, 0x82)](yq(109, 4, 0xf4, (147), (253) * 1, 105, (126), (15 + 69), (164))) else local rx = (6 + 3) * 0 on[yq(24, (5), 204, 156, 37, 228, 0x82)](yq(0x73, 3, (94) * 1, 87, (49 + 111))) end
local yw = on[yq((68), 6, (147) - 0, 0xf0, 74, 0x78, (50) * 1, (239) * 1, (45 + 172))](yq(0x78, 1, (118), (87) - 0, 247, (7 + 41), 184), 1, 0x2, (3) - 0)
on[yq((24) - 0, (5) * 1, (139 + 65), 156, (19 + 18), (228) - 0, (130) * 1)](yw)
on[yq((24), 5, 204, (156) - 0, (37), 228, 130)](on[yq(68, (6) * 1, 0x93, (240) - 0, (74), (120) * 1, 50, (72 + 167), (42 + 175))](0x2, yq((14 + 109), 1, 111, 93, 71), yq(126, 1, (68 + 169), 100), yq((129) - 0, 1, (93), (12) * 1, (103) * 1, (85) - 0)))
local function vs(lm) if lm < (1 + 1) then return lm end return vs(lm - 1) + vs(lm - (2) * 1) end
on[yq((9 + 15), 5, 204, (60 + 96), (37) - 0, (43 + 185), 0x82)](vs(0xa))
local sa = (function() local ty = 0 return function() ty = ty + 1 return ty * (2) * 1 end end)()
sa()
on[yq((24), 5, (198 + 6), 0x9c, 37, 228, (130))](sa())
local function hw() local pe = 0 local function sb() pe = pe + 1 end local function fa() return pe end return {[yq((132) * 1, (3) * 1, 0xf1, (168 + 38), (19 + 55))] = sb, [yq((137) - 0, (3) * 1, (31) - 0, (22 + 158), (183 + 63), 0x48)] = fa} end
local by = hw()
by:inc()
local kf = false and true
by:inc()
on[yq(0x18, (3 + 2), (204) - 0, 156, 0x25, 0xe4, (130) * 1)](by:get())
local function ky(...) local lu = {...} local bz = 0 for yf, dx in on[yq(0x2e, 0x6, 0xcc, (75 + 114), (54))](lu) do bz = bz + dx end return bz end
on[yq((24), 5, (204) * 1, (156) - 0, (37) * 1, (96 + 132), 130)](ky(1, (2) - 0, (3) * 1, (4)))
on[yq(0x18, 5, 0xcc, (156), (37), 0xe4, (130) * 1)](ky())
local lh = yq((116 + 26), 0x5, (190) * 1, (78 + 5), (11 + 88), (233) * 1)
on[yq((10 + 14), 5, 204, (156) * 1, 37, (228), (82 + 48))](#lh, lh:sub(0x2, (1 + 2)), lh:upper(), on[yq(31, (2 + 4), (146), 0xb4, (98) * 1, (12 + 157), 220, 150)][yq((149) - 0, (1 + 5), (10 + 24), (81 + 11), (16 + 154), (254) * 1, (165) - 0)](yq(157, (5) - 0, (29) * 1, (219), (86 + 50), 0x4, (177) - 0, (134) - 0, (76 + 57)), (35 + 7), yq(164, (2) * 1, (200) * 1, (60), 74, 232, (97), (3) - 0, 138)))
on[yq((24) * 1, (2 + 3), 0xcc, (156), (37), 228, 130)](yq((93) - 0, 1, (47 + 78), (130) - 0, 212):rep(3))
local hr, rl = on[yq(39, 5, (89 + 85), (30 + 32), 43)](function() on[yq(54, 0x5, 110, 0xf6, (71 + 61), 65, (158) * 1)](yq((168), (4) - 0, 138, 0x43, (18) - 0, 0x52, (102))) end)
on[yq(24, 5, 204, 156, (11 + 26), (228) * 1, (130))](hr, rl)
local ph = on[yq((10) - 0, (7 + 5), (77) * 1, 66, (210) - 0, 186, 19, 0xa2)]({}, {[yq((174) * 1, 7, 0x8d, (221) * 1, 0x89)] = {[yq((183) - 0, (5) * 1, 78, (18) * 1, (150) * 1)] = yq(0xbe, (5) - 0, 23, 58, 201, (145), (90 + 117))}})
on[yq(24, (5) * 1, 204, (156) - 0, 0x25, 228, 130)](ph[yq(183, (5), 0x4e, (18) * 1, (150))])
local rv = on[yq((2 + 1), (2 + 3), 1, (252) - 0)][yq((197), (4), (201) * 1, (9 + 51))]((5) - 0, (3)) + on[yq(0x3, (5), 1, (252) * 1)][yq(203, (3) * 1, (174) - 0, 201, 182)](5, (3) * 1) + on[yq(3, (3 + 2), 1, (252) - 0)][yq((25 + 183), 0x4, (86 + 42), (227) - 0, (176))]((5) - 0, (3) * 1) + on[yq(0x3, 0x5, 1, 252)][yq(214, (4 + 2), (242), (57), 171, (1 + 2), 0x8c, (180) * 1)]((5) - 0, 2) + on[yq((3) * 1, 5, 1, (96 + 156))][yq((222) - 0, 6, (238), 150, 40, (130 + 26), 0x84, 0x88, 22)]((8), 1) + on[yq(3, (1 + 4), 1, 0xfc)][yq((230) - 0, (4) * 1, (77) * 1, (165) * 1, 119)]((5))
on[yq(24, (5) * 1, 0xcc, 0x9c, (37), (177 + 51), (130))](rv)
local bs = 2 ^ (10) * 1
local nk = (10) - 0 // 3
on[yq((24) - 0, 5, 0xcc, (156), 37, (228) - 0, 130)](bs, nk)
local bk = not false
local uw = 1 < (2) and 3 >= (3) - 0 or nil
on[yq(0x18, (5), (204) * 1, 0x9c, (37) - 0, 228, (130))](bk, uw == nil)
local function ws() return 1, 0x2, 3 end
local ej, px, vn = ws()
on[yq((24) * 1, (5) - 0, (204) * 1, (131 + 25), (37) * 1, 0xe4, 130)](ej, px, vn)
local wv = yq(236, (2 + 22), (121), (79) * 1, (202) * 1)
on[yq(0x18, 5, 0xcc, 156, (17 + 20), (228), 130)](#wv)
local iv = yq((39 + 223), (16) - 0, (62 + 9), (119) - 0, 59, (54 + 110))
on[yq((24) * 1, (3 + 2), 204, 156, 0x25, 0xe4, (130) - 0)](#iv)
local yo = 0xff
local bi = (150)
on[yq(24, (2 + 3), (204), 156, (37) - 0, 0xe4, 0x82)](yo, bi)
local ji = {[yq((78 + 45), 1, 0x6f, 0x5d, 71)] = {[yq((67 + 59), 1, 0xed, (100) * 1)] = {[yq(0x81, 1, 93, 0xc, 0x67, (64 + 21))] = {[yq(280, 1, (94), 0x45, (204 + 44), (90))] = (5 + 2)}}}}
on[yq((23 + 1), 0x5, 0xcc, 0x9c, 37, (228), (130))](ji[yq((123) - 0, 1, 111, 93, 0x47)][yq(126, 1, 0xed, (99 + 1))][yq((129), 1, (38 + 55), (12), (103) - 0, (85))][yq((280) * 1, 1, (94), (69), (248), 0x5a)])
local function iz() return on[yq((10) - 0, 12, 0x4d, (28 + 38), 210, (186) * 1, (11 + 8), 162)]({}, {[yq((283) * 1, (6), 177, (141) - 0, (57 + 162))] = function() return 0x63 end}) end
on[yq(24, 5, 204, (156) * 1, (37), (114 + 114), 0x82)](iz()())
local ba = {}
for wt = 1, 0x6 do if 1 > (2) - 0 then local zu = 0x3 end if wt % 2 == 0 and true then local ll = false and true while false do local tl = 1 end continue end ba[#ba + 1] = wt end
on[yq(0x18, (5) - 0, (204) * 1, 0x9c, 0x25, (228), (130) * 1)](on[yq(76, (5) - 0, (4 + 9), 0xf3, 92, 246)][yq((23 + 268), (6), (173) * 1, (74) * 1)](ba, yq((299) - 0, 1, (183), (20 + 187), 18)))
local rp = {}
for oy = 1, 5 do if oy == (3) and true then local hl = false and true continue end if oy > 0x4 or false then local eu = (9) * 0 while false do local kx = 1 end break end while false do local wr = 1 end rp[#rp + 1] = oy end
on[yq((24) - 0, 0x5, 0xcc, 0x9c, 0x25, (208 + 20), (130))](on[yq((76) - 0, 5, (13), (243), (92) - 0, (45 + 201))][yq((208 + 83), 0x6, 173, 74)](rp, yq((299) - 0, 1, 183, (207), (7 + 11))))
local function pr(ab, ...) return on[yq((31), 0x6, 0x92, (180), 0x62, (36 + 133), 220, 150)][yq((136 + 13), 0x6, 0x22, 0x5c, 170, (181 + 73), (165) - 0)](ab, ...) end
on[yq(24, (5) * 1, (204) - 0, 156, (18 + 19), (154 + 74), 0x82)](pr(yq((302), (1 + 4), (3 + 4), (71) - 0, 0xfd), yq((277 + 32), 1, 131, (92), 139, 101), 5))
local function xz() local cs = 1 cs += (4) cs -= (2) * 1 cs *= (3) - 0 cs //= 0x2 cs %= (7) - 0 cs ^= (4) - 0 return cs end
on[yq((24) * 1, 5, (204) * 1, 0x9c, 37, (14 + 214), 130)](xz())
local function iq() local um = yq((312) * 1, 2, 221, 204, (114) - 0) um ..= yq((316), 0x2, (120) - 0, (252), 136, 202, 165, (98)) um = on[yq((3) * 1, (5) * 1, 1, (252))][yq((197) - 0, 4, 201, 60)](#um, (255) - 0) return um end
on[yq((24) - 0, 5, (204) - 0, (156) - 0, (37) - 0, (157 + 71), 130)](iq())
local ix = if 1 < (1 + 1) then yq(0x140, (2 + 1), (125) - 0, 0x9f, 0x33, (195) * 1, (176) * 1, (78), 173) else yq((325), (2), 1, (131) * 1, 4, (73 + 24), 212, (64) * 1)
on[yq((24) - 0, (5) - 0, 204, (137 + 19), 0x25, (228) * 1, (103 + 27))](ix)
local ic = if 1 > (2) then 1 elseif (2) * 1 > 1 then (1 + 1) else 0x3
on[yq((24), 0x5, 204, 156, (37) - 0, (69 + 159), (66 + 64))](ic)
local function fm() local ur = {[yq((329) * 1, 1, 62, (40) * 1)] = 1} ur[yq((332) - 0, (3 + 1), (14), 0x57, 0xbf, (44) * 1, 0x6, 2)] = function() ur[yq((46 + 283), 1, 62, (28 + 12))] += 1 return ur[yq((329), 1, 62, (40) - 0)] end return ur:bump() + ur:bump() end
on[yq(0x18, (5) * 1, (142 + 62), (108 + 48), 37, (228), 130)](fm())
local zx = function(pg) return function(vj) return function(fk) return pg + vj + fk end end end
on[yq((24), (5), 204, 156, 37, 228, (81 + 49))](zx(1)(2)((3) - 0))
on[yq(24, (5) * 1, (204), (156) * 1, (37) - 0, 0xe4, (130) - 0)](yq(0x152, (4) * 1, (185), (242) * 1, (189), 161))