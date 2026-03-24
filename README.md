# SAP CAP Supplier Product Management API

---

## Table of Contents

- [Problem & Solution](#problem--solution)
- [Overview](#overview)
- [Postman Documentation](#postman-documentation)
- [Technology Stack](#technology-stack)
- [Installation & Local Setup](#installation--local-setup)
- [Project Structure](#project-structure)
- [Architecture Diagram](#architecture-diagram)
- [API Endpoints](#api-endpoints)
- [Sample API Calls](#sample-api-calls)
- [Design Decisions and Trade-offs](#design-decisions-and-trade-offs)
- [Assumptions Made](#assumptions-made)
- [Validation Rules](#validation-rules)
- [Error Handling](#error-handling)
- [NPM Scripts](#npm-scripts)

---

## Problem & Solution

### Problem

The 'Fake Store API' (`https://fakestoreapi.com/products`) is inaccessible via terminal in Egypt for reasons unknown.

### Solution Not Chosen

After discovering that the Fake Store API is open-source with a GitHub repo, I considered cloning and running it locally. However, since the task required using an external API, this solution was not suitable.

### Solution Chosen

I used a proxy API (scraperapi.com) to successfully access the Fake Store API and complete the task.

---

## Overview

A Cloud Application Programming (CAP) based REST API for managing suppliers, products, and product reviews with comprehensive validation and error handling.

### Features

- **Suppliers Management**: Create, read, update, and delete suppliers
- **Products Management**: Full CRUD with external API integration for ratings
- **Product Reviews**: Rating system with automatic average calculation
- **Custom Actions**: Submit review action that updates product ratings
- **Input Validations**: Zod-based validation for all inputs
- **Error Handling**: Custom error classes with proper HTTP status codes

---

## Postman Documentation

I used **Postman** to test the API and created full documentation published online.

**Live Documentation:** [https://documenter.getpostman.com/view/38900736/2sBXijLY5v](https://documenter.getpostman.com/view/38900736/2sBXijLY5v)

This documentation includes:
- All API endpoints with request/response examples
- Environment setup instructions
- Sample requests for CRUD operations
- Custom action (submitReview) examples

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| SAP CAP | v8.9.9 | Core framework |
| TypeScript | v5.3.0 | Language (Bonus - preferred) |
| SQLite | - | Local persistence |
| Zod | v4.3.6 | Runtime validation |
| Express | v4.18.2 | HTTP server |

---

## Installation & Local Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `@sap/cds` - SAP CAP framework
- `@sap/cds-sqlite` - SQLite database adapter
- `sqlite3` - SQLite driver
- `express` - HTTP server
- `zod` - Schema validation
- `typescript` - TypeScript compiler

### 2. Environment Variables (Optional)

Create a `.env` file in the project root to configure the external API:

```bash
# Optional: API key for external rating service
FAKE_STORE_API_KEY=your_scraperapi_key_here
```

No API key? No problem! If you skip this step, the system will gracefully switch to a built-in fallback API. It’s got about 5,000 requests left, which should be more than enough for you to play around and test everything out! 😄

### 3. Initialize the Database

```bash
npx cds deploy
```

This creates a SQLite database file (`db.sqlite`) with the schema.

### 4. Run the Project

#### Development Mode (Auto-reload)

```bash
npm run watch
```

#### Production Mode

```bash
npm run build
npm start
```

The server runs at **http://localhost:4004**.

---

## Project Structure

```
cap-task/
├── db/
│   └── schema.cds              # Database schema definitions (CDS)
├── srv/
│   ├── CatalogService.cds      # Service definitions
│   ├── CatalogService.ts       # Main service handlers (TypeScript)
│   └── CatalogService.helpers.ts # Helper functions
├── lib/
│   ├── errors/                 # Custom error classes
│   │   ├── index.ts
│   │   ├── AppError.ts
│   │   ├── ValidationError.ts
│   │   └── NotFoundError.ts
│   ├── utils/                  # Utility functions
│   │   └── asyncHandler.ts    # Centralized error handling
│   └── validation/            # Zod validation schemas
│       ├── index.ts
│       └── schemas.ts
├── types/
│   └── external.d.ts           # External API types
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

---

## Architecture Diagram



---

## API Endpoints

### Base URL

```
http://localhost:4004/catalog
```

### Suppliers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/Suppliers` | List all suppliers |
| GET | `/Suppliers(UUID)` | Get supplier by ID |
| POST | `/Suppliers` | Create new supplier |
| PATCH | `/Suppliers(UUID)` | Update supplier |
| DELETE | `/Suppliers(UUID)` | Delete supplier |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/Products` | List all products |
| GET | `/Products(UUID)` | Get product by ID |
| POST | `/Products` | Create new product |
| PATCH | `/Products(UUID)` | Update product |
| DELETE | `/Products(UUID)` | Delete product |

### ProductReviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ProductReviews` | List all reviews |
| GET | `/ProductReviews(UUID)` | Get review by ID |
| PATCH | `/ProductReviews(UUID)` | Update review |
| DELETE | `/ProductReviews(UUID)` | Delete review |

### Custom Actions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/submitReview` | Submit review and update average rating |

---

## Sample API Calls

### Required Examples (as per task requirements)

#### 1. Create a Product

```bash
POST http://localhost:4004/catalog/Products
Content-Type: application/json

{
  "name": "T-Shirt",
  "price": 29.99,
  "category": "clothing",
  "supplier_ID": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "@odata.context": "$metadata#Products/$entity",
  "ID": "660e8400-e29b-41d4-a716-446655440001",
  "name": "T-Shirt",
  "price": 29.99,
  "category": "clothing",
  "externalRating": 4.5,
  "averageRating": 0,
  "supplier_ID": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Note:** When creating a product with a category, the system automatically fetches an external rating from FakeStoreAPI (via scraperapi) based on the category.

#### 2. List all Products

```bash
GET http://localhost:4004/catalog/Products
```

### Additional Examples

#### 3. Create a Supplier

```bash
POST http://localhost:4004/catalog/Suppliers
Content-Type: application/json

{
  "name": "Tech Supplies Inc",
  "email": "contact@techsupplies.com",
  "rating": 4
}
```

#### 4. Submit Review Action

```bash
POST http://localhost:4004/catalog/submitReview
Content-Type: application/json

{
  "productID": "660e8400-e29b-41d4-a716-446655440001",
  "rating": 5,
  "comment": "Excellent product, highly recommend!",
  "reviewer": "Jane Smith"
}
```

**Response:**
```json
{
  "success": true,
  "averageRating": 5.0
}
```

---

## Design Decisions and Trade-offs

### 1. Validation Approach

- **Decision:** Use both **Zod** and **CDS schema** for validation.
- **Trade-off:**
  - **Reason:** Zod is used for runtime validation to ensure data is correctly structured before it interacts with the database. The **CDS schema** ensures data integrity in the database, covering things like null constraints and field types.
  - **Alternative Considered:**
    - **Single Layer (Zod only):** Could have used Zod for both types and validation but decided to keep **CDS schema** for database-level constraints to ensure robust data integrity.
    - **CDS Schema Only:** Could rely solely on the CDS schema for validation, but it would lack the flexibility and runtime validation provided by Zod.

---

### 2. Choice of API Call Method

- **Decision:** Use `fetch()` for the external API integration (instead of Axios or CAP remote services).
- **Trade-off:**
  - **Reason:** Since the task only requires a simple external API request with minimal complexity, `fetch()` is sufficient and simpler to implement compared to the more complex setups like Axios or CAP remote services.
  - **Alternative Considered:**
    - **Axios:** Chose not to use Axios since we didn't require advanced features like interceptors or response transformations.
    - **CAP Remote Services:** While CAP remote services would be the best practice for larger projects with OData/REST integration, this task's simplicity didn't justify the overhead of setting up CAP for just one external API request.

---

### 3. Average Rating Calculation Approaches

**Decision:** Use SQL Aggregation (current approach)

1. **Using Aggregation (Current Approach)**
   - **Pros:** Efficient, calculates average directly in the database, avoiding row loading.
   - **Cons:** Some database overhead.

2. **Manual Calculation (Fetching All Reviews)**
   - **Pros:** Simple and flexible.
   - **Cons:** Requires fetching all rows into memory, leading to higher memory usage and slower performance.

3. **Incremental Calculation (Sum and Count)**
   - **Pros:** Efficient for large datasets, updates average in real-time.
   - **Cons:** More complex, requires managing sum and count integrity (e.g., handling updates or deletions).

---

### 4. UUID for IDs

- **Decision:** All entity IDs use UUID type.
- **Trade-off:**
  - **Pros:** Globally unique, no collision concerns, better for distributed systems
  - **Cons:** Less readable than simple integers, slightly larger storage

---

### 5. External API Integration

- **Decision:** Integrated with FakeStoreAPI via scraperapi.com proxy to fetch external ratings based on product category.
- **Trade-off:**
  - **Benefits:** Provides realistic rating data without manual entry, bypasses CORS issues, more reliable access
  - **Risk:** External API dependency - if API is down, product creation continues without external rating (fail-safe approach)
  - **Requirement:** Optional API key for scraperapi

---

### 6. SQLite vs HANA

- **Decision:** Used SQLite for development and testing.
- **Trade-off:** SQLite is file-based and suitable for development. For production with multiple concurrent users, SAP HANA or another enterprise database would be preferred.

---

## Assumptions Made

1. **Database Initialization**: Database is initialized on first `cds deploy` or automatically on server start.

2. **ID Generation**: UUIDs are used for all entity IDs. The server generates UUIDs for new entities automatically.

3. **Authentication**: Not implemented. In production, SAP CAP's built-in authentication and authorization should be configured.

4. **External API**: FakeStoreAPI is used as a mock external rating service via scraperapi. In production, this would be replaced with actual supplier rating APIs.

5. **CORS**: Default CAP CORS settings are assumed. For production, explicit CORS configuration may be needed.

6. **Numeric Precision**: Using Decimal(10,2) for prices and Decimal(3,2) for ratings is sufficient for the use case.

---

## Validation Rules

The following validations are enforced via Zod schemas and CDS annotations:

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
| Name | Suppliers | Min 1, Max 100 characters |
| Email | Suppliers | Must be valid email format |

---

## Error Handling

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request (validation errors) |
| 404 | Not Found (entity doesn't exist) |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": {
    "code": "400",
    "message": "Price must be greater than 0"
  }
}
```

### Custom Error Classes

| Class | HTTP Status | Description |
|-------|-------------|-------------|
| `AppError` | - | Base error class with statusCode |
| `ValidationError` | 400 | Bad request, validation failed |
| `NotFoundError` | 404 | Resource not found |
---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the CAP server at http://localhost:4004 |
| `npm run watch` | Start CAP server with auto-reload on file changes |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run deploy` | Initialize/reset the SQLite database |

---

**Thanks for reviewing**
