/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
  mockDb.innerJoin = jest.fn(() => mockDb);
  mockDb.update = jest.fn(() => mockDb);
  mockDb.set = jest.fn(() => mockDb);

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
      mockBikesService.findOneByUser.mockResolvedValue({
        id: 'bike-1',
        userId: 'user-1',
      });
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]); // count query
      mockDb.offset.mockResolvedValue([
        { id: 'log-1', serviceType: 'oil_change' },
      ]); // data query

      const result = await service.findAllByBike('bike-1', 'user-1', 1, 20);

      expect(mockBikesService.findOneByUser).toHaveBeenCalledWith(
        'bike-1',
        'user-1',
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
    });
  });

  describe('create', () => {
    it('should verify ownership then create log', async () => {
      mockBikesService.findOneByUser.mockResolvedValue({
        id: 'bike-1',
        userId: 'user-1',
      });
      const log = { id: 'log-1', bikeId: 'bike-1', serviceType: 'oil_change' };
      mockDb.returning.mockResolvedValue([log]);

      const result = await service.create('bike-1', 'user-1', {
        serviceType: 'oil_change',
        description: 'Regular',
        cost: '45.00',
        mileageAt: 15000,
        date: '2026-03-15',
      });

      expect(result).toEqual(log);
    });
  });

  describe('findAllByUser', () => {
    it('should return paginated logs across all bikes owned by user', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]);
      mockDb.offset.mockResolvedValue([
        { id: 'log-1', serviceType: 'oil_change', bikeId: 'bike-1' },
        { id: 'log-2', serviceType: 'chain_adjustment', bikeId: 'bike-2' },
      ]);

      const result = await service.findAllByUser('user-1', 1, 20);

      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 2 });
    });

    it('should apply pagination offset correctly', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 5 }]);
      mockDb.offset.mockResolvedValue([]);

      await service.findAllByUser('user-1', 2, 2);

      expect(mockDb.limit).toHaveBeenCalledWith(2);
      expect(mockDb.offset).toHaveBeenCalledWith(2); // offset = (2-1)*2 = 2
    });
  });

  describe('remove', () => {
    it('should verify ownership, find log, then delete', async () => {
      mockBikesService.findOneByUser.mockResolvedValue({
        id: 'bike-1',
        userId: 'user-1',
      });
      mockDb.where.mockResolvedValueOnce([{ id: 'log-1', bikeId: 'bike-1' }]); // find log
      mockDb.returning.mockResolvedValue([{ id: 'log-1' }]); // delete

      const result = await service.remove('log-1', 'bike-1', 'user-1');
      expect(result).toEqual({ id: 'log-1' });
    });

    it('should throw NotFoundException if log not found', async () => {
      mockBikesService.findOneByUser.mockResolvedValue({
        id: 'bike-1',
        userId: 'user-1',
      });
      mockDb.where.mockResolvedValueOnce([]); // log not found

      await expect(
        service.remove('log-999', 'bike-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should verify ownership then return the log', async () => {
      mockBikesService.findOneByUser.mockResolvedValue({
        id: 'bike-1',
        userId: 'user-1',
      });
      const log = { id: 'log-1', bikeId: 'bike-1', serviceType: 'oil_change' };
      mockDb.where.mockResolvedValueOnce([log]);

      const result = await service.findOne('log-1', 'bike-1', 'user-1');

      expect(mockBikesService.findOneByUser).toHaveBeenCalledWith(
        'bike-1',
        'user-1',
      );
      expect(result).toEqual(log);
    });

    it('should throw NotFoundException if log not found', async () => {
      mockBikesService.findOneByUser.mockResolvedValue({
        id: 'bike-1',
        userId: 'user-1',
      });
      mockDb.where.mockResolvedValueOnce([]);

      await expect(
        service.findOne('log-999', 'bike-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should verify ownership, check existence, then update', async () => {
      mockBikesService.findOneByUser.mockResolvedValue({
        id: 'bike-1',
        userId: 'user-1',
      });
      const existing = { id: 'log-1', bikeId: 'bike-1', cost: '45.00' };
      const updated = { ...existing, cost: '55.00' };
      mockDb.where.mockResolvedValueOnce([existing]); // existence check
      mockDb.returning.mockResolvedValue([updated]); // update result

      const result = await service.update('log-1', 'bike-1', 'user-1', {
        cost: '55.00',
      });

      expect(result).toEqual(updated);
      expect(mockBikesService.findOneByUser).toHaveBeenCalledWith(
        'bike-1',
        'user-1',
      );
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith({ cost: '55.00' });
    });

    it('should not pass undefined fields to set()', async () => {
      mockBikesService.findOneByUser.mockResolvedValue({
        id: 'bike-1',
        userId: 'user-1',
      });
      mockDb.where.mockResolvedValueOnce([{ id: 'log-1', bikeId: 'bike-1' }]);
      mockDb.returning.mockResolvedValue([{ id: 'log-1' }]);

      await service.update('log-1', 'bike-1', 'user-1', {
        cost: '55.00',
        description: undefined,
      });

      const setArg = (mockDb.set.mock.calls[0] as unknown[])[0];
      expect(setArg).not.toHaveProperty('description');
      expect(setArg).toEqual({ cost: '55.00' });
    });

    it('should throw NotFoundException if log not found', async () => {
      mockBikesService.findOneByUser.mockResolvedValue({
        id: 'bike-1',
        userId: 'user-1',
      });
      mockDb.where.mockResolvedValueOnce([]); // log not found

      await expect(
        service.update('log-999', 'bike-1', 'user-1', { cost: '55.00' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
