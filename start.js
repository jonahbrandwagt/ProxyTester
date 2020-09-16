const fs = require('fs');
const request = require('request');
const rp = require('request-promise-native');

const times = {};
let proxies = [];
let completed = 0;
const domain = "google.com"
const delay = 50
const timeout = 50000

const headers = {
    Host: domain,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US',
    'Accept-Encoding': 'br, gzip, deflate',
    Connection: 'keep-alive',
};

const getOptions = () => ({
    url: `http://${domain}`,
    headers,
    method: 'get',
    gzip: true,
    resolveWithFullResponse: true,
    timeout,
    jar: request.jar()
});

const test = async (index, proxy) => {
    times[index] = new Date().getTime();

    try {
        const response = await rp(Object.assign({ proxy }, getOptions()));

        completed += 1;

        const now = new Date().getTime();
        const time = now - times[index];

        console.log(proxy + " | " + time + "ms")
    } catch (e) {
        completed += 1;

        const now = new Date().getTime();
        const time = ((now - times[index]) / 1000).toFixed(3);

        console.log(proxy + " | " + time + "ms")
    }
};

const formatProxies = () => {
    const rawProxies = fs.readFileSync('proxies.txt', 'utf-8');
    const split = rawProxies.trim().split('\n');

    for (const p of split) {
        const parts = p.trim().split(':');
        const [ip, port, user, pass] = parts;
        proxies.push({
            ip, port, user, pass
        });
    }
};


const start = async () => {
    formatProxies()
    for (let i = 0; i < proxies.length; i += 1) {
        const p = proxies[i];
        let proxy = `${p.ip}:${p.port}`;
        if (p.user) proxy = `${p.user}:${p.pass}@${proxy}`;
        proxy = `http://${proxy}`;

        const index = i + 1;

        setTimeout(() => {
            test(index, proxy);
        }, index * delay);
    }
}

start()