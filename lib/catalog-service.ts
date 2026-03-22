/**
 * Custom handlers for CatalogService
 * Implements:
 * - beforeCreate for Products (fetch external rating from FakeStoreAPI)
 * - submitReview action (create review and update average rating)
 */

// @ts-ignore - SAP CAP types
import cds from "@sap/cds";
const CDS = require("@sap/cds");

import type { ProductReview } from "../types/entities";
import type { FakeStoreProduct } from "../types/external";

/**
 * Fetch products from FakeStoreAPI
 * @returns Promise<FakeStoreProduct[]> Array of products
 */
async function fetchFakeStoreProducts(): Promise<FakeStoreProduct[]> {
    const url =
        "https://api.scraperapi.com?api_key=519e90fba2f1a95fa6905865cd960a96&url=https://fakestoreapi.com/products";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = (await response.json()) as FakeStoreProduct[];
        return products;
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Failed to fetch FakeStoreAPI: ${errorMessage}`);
    }
}

/**
 * Calculate average rating from reviews
 * @param db - Database connection
 * @param productId - Product ID
 * @returns Promise<number> Average rating
 */
async function calculateAverageRating(
    db: any,
    productId: number,
): Promise<number> {
    const ProductReviews = db.entities.ProductReviews;

    // Use proper association navigation syntax
    const reviews: ProductReview[] = await db
        .read(ProductReviews)
        .where({ product_ID: productId });

    if (reviews.length === 0) {
        return 0;
    }

    const sum = reviews.reduce(
        (acc: number, r: ProductReview) => acc + r.rating,
        0,
    );
    return sum / reviews.length;
}

interface ProductData {
    ID?: number;
    name: string;
    price: number;
    category?: string;
    externalRating?: number;
    averageRating?: number;
    supplier_ID?: number;
    supplier?: {
        ID?: number;
    };
}

interface ReviewRequestData {
    productID: number;
    rating: number;
    comment?: string;
    reviewer?: string;
}

interface SubmitReviewResponse {
    success: boolean;
    averageRating: number;
}

export default class CatalogService {
    /**
     * beforeCreate handler for Products
     * Fetches external rating from FakeStoreAPI based on category
     */
    async beforeCreateProducts(
        data: ProductData | ProductData[],
    ): Promise<void> {
        console.log("[CatalogService] beforeCreateProducts called");

        // Handle both single record and array of records
        const products = Array.isArray(data) ? data : [data];

        for (const product of products) {
            if (!product.category) {
                console.log(
                    "[CatalogService] No category provided, skipping external rating fetch",
                );
                continue;
            }

            try {
                console.log(
                    `[CatalogService] Fetching external rating for category: ${product.category}`,
                );

                const fakeStoreProducts = await fetchFakeStoreProducts();

                for (const p of fakeStoreProducts) {
                    if (
                        p.category.toLowerCase() ===
                        product.category.toLowerCase()
                    ) {
                        console.log(p.rating.rate, "---");
                    }
                }
                // Find a product in the same category

                const matchingProduct = fakeStoreProducts.find(
                    (p: FakeStoreProduct) =>
                        p.category.toLowerCase() ===
                        product.category?.toLowerCase(),
                );

                if (matchingProduct) {
                    product.externalRating = matchingProduct.rating.rate;
                    console.log(
                        `[CatalogService] Set externalRating to ${matchingProduct.rating.rate} from FakeStoreAPI`,
                    );
                } else {
                    console.log(
                        `[CatalogService] No matching product found for category: ${product.category}`,
                    );
                }
            } catch (error: any) {
                // Log error but don't block product creation
                console.error(
                    "[CatalogService] Error fetching external rating:",
                    error?.message,
                );
                console.log(
                    "[CatalogService] Proceeding with product creation without external rating",
                );
            }
        }
    }

    /**
     * submitReview action handler
     * Creates a ProductReview and updates the Product's averageRating
     */
    async submitReview(req: any): Promise<SubmitReviewResponse> {
        const { productID, rating, comment, reviewer } =
            req.data as ReviewRequestData;

        console.log(
            `[CatalogService] submitReview called for product ${productID}`,
        );

        // Validate rating range
        if (rating < 1 || rating > 5) {
            throw new Error("Rating must be between 1 and 5");
        }

        // Use run() instead of tx() for simpler transaction handling
        const db = (CDS as any).db;
        const ProductReviews = db.entities.ProductReviews;
        const Products = db.entities.Products;

        try {
            // Create the review using the correct foreign key syntax
            const review = await db.create(ProductReviews, {
                product_ID: productID,
                rating: rating,
                comment: comment,
                reviewer: reviewer,
            });

            console.log(
                `[CatalogService] Created review with ID: ${review.ID}`,
            );

            // Calculate average rating
            const averageRating = await calculateAverageRating(db, productID);

            // Update product's averageRating
            await db
                .update(Products)
                .where({ ID: productID })
                .set({ averageRating: averageRating });

            console.log(
                `[CatalogService] Updated averageRating to ${averageRating}`,
            );

            return {
                success: true,
                averageRating: averageRating,
            };
        } catch (error: any) {
            console.error(
                "[CatalogService] Error in submitReview:",
                error?.message,
            );
            throw error;
        }
    }
}
