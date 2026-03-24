import { z } from "zod";

// --- Primitives ---
const id = z.uuid();
const rating = z.number().int().min(1).max(5);

// --- 1. Entity Schemas (Source of Truth) ---

export const SupplierSchema = z.object({
    ID: id,
    name: z
        .string()
        .min(1, "Supplier name is required")
        .max(100, "Supplier name must be at most 100 characters"),
    email: z.string().email("Invalid email format"),
    rating: rating.optional(),
});

export const ProductSchema = z.object({
    ID: id,
    name: z.string().min(1, "Product name is required"),
    price: z.number().positive("Price must be greater than 0"),
    category: z
        .string()
        .max(50, "Category must be at most 50 characters")
        .optional(),
    externalRating: z
        .number()
        .min(0)
        .max(5, "External rating must be between 0 and 5")
        .optional(),
    averageRating: z
        .number()
        .min(0)
        .max(5, "Average rating must be between 0 and 5")
        .optional(),
    supplier_ID: id, // Flat ID for input/validation
    supplier: z.union([z.lazy(() => SupplierSchema), id]).optional(),
});

export const ProductReviewSchema = z.object({
    ID: id,
    product_ID: id,
    rating: rating,
    comment: z
        .string()
        .max(500, "Comment must be at most 500 characters")
        .optional(),
    reviewer: z
        .string()
        .max(100, "Reviewer name must be at most 100 characters")
        .optional(),
});

// --- 2. Derived Validation Schemas ---

// Create Schemas: Omit system-generated IDs
export const CreateSupplierSchema = SupplierSchema.omit({ ID: true });
export const CreateProductSchema = ProductSchema.omit({
    ID: true,
    externalRating: true,
    averageRating: true,
    supplier: true,
});
export const CreateProductReviewSchema = ProductReviewSchema.omit({ ID: true });

// Update Schemas: Partial + Omit immutable fields
export const UpdateSupplierSchema = CreateSupplierSchema.partial();
export const UpdateProductSchema = CreateProductSchema.omit({
    category: true,
}).partial();
export const UpdateProductReviewSchema = CreateProductReviewSchema.omit({
    product_ID: true,
}).partial();

// --- 3. Action Schemas (API-specific) ---
export const SubmitReviewSchema = CreateProductReviewSchema.omit({
    product_ID: true,
}).extend({
    productID: id,
});
export type SubmitReviewInput = z.infer<typeof SubmitReviewSchema>;

// --- 3. TypeScript Types ---

export type Supplier = z.infer<typeof SupplierSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductReview = z.infer<typeof ProductReviewSchema>;

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>;

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export type CreateProductReviewInput = z.infer<
    typeof CreateProductReviewSchema
>;
export type UpdateProductReviewInput = z.infer<
    typeof UpdateProductReviewSchema
>;
