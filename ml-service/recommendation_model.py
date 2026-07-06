import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import text
from database import engine

class RecommendationModel:
    def __init__(self):
        self.product_ids = []
        self.similarity_matrix = None
        self.popular_products = []

    def train(self):
        query = text("""SELECT OrderId, ProductId, Quantity FROM OrderItems""")

        with engine.connect() as connection:
            df = pd.read_sql(query, connection)
        if df.empty:
            self.product_ids =[]
            self.similarity_matrix = None
            self.popular_products = []
            return
        order_product_matrix = df.pivot_table(
            index="OrderId",
            columns="ProductId",
            values="Quantity",
            aggfunc="sum",
            fill_value=0
        )
        self.product_ids = list(order_product_matrix.columns)
        product_matrix = order_product_matrix.T
        self.similarity_matrix = cosine_similarity(product_matrix)

        self.popular_products = (
            df.groupby("ProductId")["Quantity"]
            .sum()
            .sort_values(ascending=False)
            .head(10)
            .index.tolist()
        )
    def recommend(self, product_id: int, limit: int = 3):
        if self.similarity_matrix is None or product_id not in self.product_ids:
            return []

        product_index = self.product_ids.index(product_id)

        similarities = list(enumerate(self.similarity_matrix[product_index]))

        similarities = sorted(
            similarities,
            key=lambda x: x[1],
            reverse=True
         )

        recommendations = []

        for index, score in similarities:
            recommended_product_id = self.product_ids[index]

            if recommended_product_id == product_id:
                continue

            if score <= 0:
                continue

            recommendations.append(int(recommended_product_id))

            if len(recommendations) == limit:
                break

        return recommendations
    def _fallback(self, product_id: int, limit: int):
        recommendations = []
        for fallback_id in self.popular_products:
            if fallback_id != product_id:
                recommendations.append(fallback_id)
            if len(recommendations) == limit:
                break
        return recommendations

  