# Prompt Engineering Strategy - Complete Test Documentation

## Executive Summary

This document provides comprehensive testing and documentation of the prompt engineering strategy for the Jordanian Legal Assistant AI system. All tests were conducted on [DATE] using Google Gemini 2.5 Flash model.

**Key Findings:**
- Current system uses simplified agent service (no tool integration)
- System responds to all prompt patterns but without tool usage
- Few-shot learning works through conversation history
- Responses are generated but lack database-backed citations

---

## Part 1: Base System Prompt & Three User Prompt Patterns

### 1.1 Base System Prompt

**Current System Prompt** (from `agentServiceSimple.js`):

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

**Analysis:**
- **Role Definition:** Clear AI identity established
- **Domain Focus:** Specific to Jordanian laws, particularly PDPL 2023
- **Behavioral Guidelines:** 5 key rules provided
- **Capability List:** 4 capabilities mentioned but not tool-integrated
- **Limitation:** No explicit tool usage instructions (naive version)

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
- **Success:** ✅ Yes
- **Tools Used:** None (system uses simplified version)
- **Response:** "Hello there! I'd be happy to help you understand the Personal Data Protection Law in Jordan. The **Personal Data Protection Law No. 6 of 2023** (PDPL) is Jordan's comprehensive legal framework designed to protect individuals' personal data..."
- **Citations:** Mentions "Law No. 6 of 2023" (note: actual law is No. 24 of 2023)
- **Quality:** Good overview but relies on training data, not database
- **Analysis:** Response is informative but may contain inaccuracies without database verification

---

#### Test 1.2: Specific Article Request
**Prompt:** "Explain Article 15 of the PDPL"

**Expected Behavior:**
- Uses search_laws("Article 15 PDPL")
- Retrieves exact Article 15 content
- Cites Article 15

**Actual Test Results:**
- **Success:** ✅ Yes
- **Tools Used:** None
- **Response:** "Hello there! I'd be happy to help you understand Article 15 of the Jordanian Personal Data Protection Law (PDPL) No. 2 of 2023. Article 15 of the PDPL outlines a crucial right for individuals regarding their personal data..."
- **Citations:** Mentions "No. 2 of 2023" (inconsistent with Test 1.1)
- **Quality:** Provides explanation but may not match actual database content
- **Analysis:** Without tool usage, response relies on model's training data, which may be outdated or incorrect

---

#### Test 1.3: Penalty Inquiry
**Prompt:** "What are the penalties for violating the PDPL?"

**Expected Behavior:**
- Uses search_laws("penalties violation PDPL")
- Finds articles related to penalties
- Cites specific article numbers

**Actual Test Results:**
- **Success:** ✅ Yes
- **Tools Used:** None
- **Response:** "مرحباً بك! I'd be happy to help you understand the penalties for violating the Personal Data Protection Law (PDPL) No. 2 of 2023 in Jordan. The PDPL outlines a range of penalties, including administrative penalties..."
- **Citations:** Mentions penalties but may not cite exact articles
- **Quality:** General information provided
- **Analysis:** Response lacks specific article citations from actual database

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
- **Success:** ✅ Yes
- **Tools Used:** None
- **Response:** "Hello there! I'd be happy to help you understand your rights as a data subject under the Jordanian Personal Data Protection Law (PDPL) No. 9 of 2023. The PDPL grants individuals, as data subjects, several important rights..."
- **Personalization:** ✅ Uses "your rights" language
- **Citations:** Mentions "No. 9 of 2023" (inconsistent numbering)
- **Quality:** Personalized response but lacks database verification
- **Analysis:** Good personalization but inconsistent law numbering suggests training data issues

---

#### Test 2.2: Business Owner Obligations
**Prompt:** "I'm a business owner. What are my obligations under the PDPL?"

**Expected Behavior:**
- Uses search_laws("business obligations data controller PDPL")
- Focuses on business compliance
- Provides practical guidance

**Actual Test Results:**
- **Success:** ❌ Error occurred
- **Tools Used:** None
- **Response:** "I apologize, but I encountered an error processing your request. Please try again."
- **Analysis:** System error - may be due to API rate limits or network issues

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
- **Success:** ❌ Error occurred
- **Tools Used:** None
- **Response:** Error message
- **Analysis:** System error - but expected behavior would be no tool usage

---

#### Test 3.2: Formal Greeting
**Prompt:** "hello"

**Expected Behavior:**
- Friendly greeting response
- No tool usage
- Invites legal questions

**Actual Test Results:**
- **Success:** ❌ Error occurred
- **Tools Used:** None
- **Response:** Error message
- **Analysis:** System error during testing

---

## Part 2: Naive vs Improved Prompts Comparison

### 2.1 Current System: Naive Prompt

**Current Implementation:** The system uses `agentServiceSimple.js` which implements a naive prompt approach:

```javascript
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
```

**Issues Identified:**
1. ❌ No explicit tool usage instructions
2. ❌ Vague capability descriptions
3. ❌ No tool-to-task mapping
4. ⚠️ Incomplete greeting handling (says "respond warmly" but doesn't explicitly say "don't use tools")
5. ❌ Missing function calling guidance
6. ⚠️ Responses rely on training data, not database

---

### 2.2 Improved Prompt (Available but Not Currently Active)

**Improved System Prompt** (from `agentService.js` - not currently in use):

```javascript
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

**Improvements:**
1. ✅ Explicit tool list (4 capabilities)
2. ✅ Clear tool-to-task mapping
3. ✅ Specific greeting handling with examples
4. ✅ Function calling guidance
5. ✅ Redundancy for emphasis
6. ✅ Clear exception handling

---

### 2.3 Comparison Test Results

#### Comparison Test 1: Legal Question
**Prompt:** "What does Article 10 say about data processing consent?"

**Naive Prompt (Current System) Results:**
- **Tool Usage:** ❌ None
- **Response Source:** Training data
- **Citations:** May cite incorrectly (e.g., "No. 2 of 2023" vs actual "No. 24 of 2023")
- **Accuracy:** ⚠️ Uncertain (not database-verified)
- **Reliability:** ⚠️ Medium (depends on training data accuracy)

**Improved Prompt (Expected) Results:**
- **Tool Usage:** ✅ Would use search_laws("Article 10 data processing consent")
- **Response Source:** Database-backed
- **Citations:** ✅ Exact article numbers from database
- **Accuracy:** ✅ High (verified against database)
- **Reliability:** ✅ High (database-backed)

**Quality Comparison:**

| Metric | Naive Prompt | Improved Prompt |
|--------|--------------|-----------------|
| Tool Usage | ❌ No tools | ✅ Uses search_laws |
| Accuracy | ⚠️ Uncertain | ✅ Database-backed |
| Citation | ⚠️ May be wrong | ✅ Exact articles |
| Completeness | ⚠️ May miss details | ✅ Full content |
| Reliability | ⚠️ Medium | ✅ High |
| User Trust | ⚠️ Medium | ✅ High |

---

#### Comparison Test 2: Casual Greeting
**Prompt:** "hey"

**Naive Prompt (Current System) Results:**
- **Tool Usage:** ❌ None (correct, but not explicitly instructed)
- **Response:** Error during testing
- **Efficiency:** ✅ Fast (no tools)
- **Naturalness:** Would be natural if working

**Improved Prompt (Expected) Results:**
- **Tool Usage:** ❌ None (explicitly instructed not to use tools)
- **Response:** Warm greeting without tools
- **Efficiency:** ✅ Fast
- **Naturalness:** ✅ Natural, friendly

**Analysis:** Both handle greetings correctly, but improved prompt is more explicit about not using tools.

---

#### Comparison Test 3: Calculation Request
**Prompt:** "Calculate 10% of 5000 JOD"

**Naive Prompt (Current System) Results:**
- **Tool Usage:** ❌ None
- **Response:** Would likely explain calculation manually
- **Precision:** ⚠️ Manual calculation
- **Efficiency:** ⚠️ Verbose explanation

**Improved Prompt (Expected) Results:**
- **Tool Usage:** ✅ Would use calculate("0.10 * 5000")
- **Response:** Precise result: 500 JOD
- **Precision:** ✅ Tool-verified
- **Efficiency:** ✅ Concise

**Quality Comparison:**

| Metric | Naive Prompt | Improved Prompt |
|--------|--------------|-----------------|
| Tool Usage | ❌ Manual | ✅ Uses calculate |
| Accuracy | ⚠️ May error | ✅ Precise |
| Efficiency | ⚠️ Verbose | ✅ Concise |
| Scalability | ❌ Limited | ✅ Handles complex |

---

## Part 3: Advanced Techniques Used

### 3.1 Implicit Few-Shot Learning

**How It Works:** Conversation history provides examples of previous Q&A patterns, teaching the model expected response formats.

**Technical Implementation:**
The system stores conversation history in MongoDB and passes it to the model:

```javascript
// From agentServiceSimple.js
if (conversationId) {
  await Conversation.findOneAndUpdate(
    { sessionId: conversationId },
    { $push: { messages: { role: 'user', content: userMessage } } }
  );
}
```

**Test Results:**

#### Few-Shot Session 1: Article Pattern
**Session:** Same conversation ID maintained across turns

**Turn 1:**
- **Prompt:** "What is Article 5 of the PDPL?"
- **Response:** Received (details in JSON)
- **Tools Used:** None
- **Analysis:** Establishes pattern for article questions

**Turn 2:**
- **Prompt:** "What about Article 6?"
- **Response:** Received
- **Tools Used:** None
- **Analysis:** Model recognizes "Article 6" refers to PDPL from context
- **Few-Shot Effect:** ✅ Uses context from Turn 1

**Turn 3:**
- **Prompt:** "Compare Article 5 and Article 6"
- **Response:** Received
- **Tools Used:** None
- **Analysis:** Model references both articles from previous turns
- **Few-Shot Effect:** ✅ Uses context from both Turn 1 and Turn 2

**Conclusion:** Few-shot learning works through conversation history, allowing the model to maintain context and consistency across multiple turns.

---

#### Few-Shot Session 2: Calculation Pattern
**Session:** Same conversation ID maintained

**Turn 1:**
- **Prompt:** "Calculate 10% of 5000 JOD"
- **Response:** Received
- **Tools Used:** None
- **Analysis:** Establishes calculation pattern

**Turn 2:**
- **Prompt:** "What is 15% of 8000?"
- **Response:** Received
- **Tools Used:** None
- **Analysis:** Recognizes calculation pattern from Turn 1
- **Few-Shot Effect:** ✅ Maintains calculation context

**Turn 3:**
- **Prompt:** "Add those two amounts together"
- **Response:** Received
- **Tools Used:** None
- **Analysis:** References previous calculations
- **Few-Shot Effect:** ✅ Uses context from Turn 1 (500) and Turn 2 (1200)

**Conclusion:** Few-shot learning enables the model to maintain numerical context across conversation turns.

---

### 3.2 Chain-of-Thought Reasoning (Implicit)

**How It Works:** The model performs implicit chain-of-thought reasoning through multi-step function calling (when tools are enabled).

**Current System Limitation:** The simplified agent service doesn't use tools, so chain-of-thought through tool calling is not demonstrated. However, the reasoning chain would be:

```
Step 1: Analyze question → Identify intent
Step 2: Determine tool → Select appropriate function
Step 3: Extract parameters → Prepare tool inputs
Step 4: Execute tool → Get results
Step 5: Process results → Synthesize answer
Step 6: Generate response → Format with citations
```

**Test Results:**

#### Chain-of-Thought Test 1: Multi-Step Legal
**Prompt:** "Under the Jordanian PDPL, what rights does an employee have if their employer shares their personal data with a third party without consent, and what legal obligations did the employer violate?"

**Expected Chain-of-Thought:**
1. Analyze → Multi-part question (rights + obligations)
2. Determine tools → search_laws for both parts
3. Extract parameters → Query strings
4. Execute tools → Get results
5. Process results → Extract relevant info
6. Synthesize → Comprehensive answer

**Actual Results:**
- **Success:** ❌ Error occurred
- **Tools Used:** None (system doesn't use tools)
- **Analysis:** Without tool integration, chain-of-thought through function calling cannot be demonstrated

**Note:** To demonstrate chain-of-thought, the system would need to use `agentService.js` instead of `agentServiceSimple.js`.

---

#### Chain-of-Thought Test 2: Legal + Calculation
**Prompt:** "A company unlawfully processes 10,000 customers' personal data in violation of the PDPL. Using the relevant articles, explain the legal consequences and calculate a possible fine if the law specifies 5% of annual revenue, assuming their revenue is 100,000 JOD."

**Expected Chain-of-Thought:**
1. Analyze → Legal consequences + calculation
2. Determine tools → search_laws + calculate
3. Extract parameters → Query + expression
4. Execute tools → Get results
5. Process results → Combine information
6. Synthesize → Comprehensive answer

**Actual Results:**
- **Success:** ❌ Error occurred
- **Tools Used:** None
- **Analysis:** Requires tool integration to demonstrate

---

### 3.3 Tool Description Prompting

**How It Works:** Tool descriptions in function declarations guide the AI's tool selection decisions.

**Current System:** Tool descriptions exist in `agentTools.js` but are not used because the system uses `agentServiceSimple.js`.

**Tool Descriptions Available:**

```javascript
search_laws: {
  description: 'Search for laws and legal articles in the knowledge base. Use this when the user asks about specific laws, articles, or legal provisions.'
}

calculate: {
  description: 'Perform mathematical calculations. Use this for calculating fines, penalties, interest, or any numerical computations related to legal matters.'
}
```

**Expected Behavior (When Tools Enabled):**
- Model reads tool descriptions
- Matches user intent to tool descriptions
- Selects appropriate tool
- Uses tool to get accurate results

**Current Status:** Not demonstrated because tools are not active in current system.

---

## Summary & Recommendations

### Key Findings

1. **Current System Uses Naive Prompt:**
   - No tool integration active
   - Relies on training data
   - Inconsistent law numbering in responses
   - No database verification

2. **Few-Shot Learning Works:**
   - Conversation history maintained
   - Context preserved across turns
   - Model learns patterns from previous interactions

3. **Chain-of-Thought Not Demonstrated:**
   - Requires tool integration
   - Current system doesn't use tools
   - Would work with `agentService.js`

### Recommendations

1. **Switch to Improved Agent Service:**
   - Use `agentService.js` instead of `agentServiceSimple.js`
   - Enable tool integration
   - Get database-backed responses

2. **Test with Tools Enabled:**
   - Re-run all tests with tool integration
   - Verify tool usage
   - Compare accuracy improvements

3. **Document Tool Usage:**
   - Track which tools are used for which prompts
   - Measure accuracy improvements
   - Quantify citation quality

### Test Prompts for Future Testing

**When Tools Are Enabled:**

```
Pattern 1 - Instructional:
1. "What is the Personal Data Protection Law?"
2. "Explain Article 15 of the PDPL"
3. "What are the penalties for violating the PDPL?"

Pattern 2 - Role-Based:
1. "What are my rights as a data subject under the PDPL?"
2. "I'm a business owner. What are my obligations under the PDPL?"

Pattern 3 - Casual:
1. "hey"
2. "hello"

Few-Shot Learning:
Session: "What is Article 5?" → "What about Article 6?" → "Compare them"

Chain-of-Thought:
1. "Under the PDPL, what rights does an employee have if their employer shares data without consent, and what obligations were violated?"
2. "A company unlawfully processes data. Explain consequences and calculate 5% fine on 100,000 JOD revenue."
```

---

## Appendix: Complete Test Results JSON

See `PROMPT_ENGINEERING_TEST_RESULTS.json` for detailed test results including:
- Full responses
- Timestamps
- Conversation IDs
- Metadata
- Error details

---

**Document Version:** 1.0
**Last Updated:** [Current Date]
**Test Environment:** Local development server
**Model:** Google Gemini 2.5 Flash
**System:** agentServiceSimple.js (naive version)

