import AppError from "./AppError";

/**
 * Simple DatabaseError - HTTP 500
 */
export default class DatabaseError extends AppError {
    constructor(message: string) {
        super(message, 500);
    }
}
