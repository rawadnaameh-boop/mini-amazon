import urllib.parse
from datetime import timedelta
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sqlalchemy import create_engine, text

# Initialize the FastAPI engine
app = FastAPI(
    title="Mini-Amazon ML Service (Diagnostic Mode)",
    version="0.1.0"
)

# ==========================================
# CONFIGURATION: DATABASE CONNECTION SETUP
# ==========================================
DB_USER = "admin"
DB_PASS = "Ritajaf43"  
DB_HOST = "miniamazon-db.chawqysseqx6.eu-north-1.rds.amazonaws.com"
DB_PORT = "3306"
DB_NAME = "miniamazon_db"

encoded_pass = urllib.parse.quote_plus(DB_PASS)
DB_CONNECTION_STRING = f"mysql+pymysql://{DB_USER}:{encoded_pass}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

try:
    engine = create_engine(DB_CONNECTION_STRING)
    print("✅ Successfully established data pipeline link to Database Server.")
except Exception as e:
    print(f"❌ Database Engine initialization failed: {e}")

# ==========================================
# API ENDPOINT: TRIGGER MACHINE LEARNING PIPELINE
# ==========================================
@app.post("/api/score-transaction")
def recalculate_user_tiers():
    print("\n⚡ ML Pipeline Triggered via HTTP Client request...")
    
    try:
        # 1. Pull the raw table layout from AWS
        df_raw = pd.read_sql("SELECT * FROM Orders", con=engine)
        
        if df_raw.empty:
            raise HTTPException(status_code=400, detail="The Orders database table is empty.")
            
        # 2. Smart column matching engine
        col_user = [c for c in df_raw.columns if 'user' in c.lower()][0]
        col_date = [c for c in df_raw.columns if 'date' in c.lower() or 'creat' in c.lower()][0]
        col_total = [c for c in df_raw.columns if 'total' in c.lower() or 'amount' in c.lower()][0]

        df_orders = df_raw[[col_user, col_date, col_total]].copy()
        df_orders.columns = ['UserId', 'OrderDate', 'OrderTotal']

        # 3. Process aggregation matrices
        snapshot_date = pd.to_datetime(df_orders['OrderDate']).max() + timedelta(days=1)
        rfm = df_orders.groupby('UserId').agg({
            'OrderDate': lambda x: (snapshot_date - pd.to_datetime(x).max()).days,
            'UserId': 'count',
            'OrderTotal': 'sum'
        })
        rfm.rename(columns={'OrderDate': 'Recency', 'UserId': 'Frequency', 'OrderTotal': 'Monetary'}, inplace=True)

        # 4. Standard Scaler transformations
        scaler = StandardScaler()
        rfm_scaled = scaler.fit_transform(rfm)

        # 5. Compute K-Means clustering clusters
        kmeans = KMeans(n_clusters=3, random_state=42, n_init='auto')
        rfm['Cluster'] = kmeans.fit_predict(rfm_scaled)

        # 6. Analyze profiles to lock high-value targets
        cluster_analysis = rfm.groupby('Cluster').mean()
        lowest_cluster_index = cluster_analysis['Monetary'].idxmin()

        # 🔍 NEW DIAGNOSTIC STEP: Inspect the Users table layout before updating
        print("\n🔍 [DIAGNOSTIC] Inspecting 'Users' table structure...")
        df_users_check = pd.read_sql("SELECT * FROM Users LIMIT 3", con=engine)
        print(f"📋 Actual Columns found in your Users table: {list(df_users_check.columns)}")
        print("📋 Sample data inside Users table right now:")
        print(df_users_check.to_string())

        # 7. Flush calculations down into target database context profiles
        print("\n🔮 --- Live Dynamic Tier Assignments ---")
        
        with engine.begin() as connection:
            for user_id, row in rfm.iterrows():
                current_cluster = row['Cluster']
                
                if current_cluster != lowest_cluster_index:
                    assigned_tier = "Tier 1"
                else:
                    assigned_tier = "Tier 2"
                
                # Smart casing detection for the Users table primary key
                user_id_col = [c for c in df_users_check.columns if c.lower() == 'id'][0]
                tier_col = [c for c in df_users_check.columns if 'tier' in c.lower()][0]
                
                update_statement = text(f"""
                    UPDATE Users 
                    SET {tier_col} = :tier 
                    WHERE {user_id_col} = :uid
                """)
                
                # Execute and capture rows affected
                result = connection.execute(update_statement, {"tier": assigned_tier, "uid": user_id})
                
                print(f"👤 Target: User ID {user_id} | Cluster: {int(current_cluster)} | Decided Tier: {assigned_tier} | Rows Actually Altered: {result.rowcount}")

        print("🚀 Success! Recalculation pipeline execution completed.")
        return {"status": "success", "total_users_processed": len(rfm)}

    except Exception as err:
        print(f"❌ Critical runtime service failure: {err}")
        raise HTTPException(status_code=500, detail=str(err))

@app.get("/api/ml-health")
def health_check():
    return {"status": "online"}