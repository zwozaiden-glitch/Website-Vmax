local qo = "\x00\x05\xe4\x8e\x17\x9f,\x00\x05\xd8\xe4\xb2\x00l\x00\x05\xa1\x81\xd1\xa0\xe4\x00\x05[\xc6El\xf3\x00\x05\xed\x86\xf6\xe3V\x00\x06\x17\xd6\xb64\x07\xca\x00\x05\xfb\xa3\xfc\xac,\x00\x06:f+S\x93J\x00\x0c\xe4\x5c\x16\xfb\xa7[D\xb9QP\xfc\x9a\x00\x06\x8e\xfcy\x7f\xf5\xf8\x00\x03\x11dq\x00\x03\xa9\x12D\x00\x01\xca\x00\x03\xd8\xbe\xef\x00\x01\x02\x00\x03\x95\x0cO\x00\x04F\x9e#z\x00\x03t\x8e\x1f\x00\x01\x92\x00\x01\x02\x00\x01\x8b\x00\x01\xbd\x00\x03\x8f\xeb\xd0\x00\x03\x03\x80]\x00\x05\xfb6\x91\xba\xaf\x00\x06\x91\x80\xf6\xf2\x1b2\x00\x05\xdb)\xed\x84\xc1\x00\x02\xa0i\x00\x04~\xd3s\x98\x00\x07\xfeO51\xf9\xb9X\x00\x05\x90\x0d\xae0\xcb\x00\x05k^v\xcf\xac\x00\x04\x1f\xe8-\x05\x00\x03\x8b\xb6\xb5\x00\x04K\x19\x803\x00\x06\xff0i!j\x94\x00\x06,\xbb(^\xefS\x00\x041\x9c\xd4N\x00\x18\x1f\x01\xff\x97N\xc9dvWa\xa6\xe0\x8d\xb7\xb6\xab\xb7@;\x7f\x16(\x11\x17\x00\x10\x9e\x00\xb7\x19\xfd\x08\x02\x15\xf3]\x0a\x88\x1e\xa8S\xac\x00\x01\xf9\x00\x06A\x0d0\xa6gZ\x00\x06\xc2\xe6\x11\x0d(\x17\x00\x01O\x00\x05\x92[\xa4?\x07\x00\x01\x07\x00\x02u\xfb\x00\x02\x0dx\x00\x03g\x8a\x87\x00\x02\xb6\xbc\x00\x01B\x00\x04\x84\x8b*\xae\x00\x04T#P\x1a\x00\x12\x09\x1fhN\xea\x06\x82\x0a\xe5\xd7$p\xcf\x08`\xe7\xdd\x1c\x00\x16\xdfR\xd4\xa0P\xedY\x1e\xeaF\x8d\xcc\xf8N\xa6X\xa6z\xbf\xba,\xab\x00\x0f\xb0\xd3\xa1\x8c\x10,[\xc6\x8e\xd8q\x16[[2\x00\x02\xd1J\x00\x04-\xb3\xb4\x16\x00\x07\xc3\x0e\xc6E\x0e\xbbY"
local function zt(s, n, ...) local k = {...} local o = {} for i = 0, n - 1 do o[i + 1] = string.char(bit32.bxor((qo:byte(s + i) - i * 0xd) % (119 + 137), k[i % #k + 1])) end return table.concat(o) end
local ze = {[zt(3, (5) - 0, 0x94, (226) * 1, (156) - 0, 20)] = pcall, [zt(0xa, 5, 189, 165, 234, 182, (74) - 0, (20) * 1, (6 + 102))] = error, [zt(0x11, (1 + 4), (121 + 92), (21) * 1)] = table, [zt(24, (5) * 1, (43), (42 + 161), (66) * 1)] = print, [zt((6 + 25), (4 + 1), (143) * 1, (16) - 0, (168) - 0)] = bit32, [zt(38, 0x6, (100) * 1, 189, (98 + 140))] = string, [zt((46) * 1, 0x5, (139) - 0, 0xf7)] = pairs, [zt(53, (6) * 1, 73, 0x3c, 0x7d)] = select, [zt((61) * 1, (12) - 0, 151, 0x2a, (136) - 0, (185) - 0, (11 + 11), (110))] = setmetatable, [zt((1 + 74), 0x6, (231) - 0, 0x9f, (29 + 33), (26 + 23), 0xb3, (196) * 1, 195)] = ipairs}
local function l(m, e) return m + e end
local function o(u, ...) local w = {...} return zt((83) * 1, 0x3, 121, 0x3e, (119)) .. (u .. (zt(88, (3) - 0, (137) - 0, (107) - 0, (23) * 1, (91)) .. #w)) end
local h = {[zt((27 + 66), 1, 0xb2, (37) * 1, 0x17, (125) - 0, (38 + 54), 0x28, (161) * 1)] = 1, [zt((96) - 0, (3) * 1, 0xa1, 145, 175)] = (2) - 0, (3) * 1, [zt(0x65, 1, (100) * 1, 149, (239) * 1, 0x64, 129)] = function(y, j) return j + y[zt((88 + 5), 1, 178, 0x25, (23) * 1, (125) - 0, 92, (40), (161))] end}
ze[zt((16 + 8), 0x5, (43) * 1, 203, 66)](h[zt(93, 1, 0xb2, (37) - 0, (7 + 16), 125, (92) * 1, 40, 161)] + h[zt((96) - 0, (3) - 0, (161) - 0, (145), (175))] + h[1])
ze[zt(0x18, (5), 43, 203, (66) * 1)](h:f(h[zt(93, 1, (178), (37), 23, (125) * 1, (66 + 26), 0x28, 161)]))
local p = 0
for z = 1, 10 do p = p + z local qz = (5 + 2) * 0 end
ze[zt((24) * 1, 5, (18 + 25), 203, (66) - 0)](p)
local q = 1
for wc = (2) - 0, 10, (1 + 1) do q = q * wc local sa = 0x6 * 0 local zs = false and true end
ze[zt((24) - 0, (5) * 1, (43) - 0, (203) - 0, 0x42)](q)
local zf, kg, mr = 0, 0, 0
for xk, qv in ze[zt((46) * 1, (5) - 0, (139) - 0, (247))](h) do local cz = (8) * 1 * 0 mr = mr + 1 local zd = (9) - 0 * 0 end
ze[zt(24, (5), 0x2b, (203) - 0, (66) * 1)](mr)
local oc = 1
while oc < (3 + 2) or false do oc = oc + 1 local ub = false and true if oc == (2 + 1) and true then if 1 > 2 then local ye = 0x3 end local af = false and true break end if 1 > (1 + 1) then local vx = (3) - 0 end end
ze[zt((24) - 0, (2 + 3), (43) * 1, 203, 66)](oc)
local lz = 0
repeat local dw = (1 + 1) * 0 lz = lz + 1 until (lz >= (3 + 1) or false) and true
ze[zt(24, 5, (43) - 0, 203, (66))](lz)
if p > (40) - 0 and true then ze[zt((24) - 0, (2 + 3), (43) - 0, (203) - 0, (66))](zt((104) - 0, 3, 247, (150), (82) - 0, (176 + 42), (49 + 33), 0x9c)) local cc = false and true elseif (p == 0 or false) and true then if 1 > 0x2 then local mo = (3) - 0 end local xd = false and true ze[zt(24, 5, 43, (203) * 1, 0x42)](zt((42 + 67), 0x4, (60) - 0, (244) - 0, 123)) else local ux = false and true ze[zt((24) * 1, 5, 43, (203) - 0, 0x42)](zt(115, 3, (25) * 1, (168 + 64), (97) - 0)) end
local uf = ze[zt((53) - 0, (6), 73, (60) * 1, (8 + 117))](zt((120), 1, 177, (10 + 3), 0x89, 70, (10 + 31), (7 + 90)), 1, 2, (3) - 0)
ze[zt((24), 5, (43) * 1, (203), (66))](uf)
ze[zt(24, (5) * 1, (43) * 1, (203), (66) * 1)](ze[zt((53) - 0, (6), 0x49, (57 + 3), 125)]((2) - 0, zt((123) * 1, 1, (99), 0x94, (160) - 0, (71), 0x6b, (103 + 20), 126), zt((126) - 0, 1, 233, (28 + 84), 0xd6), zt((129), 1, (222) - 0, (72), 0x47, 0x19, (203) * 1, 105, (9 + 199))))
local function jh(ji) if ji < (2) - 0 then return ji end return jh(ji - 1) + jh(ji - (1 + 1)) end
ze[zt((24) * 1, (5) * 1, (43) * 1, (203), 0x42)](jh(10))
local fu = (function() local xb = 0 return function() xb = xb + 1 return xb * 2 end end)()
fu()
ze[zt(24, (1 + 4), 0x2b, 203, (66) * 1)](fu())
local function sm() local nf = 0 local function sq() nf = nf + 1 end local function iw() return nf end return {[zt((132) * 1, (1 + 2), (230), (176) - 0, (129 + 84))] = sq, [zt((32 + 105), 3, (100) * 1, (22) * 1, 55)] = iw} end
local hw = sm()
hw:inc()
hw:inc()
ze[zt((24) * 1, 5, (43) * 1, 203, (66))](hw:get())
local function ln(...) local rh = {...} local mf = 0 for fa, pa in ze[zt((75) * 1, (6), 0xe7, (159), 0x3e, (13 + 36), 0xb3, (165 + 31), (195) - 0)](rh) do mf = mf + pa end return mf end
ze[zt((24) * 1, 5, (43) - 0, (203) * 1, 66)](ln(1, (2), (3), 0x4))
ze[zt((24), 0x5, (43), 203, 66)](ln())
local pr = zt((142), (5), (154), (24 + 11), (3 + 18), 154, 24)
ze[zt(24, (5) - 0, (43) * 1, (201 + 2), 66)](#pr, pr:sub((2) - 0, (3)), pr:upper(), ze[zt((35 + 3), (6), (100) - 0, 189, (163 + 75))][zt((149) - 0, 6, (247) - 0, (28) - 0, (174) - 0, 0xa6, (11 + 123), 0x85)](zt((157) - 0, (5) * 1, (254), (120) * 1), 0x2a, zt((151 + 13), (2) * 1, (207) - 0, (11 + 44), 236, (55) * 1, (73 + 99), 181, (111 + 16))))
ze[zt(24, (3 + 2), 43, 203, 66)](zt((93) - 0, 1, 178, (37), 0x17, (125), 92, (40) * 1, (4 + 157)):rep((3)))
local zg, qq = ze[zt((1 + 2), (5) * 1, 148, 226, (80 + 76), 20)](function() ze[zt(0xa, (1 + 4), 189, 0xa5, (7 + 227), 182, (74) - 0, (20) * 1, (108) - 0)](zt(0xa8, 0x4, 0x1c, 0xa9, 0x36)) end)
ze[zt(0x18, (5) * 1, 43, 203, 66)](zg, qq)
local dh = ze[zt((16 + 45), (12) * 1, (151) * 1, 42, (136), 185, 22, 0x6e)]({}, {[zt(174, 7, 0xa1, 0x1d, (114) - 0, 100)] = {[zt((183) * 1, (2 + 3), 248, 0x65)] = zt((190) * 1, (2 + 3), (28) * 1, 62, (32 + 14), 196)}})
if 1 > 2 then local oz = 3 end
ze[zt(24, (1 + 4), 43, 0xcb, (66) * 1)](dh[zt((88 + 95), (5) - 0, (248), 101)])
local wp = ze[zt(31, (5), (143) * 1, (16), 0xa8)][zt((197), (4) - 0, (125) - 0, 186)]((5), (3) * 1) + ze[zt((31) * 1, 5, 143, 16, (83 + 85))][zt(0xcb, 0x3, (173 + 60), (68 + 130))]((5), (3)) + ze[zt((16 + 15), 5, 143, (16) * 1, 168)][zt(208, 0x4, (41) * 1, 0x74, 0x9, 0x7e, (6 + 26))]((5) * 1, (1 + 2)) + ze[zt((31), 5, (143), (16) - 0, (168) * 1)][zt(0xd6, 0x6, 0x93, (80) * 1, (1 + 38))]((5) - 0, (2) - 0) + ze[zt((31) - 0, 5, (5 + 138), (16) - 0, (168))][zt(222, (6) * 1, (94) * 1, (221) - 0, (102))]((1 + 7), 1) + ze[zt((31) - 0, (5), (18 + 125), (16), 168)][zt((230) * 1, 4, (9 + 74), (225), (213))](0x5)
ze[zt((24), 0x5, 43, (203) - 0, (66) * 1)](wp)
local yw = (1 + 1) ^ 10
local rv = (10) - 0 // (3)
ze[zt((10 + 14), (5) - 0, (43) - 0, 203, (66))](yw, rv)
local ke = not false
local iq = 1 < (2) and (3) >= 3 or nil
ze[zt(24, (5) * 1, (43), (203) * 1, 66)](ke, iq == nil)
local function ay() return 1, 2, (1 + 2) end
local cq, uv, bb = ay()
ze[zt(0x18, 5, 43, (203) * 1, 0x42)](cq, uv, bb)
local mg = zt(0xec, (24), (114) - 0, 129, 137, (3 + 1), 115, 0x82, (122) - 0)
ze[zt(0x18, 5, 43, 203, (25 + 41))](#mg)
local ql = zt(0x106, 16, (233) * 1, 0x9a)
ze[zt((24) - 0, 5, (43) * 1, 203, (66) - 0)](#ql)
local pl = (255) * 1
local ks = 1.5e2
ze[zt((24) - 0, (2 + 3), 0x2b, (14 + 189), (66) - 0)](pl, ks)
local uw = {[zt(123, 1, (99), (148) - 0, 160, (18 + 53), (107) - 0, 0x7b, (126) - 0)] = {[zt((109 + 17), 1, 0xe9, 112, (214) - 0)] = {[zt(129, 1, (222) - 0, 0x48, (6 + 65), 0x19, 203, 105, (97 + 111))] = {[zt(280, 1, 0x9d, 157, (19 + 15), 0x8b, 0x8b, (199))] = (7) - 0}}}}
ze[zt(24, 5, (43) - 0, 203, 0x42)](uw[zt((116 + 7), 1, (85 + 14), 148, (160), (71) * 1, 107, 0x7b, (71 + 55))][zt(0x7e, 1, (233) * 1, 0x70, 0xd6)][zt((129) - 0, 1, 0xde, 72, (71), (2 + 23), 203, 0x69, (208) * 1)][zt((154 + 126), 1, (157) - 0, (157), (34), (52 + 87), 139, 0xc7)])
local function ez() return ze[zt(0x3d, (12), 151, (42), 136, (185) * 1, (22), (110) * 1)]({}, {[zt((283) * 1, 6, 30, (95), (36 + 81))] = function() return (64 + 35) end}) end
ze[zt((24) - 0, (5), (43), 0xcb, 66)](ez()())
local vf = {}
for gn = 1, (6) do if gn % (2) == 0 or false then local na = false and true continue end local ma = false and true vf[#vf + 1] = gn end
ze[zt((13 + 11), 0x5, (43), (203), 66)](ze[zt((17) * 1, (5), (213) - 0, (21) - 0)][zt((291) - 0, 6, 0xa1, (182) * 1, (15 + 138), 133, 0x95, (162) - 0)](vf, zt((299), 1, 0x63, 0x9, 159, (25) - 0, (55) - 0, (133))))
local fs = {}
for ka = 1, (5) do while false do local rx = 1 end if ka == (3) * 1 and true then while false do local oa = 1 end continue end local jc = false and true if ka > (4) * 1 then while false do local jd = 1 end local es = false and true break end fs[#fs + 1] = ka end
ze[zt((24), (2 + 3), 0x2b, (203) * 1, 66)](ze[zt((17) - 0, 5, 213, (21))][zt((291), 0x6, 0xa1, (182) - 0, (109 + 44), (48 + 85), 0x95, 162)](fs, zt(0x12b, 1, 99, (9) - 0, (159) * 1, 25, 0x37, 133)))
local function lo(mb, ...) return ze[zt((38) * 1, (5 + 1), 100, (189) * 1, (143 + 95))][zt(0x95, (6), (247), (28) - 0, 174, 166, (134) * 1, (133) * 1)](mb, ...) end
ze[zt((24) - 0, 5, 0x2b, 203, 66)](lo(zt(302, 0x5, (183) * 1, 61), zt(309, 1, 113, 33), 5))
local function bk() local kb = 1 kb += (1 + 3) kb -= (2) kb *= (3) - 0 kb //= 0x2 kb %= 0x7 kb ^= 0x4 return kb end
ze[zt((24), (5) * 1, 43, (203), 0x42)](bk())
local function bp() local ps = zt((312) * 1, 2, (16 + 4), 140) ps ..= zt((266 + 50), 2, 0x6e, 0xf, (244) - 0, (173 + 3)) ps = ze[zt(31, 5, (23 + 120), (16) - 0, (168))][zt(0xc5, (4) - 0, (125) * 1, (186) - 0)](#ps, (209 + 46)) return ps end
ze[zt(0x18, (5) * 1, (43) * 1, 0xcb, (66) * 1)](bp())
local ax = if 1 < (2) then zt((320), (1 + 2), (30), 24) else zt(0x145, 2, (44 + 172), 0xc0, (83 + 54), 0x2)
ze[zt((24) * 1, 5, (12 + 31), 203, 0x42)](ax)
local aa = if 1 > 2 then 1 elseif (2) * 1 > 1 then 2 else (3)
ze[zt(24, (4 + 1), 43, (203), (17 + 49))](aa)
local function ol() local th = {[zt((199 + 130), 1, (44) - 0, (164 + 28), 0x59, (128), 228, (170 + 25), 0x32)] = 1} th[zt((264 + 68), 4, (125 + 105), 11, (125) - 0, (247) - 0, 78)] = function() th[zt((329) - 0, 1, (44) * 1, 0xc0, (89), 128, (228) - 0, 195, 50)] += 1 return th[zt((329) * 1, 1, (44) - 0, (192), 0x59, 128, 228, 195, 50)] end return th:bump() + th:bump() end
ze[zt((24), (5) * 1, (43), 203, (66))](ol())
local xy = function(xn) return function(bl) return function(df) return xn + bl + df end end end
ze[zt((24) - 0, (5), (14 + 29), (203), 66)](xy(1)((1 + 1))((2 + 1)))
ze[zt(24, 5, (43) - 0, (203), (66) - 0)](zt(0x152, 0x4, (48) - 0, (121), 88, 0x96, (67), 0xd9))