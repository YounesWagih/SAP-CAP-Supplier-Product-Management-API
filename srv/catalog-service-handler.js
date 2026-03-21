/**
 * Handler registration for CatalogService
 * Binds custom logic to CDS events
 */

const CatalogServiceHandlers = require("../lib/catalog-service");

module.exports = function (service) {
    const handlers = new CatalogServiceHandlers();

    // Bind beforeCreate event for Products
    service.before("CREATE", "Products", async (req) => {
        const data = req.data;
        await handlers.beforeCreateProducts(data);
    });

    // Bind submitReview action
    service.on("submitReview", async (req) => {
        return await handlers.submitReview(req);
    });
};
