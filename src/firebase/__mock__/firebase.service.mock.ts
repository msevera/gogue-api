export const FirebaseServiceMock = jest.fn().mockReturnValue({
  getUser: jest.fn().mockResolvedValue({}),
});
