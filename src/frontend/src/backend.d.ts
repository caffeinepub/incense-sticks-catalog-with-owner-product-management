import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrderRequest {
    id: bigint;
    customerName: string;
    note?: string;
    products: Array<[Product, bigint]>;
    contactDetails: string;
}
export interface UserProfile {
    name: string;
}
export interface Product {
    id: bigint;
    inStock: boolean;
    name: string;
    description: string;
    photoUrl: string;
    scent: string;
    price: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProduct(name: string, price: bigint, description: string, scent: string, photoUrl: string): Promise<bigint>;
    deleteOrderRequest(orderId: bigint): Promise<void>;
    deleteProduct(productId: bigint): Promise<void>;
    getAllOrderRequests(): Promise<Array<OrderRequest>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInStockProducts(): Promise<Array<Product>>;
    getOrderRequest(orderId: bigint): Promise<OrderRequest | null>;
    getProduct(productId: bigint): Promise<Product | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitOrderRequest(productsWithQuantity: Array<[Product, bigint]>, customerName: string, contactDetails: string, note: string | null): Promise<bigint>;
    toggleProductStock(productId: bigint): Promise<void>;
    updateProduct(productId: bigint, name: string, price: bigint, description: string, scent: string, photoUrl: string): Promise<void>;
}
