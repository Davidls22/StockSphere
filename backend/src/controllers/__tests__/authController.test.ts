import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { register, login } from '../../controllers/authController';
import User from '../../models/user';

const mockRequest = (data: Partial<Request>) => data as Request;
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

process.env.JWT_SECRET = 'testsecret';

jest.mock('../../models/user', () => {
  class FakeUser {
    _id: string;
    username: string;
    password: string;
    id: string;
    constructor(data: any) {
      this._id = 'user1';
      this.username = data.username;
      this.password = data.password;
      this.id = 'user1';
    }
    save = jest.fn().mockResolvedValue(this);
    static findOne = jest.fn();
  }
  return FakeUser;
});
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('registers a user successfully', async () => {
      const req = mockRequest({ body: { username: 'testuser', password: 'password123' } });
      const res = mockResponse();
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (jwt.sign as jest.Mock).mockReturnValue('token123');
      await register(req, res);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: { id: 'user1', username: 'testuser' },
        token: 'token123'
      });
    });

    it('returns 500 on error during registration', async () => {
      const req = mockRequest({ body: { username: 'testuser', password: 'password123' } });
      const res = mockResponse();
      (bcrypt.genSalt as jest.Mock).mockRejectedValue(new Error('genSalt error'));
      await register(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('login', () => {
    it('returns 400 if user not found', async () => {
      const req = mockRequest({ body: { username: 'testuser', password: 'password123' } });
      const res = mockResponse();
      (User.findOne as jest.Mock).mockResolvedValue(null);
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('returns 400 if password does not match', async () => {
      const req = mockRequest({ body: { username: 'testuser', password: 'wrongpassword' } });
      const res = mockResponse();
      const fakeUser = { _id: 'user1', username: 'testuser', password: 'hashedPassword', id: 'user1' };
      (User.findOne as jest.Mock).mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await login(req, res);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('logs in successfully', async () => {
      const req = mockRequest({ body: { username: 'testuser', password: 'password123' } });
      const res = mockResponse();
      const fakeUser = { _id: 'user1', username: 'testuser', password: 'hashedPassword', id: 'user1' };
      (User.findOne as jest.Mock).mockResolvedValue(fakeUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token123');
      await login(req, res);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: 'token123', user: { id: 'user1', username: 'testuser' } });
    });

    it('returns 500 on error during login', async () => {
      const req = mockRequest({ body: { username: 'testuser', password: 'password123' } });
      const res = mockResponse();
      (User.findOne as jest.Mock).mockRejectedValue(new Error('DB error'));
      await login(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
});