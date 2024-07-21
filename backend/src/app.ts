import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import stockRoutes from './routes/stockRoutes';
import authRoutes from './routes/authRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import watchlistRoutes from './routes/watchlistRoutes';
import alertRoutes from './routes/alertRoutes';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cron from 'node-cron';
import { checkAlerts } from './controllers/alertController'


dotenv.config();

const app = express();

cron.schedule('* * * * *', () => {
    checkAlerts();
  });

connectDB().then(() => console.log('Database connected')).catch(err => console.error('Database connection error:', err));


app.use(cors());
app.use(express.json());
app.use(morgan('combined'));


app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertRoutes);

export default app;



