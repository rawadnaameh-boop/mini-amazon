from ml_model import calculate_fraud_score

print("==================================================")
print("   RUNNING REAL-TIME CHECKOUT FRAUD SIMULATION    ")
print("==================================================\n")

# --- SCENARIO 1: THE TUESDAY AFTERNOON SHOPPER ---
# A customer buying a couple of regular items during standard hours.
normal_price = 45.50
normal_quantity = 2
normal_hour = 14.5  # 2:30 PM

normal_score = calculate_fraud_score(normal_price, normal_quantity, normal_hour)

print("🛒 [SCENARIO 1] Normal Checkout Attempt:")
print(f"   Details: Spend ${normal_price} | Items: {normal_quantity} | Time: 2:30 PM")
print(f"   🔥 CALCULATED FRAUD SCORE: {normal_score}")
print("--------------------------------------------------")


# --- SCENARIO 2: THE MIDNIGHT BOT ATTACK ---
# An extreme outlier attempting to buy massive bulk items in the dead of night.
fraud_price = 4850.00
fraud_quantity = 150
fraud_hour = 3.25  # 3:15 AM

fraud_score = calculate_fraud_score(fraud_price, fraud_quantity, fraud_hour)

print("🚨 [SCENARIO 2] Extreme Bulk Checkout Attempt:")
print(f"   Details: Spend ${fraud_price} | Items: {fraud_quantity} | Time: 3:15 AM")
print(f"   🔥 CALCULATED FRAUD SCORE: {fraud_score}")
print("==================================================")