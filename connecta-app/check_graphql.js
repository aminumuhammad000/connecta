const https = require('https');

console.log('Testing connectivity to api.expo.dev/graphql...');

const options = {
    hostname: 'api.expo.dev',
    port: 443,
    path: '/graphql',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('RESPONSE:', data.substring(0, 100));
    });
});

req.on('error', (e) => {
    console.error('ERROR:', e.message);
});

req.write(JSON.stringify({ query: '{ __schema { queryType { name } } }' }));
req.end();
