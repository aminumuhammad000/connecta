const https = require('https');

console.log('Testing connectivity to google.com...');

const options = {
    hostname: 'google.com',
    port: 443,
    path: '/',
    method: 'HEAD'
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
});

req.on('error', (e) => {
    console.error('ERROR:', e.message);
});

req.end();
