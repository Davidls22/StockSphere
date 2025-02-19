import { Request, Response } from 'express';
import Watchlist from '../models/watchlist';
import Stock from '../models/stock';
import axios from 'axios';
import mongoose, { Types } from 'mongoose';

const createWatchlist = async (req: Request, res: Response) => {
  try {
    const { stockId, user } = req.body;
    console.log('Received stockId:', stockId); 
    console.log('Received user:', user); 

    let stock = await Stock.findOne({ symbol: stockId });
    if (!stock) {

      const stockDataResponse = await axios.get(`http://localhost:8080/stocks/${stockId}`);
      const stockData = stockDataResponse.data;
      stock = new Stock({ symbol: stockId, data: stockData });
      await stock.save();
    }

    let watchlist = await Watchlist.findOne({ user: new Types.ObjectId(user) });
    if (!watchlist) {
      watchlist = new Watchlist({ user: new Types.ObjectId(user), stocks: [stock._id] });
    } else {
      const stockObjectId = stock._id as Types.ObjectId; 
      if (!watchlist.stocks.includes(stockObjectId)) {
        watchlist.stocks.push(stockObjectId);
      }
    }

    await watchlist.save();
    console.log('Created or updated Watchlist:', watchlist);

    res.status(201).json(watchlist);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating watchlist:', error.message); 
      console.error(error.stack); 
    } else {
      console.error('Unexpected error:', error);
    }
    res.status(500).json({ error: 'Server error' });
  }
};

const getWatchlists = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      if (!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
  
      const watchlists = await Watchlist.find({ user: new Types.ObjectId(userId) })
        .populate({
          path: 'stocks',
          select: 'symbol companyName price priceChange priceChangePercentage daysRange weekRange marketCap volume history',
        });
      console.log('Retrieved Watchlists:', watchlists);
  
      if (!watchlists || watchlists.length === 0) {
        return res.status(404).json({ error: 'No watchlists found' });
      }
  
      res.json(watchlists);
    } catch (error) {
      console.error('Error fetching watchlists:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  const removeStockFromWatchlist = async (req: Request, res: Response) => {
    try {
      const { userId, stockId } = req.params;
      console.log(`Removing stock ${stockId} from user ${userId}'s watchlist`);
  
      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(stockId)) {
        return res.status(400).json({ error: 'Invalid user ID or stock ID' });
      }
  
      const watchlist = await Watchlist.findOneAndUpdate(
        { user: new Types.ObjectId(userId) },
        { $pull: { stocks: new Types.ObjectId(stockId) } },
        { new: true }
      ).populate('stocks');
  
      if (!watchlist) {
        return res.status(404).json({ error: 'Watchlist not found' });
      }
  
      console.log('Updated watchlist:', watchlist);
      res.json(watchlist);
    } catch (error) {
      console.error('Error removing stock from watchlist:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  

export { createWatchlist, getWatchlists, removeStockFromWatchlist };
