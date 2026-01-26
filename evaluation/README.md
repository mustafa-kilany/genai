# Evaluation System

This directory contains scripts for evaluating the Legal Assistant system performance.

## Files

- `evaluate_system.py` - Main evaluation script that generates visualizations
- `generate_test_data.py` - Script to generate test conversations and queries
- `requirements.txt` - Python dependencies

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Make sure your server is running** and you have some queries logged

## Usage

### Add Sample Ratings (Optional)

If your queries don't have ratings yet, you can add sample ratings for demonstration:

```bash
python add_sample_ratings.py
```

This will add realistic ratings (1-5) to all queries that don't have ratings yet.

### Generate Test Data

First, generate some test conversations:

```bash
# Make sure your server is running on localhost:4000
python generate_test_data.py
```

This will:
- Send 20+ test questions to your API
- Automatically rate the responses
- Create sample data for evaluation

### Run Evaluation

After you have some queries in the database:

```bash
python evaluate_system.py
```

This will generate:
- `system_evaluation.png` - Main visualization with 6 charts
- `quality_dashboard.png` - Quality metrics dashboard
- `summary_statistics.csv` - Summary statistics table
- `detailed_analysis.csv` - Detailed analysis table
- `raw_query_data.csv` - All query data

## Visualizations Generated

1. **Query Types Distribution** - Bar chart showing types of questions
2. **Tool Usage / Rating by Category** - Tool usage or average ratings
3. **User Rating Distribution** - Bar chart of ratings (1-5)
4. **Error Rate Over Time** - Line chart showing errors over time
5. **Response Time Distribution** - Histogram of response times
6. **Query Volume Over Time** - Line chart of query volume

Plus a Quality Dashboard with:
- Success vs Error Rate (pie chart)
- Rating Distribution (box plot)
- Token Usage Distribution
- Performance by Category (table)

## Database Connection

The script automatically detects the correct database name (Legal-assistant with capital L) to match your server configuration.

