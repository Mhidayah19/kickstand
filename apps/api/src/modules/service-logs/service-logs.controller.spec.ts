import { Test, TestingModule } from '@nestjs/testing';
import { ServiceLogsController } from './service-logs.controller';
import { ServiceLogsService } from './service-logs.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

describe('ServiceLogsController', () => {
  let controller: ServiceLogsController;
  const mockService = {
    findAllByBike: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };
  const mockUser = { id: 'user-1', email: 'test@test.com' };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceLogsController],
      providers: [{ provide: ServiceLogsService, useValue: mockService }],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<ServiceLogsController>(ServiceLogsController);
  });

  describe('GET /bikes/:bikeId/services', () => {
    it('should return paginated service logs', async () => {
      const response = {
        data: [{ id: 'log-1' }],
        meta: { page: 1, limit: 20, total: 1 },
      };
      mockService.findAllByBike.mockResolvedValue(response);

      const result = await controller.findAll('bike-1', mockUser, {});
      expect(result).toEqual(response);
      expect(mockService.findAllByBike).toHaveBeenCalledWith(
        'bike-1',
        'user-1',
        1,
        20,
      );
    });

    it('should parse page and limit from query', async () => {
      mockService.findAllByBike.mockResolvedValue({
        data: [],
        meta: { page: 2, limit: 10, total: 0 },
      });
      await controller.findAll('bike-1', mockUser, { page: '2', limit: '10' });
      expect(mockService.findAllByBike).toHaveBeenCalledWith(
        'bike-1',
        'user-1',
        2,
        10,
      );
    });
  });

  describe('POST /bikes/:bikeId/services', () => {
    it('should create a service log', async () => {
      const dto = {
        serviceType: 'oil_change',
        description: 'Regular',
        cost: '45.00',
        mileageAt: 15000,
        date: '2026-03-15',
      };
      const log = { id: 'log-1', bikeId: 'bike-1', ...dto };
      mockService.create.mockResolvedValue(log);

      const result = await controller.create('bike-1', mockUser, dto);
      expect(result).toEqual(log);
      expect(mockService.create).toHaveBeenCalledWith('bike-1', 'user-1', dto);
    });
  });

  describe('DELETE /bikes/:bikeId/services/:id', () => {
    it('should delete a service log', async () => {
      mockService.remove.mockResolvedValue({ id: 'log-1' });

      const result = await controller.remove('bike-1', 'log-1', mockUser);
      expect(result).toEqual({ id: 'log-1' });
      expect(mockService.remove).toHaveBeenCalledWith(
        'log-1',
        'bike-1',
        'user-1',
      );
    });
  });
});
