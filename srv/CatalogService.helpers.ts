// @ts-ignore - SAP CAP types
import cds from "@sap/cds";

const LOG = cds.log(__filename);

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
    try {
        const apiKey =
            process.env.FAKE_STORE_API_KEY ||
            "519e90fba2f1a95fa6905865cd960a96z";
        if (!apiKey) {
            LOG.warn(
                "FAKE_STORE_API_KEY not set in environment variables, skipping external API fetch",
            );
            return [];
        }

        const url = `https://api.scraperapi.com?api_key=${apiKey}&url=https://fakestoreapi.com/products`;

        const response = await fetch(url);
        if (!response.ok) {
            LOG.warn(
                `Failed to fetch FakeStoreAPI, status: ${response.status}, skipping external rating`,
            );
            return [];
        }

        return (await response.json()) as FakeStoreProduct[];
    } catch (error) {
        LOG.warn(
            `Error fetching FakeStoreAPI: ${error instanceof Error ? error.message : String(error)}, skipping external rating`,
        );
        return [];
    }
}

// =========================================================================
// Types for Actions
// =========================================================================
export interface SubmitReviewResult {
    success: boolean;
    averageRating: number;
}
