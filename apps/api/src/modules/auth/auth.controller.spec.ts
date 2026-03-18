import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  describe('POST /auth/register', () => {
    it('should call authService.register and return result', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
      };
      const expected = {
        access_token: 'jwt',
        refresh_token: 'refresh',
        expires_in: 3600,
        user: { id: 'uuid-123', email: 'test@example.com', name: 'Test' },
      };
      mockAuthService.register.mockResolvedValue(expected);
      const result = await controller.register(dto);
      expect(result).toEqual(expected);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('POST /auth/login', () => {
    it('should call authService.login and return tokens + user', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const expected = {
        access_token: 'jwt',
        refresh_token: 'refresh',
        expires_in: 3600,
        user: { id: 'uuid-123', email: 'test@example.com' },
      };
      mockAuthService.login.mockResolvedValue(expected);
      const result = await controller.login(dto);
      expect(result).toEqual(expected);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should call authService.refresh and return new tokens', async () => {
      const dto = { refresh_token: 'old-refresh' };
      const expected = {
        access_token: 'new-jwt',
        refresh_token: 'new-refresh',
        expires_in: 3600,
      };
      mockAuthService.refresh.mockResolvedValue(expected);
      const result = await controller.refresh(dto);
      expect(result).toEqual(expected);
      expect(mockAuthService.refresh).toHaveBeenCalledWith(dto);
    });
  });
});
