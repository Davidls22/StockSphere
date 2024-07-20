import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';

// Ensure the type extension for Express is in place (usually in a types.d.ts file)
declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  console.log('Authorization Header:', authHeader);
  
  const token = authHeader?.split(' ')[1];
  console.log('Token:', token);

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
    console.log('Decoded Token:', decoded);

    if (decoded.userId) {
      req.userId = decoded.userId;
      console.log('User ID from Token:', req.userId);

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(401).json({ error: 'Access denied. User not found.' });
      }
      next();
    } else {
      res.status(400).json({ error: 'Invalid token.' });
    }
  } catch (error) {
    console.error('Error verifying token:', error); 
    res.status(400).json({ error: 'Invalid token.' });
  }
};

export default authMiddleware;
