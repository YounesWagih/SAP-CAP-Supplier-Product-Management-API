// @ts-ignore - SAP CAP types
import cds, { Service, SELECT } from "@sap/cds";

import { NotFoundError, ApiError } from "../lib/errors";
import asyncHandler from "../lib/utils/asyncHandler";
import { validate } from "../lib/validation";
import {
    CreateProductSchema,
    UpdateProductSchema,
    CreateSupplierSchema,
    UpdateSupplierSchema,
    CreateProductReviewSchema,
    UpdateProductReviewSchema,
    SubmitReviewSchema,
} from "../lib/validation/schemas";
import type {
    CreateProductInput,
    UpdateProductInput,
    CreateProductReviewInput,
    UpdateProductReviewInput,
    UpdateSupplierInput,
    SubmitReviewInput,
} from "../lib/validation/schemas";
import type { FakeStoreProduct } from "../types/external";
import {
    validateProductId,
    validateSupplierId,
    validateReviewExists,
    updateProductAverageRating,
    fetchFakeStoreProducts,
    SubmitReviewResult,
} from "./CatalogService.helpers";

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
            validate(req.data, CreateProductSchema);
            const product = req.data;

            // prevent wrong ID updates creation
            const productID = req.params[0];
            if (productID) await validateProductId(service, productID);
            await validateSupplierId(service, product.supplier_ID);

            // External API rating
            if (product.category) {
                const fakeStoreProducts = await fetchFakeStoreProducts();
                const matching = fakeStoreProducts.find(
                    (p) =>
                        p.category.toLowerCase() ===
                        product.category?.toLowerCase(),
                );
                if (matching)
                    (
                        product as unknown as Record<string, unknown>
                    ).externalRating = matching.rating.rate;
            }
        }),
    );

    service.before(
        "UPDATE",
        "Products",
        asyncHandler(async (req) => {
            validate(req.data, UpdateProductSchema);

            const data = req.data;
            if (data.supplier_ID !== undefined)
                await validateSupplierId(service, data.supplier_ID);
        }),
    );

    service.before(
        "DELETE",
        "Products",
        asyncHandler(async (req) => {
            const productId = req.params[0] as number;
            await validateProductId(service, productId);
        }),
    );

    // -------------------------------
    // ProductReview Handlers
    // -------------------------------
    service.before(
        "CREATE",
        "ProductReviews",
        asyncHandler(async (req) => {
            validate(req.data, CreateProductReviewSchema);

            const reviewID = req.params[0] as number;
            if (reviewID) await validateReviewExists(service, reviewID);

            const review = req.data as CreateProductReviewInput;
        }),
    );

    service.before(
        "UPDATE",
        "ProductReviews",
        asyncHandler(async (req) => {
            validate(req.data, UpdateProductReviewSchema);
            const review = req.data as UpdateProductReviewInput;
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
        "CREATE",
        "Suppliers",
        asyncHandler(async (req) => {
            validate(req.data, CreateSupplierSchema);

            const supplierId = req.params[0] as number;
            if (supplierId) await validateSupplierId(service, supplierId);

            const supplier = req.data;
        }),
    );

    service.before(
        "UPDATE",
        "Suppliers",
        asyncHandler(async (req) => {
            validate(req.data, UpdateSupplierSchema);
            const supplier = req.data as UpdateSupplierInput;
        }),
    );

    service.before(
        "DELETE",
        "Suppliers",
        asyncHandler(async (req) => {
            const supplierId = req.params[0] as number;
            await validateSupplierId(service, supplierId);
        }),
    );

    // -------------------------------
    // Action Handlers
    // -------------------------------
    service.on(
        "submitReview",
        asyncHandler(async (req): Promise<SubmitReviewResult> => {
            validate(req.data, SubmitReviewSchema);

            const requestData = req.data;

            const { productID, rating, comment, reviewer } = requestData;

            const ProductReviews = service.entities.ProductReviews;
            const Products = service.entities.Products;

            const productExists = await service.exists(Products, productID);
            if (!productExists)
                throw new NotFoundError(
                    `Product with ID ${productID} does not exist`,
                );

            // Create new review
            await service.create(ProductReviews, {
                product_ID: productID,
                rating,
                comment,
                reviewer,
            });
            // Update average rating incrementally using aggregation
            await updateProductAverageRating(service, productID);

            // Get the updated product to return the averageRating
            const productResult = await service
                .read(Products)
                .where({ ID: productID });
            return {
                success: true,
                averageRating: productResult[0]?.averageRating ?? null,
            };
        }),
    );
});
