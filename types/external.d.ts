/**
 * External API Types
 * Type definitions for external API integrations (FakeStore API)
 */

// FakeStore API Product type
export interface FakeStoreProduct {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: FakeStoreRating;
}

// FakeStore API Rating type
export interface FakeStoreRating {
    rate: number;
    count: number;
}

// Extended product from external API with mapped fields
export interface ExternalProduct {
    id: number;
    name: string;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    externalRating: number;
    ratingCount: number;
}

// External API response wrapper
export interface ExternalApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
}

// Configuration for external API
export interface ExternalApiConfig {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
}

// Product sync result
export interface ProductSyncResult {
    synced: number;
    created: number;
    updated: number;
    failed: number;
    errors: string[];
}

// Cart item from external API (if needed)
export interface FakeStoreCartItem {
    id: number;
    productId: number;
    quantity: number;
}

// Cart from external API
export interface FakeStoreCart {
    id: number;
    userId: number;
    date: string;
    items: FakeStoreCartItem[];
}
