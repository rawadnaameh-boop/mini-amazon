import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeRegressor

class DynamicPricingModel:
    def __init__(self):
        # max_depth=5 keeps the tree predictable and prevents it from overcomplicating rules
        self.model = DecisionTreeRegressor(max_depth=5)

    def generate_synthetic_training_data(self, n_samples=2000):
        """Generates a dataset to teach the Decision Tree how to price goods based on market rules."""
        np.random.seed(42)
        
        # Simulate realistic ranges for training
        stock = np.random.randint(1, 150, n_samples)
        comp_price = np.random.uniform(10.0, 300.0, n_samples)
        velocity = np.random.randint(0, 60, n_samples)
        
        target_price = np.zeros(n_samples)
        
        for i in range(n_samples):
            # Rule 1: Scarcity / Buyout condition (Low stock AND High velocity) -> Surge pricing (40% markup)
            if stock[i] <= 5 and velocity[i] >= 30:
                target_price[i] = comp_price[i] * 1.40 
            # Rule 2: Dead sales (No velocity) -> Clearance markdown (15% discount)
            elif velocity[i] == 0:
                target_price[i] = comp_price[i] * 0.85 
            # Rule 3: Normal conditions -> Slightly undercut competitor by 2%
            else:
                target_price[i] = comp_price[i] * 0.98 
                
        df = pd.DataFrame({
            'stock': stock,
            'comp_price': comp_price,
            'velocity': velocity,
            'target_price': target_price
        })
        return df

    def train(self):
        """Generates data and trains the Decision Tree Regressor."""
        print("[Pricing Model] Generating synthetic data and training tree...")
        df = self.generate_synthetic_training_data()
        
        X = df[['stock', 'comp_price', 'velocity']]
        y = df['target_price']
        
        self.model.fit(X, y)
        print("[Pricing Model] Training complete and model is ready.")

    def predict_optimal_price(self, stock: int, comp_price: float, velocity: int) -> float:
        """Predicts the optimal price given current market features."""
        features = np.array([[stock, comp_price, velocity]])
        prediction = self.model.predict(features)[0]
        return round(float(prediction), 2)