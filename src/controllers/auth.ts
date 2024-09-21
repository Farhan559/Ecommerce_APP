import { NextFunction, Request, Response } from 'express';
import { prismaClient } from '..';
import { hashSync, compareSync } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secrets';
import { BadRequestsException } from '../exceptions/badRequest';
import { ErrorCode } from '../exceptions/root';
import { UnprocessableEntity } from '../exceptions/validation';
import { SignUpSchema } from '../schema/users';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate the request body
    SignUpSchema.parse(req.body);

    const { email, password, name } = req.body;

    // Check if the user already exists
    let user = await prismaClient.user.findFirst({ where: { email } });
    if (user) {
      return next(new BadRequestsException('User already exists', ErrorCode.USER_ALREADY_EXITS));
    }

    // Hash the password and create the new user
    const hashedPassword = hashSync(password, 10);
    user = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    // Respond with the created user data
    res.status(201).json(user);
  } catch (err: any) {
    // Handle validation errors
    next(new UnprocessableEntity(err?.issues, 'Unprocessable entity', ErrorCode.UNPROCESSABLE_ENTITY));
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await prismaClient.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).send('User does not exist');
  }

  // Check if the provided password is correct
  if (!compareSync(password, user.password)) {
    return res.status(400).send('Incorrect password');
  }

  // Generate a JWT token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

  // Respond with the user data and token
  res.status(200).json({ user, token });
};
