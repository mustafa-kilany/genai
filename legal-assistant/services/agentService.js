const { GoogleGenerativeAI } = require('@google/generative-ai');
const { executeTool, getToolsSchema } = require('./agentTools');
const Query = require('../models/Query');
const Conversation = require('../models/Conversation');

/**
 * Agent Service - Handles multi-turn conversations with tool usage using Google Gemini
 */

class AgentService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Based on available models, use models/gemini-2.5-flash (fast and reliable)
    // Or models/gemini-2.5-pro (more capable)
    // All models require the 'models/' prefix
    this.modelName = 'models/gemini-2.5-flash'; // Fast and reliable
  }

  /**
   * Convert tools to Gemini function declarations format
   */
  getGeminiTools() {
    const openAITools = getToolsSchema();
    return openAITools.map(tool => ({
      functionDeclarations: [{
        name: tool.function.name,
        description: tool.function.description,
        parameters: {
          type: 'OBJECT',
          properties: Object.entries(tool.function.parameters.properties).reduce((acc, [key, value]) => {
            const geminiType = value.type === 'string' ? 'STRING' : 
                              value.type === 'number' ? 'NUMBER' : 'STRING';
            acc[key] = {
              type: geminiType,
              description: value.description || ''
            };
            return acc;
          }, {}),
          required: tool.function.parameters.required || []
        }
      }]
    }));
  }

  /**
   * Process a user message with agent capabilities
   */
  async processMessage(userMessage, conversationId = null, messageHistory = []) {
    const startTime = Date.now();
    const toolsUsed = [];
    
    try {
      const systemPrompt = `You are a Jordanian Legal Assistant AI. You help users understand Jordanian laws, particularly the Personal Data Protection Law (PDPL) 2023.

Your capabilities:
1. Search laws and legal articles from the knowledge base
2. Perform calculations (fines, penalties, etc.)
3. Read FAQ documents
4. Search for legal cases and precedents

Guidelines:
- Always be friendly and professional in your responses
- For casual greetings (like "hey", "hello", "hi"), respond warmly and ask how you can help with legal questions
- Always cite specific article numbers when referencing laws
- If you need to search for laws, use the search_laws function
- For calculations, use the calculate function
- For FAQs, use the read_file function
- For case precedents, use the search_cases function
- Be precise, helpful, and cite your sources
- If you don't know something, say so rather than guessing

Use functions when appropriate to provide accurate, cited information. For casual conversations or greetings, respond naturally without using tools.`;

      // Get model - use models/gemini-2.5-flash (confirmed available from list-models)
      const tools = this.getGeminiTools();
      let model;
      
      // Ensure model name has 'models/' prefix (required format)
      const modelName = this.modelName.startsWith('models/') 
        ? this.modelName 
        : `models/${this.modelName}`;
      
      // For now, try without tools first to ensure basic functionality works
      // Tools can cause issues if not properly configured
      try {
        model = this.genAI.getGenerativeModel({ 
          model: modelName
        });
        
        // If tools are available and this isn't a simple greeting, try adding tools
        // But start without tools to ensure it works
        if (tools.length > 0) {
          // Try with tools, but catch errors
          try {
            const modelWithTools = this.genAI.getGenerativeModel({ 
              model: modelName,
              tools: tools
            });
            // Test if tools work by checking if model initializes
            model = modelWithTools;
            console.log('✓ Using model with tools');
          } catch (toolsError) {
            console.log('⚠️  Tools not supported, using model without tools');
            // Continue with model without tools
          }
        }
      } catch (modelError) {
        console.error('Model initialization error:', modelError);
        // Fallback to gemini-2.5-flash without tools
        model = this.genAI.getGenerativeModel({ 
          model: 'models/gemini-2.5-flash'
        });
      }

      // Build chat history for Gemini
      const history = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I am a Jordanian Legal Assistant AI ready to help with legal questions using my available tools.' }]
        }
      ];

      // Add message history if available
      if (messageHistory && messageHistory.length > 0) {
        messageHistory.forEach(msg => {
          if (msg.role === 'user') {
            history.push({ 
              role: 'user', 
              parts: [{ text: typeof msg.content === 'string' ? msg.content : (msg.parts?.[0]?.text || '') }] 
            });
          } else if (msg.role === 'assistant' || msg.role === 'model') {
            history.push({ 
              role: 'model', 
              parts: [{ text: typeof msg.content === 'string' ? msg.content : (msg.parts?.[0]?.text || '') }] 
            });
          }
        });
      }

      const chat = model.startChat({
        history: history,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      });

      // Send the user message
      let result;
      let response;
      try {
        result = await chat.sendMessage(userMessage);
        response = result.response;
      } catch (apiError) {
        console.error('Gemini API Error Details:', {
          message: apiError.message,
          status: apiError.status,
          statusText: apiError.statusText,
          error: apiError.error,
          model: modelName
        });
        
        // Try fallback models
        const fallbackModels = [
          'models/gemini-2.5-flash',
          'models/gemini-2.0-flash',
          'models/gemini-flash-latest',
          'models/gemini-pro-latest'
        ];
        
        let fallbackSuccess = false;
        for (const fallbackModelName of fallbackModels) {
          if (fallbackModelName === modelName) continue; // Skip if already tried
          
          try {
            console.log(`⚠️  Trying fallback model: ${fallbackModelName}...`);
            const fallbackModel = this.genAI.getGenerativeModel({ 
              model: fallbackModelName,
              tools: tools.length > 0 ? tools : undefined
            });
            const fallbackChat = fallbackModel.startChat({
              history: history,
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
              }
            });
            result = await fallbackChat.sendMessage(userMessage);
            response = result.response;
            this.modelName = fallbackModelName; // Save working model
            fallbackSuccess = true;
            console.log(`✅ Successfully using model: ${fallbackModelName}`);
            break;
          } catch (fallbackError) {
            console.log(`❌ ${fallbackModelName} also failed: ${fallbackError.message}`);
            continue;
          }
        }
        
        if (!fallbackSuccess) {
          throw new Error(`Gemini API Error: ${apiError.message || 'All models failed. Please check your API key and network connection.'}`);
        }
      }
      
      let maxIterations = 5;
      let iteration = 0;

      // Handle function calls
      if (response && typeof response.functionCalls === 'function') {
        try {
          let functionCalls = response.functionCalls();
          while (functionCalls && functionCalls.length > 0 && iteration < maxIterations) {
            iteration++;
            
            const functionResults = [];

            for (const funcCall of functionCalls) {
              const toolName = funcCall.name;
              const parameters = funcCall.args || {};
              
              toolsUsed.push(toolName);
              
              const toolResult = await executeTool(toolName, parameters);
              
              functionResults.push({
                functionResponse: {
                  name: toolName,
                  response: toolResult
                }
              });
            }

            // Send function results back to the model
            try {
              result = await chat.sendMessage(functionResults);
              response = result.response;
              if (response && typeof response.functionCalls === 'function') {
                functionCalls = response.functionCalls();
              } else {
                break;
              }
            } catch (sendError) {
              console.error('Error sending function results:', sendError);
              break;
            }
          }
        } catch (fcError) {
          console.error('Error checking function calls:', fcError);
          // Continue to extract text response
        }
      }

      let finalResponse;
      try {
        finalResponse = response.text();
        if (!finalResponse || finalResponse.trim().length === 0) {
          finalResponse = 'I apologize, but I received an empty response. Please try rephrasing your question.';
        }
      } catch (textError) {
        console.error('Error extracting text from response:', textError);
        finalResponse = 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.';
      }
      
      const responseTime = Date.now() - startTime;
      const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

      // Save to database
      const query = await Query.create({
        question: userMessage,
        aiResponse: finalResponse,
        conversationId: conversationId || `conv_${Date.now()}`,
        messageHistory: [
          ...messageHistory,
          {
            role: 'user',
            content: userMessage,
            timestamp: new Date()
          },
          {
            role: 'assistant',
            content: finalResponse,
            timestamp: new Date()
          }
        ],
        toolsUsed: toolsUsed,
        metadata: {
          model: 'gemini-2.0-flash-exp',
          tokensUsed: tokensUsed,
          responseTime: responseTime
        },
        errorOccurred: false
      });

      // Update or create conversation
      if (conversationId) {
        await Conversation.findOneAndUpdate(
          { sessionId: conversationId },
          {
            $push: {
              messages: {
                role: 'user',
                content: userMessage,
                timestamp: new Date()
              }
            },
            $inc: { totalQueries: 1 }
          },
          { upsert: true, new: true }
        );
        
        await Conversation.findOneAndUpdate(
          { sessionId: conversationId },
          {
            $push: {
              messages: {
                role: 'assistant',
                content: finalResponse,
                toolsUsed: toolsUsed,
                timestamp: new Date()
              }
            }
          }
        );
      } else {
        // Create new conversation
        await Conversation.create({
          sessionId: query.conversationId,
          messages: [
            {
              role: 'user',
              content: userMessage,
              timestamp: new Date()
            },
            {
              role: 'assistant',
              content: finalResponse,
              toolsUsed: toolsUsed,
              timestamp: new Date()
            }
          ],
          totalQueries: 1
        });
      }

      return {
        success: true,
        response: finalResponse,
        toolsUsed: toolsUsed,
        conversationId: query.conversationId,
        metadata: {
          tokensUsed: tokensUsed,
          responseTime: responseTime
        }
      };

    } catch (error) {
      console.error('Agent service error:', error);
      
      // Log error
      await Query.create({
        question: userMessage,
        aiResponse: 'I apologize, but I encountered an error processing your request.',
        conversationId: conversationId || `conv_${Date.now()}`,
        messageHistory: messageHistory,
        errorOccurred: true,
        errorMessage: error.message,
        metadata: {
          model: 'gemini-2.0-flash-exp',
          responseTime: Date.now() - startTime
        }
      });

      return {
        success: false,
        error: error.message,
        response: 'I apologize, but I encountered an error processing your request. Please try again.'
      };
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(conversationId) {
    const conversation = await Conversation.findOne({ sessionId: conversationId });
    return conversation ? conversation.messages : [];
  }
}

module.exports = AgentService;
