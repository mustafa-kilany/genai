# Jordan Law Assistant Demo

A synthetic retrieval-style assistant demonstrating a safe GenAI application architecture without client records, proprietary laws, or API credentials.

## Highlights
- Plain-Node REST API and responsive browser UI
- Keyword-based demo retrieval with no external model dependency
- Explicit legal-information disclaimer
- Automated Node test coverage

## Architecture
Browser → `POST /api/chat` → deterministic knowledge matcher → JSON response

## Run
```powershell
npm install
Copy-Item .env.example .env
npm start
```

Open `http://localhost:4000`.

## Test
```powershell
npm test
```
