# Jordanian Legal Assistant - AI-Powered Legal Help System

A comprehensive GenAI-powered legal assistant system built with Express.js, MongoDB, and Google Gemini API. This system provides intelligent legal assistance for Jordanian laws, particularly the Personal Data Protection Law (PDPL) 2023, with agent-like capabilities including tool usage, multi-turn conversations, and comprehensive evaluation.

## 🎯 Project Purpose and Features

This system demonstrates a production-ready GenAI application that:

- **Intelligent Legal Assistance**: Provides accurate, cited answers about Jordanian laws using RAG (Retrieval-Augmented Generation)
- **Agent-like Capabilities**: Uses function calling to search laws, perform calculations, read FAQs, and search cases
- **Multi-turn Conversations**: Maintains context across conversation sessions
- **Comprehensive Logging**: Tracks all queries, tool usage, ratings, and metadata
- **Data Evaluation**: Python-based analytics with visualizations for system performance
- **Modern Web UI**: Beautiful, responsive interface for non-technical users

## 🏗️ System Architecture

```
┌─────────────────┐
│   Web Browser   │
│  (index.html)   │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Express Server  │
│   (server.js)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│ MongoDB│ │ Gemini API   │
│        │ │ (Agent)      │
└────────┘ └──────┬───────┘
                  │
         ┌────────┴────────┐
         │                  │
    ┌────▼────┐      ┌──────▼──────┐
    │ Tools   │      │ Agent       │
    │ Service │      │ Service     │
    └─────────┘      └─────────────┘
```

### Key Components

1. **Backend (Express.js)**
   - `server.js`: Main Express server with REST API endpoints
   - `services/agentService.js`: Gemini AI agent with function calling
   - `services/agentTools.js`: Modular tool functions (search, calculate, file reader, case search)
   - `models/`: MongoDB schemas (Query, Conversation, Law, Case)

2. **Frontend (HTML/JavaScript)**
   - `public/index.html`: Modern, responsive chat interface

3. **Evaluation (Python)**
   - `evaluation/evaluate_system.py`: Data analysis and visualization script
   - Generates charts and statistics using Pandas/Matplotlib

4. **Database (MongoDB)**
   - Stores queries, conversations, laws, and cases
   - Tracks tool usage, ratings, errors, and metadata

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Python 3.8+** (for evaluation script)
- **Google Gemini API Key** (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Step 1: Clone and Install Dependencies

```bash
# Navigate to the project directory
cd legal-assistant

# Install Node.js dependencies
npm install

# Install Python dependencies (for evaluation)
cd ../evaluation
pip install -r requirements.txt
cd ..
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `legal-assistant` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=mongodb://localhost:27017/legal-assistant
PORT=4000
NODE_ENV=development
```

**⚠️ Security Note**: Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

### Step 3: Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service (varies by OS)
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string and update `MONGO_URI` in `.env`

### Step 4: Import Legal Data (Optional)

If you have legal data to import:

```bash
cd legal-assistant
npm run import-laws
```

### Step 5: Start the Server

```bash
cd legal-assistant
npm start
```

The server will start on `http://localhost:4000`

## 🎮 How to Run the Demo

1. **Start the Backend Server**
   ```bash
   cd legal-assistant
   npm start
   ```

2. **Open the Web Interface**
   - Navigate to `http://localhost:4000` in your browser
   - You'll see the chat interface

3. **Try Example Queries**
   - "What is the Personal Data Protection Law?"
   - "What are the penalties for violating the PDPL?"
   - "Calculate 5% of 1000 JOD"
   - "What are my rights under the PDPL?"
   - "Read the FAQ about data protection"

4. **Rate Responses**
   - After each assistant response, click the stars (1-5) to rate the quality
   - Ratings are logged for evaluation

5. **Run Evaluation Script**
   ```bash
   cd evaluation
   python evaluate_system.py
   ```
   This generates:
   - `system_evaluation.png`: Visualizations
   - `summary_statistics.csv`: Summary metrics
   - `raw_query_data.csv`: All query data

## 🔧 API Endpoints

### Query Endpoints

- `POST /api/query` - Send a question to the AI agent
  ```json
  {
    "question": "What is the PDPL?",
    "conversationId": "optional_conversation_id"
  }
  ```

- `GET /api/conversations/:conversationId` - Get conversation history

- `POST /api/queries/:queryId/rate` - Rate a query response
  ```json
  {
    "rating": 5
  }
  ```

### Analytics Endpoints

- `GET /api/analytics/queries` - Get all queries with metadata
- `GET /api/analytics/stats` - Get aggregated statistics

### Data Endpoints

- `GET /api/laws` - List all laws
- `GET /api/laws/search?q=query` - Search laws
- `GET /api/cases` - List all cases
- `POST /api/cases` - Create a new case

## 🛠️ Agent Tools and Capabilities

The system implements four agent tools:

1. **search_laws**: Searches the legal knowledge base for relevant articles
2. **calculate**: Performs mathematical calculations (fines, penalties, etc.)
3. **read_file**: Reads FAQ documents from the `faqs/` directory
4. **search_cases**: Searches for legal cases and precedents

The agent automatically decides when to use these tools based on the user's question.

## 📊 Evaluation and Analytics

The Python evaluation script (`evaluation/evaluate_system.py`) generates:

1. **Query Type Distribution**: Categorizes questions by topic
2. **Tool Usage Frequency**: Shows which tools are used most
3. **Rating Distribution**: User satisfaction metrics
4. **Error Rate Over Time**: System reliability tracking
5. **Response Time Distribution**: Performance analysis
6. **Query Volume Over Time**: Usage patterns

## 🏛️ System Design Best Practices

### Code Quality

- **Modular Structure**: Separation of concerns (services, models, routes)
- **Error Handling**: Comprehensive try-catch blocks and error logging
- **Type Safety**: Clear data structures and validation
- **Documentation**: Inline comments and JSDoc-style documentation

### Security

- **API Key Management**: Environment variables, never hard-coded
- **Input Validation**: Sanitization of user inputs
- **File Access Control**: Restricted file reading to specific directories
- **Error Messages**: Sanitized error messages in production

### Ethics and Responsible AI

- **Transparency**: Clear indication when tools are used
- **Accuracy**: Cites sources (article numbers) when referencing laws
- **Limitations**: System acknowledges when it doesn't know something
- **Privacy**: No personal data stored beyond conversation logs
- **Bias Mitigation**: Focused on factual legal information

## 🎨 Innovation Highlights

1. **Intelligent Tool Selection**: The agent automatically determines which tools to use based on context
2. **Multi-step Reasoning**: Can break down complex questions and use multiple tools sequentially
3. **Conversation Memory**: Maintains context across multiple turns
4. **Comprehensive Evaluation**: Built-in analytics for continuous improvement
5. **Domain-Specific**: Specialized for Jordanian legal system with bilingual support

## 📝 Known Limitations

1. **Language Support**: Primarily optimized for English, with Arabic support for law content
2. **Knowledge Base**: Limited to imported laws and cases
3. **Real-time Updates**: Legal database requires manual updates
4. **API Rate Limits**: Subject to Google Gemini API rate limits
5. **File Reading**: Limited to files in `faqs/` and `knowledge-base/` directories

## 🔮 Future Enhancements

- [ ] Support for more legal domains beyond PDPL
- [ ] Enhanced Arabic language processing
- [ ] Real-time legal database updates
- [ ] Advanced analytics dashboard
- [ ] Multi-user support with authentication
- [ ] Export conversation history
- [ ] Integration with legal document databases

## 📄 License

ISC

## 👥 Author

Legal Assistant System - GenAI Project

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- MongoDB for data storage
- Express.js community for excellent documentation

---

**Note**: This system is for educational and demonstration purposes. For actual legal advice, consult a qualified legal professional.

