const mockSendPushNotificationsAsync = jest.fn();
const mockChunkPushNotifications = jest.fn((msgs) => [msgs]);
const mockIsExpoPushToken = jest.fn().mockReturnValue(true);

const Expo = jest.fn().mockImplementation(() => ({
  sendPushNotificationsAsync: mockSendPushNotificationsAsync,
  chunkPushNotifications: mockChunkPushNotifications,
}));
Expo.isExpoPushToken = mockIsExpoPushToken;

module.exports = {
  Expo,
  mockSendPushNotificationsAsync,
  mockIsExpoPushToken,
  mockChunkPushNotifications,
};
