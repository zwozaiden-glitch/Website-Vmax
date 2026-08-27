-- Protect-Vmax — hosted demo script (source)
--
-- This file is the READABLE source. The file that is actually hosted and
-- fetched by the loader is vmax-demo.lua (obfuscated at "max"). Rebuild it
-- with:  node hosted/build.js
--
-- Loader (what buyers paste into their executor):
--   loadstring(game:HttpGet("https://vmax-host.up.railway.app/hosted/vmax-demo.lua"))()

local Vmax = {
  Name = "Protect-Vmax Demo",
  Version = "1.0.0",
  Status = "online",
}

local function describe(lib)
  return "[ " .. lib.Name .. " v" .. lib.Version .. " ] " .. lib.Status
end

print(describe(Vmax))
print("  hosted script decrypted in memory — nothing readable on disk")

local features = { "whitelist keys", "hwid lock", "key drops", "auto panels", "2-layer obfuscation" }
for i, name in ipairs(features) do
  print("  · " .. name)
end

Vmax.Greet = function(self, who)
  return "hello " .. who .. " — you are protected by " .. self.Name
end

print(Vmax:Greet("buyer"))
