import { Request, Response } from 'express';
import { Types } from 'mongoose';
import axios from 'axios';
import { getStockData, getRealTimeData, getHistoricalData, getStockNews } from '../../controllers/stockController';

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
  function FakeStock(this: any, data: any) {
    Object.assign(this, data);
    this._id = 'stock1';
  }
  FakeStock.prototype.save = jest.fn().mockImplementation(function (this: any) {
    return Promise.resolve({ _id: 'stock1', ...this });
  });
  return FakeStock;
});

process.env.ALPHA_VANTAGE_API_KEY = 'dummy';
process.env.NEWS_API_KEY = 'newsdummy';

describe('Stock Controller Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getStockData', () => {
    it('returns stock data and saves a new stock', async () => {
      const req = mockRequest({ params: { symbol: 'AAPL' } });
      const res = mockResponse();
      const fakeResponse = { data: { "Time Series (Daily)": { "2023-01-01": { "1. open": "100.00", "05. price": "150.00" } } } };
      (axios.get as jest.Mock).mockResolvedValue(fakeResponse);
      await getStockData(req, res);
      expect(axios.get).toHaveBeenCalledWith('https://www.alphavantage.co/query', {
        params: { function: 'TIME_SERIES_DAILY', symbol: 'AAPL', apikey: process.env.ALPHA_VANTAGE_API_KEY }
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'stock1', symbol: 'AAPL', data: fakeResponse.data }));
    });
    it('returns 500 on error', async () => {
      const req = mockRequest({ params: { symbol: 'AAPL' } });
      const res = mockResponse();
      (axios.get as jest.Mock).mockRejectedValue(new Error('Error'));
      await getStockData(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server error');
    });
  });

  describe('getRealTimeData', () => {
    it('returns real time data', async () => {
      const req = mockRequest({ params: { symbol: 'AAPL' } });
      const res = mockResponse();
      const fakeResponse = { data: { "Global Quote": { "05. price": "150.00" } } };
      (axios.get as jest.Mock).mockResolvedValue(fakeResponse);
      await getRealTimeData(req, res);
      expect(axios.get).toHaveBeenCalledWith('https://www.alphavantage.co/query', {
        params: { function: 'GLOBAL_QUOTE', symbol: 'AAPL', apikey: process.env.ALPHA_VANTAGE_API_KEY }
      });
      expect(res.json).toHaveBeenCalledWith(fakeResponse.data);
    });
    it('returns 500 on error', async () => {
      const req = mockRequest({ params: { symbol: 'AAPL' } });
      const res = mockResponse();
      (axios.get as jest.Mock).mockRejectedValue(new Error('Error'));
      await getRealTimeData(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Failed to fetch real-time data');
    });
  });

  describe('getHistoricalData', () => {
    it('returns historical data', async () => {
      const req = mockRequest({ params: { symbol: 'AAPL' } });
      const res = mockResponse();
      const fakeResponse = { data: { "Time Series (Daily Adjusted)": { "2023-01-01": { "1. open": "100.00", "05. price": "150.00" } } } };
      (axios.get as jest.Mock).mockResolvedValue(fakeResponse);
      await getHistoricalData(req, res);
      expect(axios.get).toHaveBeenCalledWith('https://www.alphavantage.co/query', {
        params: { function: 'TIME_SERIES_DAILY_ADJUSTED', symbol: 'AAPL', outputsize: 'full', apikey: process.env.ALPHA_VANTAGE_API_KEY }
      });
      expect(res.json).toHaveBeenCalledWith(fakeResponse.data);
    });
    it('returns 500 on error', async () => {
      const req = mockRequest({ params: { symbol: 'AAPL' } });
      const res = mockResponse();
      (axios.get as jest.Mock).mockRejectedValue(new Error('Error'));
      await getHistoricalData(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Failed to fetch historical data');
    });
  });

  describe('getStockNews', () => {
    it('returns stock news', async () => {
      const req = mockRequest({ params: { symbol: 'AAPL' } });
      const res = mockResponse();
      const articles = [{ title: 'News 1' }, { title: 'News 2' }];
      const fakeResponse = { data: { articles } };
      (axios.get as jest.Mock).mockResolvedValue(fakeResponse);
      await getStockNews(req, res);
      const expectedUrl = `https://newsapi.org/v2/everything?q=AAPL&apiKey=${process.env.NEWS_API_KEY}`;
      expect(axios.get).toHaveBeenCalledWith(expectedUrl);
      expect(res.json).toHaveBeenCalledWith(articles);
    });
    it('returns 500 on error', async () => {
      const req = mockRequest({ params: { symbol: 'AAPL' } });
      const res = mockResponse();
      (axios.get as jest.Mock).mockRejectedValue(new Error('Error'));
      await getStockNews(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Failed to fetch stock news');
    });
  });
});