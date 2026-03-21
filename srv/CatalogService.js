/**
 * CatalogService - Main implementation file
 * This file must be named exactly as the CDS service (CatalogService.cds -> CatalogService.js)
 * for CAP to automatically load and execute handlers
 */

const cds = require("@sap/cds");

// Import custom handlers
const CatalogServiceHandlers = require("../lib/catalog-service");

module.exports = cds.service.impl(async function (service) {
    console.log("[CatalogService] Initializing CatalogService handlers...");

    const handlers = new CatalogServiceHandlers();

    // =========================================================================
    // Product Handlers
    // =========================================================================

    // beforeCreate handler for Products - External API integration + validations
    service.before("CREATE", "Products", async (req) => {
        console.log(
            "[CatalogService] BEFORE CREATE Products - Handler invoked!",
        );

        const data = req.data;
        const products = Array.isArray(data) ? data : [data];

        for (const product of products) {
            // === PRICE VALIDATION ===
            if (product.price !== undefined) {
                if (product.price <= 0) {
                    console.log(
                        `[CatalogService] REJECTING: price ${product.price} <= 0`,
                    );
                    throw new Error("Price must be greater than 0");
                }
                console.log(
                    `[CatalogService] Price validation passed: ${product.price}`,
                );
            }

            // === SUPPLIER RATING VALIDATION ===
            if (product.supplier) {
                const supplier = product.supplier;
                if (supplier.rating !== undefined) {
                    if (supplier.rating < 1 || supplier.rating > 5) {
                        console.log(
                            `[CatalogService] REJECTING: supplier rating ${supplier.rating} outside 1-5`,
                        );
                        throw new Error(
                            "Supplier rating must be between 1 and 5",
                        );
                    }
                    console.log(
                        `[CatalogService] Supplier rating validation passed: ${supplier.rating}`,
                    );
                }
            }

            // === EXTERNAL API INTEGRATION ===
            if (product.category) {
                console.log(
                    `[CatalogService] Fetching external rating for category: ${product.category}`,
                );

                try {
                    const fakeStoreProducts = await fetchFakeStoreProducts();

                    // Find a product in the same category
                    const matchingProduct = fakeStoreProducts.find(
                        (p) =>
                            p.category.toLowerCase() ===
                            product.category.toLowerCase(),
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
                } catch (error) {
                    console.error(
                        "[CatalogService] Error fetching external rating:",
                        error.message,
                    );
                    console.log(
                        "[CatalogService] Proceeding with product creation without external rating",
                    );
                }
            } else {
                console.log(
                    "[CatalogService] No category provided, skipping external rating fetch",
                );
            }
        }

        // Call the original handler logic
        await handlers.beforeCreateProducts(data);
    });

    // beforeUpdate handler for Products - Validation
    service.before("UPDATE", "Products", async (req) => {
        console.log(
            "[CatalogService] BEFORE UPDATE Products - Handler invoked!",
        );

        const data = req.data;

        // === PRICE VALIDATION ===
        if (data.price !== undefined) {
            if (data.price <= 0) {
                console.log(
                    `[CatalogService] REJECTING: price ${data.price} <= 0`,
                );
                throw new Error("Price must be greater than 0");
            }
            console.log(
                `[CatalogService] Price validation passed: ${data.price}`,
            );
        }

        // === SUPPLIER RATING VALIDATION ===
        if (data.supplier) {
            const supplier = data.supplier;
            if (supplier.rating !== undefined) {
                if (supplier.rating < 1 || supplier.rating > 5) {
                    console.log(
                        `[CatalogService] REJECTING: supplier rating ${supplier.rating} outside 1-5`,
                    );
                    throw new Error("Supplier rating must be between 1 and 5");
                }
                console.log(
                    `[CatalogService] Supplier rating validation passed: ${supplier.rating}`,
                );
            }
        }
    });

    // =========================================================================
    // ProductReview Handlers
    // =========================================================================

    // beforeCreate handler for ProductReviews - Rating validation
    service.before("CREATE", "ProductReviews", async (req) => {
        console.log(
            "[CatalogService] BEFORE CREATE ProductReviews - Handler invoked!",
        );

        const data = req.data;
        const reviews = Array.isArray(data) ? data : [data];

        for (const review of reviews) {
            if (review.rating !== undefined) {
                if (review.rating < 1 || review.rating > 5) {
                    console.log(
                        `[CatalogService] REJECTING: rating ${review.rating} outside 1-5`,
                    );
                    throw new Error("Rating must be between 1 and 5");
                }
                console.log(
                    `[CatalogService] Rating validation passed: ${review.rating}`,
                );
            }
        }
    });

    // beforeUpdate handler for ProductReviews - Rating validation
    service.before("UPDATE", "ProductReviews", async (req) => {
        console.log(
            "[CatalogService] BEFORE UPDATE ProductReviews - Handler invoked!",
        );

        const data = req.data;

        if (data.rating !== undefined) {
            if (data.rating < 1 || data.rating > 5) {
                console.log(
                    `[CatalogService] REJECTING: rating ${data.rating} outside 1-5`,
                );
                throw new Error("Rating must be between 1 and 5");
            }
            console.log(
                `[CatalogService] Rating validation passed: ${data.rating}`,
            );
        }
    });

    // =========================================================================
    // Supplier Handlers
    // =========================================================================

    // beforeCreate handler for Suppliers - Rating validation
    service.before("CREATE", "Suppliers", async (req) => {
        console.log(
            "[CatalogService] BEFORE CREATE Suppliers - Handler invoked!",
        );

        const data = req.data;
        const suppliers = Array.isArray(data) ? data : [data];

        for (const supplier of suppliers) {
            if (supplier.rating !== undefined) {
                if (supplier.rating < 1 || supplier.rating > 5) {
                    console.log(
                        `[CatalogService] REJECTING: supplier rating ${supplier.rating} outside 1-5`,
                    );
                    throw new Error("Supplier rating must be between 1 and 5");
                }
                console.log(
                    `[CatalogService] Supplier rating validation passed: ${supplier.rating}`,
                );
            }
        }
    });

    // beforeUpdate handler for Suppliers - Rating validation
    service.before("UPDATE", "Suppliers", async (req) => {
        console.log(
            "[CatalogService] BEFORE UPDATE Suppliers - Handler invoked!",
        );

        const data = req.data;

        if (data.rating !== undefined) {
            if (data.rating < 1 || data.rating > 5) {
                console.log(
                    `[CatalogService] REJECTING: supplier rating ${data.rating} outside 1-5`,
                );
                throw new Error("Supplier rating must be between 1 and 5");
            }
            console.log(
                `[CatalogService] Supplier rating validation passed: ${data.rating}`,
            );
        }
    });

    // =========================================================================
    // Action Handlers
    // =========================================================================

    // submitReview action handler
    service.on("submitReview", async (req) => {
        console.log("[CatalogService] submitReview ACTION - Handler invoked!");
        console.log(`[CatalogService] Request data:`, req.data);

        const { productID, rating, comment, reviewer } = req.data;

        // Validate rating range
        if (rating < 1 || rating > 5) {
            throw new Error("Rating must be between 1 and 5");
        }

        const { ProductReviews, Products } = service.entities;

        try {
            // Create the review using the correct foreign key syntax
            const review = await service.create(ProductReviews, {
                product_ID: productID,
                rating: rating,
                comment: comment,
                reviewer: reviewer,
            });

            console.log(
                `[CatalogService] Created review with ID: ${review.ID}`,
            );

            // Calculate average rating by reading all reviews for this product
            const reviews = await service
                .read(ProductReviews)
                .where({ product_ID: productID })
                .columns((r) => r.rating);

            const averageRating =
                reviews.length > 0
                    ? reviews.reduce((acc, r) => acc + r.rating, 0) /
                      reviews.length
                    : 0;

            console.log(
                `[CatalogService] Calculated averageRating: ${averageRating} from ${reviews.length} reviews`,
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
        } catch (error) {
            console.error(
                "[CatalogService] Error in submitReview:",
                error.message,
            );
            throw error;
        }
    });

    console.log("[CatalogService] All handlers registered successfully!");
});

/**
 * Fetch products from FakeStoreAPI
 * @returns {Promise<Array>} Array of products
 */
function fetchFakeStoreProducts() {
    const https = require("https");

    return new Promise((resolve, reject) => {
        const url = "https://fakestoreapi.com/products";

        https
            .get(url, (res) => {
                let data = "";

                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on("end", () => {
                    try {
                        const products = JSON.parse(data);
                        resolve(products);
                    } catch (e) {
                        reject(
                            new Error("Failed to parse FakeStoreAPI response"),
                        );
                    }
                });
            })
            .on("error", (err) => {
                reject(err);
            });
    });
}
