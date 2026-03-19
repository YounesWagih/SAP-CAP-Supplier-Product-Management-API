// Database schema for the CAP project
namespace my.bookshop;

// Book entity
entity Books {
  key ID     : Integer;
      title  : String(100);
      author : String(100);
      stock  : Integer;
      price  : Decimal(10, 2);
}

// Author entity
entity Authors {
  key ID    : Integer;
      name  : String(100);
      birth : Date;
}
