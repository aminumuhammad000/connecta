#!/usr/bin/env ts-node

/**
 * Comprehensive Test Script for Connecta AI Agent
 * Tests all tools and their corresponding API endpoints
 */

import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || '';
const USER_ID = process.env.TEST_USER_ID || '';

interface TestResult {
    tool: string;
    endpoint?: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    message: string;
    relatedTasksFound?: boolean;
}

const testResults: TestResult[] = [];

// Helper function to make authenticated API requests
async function apiRequest(endpoint: string, method: string = 'GET', data?: any) {
    try {
        const response = await axios({
            method,
            url: `${API_BASE_URL}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json',
            },
            data,
            timeout: 10000,
        });
        return { success: true, data: response.data, status: response.status };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status || 500
        };
    }
}

// Helper to test AI agent directly
async function testAgentTool(message: string, expectedTool?: string) {
    const result = await apiRequest('/api/agent/chat', 'POST', { message });
    return result;
}

console.log('🧪 Connecta AI Agent - Comprehensive Testing');
console.log('='.repeat(60));
console.log(`API Base: ${API_BASE_URL}`);
console.log(`User ID: ${USER_ID || 'Not set'}`);
console.log(`Auth Token: ${AUTH_TOKEN ? '✓ Set' : '✗ Not set'}`);
console.log('='.repeat(60));
console.log('');

// Test 1: Profile Tools
async function testProfileTools() {
    console.log('\\n📋 Testing Profile Tools...');

    // Test get_profile_details_tool
    console.log('\\n  1️⃣ Testing get_profile_details_tool');
    const profileEndpoint = await apiRequest(`/api/users/${USER_ID}`);
    if (profileEndpoint.success) {
        testResults.push({
            tool: 'get_profile_details_tool',
            endpoint: `/api/users/${USER_ID}`,
            status: 'PASS',
            message: 'Profile endpoint working'
        });
        console.log('    ✅ API endpoint working');
    } else {
        testResults.push({
            tool: 'get_profile_details_tool',
            endpoint: `/api/users/${USER_ID}`,
            status: 'FAIL',
            message: `Failed: ${profileEndpoint.error}`
        });
        console.log(`    ❌ API endpoint failed: ${profileEndpoint.error}`);
    }

    // Test via AI agent
    const agentResult = await testAgentTool('Show my profile');
    if (agentResult.success && agentResult.data?.relatedTasks) {
        console.log('    ✅ Related tasks found:', agentResult.data.relatedTasks);
        testResults[testResults.length - 1].relatedTasksFound = true;
    } else {
        console.log('    ⚠️  Related tasks not found in response');
    }

    // Test update_profile_tool
    console.log('\\n  2️⃣ Testing update_profile_tool');
    const updateResult = await apiRequest(`/api/profiles/me`, 'PATCH', {
        bio: 'Test bio update from automated test'
    });
    testResults.push({
        tool: 'update_profile_tool',
        endpoint: '/api/profiles/me',
        status: updateResult.success ? 'PASS' : 'FAIL',
        message: updateResult.success ? 'Update endpoint working' : `Failed: ${updateResult.error}`
    });
    console.log(updateResult.success ? '    ✅ Update endpoint working' : `    ❌ ${updateResult.error}`);
}

// Test 2: Gig Tools
async function testGigTools() {
    console.log('\\n🔍 Testing Gig Tools...');

    // Test get_matched_gigs_tool
    console.log('\\n  1️⃣ Testing get_matched_gigs_tool');
    const gigsResult = await apiRequest('/api/gigs/matched');
    testResults.push({
        tool: 'get_matched_gigs_tool',
        endpoint: '/api/gigs/matched',
        status: gigsResult.success ? 'PASS' : 'FAIL',
        message: gigsResult.success ? 'Matched gigs endpoint working' : `Failed: ${gigsResult.error}`
    });
    console.log(gigsResult.success ? '    ✅ Matched gigs endpoint working' : `    ❌ ${gigsResult.error}`);

    // Test get_saved_gigs_tool
    console.log('\\n  2️⃣ Testing get_saved_gigs_tool');
    const savedGigsResult = await apiRequest('/api/gigs/saved');
    testResults.push({
        tool: 'get_saved_gigs_tool',
        endpoint: '/api/gigs/saved',
        status: savedGigsResult.success ? 'PASS' : 'FAIL',
        message: savedGigsResult.success ? 'Saved gigs endpoint working' : `Failed: ${savedGigsResult.error}`
    });
    console.log(savedGigsResult.success ? '    ✅ Saved gigs endpoint working' : `    ❌ ${savedGigsResult.error}`);

    // Test get_recommended_gigs_tool
    console.log('\\n  3️⃣ Testing get_recommended_gigs_tool');
    const recGigsResult = await apiRequest('/api/gigs/recommended');
    testResults.push({
        tool: 'get_recommended_gigs_tool',
        endpoint: '/api/gigs/recommended',
        status: recGigsResult.success ? 'PASS' : 'FAIL',
        message: recGigsResult.success ? 'Recommended gigs endpoint working' : `Failed: ${recGigsResult.error}`
    });
    console.log(recGigsResult.success ? '    ✅ Recommended gigs endpoint working' : `    ❌ ${recGigsResult.error}`);
}

// Test 3: Application Tools
async function testApplicationTools() {
    console.log('\\n📊 Testing Application Tools...');

    console.log('\\n  1️⃣ Testing track_gig_applications_tool');
    const appsResult = await apiRequest('/api/applications');
    testResults.push({
        tool: 'track_gig_applications_tool',
        endpoint: '/api/applications',
        status: appsResult.success ? 'PASS' : 'FAIL',
        message: appsResult.success ? 'Applications endpoint working' : `Failed: ${appsResult.error}`
    });
    console.log(appsResult.success ? '    ✅ Applications endpoint working' : `    ❌ ${appsResult.error}`);
}

// Test 4: Support Tools (No endpoints needed)
async function testSupportTools() {
    console.log('\\n❓ Testing Support Tools...');

    console.log('\\n  1️⃣ Testing get_support_tool');
    const supportResult = await testAgentTool('Contact support');
    const hasContactInfo = supportResult.data?.data?.email === 'info@myconnecta.ng';
    testResults.push({
        tool: 'get_support_tool',
        status: hasContactInfo ? 'PASS' : 'FAIL',
        message: hasContactInfo ? 'Support contact info returned correctly' : 'Support info not found',
        relatedTasksFound: !!supportResult.data?.relatedTasks
    });
    console.log(hasContactInfo ? '    ✅ Support contact info working' : '    ❌ Support info not found');
    if (supportResult.data?.relatedTasks) {
        console.log('    ✅ Related tasks:', supportResult.data.relatedTasks);
    }

    console.log('\\n  2️⃣ Testing get_help_tool');
    const helpResult = await testAgentTool('Help');
    testResults.push({
        tool: 'get_help_tool',
        status: helpResult.success ? 'PASS' : 'FAIL',
        message: helpResult.success ? 'Help response received' : 'Help failed',
        relatedTasksFound: !!helpResult.data?.relatedTasks
    });
    console.log(helpResult.success ? '    ✅ Help response received' : '    ❌ Help failed');
}

// Test 5: Cover Letter Tools
async function testCoverLetterTools() {
    console.log('\\n📝 Testing Cover Letter Tools...');

    console.log('\\n  1️⃣ Testing get_saved_cover_letters_tool');
    const lettersResult = await apiRequest('/api/cover-letters');
    testResults.push({
        tool: 'get_saved_cover_letters_tool',
        endpoint: '/api/cover-letters',
        status: lettersResult.success ? 'PASS' : 'FAIL',
        message: lettersResult.success ? 'Cover letters endpoint working' : `Failed: ${lettersResult.error}`
    });
    console.log(lettersResult.success ? '    ✅ Cover letters endpoint working' : `    ❌ ${lettersResult.error}`);
}

// Test 6: Analytics Tools
async function testAnalyticsTools() {
    console.log('\\n📈 Testing Analytics Tools...');

    console.log('\\n  1️⃣ Testing get_profile_analytics_tool');
    const analyticsResult = await apiRequest('/api/profiles/analytics');
    testResults.push({
        tool: 'get_profile_analytics_tool',
        endpoint: '/api/profiles/analytics',
        status: analyticsResult.success ? 'PASS' : 'FAIL',
        message: analyticsResult.success ? 'Analytics endpoint working' : `Failed: ${analyticsResult.error}`
    });
    console.log(analyticsResult.success ? '    ✅ Analytics endpoint working' : `    ❌ ${analyticsResult.error}`);
}

// Test 7: Greeting with Capabilities
async function testGreeting() {
    console.log('\\n👋 Testing Greeting...');

    const greetingResult = await testAgentTool('Hi');
    const hasCapabilities = greetingResult.data?.message?.includes('I can help you with');
    testResults.push({
        tool: 'greeting_with_capabilities',
        status: hasCapabilities ? 'PASS' : 'FAIL',
        message: hasCapabilities ? 'Greeting shows capabilities' : 'Capabilities not shown',
        relatedTasksFound: !!greetingResult.data?.suggestions
    });
    console.log(hasCapabilities ? '    ✅ Greeting shows capabilities' : '    ❌ Capabilities not shown');
    if (greetingResult.data?.suggestions) {
        console.log('    ✅ Suggestions:', greetingResult.data.suggestions);
    }
}

// Run all tests
async function runAllTests() {
    try {
        if (!AUTH_TOKEN || !USER_ID) {
            console.log('\\n⚠️  Warning: AUTH_TOKEN and USER_ID not set');
            console.log('Set them via environment variables for full testing:\\n');
            console.log('export TEST_AUTH_TOKEN="your_token"');
            console.log('export TEST_USER_ID="your_user_id"\\n');
        }

        await testProfileTools();
        await testGigTools();
        await testApplicationTools();
        await testSupportTools();
        await testCoverLetterTools();
        await testAnalyticsTools();
        await testGreeting();

        // Print summary
        console.log('\\n\\n' + '='.repeat(60));
        console.log('📊 Test Summary');
        console.log('='.repeat(60));

        const passed = testResults.filter(r => r.status === 'PASS').length;
        const failed = testResults.filter(r => r.status === 'FAIL').length;
        const withRelatedTasks = testResults.filter(r => r.relatedTasksFound).length;

        console.log(`\\nTotal Tests: ${testResults.length}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`🔗 With Related Tasks: ${withRelatedTasks}`);

        console.log('\\n📋 Detailed Results:\\n');
        testResults.forEach((result, index) => {
            const icon = result.status === 'PASS' ? '✅' : '❌';
            const relatedIcon = result.relatedTasksFound ? ' 🔗' : '';
            console.log(`${icon}${relatedIcon} ${result.tool}`);
            if (result.endpoint) {
                console.log(`   Endpoint: ${result.endpoint}`);
            }
            console.log(`   ${result.message}\\n`);
        });

        console.log('='.repeat(60));
        console.log(`\\nSuccess Rate: ${((passed / testResults.length) * 100).toFixed(1)}%`);
        console.log(`Related Tasks Coverage: ${((withRelatedTasks / testResults.length) * 100).toFixed(1)}%`);

        // Export results to JSON
        const fs = require('fs');
        fs.writeFileSync(
            'ai-agent-test-results.json',
            JSON.stringify({ testResults, summary: { passed, failed, withRelatedTasks } }, null, 2)
        );
        console.log('\\n💾 Results saved to: ai-agent-test-results.json\\n');

    } catch (error) {
        console.error('\\n❌ Test execution failed:', error);
        process.exit(1);
    }
}

// Run tests
runAllTests();
