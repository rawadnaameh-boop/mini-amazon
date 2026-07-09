from PIL import Image
from visual_search import extract_embedding

image= Image.new("RGB", (224, 224), color="blue")

embedding = extract_embedding(image)

print("Embedding shape:", embedding.shape)
print("First 5 values: ", embedding[:5])
