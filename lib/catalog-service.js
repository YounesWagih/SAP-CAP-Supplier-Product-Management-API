/**
 * Custom handlers for CatalogService
 * Implements:
 * - beforeCreate for Products (fetch external rating from FakeStoreAPI)
 * - submitReview action (create review and update average rating)
 */

const cds = require("@sap/cds");

// HTTP client for external API calls
const https = require("https");

/**
 * Fetch products from FakeStoreAPI
 * @returns {Promise<Array>} Array of products
 */
function fetchFakeStoreProducts() {
    return new Promise((resolve, reject) => {
        // const url ="https://fakestoreapi.com/products";
        const url =
            "https://api.scraperapi.com?api_key=519e90fba2f1a95fa6905865cd960a96&url=https://fakestoreapi.com/products";

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

/**
 * Calculate average rating from reviews
 * @param {Object} db - Database connection
 * @param {Number} productId - Product ID
 * @returns {Promise<Number>} Average rating
 */
async function calculateAverageRating(db, productId) {
    const { ProductReviews } = db.entities;

    // Use proper association navigation syntax
    const reviews = await db
        .read(ProductReviews)
        .where({ product_ID: productId })
        .columns((r) => r.rating);

    if (reviews.length === 0) {
        return 0;
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
}

module.exports = class CatalogService {
    /**
     * beforeCreate handler for Products
     * Fetches external rating from FakeStoreAPI based on category
     */
    async beforeCreateProducts(data) {
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
                // Log error but don't block product creation
                console.error(
                    "[CatalogService] Error fetching external rating:",
                    error.message,
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
    async submitReview(req) {
        const { productID, rating, comment, reviewer } = req.data;

        console.log(
            `[CatalogService] submitReview called for product ${productID}`,
        );

        // Validate rating range
        if (rating < 1 || rating > 5) {
            throw new Error("Rating must be between 1 and 5");
        }

        // Use run() instead of tx() for simpler transaction handling
        const db = cds.db;
        const { ProductReviews, Products } = db.entities;

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
        } catch (error) {
            console.error(
                "[CatalogService] Error in submitReview:",
                error.message,
            );
            throw error;
        }
    }
};
