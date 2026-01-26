/**
 * Test script to verify Gemini API key and available models
 * Run with: node test-gemini-api.js
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
  console.log('🧪 Testing Gemini API...\n');

  const genAI = new GoogleGenerativeAI(apiKey);

  // Test different model names and formats
  const modelsToTest = [
    'models/gemini-pro',
    'models/gemini-1.5-pro',
    'models/gemini-1.5-flash',
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-2.0-flash-thinking-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest'
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say hello');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName} works! Response: "${text}"\n`);
      
      // If this works, use it
      if (modelName === 'gemini-pro' || modelName === 'gemini-1.5-pro' || modelName === 'gemini-1.5-flash') {
        console.log(`\n✅ Recommended model: ${modelName}`);
        break;
      }
    } catch (error) {
      console.log(`❌ ${modelName} failed: ${error.message}\n`);
    }
  }
}

testGeminiAPI().catch(console.error);

