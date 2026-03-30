import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { DRIZZLE } from '../../database/database.module';

describe('SupabaseAuthGuard', () => {
  let guard: SupabaseAuthGuard;
  let reflector: Reflector;

  const mockConfigService = {
    getOrThrow: jest.fn().mockReturnValue('https://test.supabase.co'),
  };
  const mockDb = { insert: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseAuthGuard,
        Reflector,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile();

    guard = module.get<SupabaseAuthGuard>(SupabaseAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow access when @Public() is set', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException when no token and not public', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ headers: {}, url: '/test' }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow('Missing authorization token');
  });
});
