/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PlacesClient } from './places.client';

describe('PlacesClient', () => {
  let client: PlacesClient;
  const fetchMock = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    global.fetch = fetchMock as unknown as typeof fetch;

    const mod = await Test.createTestingModule({
      providers: [
        PlacesClient,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'googlePlaces.apiKey' ? 'test-key' : undefined,
          },
        },
      ],
    }).compile();

    client = mod.get(PlacesClient);
  });

  describe('autocomplete', () => {
    it('returns suggestions filtered to workshop types with session token', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            suggestions: [
              {
                placePrediction: {
                  placeId: 'p-1',
                  structuredFormat: {
                    mainText: { text: 'Ah Seng Motor' },
                    secondaryText: { text: 'Blk 12 Geylang Lor 13, Singapore' },
                  },
                },
              },
            ],
          }),
      });

      const result = await client.autocomplete({
        query: 'ah seng',
        sessionToken: 'session-123',
      });

      expect(result).toEqual([
        {
          placeId: 'p-1',
          name: 'Ah Seng Motor',
          address: 'Blk 12 Geylang Lor 13, Singapore',
        },
      ]);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://places.googleapis.com/v1/places:autocomplete',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Goog-Api-Key': 'test-key',
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('"sessionToken":"session-123"'),
        }),
      );
      const body = JSON.parse(
        (fetchMock.mock.calls[0][1] as RequestInit).body as string,
      );
      expect(body.includedPrimaryTypes).toEqual(['car_repair']);
    });

    it('returns empty array when API returns no suggestions', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const result = await client.autocomplete({
        query: 'xyz',
        sessionToken: 'session-123',
      });

      expect(result).toEqual([]);
    });

    it('throws when API responds non-OK', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: () => Promise.resolve('quota exceeded'),
      });

      await expect(
        client.autocomplete({ query: 'ah seng', sessionToken: 's' }),
      ).rejects.toThrow(/Places autocomplete failed/);
    });
  });

  describe('getDetails', () => {
    it('returns normalized place details', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'p-1',
            displayName: { text: 'Ah Seng Motor' },
            formattedAddress: 'Blk 12 Geylang Lor 13, Singapore',
            location: { latitude: 1.3163, longitude: 103.888 },
            nationalPhoneNumber: '+65 6123 4567',
            regularOpeningHours: {
              weekdayDescriptions: ['Mon: 09:00–18:00', 'Tue: 09:00–18:00'],
            },
            rating: 4.3,
          }),
      });

      const result = await client.getDetails('p-1', 'session-123');

      expect(result).toEqual({
        placeId: 'p-1',
        name: 'Ah Seng Motor',
        address: 'Blk 12 Geylang Lor 13, Singapore',
        lat: 1.3163,
        lng: 103.888,
        phone: '+65 6123 4567',
        openingHours: 'Mon: 09:00–18:00\nTue: 09:00–18:00',
        rating: 4.3,
      });
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/v1/places/p-1'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-Goog-Api-Key': 'test-key',
            'X-Goog-FieldMask': expect.stringContaining('id'),
          }),
        }),
      );
    });

    it('tolerates missing optional fields', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'p-2',
            displayName: { text: 'Minimal Shop' },
            formattedAddress: '123 Somewhere',
            location: { latitude: 0, longitude: 0 },
          }),
      });

      const result = await client.getDetails('p-2', 's');

      expect(result.phone).toBeNull();
      expect(result.openingHours).toBeNull();
      expect(result.rating).toBeNull();
    });
  });
});
