// @ts-ignore - SAP CAP types
import cds, { Service, SELECT } from "@sap/cds";

import { ValidationError, NotFoundError, ApiError } from "../lib/errors";
import asyncHandler from "../lib/utils/asyncHandler";
import type {
    ProductReview,
    CreateProductInput,
    UpdateProductInput,
    CreateProductReviewInput,
    UpdateProductReviewInput,
    UpdateSupplierInput,
} from "../types/entities";
import type { FakeStoreProduct } from "../types/external";
import { error } from "console";

// =========================================================================
// Validation Helper Functions
// =========================================================================
function validatePrice(price: number | undefined): void {
    if (price === undefined || price === null) {
        throw new ValidationError("Price is required");
    }
    if (price <= 0) {
        throw new ValidationError("Price must be greater than 0");
    }
}

function validateRating(
    rating: number | undefined,
    fieldName: string = "Rating",
): void {
    if (rating !== undefined && (rating < 1 || rating > 5)) {
        throw new ValidationError(`${fieldName} must be between 1 and 5`);
    }
}

async function validateSupplierId(
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

async function validateReviewExists(
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
async function updateProductAverageRating(
    service: Service,
    productID: number,
): Promise<void> {
    console.log("1");
    const Products = service.entities.Products;
    const ProductReviews = service.entities.ProductReviews;
    console.log(Products, ProductReviews);

    // Calculate average using aggregation instead of reading all rows
    const result = await service.run(
        cds.SELECT.from(ProductReviews)
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
async function fetchFakeStoreProducts(): Promise<FakeStoreProduct[]> {
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

// =========================================================================
// Service Implementation
// =========================================================================
module.exports = cds.service.impl(async function (service: Service) {
    // -------------------------------
    // Product Handlers
    // -------------------------------
    service.before(
        "CREATE",
        "Products",
        asyncHandler(async (req) => {
            const product = req.data as CreateProductInput;

            // Price & supplier validation
            validatePrice(product.price);
            if (!product.supplier_ID)
                throw new ValidationError("Supplier ID is required");
            await validateSupplierId(service, product.supplier_ID);

            // External API rating
            if (product.category) {
                const fakeStoreProducts = await fetchFakeStoreProducts();
                const matching = fakeStoreProducts.find(
                    (p) =>
                        p.category.toLowerCase() ===
                        product.category?.toLowerCase(),
                );
                if (matching) product.externalRating = matching.rating.rate;
            }
        }),
    );

    service.before(
        "UPDATE",
        "Products",
        asyncHandler(async (req) => {
            const data = req.data as UpdateProductInput;
            if (data.price !== undefined) validatePrice(data.price);
            if (data.supplier_ID !== undefined)
                await validateSupplierId(service, data.supplier_ID);
        }),
    );

    // -------------------------------
    // ProductReview Handlers
    // -------------------------------
    service.before(
        "CREATE",
        "ProductReviews",
        asyncHandler(async (req) => {
            const review = req.data as CreateProductReviewInput;
            validateRating(review.rating, "Rating");
        }),
    );

    service.before(
        "UPDATE",
        "ProductReviews",
        asyncHandler(async (req) => {
            const reviewID = req.params[0] as number;
            await validateReviewExists(service, reviewID);
            const review = req.data as UpdateProductReviewInput;
            validateRating(review.rating, "Rating");
        }),
    );

    // afterUpdate & afterDelete now fetch product_ID correctly
    service.after(
        ["UPDATE", "DELETE"],
        "ProductReviews",
        asyncHandler(async (data, req) => {
            const reviewData =
                req.event === "DELETE"
                    ? (data as CreateProductReviewInput)
                    : await service.read(
                          service.entities.ProductReviews,
                          req.params[0],
                      );
            const productID = reviewData.product_ID;
            if (productID) await updateProductAverageRating(service, productID);
        }),
    );

    service.before(
        "DELETE",
        "ProductReviews",
        asyncHandler(async (req) => {
            const reviewID = req.params[0] as number;
            await validateReviewExists(service, reviewID);
        }),
    );

    // -------------------------------
    // Supplier Handlers
    // -------------------------------
    service.before(
        "UPDATE",
        "Suppliers",
        asyncHandler(async (req) => {
            const supplier = req.data as UpdateSupplierInput;
            validateRating(supplier.rating, "Supplier rating");
        }),
    );

    // -------------------------------
    // Action Handlers
    // -------------------------------
    service.on(
        "submitReview",
        asyncHandler(async (req): Promise<SubmitReviewResult> => {
            const { productID, rating, comment, reviewer } =
                req.data as RequestData;

            validateRating(rating, "Rating");

            const ProductReviews = service.entities.ProductReviews;
            const Products = service.entities.Products;

            const productExists = await service.exists(Products, productID);
            if (!productExists)
                throw new NotFoundError(
                    `Product with ID ${productID} does not exist`,
                );

            // Create new review
            const review = await service.create(ProductReviews, {
                product_ID: productID,
                rating,
                comment,
                reviewer,
            });
            // Update average rating incrementally using aggregation
            await updateProductAverageRating(service, productID);

            return {
                success: true,
                averageRating: (await service.read(Products, productID))[0]
                    .averageRating,
            };
        }),
    );
});
