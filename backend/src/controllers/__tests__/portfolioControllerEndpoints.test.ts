import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { createPortfolio, getPortfolios, getPortfolioAnalytics, deleteStock } from '../../controllers/portfolioController';
import axios from 'axios';

const mockRequest = (data: Partial<Request>) => data as Request;
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

jest.mock('axios');

jest.mock('../../models/portfolio', () => {
  function FakePortfolio(this: any, data: any) {
    Object.assign(this, data);
    this._id = 'portfolio1';
  }
  FakePortfolio.prototype.save = jest.fn().mockImplementation(function (this: any) {
    return Promise.resolve({ ...this });
  });
  FakePortfolio.find = jest.fn().mockImplementation(() => Promise.resolve([
    {
      _id: 'portfolio1',
      user: new (require('mongoose').Types.ObjectId)('validUserId'),
      stocks: [{
        symbol: 'AAPL',
        quantity: 10,
        toObject: function () { return { symbol: 'AAPL', quantity: 10 }; }
      }],
      save: jest.fn().mockResolvedValue({}),
    }
  ]));
  FakePortfolio.findByIdAndDelete = jest.fn();
  FakePortfolio.findById = jest.fn();
  return FakePortfolio;
});

describe('Portfolio Controller Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPortfolio', () => {
    it('returns 400 if userId is invalid', async () => {
      const req = mockRequest({ body: { userId: 'invalid', stocks: [] } });
      const res = mockResponse();
      await createPortfolio(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
    });

    it('creates a portfolio and returns 201', async () => {
      const validUserId = new Types.ObjectId().toHexString();
      const reqBody = { userId: validUserId, stocks: [{ symbol: 'AAPL', quantity: 10 }] };
      const req = mockRequest({ body: reqBody });
      const res = mockResponse();
      const dummyPortfolio = {
        _id: 'portfolio1',
        user: new Types.ObjectId(validUserId),
        stocks: [{ symbol: 'AAPL', quantity: 10, price: 150, date: expect.any(String) }]
      };
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({ data: { 'Global Quote': { '05. price': '150.00' } } })
      );
      const Portfolio = require('../../models/portfolio');
      Portfolio.prototype.save = jest.fn().mockImplementation(function (this: any) {
        return Promise.resolve({ _id: 'portfolio1', ...this });
      });
      await createPortfolio(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect((res.json as jest.Mock).mock.calls[0][0]).toMatchObject(dummyPortfolio);
    });

    it('returns 500 if fetchStockPrice fails', async () => {
      const validUserId = new Types.ObjectId().toHexString();
      const reqBody = { userId: validUserId, stocks: [{ symbol: 'AAPL', quantity: 10 }] };
      const req = mockRequest({ body: reqBody });
      const res = mockResponse();
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({ data: { 'Global Quote': {} } })
      );
      await createPortfolio(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('getPortfolios', () => {
    it('returns 400 if userId is invalid', async () => {
      const req = mockRequest({ query: { userId: 'invalid' } });
      const res = mockResponse();
      await getPortfolios(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
    });

    it('returns updated portfolios', async () => {
      const validUserId = new Types.ObjectId().toHexString();
      const portfolioData = [
        {
          _id: 'portfolio1',
          stocks: [{
            symbol: 'AAPL',
            quantity: 10,
            toObject: function () { return { symbol: 'AAPL', quantity: 10 }; },
          }],
          save: jest.fn().mockResolvedValue(true),
        },
      ];
      const req = mockRequest({ query: { userId: validUserId } });
      const res = mockResponse();
      const Portfolio = require('../../models/portfolio');
      (Portfolio.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(portfolioData),
      });
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({ data: { 'Global Quote': { '05. price': '150.00' } } })
      );
      await getPortfolios(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          stocks: expect.arrayContaining([
            expect.objectContaining({ symbol: 'AAPL', quantity: 10, price: 150, date: expect.any(String) }),
          ]),
        }),
      ]));
    });
  });

  describe('getPortfolioAnalytics', () => {
    it('returns 400 if userId is invalid', async () => {
      const req = mockRequest({ query: { userId: 'invalid' } });
      const res = mockResponse();
      await getPortfolioAnalytics(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
    });

    it('calculates total portfolio value', async () => {
      const validUserId = new Types.ObjectId().toHexString();
      const portfolioData = [
        { _id: 'portfolio1', stocks: [{ symbol: 'AAPL', quantity: 10 }] },
      ];
      const req = mockRequest({ query: { userId: validUserId } });
      const res = mockResponse();
      const Portfolio = require('../../models/portfolio');
      (Portfolio.find as jest.Mock).mockResolvedValue(portfolioData);
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({ data: { 'Global Quote': { '05. price': '150.00' } } })
      );
      await getPortfolioAnalytics(req, res);
      expect(res.json).toHaveBeenCalledWith({ totalValue: 1500 });
    });
  });

  describe('deleteStock', () => {
    it('returns 400 if portfolioId is invalid', async () => {
      const req = mockRequest({ params: { portfolioId: 'invalid', stockSymbol: 'AAPL' } });
      const res = mockResponse();
      await deleteStock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid portfolio ID' });
    });

    it('returns 404 if portfolio not found', async () => {
      const portfolioId = new Types.ObjectId().toHexString();
      const req = mockRequest({ params: { portfolioId, stockSymbol: 'AAPL' } });
      const res = mockResponse();
      const Portfolio = require('../../models/portfolio');
      (Portfolio.findById as jest.Mock).mockResolvedValue(null);
      await deleteStock(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Portfolio not found' });
    });

    it('deletes a stock and returns updated portfolio', async () => {
      const portfolioId = new Types.ObjectId().toHexString();
      const req = mockRequest({ params: { portfolioId, stockSymbol: 'AAPL' } });
      const res = mockResponse();
      const portfolioData = {
        _id: portfolioId,
        stocks: [
          { symbol: 'AAPL', quantity: 10 },
          { symbol: 'GOOGL', quantity: 5 },
        ],
        save: jest.fn().mockResolvedValue({ _id: portfolioId, stocks: [{ symbol: 'GOOGL', quantity: 5 }] }),
      };
      const Portfolio = require('../../models/portfolio');
      (Portfolio.findById as jest.Mock).mockResolvedValue(portfolioData);
      await deleteStock(req, res);
      expect(portfolioData.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(portfolioData);
    });
  });
});