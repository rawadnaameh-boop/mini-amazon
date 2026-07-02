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
    imageUrl: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    maxAvailable: number;    
}
export interface Cart {
    items: CartItem[];
    totalAmount: number;

}

export interface ShippingDetails {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalcode?:string
country: string
}

export interface OrderItem {
    productId: number;
    productName: string;
    quatity: number; // Tailored to match the backend DTO spelling directly
    unitPrice: number;
    lineTotal: number;
}

export interface Order {
    orderId: number;
    createAtUtc: string;
    totalAmount: number;
    items: OrderItem[];
}

export type OrderResult = Order;