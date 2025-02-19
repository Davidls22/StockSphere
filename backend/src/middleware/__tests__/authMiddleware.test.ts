import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authMiddleware from '../authMiddleware';
import User from '../../models/user';
import { Types } from 'mongoose';

jest.mock('jsonwebtoken');
jest.mock('../../models/user');

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { header: jest.fn() };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no token is provided', async () => {
    (req.header as jest.Mock).mockReturnValue(undefined);
    await authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. No token provided.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 if token is invalid', async () => {
    (req.header as jest.Mock).mockReturnValue('Bearer invalidtoken');
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Invalid token error'); });
    await authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 if decoded token does not contain an id', async () => {
    (req.header as jest.Mock).mockReturnValue('Bearer validtoken');
    (jwt.verify as jest.Mock).mockReturnValue({});
    await authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not found', async () => {
    const userId = new Types.ObjectId().toHexString();
    (req.header as jest.Mock).mockReturnValue('Bearer validtoken');
    (jwt.verify as jest.Mock).mockReturnValue({ id: userId });
    (User.findById as jest.Mock).mockResolvedValue(null);
    await authMiddleware(req as Request, res as Response, next);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. User not found.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next and set req.userId if token is valid and user is found', async () => {
    const userId = new Types.ObjectId().toHexString();
    const fakeUser = { _id: userId, username: 'testuser' };
    (req.header as jest.Mock).mockReturnValue('Bearer validtoken');
    (jwt.verify as jest.Mock).mockReturnValue({ id: userId });
    (User.findById as jest.Mock).mockResolvedValue(fakeUser);
    await authMiddleware(req as Request, res as Response, next);
    expect(User.findById).toHaveBeenCalledWith(userId);
    expect(req.userId).toEqual(userId);
    expect(next).toHaveBeenCalled();
  });
});