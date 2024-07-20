import { Request, Response } from 'express';
import axios from 'axios';
import Stock from '../models/stock';


const getStockData = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol,
        apikey: process.env.ALPHA_VANTAGE_API_KEY,
      },
    });
    const data = response.data;
    const stock = new Stock({ symbol, data });
    await stock.save();

    res.json(stock);
  } catch (error) {
    res.status(500).send('Server error');
  }
};


const getRealTimeData = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: process.env.ALPHA_VANTAGE_API_KEY,
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Failed to fetch real-time data');
  }
};


const getHistoricalData = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_DAILY_ADJUSTED',
        symbol,
        outputsize: 'full',
        apikey: process.env.ALPHA_VANTAGE_API_KEY,
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Failed to fetch historical data');
  }
};


const getStockNews = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  try {
    const newsUrl = `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${process.env.NEWS_API_KEY}`;
    const response = await axios.get(newsUrl);
    res.json(response.data.articles);
  } catch (error) {
    res.status(500).send('Failed to fetch stock news');
  }
};

export { getStockData, getRealTimeData, getHistoricalData, getStockNews };
