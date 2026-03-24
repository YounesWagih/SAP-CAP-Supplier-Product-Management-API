import { z } from "zod";

// --- Primitives ---
const id = z.uuid();
const rating = z.number().int().min(1).max(5);

// --- 1. Entity Schemas (Source of Truth) ---

export const SupplierSchema = z.object({
    ID: id,
    name: z.string().min(1, "Supplier name is required"),
    email: z.string().email("Invalid email format"),
    rating: rating.optional(),
});

export const ProductSchema = z.object({
    ID: id,
    name: z.string().min(1, "Product name is required"),
    price: z.number().positive("Price must be greater than 0"),
    category: z.string().optional(),
    externalRating: z.number().optional(),
    averageRating: z.number().optional(),
    supplier_ID: id, // Flat ID for input/validation
    supplier: z.union([z.lazy(() => SupplierSchema), id]).optional(),
});

export const ProductReviewSchema = z.object({
    ID: id,
    product_ID: id,
    rating: rating,
    comment: z.string().optional(),
    reviewer: z.string().optional(),
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
