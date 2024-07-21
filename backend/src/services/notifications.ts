export async function sendPushNotification(expoPushToken: string, message: string): Promise<void> {
    try {
      const fetch = (await import('node-fetch')).default;
  
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: expoPushToken,
          sound: 'default',
          title: 'Stock Alert',
          body: message,
        }),
      });
  
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
  