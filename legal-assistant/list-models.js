/**
 * List available Gemini models for your API key
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found');
    process.exit(1);
  }

  console.log('🔑 Fetching available models...\n');
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Try to list models using the REST API directly
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log('✅ Available models:');
      data.models.forEach(model => {
        console.log(`  - ${model.name}`);
        if (model.supportedGenerationMethods) {
          console.log(`    Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
    } else {
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error listing models:', error.message);
    
    // Try alternative approach - test common model names
    console.log('\n🧪 Testing common model names...\n');
    
    const modelsToTest = [
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash',
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash-thinking-exp'
    ];
    
    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        const response = await result.response;
        const text = response.text();
        console.log(`✅ ${modelName} WORKS! Response: "${text}"`);
      } catch (err) {
        // Silently skip failed models
      }
    }
  }
}

listModels().catch(console.error);

