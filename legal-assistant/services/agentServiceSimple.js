const { GoogleGenerativeAI } = require('@google/generative-ai');
const Query = require('../models/Query');
const Conversation = require('../models/Conversation');

/**
 * Simplified Agent Service - Works without tools first
 */

class AgentService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = 'models/gemini-2.5-flash';
  }

  async processMessage(userMessage, conversationId = null, messageHistory = []) {
    const startTime = Date.now();
    
    try {
      const systemPrompt = `You are a Jordanian Legal Assistant AI. You help users understand Jordanian laws, particularly the Personal Data Protection Law (PDPL) 2023.

Guidelines:
- Always be friendly and professional
- For casual greetings, respond warmly and ask how you can help
- Always cite specific article numbers when referencing laws
- Be precise, helpful, and cite your sources
- If you don't know something, say so rather than guessing

You can help with:
- Searching Jordanian laws and legal articles
- Calculating fines and penalties
- Answering legal questions with citations
- Finding relevant legal cases`;

      const model = this.genAI.getGenerativeModel({ 
        model: this.modelName
      });

      // Simple approach: include system prompt in the message
      const fullPrompt = `${systemPrompt}\n\nUser question: ${userMessage}\n\nProvide a helpful response:`;

      let result;
      let response;
      
      try {
        result = await model.generateContent(fullPrompt);
        response = result.response;
      } catch (apiError) {
        console.error('Gemini API Error:', apiError.message);
        throw new Error(`API Error: ${apiError.message}`);
      }

      let finalResponse;
      try {
        finalResponse = response.text();
        if (!finalResponse || finalResponse.trim().length === 0) {
          finalResponse = 'I apologize, but I received an empty response. Please try rephrasing your question.';
        }
      } catch (textError) {
        console.error('Error extracting text:', textError);
        throw new Error(`Failed to extract response: ${textError.message}`);
      }
      
      const responseTime = Date.now() - startTime;
      const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

      // Save to database
      const query = await Query.create({
        question: userMessage,
        aiResponse: finalResponse,
        conversationId: conversationId || `conv_${Date.now()}`,
        messageHistory: [
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
        toolsUsed: [],
        metadata: {
          model: this.modelName,
          tokensUsed: tokensUsed,
          responseTime: responseTime
        },
        errorOccurred: false
      });

      // Update conversation
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
                timestamp: new Date()
              }
            }
          }
        );
      } else {
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
              timestamp: new Date()
            }
          ],
          totalQueries: 1
        });
      }

      return {
        success: true,
        response: finalResponse,
        toolsUsed: [],
        conversationId: query.conversationId,
        metadata: {
          tokensUsed: tokensUsed,
          responseTime: responseTime
        }
      };

    } catch (error) {
      console.error('Agent service error:', error);
      
      await Query.create({
        question: userMessage,
        aiResponse: 'I apologize, but I encountered an error processing your request.',
        conversationId: conversationId || `conv_${Date.now()}`,
        errorOccurred: true,
        errorMessage: error.message,
        metadata: {
          model: this.modelName,
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
}

module.exports = AgentService;

