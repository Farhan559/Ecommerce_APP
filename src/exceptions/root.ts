export class HttpException extends Error {
    public message: string;
    public errorCode: ErrorCode; // Changed to specific type
    public statusCode: number;
    public errors?: any; // Optional, can be used for additional error details

    constructor(message: string, errorCode: ErrorCode, statusCode: number, errors?: any) {    
        super(message);
        this.message = message;
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.errors = errors;
        // Maintain the stack trace for the error
        Error.captureStackTrace(this, this.constructor);
    }   
}
 

    export enum ErrorCode{ 
        USER_NOT_FOUND = 1001,
        USER_ALREADY_EXITS = 1002,
        INCORRECT_PASSWORD = 1003,
        UNPROCESSABLE_ENTITY = 2001,
        INTERNAL_EXCEPTION = 3001,
        UNAUTHORIZED = 4001,

    }
    