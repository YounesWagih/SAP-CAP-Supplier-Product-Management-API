# Supplier Product Management API — Tasks & Milestones

## Project Overview

Build a SAP CAP-based Supplier Product Management API with external data enrichment from FakeStoreAPI.

---

## Milestone 1: Project Setup

- [ ] Initialize SAP CAP project with Node.js/TypeScript
- [ ] Configure SQLite database
- [ ] Set up project structure (db/, srv/, lib/ folders)
- [ ] Install required dependencies
- [ ] Verify empty project runs successfully

---

## Milestone 2: CDS Schema Definition

- [ ] Create `Supplier` entity (ID, name, email, rating 1-5)
- [ ] Create `Product` entity (ID, name, price, category, externalRating, averageRating, supplier association)
- [ ] Create `ProductReview` entity (ID, product FK, rating 1-5, comment, reviewer)
- [ ] Define associations:
  - Product → Supplier (many-to-one)
  - Product → ProductReview (composition)
- [ ] Add validations in CDS (price > 0, ratings 1-5)

---

## Milestone 3: Service Definition

- [ ] Create `CatalogService` in srv/
- [ ] Expose Suppliers with full CRUD
- [ ] Expose Products with full CRUD
- [ ] Expose ProductReviews with full CRUD
- [ ] Configure service annotations

---

## Milestone 4: Custom Logic — Product Creation Handler

- [ ] Implement `beforeCreate` event handler for Product
- [ ] Add HTTP client to call `https://fakestoreapi.com/products`
- [ ] Parse response and find product matching category
- [ ] Extract `rating.rate` and assign to `externalRating`
- [ ] Implement error handling (graceful failure, don't block creation)
- [ ] Add logging for API calls and errors

---

## Milestone 5: Custom Action — submitReview

- [ ] Define `submitReview` action in CDS schema
- [ ] Implement action handler logic:
  - Create ProductReview linked to productID
  - Validate rating (1-5)
  - Calculate average rating across all reviews
  - Update Product's `averageRating` field

---

## Milestone 6: Validations & Error Handling

- [ ] Implement price validation (> 0) at application level
- [ ] Implement supplier rating validation (1-5)
- [ ] Implement ProductReview rating validation (1-5)
- [ ] Add meaningful error messages
- [ ] Test validation scenarios

---

## Milestone 7: Testing

- [ ] Write unit tests for custom handlers
- [ ] Test CRUD operations for all entities
- [ ] Test external API integration (mock if needed)
- [ ] Test submitReview action
- [ ] Test validations
- [ ] Test error scenarios

---

## Milestone 8: Documentation & Deliverables

- [ ] Create README.md with:
  - Installation instructions
  - How to run the project
  - Design decisions and trade-offs
  - Assumptions made
  - Sample API calls with expected responses
- [ ] Initialize Git repository
- [ ] Create .gitignore file
- [ ] Verify all files are committed

---

## Technical Notes

### External API Integration Flow
```
Product Created
      ↓
Call fakestoreapi.com/products
      ↓
Find product by category
      ↓
Extract rating.rate
      ↓
Set externalRating (or leave null on error)
```

### submitReview Action Flow
```
submitReview(productID, rating, comment)
      ↓
Create ProductReview record
      ↓
Query all reviews for product
      ↓
Calculate average rating
      ↓
Update Product.averageRating
```

### Entity Relationships
```
Supplier (1) ←──── (N) Product (1) ←──── (N) ProductReview
```

---

## Dependencies

- @sap/cds (SAP CAP framework)
- SQLite (database)
- Node.js >= 18
- TypeScript
- CDS CLI tools
