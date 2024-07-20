import express from 'express';
import { getStockData, getHistoricalData, getStockNews, getRealTimeData } from '../controllers/stockController';

const router = express.Router();

router.get('/stock/:symbol', getStockData);
router.get('/stock/historical/:symbol', getHistoricalData);
router.get('/stock/news/:symbol', getStockNews);
router.get('/stock/realtime/:symbol', getRealTimeData);

export default router;
