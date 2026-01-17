
import LLMService from '../src/services/LLM.service';

async function testAI() {
    console.log("🤖 Testing Collabo AI...");
    const description = "I want to build a Tinder-like dating app for dogs called BarkDate.";

    const startTime = Date.now();
    try {
        const result = await LLMService.scopeProject(description);
        const duration = Date.now() - startTime;

        console.log(`✅ AI Response received in ${duration}ms`);
        console.log(JSON.stringify(result, null, 2));

        if (result.roles && result.roles.length > 0) {
            console.log("\n✨ Success! valid roles generated.");
        } else {
            console.error("\n❌ Failed: No roles generated.");
        }
    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

testAI();
