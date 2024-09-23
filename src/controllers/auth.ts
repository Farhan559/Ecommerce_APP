import { NextFunction, Request, Response } from 'express';
import { prismaClient } from '..';
import { hashSync, compareSync } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secrets';
import { BadRequestsException } from '../exceptions/badRequest';
import { ErrorCode } from '../exceptions/root';
import { UnprocessableEntity } from '../exceptions/validation';
import { SignUpSchema } from '../schema/users';
import { NotFoundException } from '../exceptions/not-found';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    SignUpSchema.parse(req.body);

    const { email, password, name } = req.body;

    // Check if the user already exists
    let user = await prismaClient.user.findFirst({ where: { email } });
    if (user) {
      throw new BadRequestsException('User already exists', ErrorCode.USER_ALREADY_EXITS);
    }

    // Hash the password and create the new user
    const hashedPassword = hashSync(password, 10);
    user = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Respond with the created user data and a 201 status code
    res.status(201).json(user);
  } catch (error) {
    next(error); // Pass errors to the error handler
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await prismaClient.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
    }

    // Check if the provided password is correct
    if (!compareSync(password, user.password)) {
      throw new BadRequestsException('Incorrect Password', ErrorCode.INCORRECT_PASSWORD);
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    // Respond with the user data and token
    res.status(200).json({ user, token });
  } catch (error) {
    next(error); // Pass errors to the error handler
  }
};

// Me -> Return the logged-in user
export const me = async (req: Request, res: Response): Promise<void> => {
  res.json(req.user);
};
