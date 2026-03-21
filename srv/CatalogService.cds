// Catalog Service - Full CRUD with actions
using from '../db/schema';

service CatalogService {
  entity Suppliers {
    key ID     : Integer;
        name   : String(100);
        email  : String(255);
        rating : Integer;
  }

  entity Products {
    key ID             : Integer;
        name           : String(100);
        price          : Decimal(10, 2);
        category       : String(50);
        externalRating : Decimal(3, 2);
        averageRating  : Decimal(3, 2);
        supplier       : Association to Suppliers;
  }

  entity ProductReviews {
    key ID       : Integer;
        product  : Association to Products;
        rating   : Integer;
        comment  : String(500);
        reviewer : String(100);
  }

  // Custom action to submit a review
  action submitReview(productID: Integer,
                      rating: Integer,
                      comment: String(500),
                      reviewer: String(100)) returns {
    success       : Boolean;
    averageRating : Decimal(3, 2);
  };
}

