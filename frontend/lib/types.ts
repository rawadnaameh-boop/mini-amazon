export interface Product {
    id: number;
    sku: string;
    name: string;
    description: string;
    imageUrl: string | null;
    price: number;
    stockQuantity: number;
    isInStock: boolean;
}