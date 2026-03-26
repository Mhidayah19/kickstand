import { Test, TestingModule } from '@nestjs/testing';
import { BikeCatalogController } from './bike-catalog.controller';
import { BikeCatalogService } from './bike-catalog.service';

describe('BikeCatalogController', () => {
  let controller: BikeCatalogController;
  let service: BikeCatalogService;

  beforeEach(async () => {
    const mockService = {
      findAllMakes: jest.fn(),
      findModelsByMake: jest.fn(),
      findOneById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BikeCatalogController],
      providers: [{ provide: BikeCatalogService, useValue: mockService }],
    }).compile();

    controller = module.get<BikeCatalogController>(BikeCatalogController);
    service = module.get<BikeCatalogService>(BikeCatalogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMakes', () => {
    it('should return list of makes', async () => {
      const makes = ['Honda', 'Yamaha'];
      jest.spyOn(service, 'findAllMakes').mockResolvedValue(makes);
      expect(await controller.getMakes()).toEqual(makes);
    });
  });

  describe('getModels', () => {
    it('should return models filtered by make', async () => {
      const models = [
        {
          id: '1',
          make: 'Honda',
          model: 'CB400X',
          engineCc: 399,
          bikeType: 'Adventure',
          licenseClass: '2A',
        },
      ];
      jest.spyOn(service, 'findModelsByMake').mockResolvedValue(models as any);
      expect(await controller.getModels('Honda')).toEqual(models);
    });
  });

  describe('getOne', () => {
    it('should return a single catalog entry', async () => {
      const entry = {
        id: '1',
        make: 'Honda',
        model: 'CB400X',
        engineCc: 399,
        bikeType: 'Adventure',
        licenseClass: '2A',
      };
      jest.spyOn(service, 'findOneById').mockResolvedValue(entry as any);
      expect(await controller.getOne('1')).toEqual(entry);
    });
  });
});
