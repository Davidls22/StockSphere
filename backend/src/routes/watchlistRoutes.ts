import express from 'express';
import { getWatchlists, createWatchlist, removeStockFromWatchlist } from '../controllers/watchlistController';

const router = express.Router();


router.get('/watchlists/:userId', getWatchlists);
router.delete('/watchlists/:userId/stocks/:stockId', removeStockFromWatchlist);
router.post('/watchlists', createWatchlist);

export default router;
