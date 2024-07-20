import { Request, Response } from 'express';
import Alert from '../models/alert';
import mongoose, { Types } from 'mongoose';

const getAlerts = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    console.log(`Fetching alerts for user: ${userId}`); 

    if (!Types.ObjectId.isValid(userId)) {
      console.log('Invalid user ID'); 
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const alerts = await Alert.find({ user: new Types.ObjectId(userId) });
    console.log('Fetched alerts:', alerts); 
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error); 
    res.status(500).json({ error: 'Server error' });
  }
};

const createAlert = async (req: Request, res: Response) => {
  try {
    const { userId, symbol, targetPrice } = req.body;
    console.log(`Creating alert for user: ${userId}, symbol: ${symbol}, targetPrice: ${targetPrice}`); 

    if (!Types.ObjectId.isValid(userId)) {
      console.log('Invalid user ID'); 
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const alert = new Alert({ user: new Types.ObjectId(userId), symbol, targetPrice });
    await alert.save();
    console.log('Created alert:', alert); 
    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error); 
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteAlert = async (req: Request, res: Response) => {
    try {
      const alertId = req.params.alertId;
      console.log(`Deleting alert: ${alertId}`); 
  
      if (!Types.ObjectId.isValid(alertId)) {
        console.log('Invalid alert ID'); 
        return res.status(400).json({ error: 'Invalid alert ID' });
      }
  
      const alert = await Alert.findByIdAndDelete(alertId);
      if (!alert) {
        console.log('Alert not found'); 
        return res.status(404).json({ error: 'Alert not found' });
      }
  
      console.log('Deleted alert:', alert); 
      res.status(200).json({ message: 'Alert deleted successfully' });
    } catch (error) {
      console.error('Error deleting alert:', error); 
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  export { getAlerts, createAlert, deleteAlert };
