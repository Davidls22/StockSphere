import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Alert from '../models/alert';
import { sendPushNotification } from '../services/notifications';
import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

const getAlerts = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const alerts = await Alert.find({ user: new Types.ObjectId(userId) });
    res.json(alerts);
  } catch (error) {
    console.error('Error in getAlerts:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ error: 'Server error' });
  }
};

const createAlert = async (req: Request, res: Response) => {
  try {
    const { userId, symbol, targetPrice, pushToken } = req.body;

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const alert = new Alert({ user: new Types.ObjectId(userId), symbol, targetPrice, pushToken });
    await alert.save();
    res.status(201).json(alert);
  } catch (error) {
    console.error('Error in createAlert:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteAlert = async (req: Request, res: Response) => {
  try {
    const alertId = req.params.alertId;

    if (!Types.ObjectId.isValid(alertId)) {
      return res.status(400).json({ error: 'Invalid alert ID' });
    }

    const alert = await Alert.findByIdAndDelete(alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.status(200).json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAlert:', error instanceof Error ? error.message : String(error));
    res.status(500).json({ error: 'Server error' });
  }
};

const checkAlerts = async (): Promise<void> => {
  try {
    const alerts = await Alert.find();

    for (const alert of alerts) {
      const currentPrice = await getCurrentStockPrice(alert.symbol);
      if (currentPrice >= alert.targetPrice) {
        await sendPushNotification(
          alert.pushToken,
          `Your stock ${alert.symbol} has reached the target price!`
        );
      }
    }
  } catch (error) {
    console.error('Failed to check alerts:', error instanceof Error ? error.message : String(error));
  }
};

const getCurrentStockPrice = async (symbol: string): Promise<number> => {
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    const data = response.data['Global Quote'];
    if (!data || !data['05. price']) {
      console.error(`Unexpected response data: ${JSON.stringify(response.data, null, 2)}`);
      throw new Error(`Unexpected response data structure for symbol ${symbol}`);
    }

    return parseFloat(data['05. price']);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Axios error fetching stock price for ${symbol}:`,
        error.response?.data || error.message
      );
    } else {
      console.error(`Failed to fetch stock price for ${symbol}:`, error instanceof Error ? error.message : String(error));
    }
    return 0;
  }
};

export { getAlerts, createAlert, deleteAlert, checkAlerts, getCurrentStockPrice };