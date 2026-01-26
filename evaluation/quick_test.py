"""
Quick test to check MongoDB connection and data
"""

from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/legal-assistant')
# Fix case
if '/legal-assistant' in MONGO_URI.lower():
    MONGO_URI = MONGO_URI.replace('/legal-assistant', '/Legal-assistant')

print(f"Connecting to: {MONGO_URI}")

client = MongoClient(MONGO_URI)

# Try different database names
for db_name in ['Legal-assistant', 'legal-assistant']:
    try:
        db = client[db_name]
        collections = db.list_collection_names()
        print(f"\n✓ Database '{db_name}' found!")
        print(f"  Collections: {collections}")
        
        if 'queries' in collections:
            queries = list(db.queries.find({}))
            print(f"  ✓ Found {len(queries)} queries")
            if queries:
                print(f"  Sample query: {queries[0].get('question', 'N/A')[:50]}...")
        break
    except Exception as e:
        print(f"  ✗ {db_name}: {e}")
        continue

