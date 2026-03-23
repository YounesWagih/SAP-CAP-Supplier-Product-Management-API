import AppError from './AppError';

/**
 * Simple ValidationError - HTTP 400
 */
export default class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}
