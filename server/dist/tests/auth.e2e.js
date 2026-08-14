import axios from 'axios';
export async function runAuthTests(baseUrl) {
    let passed = 0;
    let failed = 0;
    const testEmailClient = `test.client.${Date.now()}@example.com`;
    const testEmailFreelancer = `test.freelancer.${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    // Test 1.1: Client Registration
    try {
        const res = await axios.post(`${baseUrl}/api/users/signup`, {
            firstName: 'Test',
            lastName: 'Client',
            email: testEmailClient,
            password,
            userType: 'client',
            jobTitle: 'Engineering Director'
        });
        if (res.data && (res.data.token || res.data.user)) {
            console.log(`  ✅ [PASS] 1.1 Client Registration (${testEmailClient})`);
            passed++;
        }
        else {
            console.error(`  ❌ [FAIL] 1.1 Client Registration missing token`);
            failed++;
        }
    }
    catch (err) {
        console.error(`  ❌ [FAIL] 1.1 Client Registration:`, err.response?.data?.message || err.message);
        failed++;
    }
    // Test 1.2: Freelancer Registration & Login
    try {
        await axios.post(`${baseUrl}/api/users/signup`, {
            firstName: 'Test',
            lastName: 'Freelancer',
            email: testEmailFreelancer,
            password,
            userType: 'freelancer',
            jobTitle: 'Senior Fullstack Dev'
        });
        const loginRes = await axios.post(`${baseUrl}/api/users/signin`, {
            email: testEmailFreelancer,
            password
        });
        if (loginRes.data && loginRes.data.token) {
            console.log(`  ✅ [PASS] 1.2 Freelancer Signin & Token Retrieval`);
            passed++;
        }
        else {
            console.error(`  ❌ [FAIL] 1.2 Freelancer Signin missing token`);
            failed++;
        }
    }
    catch (err) {
        console.error(`  ❌ [FAIL] 1.2 Freelancer Signin:`, err.response?.data?.message || err.message);
        failed++;
    }
    // Test 1.3: Currency OTP Request Endpoint
    try {
        const loginRes = await axios.post(`${baseUrl}/api/users/signin`, {
            email: testEmailFreelancer,
            password
        });
        const token = loginRes.data.token;
        const otpRes = await axios.post(`${baseUrl}/api/users/currency/request-otp`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (otpRes.data && otpRes.data.success) {
            console.log(`  ✅ [PASS] 1.3 Request 6-digit Currency OTP`);
            passed++;
        }
        else {
            console.error(`  ❌ [FAIL] 1.3 Request Currency OTP failed`);
            failed++;
        }
    }
    catch (err) {
        console.error(`  ❌ [FAIL] 1.3 Request Currency OTP:`, err.response?.data?.message || err.message);
        failed++;
    }
    return { passed, failed };
}
