/**
 * Tests for simplified error classes
 * Only tests message and statusCode
 */

import {
    AppError,
    ValidationError,
    NotFoundError,
    DatabaseError,
    ApiError,
} from "../lib/errors";

describe("Error Classes", () => {
    describe("AppError", () => {
        test("should create error with message and statusCode", () => {
            const error = new AppError("Something went wrong", 500);
            expect(error.message).toBe("Something went wrong");
            expect(error.statusCode).toBe(500);
            expect(error.name).toBe("AppError");
        });

        test("should be instanceof Error", () => {
            const error = new AppError("Test", 400);
            expect(error instanceof Error).toBe(true);
        });
    });

    describe("ValidationError", () => {
        test("should create error with message and status 400", () => {
            const error = new ValidationError("Invalid input");
            expect(error.message).toBe("Invalid input");
            expect(error.statusCode).toBe(400);
            expect(error.name).toBe("ValidationError");
        });

        test("should be instanceof AppError", () => {
            const error = new ValidationError("Test");
            expect(error instanceof AppError).toBe(true);
        });
    });

    describe("NotFoundError", () => {
        test("should create error with message and status 404", () => {
            const error = new NotFoundError("Resource not found");
            expect(error.message).toBe("Resource not found");
            expect(error.statusCode).toBe(404);
            expect(error.name).toBe("NotFoundError");
        });

        test("should be instanceof AppError", () => {
            const error = new NotFoundError("Test");
            expect(error instanceof AppError).toBe(true);
        });
    });

    describe("DatabaseError", () => {
        test("should create error with message and status 500", () => {
            const error = new DatabaseError("Database error");
            expect(error.message).toBe("Database error");
            expect(error.statusCode).toBe(500);
            expect(error.name).toBe("DatabaseError");
        });

        test("should be instanceof AppError", () => {
            const error = new DatabaseError("Test");
            expect(error instanceof AppError).toBe(true);
        });
    });

    describe("ApiError", () => {
        test("should create error with message and status 502", () => {
            const error = new ApiError("API failed");
            expect(error.message).toBe("API failed");
            expect(error.statusCode).toBe(502);
            expect(error.name).toBe("ApiError");
        });

        test("should be instanceof AppError", () => {
            const error = new ApiError("Test");
            expect(error instanceof AppError).toBe(true);
        });
    });

    describe("Error throwing and catching", () => {
        test("should catch ValidationError", () => {
            try {
                throw new ValidationError("Price is required");
            } catch (e) {
                if (e instanceof ValidationError) {
                    expect(e.statusCode).toBe(400);
                }
            }
        });

        test("should catch NotFoundError", () => {
            try {
                throw new NotFoundError("Supplier not found");
            } catch (e) {
                if (e instanceof NotFoundError) {
                    expect(e.statusCode).toBe(404);
                }
            }
        });

        test("should catch ApiError", () => {
            try {
                throw new ApiError("External API error");
            } catch (e) {
                if (e instanceof ApiError) {
                    expect(e.statusCode).toBe(502);
                }
            }
        });
    });
});
