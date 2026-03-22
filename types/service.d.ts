/**
 * Service-related Types
 * Type definitions for CatalogService handlers and operations
 */

import type { Request, Response, NextFunction } from "express";
import type {
    Supplier,
    Product,
    ProductReview,
    CreateSupplierInput,
    CreateProductInput,
    CreateProductReviewInput,
    UpdateSupplierInput,
    UpdateProductInput,
    UpdateProductReviewInput,
} from "./entities";

// ============================================
// CDS Entity Container Interface
// ============================================

/**
 * CatalogService Entities Interface
 * Exposes all CDS entities through the OData service
 */
export interface CatalogServiceEntities {
    Suppliers: Supplier;
    Products: Product;
    ProductReviews: ProductReview;
}

// ============================================
// CDS Service Type
// ============================================

/**
 * CDS Service definition for CatalogService
 * Represents the full CAP service with all entities and actions
 */
export interface CatalogService {
    entities: CatalogServiceEntities;
}

// ============================================
// Request/Response Types
// ============================================

/**
 * Express request with CDS params
 */
export interface CDSRequest extends Request {
    params?: {
        ID?: string;
        product_ID?: string;
        supplier_ID?: string;
    };
    query?: {
        $filter?: string;
        $top?: string;
        $skip?: string;
        $orderby?: string;
        $expand?: string;
    };
    body?: any;
}

/**
 * Express response with CDS helpers
 */
export interface CDSResponse extends Response {
    // CDS-style result helpers
    success?: (data: any) => this;
    error?: (message: string, code?: number) => this;
    result?: (data: any) => this;
}

// CDS Request context type
export interface CDSRequestContext {
    req: CDSRequest;
    res: CDSResponse;
    next: NextFunction;
}

// Service handler function type
export type ServiceHandler = (
    req: CDSRequest,
    res: CDSResponse,
    next: NextFunction,
) => Promise<void | CDSResponse>;

// ============================================
// Action Parameter Types
// ============================================

/**
 * Parameters for SubmitReview action
 */
export interface SubmitReviewParams {
    product_ID: number;
    rating: number;
    comment?: string;
    reviewer?: string;
}

/**
 * Result type for SubmitReview action
 */
export interface SubmitReviewResult {
    ID: number;
    product_ID: number;
    rating: number;
    comment?: string;
    reviewer?: string;
    createdAt?: Date;
}

/**
 * Parameters for CalculateAverageRating action
 */
export interface CalculateAverageRatingParams {
    product_ID: number;
}

/**
 * Result type for CalculateAverageRating action
 */
export interface CalculateAverageRatingResult {
    product_ID: number;
    averageRating: number;
    reviewCount: number;
}

/**
 * Parameters for SyncExternalProducts action
 */
export interface SyncExternalProductsParams {
    limit?: number;
    category?: string;
}

/**
 * Result type for SyncExternalProducts action
 */
export interface SyncExternalProductsResult {
    created: number;
    updated: number;
    failed: number;
    total: number;
    errors?: string[];
}

// ============================================
// Catalog Service Interface
// ============================================

/**
 * CatalogService interface defining all available operations
 */
export interface ICatalogService {
    // Product handlers
    getProducts(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;
    getProductById(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;
    createProduct(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;
    updateProduct(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;
    deleteProduct(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;

    // Supplier handlers
    getSuppliers(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;
    getSupplierById(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;
    createSupplier(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;
    updateSupplier(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;
    deleteSupplier(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;

    // ProductReview handlers
    getProductReviews(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;
    getProductReviewById(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;
    createProductReview(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;
    deleteProductReview(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;

    // External API handlers
    fetchExternalProducts(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;
    syncExternalProducts(
        req: CDSRequest,
        res: CDSResponse,
        next: NextFunction,
    ): Promise<void>;
}

// ============================================
// Generic Service Types
// ============================================

/**
 * Service result wrapper type
 */
export interface ServiceResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
    page: number;
    limit: number;
    offset?: number;
}

/**
 * Paginated result type
 */
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * CRUD operation types
 */
export type CreateOperation<T> = (data: Omit<T, "ID">) => Promise<T>;
export type ReadOperation<T> = (id: number) => Promise<T | null>;
export type UpdateOperation<T> = (
    id: number,
    data: Partial<T>,
) => Promise<T | null>;
export type DeleteOperation = (id: number) => Promise<boolean>;
export type ListOperation<T> = (
    options?: PaginationOptions,
) => Promise<PaginatedResult<T>>;
