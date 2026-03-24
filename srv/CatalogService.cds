// Catalog Service - Full CRUD with actions
using schema from '../db/schema';
// using {cuid} from '@sap/cds/common';


service CatalogService {
  entity Suppliers      as projection on schema.Suppliers;
  entity Products       as projection on schema.Products;
  entity ProductReviews as projection on schema.ProductReviews;

  // Custom action to submit a review
  action submitReview(productID: UUID,
                      rating: Integer,
                      comment: String(500),
                      reviewer: String(100)) returns {
    success       : Boolean;
    averageRating : Decimal(3, 2);
  };
}
