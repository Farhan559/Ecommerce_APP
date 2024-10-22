import { Request, Response, NextFunction } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../secrets";
import { prismaClient } from "..";
import { User } from "@prisma/client"; // Import your User type

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Extract the token from the header
        const authHeader = req.headers.authorization;

        // 2. If the token is not present or doesn't start with 'Bearer ', throw UnauthorizedException
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new UnauthorizedException('Unauthorized: No valid token provided', ErrorCode.UNAUTHORIZED));
        }

        // Extract the token part (after 'Bearer ')
        const token = authHeader.split(' ')[1];

        // 3. Verify the token and extract the payload
        const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

        // 4. Get the user from the payload (assuming payload contains userId)
        const user = await prismaClient.user.findFirst({ where: { id: payload.userId } });

        if (!user) {
            return next(new UnauthorizedException('Unauthorized: User not found', ErrorCode.UNAUTHORIZED));
        }

        // 5. Attach the user to the current request object
        req.user = user; // No need for 'as any' now

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        // Handle token verification errors and any other exceptions
        return next(new UnauthorizedException('Unauthorized: Invalid token', ErrorCode.UNAUTHORIZED));
    }
};

export default authMiddleware;
