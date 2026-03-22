/**
 * CDS Entity Interfaces
 * Type definitions for SAP CAP entities based on db/schema.cds
 */

// Supplier: ID (Integer), name (String 100), email (String 255), rating (Integer 1-5)
export interface Supplier {
    ID: number;
    name: string;
    email: string;
    rating: number;
}

// Product: ID, name, price (Decimal 10,2), category (50), externalRating (3,2), averageRating (3,2), supplier (Association)
export interface Product {
    ID: number;
    name: string;
    price: number;
    category?: string;
    externalRating?: number;
    averageRating?: number;
    supplier?: Supplier | number;
}

// ProductReview: ID, product (Association), rating (1-5), comment (500), reviewer (100)
export interface ProductReview {
    ID: number;
    product_ID: number;
    rating: number;
    comment?: string;
    reviewer?: string;
}

// Type for product with supplier details (eager loading)
export interface ProductWithSupplier extends Product {
    supplier: Supplier;
}

// Type for supplier with products
export interface SupplierWithProducts extends Supplier {
    products?: Product[];
}

// ============================================
// Input/Output Types for CRUD Operations
// ============================================

// Create input types (ID is auto-generated)
export interface CreateSupplierInput {
    name: string;
    email: string;
    rating: number;
}

export interface CreateProductInput {
    name: string;
    price: number;
    category?: string;
    externalRating?: number;
    supplier_ID?: number;
}

export interface CreateProductReviewInput {
    product_ID: number;
    rating: number;
    comment?: string;
    reviewer?: string;
}

// Update input types (all fields optional)
export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface UpdateProductReviewInput extends Partial<CreateProductReviewInput> {}

// ============================================
// Association Types
// ============================================

// Reference types for associations (used in requests)
export interface SupplierRef {
    ID: number;
}

export interface ProductRef {
    ID: number;
}

// ============================================
// Array/List Types
// ============================================

export type SupplierList = Supplier[];
export type ProductList = Product[];
export type ProductReviewList = ProductReview[];
