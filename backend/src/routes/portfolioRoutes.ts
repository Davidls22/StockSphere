import express from 'express';
import { getPortfolios, createPortfolio, getPortfolioAnalytics } from '../controllers/portfolioController';

const router = express.Router();

router.get('/', getPortfolios);
router.post('/', createPortfolio);
router.get('/analytics', getPortfolioAnalytics);

export default router;
