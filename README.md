# SAP CAP Supplier Product Management API

A Cloud Application Programming (CAP) based REST API for managing suppliers, products, and product reviews.

## Overview

This project implements a comprehensive CRUD API for a supplier product catalog system with:

- **Suppliers Management**: Create, read, update, and delete suppliers
- **Products Management**: Full CRUD with external API integration
- **Product Reviews**: Rating system with automatic average calculation
- **Custom Actions**: Submit review action that updates product ratings
- **Input Validations**: Price, rating, and field length validations

## Project Structure

```
cap-task/
├── db/
│   └── schema.cds           # Database schema definitions
├── lib/
│   └── catalog-service.js  # Custom handler implementations
├── srv/
│   ├── CatalogService.cds  # Service definitions
│   ├── CatalogService.js   # Main service handlers
│   └── catalog-service-handler.js  # Handler registration
├── tests/
│   ├── catalog-service.test.js  # Handler unit tests
│   └── validations.test.js      # Validation tests
├── jest.config.js           # Jest configuration
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

### Steps

1. **Install dependencies**:

   ```bash
   npm install
   ```

   This will install:
   - `@sap/cds` - SAP CAP framework
   - `@sap/cds-sqlite` - SQLite database adapter
   - `sqlite3` - SQLite driver
   - `express` - HTTP server

2. **Initialize the database**:

   ```bash
   npx cds deploy
   ```

   This creates a SQLite database file (`db.sqlite`) with the schema.

## Running the Project

### Development Mode (Auto-reload)

```bash
npm run watch
```

This starts the CAP server with auto-reload on file changes.

### Production Mode

```bash
npm start
```

This starts the CAP server at `http://localhost:4004`.

### Running Tests

```bash
npm test
```

This runs all Jest unit tests.

## API Endpoints

### Base URL

```
http://localhost:4004/catalog
```

### Suppliers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/Suppliers` | List all suppliers |
| GET | `/Suppliers(1)` | Get supplier by ID |
| POST | `/Suppliers` | Create new supplier |
| PATCH | `/Suppliers(1)` | Update supplier |
| DELETE | `/Suppliers(1)` | Delete supplier |

**Sample Request - Create Supplier:**

```bash
curl -X POST http://localhost:4004/catalog/Suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "ID": 1,
    "name": "Tech Supplies Inc",
    "email": "contact@techsupplies.com",
    "rating": 4
  }'
```

**Sample Response:**

```json
{
  "@odata.context": "$metadata#Suppliers/$entity",
  "ID": 1,
  "name": "Tech Supplies Inc",
  "email": "contact@techsupplies.com",
  "rating": 4
}
```

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/Products` | List all products |
| GET | `/Products(1)` | Get product by ID |
| POST | `/Products` | Create new product |
| PATCH | `/Products(1)` | Update product |
| DELETE | `/Products(1)` | Delete product |

**Sample Request - Create Product:**

```bash
curl -X POST http://localhost:4004/catalog/Products \
  -H "Content-Type: application/json" \
  -d '{
    "ID": 1,
    "name": "Wireless Mouse",
    "price": 29.99,
    "category": "electronics",
    "supplier_ID": 1
  }'
```

**Sample Response:**

```json
{
  "@odata.context": "$metadata#Products/$entity",
  "ID": 1,
  "name": "Wireless Mouse",
  "price": 29.99,
  "category": "electronics",
  "externalRating": 4.5,
  "averageRating": 0,
  "supplier_ID": 1
}
```

**Note:** When creating a product with a category, the system automatically fetches an external rating from FakeStoreAPI based on the category.

### Product Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ProductReviews` | List all reviews |
| GET | `/ProductReviews(1)` | Get review by ID |
| POST | `/ProductReviews` | Create new review |
| PATCH | `/ProductReviews(1)` | Update review |
| DELETE | `/ProductReviews(1)` | Delete review |

**Sample Request - Create Review:**

```bash
curl -X POST http://localhost:4004/catalog/ProductReviews \
  -H "Content-Type: application/json" \
  -d '{
    "ID": 1,
    "product_ID": 1,
    "rating": 4,
    "comment": "Great product!",
    "reviewer": "John Doe"
  }'
```

### Submit Review Action

Submit a review and automatically update the product's average rating.

**Endpoint:** `POST /catalog/submitReview`

**Request:**

```bash
curl -X POST http://localhost:4004/catalog/submitReview \
  -H "Content-Type: application/json" \
  -d '{
    "productID": 1,
    "rating": 5,
    "comment": "Excellent product, highly recommend!",
    "reviewer": "Jane Smith"
  }'
```

**Response:**

```json
{
  "success": true,
  "averageRating": 4.5
}
```

## Design Decisions and Trade-offs

### 1. SQLite vs HANA

**Decision:** Used SQLite for development and testing.

**Trade-off:** SQLite is file-based and suitable for development. For production with multiple concurrent users, SAP HANA or another enterprise database would be preferred.

### 2. External API Integration

**Decision:** Integrated with FakeStoreAPI (https://fakestoreapi.com/products) to fetch external ratings based on product category.

**Trade-off:** 
- Benefits: Provides realistic rating data without manual entry
- Risk: External API dependency - if API is down, product creation continues without external rating (fail-safe approach)

### 3. Rating Validation Range

**Decision:** All ratings (supplier, product, review) must be between 1-5.

**Rationale:** Industry standard for 5-star rating systems. External ratings from FakeStoreAPI are also mapped to this scale.

### 4. Average Rating Calculation

**Decision:** Calculated dynamically when a new review is submitted via the `submitReview` action.

**Trade-off:** 
- Pros: Always up-to-date, no need for scheduled jobs
- Cons: Slight overhead on review creation (calculated on-the-fly)

### 5. Custom Action for Reviews

**Decision:** Created a custom `submitReview` action instead of just using standard POST to ProductReviews.

**Rationale:** The action encapsulates both review creation AND average rating update in a single atomic operation, ensuring data consistency.

## Assumptions Made

1. **Database Initialization**: Database is initialized on first `cds deploy` or automatically on server start.

2. **ID Generation**: IDs are assumed to be provided by the client. In production, you would typically use UUIDs or auto-increment.

3. **Authentication**: Not implemented. In production, SAP CAP's built-in authentication and authorization should be configured.

4. **External API**: FakeStoreAPI is used as a mock external rating service. In production, this would be replaced with actual supplier rating APIs.

5. **CORS**: Default CAP CORS settings are assumed. For production, explicit CORS configuration may be needed.

6. **Numeric Precision**: Using Decimal(10,2) for prices and Decimal(3,2) for ratings is sufficient for the use case.

## Validations

The following validations are enforced:

| Field | Entity | Validation Rule |
|-------|--------|-----------------|
| Price | Products | Must be > 0 |
| Category | Products | Max 50 characters |
| External Rating | Products | Must be 0-5 (if provided) |
| Average Rating | Products | Must be 0-5 (if provided) |
| Rating | Suppliers | Must be 1-5 |
| Rating | ProductReviews | Must be 1-5 |
| Comment | ProductReviews | Max 500 characters |
| Reviewer | ProductReviews | Max 100 characters |
| Name | Suppliers | Max 100 characters |
| Email | Suppliers | Must be valid email format |

## Testing

### Unit Tests

The project includes comprehensive unit tests covering:

- **Handler Tests** (`tests/catalog-service.test.js`):
  - External API integration
  - Product creation with category
  - Review submission validation
  - Array handling

- **Validation Tests** (`tests/validations.test.js`):
  - Price validation
  - Rating validation
  - Email validation
  - Field length validation
  - Edge cases

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## Technology Stack

- **Framework**: SAP Cloud Application Programming (CAP) v8
- **Language**: JavaScript/Node.js
- **Database**: SQLite (development)
- **Testing**: Jest
- **HTTP Server**: Express (via CAP)

## Error Handling

All errors return appropriate HTTP status codes:

- `400` - Bad Request (validation errors)
- `404` - Not Found (entity doesn't exist)
- `500` - Internal Server Error

Error responses include a message describing the issue:

```json
{
  "error": {
    "code": "400",
    "message": "Price must be greater than 0"
  }
}
```

## Future Improvements

1. **Authentication/Authorization**: Add user authentication and role-based access control
2. **Pagination**: Implement OData pagination for large datasets
3. **Caching**: Add caching for external API responses
4. **Logging**: Enhance logging with structured logging (e.g., Winston)
5. **API Documentation**: Add Swagger/OpenAPI documentation
6. **Database Migrations**: Implement proper database migration strategy for production
7. **Unit of Work**: Implement transaction handling for complex operations
