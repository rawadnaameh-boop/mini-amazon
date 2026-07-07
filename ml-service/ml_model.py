import numpy as np
from sklearn.ensemble import IsolationForest

# 1. GENERATE DUMMY "NORMAL" HISTORICAL DATA FOR TRAINING
np.random.seed(42)  # Ensures identical random numbers on every run

normal_costs = np.random.uniform(10, 150, 1000)       # Spend: $10 - $150
normal_quantities = np.random.randint(1, 5, 1000)     # Quantity: 1 - 4 items
normal_hours = np.random.uniform(8, 22, 1000)         # Time: 8 AM - 10 PM

X_train = np.column_stack((normal_costs, normal_quantities, normal_hours))

# 2. TRAIN THE ISOLATION FOREST
model = IsolationForest(n_estimators=100, contamination=0.01, random_state=42)
model.fit(X_train)


def calculate_fraud_score(total_cost: float, quantity: int, hour_of_day: float) -> float:
    """
    Evaluates a transaction using the decision function and scales it 
    cleanly into a 0.0 (Safe) to 1.0 (Fraudulent) probability.
    """
    transaction_data = np.array([[total_cost, quantity, hour_of_day]])
    
    # decision_function returns positive for normal data, negative for anomalies.
    # Normal data clusters around 0.12, anomalies drop below -0.03.
    df_score = model.decision_function(transaction_data)[0]
    
    # 3. ACCURATE SCALING MATH
    # Map the decision function from its range [-0.03, 0.12] to [1.0, 0.0]
    # Lower decision score = Higher fraud probability
    max_normal_baseline = 0.12
    min_anomaly_baseline = -0.03
    
    raw_probability = (max_normal_baseline - df_score) / (max_normal_baseline - min_anomaly_baseline)
    
    # Clip the values strictly between 0.0 and 1.0 to handle extreme cases cleanly
    fraud_probability = float(np.clip(raw_probability, 0.0, 1.0))
    
    return round(fraud_probability, 4)