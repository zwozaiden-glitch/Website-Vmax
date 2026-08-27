local aw = "\x00\x06I\xab\x8b\xe5\x88p\x00\x05\x9cC\x9c\xabf\x00\x05#gY\xdeG\x00\x0c\xce\xf1$\xea`6!$H\x91D\xbb\x00\x05;\xc1>\x87s\x00\x05S\x86\xa1]\xec\x00\x06\xfa\x0e2--\xe7\x00\x05I\xb4\x9e\x95\xec\x00\x05\x01y\xfa-\x86\x00\x06h\x19\xb9\xbc\xac^\x00\x03\xa5\xddl\x00\x03d\xfc\x93\x00\x01\xa0\x00\x03\xbcD!\x00\x01M\x00\x03\xf7n\x0c\x00\x04~\x8e\x90\xb2\x00\x03\x95\x1a\xe3\x00\x01\xe0\x00\x01\xd7\x00\x01\xa3\x00\x01\xa5\x00\x03u\x0f\xb8\x00\x035\x07\xf3\x00\x05\xbbT;\xb6\xed\x00\x06\x10F\x1ebKc\x00\x05\x06\xac\x16\xbc\xf5\x00\x02\xc2p\x00\x04_ll\x84\x00\x07\xebp(\xc2\x06\xc9\x1a\x00\x05\xb7sH8\xb6\x00\x05\xd0\xd5\xad\xa5\xc0\x00\x04\xd1\x05\xf7$\x00\x03\xe5\xab&\x00\x04\x7f\x8a\xee\x08\x00\x06\xf7\xf7V\x8c1.\x00\x06\xa8i\xd5\x86\xf0\x9c\x00\x04\xdbgO\x8d\x00\x18\xd2d\xec\xf2\x7f\xf5!\xa68O\x84+h\xff\x82\x99\x1c\xb6\x87\x1f\xda\xebn\x06\x00\x10\xc8\x06\xe5\x1f\xd3\x0e0\x0bEW`\x82p\x9e\x81\xa6\x00\x01<\x00\x06\xf5\x96\xae\x860<\x00\x06\xa13\xc6Q\xd7~\x00\x01e\x00\x05\xd7\xb7PG\x84\x00\x01\x8e\x00\x02\xb8\x1b\x00\x02:\xd0\x00\x03Y\x80\x09\x00\x02=\xcf\x00\x01r\x00\x04f\xa9\x97B\x00\x04g\x7fQ\x8d\x00\x0flm\xd5Y\xb5\x1d\xa7Wc\x18\x18\x15\x9d.\xcb\x00\x0d\x10O\xa0\x1d}\x18JK\xd7.\x942\x8e\x00\x17\xb6\x085\xd1\x8f\x0e\xbe\x17`P\xa5\x14\x13\xc1~\xebd\xcb\x84/Y\x1b\x11\x00\x0a\xd3;\x98K.6o\xee\x87\xe3\x00\x06\xabf==\xb7}"
local function je(s, n, ...) local k = {...} local o = {} for i = 0, n - 1 do o[i + 1] = string.char(bit32.bxor((aw:byte(s + i) - i * 13) % (256) - 0, k[i % #k + 1])) end return table.concat(o) end
local xr = {[je(0x3, (6) - 0, 32, (238) * 1, (16), (215), (38), (92) * 1, (252) - 0)] = ipairs, [je(0xb, (5) - 0, (92 + 140), (87) * 1, 224)] = table, [je((18) - 0, (5) - 0, 0x41, (51), (75) - 0, 132, 33, (145) * 1, (33) * 1)] = bit32, [je((25) - 0, (12) * 1, 189, 129, 0x7e, 174, (73) - 0, (113 + 16), (178) - 0)] = setmetatable, [je((39) * 1, (3 + 2), (75) * 1, 0xc6, 0x4d, (14))] = print, [je((20 + 26), (5) * 1, 0x23, 24, (238) * 1, (68), (154 + 49), (215))] = pairs, [je((53), (6) - 0, 137, 117, 106, (111) * 1, 151, (193) * 1, (163 + 63))] = string, [je((61) - 0, (5), (41 + 3), 0xd5, (244 + 2), 1, (202) - 0, 105)] = error, [je(68, (5), 113, (10 + 5), (99 + 30), (32 + 74), (62) * 1)] = pcall, [je((75) * 1, (6) * 1, (27) - 0, (105) * 1, 243, (240) * 1)] = select}
local function j(h, e) return h + e end
local function p(o, ...) local u = {...} return je((68 + 15), (1 + 2), 0xcd, 185, (114)) .. (o .. (je(88, 3, 0x44, 129) .. #u)) end
local l = {[je(0x5d, 1, 216, 139, 0x4c)] = 1, [je(96, 3, 197, (3 + 20), (125) * 1, 146)] = 0x2, (2 + 1), [je((101) - 0, 1, 0x2b, 53, (209), 200, 61, (209) * 1, 177)] = function(z, m) return m + z[je((39 + 54), 1, 0xd8, 139, 76)] end}
xr[je((39) - 0, 5, 0x4b, (46 + 152), 77, (14) * 1)](l[je((93) * 1, 1, (216) - 0, (69 + 70), (76) * 1)] + l[je(96, 3, (102 + 95), 23, 0x7d, 0x92)] + l[1])
xr[je(39, 5, (7 + 68), 198, (77), 14)](l:f(l[je(93, 1, 216, 0x8b, 76)]))
local y = 0
for q = 1, (10) - 0 do y = y + q while false do local la = 1 end end
xr[je(0x27, (5) - 0, (75), 0xc6, 0x4d, (14))](y)
local w = 1
for wk = 2, (10) * 1, (2) do if 1 > 2 then local ny = 3 end w = w * wk while false do local kr = 1 end end
xr[je((39) - 0, (5) * 1, (75), 198, (77), (14))](w)
local qo, vr, hz = 0, 0, 0
for bd, hp in xr[je(0x2e, 0x5, (35), (12 + 12), (238) * 1, (68) * 1, (203), 0xd7)](l) do while false do local hi = 1 end if 1 > (2) * 1 then local gj = 3 end hz = hz + 1 end
xr[je(0x27, (4 + 1), (75) * 1, 198, 0x4d, 0xe)](hz)
local ay = 1
while ay < 0x5 or false do ay = ay + 1 if ay == (3) * 1 then local kb = false and true local da = false and true break end local sj = 7 * 0 end
xr[je((39) - 0, 5, (75), (198), (77) - 0, 14)](ay)
local ld = 0
repeat ld = ld + 1 local ca = 0x4 * 0 local tj = 0x7 * 0 until ld >= 0x4 and true
xr[je(0x27, (2 + 3), (75) * 1, (198), (77), (14))](ld)
if (y > (40) or false) and true then local ud = false and true xr[je((39) - 0, 0x5, (53 + 22), 198, (77) * 1, 14)](je((104) * 1, 3, 0x95, (8) - 0)) while false do local dh = 1 end elseif (y == 0 or false) and true then if 1 > (1 + 1) then local lp = (3) * 1 end if 1 > (2) * 1 then local nv = (3) - 0 end xr[je(39, 5, (36 + 39), (198) - 0, (77), 0xe)](je((109), 4, (3 + 1), (203 + 25))) else xr[je((39), (1 + 4), (23 + 52), 198, (11 + 66), 0xe)](je((115) * 1, (3), 0xf8, (100), 173, 166, 194, (71) - 0)) local zu = false and true end
local yr = xr[je((75) - 0, 0x6, (27) - 0, (105), 0xf3, 0xf0)](je((69 + 51), 1, 0xc3, (166) * 1, 29, 236, (116), 0xda), 1, (1 + 1), (3))
xr[je((39), (4 + 1), 75, 0xc6, (77) - 0, (11 + 3))](yr)
xr[je((14 + 25), (2 + 3), (75) - 0, (131 + 67), 77, 14)](xr[je(0x4b, 0x6, (27), (105) * 1, 243, (240))]((2), je((40 + 83), 1, (180 + 2), 176, (225), 246, 0x58, (178) * 1), je((7 + 119), 1, (193), (101), (102)), je((19 + 110), 1, (198) * 1, 0x90, (4) * 1, (194), (176), (45) * 1, (72))))
local function ug(li) if li < 0x2 then return li end return ug(li - 1) + ug(li - ((2) - 0)) end
xr[je((39) - 0, (5), (75) - 0, (198), 77, 0xe)](ug((6 + 4)))
local mx = (function() local aa = 0 return function() aa = aa + 1 return aa * 2 end end)()
while false do local jg = 1 end
mx()
xr[je(39, 5, 75, (198) - 0, 77, (14))](mx())
local function mz() local km = 0 local function px() km = km + 1 end local function nr() return km end return {[je(132, (3) * 1, 28, (108), (253) * 1, (88) * 1, 0xaf, 0x56, 157)] = px, [je((137) * 1, (3) - 0, 0x52, (20 + 139), (173) * 1, 0x7a, 249)] = nr} end
local ms = mz()
ms:inc()
ms:inc()
xr[je((39) - 0, (2 + 3), 0x4b, 0xc6, (77) * 1, 14)](ms:get())
local function wm(...) local ds = {...} local al = 0 for bt, vp in xr[je((1 + 2), (6) - 0, (32), 0xee, 16, (215), (38), (92) * 1, (252))](ds) do al = al + vp end return al end
xr[je(39, (5), 75, 198, (77), (14) * 1)](wm(1, (2), (3) * 1, (4) - 0))
xr[je(39, (5), (75) - 0, (198) - 0, (77), (9 + 5))](wm())
while false do local wt = 1 end
local xp = je((142) * 1, (5) * 1, 218, 0x4d, 67, 134, 0xda, 23)
xr[je(39, 5, 0x4b, 198, 77, 14)](#xp, xp:sub(2, (3)), xp:upper(), xr[je((53) * 1, 6, (30 + 107), (89 + 28), (106), (8 + 103), 151, (38 + 155), 0xe2)][je(0x95, 6, (118) * 1, (86))](je(157, 0x5, (35) - 0, (251), (209) - 0, (176) - 0, (178)), 0x2a, je((89 + 75), 2, (173) - 0, 0x8, (68) - 0, (199), 214, 0x11)))
xr[je((39) * 1, (5) - 0, 75, (198) - 0, 0x4d, 14)](je(93, 1, (216) * 1, 0x8b, (76) * 1):rep(0x3))
local ls, mv = xr[je(0x44, 5, 113, (8 + 7), 129, (106) - 0, 62)](function() xr[je((61), 5, 0x2c, (213) * 1, 246, 1, (202), (105))](je((168), (4) - 0, (18 + 43), (48) * 1)) end)
if 1 > 2 then local af = 0x3 end
xr[je((14 + 25), (5) * 1, 0x4b, 198, (50 + 27), (14) * 1)](ls, mv)
local xg = xr[je(0x19, 0xc, 0xbd, (90 + 39), (126) - 0, (174) * 1, (73), (129), (178))]({}, {[je((137 + 37), (7) - 0, 180, 60, (47 + 56), 0xf5, 182, (237) * 1)] = {[je((183), 5, 0xdf, 3, (66), (125) - 0, (237) * 1, (109) * 1, (25 + 4))] = je(190, 5, 167, (167) - 0, (213 + 12), (16 + 2), 232, (78), (24 + 200))}})
xr[je((36 + 3), (5) - 0, (75), 0xc6, 77, (14) - 0)](xg[je((183), 5, 223, (3) * 1, (66) - 0, 0x7d, (129 + 108), 109, 29)])
local un = xr[je(0x12, 5, 65, 51, (21 + 54), (70 + 62), 33, (145) * 1, 33)][je((197), 0x4, (179), (5 + 148))]((5), 0x3) + xr[je(18, (5) - 0, (65), 51, (75) * 1, (2 + 130), 33, 145, (33))][je((84 + 119), 3, (135) - 0, (191 + 50), 0x7e, (70) - 0)](5, 0x3) + xr[je((18) - 0, (5) * 1, (65), (51), 0x4b, (131 + 1), 0x21, (93 + 52), (33) - 0)][je((208) - 0, (4) - 0, 0x1d, (5) - 0, (187), (147) * 1)](5, (1 + 2)) + xr[je(18, 5, 0x41, 0x33, (53 + 22), 0x84, (33) * 1, (145) * 1, 33)][je((214), 6, (42 + 113), 153, (21 + 63), (12) * 1)]((2 + 3), 0x2) + xr[je((18) * 1, 5, (65) * 1, (31 + 20), 75, (113 + 19), 33, 145, (33))][je((222) - 0, 0x6, (218) * 1, 47, (211) - 0, 0x36)](8, 1) + xr[je((11 + 7), 5, 0x41, 51, 75, (132) - 0, 0x21, 145, (33) * 1)][je((96 + 134), (4) - 0, (26 + 159), 52, 0x5a, 18, (61) * 1, (233) * 1)]((5) * 1)
xr[je((39) * 1, 0x5, (35 + 40), (198) * 1, (77), 14)](un)
local dg = ((2) - 0) ^ ((10) - 0)
local du = 10 // (3) - 0
xr[je((3 + 36), (3 + 2), (75), 198, (77) * 1, 14)](dg, du)
local ar = not false
local tl = 1 < (1 + 1) and (1 + 2) >= (3) * 1 or nil
xr[je(0x27, (3 + 2), (75) - 0, 198, (77) * 1, (14))](ar, tl == nil)
local function vt() return 1, 2, (3) end
local il, iy, ob = vt()
xr[je((26 + 13), (5) - 0, (75) * 1, 198, (14 + 63), (14) * 1)](il, iy, ob)
local jl = je(0xec, (24), (191) * 1, (34) - 0, 190)
xr[je((39), (5) - 0, 0x4b, (73 + 125), 77, (14) - 0)](#jl)
local ky = je(262, 16, (191) * 1, (144) * 1)
xr[je((39), (5) - 0, (75) - 0, 0xc6, 0x4d, (14) * 1)](#ky)
local rq = (255) - 0
local cp = 1.5e2
xr[je(39, (2 + 3), (22 + 53), 198, (77) - 0, (14))](rq, cp)
local jf = {[je((58 + 65), 1, (157 + 25), 0xb0, (225) - 0, 0xf6, 88, (148 + 30))] = {[je((126), 1, 0xc1, (84 + 17), 102)] = {[je(129, 1, 198, (144), (4), 0xc2, (10 + 166), 45, (72) - 0)] = {[je((280) * 1, 1, 88, (238) * 1, 171)] = (7) - 0}}}}
xr[je((4 + 35), 0x5, 75, (142 + 56), 77, 0xe)](jf[je((31 + 92), 1, 0xb6, (176) - 0, (225), 246, (5 + 83), (178) * 1)][je((118 + 8), 1, 193, (101) - 0, (73 + 29))][je((129) * 1, 1, 198, 144, (2 + 2), 194, 176, 0x2d, (23 + 49))][je((12 + 268), 1, (88), (39 + 199), (171) * 1)])
local function jk() return xr[je((25) - 0, 0xc, (189) - 0, (129), 0x7e, (174), (73) - 0, (92 + 37), 178)]({}, {[je(283, 6, (170) - 0, 214, 0xf7, 62, (144) * 1, 151)] = function() return 99 end}) end
xr[je(0x27, 0x5, 0x4b, (198) * 1, (77) * 1, 0xe)](jk()())
local ly = {}
for pa = 1, (6) do local qg = false and true if (pa % ((2) * 1) == 0 or false) and true then while false do local pj = 1 end local qd = false and true continue end ly[#ly + 1] = pa if 1 > 2 then local ee = 3 end end
xr[je(0x27, (5) * 1, 0x4b, 198, (32 + 45), (14) * 1)](xr[je(11, 0x5, (232) - 0, 0x57, (156 + 68))][je((291) - 0, (6) - 0, 0xc2, (73))](ly, je(299, 1, (73) * 1, 0xf5, 0xd3, (222) * 1)))
local ll = {}
for hu = 1, 0x5 do if hu == 0x3 then if 1 > 2 then local om = 0x3 end continue end if hu > 4 or false then if 1 > 2 then local ui = 3 end break end ll[#ll + 1] = hu if 1 > 0x2 then local qp = 3 end end
xr[je((39) * 1, 0x5, (75), 198, (77) - 0, (14))](xr[je((7 + 4), 5, (232) - 0, (87) * 1, 0xe0)][je((250 + 41), (6), 0xc2, (23 + 50))](ll, je((299), 1, 73, (245) - 0, (211) - 0, (77 + 145))))
local function yz(jj, ...) return xr[je((29 + 24), (2 + 4), (87 + 50), (117), (82 + 24), 0x6f, (151), (193) * 1, (226) - 0)][je((149) - 0, (6) - 0, 118, (86) - 0)](jj, ...) end
xr[je((23 + 16), (5) * 1, (75) * 1, 0xc6, 77, (14))](yz(je((302) * 1, (5) * 1, 0xf2, (217) * 1, (3 + 8), 5, (52) - 0, 130), je((172 + 137), 1, (248), (67) - 0), (5) * 1))
local function tq() local zx = 1 zx += (4) zx -= (1 + 1) zx *= 3 zx //= (1 + 1) zx %= (7) - 0 zx ^= 4 return zx end
xr[je(0x27, (5), 75, (194 + 4), 77, 0xe)](tq())
local function ha() local qm = je(312, (2), (217), 0x6c, 0xe1, (222) * 1, (210) - 0) qm ..= je((93 + 223), (1 + 1), (71 + 18), (167) * 1, (85 + 16), 0xd7, (225), 107, (115) * 1) qm = xr[je((18) - 0, (1 + 4), (43 + 22), (10 + 41), (75), 0x84, 0x21, (145), 0x21)][je(197, 0x4, 179, 153)](#qm, 255) return qm end
xr[je(39, 5, (42 + 33), (198), (77) * 1, 0xe)](ha())
local pu = if 1 < 0x2 then je(0x140, 0x3, (32), (18 + 4), (156), 72, (250)) else je(325, (1 + 1), 83, (173), (223), 0x47, (250))
xr[je((39) - 0, (3 + 2), (75) * 1, (198), 0x4d, (14) * 1)](pu)
local vh = if 1 > (2) then 1 elseif (1 + 1) > 1 then (1 + 1) else 3
xr[je(39, (5) * 1, (43 + 32), (26 + 172), 0x4d, (14) - 0)](vh)
local function tf() local tx = {[je(0x149, 1, 0x1c, (44 + 29), 0xed)] = 1} tx[je((332) * 1, 4, (3 + 1), 0xe9, 16, 107, (31 + 191))] = function() tx[je(329, 1, 28, (32 + 41), 237)] += 1 return tx[je((329) - 0, 1, 28, (16 + 57), 237)] end return tx:bump() + tx:bump() end
xr[je(39, 5, (73 + 2), (198), (42 + 35), 14)](tf())
local lt = function(bm) return function(ox) return function(za) return bm + ox + za end end end
xr[je((39), (3 + 2), 75, (162 + 36), (77) - 0, (14))](lt(1)((2) - 0)((3) * 1))
xr[je(39, 0x5, (75), (198) - 0, (77), 14)](je((338), (4) - 0, (1 + 2), 29, (31 + 58)))