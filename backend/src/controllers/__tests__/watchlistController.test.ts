import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { createWatchlist, getWatchlists, removeStockFromWatchlist } from '../../controllers/watchlistController';
import axios from 'axios';

const mockRequest = (data: Partial<Request>) => data as Request;
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

jest.mock('axios');

jest.mock('../../models/stock', () => {
  return class FakeStock {
    _id: string = 'stock1';
    symbol: string = '';
    data: any;
    constructor(data: any) {
      Object.assign(this, data);
    }
    static findOne = jest.fn();
    save() {
      return Promise.resolve({ ...this, _id: 'stock1' });
    }
  };
});

jest.mock('../../models/watchlist', () => {
  return class FakeWatchlist {
    _id: string = 'watchlist1';
    stocks: any[] = [];
    user: any;
    constructor(data: any) {
      Object.assign(this, data);
      this.stocks = data.stocks || [];
    }
    static findOne = jest.fn();
    static find = jest.fn();
    static findOneAndUpdate = jest.fn();
    save() {
      return Promise.resolve({ ...this, _id: 'watchlist1' });
    }
  };
});

describe('Watchlist Controller Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWatchlist', () => {
    it('creates a new watchlist when stock is not found and watchlist does not exist', async () => {
      const userId = new Types.ObjectId().toHexString();
      const req = mockRequest({ body: { stockId: 'AAPL', user: userId } });
      const res = mockResponse();
      const Stock = require('../../models/stock');
      (Stock.findOne as jest.Mock).mockResolvedValue(null);
      (axios.get as jest.Mock).mockResolvedValue({ data: { name: 'Apple Inc.', companyName: 'Apple Inc.' } });
      const Watchlist = require('../../models/watchlist');
      (Watchlist.findOne as jest.Mock).mockResolvedValue(null);
      await createWatchlist(req, res);
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/stocks/AAPL');
      expect(Stock.findOne).toHaveBeenCalledWith({ symbol: 'AAPL' });
      expect(Watchlist.findOne).toHaveBeenCalledWith({ user: expect.any(Object) });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'watchlist1', stocks: ['stock1'] }));
    });

    it('updates an existing watchlist by adding a stock if not present', async () => {
      const userId = new Types.ObjectId().toHexString();
      const req = mockRequest({ body: { stockId: 'AAPL', user: userId } });
      const res = mockResponse();
      const Stock = require('../../models/stock');
      const fakeStock = { _id: 'stock1', symbol: 'AAPL' };
      (Stock.findOne as jest.Mock).mockResolvedValue(fakeStock);
      const Watchlist = require('../../models/watchlist');
      const existingWatchlist = { _id: 'watchlist1', user: userId, stocks: [], save: jest.fn().mockResolvedValue({ _id: 'watchlist1', stocks: ['stock1'] }) };
      (Watchlist.findOne as jest.Mock).mockResolvedValue(existingWatchlist);
      await createWatchlist(req, res);
      expect(existingWatchlist.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(existingWatchlist);
    });

    it('returns 500 on error in createWatchlist', async () => {
      const userId = new Types.ObjectId().toHexString();
      const req = mockRequest({ body: { stockId: 'AAPL', user: userId } });
      const res = mockResponse();
      const Stock = require('../../models/stock');
      (Stock.findOne as jest.Mock).mockResolvedValue(null);
      (axios.get as jest.Mock).mockRejectedValue(new Error('API error'));
      await createWatchlist(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('getWatchlists', () => {
    it('returns 400 if userId is invalid', async () => {
      const req = mockRequest({ params: { userId: 'invalid' } });
      const res = mockResponse();
      await getWatchlists(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
    });

    it('returns watchlists with populated stocks', async () => {
      const userId = new Types.ObjectId().toHexString();
      const req = mockRequest({ params: { userId } });
      const res = mockResponse();
      const dummyWatchlists = [
        {
          _id: 'watchlist1',
          user: userId,
          stocks: [
            {
              _id: 'stock1',
              symbol: 'AAPL',
              companyName: 'Apple Inc.',
              price: 150,
              priceChange: 0,
              priceChangePercentage: 0,
              daysRange: '',
              weekRange: '',
              marketCap: '',
              volume: '',
              history: ''
            }
          ]
        }
      ];
      const Watchlist = require('../../models/watchlist');
      (Watchlist.find as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(dummyWatchlists),
      }));
      await getWatchlists(req, res);
      expect(res.json).toHaveBeenCalledWith(dummyWatchlists);
    });

    it('returns 404 if no watchlists found', async () => {
      const userId = new Types.ObjectId().toHexString();
      const req = mockRequest({ params: { userId } });
      const res = mockResponse();
      const Watchlist = require('../../models/watchlist');
      (Watchlist.find as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue([]),
      }));
      await getWatchlists(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'No watchlists found' });
    });

    it('returns 500 on error in getWatchlists', async () => {
      const userId = new Types.ObjectId().toHexString();
      const req = mockRequest({ params: { userId } });
      const res = mockResponse();
      const Watchlist = require('../../models/watchlist');
      (Watchlist.find as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockRejectedValue(new Error('DB error')),
      }));
      await getWatchlists(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('removeStockFromWatchlist', () => {
    it('returns 400 if userId or stockId is invalid', async () => {
      const req = mockRequest({ params: { userId: 'invalid', stockId: 'invalid' } });
      const res = mockResponse();
      await removeStockFromWatchlist(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID or stock ID' });
    });

    it('updates the watchlist and returns it', async () => {
      const userId = new Types.ObjectId().toHexString();
      const stockId = new Types.ObjectId().toHexString();
      const req = mockRequest({ params: { userId, stockId } });
      const res = mockResponse();
      const Watchlist = require('../../models/watchlist');
      (Watchlist.findOneAndUpdate as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue({ _id: 'watchlist1', user: userId, stocks: [] }),
      }));
      await removeStockFromWatchlist(req, res);
      expect(res.json).toHaveBeenCalledWith({ _id: 'watchlist1', user: userId, stocks: [] });
    });

    it('returns 404 if watchlist not found in removeStockFromWatchlist', async () => {
      const userId = new Types.ObjectId().toHexString();
      const stockId = new Types.ObjectId().toHexString();
      const req = mockRequest({ params: { userId, stockId } });
      const res = mockResponse();
      const Watchlist = require('../../models/watchlist');
      (Watchlist.findOneAndUpdate as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockResolvedValue(null),
      }));
      await removeStockFromWatchlist(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Watchlist not found' });
    });

    it('returns 500 on error in removeStockFromWatchlist', async () => {
      const userId = new Types.ObjectId().toHexString();
      const stockId = new Types.ObjectId().toHexString();
      const req = mockRequest({ params: { userId, stockId } });
      const res = mockResponse();
      const Watchlist = require('../../models/watchlist');
      (Watchlist.findOneAndUpdate as jest.Mock).mockImplementation(() => ({
        populate: jest.fn().mockRejectedValue(new Error('DB error')),
      }));
      await removeStockFromWatchlist(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });
});