// Schema with validations for SAP CAP project
namespace schema;

entity Suppliers {
  key ID       : UUID;
      name     : String(100);
      email    : String(255);

      @assert.range: [
        1,
        5
      ]
      rating   : Integer;
      products : Association to many Products
                   on products.supplier = $self
}

entity Products {
  key ID             : UUID;
      name           : String(100);

      @assert.notNull
      @assert.range: [
        0.01,
        999999.99
      ]
      price          : Decimal(10, 2);
      category       : String(50);
      externalRating : Decimal(3, 2);
      averageRating  : Decimal(3, 2);
      supplier       : Association to Suppliers;
      reviews        : Composition of many ProductReviews
                         on reviews.product = $self;
}

entity ProductReviews {
  key ID       : UUID;
      product  : Association to Products;

      @assert.range: [
        1,
        5
      ]
      rating   : Integer;
      comment  : String(500);
      reviewer : String(100);
}
