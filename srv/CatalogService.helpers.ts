// @ts-ignore - SAP CAP types
import cds from "@sap/cds";

import { NotFoundError, ApiError } from "../lib/errors";
// @ts-ignore - SAP CAP types
import type { Service } from "@sap/cds";
import type { FakeStoreProduct } from "../types/external";

// =========================================================================
// Async ID Validation Helper Functions (for database existence checks)
// =========================================================================
export async function validateProductId(
    service: Service,
    productId: number | undefined,
): Promise<void> {
    if (productId !== undefined) {
        const Products = service.entities.Products;
        const exists = await service.exists(Products, productId);
        if (!exists)
            throw new NotFoundError(
                `Product with ID ${productId} does not exist`,
            );
    }
}

export async function validateSupplierId(
    service: Service,
    supplierId: number | undefined,
): Promise<void> {
    if (supplierId !== undefined) {
        const Suppliers = service.entities.Suppliers;
        const exists = await service.exists(Suppliers, supplierId);
        if (!exists)
            throw new NotFoundError(
                `Supplier with ID ${supplierId} does not exist`,
            );
    }
}

export async function validateReviewExists(
    service: Service,
    reviewId: number | undefined,
): Promise<void> {
    if (reviewId !== undefined) {
        const ProductReviews = service.entities.ProductReviews;
        const exists = await service.exists(ProductReviews, reviewId);
        if (!exists)
            throw new NotFoundError(
                `Review with ID ${reviewId} does not exist`,
            );
    }
}

// =========================================================================
// Average Rating Helpers
// =========================================================================
export async function updateProductAverageRating(
    service: Service,
    productID: number,
): Promise<void> {
    const Products = service.entities.Products;
    const ProductReviews = service.entities.ProductReviews;
    // Calculate average using aggregation instead of reading all rows
    const result = await service.run(
        cds.ql.SELECT.from(ProductReviews)
            .columns([{ "avg(rating)": "avgRating" }])
            .where({ product_ID: productID }),
    );
    const averageRating = result[0]?.avgRating
        ? Math.round(result[0].avgRating * 100) / 100
        : null;

    await service
        .update(Products)
        .where({ ID: productID })
        .set({ averageRating });
}

// =========================================================================
// External API Integration
// =========================================================================
export async function fetchFakeStoreProducts(): Promise<FakeStoreProduct[]> {
    const apiKey =
        process.env.FAKE_STORE_API_KEY || "519e90fba2f1a95fa6905865cd960a96";
    if (!apiKey)
        throw new ApiError(
            "FAKE_STORE_API_KEY not set in environment variables",
        );

    const url = `https://api.scraperapi.com?api_key=${apiKey}&url=https://fakestoreapi.com/products`;

    const response = await fetch(url);
    if (!response.ok)
        throw new ApiError(
            `Failed to fetch FakeStoreAPI, status: ${response.status}`,
        );

    return (await response.json()) as FakeStoreProduct[];
}

// =========================================================================
// Types for Actions
// =========================================================================
export interface SubmitReviewResult {
    success: boolean;
    averageRating: number;
}
