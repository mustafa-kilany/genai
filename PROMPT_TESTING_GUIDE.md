# Prompt Engineering Testing Guide - Copy-Paste Ready

## Quick Start: Test These Prompts in Your Bot

### ⚠️ IMPORTANT NOTE
Your current system uses `agentServiceSimple.js` (naive version without tools). 
To test with tool integration, change `server.js` line 12 to use `agentService` instead.

---

## PART 1: Three User Prompt Patterns

### Pattern 1: Instructional Prompts
**Copy and paste these into your chat:**

```
What is the Personal Data Protection Law?
```

```
Explain Article 15 of the PDPL
```

```
What are the penalties for violating the PDPL?
```

```
Tell me about data subject rights under the PDPL
```

```
What does Article 10 say about consent requirements?
```

**Expected Results:**
- Should provide informative responses
- Should cite article numbers
- ⚠️ May have inconsistent law numbers (current system limitation)
- ❌ No tool usage (current system doesn't use tools)

---

### Pattern 2: Role-Based Prompts
**Copy and paste these into your chat:**

```
What are my rights as a data subject under the PDPL?
```

```
I'm a business owner. What are my obligations under the PDPL?
```

```
As an employee, can my employer share my personal data without my consent?
```

```
I run a small business that collects customer data. What do I need to do to comply with the PDPL?
```

```
I want to know what personal data a company has about me. How do I request this under the PDPL?
```

**Expected Results:**
- Should personalize responses ("your rights", "you have")
- Should focus on user's role
- Should provide actionable guidance
- ❌ No tool usage (current system)

---

### Pattern 3: Casual/Conversational Prompts
**Copy and paste these into your chat:**

```
hey
```

```
hello
```

```
how are you?
```

```
hi there
```

```
what's up?
```

**Expected Results:**
- Should respond warmly
- Should NOT use tools
- Should ask how to help with legal questions
- Should be quick and natural

---

## PART 2: Naive vs Improved Comparison

### Test These to Compare Behavior:

```
What does Article 10 say about data processing consent?
```

**Current (Naive) Behavior:**
- ❌ No tool usage
- ⚠️ May cite incorrect law number
- ⚠️ Relies on training data

**Expected (Improved) Behavior:**
- ✅ Would use search_laws tool
- ✅ Would retrieve actual database content
- ✅ Would cite correct article numbers

---

```
hey
```

**Current (Naive) Behavior:**
- ✅ No tool usage (correct)
- ✅ Natural response

**Expected (Improved) Behavior:**
- ✅ No tool usage (explicitly instructed)
- ✅ Natural response

---

```
Calculate 10% of 5000 JOD
```

**Current (Naive) Behavior:**
- ❌ No tool usage
- ⚠️ May explain calculation manually

**Expected (Improved) Behavior:**
- ✅ Would use calculate("0.10 * 5000")
- ✅ Would return precise result: 500 JOD

---

## PART 3: Advanced Techniques

### Few-Shot Learning Test
**Use these in the SAME conversation (don't refresh):**

**Session 1 - Article Pattern:**
```
Turn 1: What is Article 5 of the PDPL?
Turn 2: What about Article 6?
Turn 3: Compare Article 5 and Article 6
```

**Expected:** Turn 2 and Turn 3 should use context from previous turns.

---

**Session 2 - Calculation Pattern:**
```
Turn 1: Calculate 10% of 5000 JOD
Turn 2: What is 15% of 8000?
Turn 3: Add those two amounts together
```

**Expected:** Turn 3 should remember results from Turn 1 (500) and Turn 2 (1200).

---

### Chain-of-Thought Test
**Copy and paste these complex prompts:**

```
Under the Jordanian PDPL, what rights does an employee have if their employer shares their personal data with a third party without consent, and what legal obligations did the employer violate?
```

**Expected (with tools):**
- Multi-step reasoning
- Uses search_laws for rights
- Uses search_laws for obligations
- Combines results into comprehensive answer

---

```
A company unlawfully processes 10,000 customers' personal data in violation of the PDPL. Using the relevant articles, explain the legal consequences and calculate a possible fine if the law specifies 5% of annual revenue, assuming their revenue is 100,000 JOD.
```

**Expected (with tools):**
- Uses search_laws for legal consequences
- Uses calculate for fine calculation
- Combines both into comprehensive answer

---

## Documenting Your Results

### For Each Test, Note:

1. **Prompt Used:** [Copy the exact prompt]
2. **Response Received:** [Copy the full response]
3. **Tools Used:** [Check if any tools were used]
4. **Citations:** [Note article numbers cited]
5. **Law Number:** [Note which law number mentioned]
6. **Response Time:** [If visible]
7. **Quality:** [Rate 1-5 or note issues]

### Example Documentation:

```
Test: Pattern 1.1 - Basic Information
Prompt: "What is the Personal Data Protection Law?"
Response: [Full response here]
Tools Used: None
Citations: Article 1, 2, 3
Law Number: No. 6 of 2023 (⚠️ Inconsistent - actual is No. 24)
Quality: Good overview but law number wrong
```

---

## Current System Status

**Active Agent Service:** `agentServiceSimple.js` (Naive Version)
- ✅ Functional and responding
- ❌ No tool integration
- ⚠️ Relies on training data
- ⚠️ May have inaccuracies

**Available Agent Service:** `agentService.js` (Improved Version)
- ✅ Has tool integration
- ✅ Database-backed responses
- ✅ More accurate citations
- ⚠️ Not currently active

**To Switch to Improved Version:**
1. Edit `legal-assistant/server.js`
2. Change line 12 from:
   ```javascript
   const AgentService = require('./services/agentServiceSimple');
   ```
   to:
   ```javascript
   const AgentService = require('./services/agentService');
   ```
3. Restart server
4. Re-run tests

---

## Test Checklist

- [ ] Pattern 1: Instructional prompts (5 tests)
- [ ] Pattern 2: Role-based prompts (5 tests)
- [ ] Pattern 3: Casual prompts (5 tests)
- [ ] Comparison tests (3 tests)
- [ ] Few-shot learning sessions (2 sessions)
- [ ] Chain-of-thought tests (2 tests)
- [ ] Document all results
- [ ] Note tool usage (or lack thereof)
- [ ] Check citation accuracy
- [ ] Verify law number consistency

---

## Expected Findings

### With Current System (Naive):
- ✅ Responses are informative
- ⚠️ Law numbers may be inconsistent
- ❌ No tool usage
- ⚠️ Not database-verified

### With Improved System (If Enabled):
- ✅ Tool usage for legal questions
- ✅ Database-backed responses
- ✅ Consistent law numbers
- ✅ Accurate citations
- ✅ Tool usage for calculations

---

**Good luck with your testing!**

