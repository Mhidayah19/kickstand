import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ServiceLogsService } from './service-logs.service';
import { BikesService } from '../bikes/bikes.service';
import { DRIZZLE } from '../../database/database.module';

describe('ServiceLogsService', () => {
  let service: ServiceLogsService;

  const mockDb: any = {};
  mockDb.insert = jest.fn(() => mockDb);
  mockDb.values = jest.fn(() => mockDb);
  mockDb.select = jest.fn(() => mockDb);
  mockDb.from = jest.fn(() => mockDb);
  mockDb.where = jest.fn(() => mockDb);
  mockDb.delete = jest.fn(() => mockDb);
  mockDb.returning = jest.fn();
  mockDb.orderBy = jest.fn(() => mockDb);
  mockDb.limit = jest.fn(() => mockDb);
  mockDb.offset = jest.fn();

  const mockBikesService = { findOneByUser: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceLogsService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: BikesService, useValue: mockBikesService },
      ],
    }).compile();
    service = module.get<ServiceLogsService>(ServiceLogsService);
  });

  describe('findAllByBike', () => {
    it('should verify bike ownership then return paginated logs', async () => {
      mockBikesService.findOneByUser.mockResolvedValue({ id: 'bike-1', userId: 'user-1' });
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]); // count query
      mockDb.offset.mockResolvedValue([{ id: 'log-1', serviceType: 'oil_change' }]); // data query

      const result = await service.findAllByBike('bike-1', 'user-1', 1, 20);

      expect(mockBikesService.findOneByUser).toHaveBeenCalledWith('bike-1', 'user-1');
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
    });
  });

  describe('create', () => {
    it('should verify ownership then create log', async () => {
      mockBikesService.findOneByUser.mockResolvedValue({ id: 'bike-1', userId: 'user-1' });
      const log = { id: 'log-1', bikeId: 'bike-1', serviceType: 'oil_change' };
      mockDb.returning.mockResolvedValue([log]);

      const result = await service.create('bike-1', 'user-1', {
        serviceType: 'oil_change', description: 'Regular', cost: '45.00', mileageAt: 15000, date: '2026-03-15',
      });

      expect(result).toEqual(log);
    });
  });

  describe('remove', () => {
    it('should verify ownership, find log, then delete', async () => {
      mockBikesService.findOneByUser.mockResolvedValue({ id: 'bike-1', userId: 'user-1' });
      mockDb.where.mockResolvedValueOnce([{ id: 'log-1', bikeId: 'bike-1' }]); // find log
      mockDb.returning.mockResolvedValue([{ id: 'log-1' }]); // delete

      const result = await service.remove('log-1', 'bike-1', 'user-1');
      expect(result).toEqual({ id: 'log-1' });
    });

    it('should throw NotFoundException if log not found', async () => {
      mockBikesService.findOneByUser.mockResolvedValue({ id: 'bike-1', userId: 'user-1' });
      mockDb.where.mockResolvedValueOnce([]); // log not found

      await expect(service.remove('log-999', 'bike-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
