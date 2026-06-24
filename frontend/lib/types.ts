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
export interface CartItem {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalItemPrice: number;
}
export interface Cart {
    cartId: number;
    items: CartItem[];
    cartTotal: number;
}

export interface ShippingDetails {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode?:string;
    country: string;

}

export interface OrderItemResult{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}
export interface OrderResult{
    orderId: number;
    createAtUtc: string;
    totalAmount: number;
    items: OrderItemResult[];
}