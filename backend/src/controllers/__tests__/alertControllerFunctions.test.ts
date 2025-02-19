import axios from 'axios';
import { sendPushNotification } from '../../services/notifications';
import Alert from '../../models/alert';
import { checkAlerts, getCurrentStockPrice } from '../../controllers/alertController';

jest.mock('axios');
jest.mock('../../services/notifications', () => ({
  sendPushNotification: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../models/alert', () => {
  function FakeAlert(this: any, data: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue({ _id: 'alert1', ...data });
  }
  FakeAlert.find = jest.fn();
  return FakeAlert;
});

describe('Alert Controller Functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentStockPrice', () => {
    it('returns the current stock price when response is valid', async () => {
      const symbol = 'AAPL';
      const dummyResponse = { data: { 'Global Quote': { '05. price': '150.00' } } };
      (axios.get as jest.Mock).mockResolvedValue(dummyResponse);
      const price = await getCurrentStockPrice(symbol);
      expect(price).toBe(150);
    });
    it('returns 0 when response data is unexpected', async () => {
      const symbol = 'AAPL';
      const dummyResponse = { data: {} };
      (axios.get as jest.Mock).mockResolvedValue(dummyResponse);
      const price = await getCurrentStockPrice(symbol);
      expect(price).toBe(0);
    });
    it('returns 0 when axios call fails', async () => {
      const symbol = 'AAPL';
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));
      const price = await getCurrentStockPrice(symbol);
      expect(price).toBe(0);
    });
  });

  describe('checkAlerts', () => {
    it('sends push notification when current price exceeds target price', async () => {
      const dummyAlert = { _id: 'alert1', symbol: 'AAPL', targetPrice: 100, pushToken: 'token123' };
      (Alert.find as jest.Mock).mockResolvedValue([dummyAlert]);
      (axios.get as jest.Mock).mockResolvedValue({ data: { 'Global Quote': { '05. price': '150.00' } } });
      await checkAlerts();
      expect(sendPushNotification).toHaveBeenCalledWith(
        dummyAlert.pushToken,
        `Your stock ${dummyAlert.symbol} has reached the target price!`
      );
    });
    it('does not send notification when current price is below target price', async () => {
      const dummyAlert = { _id: 'alert1', symbol: 'AAPL', targetPrice: 200, pushToken: 'token123' };
      (Alert.find as jest.Mock).mockResolvedValue([dummyAlert]);
      (axios.get as jest.Mock).mockResolvedValue({ data: { 'Global Quote': { '05. price': '150.00' } } });
      await checkAlerts();
      expect(sendPushNotification).not.toHaveBeenCalled();
    });
  });
});