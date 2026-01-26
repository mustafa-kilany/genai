const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema(
  {
    question: String,
    context: String,
    aiResponse: String,
    conversationId: String, // For multi-turn conversations
    messageHistory: [{
      role: String, // 'user' or 'assistant'
      content: String,
      timestamp: { type: Date, default: Date.now }
    }],
    toolsUsed: [String], // Track which tools were used
    rating: Number, // Manual rating 1-5
    errorOccurred: Boolean,
    errorMessage: String,
    metadata: {
      model: String,
      tokensUsed: Number,
      responseTime: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Query', QuerySchema);
