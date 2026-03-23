/**
 * Async handler utility wrapper for CAP event handlers.
 * Automatically catches errors and passes them to CAP's error handling (req.reject()).
 * Uses cds.log for logging errors.
 */

// @ts-ignore - SAP CAP types
import cds from "@sap/cds";
import { AppError } from "../errors";

/**
 * Type definition for CAP handler functions.
 * Represents an async event handler that processes requests.
 */
type CAPHandler = (req: any, next: any) => Promise<any>;

/**
 * Logger instance for error handling.
 * Uses 'error-handler' as the log namespace.
 */
const LOG = cds.log("error-handler");

/**
 * Wraps an async CAP handler function to automatically catch and handle errors.
 *
 * This wrapper:
 * - Catches both sync and async errors
 * - Logs errors using cds.log before rejecting
 * - Uses req.reject() with appropriate status codes for AppErrors
 * - Falls back to 500 status code for generic errors
 *
 * @param handler - The async handler function to wrap
 * @returns A wrapped handler function with automatic error handling
 *
 * @example
 * ```typescript
 * const myHandler = asyncHandler(async (req, next) => {
 *   // Handler logic here
 *   return result;
 * });
 * ```
 */
function asyncHandler(handler: CAPHandler): CAPHandler {
    return async (req: any, next: any): Promise<any> => {
        try {
            // Execute the handler and await the result
            // This catches both sync and async errors
            return await handler(req, next);
        } catch (error: any) {
            // Log the error before rejecting
            LOG.error("Error in handler:", error.message);

            // Check if this is an AppError instance
            if (error instanceof AppError) {
                // For custom AppErrors, use the defined statusCode and message
                req.reject(error.statusCode, error.message);
                return;
            }

            // For generic errors, reject with 500 status code
            req.reject(500, error.message || "Internal server error");
        }
    };
}

export default asyncHandler;
