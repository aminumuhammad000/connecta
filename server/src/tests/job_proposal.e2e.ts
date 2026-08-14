import axios from 'axios';

export async function runJobProposalTests(baseUrl: string) {
  let passed = 0;
  let failed = 0;

  const clientEmail = `job.client.${Date.now()}@example.com`;
  const freelancerEmail = `job.freelancer.${Date.now()}@example.com`;
  const password = 'TestPassword123!';

  let clientToken = '';
  let freelancerToken = '';
  let createdJobId = '';

  // Setup accounts
  try {
    const cRes = await axios.post(`${baseUrl}/api/users/signup`, {
      firstName: 'JobClient',
      lastName: 'Owner',
      email: clientEmail,
      password,
      userType: 'client'
    });
    clientToken = cRes.data.token;

    const fRes = await axios.post(`${baseUrl}/api/users/signup`, {
      firstName: 'JobFreelancer',
      lastName: 'Bidder',
      email: freelancerEmail,
      password,
      userType: 'freelancer'
    });
    freelancerToken = fRes.data.token;
  } catch (err: any) {
    console.error('  ⚠️ Test setup error in job_proposal.e2e.ts:', err.message);
  }

  // Test 2.1: Post a Job
  try {
    const jobRes = await axios.post(`${baseUrl}/api/jobs`, {
      title: `E2E Test Job ${Date.now()}`,
      description: 'Build a mobile app with React Native & Express backend.',
      category: 'Development & IT',
      skills: ['React Native', 'Node.js'],
      budget: 1200,
      duration: 14
    }, {
      headers: { Authorization: `Bearer ${clientToken}` }
    });

    if (jobRes.data && (jobRes.data.job?._id || jobRes.data.data?._id)) {
      createdJobId = jobRes.data.job?._id || jobRes.data.data?._id;
      console.log(`  ✅ [PASS] 2.1 Post Job (ID: ${createdJobId})`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] 2.1 Post Job missing job ID`);
      failed++;
    }
  } catch (err: any) {
    console.error(`  ❌ [FAIL] 2.1 Post Job:`, err.response?.data?.message || err.message);
    failed++;
  }

  // Test 2.2: Search Jobs with Regex & Category Filter
  try {
    const searchRes = await axios.get(`${baseUrl}/api/jobs?category=Development%20%26%20IT&search=React`, {
      headers: { Authorization: `Bearer ${freelancerToken}` }
    });

    if (searchRes.data && Array.isArray(searchRes.data.jobs || searchRes.data.data)) {
      console.log(`  ✅ [PASS] 2.2 Search Jobs with Regex & Category Filter`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] 2.2 Search Jobs response invalid`);
      failed++;
    }
  } catch (err: any) {
    console.error(`  ❌ [FAIL] 2.2 Search Jobs:`, err.response?.data?.message || err.message);
    failed++;
  }

  // Test 2.3: Submit Proposal
  try {
    if (createdJobId) {
      const propRes = await axios.post(`${baseUrl}/api/proposals`, {
        jobId: createdJobId,
        coverLetter: 'I am a senior React Native developer with 5+ years experience building mobile apps.',
        bidAmount: 1100,
        estimatedDays: 10,
        proposedPrice: 1100,
        deliveryTime: 10
      }, {
        headers: { Authorization: `Bearer ${freelancerToken}` }
      });

      if (propRes.data && propRes.data.success) {
        console.log(`  ✅ [PASS] 2.3 Submit Job Proposal`);
        passed++;
      } else {
        console.error(`  ❌ [FAIL] 2.3 Submit Proposal failed`);
        failed++;
      }
    } else {
      console.error(`  ❌ [FAIL] 2.3 Submit Proposal skipped (no created job ID)`);
      failed++;
    }
  } catch (err: any) {
    console.error(`  ❌ [FAIL] 2.3 Submit Proposal:`, err.response?.data?.message || err.message);
    failed++;
  }

  // Test 2.4: AI Proposal Executive Digest
  try {
    const aiRes = await axios.post(`${baseUrl}/api/ai/summarize-proposal`, {
      coverLetter: 'I have 5 years experience in React Native and Node.js.',
      bidAmount: 1100,
      estimatedDays: 10
    }, {
      headers: { Authorization: `Bearer ${clientToken}` }
    });

    if (aiRes.data && aiRes.data.data && aiRes.data.data.summary) {
      console.log(`  ✅ [PASS] 2.4 AI Executive Proposal Digest`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] 2.4 AI Proposal Digest invalid response`);
      failed++;
    }
  } catch (err: any) {
    console.error(`  ❌ [FAIL] 2.4 AI Proposal Digest:`, err.response?.data?.message || err.message);
    failed++;
  }

  return { passed, failed };
}
