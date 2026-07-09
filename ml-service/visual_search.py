import numpy as np
import torch
from PIL import Image
from torchvision.models import resnet50, ResNet50_Weights
# we are loading pretrained resnet50 model
weights = ResNet50_Weights.DEFAULT
resnet_model = resnet50(weights=weights)

# remove the final classification layer
# original resnet50 outputs 1000 classes, we want the 2048 number image embedding before classifcation
embedding_model = torch.nn.Sequential(*(list(resnet_model.children())[:-1]))
embedding_model.eval() # set the model to evaluation mode

preprocess = weights.transforms() # official preprocessing for resnet50 model
def extract_embedding(image: Image.Image)-> np.ndarray:
    image = image.convert("RGB")
    image_tensor = preprocess(image).unsqueeze(0)
    with torch.no_grad():
        embedding = embedding_model(image_tensor)
    embedding = embedding.squeeze().numpy()
    norm = np.linalg.norm(embedding)
    if norm ==0:
        return embedding
    embedding = embedding / norm
    return embedding
###here we do image to vector conversion
## image -> ResNet50 -> 2048-number embedding vector


