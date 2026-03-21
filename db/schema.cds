// Schema with validations for SAP CAP project

entity Suppliers {
  key ID     : Integer;
      name   : String(100);
      email  : String(255);

      @assert.range: [
        1,
        5
      ]
      rating : Integer;
}

entity Products {
  key ID             : Integer;
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
}

entity ProductReviews {
  key ID       : Integer;
      product  : Association to Products;

      @assert.range: [
        1,
        5
      ]
      rating   : Integer;
      comment  : String(500);
      reviewer : String(100);
}
