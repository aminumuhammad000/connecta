import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Helper to extract session cookie (if needed, though we use Bearer tokens now)
const getCookie = (res: any) => {
    const cookies = res.headers['set-cookie'];
    if (!cookies) return '';
    return cookies.find((c: string) => c.startsWith('session='));
};

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const logger = {
    info: (msg: string) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
    success: (msg: string) => console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`),
    error: (msg: string) => console.error(`\x1b[31m[FAIL]\x1b[0m ${msg}`),
    step: (msg: string) => console.log(`\n\x1b[35m=== ${msg} ===\x1b[0m`)
};

const verifyFullSystem = async () => {
    try {
        logger.step('STARTING FULL SYSTEM VERIFICATION');

        // --- AUTH SERVICE ---
        logger.step('1. AUTH SERVICE');
        const clientEmail = `client_${Date.now()}@test.com`;
        const freelancerEmail = `freelancer_${Date.now()}@test.com`;

        // Signup Client
        const clientSignupRes = await axios.post(`${BASE_URL}/api/auth/signup`, {
            email: clientEmail,
            password: 'password123',
            role: 'client'
        });
        const clientToken = clientSignupRes.data.data.accessToken;
        const clientId = clientSignupRes.data.data.user.id;
        logger.success(`Client Signup: ${clientEmail} (ID: ${clientId})`);

        // Signup Freelancer
        const freelancerSignupRes = await axios.post(`${BASE_URL}/api/auth/signup`, {
            email: freelancerEmail,
            password: 'password123',
            role: 'freelancer'
        });
        const freelancerToken = freelancerSignupRes.data.data.accessToken;
        const freelancerId = freelancerSignupRes.data.data.user.id;
        logger.success(`Freelancer Signup: ${freelancerEmail} (ID: ${freelancerId})`);

        // Signin Client
        const clientSigninRes = await axios.post(`${BASE_URL}/api/auth/signin`, {
            email: clientEmail,
            password: 'password123'
        });
        logger.success('Client Signin successful');

        // --- PROFILE SERVICE ---
        logger.step('2. PROFILE SERVICE');
        await delay(2000); // Wait for event propagation (profile creation)

        const clientProfileRes = await axios.get(`${BASE_URL}/api/profiles/me`, {
            headers: { Authorization: `Bearer ${clientToken}`, 'x-user-id': clientId }
        });
        logger.success(`Client Profile Found: ${clientProfileRes.data.data.email}`);

        const freelancerProfileRes = await axios.get(`${BASE_URL}/api/profiles/me`, {
            headers: { Authorization: `Bearer ${freelancerToken}`, 'x-user-id': freelancerId }
        });
        logger.success(`Freelancer Profile Found: ${freelancerProfileRes.data.data.email}`);

        // Update Freelancer Profile
        const updateProfileRes = await axios.put(`${BASE_URL}/api/profiles/me`, {
            bio: 'Senior Backend Developer',
            skills: ['Node.js', 'Typescript', 'Microservices'],
            hourlyRate: 50
        }, {
            headers: { Authorization: `Bearer ${freelancerToken}`, 'x-user-id': freelancerId }
        });
        logger.success('Freelancer Profile Updated');

        // --- JOB SERVICE ---
        logger.step('3. JOB SERVICE');
        const jobRes = await axios.post(`${BASE_URL}/api/jobs`, {
            title: 'Build a Microservice API',
            description: 'Need a full-stack developer to build a robust API',
            budget: 500
        }, {
            headers: { Authorization: `Bearer ${clientToken}`, 'x-user-id': clientId }
        });
        const jobId = jobRes.data.id;
        logger.success(`Job Created: ${jobRes.data.title} (ID: ${jobId})`);

        const listJobsRes = await axios.get(`${BASE_URL}/api/jobs`);
        logger.success(`Listed ${listJobsRes.data.length} jobs`);

        // --- PROPOSAL SERVICE ---
        logger.step('4. PROPOSAL SERVICE');
        const proposalRes = await axios.post(`${BASE_URL}/api/proposals`, {
            jobId: jobId,
            coverLetter: 'I am highly experienced in microservices.',
            bidAmount: 450,
            duration: '1 week'
        }, {
            headers: { Authorization: `Bearer ${freelancerToken}`, 'x-user-id': freelancerId }
        });
        const proposalId = proposalRes.data.id;
        logger.success(`Proposal Submitted: ${proposalRes.data.status} (ID: ${proposalId})`);

        const jobProposalsRes = await axios.get(`${BASE_URL}/api/proposals/job/${jobId}`, {
            headers: { Authorization: `Bearer ${clientToken}`, 'x-user-id': clientId }
        });
        logger.success(`Retrieved ${jobProposalsRes.data.length} proposals for job`);

        // --- REWARDS SERVICE ---
        logger.step('5. REWARDS SERVICE');
        const freelancerRewardsRes = await axios.get(`${BASE_URL}/api/rewards/balance`, {
            headers: { Authorization: `Bearer ${freelancerToken}`, 'x-user-id': freelancerId }
        });
        logger.success(`Freelancer Rewards Balance: ${freelancerRewardsRes.data.data.balance}`);

        // --- CHAT SERVICE ---
        logger.step('6. CHAT SERVICE');
        // Note: Chat service might need a conversation created first
        // Mocking message send if we have a conversationId or it creates one
        const conversationsRes = await axios.get(`${BASE_URL}/api/chats/conversations`, {
            headers: { Authorization: `Bearer ${freelancerToken}`, 'x-user-id': freelancerId }
        });
        logger.info(`Found ${conversationsRes.data.data.length} conversations`);

        // --- NOTIFICATION SERVICE ---
        logger.step('7. NOTIFICATION SERVICE');
        const notificationsRes = await axios.get(`${BASE_URL}/api/notifications`, {
            headers: { Authorization: `Bearer ${freelancerToken}`, 'x-user-id': freelancerId }
        });
        logger.success(`Retrieved ${notificationsRes.data.data.length} notifications`);

        // --- PAYMENT SERVICE ---
        logger.step('8. PAYMENT SERVICE');
        const paymentInitRes = await axios.post(`${BASE_URL}/api/payments/initialize`, {
            amount: 450,
            contractId: 'mock-contract-id',
            idempotencyKey: `key-${Date.now()}`
        }, {
            headers: { Authorization: `Bearer ${clientToken}`, 'x-user-id': clientId }
        });
        logger.success(`Payment Initialized: ${paymentInitRes.data.data.paymentId}`);

        logger.step('COMPLETED FULL SYSTEM VERIFICATION: SUCCESS');

    } catch (err: any) {
        logger.error(`Verification Failed: ${err.message}`);
        if (err.response) {
            console.error('Response Error Data:', JSON.stringify(err.response.data, null, 2));
        }
        process.exit(1);
    }
};

verifyFullSystem();
