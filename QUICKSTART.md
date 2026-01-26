# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
# Backend dependencies
cd legal-assistant
npm install

# Python evaluation dependencies (optional)
cd ../evaluation
pip install -r requirements.txt
cd ..
```

### 2. Configure Environment

The `.env` file should already be created with your Gemini API key. Verify it exists:

```bash
cd legal-assistant
cat .env  # or type .env on Windows
```

It should contain:
```
GEMINI_API_KEY=AIzaSyAuS3o2g5AjWqNDQoHBLIN3tzkyT7AIL_w
MONGO_URI=mongodb://localhost:27017/legal-assistant
PORT=4000
NODE_ENV=development
```

### 3. Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Or use MongoDB Atlas** (cloud) - update `MONGO_URI` in `.env`

### 4. Start the Server

```bash
cd legal-assistant
npm start
```

You should see:
```
✓ MongoDB connected successfully
✓ Server running on port 4000
✓ Open http://localhost:4000 in your browser
```

### 5. Open the Web Interface

Open your browser and go to: **http://localhost:4000**

### 6. Try It Out!

Ask questions like:
- "What is the Personal Data Protection Law?"
- "What are the penalties for data violations?"
- "Calculate 10% of 5000 JOD"
- "What are my rights under the PDPL?"

### 7. Run Evaluation (After Some Queries)

```bash
cd evaluation
python evaluate_system.py
```

This will generate visualizations and statistics in the `evaluation/` directory.

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running
- Check `MONGO_URI` in `.env` is correct
- For MongoDB Atlas, ensure your IP is whitelisted

**Gemini API Error:**
- Verify `GEMINI_API_KEY` in `.env` is correct
- Check your API key is active at [Google AI Studio](https://makersuite.google.com/app/apikey)

**Port Already in Use:**
- Change `PORT` in `.env` to a different port (e.g., 4001)
- Or stop the process using port 4000

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the API endpoints in the README
- Explore the evaluation visualizations

