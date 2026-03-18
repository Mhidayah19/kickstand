const Expo = jest.fn().mockImplementation(() => ({
  isExpoPushToken: jest.fn().mockReturnValue(true),
  chunkPushNotifications: jest.fn((msgs) => [msgs]),
  sendPushNotificationsAsync: jest.fn().mockResolvedValue([]),
}));

Expo.isExpoPushToken = jest.fn().mockReturnValue(true);

module.exports = { Expo };
