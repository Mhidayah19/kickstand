/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BikesService } from './bikes.service';
import { DRIZZLE } from '../../database/database.module';
import { CreateBikeDto } from './dto/create-bike.dto';
import { BikeCatalogService } from '../bike-catalog/bike-catalog.service';
import { UpdateMileageDto } from './dto/update-mileage.dto';

const mockDb: any = {};
mockDb.insert = jest.fn(() => mockDb);
mockDb.values = jest.fn(() => mockDb);
mockDb.select = jest.fn(() => mockDb);
mockDb.from = jest.fn(() => mockDb);
mockDb.where = jest.fn(() => mockDb);
mockDb.set = jest.fn(() => mockDb);
mockDb.update = jest.fn(() => mockDb);
mockDb.delete = jest.fn(() => mockDb);
mockDb.returning = jest.fn();

describe('BikesService', () => {
  let service: BikesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BikesService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: BikeCatalogService, useValue: { findOneById: jest.fn() } },
      ],
    }).compile();

    service = module.get<BikesService>(BikesService);
  });

  describe('create', () => {
    it('should insert a bike and return it', async () => {
      const userId = 'user-uuid-1';
      const dto: CreateBikeDto = {
        model: 'Honda CB400X',
        year: 2022,
        plateNumber: 'SG1234A',
        class: '2A',
        currentMileage: 5000,
      };
      const createdBike = { id: 'bike-uuid-1', userId, ...dto };

      mockDb.returning.mockResolvedValue([createdBike]);

      const result = await service.create(userId, dto);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
      expect(result).toEqual(createdBike);
    });
  });

  describe('findAllByUser', () => {
    it('should return all bikes for a user', async () => {
      const userId = 'user-uuid-1';
      const bikes = [
        { id: 'bike-uuid-1', userId, model: 'Honda CB400X' },
        { id: 'bike-uuid-2', userId, model: 'Yamaha MT-07' },
      ];

      mockDb.where.mockResolvedValue(bikes);

      const result = await service.findAllByUser(userId);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(result).toEqual(bikes);
    });
  });

  describe('findOneByUser', () => {
    it('should return bike if it belongs to user', async () => {
      const bikeId = 'bike-uuid-1';
      const userId = 'user-uuid-1';
      const bike = { id: bikeId, userId, model: 'Honda CB400X' };

      mockDb.where.mockResolvedValue([bike]);

      const result = await service.findOneByUser(bikeId, userId);

      expect(result).toEqual(bike);
    });

    it('should throw NotFoundException if bike not found', async () => {
      const bikeId = 'nonexistent-bike';
      const userId = 'user-uuid-1';

      mockDb.where.mockResolvedValue([]);

      await expect(service.findOneByUser(bikeId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateMileage', () => {
    it('should throw BadRequestException when new mileage is lower than current', async () => {
      const bikeId = 'bike-uuid-1';
      const userId = 'user-uuid-1';
      const existingBike = {
        id: bikeId,
        userId,
        model: 'Honda CB400X',
        currentMileage: 10000,
      };
      const dto: UpdateMileageDto = { currentMileage: 5000 };

      // findOneByUser calls select().from().where() — use mockResolvedValueOnce
      mockDb.where.mockResolvedValueOnce([existingBike]);

      await expect(service.updateMileage(bikeId, userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update mileage when new value is higher than current', async () => {
      const bikeId = 'bike-uuid-1';
      const userId = 'user-uuid-1';
      const existingBike = {
        id: bikeId,
        userId,
        model: 'Honda CB400X',
        currentMileage: 10000,
      };
      const dto: UpdateMileageDto = { currentMileage: 15000 };
      const updatedBike = { ...existingBike, currentMileage: 15000 };

      // First call: findOneByUser → where resolves with existing bike (select terminal)
      mockDb.where.mockImplementationOnce(() =>
        Promise.resolve([existingBike]),
      );
      // Subsequent calls: where returns mockDb so the update chain can call .returning()
      mockDb.where.mockImplementation(() => mockDb);
      // update().set().where().returning() resolves with updatedBike
      mockDb.returning.mockResolvedValue([updatedBike]);

      const result = await service.updateMileage(bikeId, userId, dto);

      expect(result).toEqual(updatedBike);
    });
  });
});
