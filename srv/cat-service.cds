// Service definition for the CAP project
using my.bookshop from '../db/schema';

service CatalogService {
  @readonly
  entity Books   as projection on bookshop.Books;

  @readonly
  entity Authors as projection on bookshop.Authors;
}
