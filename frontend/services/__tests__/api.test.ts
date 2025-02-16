jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  })),
}));

import axios from 'axios';
import {
  setAuthToken,
  loginUser,
  registerUser,
  fetchPortfolio,
  addToPortfolio,
  removeStockFromPortfolio,
  getWatchlist,
  addStockToWatchlist,
  removeStockFromWatchlist,
  getStockData,
  getStockNews,
  getStockHistoricalData,
} from '../api';

const mockInstance = (axios.create as jest.Mock).mock.results[0].value;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInstance.defaults.headers.common = {};
  });

  describe('setAuthToken', () => {
    it('should set the Authorization header when token is provided', () => {
      setAuthToken('mytoken');
      expect(mockInstance.defaults.headers.common['Authorization']).toBe('Bearer mytoken');
    });

    it('should remove the Authorization header when token is null', () => {
      setAuthToken('mytoken');
      expect(mockInstance.defaults.headers.common['Authorization']).toBe('Bearer mytoken');
      setAuthToken(null);
      expect(mockInstance.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('loginUser', () => {
    it('should call post with correct parameters and return data', async () => {
      const responseData = { token: 'abc123' };
      mockInstance.post.mockResolvedValue({ data: responseData });

      const result = await loginUser('user', 'pass');

      expect(mockInstance.post).toHaveBeenCalledWith('/auth/login', { username: 'user', password: 'pass' });
      expect(result).toEqual(responseData);
    });
  });

  describe('registerUser', () => {
    it('should call post with correct parameters and return data', async () => {
      const responseData = { message: 'User registered' };
      mockInstance.post.mockResolvedValue({ data: responseData });

      const result = await registerUser('newuser', 'newpass');

      expect(mockInstance.post).toHaveBeenCalledWith('/auth/register', { username: 'newuser', password: 'newpass' });
      expect(result).toEqual(responseData);
    });
  });

  describe('fetchPortfolio', () => {
    it('should call get with correct parameters and return data', async () => {
      const responseData = { portfolio: [] };
      mockInstance.get.mockResolvedValue({ data: responseData });

      const result = await fetchPortfolio('userId123');

      expect(mockInstance.get).toHaveBeenCalledWith(`/portfolios`, { params: { userId: 'userId123' } });
      expect(result).toEqual(responseData);
    });
  });

  describe('addToPortfolio', () => {
    it('should call post with correct parameters and return data', async () => {
      const responseData = { success: true };
      mockInstance.post.mockResolvedValue({ data: responseData });

      const result = await addToPortfolio('userId123', 'AAPL', 10);

      expect(mockInstance.post).toHaveBeenCalledWith('/portfolios', {
        userId: 'userId123',
        stocks: [{ symbol: 'AAPL', quantity: 10 }],
      });
      expect(result).toEqual(responseData);
    });
  });

  describe('removeStockFromPortfolio', () => {
    it('should call delete with correct URL and return data', async () => {
      const responseData = { success: true };
      mockInstance.delete.mockResolvedValue({ data: responseData });

      const result = await removeStockFromPortfolio('portfolio123', 'AAPL');

      expect(mockInstance.delete).toHaveBeenCalledWith(`/portfolios/portfolio123/stocks/AAPL`);
      expect(result).toEqual(responseData);
    });
  });

  describe('getWatchlist', () => {
    it('should call get with correct URL and return data', async () => {
      const responseData = { watchlist: [] };
      mockInstance.get.mockResolvedValue({ data: responseData });

      const result = await getWatchlist('user123');

      expect(mockInstance.get).toHaveBeenCalledWith(`/watchlist/watchlists/user123`);
      expect(result).toEqual(responseData);
    });
  });

  describe('addStockToWatchlist', () => {
    it('should call post with correct parameters and return data', async () => {
      const responseData = { success: true };
      mockInstance.post.mockResolvedValue({ data: responseData });

      const result = await addStockToWatchlist('stock123', 'user123');

      expect(mockInstance.post).toHaveBeenCalledWith(`/watchlist/watchlists`, { stockId: 'stock123', user: 'user123' });
      expect(result).toEqual(responseData);
    });
  });

  describe('removeStockFromWatchlist', () => {
    it('should call delete with correct URL and return data', async () => {
      const responseData = { success: true };
      mockInstance.delete.mockResolvedValue({ data: responseData });

      const result = await removeStockFromWatchlist('user123', 'stock123');

      expect(mockInstance.delete).toHaveBeenCalledWith(`/watchlist/watchlists/user123/stocks/stock123`);
      expect(result).toEqual(responseData);
    });
  });

  describe('getStockData', () => {
    it('should call get with correct URL and return data', async () => {
      const responseData = { data: 'stock data' };
      mockInstance.get.mockResolvedValue({ data: responseData });

      const result = await getStockData('AAPL');

      expect(mockInstance.get).toHaveBeenCalledWith(`/stocks/stock/AAPL`);
      expect(result).toEqual(responseData);
    });
  });

  describe('getStockNews', () => {
    it('should call get with correct URL and return data', async () => {
      const responseData = { news: [] };
      mockInstance.get.mockResolvedValue({ data: responseData });

      const result = await getStockNews('AAPL');

      expect(mockInstance.get).toHaveBeenCalledWith(`/stocks/stock/news/AAPL`);
      expect(result).toEqual(responseData);
    });
  });

  describe('getStockHistoricalData', () => {
    it('should call get with correct URL and return data', async () => {
      const responseData = { historical: [] };
      mockInstance.get.mockResolvedValue({ data: responseData });

      const result = await getStockHistoricalData('AAPL');

      expect(mockInstance.get).toHaveBeenCalledWith(`/stocks/stock/historical/AAPL`);
      expect(result).toEqual(responseData);
    });
  });
});