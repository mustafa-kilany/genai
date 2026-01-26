"""
Generate test conversations and queries for system evaluation
Run this after using the system to create sample data for analysis
"""

import requests
import time
import json
from datetime import datetime

BASE_URL = "http://localhost:4000"

# Add requests to requirements if needed
try:
    import requests
except ImportError:
    print("⚠️  'requests' library not found. Install with: pip install requests")
    exit(1)

# Test questions covering different types
TEST_QUESTIONS = [
    # Casual greetings
    {"question": "hey", "category": "greeting", "expected_rating": 4},
    {"question": "hello", "category": "greeting", "expected_rating": 4},
    {"question": "hi there", "category": "greeting", "expected_rating": 4},
    
    # General legal questions
    {"question": "What is the Personal Data Protection Law?", "category": "general_legal", "expected_rating": 5},
    {"question": "What are my rights under the PDPL?", "category": "rights", "expected_rating": 5},
    {"question": "Explain Article 15 of the PDPL", "category": "specific_article", "expected_rating": 4},
    
    # Calculation questions
    {"question": "Calculate 10% of 5000 JOD", "category": "calculation", "expected_rating": 5},
    {"question": "What is 5% of 10000?", "category": "calculation", "expected_rating": 5},
    {"question": "Calculate the fine: 15% of 8000 JOD", "category": "calculation", "expected_rating": 4},
    
    # Search questions
    {"question": "What does the law say about data retention?", "category": "search", "expected_rating": 4},
    {"question": "Search for laws about privacy violations", "category": "search", "expected_rating": 4},
    {"question": "Find information about data transfer regulations", "category": "search", "expected_rating": 4},
    
    # FAQ questions
    {"question": "What are frequently asked questions about data protection?", "category": "faq", "expected_rating": 3},
    {"question": "Tell me about consent requirements", "category": "consent", "expected_rating": 4},
    
    # Complex questions
    {"question": "What are the penalties for violating the PDPL and how are they calculated?", "category": "complex", "expected_rating": 4},
    {"question": "Can you explain both the rights and obligations under the data protection law?", "category": "complex", "expected_rating": 4},
]

def send_query(question):
    """Send a query to the API"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/query",
            json={"question": question},
            timeout=30
        )
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"Error sending query: {e}")
        return None

def rate_query(query_id, rating):
    """Rate a query"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/queries/{query_id}/rate",
            json={"rating": rating},
            timeout=10
        )
        return response.status_code == 200
    except Exception as e:
        print(f"Error rating query: {e}")
        return False

def generate_test_data():
    """Generate test conversations and rate them"""
    print("=" * 60)
    print("Generating Test Data for Evaluation")
    print("=" * 60)
    print(f"\nWill send {len(TEST_QUESTIONS)} test questions...\n")
    
    results = []
    conversation_id = None
    
    for i, test in enumerate(TEST_QUESTIONS, 1):
        print(f"[{i}/{len(TEST_QUESTIONS)}] Sending: {test['question']}")
        
        # Send query
        result = send_query(test['question'])
        
        if result and result.get('success'):
            conversation_id = result.get('conversationId', conversation_id)
            response_text = result.get('response', '')
            
            print(f"  ✓ Response received ({len(response_text)} chars)")
            
            # Get query ID to rate it
            time.sleep(0.5)  # Wait for DB to update
            try:
                queries_response = requests.get(f"{BASE_URL}/api/analytics/queries", timeout=10)
                if queries_response.status_code == 200:
                    queries = queries_response.json()
                    if queries:
                        latest_query = queries[-1]
                        query_id = latest_query.get('_id')
                        
                        # Rate the query
                        if query_id:
                            rating = test.get('expected_rating', 4)
                            if rate_query(query_id, rating):
                                print(f"  ✓ Rated: {rating}/5")
                            else:
                                print(f"  ⚠️  Could not rate query")
            except Exception as e:
                print(f"  ⚠️  Could not rate: {e}")
            
            results.append({
                'question': test['question'],
                'category': test['category'],
                'success': True,
                'response_length': len(response_text)
            })
        else:
            print(f"  ✗ Failed to get response")
            results.append({
                'question': test['question'],
                'category': test['category'],
                'success': False
            })
        
        # Small delay between requests
        time.sleep(1)
    
    print("\n" + "=" * 60)
    print("Test Data Generation Complete!")
    print("=" * 60)
    print(f"\n✓ Sent {len([r for r in results if r['success']])} successful queries")
    print(f"✗ {len([r for r in results if not r['success']])} failed queries")
    print(f"\nNow run: python evaluate_system.py")
    print("=" * 60)

if __name__ == '__main__':
    generate_test_data()

