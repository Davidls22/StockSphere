import express from 'express';
import { getPortfolios, createPortfolio, getPortfolioAnalytics, deleteStock } from '../controllers/portfolioController';

const router = express.Router();

router.get('/', getPortfolios);
router.post('/', createPortfolio);
router.get('/analytics', getPortfolioAnalytics);
router.delete('/:portfolioId/stocks/:stockSymbol', deleteStock);


export default router;
