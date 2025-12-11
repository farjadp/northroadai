// ============================================================================
// 📁 Hardware Source: src/lib/api-error.ts
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic: Standardized API Error Handling.
// - AppError: Custom class for operational errors with status codes.
// - handleApiError: Helper to format JSON response and log securely.
// ============================================================================

import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Custom Error Class for Operational API Errors.
 * Allows throwing errors with specific HTTP status codes.
 */
export class AppError extends Error {
    public statusCode: number;
    public details?: any;

    /**
     * @param {string} message - Error message to display.
     * @param {number} statusCode - HTTP status code (default 500).
     * @param {any} details - Optional additional metadata or validation errors.
     */
    constructor(message: string, statusCode: number = 500, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Global API Error Handler.
 * Catches AppError, ZodError, and generic Errors, formatting them into a consistent JSON response.
 * @param {unknown} error - The caught error object.
 * @returns {NextResponse} Standardized JSON error response.
 */
export function handleApiError(error: unknown) {
    console.error("❌ API Error:", error);

    if (error instanceof AppError) {
        return NextResponse.json(
            { error: error.message, details: error.details },
            { status: error.statusCode }
        );
    }

    if (error instanceof ZodError) {
        return NextResponse.json(
            { error: "Validation Error", details: error.flatten() },
            { status: 400 }
        );
    }

    // Handle Firebase/Google Auth specific errors if possible, or generic
    // Default to 500
    const message = error instanceof Error ? error.message : "Internal Server Error";

    // Hide internal stack details in production default response
    return NextResponse.json(
        { error: message },
        { status: 500 }
    );
}
