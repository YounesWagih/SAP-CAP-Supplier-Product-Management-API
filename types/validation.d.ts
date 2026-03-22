/**
 * Validation Function Types
 * Type definitions for validation utilities
 */

import type {
    Supplier,
    Product,
    ProductReview,
    CreateSupplierInput,
    CreateProductInput,
    CreateProductReviewInput,
} from "./entities";

// ============================================
// Core Validation Types
// ============================================

/**
 * Validation error type
 */
export interface ValidationError {
    field: string;
    message: string;
    code?: string;
    value?: any;
}

/**
 * Validation result type
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings?: ValidationError[];
}

/**
 * Generic validator function type
 */
export type Validator<T> = (value: T) => ValidationResult;

/**
 * Async validator function type
 */
export type AsyncValidator<T> = (value: T) => Promise<ValidationResult>;

// ============================================
// Entity Validation Input Types
// ============================================

/**
 * Supplier validation input
 */
export interface SupplierValidationInput {
    name?: unknown;
    email?: unknown;
    rating?: unknown;
}

/**
 * Product validation input
 */
export interface ProductValidationInput {
    name?: unknown;
    price?: unknown;
    category?: unknown;
    externalRating?: unknown;
    supplier_ID?: unknown;
}

/**
 * ProductReview validation input
 */
export interface ProductReviewValidationInput {
    product_ID?: unknown;
    rating?: unknown;
    comment?: unknown;
    reviewer?: unknown;
}

// ============================================
// Validation Rules Configuration
// ============================================

/**
 * Validation rules configuration
 */
export interface ValidationRules {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
    custom?: (value: any) => boolean | string;
    type?: "string" | "number" | "integer" | "decimal" | "email" | "url";
}

/**
 * Field validator configuration
 */
export interface FieldValidator {
    field: string;
    rules: ValidationRules;
    message?: string;
}

/**
 * Custom validation function type
 */
export type CustomValidationFn = (
    value: any,
    context?: Record<string, any>,
) => boolean | string;

/**
 * Validation schema type
 */
export interface ValidationSchema {
    [fieldName: string]: ValidationRules;
}

// ============================================
// Specialized Validation Options
// ============================================

/**
 * Range validation options
 */
export interface RangeOptions {
    min: number;
    max: number;
    inclusive?: boolean;
    message?: string;
}

/**
 * String validation options
 */
export interface StringOptions {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
    trim?: boolean;
    allowEmpty?: boolean;
}

/**
 * Email validation options
 */
export interface EmailOptions {
    allowEmpty?: boolean;
    requireDomain?: boolean;
    domainPattern?: RegExp;
}

/**
 * Number validation options
 */
export interface NumberOptions {
    min?: number;
    max?: number;
    integer?: boolean;
    precision?: number;
    allowZero?: boolean;
    allowNegative?: boolean;
}

// ============================================
// Validation Result Helpers
// ============================================

/**
 * Creates a successful validation result
 */
export function createValidResult(): ValidationResult {
    return { valid: true, errors: [] };
}

/**
 * Creates a failed validation result
 */
export function createInvalidResult(
    errors: ValidationError[],
): ValidationResult {
    return { valid: false, errors };
}

/**
 * Creates a validation error
 */
export function createValidationError(
    field: string,
    message: string,
    code?: string,
    value?: any,
): ValidationError {
    return { field, message, code, value };
}

// ============================================
// Validation Context
// ============================================

/**
 * Validation context for passing additional data
 */
export interface ValidationContext {
    entity?: string;
    operation?: "create" | "update" | "delete";
    existingData?: Record<string, any>;
    requestId?: string;
}

// ============================================
// Batch Validation
// ============================================

/**
 * Batch validation result
 */
export interface BatchValidationResult {
    valid: boolean;
    results: {
        [key: string]: ValidationResult;
    };
}

/**
 * Validator map for batch operations
 */
export interface ValidatorMap {
    [fieldName: string]: Validator<any>;
}
