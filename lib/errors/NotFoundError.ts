import AppError from './AppError';

/**
 * Simple NotFoundError - HTTP 404
 */
export default class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
    }
}
