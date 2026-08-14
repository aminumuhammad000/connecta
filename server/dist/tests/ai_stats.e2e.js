import axios from 'axios';
export async function runAiStatsTests(baseUrl) {
    let passed = 0;
    let failed = 0;
    // Test 4.1: Public Platform Stats Endpoint
    try {
        const statsRes = await axios.get(`${baseUrl}/api/stats/public`);
        if (statsRes.data && statsRes.data.success && statsRes.data.data) {
            const d = statsRes.data.data;
            if (typeof d.totalUsers === 'number' && typeof d.activeJobs === 'number') {
                console.log(`  ✅ [PASS] 4.1 Public Platform Stats (Users: ${d.totalUsers}, Active Jobs: ${d.activeJobs})`);
                passed++;
            }
            else {
                console.error(`  ❌ [FAIL] 4.1 Stats response missing numeric fields`);
                failed++;
            }
        }
        else {
            console.error(`  ❌ [FAIL] 4.1 Public Stats endpoint failed`);
            failed++;
        }
    }
    catch (err) {
        console.error(`  ❌ [FAIL] 4.1 Public Stats:`, err.response?.data?.message || err.message);
        failed++;
    }
    // Test 4.2: Health Check Endpoint
    try {
        const healthRes = await axios.get(`${baseUrl}/health`);
        if (healthRes.data && healthRes.data.status === 'ok') {
            console.log(`  ✅ [PASS] 4.2 Server Health & DB State (${healthRes.data.dbState})`);
            passed++;
        }
        else {
            console.error(`  ❌ [FAIL] 4.2 Health Check status not ok`);
            failed++;
        }
    }
    catch (err) {
        console.error(`  ❌ [FAIL] 4.2 Health Check:`, err.response?.data?.message || err.message);
        failed++;
    }
    // Test 4.3: AI Brain Smart Job Recommendations
    try {
        const fEmail = `ai.rec.${Date.now()}@example.com`;
        const fRes = await axios.post(`${baseUrl}/api/users/signup`, {
            firstName: 'AIRec',
            lastName: 'User',
            email: fEmail,
            password: 'TestPassword123!',
            userType: 'freelancer',
            skills: ['React', 'Node.js']
        });
        const token = fRes.data.token;
        const recRes = await axios.get(`${baseUrl}/api/ai/recommended-jobs`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (recRes.data && recRes.data.success && Array.isArray(recRes.data.data)) {
            console.log(`  ✅ [PASS] 4.3 AI Brain Smart Job Recommendations (${recRes.data.data.length} jobs matched)`);
            passed++;
        }
        else {
            console.error(`  ❌ [FAIL] 4.3 AI Recommended Jobs invalid response`);
            failed++;
        }
    }
    catch (err) {
        console.error(`  ❌ [FAIL] 4.3 AI Recommended Jobs:`, err.response?.data?.message || err.message);
        failed++;
    }
    // Test 4.4: Flutterwave Multi-Currency Bank Lists (NG, KE, GH, UG, ZA)
    try {
        const fEmail = `flw.test.${Date.now()}@example.com`;
        const fRes = await axios.post(`${baseUrl}/api/users/signup`, {
            firstName: 'FLWTest',
            lastName: 'User',
            email: fEmail,
            password: 'TestPassword123!',
            userType: 'freelancer',
            currency: 'KES'
        });
        const token = fRes.data.token;
        const banksRes = await axios.get(`${baseUrl}/api/payments/flutterwave/banks/KE`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (banksRes.data && banksRes.data.success && Array.isArray(banksRes.data.data)) {
            console.log(`  ✅ [PASS] 4.4 Flutterwave Multi-Currency Country Banks (${banksRes.data.data.length} banks loaded for Kenya KES)`);
            passed++;
        }
        else {
            console.error(`  ❌ [FAIL] 4.4 Flutterwave Bank List query failed`);
            failed++;
        }
    }
    catch (err) {
        console.error(`  ❌ [FAIL] 4.4 Flutterwave Bank List:`, err.response?.data?.message || err.message);
        failed++;
    }
    return { passed, failed };
}
