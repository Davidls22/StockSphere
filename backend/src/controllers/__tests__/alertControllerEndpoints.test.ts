import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { getAlerts, createAlert, deleteAlert } from '../../controllers/alertController';

const mockRequest = (data: Partial<Request>) => data as Request;
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

jest.mock('../../models/alert', () => {
    function FakeAlert(this: any, data: any) {
      Object.assign(this, data);
      this._id = 'alert1';
    }
    FakeAlert.prototype.save = jest.fn().mockImplementation(function (this: any) {
      return Promise.resolve(Object.assign({}, { _id: 'alert1' }, this));
    });
    FakeAlert.find = jest.fn();
    FakeAlert.findByIdAndDelete = jest.fn();
    return FakeAlert;
  });

describe('Alert Controller Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAlerts', () => {
    it('returns 400 if userId is invalid', async () => {
      const req = mockRequest({ params: { userId: 'invalidId' } });
      const res = mockResponse();
      await getAlerts(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
    });
    it('returns alerts for a valid userId', async () => {
      const validUserId = new Types.ObjectId().toHexString();
      const req = mockRequest({ params: { userId: validUserId } });
      const res = mockResponse();
      const dummyAlerts = [{ _id: 'alert1', user: validUserId, symbol: 'AAPL' }];
      const Alert = require('../../models/alert');
      (Alert.find as jest.Mock).mockResolvedValue(dummyAlerts);
      await getAlerts(req, res);
      expect(Alert.find).toHaveBeenCalledWith({ user: new Types.ObjectId(validUserId) });
      expect(res.json).toHaveBeenCalledWith(dummyAlerts);
    });
    it('returns 500 on error', async () => {
      const validUserId = new Types.ObjectId().toHexString();
      const req = mockRequest({ params: { userId: validUserId } });
      const res = mockResponse();
      const Alert = require('../../models/alert');
      (Alert.find as jest.Mock).mockRejectedValue(new Error('DB error'));
      await getAlerts(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('createAlert', () => {
    it('returns 400 if userId is invalid', async () => {
      const req = mockRequest({ body: { userId: 'badId', symbol: 'AAPL', targetPrice: 150, pushToken: 'token123' } });
      const res = mockResponse();
      await createAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid user ID' });
    });
    it('creates an alert and returns 201', async () => {
      const validUserId = new Types.ObjectId().toHexString();
      const reqBody = { userId: validUserId, symbol: 'AAPL', targetPrice: 150, pushToken: 'token123' };
      const req = mockRequest({ body: reqBody });
      const res = mockResponse();
      const dummyAlert = { _id: 'alert1', user: new Types.ObjectId(validUserId), symbol: 'AAPL', targetPrice: 150, pushToken: 'token123' };
      const Alert = require('../../models/alert');
      (Alert.prototype.save as jest.Mock) = jest.fn().mockResolvedValue(dummyAlert);
      await createAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect((res.json as jest.Mock).mock.calls[0][0]).toMatchObject(dummyAlert);
    });
    it('returns 500 on error during alert creation', async () => {
      const validUserId = new Types.ObjectId().toHexString();
      const reqBody = { userId: validUserId, symbol: 'AAPL', targetPrice: 150, pushToken: 'token123' };
      const req = mockRequest({ body: reqBody });
      const res = mockResponse();
      const Alert = require('../../models/alert');
      (Alert.prototype.save as jest.Mock) = jest.fn().mockRejectedValue(new Error('Save error'));
      await createAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });

  describe('deleteAlert', () => {
    it('returns 400 if alertId is invalid', async () => {
      const req = mockRequest({ params: { alertId: 'badId' } });
      const res = mockResponse();
      await deleteAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid alert ID' });
    });
    it('deletes an alert and returns 200', async () => {
      const alertId = new Types.ObjectId().toHexString();
      const req = mockRequest({ params: { alertId } });
      const res = mockResponse();
      const dummyAlert = { _id: alertId };
      const Alert = require('../../models/alert');
      (Alert.findByIdAndDelete as jest.Mock).mockResolvedValue(dummyAlert);
      await deleteAlert(req, res);
      expect(Alert.findByIdAndDelete).toHaveBeenCalledWith(alertId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Alert deleted successfully' });
    });
    it('returns 404 if alert not found', async () => {
      const alertId = new Types.ObjectId().toHexString();
      const req = mockRequest({ params: { alertId } });
      const res = mockResponse();
      const Alert = require('../../models/alert');
      (Alert.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
      await deleteAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Alert not found' });
    });
    it('returns 500 on error during deletion', async () => {
      const alertId = new Types.ObjectId().toHexString();
      const req = mockRequest({ params: { alertId } });
      const res = mockResponse();
      const Alert = require('../../models/alert');
      (Alert.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error('Deletion error'));
      await deleteAlert(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
    });
  });
});