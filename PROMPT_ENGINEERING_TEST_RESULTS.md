# Prompt Engineering Strategy - Test Results & Documentation

## Test Date: $(date)
## System: Jordanian Legal Assistant AI
## Model: Google Gemini 2.5 Flash

---

## Part 1: Base System Prompt & Three User Prompt Patterns

### 1.1 Base System Prompt

**Current System Prompt:**
```
You are a Jordanian Legal Assistant AI. You help users understand Jordanian laws, particularly the Personal Data Protection Law (PDPL) 2023.

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

Use functions when appropriate to provide accurate, cited information. For casual conversations or greetings, respond naturally without using tools.
```

---

### 1.2 Pattern 1: Instructional Prompts

**Definition:** Direct, task-oriented questions asking for specific legal information.

#### Test 1.1: Basic Information Request
**Prompt:** "What is the Personal Data Protection Law?"

**Expected Behavior:**
- Uses search_laws tool
- Provides overview with citations
- Explains what PDPL is

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

#### Test 1.2: Specific Article Request
**Prompt:** "Explain Article 15 of the PDPL"

**Expected Behavior:**
- Uses search_laws("Article 15 PDPL")
- Retrieves exact Article 15 content
- Cites Article 15

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

#### Test 1.3: Penalty Inquiry
**Prompt:** "What are the penalties for violating the PDPL?"

**Expected Behavior:**
- Uses search_laws("penalties violation PDPL")
- Finds articles related to penalties
- Cites specific article numbers

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

### 1.3 Pattern 2: Role-Based Prompts

**Definition:** Questions framed from a specific user perspective.

#### Test 2.1: Data Subject Perspective
**Prompt:** "What are my rights as a data subject under the PDPL?"

**Expected Behavior:**
- Uses search_laws("data subject rights PDPL")
- Tailors answer to individual perspective
- Provides role-specific information

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

#### Test 2.2: Business Owner Perspective
**Prompt:** "I'm a business owner. What are my obligations under the PDPL?"

**Expected Behavior:**
- Uses search_laws("business obligations data controller PDPL")
- Focuses on business compliance
- Provides practical guidance

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

### 1.4 Pattern 3: Casual/Conversational Prompts

**Definition:** Informal greetings or non-legal questions.

#### Test 3.1: Simple Greeting
**Prompt:** "hey"

**Expected Behavior:**
- Responds warmly WITHOUT using tools
- No database queries
- Asks how to help with legal questions

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

#### Test 3.2: Formal Greeting
**Prompt:** "hello"

**Expected Behavior:**
- Friendly greeting response
- No tool usage
- Invites legal questions

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

## Part 2: Naive vs Improved Prompts Comparison

### 2.1 Naive Prompt

**Naive System Prompt:**
```
You are a Jordanian Legal Assistant AI. You help users understand Jordanian laws, particularly the Personal Data Protection Law (PDPL) 2023.

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
- Finding relevant legal cases
```

### 2.2 Improved Prompt

**Improved System Prompt:** (Same as Base System Prompt above)

### 2.3 Comparison Tests

#### Comparison Test 1: Legal Question
**Prompt:** "What does Article 10 say about data processing consent?"

**Naive Prompt Expected Issues:**
- May rely on general knowledge (no tool usage)
- Vague response without actual article content
- Possible hallucination

**Improved Prompt Expected Behavior:**
- Uses search_laws("Article 10 data processing consent")
- Retrieves actual Article 10 content from database
- Strong citations with exact article numbers

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

#### Comparison Test 2: Casual Greeting
**Prompt:** "hey"

**Naive Prompt Expected Issues:**
- May use tools unnecessarily
- Over-complicated response
- Wastes API calls

**Improved Prompt Expected Behavior:**
- Recognizes greeting (explicit instruction)
- Responds warmly WITHOUT tools
- Efficient, natural response

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

#### Comparison Test 3: Calculation Request
**Prompt:** "Calculate 10% of 5000 JOD"

**Naive Prompt Expected Issues:**
- May explain calculation manually
- May not use calculate tool
- Verbose, less precise

**Improved Prompt Expected Behavior:**
- Uses calculate("0.10 * 5000") function
- Returns precise result: 500 JOD
- Quick, accurate calculation

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

## Part 3: Advanced Techniques

### 3.1 Few-Shot Learning

**How it works:** Conversation history provides examples of previous Q&A patterns.

#### Few-Shot Test Session 1: Article Pattern
**Turn 1 Prompt:** "What is Article 5 of the PDPL?"
**Turn 2 Prompt:** "What about Article 6?"
**Turn 3 Prompt:** "Compare Article 5 and Article 6"

**Expected Behavior:**
- Turn 2 learns from Turn 1's pattern
- Turn 3 uses context from both previous turns
- Maintains consistent response style

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

#### Few-Shot Test Session 2: Calculation Pattern
**Turn 1 Prompt:** "Calculate 10% of 5000 JOD"
**Turn 2 Prompt:** "What is 15% of 8000?"
**Turn 3 Prompt:** "Add those two amounts together"

**Expected Behavior:**
- Turn 2 recognizes calculation pattern from Turn 1
- Turn 3 uses context from both calculations
- Maintains calculation consistency

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

### 3.2 Chain-of-Thought Reasoning

**How it works:** Multi-step reasoning through function calling.

#### Chain-of-Thought Test 1: Multi-Step Legal
**Prompt:** "Under the Jordanian PDPL, what rights does an employee have if their employer shares their personal data with a third party without consent, and what legal obligations did the employer violate?"

**Expected Chain-of-Thought:**
1. Analyze question → Identify intent (rights + obligations)
2. Determine tools → search_laws for rights, search_laws for obligations
3. Extract parameters → Query strings
4. Execute tools → Get results
5. Process results → Extract relevant information
6. Synthesize answer → Comprehensive response

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

#### Chain-of-Thought Test 2: Legal + Calculation
**Prompt:** "A company unlawfully processes 10,000 customers' personal data in violation of the PDPL. Using the relevant articles, explain the legal consequences and calculate a possible fine if the law specifies 5% of annual revenue, assuming their revenue is 100,000 JOD."

**Expected Chain-of-Thought:**
1. Analyze → Legal consequences + calculation needed
2. Determine tools → search_laws + calculate
3. Extract parameters → Query + expression
4. Execute tools → Get legal info + calculation result
5. Process results → Combine information
6. Synthesize answer → Comprehensive response

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

### 3.3 Tool Description Prompting

**How it works:** Tool descriptions guide AI's tool selection.

#### Tool Selection Test 1: Law Search
**Prompt:** "What does Article 20 say?"

**Expected:** Uses search_laws (description matches "articles")

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

#### Tool Selection Test 2: Calculation
**Prompt:** "Calculate 15% of 8000 JOD"

**Expected:** Uses calculate (description matches "calculations")

**Actual Test Results:**
[TO BE FILLED AFTER TESTING]

---

## Test Execution Plan

1. Start server
2. Test each prompt pattern
3. Document exact responses
4. Compare naive vs improved
5. Test few-shot learning (same conversation)
6. Test chain-of-thought (complex queries)
7. Document tool usage
8. Analyze response quality

---

## Notes

- All tests conducted with current system prompt (improved version)
- Tool usage tracked via server logs
- Response quality assessed based on citations, accuracy, completeness
- Conversation IDs tracked for few-shot learning tests

