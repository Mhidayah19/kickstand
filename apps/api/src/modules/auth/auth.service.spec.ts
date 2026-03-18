import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { DRIZZLE } from '../../database/database.module';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

const mockSupabaseAuth = {
  admin: { createUser: jest.fn(), deleteUser: jest.fn() },
  signInWithPassword: jest.fn(),
  refreshSession: jest.fn(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ auth: mockSupabaseAuth }),
}));

describe('AuthService', () => {
  let service: AuthService;
  const mockDb = { insert: jest.fn() };

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      const config: Record<string, string> = {
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
        SUPABASE_JWT_SECRET: 'jwt-secret',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should create user in Supabase Auth, insert into users table, sign in, return tokens + user', async () => {
      mockSupabaseAuth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'uuid-123' } },
        error: null,
      });

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            { id: 'uuid-123', email: 'test@example.com', name: 'Test User' },
          ]),
        }),
      });

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
          },
          user: { id: 'uuid-123', email: 'test@example.com' },
        },
        error: null,
      });

      const result = await service.register(registerDto);

      expect(mockSupabaseAuth.admin.createUser).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
        email_confirm: true,
      });
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
      });
      expect(result).toMatchObject({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        user: { id: 'uuid-123', email: 'test@example.com' },
      });
    });

    it('should throw BadRequestException when Supabase Auth returns error', async () => {
      mockSupabaseAuth.admin.createUser.mockResolvedValue({
        data: null,
        error: { message: 'Email already registered' },
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should rollback (delete Supabase Auth user) if DB insert fails', async () => {
      mockSupabaseAuth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'uuid-123' } },
        error: null,
      });

      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error('DB error')),
        }),
      });

      mockSupabaseAuth.admin.deleteUser.mockResolvedValue({ error: null });

      await expect(service.register(registerDto)).rejects.toThrow(Error);

      expect(mockSupabaseAuth.admin.deleteUser).toHaveBeenCalledWith('uuid-123');
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return tokens AND user data on valid credentials', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: {
          session: {
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_in: 3600,
          },
          user: { id: 'uuid-123', email: 'test@example.com' },
        },
        error: null,
      });

      const result = await service.login(loginDto);

      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email: loginDto.email,
        password: loginDto.password,
      });
      expect(result).toMatchObject({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        user: { id: 'uuid-123', email: 'test@example.com' },
      });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    const refreshDto: RefreshDto = {
      refresh_token: 'valid-refresh-token',
    };

    it('should return new tokens on valid refresh token', async () => {
      mockSupabaseAuth.refreshSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            expires_in: 3600,
          },
        },
        error: null,
      });

      const result = await service.refresh(refreshDto);

      expect(mockSupabaseAuth.refreshSession).toHaveBeenCalledWith({
        refresh_token: refreshDto.refresh_token,
      });
      expect(result).toMatchObject({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
      });
    });

    it('should throw UnauthorizedException on invalid refresh token', async () => {
      mockSupabaseAuth.refreshSession.mockResolvedValue({
        data: null,
        error: { message: 'Invalid refresh token' },
      });

      await expect(service.refresh(refreshDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
