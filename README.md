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
│   └── schema.cds              # Database schema definitions
├── lib/
│   └── catalog-service.ts      # Custom handler implementations (TypeScript)
├── srv/
│   ├── CatalogService.cds      # Service definitions
│   └── CatalogService.ts       # Main service handlers (TypeScript)
├── types/
│   ├── entities.d.ts           # Entity type definitions
│   ├── service.d.ts            # Service-related types
│   ├── validation.d.ts         # Validation function types
│   └── external.d.ts           # External API types
├── tests/
│   ├── catalog-service.test.ts # Handler unit tests (TypeScript)
│   └── validations.test.ts     # Validation tests (TypeScript)
├── tsconfig.json               # TypeScript configuration
├── tsconfig.build.json         # TypeScript build configuration
├── jest.config.js              # Jest configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## TypeScript Setup

This project has been migrated to TypeScript for improved type safety and developer experience.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

### TypeScript Configuration

The project uses two TypeScript configuration files:

1. **tsconfig.json** - Development configuration with strict type checking
2. **tsconfig.build.json** - Build configuration for production (excludes tests)

Key TypeScript settings:
- `target`: ES2020
- `module`: CommonJS
- `strict`: true (strict type checking enabled)
- `esModuleInterop`: true
- `skipLibCheck`: true

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

   This will install:
   - `@sap/cds` - SAP CAP framework
   - `@sap/cds-sqlite` - SQLite database adapter
   - `sqlite3` - SQLite driver
   - `express` - HTTP server
   - `typescript` - TypeScript compiler
   - `@types/node` - Node.js type definitions
   - `@types/express` - Express type definitions
   - `jest` - Testing framework
   - `@types/jest` - Jest type definitions

2. **Initialize the database**:

   ```bash
   npx cds deploy
   ```

   This creates a SQLite database file (`db.sqlite`) with the schema.

## NPM Scripts

The following npm scripts are available:

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript in `dist/` directory |
| `npm run watch` | Start CAP server with auto-reload on file changes |
| `npm start` | Start the CAP server at `http://localhost:4004` |
| `npm test` | Run all Jest unit tests |
| `npm run clean` | Remove compiled JavaScript from `dist/` directory |

### Running the Project

#### Development Mode (Auto-reload)

```bash
npm run watch
```

This starts the CAP server with auto-reload on file changes.

#### Production Mode

```bash
npm run build
npm start
```

This compiles TypeScript and starts the CAP server at `http://localhost:4004`.

#### Running Tests

```bash
npm test
```

This runs all Jest unit tests. Tests are written in TypeScript and run directly using ts-jest.

## Type Definitions

The project includes comprehensive TypeScript type definitions in the `types/` directory:

### types/entities.d.ts

Defines interfaces for all CDS entities:

- **Supplier**: ID, name, email, rating (1-5)
- **Product**: ID, name, price, category, externalRating, averageRating, supplier association
- **ProductReview**: ID, product_ID, rating (1-5), comment, reviewer
- **CreateSupplierInput**: Input type for creating suppliers
- **CreateProductInput**: Input type for creating products
- **CreateProductReviewInput**: Input type for creating reviews

### types/service.d.ts

Defines service-related types:

- **CatalogServiceEntities**: Exposes all CDS entities through OData
- **CatalogService**: Full CAP service definition
- **CDSRequest/CDSResponse**: Extended Express request/response types
- **SubmitReviewParams/Result**: Parameters and result for submitReview action
- **ICatalogService**: Interface defining all service operations

### types/validation.d.ts

Defines validation function types:

- **ValidationError**: Field, message, code, value
- **ValidationResult**: valid boolean and errors array
- **SupplierValidationInput**: Input type for supplier validation
- **ProductValidationInput**: Input type for product validation
- **ProductReviewValidationInput**: Input type for review validation

### types/external.d.ts

Defines external API integration types:

- **FakeStoreProduct**: Product from FakeStore API
- **FakeStoreRating**: Rating object from FakeStore API
- **ExternalProduct**: Mapped product with externalRating
- **ExternalApiResponse**: Generic API response wrapper

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

The project includes comprehensive unit tests written in TypeScript:

- **Handler Tests** (`tests/catalog-service.test.ts`):
  - External API integration
  - Product creation with category
  - Review submission validation
  - Array handling

- **Validation Tests** (`tests/validations.test.ts`):
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
- **Language**: TypeScript/JavaScript
- **Database**: SQLite (development)
- **Testing**: Jest with ts-jest
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
