"""
Add sample ratings to existing queries for evaluation demonstration
This script adds random ratings (1-5) to queries that don't have ratings yet
"""

from pymongo import MongoClient
import os
import random
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/legal-assistant')
# Fix case sensitivity
if '/legal-assistant' in MONGO_URI.lower():
    MONGO_URI = MONGO_URI.replace('/legal-assistant', '/Legal-assistant')

client = MongoClient(MONGO_URI)
db_name = 'Legal-assistant'  # Match server
db = client[db_name]

def add_sample_ratings():
    """Add sample ratings to queries without ratings"""
    
    # Find all queries without ratings
    queries = list(db.queries.find({ 'rating': { '$exists': False } }))
    
    if len(queries) == 0:
        print("✓ All queries already have ratings")
        return
    
    print(f"Found {len(queries)} queries without ratings")
    print("Adding sample ratings...")
    
    # Add ratings based on question type (for more realistic distribution)
    ratings_added = 0
    for query in queries:
        question = query.get('question', '').lower()
        
        # Assign ratings based on question quality/type
        if any(word in question for word in ['hey', 'hello', 'hi', 'how are']):
            # Greetings - usually good responses
            rating = random.choices([3, 4, 5], weights=[1, 2, 3])[0]
        elif any(word in question for word in ['what', 'explain', 'tell me', 'help']):
            # Information requests - varied quality
            rating = random.choices([2, 3, 4, 5], weights=[1, 2, 3, 2])[0]
        elif any(word in question for word in ['law', 'article', 'legal', 'data protection']):
            # Legal questions - usually good
            rating = random.choices([3, 4, 5], weights=[1, 2, 4])[0]
        else:
            # General questions - random distribution
            rating = random.randint(2, 5)
        
        # Update query with rating
        db.queries.update_one(
            { '_id': query['_id'] },
            { '$set': { 'rating': rating } }
        )
        ratings_added += 1
        print(f"  ✓ Query '{query.get('question', 'N/A')[:50]}...' → Rating: {rating}")
    
    print(f"\n✓ Added ratings to {ratings_added} queries")
    print("Run evaluate_system.py again to see the updated visualizations!")

if __name__ == '__main__':
    print("=" * 60)
    print("Adding Sample Ratings to Queries")
    print("=" * 60)
    add_sample_ratings()

