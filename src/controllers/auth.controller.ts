// src/controllers/auth.controller.ts
import {Request, Response} from 'express';
import {PrismaClient} from '.prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma=new PrismaClient();
const JWT_SECRET=process.env.JWT_SECRET || 'super_secret_fallback_key';

export const registerUser=async(req:Request,res:Response):Promise<void>=>{
  try{
    const {email, password, role}=req.body;

    const existingUser=await prisma.user.findUnique({where: {email}});
    if (existingUser){
      res.status(400).json({error: 'User already exists'});
      return;
    }

    const hashedPassword=await bcrypt.hash(password, 10);

    const user=await prisma.user.create({
      data:{
        email,
        password:hashedPassword,
        role:role || 'VIEWER',
      },
    });

    res.status(201).json({message:'User created successfully', userId: user.id});
  }catch(error){
    res.status(500).json({error:'Internal server error'});
  }
};

export const login=async(req:Request, res:Response):Promise<void>=>{
  try {
    const {email, password}=req.body;

    const user=await prisma.user.findUnique({where:{email}});
    if (!user || !user.isActive) {
      res.status(401).json({error: 'Account is inactive. Please contact an administrator.'});
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'Login successful', token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({ error: 'isActive must be a boolean value (true or false)' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, email: true, role: true, isActive: true } 
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};