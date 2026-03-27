import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceLogsController } from './service-logs-user.controller';
import { ServiceLogsService } from './service-logs.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { DRIZZLE } from '../../database/database.module';

describe('UserServiceLogsController', () => {
  let controller: UserServiceLogsController;
  const mockService = { findAllByUser: jest.fn() };
  const mockUser = { id: 'user-1', email: 'test@test.com' };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserServiceLogsController],
      providers: [
        { provide: ServiceLogsService, useValue: mockService },
        { provide: DRIZZLE, useValue: {} },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<UserServiceLogsController>(
      UserServiceLogsController,
    );
  });

  describe('GET /service-logs', () => {
    it('should return paginated logs for the current user with default pagination', async () => {
      const response = {
        data: [{ id: 'log-1' }],
        meta: { page: 1, limit: 50, total: 1 },
      };
      mockService.findAllByUser.mockResolvedValue(response);

      const result = await controller.findAll(mockUser, {});
      expect(result).toEqual(response);
      expect(mockService.findAllByUser).toHaveBeenCalledWith('user-1', 1, 50);
    });

    it('should pass custom page and limit to service', async () => {
      mockService.findAllByUser.mockResolvedValue({
        data: [],
        meta: { page: 2, limit: 10, total: 0 },
      });
      await controller.findAll(mockUser, { page: 2, limit: 10 });
      expect(mockService.findAllByUser).toHaveBeenCalledWith('user-1', 2, 10);
    });
  });
});
