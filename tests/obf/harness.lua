-- Luau test harness: runs original + obfuscated scripts with stubs and compares stdout.
-- usage: luau tests/obf/harness.lua <orig.lua> <obf.lua>
local args = { ... }
local origPath, obfPath = args[1], args[2]
assert(origPath and obfPath, "usage: luau harness.lua <orig> <obf>")

local out = {}
local realPrint = print
print = function(...)
  local t = { ... }
  for i = 1, #t do t[i] = tostring(t[i]) end
  out[#out + 1] = table.concat(t, "\t")
end

-- ---- Roblox-style stubs (deterministic, no network) ----
local function stubService(name)
  local svc = { Name = name }
  svc.GetService = function(self, n) return stubService(n) end
  return svc
end
game = game or {}
game.GetService = function(self, n) return stubService(n) end
game.Players = stubService("Players")
workspace = stubService("workspace")
script = stubService("script")
shared = {}
tick = function() return 1234.5 end
wait = function() return 0 end
spawn = function(f) end
task = { wait = function() end, delay = function() end, spawn = function() end }
print = print
warn = function() end
getgenv = function() return shared end
setclipboard = function() end
writefile = function() return true end
readfile = function() return "" end
isfile = function() return false end
makefolder = function() end
request = function() return { Status = 200, Body = "{}" } end
http_request = function() return { Status = 200, Body = "{}" } end
loadstring = loadstring
gethookmt = function() end
getrawmetatable = function() return {} end
setreadonly = function() end

-- deterministic "random"
math.randomseed(1234)

local function run(path)
  out = {}
  local f, err = loadfile(path)
  if not f then error("loadfile failed: " .. tostring(err)) end
  f()
  return table.concat(out, "\n")
end

local a = run(origPath)
local b = run(obfPath)
if a == b then
  realPrint("MATCH (" .. #a .. " bytes output)")
else
  realPrint("MISMATCH!\n--- original ---\n" .. a .. "\n--- obfuscated ---\n" .. b)
  os.exit(1)
end
