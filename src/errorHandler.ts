import { NextFunction, Request, Response } from "express";
import { HttpException, ErrorCode } from "./exceptions/root";
import { InternalException } from "./exceptions/internal-exception";

export const errorHandler = (method: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await method(req, res, next);
        } catch (error: any) {
            let exception: HttpException;

            // Determine if the error is an instance of HttpException
            if (error instanceof HttpException) {
                exception = error;
            } else {
                exception = new InternalException('Something went wrong!', error, ErrorCode.INTERNAL_EXCEPTION);
            }

            // Pass the exception to the next error handler
            next(exception);
        }
    };
};
