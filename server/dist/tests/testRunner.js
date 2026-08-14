import { runAuthTests } from './auth.e2e.js';
import { runJobProposalTests } from './job_proposal.e2e.js';
import { runContractEscrowTests } from './contract_escrow.e2e.js';
import { runAiStatsTests } from './ai_stats.e2e.js';
const API_BASE_URL = process.env.TEST_API_URL || 'https://api.myconnecta.ng';
async function runAllTests() {
    console.log(`\n🧪 ========================================================`);
    console.log(`🚀 CONNECTA END-TO-END AUTOMATED TEST SUITE`);
    console.log(`🎯 Target Server: ${API_BASE_URL}`);
    console.log(`========================================================\n`);
    let totalPassed = 0;
    let totalFailed = 0;
    const suites = [
        { name: '1. Auth & OTP Currency Security', fn: runAuthTests },
        { name: '2. Jobs & Proposal Submission', fn: runJobProposalTests },
        { name: '3. Contract Escrow & Payout Guarantee', fn: runContractEscrowTests },
        { name: '4. AI Matchmaker & Platform Stats', fn: runAiStatsTests }
    ];
    for (const suite of suites) {
        console.log(`\n📋 Running Suite: ${suite.name}...`);
        try {
            const results = await suite.fn(API_BASE_URL);
            totalPassed += results.passed;
            totalFailed += results.failed;
        }
        catch (err) {
            console.error(`❌ Suite ${suite.name} execution error:`, err.message);
            totalFailed += 1;
        }
    }
    console.log(`\n========================================================`);
    console.log(`📊 TEST SUITE SUMMARY RESULTS`);
    console.log(`✅ Total Tests Passed: ${totalPassed}`);
    console.log(`❌ Total Tests Failed: ${totalFailed}`);
    console.log(`========================================================\n`);
    if (totalFailed > 0) {
        process.exit(1);
    }
    else {
        process.exit(0);
    }
}
runAllTests();
