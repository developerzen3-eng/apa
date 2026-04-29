// agent.js
const express = require("express");
const si = require("systeminformation");
const app = express();

app.get("/stats", async (req, res) => {
  const cpu = await si.currentLoad();
  const mem = await si.mem();
  const fs = await si.fsSize();

  res.json({
    cpu: Math.round(cpu.currentLoad),
    ram: Math.round((mem.used / mem.total) * 100),
    disk: Math.round(fs[0].use)
  });
});

app.listen(3001, "0.0.0.0");
