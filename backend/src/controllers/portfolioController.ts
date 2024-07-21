import { Request, Response } from 'express';
import Portfolio from '../models/portfolio';
import axios from 'axios';
import mongoose, { Types } from 'mongoose';

// Define the Stock interface
interface Stock {
  symbol: string;
  quantity: number;
  price?: number;
  date?: string;
}

// Function to fetch stock price
const fetchStockPrice = async (symbol: string): Promise<number | null> => {
    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: process.env.ALPHA_VANTAGE_API_KEY,
        },
      });
      console.log(`Response for symbol ${symbol}:`, response.data); // Add this log
      const stockData = response.data['Global Quote'];
      const currentPrice = parseFloat(stockData['05. price']);
      return isNaN(currentPrice) ? null : currentPrice;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return null;
    }
  };

// Function to get portfolios
const createPortfolio = async (req: Request, res: Response) => {
    try {
      const { userId, stocks }: { userId: string; stocks: Stock[] } = req.body;
      if (!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
  
      const updatedStocks = await Promise.all(stocks.map(async (stock: Stock) => {
        const currentPrice = await fetchStockPrice(stock.symbol);
        if (currentPrice === null) {
          throw new Error(`Failed to fetch price for ${stock.symbol}`);
        }
        return {
          ...stock,
          price: currentPrice,
          date: new Date().toISOString().split('T')[0], // Set to today's date
        };
      }));
  
      const portfolio = new Portfolio({ user: new Types.ObjectId(userId), stocks: updatedStocks });
      await portfolio.save();
      res.status(201).json(portfolio);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  const getPortfolios = async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId || req.body.userId;
      if (!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
  
      const portfolios = await Portfolio.find({ user: new Types.ObjectId(userId) }).populate('user', 'username');
      const updatedPortfolios = await Promise.all(portfolios.map(async (portfolio: any) => {
        const updatedStocks = await Promise.all(portfolio.stocks.map(async (stock: any) => {
          const currentPrice = await fetchStockPrice(stock.symbol);
          if (currentPrice === null) {
            throw new Error(`Failed to fetch price for ${stock.symbol}`);
          }
          return {
            ...stock.toObject(),
            price: currentPrice,
            date: new Date().toISOString().split('T')[0], // Update to today's date
          };
        }));
        portfolio.stocks = updatedStocks;
        await portfolio.save();
        return portfolio;
      }));
  
      res.json(updatedPortfolios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  

// Function to get portfolio analytics
const getPortfolioAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId || req.body.userId;
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const portfolios = await Portfolio.find({ user: new Types.ObjectId(userId) });
    let totalValue = 0;
    for (const portfolio of portfolios) {
      for (const stock of portfolio.stocks) {
        const currentPrice = await fetchStockPrice(stock.symbol);
        if (currentPrice !== null) {
          totalValue += currentPrice * stock.quantity;
        }
      }
    }
    res.json({ totalValue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteStock = async (req: Request, res: Response) => {
    try {
      const { portfolioId, stockSymbol } = req.params;
      if (!Types.ObjectId.isValid(portfolioId)) {
        return res.status(400).json({ error: 'Invalid portfolio ID' });
      }
  
      const portfolio = await Portfolio.findById(portfolioId);
      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }
  
      portfolio.stocks = portfolio.stocks.filter(stock => stock.symbol !== stockSymbol);
      await portfolio.save();
      res.json(portfolio);
    } catch (error) {
      console.error('Failed to delete stock from portfolio:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  

export { getPortfolios, createPortfolio, getPortfolioAnalytics, deleteStock };
