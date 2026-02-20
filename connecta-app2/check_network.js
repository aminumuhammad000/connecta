const https = require('https');

console.log('Testing connectivity to api.expo.dev...');

const options = {
    hostname: 'api.expo.dev',
    port: 443,
    path: '/',
    method: 'GET'
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
});

req.on('error', (e) => {
    console.error('ERROR OBJECT:', e);
    console.error('CODE:', e.code);
    console.error('MESSAGE:', e.message);
    console.error('STACK:', e.stack);
});

req.end();
