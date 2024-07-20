import { Request, Response } from 'express';
import Portfolio from '../models/portfolio';
import axios from 'axios';
import mongoose, { Types } from 'mongoose';

const getPortfolios = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId || req.body.userId;
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const portfolios = await Portfolio.find({ user: new Types.ObjectId(userId) }).populate('user', 'username');
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const createPortfolio = async (req: Request, res: Response) => {
  try {
    const { userId, stocks } = req.body;
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const portfolio = new Portfolio({ user: new Types.ObjectId(userId), stocks });
    await portfolio.save();
    res.status(201).json(portfolio);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

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
        const response = await axios.get('https://www.alphavantage.co/query', {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: stock.symbol,
            apikey: process.env.ALPHA_VANTAGE_API_KEY,
          },
        });
        const stockData = response.data['Global Quote'];
        const currentPrice = parseFloat(stockData['05. price']);
        totalValue += currentPrice * stock.quantity;
      }
    }
    res.json({ totalValue });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export { getPortfolios, createPortfolio, getPortfolioAnalytics };
