require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const Law = require('./models/Law');
const Case = require('./models/Case');
const Query = require('./models/Query');
const Conversation = require('./models/Conversation');
// Use simplified agent service that works without tools
const AgentService = require('./services/agentServiceSimple');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Validate environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in environment variables');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI is not set in environment variables');
  process.exit(1);
}

// Initialize Agent Service with Gemini
let agentService;
try {
  agentService = new AgentService(process.env.GEMINI_API_KEY);
  console.log('✓ Gemini AI Agent Service initialized');
} catch (error) {
  console.error('ERROR: Failed to initialize Agent Service:', error.message);
  process.exit(1);
}

// MongoDB connection with error handling
// Fix case sensitivity - use Legal-assistant (capital L) to match existing database
let mongoUri = process.env.MONGO_URI;
// Replace database name with correct case
if (mongoUri.includes('/legal-assistant')) {
  mongoUri = mongoUri.replace('/legal-assistant', '/Legal-assistant');
}

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✓ MongoDB connected successfully'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    // Try original if case fix doesn't work
    if (err.message.includes('different case')) {
      console.log('⚠️  Trying original URI...');
      mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('✓ MongoDB connected with original URI'))
        .catch(err2 => {
          console.error('✗ MongoDB connection failed:', err2.message);
          process.exit(1);
        });
    } else {
      process.exit(1);
    }
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ------------------- LAWS -------------------
app.get('/api/laws', async (req, res) => {
  try {
    const laws = await Law.find().sort({ article_num: 1 });
    res.json(laws);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/laws/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    const laws = await Law.find({
      $or: [
        { content_en: new RegExp(q, 'i') },
        { content_ar: new RegExp(q, 'i') }
      ]
    }).sort({ article_num: 1 }).limit(20);
    res.json(laws);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------- CASES -------------------
app.get('/api/cases', async (req, res) => {
  try {
    const cases = await Case.find();
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cases', async (req, res) => {
  try {
    const c = new Case(req.body);
    await c.save();
    res.json(c);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------- AI QUERY (Agent with Tools) -------------------
app.post('/api/query', async (req, res) => {
  try {
    const { question, conversationId } = req.body;
    
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required and must be a non-empty string' });
    }

    // Get conversation history if conversationId exists
    let messageHistory = [];
    if (conversationId) {
      const conversation = await Conversation.findOne({ sessionId: conversationId });
      if (conversation) {
        messageHistory = conversation.messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }));
      }
    }

    // Process message with agent
    const result = await agentService.processMessage(
      question.trim(),
      conversationId,
      messageHistory
    );

    if (result.success) {
      res.json({
        success: true,
        response: result.response,
        toolsUsed: result.toolsUsed,
        conversationId: result.conversationId,
        metadata: result.metadata
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        response: result.response
      });
    }
  } catch (error) {
    console.error('Query endpoint error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to process query',
      response: 'I apologize, but I encountered an error. Please check the server console for details.'
    });
  }
});

// ------------------- CONVERSATION HISTORY -------------------
app.get('/api/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findOne({ sessionId: conversationId });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------- QUERY RATING -------------------
app.post('/api/queries/:queryId/rate', async (req, res) => {
  try {
    const { queryId } = req.params;
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const query = await Query.findByIdAndUpdate(
      queryId,
      { rating: rating },
      { new: true }
    );
    
    if (!query) {
      return res.status(404).json({ error: 'Query not found' });
    }
    
    res.json({ success: true, query });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------- ANALYTICS ENDPOINTS -------------------
app.get('/api/analytics/queries', async (req, res) => {
  try {
    const queries = await Query.find().select('question toolsUsed rating errorOccurred metadata createdAt');
    res.json(queries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/analytics/stats', async (req, res) => {
  try {
    const totalQueries = await Query.countDocuments();
    const queriesWithRating = await Query.countDocuments({ rating: { $exists: true } });
    const avgRating = await Query.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const errorCount = await Query.countDocuments({ errorOccurred: true });
    const toolUsage = await Query.aggregate([
      { $unwind: '$toolsUsed' },
      { $group: { _id: '$toolsUsed', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalQueries,
      queriesWithRating,
      averageRating: avgRating[0]?.avgRating || 0,
      errorCount,
      errorRate: totalQueries > 0 ? (errorCount / totalQueries * 100).toFixed(2) : 0,
      toolUsage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------- STATIC ROUTES -------------------
// Serve static files (this should handle .html files automatically)
// But we'll also add explicit routes for better control

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/about.html'));
});

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/about.html'));
});

app.get('/how-it-works', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/how-it-works.html'));
});

app.get('/how-it-works.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/how-it-works.html'));
});

// ------------------- START SERVER -------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Open http://localhost:${PORT} in your browser`);
});
