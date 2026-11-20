const test = require('node:test');
const assert = require('node:assert/strict');
const { answer } = require('./server');

test('returns a privacy answer for matching synthetic questions', () => {
  assert.match(answer('What are my personal data rights?'), /Personal data rights/);
});

test('uses a safe fallback outside the demo knowledge base', () => {
  assert.match(answer('tell me about an unknown topic'), /synthetic assistant/);
});
