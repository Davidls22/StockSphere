import { sendPushNotification } from "../notifications";
import fetch from 'node-fetch';

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('sendPushNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends a push notification successfully', async () => {
    const fakeResponseData = { success: true };
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve(fakeResponseData),
    });
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await sendPushNotification('ExpoPushToken[abc123]', 'Test message');
    expect(fetch).toHaveBeenCalledWith('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'ExpoPushToken[abc123]',
        sound: 'default',
        title: 'Stock Alert',
        body: 'Test message',
      }),
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(fakeResponseData);
    consoleLogSpy.mockRestore();
  });

  it('logs error when fetch fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (fetch as jest.Mock).mockRejectedValue(new Error('Fetch error'));
    await sendPushNotification('ExpoPushToken[abc123]', 'Test message');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending push notification:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });
});