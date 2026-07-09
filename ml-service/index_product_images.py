import json
import os
from io import BytesIO 
from pathlib import Path
from urllib.parse import urljoin
 
import numpy as np
import requests
from dotenv import load_dotenv
from PIL import Image

from visual_search import extract_embedding

load_dotenv() # Load environment variables from .env file

BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:5191")
PRODUCTS_API_URL = os.getenv("PRODUCTS_API_URL", f"{BACKEND_BASE_URL}/api/products")

OUTPUT_DIR = Path("embeddings")
OUTPUT_DIR.mkdir(exist_ok=True)

EMBEDDINGS_OUTPUT_PATH = OUTPUT_DIR / "product_embeddings.npy"
METADATA_OUTPUT_PATH = OUTPUT_DIR / "product_metadata.json"

def get_field(product: dict, *possible_names):
    for name in possible_names:
        if name in product: 
            return product[name]
    return None

def build_full_image_url(image_url: str) -> str:
    if image_url.startswith("http://") or image_url.startswith("https://"):
        return image_url
    return urljoin(BACKEND_BASE_URL, image_url)

def load_image_from_url(image_url: str) -> Image.Image:
    full_url = build_full_image_url(image_url)
    response = requests.get(full_url, timeout=20)
    response.raise_for_status()
    return Image.open(BytesIO(response.content)).convert("RGB")
def fetch_products():
    response = requests.get(PRODUCTS_API_URL, timeout=20)
    response.raise_for_status()
    products= response.json()
    if not isinstance(products, list):
        raise ValueError("Products API must return a JSON array/list of products.")
    return products
def main():
    print("Fetching products from backend...")
    print(f"Products API: {PRODUCTS_API_URL}")
    products = fetch_products()
    print(f"Found {len(products)} products.")
    embeddings =[]
    metadata = []
    for product in products:
        product_id = get_field(product, "id", "Id", "productId", "ProductId")
        name = get_field(product, "Name", "name")
        price = get_field(product, "price", "Price")
        stock_quantity = get_field(product, "stockQuantity", "StockQuantity")
        image_url = get_field(product, "imageUrl","ImageUrl", "image_url")
        if not product_id or not image_url:
            print(f"Skipping product because id or imageUrl is missing: {product}")
            continue
        try:
            print(f"Indexing product {product_id}: {name}")
            image = load_image_from_url(image_url)
            embedding = extract_embedding(image)
            embeddings.append(embedding)
            metadata.append({
                "productId": product_id,
                "name": name,
                "price": price,
                "stockQuantity": stock_quantity,
                "imageUrl": image_url
            })
        except Exception as error:
            print(f"Failed to index product {product_id}: {name}")
            print(f"Reason: {error}")
    if len(embeddings) ==0:
        raise RuntimeError("No product embeddings were created. Check your product image URLs.")
    embeddings_array = np.array(embeddings)

    np.save(EMBEDDINGS_OUTPUT_PATH, embeddings_array)

    with open(METADATA_OUTPUT_PATH, "w", encoding="utf-8") as file:
        json.dump(metadata, file, indent=2)

    print()
    print("Indexing complete.")
    print(f"Saved embeddings to: {EMBEDDINGS_OUTPUT_PATH}")
    print(f"Saved metadata to: {METADATA_OUTPUT_PATH}")
    print(f"Embeddings shape: {embeddings_array.shape}")


if __name__ == "__main__":
    main()