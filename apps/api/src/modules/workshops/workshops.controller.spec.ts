import { Test, TestingModule } from '@nestjs/testing';
import { WorkshopsController } from './workshops.controller';
import { WorkshopsService } from './workshops.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

describe('WorkshopsController', () => {
  let controller: WorkshopsController;
  const mockWorkshopsService = {
    findNearby: jest.fn(),
    findOne: jest.fn(),
    compareByService: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkshopsController],
      providers: [
        { provide: WorkshopsService, useValue: mockWorkshopsService },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get<WorkshopsController>(WorkshopsController);
  });

  describe('GET /workshops', () => {
    it('should return nearby workshops', async () => {
      const workshops = [{ id: 'w-1', name: 'Ah Boy Motor', distance: 1.5 }];
      mockWorkshopsService.findNearby.mockResolvedValue(workshops);

      const result = await controller.findAll({
        lat: '1.3521',
        lng: '103.8198',
      });

      expect(result).toEqual(workshops);
      expect(mockWorkshopsService.findNearby).toHaveBeenCalledWith({
        lat: '1.3521',
        lng: '103.8198',
      });
    });
  });

  describe('GET /workshops/compare', () => {
    it('should return price comparison', async () => {
      const comparison = [
        { workshopName: 'Ah Boy Motor', priceMin: '30', priceMax: '50' },
      ];
      mockWorkshopsService.compareByService.mockResolvedValue(comparison);

      const result = await controller.compare({
        service_type: 'oil_change',
        bike_model: 'Honda CB400X',
      });

      expect(result).toEqual(comparison);
      expect(mockWorkshopsService.compareByService).toHaveBeenCalledWith(
        'oil_change',
        'Honda CB400X',
      );
    });
  });

  describe('GET /workshops/:id', () => {
    it('should return workshop details with services', async () => {
      const data = {
        workshop: { id: 'w-1', name: 'Ah Boy Motor' },
        services: [
          { serviceType: 'oil_change', priceMin: '30', priceMax: '50' },
        ],
      };
      mockWorkshopsService.findOne.mockResolvedValue(data);

      const result = await controller.findOne('w-1');

      expect(result).toEqual(data);
    });
  });
});
