import { NextFunction, Request,Response } from 'express';
import { prismaClient } from '..';
import { hashSync , compareSync } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secrets';
import { BadRequestsException } from '../exceptions/badRequest';
import { ErrorCode } from '../exceptions/root';


export const signup = async (req:Request,res:Response,next:NextFunction)=>{
  const {email,password,name} = req.body;

  let user = await prismaClient.user.findFirst({where:{email}})
  if(user){
   next(new BadRequestsException('User already exists', ErrorCode.USER_ALREADY_EXITS))
    // return res.status(404).send('User already exists');
  }
  const hashedPassword = hashSync(password, 10);
  user = await prismaClient.user.create({
    data:{
        name,
        email,
        password:hashedPassword
    }
  })
    res.json(user);
}

export const login = async (req:Request , res:Response)=>{
    const {email,password}= req.body;
    let user = await prismaClient.user.findUnique({where:{email}})
    if(!user){
            return res.status(404).send('user does not exist');
    }
    if(!compareSync(password, user.password)){
        return res.send(404).send('incorrect password');
    }
    const token = jwt.sign({
        userId: user.id
    },JWT_SECRET); 

    res.json({user,token});
}