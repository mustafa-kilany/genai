"""
Evaluation Script for Legal Assistant System
Generates visualizations and analysis of system performance using Pandas and Matplotlib
"""

import pandas as pd
import matplotlib.pyplot as plt
import json
from datetime import datetime
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection - use Legal-assistant (capital L) to match server
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/legal-assistant')
# Fix case sensitivity - use Legal-assistant to match existing database
if '/legal-assistant' in MONGO_URI.lower():
    MONGO_URI = MONGO_URI.replace('/legal-assistant', '/Legal-assistant').replace('/Legal-Assistant', '/Legal-assistant')

client = MongoClient(MONGO_URI)
# Extract database name from URI or use Legal-assistant
db_name = 'Legal-assistant'  # Default to capital L
if '/Legal-assistant' in MONGO_URI:
    db_name = 'Legal-assistant'
elif '/legal-assistant' in MONGO_URI:
    db_name = 'legal-assistant'

db = client[db_name]
print(f"📊 Connected to database: {db_name}")
print(f"📊 Available collections: {db.list_collection_names()}")

def fetch_data():
    """Fetch query data from MongoDB"""
    try:
        # Mongoose uses lowercase plural collection names
        # 'Query' model -> 'queries' collection
        collection_name = 'queries'
        
        # Check if collection exists
        collections = db.list_collection_names()
        print(f"   Available collections: {collections}")
        
        if collection_name not in collections:
            print(f"   ⚠️  Collection '{collection_name}' not found")
            # Try alternative names
            if 'Queries' in collections:
                collection_name = 'Queries'
            elif 'query' in collections:
                collection_name = 'query'
            else:
                print(f"   ❌ No queries collection found")
                return pd.DataFrame()
        
        queries = list(db[collection_name].find({}))
        print(f"   ✓ Found {len(queries)} queries in '{collection_name}' collection")
        return pd.DataFrame(queries)
    except Exception as e:
        print(f"   ❌ Error fetching data: {e}")
        return pd.DataFrame()

def analyze_query_types(df):
    """Analyze types of questions asked"""
    if df.empty:
        return None
    
    # Extract keywords from questions to categorize
    categories = {
        'Greeting': ['hey', 'hello', 'hi', 'greetings', 'good morning', 'good afternoon'],
        'Data Protection': ['data', 'privacy', 'personal', 'protection', 'pdpl'],
        'Penalties/Fines': ['fine', 'penalty', 'violation', 'punishment', 'sanction', 'calculate'],
        'Rights': ['right', 'access', 'delete', 'correct', 'portability', 'my rights'],
        'Consent': ['consent', 'permission', 'authorize', 'agree'],
        'Transfer': ['transfer', 'export', 'international', 'cross-border'],
        'Storage': ['store', 'retention', 'keep', 'duration', 'period'],
        'Search': ['search', 'find', 'look for', 'what does the law say'],
        'FAQ': ['faq', 'frequently asked', 'common questions'],
        'Calculation': ['calculate', '%', 'percent', 'of'],
        'General': []
    }
    
    df['category'] = 'General'
    for category, keywords in categories.items():
        if category == 'General':
            continue
        mask = df['question'].str.lower().str.contains('|'.join(keywords), case=False, na=False)
        df.loc[mask, 'category'] = category
    
    return df['category'].value_counts()

def create_visualizations(df):
    """Create visualizations for system evaluation"""
    
    if df.empty:
        print("No data available for visualization")
        return
    
    # Set up the plotting style
    plt.style.use('seaborn-v0_8-darkgrid')
    fig = plt.figure(figsize=(16, 10))
    
    # 1. Query Types Distribution
    ax1 = plt.subplot(2, 3, 1)
    query_types = analyze_query_types(df.copy())
    if query_types is not None and len(query_types) > 0:
        query_types.plot(kind='bar', ax=ax1, color='#2c5282', edgecolor='#1a2332', linewidth=1.5)
        ax1.set_title('Distribution of Query Types', fontsize=12, fontweight='bold', pad=15)
        ax1.set_xlabel('Category', fontweight='bold')
        ax1.set_ylabel('Number of Queries', fontweight='bold')
        ax1.tick_params(axis='x', rotation=45, labelsize=9)
        ax1.grid(axis='y', alpha=0.3)
        # Add value labels on bars
        for i, v in enumerate(query_types.values):
            ax1.text(i, v + 0.1, str(v), ha='center', va='bottom', fontweight='bold')
    else:
        ax1.text(0.5, 0.5, 'No data available', ha='center', va='center', fontsize=12)
        ax1.set_title('Distribution of Query Types', fontsize=12, fontweight='bold')
    
    # 2. Tool Usage Analysis (or Response Quality by Category)
    ax2 = plt.subplot(2, 3, 2)
    tool_usage = {}
    if 'toolsUsed' in df.columns:
        for tools in df['toolsUsed'].dropna():
            if isinstance(tools, list):
                for tool in tools:
                    tool_usage[tool] = tool_usage.get(tool, 0) + 1
            elif isinstance(tools, str):
                tool_usage[tools] = tool_usage.get(tools, 0) + 1
    
    if tool_usage:
        pd.Series(tool_usage).plot(kind='barh', ax=ax2, color='#2c5282', edgecolor='#1a2332', linewidth=1.5)
        ax2.set_title('Tool Usage Frequency', fontsize=12, fontweight='bold', pad=15)
        ax2.set_xlabel('Usage Count', fontweight='bold')
        ax2.grid(axis='x', alpha=0.3)
    else:
        # Show average rating by category instead
        df_with_cats = df.copy()
        query_types = analyze_query_types(df_with_cats)
        if query_types is not None:
            df_with_cats['category'] = df_with_cats['question'].apply(lambda x: 
                next((cat for cat, keywords in {
                    'Greeting': ['hey', 'hello', 'hi'],
                    'Calculation': ['calculate', '%'],
                    'Search': ['search', 'find'],
                    'General': []
                }.items() if any(kw in x.lower() for kw in keywords)), 'General'))
            
            if 'rating' in df_with_cats.columns:
                ratings_by_category = df_with_cats.groupby('category')['rating'].mean().dropna()
            else:
                ratings_by_category = pd.Series()
            if len(ratings_by_category) > 0:
                ratings_by_category.plot(kind='barh', ax=ax2, color='#c9a961', edgecolor='#1a2332', linewidth=1.5)
                ax2.set_title('Average Rating by Category', fontsize=12, fontweight='bold', pad=15)
                ax2.set_xlabel('Average Rating', fontweight='bold')
                ax2.set_xlim(0, 5)
                ax2.grid(axis='x', alpha=0.3)
            else:
                ax2.text(0.5, 0.5, 'No rating data available', ha='center', va='center', fontsize=12)
                ax2.set_title('Tool Usage / Rating Analysis', fontsize=12, fontweight='bold')
        else:
            ax2.text(0.5, 0.5, 'No tool usage data', ha='center', va='center', fontsize=12)
            ax2.set_title('Tool Usage Frequency', fontsize=12, fontweight='bold')
    
    # 3. Rating Distribution
    ax3 = plt.subplot(2, 3, 3)
    if 'rating' in df.columns:
        ratings = df['rating'].dropna()
        if len(ratings) > 0:
            rating_counts = ratings.value_counts().sort_index()
            bars = ax3.bar(rating_counts.index, rating_counts.values, color='#c9a961', edgecolor='#1a2332', linewidth=1.5)
            ax3.set_title('User Rating Distribution', fontsize=12, fontweight='bold', pad=15)
            ax3.set_xlabel('Rating (1-5)', fontweight='bold')
            ax3.set_ylabel('Count', fontweight='bold')
            ax3.set_xticks(range(1, 6))
            ax3.grid(axis='y', alpha=0.3)
            # Add value labels on bars
            for bar in bars:
                height = bar.get_height()
                ax3.text(bar.get_x() + bar.get_width()/2., height + 0.05,
                        f'{int(height)}', ha='center', va='bottom', fontweight='bold')
        else:
            ax3.text(0.5, 0.5, 'No ratings available\n(Rate queries to see data)', ha='center', va='center', fontsize=11)
            ax3.set_title('User Rating Distribution', fontsize=12, fontweight='bold')
    else:
        ax3.text(0.5, 0.5, 'No rating column found', ha='center', va='center', fontsize=12)
        ax3.set_title('User Rating Distribution', fontsize=12, fontweight='bold')
    
    # 4. Error Rate Over Time
    ax4 = plt.subplot(2, 3, 4)
    if 'createdAt' in df.columns:
        df['createdAt'] = pd.to_datetime(df['createdAt'], errors='coerce')
        df['date'] = df['createdAt'].dt.date
        if 'errorOccurred' in df.columns:
            error_by_date = df.groupby('date')['errorOccurred'].agg(['sum', 'count'])
        else:
            error_by_date = pd.DataFrame()
    else:
        error_by_date = pd.DataFrame()
    if len(error_by_date) > 0:
        error_by_date['error_rate'] = (error_by_date['sum'] / error_by_date['count'] * 100)
        error_by_date['error_rate'].plot(ax=ax4, marker='o', color='#dc2626', linewidth=2, markersize=8)
        ax4.set_title('Error Rate Over Time', fontsize=12, fontweight='bold', pad=15)
        ax4.set_xlabel('Date', fontweight='bold')
        ax4.set_ylabel('Error Rate (%)', fontweight='bold')
        ax4.tick_params(axis='x', rotation=45)
        ax4.grid(alpha=0.3)
        ax4.set_ylim(bottom=0)
    else:
        ax4.text(0.5, 0.5, 'No date data available', ha='center', va='center', fontsize=12)
        ax4.set_title('Error Rate Over Time', fontsize=12, fontweight='bold')
    
    # 5. Response Time Analysis
    ax5 = plt.subplot(2, 3, 5)
    response_times = []
    if 'metadata' in df.columns:
        for meta in df['metadata'].dropna():
            if isinstance(meta, dict) and 'responseTime' in meta:
                response_times.append(meta['responseTime'] / 1000)  # Convert to seconds
    
    if response_times:
        ax5.hist(response_times, bins=min(20, len(set(response_times))), color='#2c5282', edgecolor='#1a2332', linewidth=1.5)
        ax5.set_title('Response Time Distribution', fontsize=12, fontweight='bold', pad=15)
        ax5.set_xlabel('Response Time (seconds)', fontweight='bold')
        ax5.set_ylabel('Frequency', fontweight='bold')
        ax5.grid(axis='y', alpha=0.3)
        # Add statistics
        avg_time = sum(response_times) / len(response_times)
        ax5.axvline(avg_time, color='#c9a961', linestyle='--', linewidth=2, label=f'Avg: {avg_time:.2f}s')
        ax5.legend()
    else:
        ax5.text(0.5, 0.5, 'No response time data', ha='center', va='center', fontsize=12)
        ax5.set_title('Response Time Distribution', fontsize=12, fontweight='bold')
    
    # 6. Queries Over Time
    ax6 = plt.subplot(2, 3, 6)
    if 'date' in df.columns:
        queries_by_date = df.groupby('date').size()
    else:
        queries_by_date = pd.Series()
    if len(queries_by_date) > 0:
        queries_by_date.plot(ax=ax6, marker='o', color='#2c5282', linewidth=2, markersize=8)
        ax6.set_title('Query Volume Over Time', fontsize=12, fontweight='bold', pad=15)
        ax6.set_xlabel('Date', fontweight='bold')
        ax6.set_ylabel('Number of Queries', fontweight='bold')
        ax6.tick_params(axis='x', rotation=45)
        ax6.grid(alpha=0.3)
        ax6.set_ylim(bottom=0)
    else:
        ax6.text(0.5, 0.5, 'No date data available', ha='center', va='center', fontsize=12)
        ax6.set_title('Query Volume Over Time', fontsize=12, fontweight='bold')
    
    plt.tight_layout()
    
    # Create evaluation directory if it doesn't exist
    import os
    os.makedirs('evaluation', exist_ok=True)
    
    plt.savefig('system_evaluation.png', dpi=300, bbox_inches='tight', facecolor='white')
    print("✓ Visualization saved to system_evaluation.png")
    
    # Also create a second visualization - Quality Metrics Dashboard
    create_quality_dashboard(df)
    
    return fig

def create_quality_dashboard(df):
    """Create a second visualization focusing on quality metrics"""
    if df.empty:
        return
    
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle('System Quality Metrics Dashboard', fontsize=16, fontweight='bold', y=0.98)
    
    # 1. Success vs Error Rate (Pie Chart)
    ax1 = axes[0, 0]
    if 'errorOccurred' in df.columns:
        error_counts = df['errorOccurred'].value_counts()
        if len(error_counts) > 0:
            labels = ['Success' if not idx else 'Error' for idx in error_counts.index]
            colors = ['#22c55e', '#dc2626']
            ax1.pie(error_counts.values, labels=labels, autopct='%1.1f%%', colors=colors, startangle=90, textprops={'fontweight': 'bold'})
            ax1.set_title('Success vs Error Rate', fontsize=12, fontweight='bold', pad=15)
    
    # 2. Rating Distribution (Box Plot)
    ax2 = axes[0, 1]
    if 'rating' in df.columns:
        ratings = df['rating'].dropna()
        if len(ratings) > 0:
            ax2.boxplot(ratings, vert=True, patch_artist=True,
                       boxprops=dict(facecolor='#2c5282', alpha=0.7),
                       medianprops=dict(color='#c9a961', linewidth=2))
            ax2.set_ylabel('Rating', fontweight='bold')
            ax2.set_title('Rating Distribution (Box Plot)', fontsize=12, fontweight='bold', pad=15)
            ax2.set_xticklabels(['Ratings'])
            ax2.grid(axis='y', alpha=0.3)
            ax2.set_ylim(0, 6)
        else:
            ax2.text(0.5, 0.5, 'No ratings available', ha='center', va='center')
            ax2.set_title('Rating Distribution', fontsize=12, fontweight='bold')
    else:
        ax2.text(0.5, 0.5, 'No rating column found', ha='center', va='center')
        ax2.set_title('Rating Distribution', fontsize=12, fontweight='bold')
    
    # 3. Response Length Analysis
    ax3 = axes[1, 0]
    response_lengths = []
    for meta in df['metadata'].dropna():
        if isinstance(meta, dict) and 'tokensUsed' in meta:
            response_lengths.append(meta['tokensUsed'])
    
    if response_lengths:
        ax3.hist(response_lengths, bins=min(15, len(set(response_lengths))), color='#2c5282', edgecolor='#1a2332', alpha=0.7)
        ax3.set_xlabel('Tokens Used', fontweight='bold')
        ax3.set_ylabel('Frequency', fontweight='bold')
        ax3.set_title('Token Usage Distribution', fontsize=12, fontweight='bold', pad=15)
        ax3.grid(axis='y', alpha=0.3)
    else:
        ax3.text(0.5, 0.5, 'No token data available', ha='center', va='center')
        ax3.set_title('Token Usage', fontsize=12, fontweight='bold')
    
    # 4. Category Performance Table
    ax4 = axes[1, 1]
    ax4.axis('tight')
    ax4.axis('off')
    
    # Create performance table
    df_with_cats = df.copy()
    query_types = analyze_query_types(df_with_cats)
    if query_types is not None and len(query_types) > 0:
        df_with_cats['category'] = df_with_cats['question'].apply(lambda x: 
            next((cat for cat, keywords in {
                'Greeting': ['hey', 'hello', 'hi'],
                'Calculation': ['calculate', '%'],
                'Search': ['search', 'find'],
                'Data Protection': ['data', 'privacy', 'pdpl'],
                'General': []
            }.items() if any(kw in x.lower() for kw in keywords)), 'General'))
        
        performance_data = []
        for category in df_with_cats['category'].unique():
            cat_df = df_with_cats[df_with_cats['category'] == category]
            avg_rating = cat_df['rating'].mean() if 'rating' in cat_df.columns else None
            error_rate = (cat_df['errorOccurred'].sum() / len(cat_df) * 100) if 'errorOccurred' in cat_df.columns else 0
            performance_data.append({
                'Category': category,
                'Count': len(cat_df),
                'Avg Rating': f'{avg_rating:.2f}' if avg_rating and not pd.isna(avg_rating) else 'N/A',
                'Error %': f'{error_rate:.1f}%'
            })
        
        if performance_data:
            perf_df = pd.DataFrame(performance_data)
            table = ax4.table(cellText=perf_df.values, colLabels=perf_df.columns,
                            cellLoc='center', loc='center',
                            colWidths=[0.3, 0.2, 0.25, 0.25])
            table.auto_set_font_size(False)
            table.set_fontsize(9)
            table.scale(1, 2)
            # Style the header
            for i in range(len(perf_df.columns)):
                table[(0, i)].set_facecolor('#2c5282')
                table[(0, i)].set_text_props(weight='bold', color='white')
            ax4.set_title('Performance by Category', fontsize=12, fontweight='bold', pad=15)
    
    plt.tight_layout()
    plt.savefig('quality_dashboard.png', dpi=300, bbox_inches='tight', facecolor='white')
    print("✓ Quality dashboard saved to quality_dashboard.png")

def generate_summary_table(df):
    """Generate summary statistics table"""
    if df.empty:
        print("No data available for summary")
        return None
    
    summary_data = {
        'Metric': [],
        'Value': []
    }
    
    # Basic statistics
    summary_data['Metric'].append('Total Queries')
    summary_data['Value'].append(len(df))
    
    # Error statistics
    error_count = 0
    if 'errorOccurred' in df.columns:
        error_count = df['errorOccurred'].sum() if df['errorOccurred'].dtype == bool else 0
    error_rate = (error_count / len(df) * 100) if len(df) > 0 else 0
    summary_data['Metric'].append('Total Errors')
    summary_data['Value'].append(int(error_count))
    summary_data['Metric'].append('Error Rate (%)')
    summary_data['Value'].append(f"{error_rate:.2f}%")
    
    # Rating statistics (if column exists)
    if 'rating' in df.columns:
        ratings = df['rating'].dropna()
        if len(ratings) > 0:
            summary_data['Metric'].append('Average Rating')
            summary_data['Value'].append(f"{ratings.mean():.2f}")
            summary_data['Metric'].append('Rated Queries')
            summary_data['Value'].append(int(len(ratings)))
        else:
            summary_data['Metric'].append('Average Rating')
            summary_data['Value'].append('N/A')
            summary_data['Metric'].append('Rated Queries')
            summary_data['Value'].append(0)
    else:
        summary_data['Metric'].append('Average Rating')
        summary_data['Value'].append('N/A (no ratings yet)')
        summary_data['Metric'].append('Rated Queries')
        summary_data['Value'].append(0)
    
    # Tool usage (if column exists)
    total_tool_uses = 0
    if 'toolsUsed' in df.columns:
        for tools in df['toolsUsed'].dropna():
            if isinstance(tools, list):
                total_tool_uses += len(tools)
            elif isinstance(tools, str):
                total_tool_uses += 1
    
    summary_data['Metric'].append('Total Tool Uses')
    summary_data['Value'].append(total_tool_uses)
    
    # Response time (if column exists)
    response_times = []
    if 'metadata' in df.columns:
        for meta in df['metadata'].dropna():
            if isinstance(meta, dict) and 'responseTime' in meta:
                response_times.append(meta['responseTime'])
    
    if response_times:
        avg_response_time = sum(response_times) / len(response_times) / 1000  # Convert to seconds
        summary_data['Metric'].append('Average Response Time (s)')
        summary_data['Value'].append(f"{avg_response_time:.2f}")
    else:
        summary_data['Metric'].append('Average Response Time (s)')
        summary_data['Value'].append('N/A')
    
    summary_df = pd.DataFrame(summary_data)
    return summary_df

def create_analysis_table(df):
    """Create a detailed analysis table"""
    if df.empty:
        return
    
    analysis_data = []
    
    # Overall statistics
    total = len(df)
    errors = 0
    if 'errorOccurred' in df.columns:
        errors = df['errorOccurred'].sum() if df['errorOccurred'].dtype == bool else 0
    rated = df['rating'].notna().sum() if 'rating' in df.columns else 0
    avg_rating = df['rating'].mean() if 'rating' in df.columns and rated > 0 else None
    
    analysis_data.append({
        'Metric': 'Total Queries',
        'Value': total
    })
    analysis_data.append({
        'Metric': 'Successful Queries',
        'Value': total - errors
    })
    analysis_data.append({
        'Metric': 'Failed Queries',
        'Value': errors
    })
    analysis_data.append({
        'Metric': 'Success Rate',
        'Value': f'{((total - errors) / total * 100):.1f}%' if total > 0 else '0%'
    })
    analysis_data.append({
        'Metric': 'Rated Queries',
        'Value': rated
    })
    if avg_rating:
        analysis_data.append({
            'Metric': 'Average Rating',
            'Value': f'{avg_rating:.2f}/5'
        })
    
    # Response time stats
    response_times = []
    for meta in df['metadata'].dropna():
        if isinstance(meta, dict) and 'responseTime' in meta:
            response_times.append(meta['responseTime'] / 1000)
    
    if response_times:
        analysis_data.append({
            'Metric': 'Avg Response Time',
            'Value': f'{sum(response_times) / len(response_times):.2f}s'
        })
        analysis_data.append({
            'Metric': 'Min Response Time',
            'Value': f'{min(response_times):.2f}s'
        })
        analysis_data.append({
            'Metric': 'Max Response Time',
            'Value': f'{max(response_times):.2f}s'
        })
    
    # Token usage
    tokens = []
    for meta in df['metadata'].dropna():
        if isinstance(meta, dict) and 'tokensUsed' in meta:
            tokens.append(meta['tokensUsed'])
    
    if tokens:
        analysis_data.append({
            'Metric': 'Total Tokens Used',
            'Value': sum(tokens)
        })
        analysis_data.append({
            'Metric': 'Avg Tokens per Query',
            'Value': f'{sum(tokens) / len(tokens):.0f}'
        })
    
    # Category breakdown
    query_types = analyze_query_types(df.copy())
    if query_types is not None and len(query_types) > 0:
        analysis_data.append({
            'Metric': 'Most Common Category',
            'Value': query_types.index[0] if len(query_types) > 0 else 'N/A'
        })
    
    analysis_df = pd.DataFrame(analysis_data)
    analysis_df.to_csv('detailed_analysis.csv', index=False)
    print("✓ Detailed analysis table saved to detailed_analysis.csv")
    print("\n" + "=" * 60)
    print("DETAILED ANALYSIS TABLE")
    print("=" * 60)
    print(analysis_df.to_string(index=False))
    print("=" * 60)

def clean_dataframe_for_export(df):
    """Clean and format dataframe for CSV export"""
    df_clean = df.copy()
    
    # Remove MongoDB's _id field
    if '_id' in df_clean.columns:
        df_clean = df_clean.drop('_id', axis=1)
    
    # Convert datetime objects to strings
    for col in df_clean.columns:
        if df_clean[col].dtype == 'object':
            try:
                # Check if column contains datetime objects
                if df_clean[col].notna().any():
                    sample = df_clean[col].dropna().iloc[0]
                    if hasattr(sample, 'isoformat'):  # datetime object
                        df_clean[col] = df_clean[col].astype(str)
            except:
                pass
    
    # Convert metadata (nested dict) to JSON strings
    if 'metadata' in df_clean.columns:
        df_clean['metadata'] = df_clean['metadata'].apply(
            lambda x: json.dumps(x) if isinstance(x, dict) else x
        )
    
    # Convert toolsUsed (list) to JSON strings
    if 'toolsUsed' in df_clean.columns:
        df_clean['toolsUsed'] = df_clean['toolsUsed'].apply(
            lambda x: json.dumps(x) if isinstance(x, list) else x
        )
    
    # Convert conversation (list) to JSON strings
    if 'conversation' in df_clean.columns:
        df_clean['conversation'] = df_clean['conversation'].apply(
            lambda x: json.dumps(x) if isinstance(x, list) else x
        )
    
    # Ensure boolean columns are properly formatted
    for col in df_clean.columns:
        if df_clean[col].dtype == 'bool':
            df_clean[col] = df_clean[col].astype(str)
    
    # Reorder columns for better readability
    preferred_cols = ['question', 'response', 'rating', 'errorOccurred', 'createdAt', 'metadata', 'toolsUsed', 'conversation']
    existing_preferred = [col for col in preferred_cols if col in df_clean.columns]
    other_cols = [col for col in df_clean.columns if col not in existing_preferred]
    df_clean = df_clean[existing_preferred + other_cols]
    
    return df_clean

def main():
    """Main evaluation function"""
    print("=" * 60)
    print("Legal Assistant System Evaluation")
    print("=" * 60)
    
    # Fetch data
    print("\n📊 Fetching data from MongoDB...")
    df = fetch_data()
    
    if df.empty:
        print("⚠️  No data found in database. Please run some queries first.")
        return
    
    print(f"✓ Found {len(df)} queries")
    
    # Generate summary table
    print("\n📋 Generating summary statistics...")
    summary_df = generate_summary_table(df)
    if summary_df is not None:
        print("\n" + "=" * 60)
        print("SUMMARY STATISTICS")
        print("=" * 60)
        print(summary_df.to_string(index=False))
        summary_df.to_csv('summary_statistics.csv', index=False)
        print("\n✓ Summary saved to summary_statistics.csv")
    
    # Create visualizations
    print("\n📈 Generating visualizations...")
    create_visualizations(df)
    
    # Export cleaned data
    print("\n💾 Exporting cleaned data...")
    df_cleaned = clean_dataframe_for_export(df)
    df_cleaned.to_csv('interactions.csv', index=False)
    print("✓ Cleaned interactions exported to interactions.csv")
    
    print("\n" + "=" * 60)
    print("Evaluation complete!")
    print("=" * 60)

if __name__ == '__main__':
    main()

