import { Test, TestingModule } from '@nestjs/testing';
import { BikeCatalogService } from './bike-catalog.service';
import { DRIZZLE } from '../../database/database.module';

describe('BikeCatalogService', () => {
  let service: BikeCatalogService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      selectDistinct: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BikeCatalogService,
        { provide: DRIZZLE, useValue: mockDb },
      ],
    }).compile();

    service = module.get<BikeCatalogService>(BikeCatalogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllMakes', () => {
    it('should return sorted unique makes', async () => {
      mockDb.orderBy.mockResolvedValue([
        { make: 'Aprilia' },
        { make: 'Honda' },
        { make: 'Yamaha' },
      ]);

      const result = await service.findAllMakes();
      expect(result).toEqual(['Aprilia', 'Honda', 'Yamaha']);
      expect(mockDb.selectDistinct).toHaveBeenCalled();
    });
  });

  describe('findModelsByMake', () => {
    it('should return catalog entries filtered by make', async () => {
      const mockEntries = [
        { id: '1', make: 'Honda', model: 'CB400X', engineCc: 399, bikeType: 'Adventure', licenseClass: '2A' },
      ];
      mockDb.orderBy.mockResolvedValue(mockEntries);

      const result = await service.findModelsByMake('Honda');
      expect(result).toEqual(mockEntries);
    });
  });

  describe('findOneById', () => {
    it('should return a single catalog entry', async () => {
      const mockEntry = { id: '1', make: 'Honda', model: 'CB400X', engineCc: 399, bikeType: 'Adventure', licenseClass: '2A' };
      mockDb.where.mockResolvedValue([mockEntry]);

      const result = await service.findOneById('1');
      expect(result).toEqual(mockEntry);
    });

    it('should throw NotFoundException for invalid id', async () => {
      mockDb.where.mockResolvedValue([]);

      await expect(service.findOneById('999')).rejects.toThrow('Catalog entry 999 not found');
    });
  });
});
