import axios from 'axios';

const GATEWAY_URL = 'http://localhost:8000';

const services = [
    { name: 'Auth Service', path: '/api/auth/health' },
    { name: 'Profile Service', path: '/api/profiles/health' },
    { name: 'Job Service', path: '/api/jobs/health' },
    { name: 'Rewards Service', path: '/api/rewards/health' },
    { name: 'Proposal Service', path: '/api/proposals/health' },
    { name: 'Contract Service', path: '/api/contracts/health' },
    { name: 'Payment Service', path: '/api/payments/health' },
    { name: 'Chat Service', path: '/api/chats/health' },
    { name: 'Notification Service', path: '/api/notifications/health' },
    { name: 'Media Service', path: '/api/media/health' },
];

async function verifyServices() {
    console.log('--- Starting Service Verification ---');
    for (const service of services) {
        try {
            const response = await axios.get(`${GATEWAY_URL}${service.path}`);
            console.log(`[PASS] ${service.name}: ${response.status} - ${JSON.stringify(response.data)}`);
        } catch (error: any) {
            console.error(`[FAIL] ${service.name}: ${error.response?.status || 'ERROR'} - ${error.message}`);
        }
    }
    console.log('--- Verification Complete ---');
}

verifyServices();
