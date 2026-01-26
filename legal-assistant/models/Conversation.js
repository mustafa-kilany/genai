const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    sessionId: String,
    messages: [{
      role: String, // 'user' or 'assistant'
      content: String,
      timestamp: { type: Date, default: Date.now },
      toolsUsed: [String],
      metadata: mongoose.Schema.Types.Mixed
    }],
    summary: String,
    totalQueries: { type: Number, default: 0 },
    averageRating: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', ConversationSchema);

