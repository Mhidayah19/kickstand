/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { WorkshopsService } from './workshops.service';
import { DRIZZLE } from '../../database/database.module';
import { PlacesClient } from './places/places.client';

describe('WorkshopsService', () => {
  let service: WorkshopsService;

  const mockDb: any = {};
  mockDb.select = jest.fn(() => mockDb);
  mockDb.from = jest.fn(() => mockDb);
  mockDb.where = jest.fn(() => mockDb);
  mockDb.leftJoin = jest.fn(() => mockDb);
  mockDb.innerJoin = jest.fn(() => mockDb);
  mockDb.orderBy = jest.fn(() => mockDb);
  mockDb.execute = jest.fn();

  const mockPlacesClient: any = {
    autocomplete: jest.fn(),
    getDetails: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkshopsService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: PlacesClient, useValue: mockPlacesClient },
      ],
    }).compile();

    service = module.get<WorkshopsService>(WorkshopsService);
  });

  describe('findNearby', () => {
    it('should return workshops sorted by distance when lat/lng provided', async () => {
      const workshops = [
        { id: 'w-1', name: 'Ah Boy Motor', distance: 1.5 },
        { id: 'w-2', name: 'Ban Leong', distance: 3.2 },
      ];
      mockDb.execute.mockResolvedValue(workshops);

      const result = await service.findNearby({
        lat: '1.3521',
        lng: '103.8198',
        radius: '10',
      });

      expect(result).toEqual(workshops);
      expect(mockDb.execute).toHaveBeenCalled();
    });

    it('should return all workshops without distance when no lat/lng', async () => {
      const workshops = [
        { id: 'w-1', name: 'Ah Boy Motor' },
        { id: 'w-2', name: 'Ban Leong' },
      ];
      mockDb.from.mockResolvedValueOnce(workshops);

      const result = await service.findNearby({});

      expect(result).toEqual(workshops);
    });
  });

  describe('findOne', () => {
    it('should return workshop with its services', async () => {
      const workshop = { id: 'w-1', name: 'Ah Boy Motor' };
      const services = [
        {
          id: 'ws-1',
          serviceType: 'oil_change',
          priceMin: '30',
          priceMax: '50',
        },
      ];
      mockDb.where.mockResolvedValueOnce([workshop]);
      mockDb.where.mockResolvedValueOnce(services);

      const result = await service.findOne('w-1');

      expect(result).toHaveProperty('workshop');
      expect(result).toHaveProperty('services');
    });

    it('should throw NotFoundException if workshop not found', async () => {
      mockDb.where.mockResolvedValueOnce([]);

      await expect(service.findOne('w-999')).rejects.toThrow();
    });
  });

  describe('compareByService', () => {
    it('should return workshops with prices for a given service_type', async () => {
      const results = [
        { workshopName: 'Ah Boy Motor', priceMin: '30', priceMax: '50' },
      ];
      mockDb.where.mockResolvedValue(results);

      const result = await service.compareByService('oil_change', undefined);

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ workshopName: 'Ah Boy Motor' }),
        ]),
      );
    });

    it('should filter by bike_model when provided', async () => {
      const results = [
        {
          workshopName: 'Ah Boy Motor',
          priceMin: '30',
          priceMax: '50',
          bikeModel: 'CB400X',
        },
      ];
      mockDb.where.mockResolvedValue(results);

      const result = await service.compareByService('oil_change', 'CB400X');

      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            workshopName: 'Ah Boy Motor',
            bikeModel: 'CB400X',
          }),
        ]),
      );
    });
  });

  describe('flagVerificationStatus', () => {
    it('should flag services with last_verified older than 6 months as unverified', () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 7);

      const entry = { lastVerified: sixMonthsAgo.toISOString().split('T')[0] };
      const result = WorkshopsService.flagVerificationStatus(entry);

      expect(result.verified).toBe(false);
    });

    it('should flag recent services as verified', () => {
      const recent = new Date();
      recent.setMonth(recent.getMonth() - 1);

      const entry = { lastVerified: recent.toISOString().split('T')[0] };
      const result = WorkshopsService.flagVerificationStatus(entry);

      expect(result.verified).toBe(true);
    });
  });

  describe('searchPlaces', () => {
    it('delegates to PlacesClient.autocomplete and passes params through', async () => {
      const suggestions = [
        { placeId: 'p-1', name: 'Ah Seng Motor', address: '12 Geylang' },
      ];
      mockPlacesClient.autocomplete.mockResolvedValue(suggestions);

      const result = await service.searchPlaces({
        query: 'ah seng',
        lat: 1.3521,
        lng: 103.8198,
        sessionToken: 'tok-1',
      });

      expect(result).toEqual(suggestions);
      expect(mockPlacesClient.autocomplete).toHaveBeenCalledWith({
        query: 'ah seng',
        lat: 1.3521,
        lng: 103.8198,
        sessionToken: 'tok-1',
      });
    });
  });

  describe('upsertFromPlace', () => {
    it('returns the existing workshop when google_place_id already in DB', async () => {
      const existing = {
        id: 'w-1',
        googlePlaceId: 'p-1',
        name: 'Ah Seng Motor',
      };
      mockDb.where.mockResolvedValueOnce([existing]);

      const result = await service.upsertFromPlace({
        placeId: 'p-1',
        sessionToken: 'tok-1',
      });

      expect(result).toEqual(existing);
      expect(mockPlacesClient.getDetails).not.toHaveBeenCalled();
    });

    it('fetches details and inserts when not yet in DB', async () => {
      const details = {
        placeId: 'p-2',
        name: 'Mah Pte Ltd',
        address: 'Ubi Ave 1',
        lat: 1.33,
        lng: 103.89,
        phone: '+65 1111',
        openingHours: 'Mon-Fri 09:00-18:00',
        rating: 4.1,
      };
      const inserted = { id: 'w-2', googlePlaceId: 'p-2', ...details };

      mockDb.where.mockResolvedValueOnce([]);
      mockPlacesClient.getDetails.mockResolvedValue(details);
      mockDb.insert = jest.fn(() => mockDb);
      mockDb.values = jest.fn(() => mockDb);
      mockDb.returning = jest.fn().mockResolvedValue([inserted]);

      const result = await service.upsertFromPlace({
        placeId: 'p-2',
        sessionToken: 'tok-2',
      });

      expect(result).toEqual(inserted);
      expect(mockPlacesClient.getDetails).toHaveBeenCalledWith('p-2', 'tok-2');
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('createManual', () => {
    it('returns existing workshop when case-insensitive name + address match', async () => {
      const existing = {
        id: 'w-5',
        name: 'Ah Seng Motor',
        address: 'Blk 12 Geylang Lor 13',
        googlePlaceId: null,
      };
      mockDb.where.mockResolvedValueOnce([existing]);

      const result = await service.createManual({
        name: 'ah seng motor',
        address: 'Blk 12 Geylang Lor 13',
      });

      expect(result).toEqual(existing);
    });

    it('inserts a new workshop with null google_place_id when no match', async () => {
      const inserted = {
        id: 'w-6',
        name: 'Brand New Shop',
        address: null,
        googlePlaceId: null,
      };
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.insert = jest.fn(() => mockDb);
      mockDb.values = jest.fn(() => mockDb);
      mockDb.returning = jest.fn().mockResolvedValue([inserted]);

      const result = await service.createManual({ name: 'Brand New Shop' });

      expect(result).toEqual(inserted);
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('findMine', () => {
    it("returns workshops from the authenticated user's service logs", async () => {
      const userId = 'user-1';
      const workshops = [
        { id: 'w-1', name: 'Ah Seng Motor', address: '12 Geylang' },
        { id: 'w-2', name: 'Revology', address: '21 Kaki Bukit' },
      ];
      mockDb.execute.mockResolvedValue(workshops);

      const result = await service.findMine(userId);

      expect(result).toEqual(workshops);
      expect(mockDb.execute).toHaveBeenCalled();
    });
  });
});
