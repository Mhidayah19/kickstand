import { Test, TestingModule } from '@nestjs/testing';
import { WorkshopsController } from './workshops.controller';
import { WorkshopsService } from './workshops.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { DRIZZLE } from '../../database/database.module';
import { PlacesClient } from './places/places.client';

describe('WorkshopsController', () => {
  let controller: WorkshopsController;
  const mockWorkshopsService = {
    findNearby: jest.fn(),
    findOne: jest.fn(),
    compareByService: jest.fn(),
    searchPlaces: jest.fn(),
    upsertFromPlace: jest.fn(),
    createManual: jest.fn(),
    findMine: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkshopsController],
      providers: [
        { provide: WorkshopsService, useValue: mockWorkshopsService },
        { provide: DRIZZLE, useValue: {} },
        { provide: PlacesClient, useValue: {} },
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

  describe('GET /workshops/search', () => {
    it('parses numeric lat/lng and delegates to searchPlaces', async () => {
      const suggestions = [{ placeId: 'p-1', name: 'Ah Seng', address: '12' }];
      mockWorkshopsService.searchPlaces.mockResolvedValue(suggestions);

      const result = await controller.search({
        q: 'ah seng',
        lat: '1.35',
        lng: '103.81',
        sessionToken: '11111111-1111-1111-1111-111111111111',
      });

      expect(result).toEqual(suggestions);
      expect(mockWorkshopsService.searchPlaces).toHaveBeenCalledWith({
        query: 'ah seng',
        lat: 1.35,
        lng: 103.81,
        sessionToken: '11111111-1111-1111-1111-111111111111',
      });
    });

    it('omits lat/lng when not provided', async () => {
      mockWorkshopsService.searchPlaces.mockResolvedValue([]);
      await controller.search({
        q: 'ah',
        sessionToken: '11111111-1111-1111-1111-111111111111',
      });
      expect(mockWorkshopsService.searchPlaces).toHaveBeenCalledWith({
        query: 'ah',
        lat: undefined,
        lng: undefined,
        sessionToken: '11111111-1111-1111-1111-111111111111',
      });
    });
  });

  describe('GET /workshops/mine', () => {
    it('returns workshops from auth user service-log history', async () => {
      const workshops = [{ id: 'w-1', name: 'Ah Seng Motor' }];
      mockWorkshopsService.findMine.mockResolvedValue(workshops);

      const result = await controller.findMine({
        id: 'user-1',
        email: 'a@b.c',
      });

      expect(result).toEqual(workshops);
      expect(mockWorkshopsService.findMine).toHaveBeenCalledWith('user-1');
    });
  });

  describe('POST /workshops', () => {
    it('creates a manual workshop', async () => {
      const created = { id: 'w-new', name: 'Brand New' };
      mockWorkshopsService.createManual.mockResolvedValue(created);

      const result = await controller.createManual({
        name: 'Brand New',
        address: '123 Somewhere',
      });

      expect(result).toEqual(created);
      expect(mockWorkshopsService.createManual).toHaveBeenCalledWith({
        name: 'Brand New',
        address: '123 Somewhere',
      });
    });
  });

  describe('POST /workshops/upsert-from-place', () => {
    it('delegates to upsertFromPlace', async () => {
      const workshop = { id: 'w-1', googlePlaceId: 'p-1' };
      mockWorkshopsService.upsertFromPlace.mockResolvedValue(workshop);

      const result = await controller.upsertFromPlace({
        placeId: 'p-1',
        sessionToken: '11111111-1111-1111-1111-111111111111',
      });

      expect(result).toEqual(workshop);
      expect(mockWorkshopsService.upsertFromPlace).toHaveBeenCalledWith({
        placeId: 'p-1',
        sessionToken: '11111111-1111-1111-1111-111111111111',
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
