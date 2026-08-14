import axios from 'axios';

export async function runAiStatsTests(baseUrl: string) {
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
      } else {
        console.error(`  ❌ [FAIL] 4.1 Stats response missing numeric fields`);
        failed++;
      }
    } else {
      console.error(`  ❌ [FAIL] 4.1 Public Stats endpoint failed`);
      failed++;
    }
  } catch (err: any) {
    console.error(`  ❌ [FAIL] 4.1 Public Stats:`, err.response?.data?.message || err.message);
    failed++;
  }

  // Test 4.2: Health Check Endpoint
  try {
    const healthRes = await axios.get(`${baseUrl}/health`);

    if (healthRes.data && healthRes.data.status === 'ok') {
      console.log(`  ✅ [PASS] 4.2 Server Health & DB State (${healthRes.data.dbState})`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] 4.2 Health Check status not ok`);
      failed++;
    }
  } catch (err: any) {
    console.error(`  ❌ [FAIL] 4.2 Health Check:`, err.response?.data?.message || err.message);
    failed++;
  }

  return { passed, failed };
}
