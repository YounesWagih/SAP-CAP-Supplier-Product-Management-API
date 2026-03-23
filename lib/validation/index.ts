/**
 * Validation Utility
 * Provides type-safe validation using Zod schemas
 */

import { z } from "zod";
import ValidationError from "../errors/ValidationError";
import * as schemas from "./schemas";

/**
 * Validates data against a Zod schema
 * @param data - The data to validate (unknown)
 * @param schema - The Zod schema to validate against
 * @returns The validated and typed data
 * @throws ValidationError if validation fails
 */
export function validate<T>(data: unknown, schema: z.ZodType<T>): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues
                .map((err: z.ZodIssue) => {
                    const path = err.path.join(".");
                    return path ? `${path}: ${err.message}` : err.message;
                })
                .join("; ");
            throw new ValidationError(errorMessages);
        }
        throw error;
    }
}

export { schemas };
