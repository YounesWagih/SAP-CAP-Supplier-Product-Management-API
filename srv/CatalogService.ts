/**
 * CatalogService - Main implementation file
 * This file must be named exactly as the CDS service (CatalogService.cds -> CatalogService.ts)
 * for CAP to automatically load and execute handlers
 */

// @ts-ignore - SAP CAP types
import cds from "@sap/cds";
import type { ProductReview } from "../types/entities";
import type { FakeStoreProduct } from "../types/external";

// Use require for CommonJS compatibility
const CDS = require("@sap/cds");

// =========================================================================
// Validation Helper Functions
// =========================================================================

/**
 * Validate that price is greater than 0
 * @param price - The price to validate
 * @throws Error if price is not greater than 0
 */
function validatePrice(price: number | undefined): void {
    if (price === undefined || price === null) {
        throw new Error("Price is required");
    }
    if (price <= 0) {
        console.log(`[CatalogService] REJECTING: price ${price} <= 0`);
        throw new Error("Price must be greater than 0");
    }
    console.log(`[CatalogService] Price validation passed: ${price}`);
}

/**
 * Validate that rating is between 1 and 5
 * @param rating - The rating to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @throws Error if rating is not between 1 and 5
 */
function validateRating(
    rating: number | undefined,
    fieldName: string = "Rating",
): void {
    if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
            console.log(
                `[CatalogService] REJECTING: ${fieldName.toLowerCase()} ${rating} outside 1-5`,
            );
            throw new Error(`${fieldName} must be between 1 and 5`);
        }
        console.log(
            `[CatalogService] ${fieldName} validation passed: ${rating}`,
        );
    }
}

/**
 * Validate that supplier_id exists in the database
 * @param service - The CDS service instance
 * @param supplierId - The supplier ID to validate
 * @throws Error if supplier does not exist
 */
async function validateSupplierId(
    service: any,
    supplierId: number | undefined,
): Promise<void> {
    if (supplierId !== undefined) {
        const Suppliers = service.entities.Suppliers;
        const supplierExists = await service.exists(Suppliers, supplierId);
        if (!supplierExists) {
            console.log(
                `[CatalogService] REJECTING: supplier with ID ${supplierId} does not exist`,
            );
            throw new Error(`Supplier with ID ${supplierId} does not exist`);
        }
        console.log(
            `[CatalogService] Supplier validation passed: supplier ${supplierId} exists`,
        );
    }
}

/**
 * Validate that review_id exists in the database
 * @param service - The CDS service instance
 * @param reviewId - The review ID to validate
 * @throws Error if review does not exist
 */
async function validateReviewExists(
    service: any,
    reviewId: number | undefined,
): Promise<void> {
    if (reviewId !== undefined) {
        const ProductReviews = service.entities.ProductReviews;
        const reviewExists = await service.exists(ProductReviews, reviewId);
        if (!reviewExists) {
            console.log(
                `[CatalogService] REJECTING: review with ID ${reviewId} does not exist`,
            );
            throw new Error(`Review with ID ${reviewId} does not exist`);
        }
        console.log(
            `[CatalogService] Review validation passed: review ${reviewId} exists`,
        );
    }
}

/**
 * Calculate and update the average rating for a product
 * @param service - The CDS service instance
 * @param productID - The product ID to update
 */
async function updateProductAverageRating(
    service: any,
    productID: number,
): Promise<void> {
    const Products = service.entities.Products;
    const ProductReviews = service.entities.ProductReviews;

    // Read all reviews for the product
    const reviews: ProductReview[] = await service
        .read(ProductReviews)
        .where({ product_ID: productID });

    // Calculate average rating
    let averageRating: number | null = null;
    if (reviews.length > 0) {
        const totalSum = reviews.reduce(
            (acc: number, r: ProductReview) => acc + r.rating,
            0,
        );
        // Round to 2 decimal places to match Decimal(3,2) precision in schema
        averageRating = Math.round((totalSum / reviews.length) * 100) / 100;
    }

    console.log(
        `[CatalogService] Calculated averageRating: ${averageRating} from ${reviews.length} reviews for product ${productID}`,
    );

    // Update product's averageRating
    await service
        .update(Products)
        .where({ ID: productID })
        .set({ averageRating: averageRating });

    console.log(
        `[CatalogService] Updated averageRating to ${averageRating} for product ${productID}`,
    );
}

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
        throw new Error(`Failed to fetch from FakeStoreAPI: ${errorMessage}`);
    }
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

interface ReviewData {
    ID?: number;
    product_ID: number;
    rating: number;
    comment?: string;
    reviewer?: string;
    product?: {
        ID?: number;
    };
}

interface SupplierData {
    ID?: number;
    name: string;
    email: string;
    rating: number;
}

interface SubmitReviewResult {
    success: boolean;
    averageRating: number;
}

interface RequestData {
    productID: number;
    rating: number;
    comment?: string;
    reviewer?: string;
}

module.exports = CDS.service.impl(async function (service: any) {
    console.log("[CatalogService] Initializing CatalogService handlers...");

    // =========================================================================
    // Product Handlers
    // =========================================================================

    // beforeCreate handler for Products - External API integration + validations
    service.before("CREATE", "Products", async (req: any) => {
        console.log(
            "[CatalogService] BEFORE CREATE Products - Handler invoked!",
        );

        const product = req.data as ProductData;

        // === EXTERNAL API INTEGRATION ===
        let fakeStoreProducts: FakeStoreProduct[] | null = null;
        try {
            fakeStoreProducts = await fetchFakeStoreProducts();
            console.log(
                `[CatalogService] Fetched ${fakeStoreProducts.length} products from FakeStoreAPI`,
            );
        } catch (error: any) {
            console.error(
                "[CatalogService] Error fetching external rating:",
                error?.message,
            );
            console.log(
                "[CatalogService] Proceeding with product creation without external rating",
            );
        }

        // === PRICE VALIDATION ===
        validatePrice(product.price);

        // === SUPPLIER ID VALIDATION ===
        // Extract supplier ID from association (could be supplier_ID or supplier.ID)
        const supplierId =
            product.supplier_ID || (product.supplier && product.supplier.ID);
        if (supplierId) {
            await validateSupplierId(service, supplierId);
        } else {
            throw new Error(`Supplier ID not found`);
        }

        // === EXTERNAL API INTEGRATION ===
        if (product.category && fakeStoreProducts) {
            console.log(
                `[CatalogService] Fetching external rating for category: ${product.category}`,
            );

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
        } else if (!product.category) {
            console.log(
                "[CatalogService] No category provided, skipping external rating fetch",
            );
        }
    });

    // beforeUpdate handler for Products - Validation
    service.before("UPDATE", "Products", async (req: any) => {
        console.log(
            "[CatalogService] BEFORE UPDATE Products - Handler invoked!",
        );

        const data = req.data as Partial<ProductData>;

        // === PRICE VALIDATION ===
        // Only validate price if it's being updated (not for partial updates like averageRating)
        if (data.price !== undefined) {
            validatePrice(data.price);
        }

        // === SUPPLIER ID VALIDATION ===
        // Extract supplier ID from association (could be supplier_ID or supplier.ID)
        const supplierId =
            data.supplier_ID || (data.supplier && data.supplier.ID);
        if (supplierId) {
            await validateSupplierId(service, supplierId);
        }
    });

    // =========================================================================
    // ProductReview Handlers
    // =========================================================================

    // beforeCreate handler for ProductReviews - Rating validation
    service.before("CREATE", "ProductReviews", async (req: any) => {
        console.log(
            "[CatalogService] BEFORE CREATE ProductReviews - Handler invoked!",
        );

        const review = req.data as ReviewData;
        validateRating(review.rating, "Rating");
    });

    // beforeUpdate handler for ProductReviews - Rating validation
    service.before("UPDATE", "ProductReviews", async (req: any) => {
        console.log(
            "[CatalogService] BEFORE UPDATE ProductReviews - Handler invoked!",
        );

        // Check if review exists
        const reviewID = req.params[0] as number;
        await validateReviewExists(service, reviewID);

        const review = req.data as Partial<ReviewData>;
        validateRating(review.rating, "Rating");
    });

    // afterUpdate handler for ProductReviews - Recalculate average rating
    service.after("UPDATE", "ProductReviews", async (_data: any, req: any) => {
        console.log(
            "[CatalogService] AFTER UPDATE ProductReviews - Handler invoked!",
        );

        // Get the product ID from the updated review
        const productID = req.params[0] as number;
        if (productID) {
            await updateProductAverageRating(service, productID);
        } else {
            console.log(
                "[CatalogService] Could not determine product ID from updated review",
            );
        }
    });

    // afterDelete handler for ProductReviews - Recalculate average rating
    service.after("DELETE", "ProductReviews", async (data: any, _req: any) => {
        console.log(
            "[CatalogService] AFTER DELETE ProductReviews - Handler invoked!",
        );

        // Get the product ID from the deleted review
        const reviewData = data as ReviewData;
        const productID =
            reviewData.product_ID ||
            (reviewData.product && reviewData.product.ID);
        if (productID) {
            await updateProductAverageRating(service, productID);
        } else {
            console.log(
                "[CatalogService] Could not determine product ID from deleted review",
            );
        }
    });

    // beforeDelete handler for ProductReviews - Validate review exists
    service.before("DELETE", "ProductReviews", async (req: any) => {
        console.log(
            "[CatalogService] BEFORE DELETE ProductReviews - Handler invoked!",
        );

        // Check if review exists
        const reviewID = req.params[0] as number;
        await validateReviewExists(service, reviewID);
    });

    // =========================================================================
    // Supplier Handlers
    // =========================================================================

    // beforeCreate handler for Suppliers - Rating validation
    // service.before("CREATE", "Suppliers", async (req) => {
    //     console.log(
    //         "[CatalogService] BEFORE CREATE Suppliers - Handler invoked!",
    //     );
    //     const supplier = req.data;
    //     validateRating(supplier.rating, "Supplier rating");
    // });

    // beforeUpdate handler for Suppliers - Rating validation
    service.before("UPDATE", "Suppliers", async (req: any) => {
        console.log(
            "[CatalogService] BEFORE UPDATE Suppliers - Handler invoked!",
        );

        const supplier = req.data as Partial<SupplierData>;
        validateRating(supplier.rating, "Supplier rating");
    });

    // =========================================================================
    // Action Handlers
    // =========================================================================

    // submitReview action handler
    service.on(
        "submitReview",
        async (req: any): Promise<SubmitReviewResult> => {
            console.log(
                "[CatalogService] submitReview ACTION - Handler invoked!",
            );
            console.log(`[CatalogService] Request data:`, req.data);

            const { productID, rating, comment, reviewer } =
                req.data as RequestData;

            // Validate rating range using helper function
            validateRating(rating, "Rating");

            const ProductReviews = service.entities.ProductReviews;
            const Products = service.entities.Products;

            try {
                // === PRODUCT VALIDATION ===
                // Verify that the productID exists before creating a review
                const productExists = await service.exists(Products, productID);
                if (!productExists) {
                    console.log(
                        `[CatalogService] REJECTING: product with ID ${productID} does not exist`,
                    );
                    throw new Error("Product not found");
                }
                console.log(
                    `[CatalogService] Product validation passed: product ${productID} exists`,
                );

                // Read existing reviews BEFORE creating the new one to get current count
                const existingReviews: ProductReview[] = await service
                    .read(ProductReviews)
                    .where({ product_ID: productID });

                // Calculate current sum from existing reviews
                const currentSum = existingReviews.reduce(
                    (acc: number, r: ProductReview) => acc + r.rating,
                    0,
                );
                const existingCount = existingReviews.length;

                // Create the review using the correct foreign key syntax
                const review: ProductReview = await service.create(
                    ProductReviews,
                    {
                        product_ID: productID,
                        rating: rating,
                        comment: comment,
                        reviewer: reviewer,
                    },
                );

                console.log(
                    `[CatalogService] Created review with ID: ${review.ID}`,
                );

                // Calculate average rating INCLUDING the new review
                // We already have the new review's rating, so add it to the existing sum
                const newTotalSum = currentSum + rating;
                const newTotalCount = existingCount + 1;
                // Round to 2 decimal places to match Decimal(3,2) precision in schema
                const averageRating =
                    Math.round((newTotalSum / newTotalCount) * 100) / 100;

                console.log(
                    `[CatalogService] Calculated averageRating: ${averageRating} from ${newTotalCount} reviews (including new review)`,
                );

                // Update product's averageRating
                await service
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
        },
    );

    console.log("[CatalogService] All handlers registered successfully!");
});
