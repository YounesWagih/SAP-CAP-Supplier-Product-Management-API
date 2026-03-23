import AppError from "./AppError";

/**
 * Simple ApiError - HTTP 502
 */
export default class ApiError extends AppError {
    constructor(message: string) {
        super(message, 502);
    }
}
