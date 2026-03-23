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
