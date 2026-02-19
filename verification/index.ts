import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Helper to extract session cookie
const getCookie = (res: any) => {
    const cookies = res.headers['set-cookie'];
    if (!cookies) return '';
    return cookies.find((c: string) => c.startsWith('session='));
};

const verifySystem = async () => {
    try {
        console.log('--- Starting System Verification ---');

        // 1. Signup Client
        console.log('\n1. Registering Client...');
        const clientEmail = `client_${Date.now()}@test.com`;
        const signupRes = await axios.post(`${BASE_URL}/api/auth/signup`, {
            email: clientEmail,
            password: 'password'
        });
        const clientCookie = getCookie(signupRes);
        console.log('✅ Client Registered:', signupRes.data.email);

        // 2. Client Profile Check (Wait a moment for event propagation)
        console.log('\n2. Verifying Client Profile (Event Driven)...');
        await new Promise(r => setTimeout(r, 2000)); // Wait for RabbitMQ
        const profileRes = await axios.get(`${BASE_URL}/api/profiles/currentuser`, {
            headers: { Cookie: clientCookie }
        });
        if (profileRes.data.email === clientEmail) {
            console.log('✅ Profile Created Automatically:', profileRes.data.email);
        } else {
            console.error('❌ Profile Creation Failed');
        }

        // 3. Post Job
        console.log('\n3. Client Posting Job...');
        const jobRes = await axios.post(`${BASE_URL}/api/jobs`, {
            title: 'Backend Developer',
            description: 'Need a microservices expert',
            budget: 1000
        }, {
            headers: { Cookie: clientCookie }
        });
        console.log('✅ Job Posted:', jobRes.data.title, `(ID: ${jobRes.data.id})`);
        const jobId = jobRes.data.id;

        // 4. Signup Freelancer
        console.log('\n4. Registering Freelancer...');
        const freelancerEmail = `freelancer_${Date.now()}@test.com`;
        const freelancerSignupRes = await axios.post(`${BASE_URL}/api/auth/signup`, {
            email: freelancerEmail,
            password: 'password'
        });
        const freelancerCookie = getCookie(freelancerSignupRes);
        console.log('✅ Freelancer Registered:', freelancerSignupRes.data.email);

        // 5. Submit Proposal
        console.log('\n5. Freelancer Submitting Proposal...');
        const proposalRes = await axios.post(`${BASE_URL}/api/proposals`, {
            jobId: jobId,
            coverLetter: 'I am the best fit for this role.',
            bidAmount: 1000,
            duration: '2 weeks'
        }, {
            headers: { Cookie: freelancerCookie }
        });
        console.log('✅ Proposal Submitted:', proposalRes.data.status);

        // 6. Check Rewards Balance
        console.log('\n6. Checking Rewards Balance...');
        const rewardsRes = await axios.get(`${BASE_URL}/api/rewards/balance`, {
            headers: { Cookie: freelancerCookie }
        });
        console.log('✅ Rewards Balance:', rewardsRes.data.balance);

        console.log('\n--- Verification Complete: SUCCESS ---');

    } catch (err: any) {
        console.error('\n❌ Verification Failed:', err.message);
        if (err.response) {
            console.error('Response Data:', err.response.data);
        }
    }
};

verifySystem();
