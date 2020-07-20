import { BaseError } from "./BaseError";

export class PreconditionFailedError extends BaseError {
    constructor(message: string) {
        super(message, 412)
    }
} 