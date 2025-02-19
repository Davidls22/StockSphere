import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
    }
  }
}

const generateToken = (user: any) => {
  const payload = { id: user._id, username: user.username };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: '1h' as const };

  return jwt.sign(payload, secret, options);
};

const register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;
  
      console.log('Registering user:', { username, password });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      console.log('Hashed password:', hashedPassword);
  
      const user = new User({ username, password: hashedPassword });
      await user.save();
  
      const token = generateToken(user);
  
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          username: user.username,
        },
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };  
  const login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;
      console.log('Login attempt:', { username, password });
  
      const user = await User.findOne({ username });
      if (!user) {
        console.log('User not found');
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }
  
      console.log('User found:', user);
  
      // Ensure bcrypt compare is used correctly
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', isMatch);
  
      if (!isMatch) {
        console.log('Password does not match');
        res.status(400).json({ message: 'Invalid credentials' });
        return;
      }
  
      const token = generateToken(user);
      console.log('User logged in. Token:', token, 'User:', { id: user.id, username: user.username });
  
      res.status(200).json({ token, user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  
  
export { register, login };
