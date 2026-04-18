import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AutocompleteParams,
  PlaceDetails,
  PlacesAutocompleteSuggestion,
} from './places.types';

const BASE_URL = 'https://places.googleapis.com/v1';
const DETAILS_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'nationalPhoneNumber',
  'regularOpeningHours',
  'rating',
].join(',');

@Injectable()
export class PlacesClient {
  private readonly logger = new Logger(PlacesClient.name);

  constructor(private readonly config: ConfigService) {}

  async autocomplete(
    params: AutocompleteParams,
  ): Promise<PlacesAutocompleteSuggestion[]> {
    const apiKey = this.config.get<string>('googlePlaces.apiKey');
    if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY not configured');

    const body: Record<string, unknown> = {
      input: params.query,
      sessionToken: params.sessionToken,
      includedPrimaryTypes: ['car_repair'],
    };
    if (params.lat != null && params.lng != null) {
      body.locationBias = {
        circle: {
          center: { latitude: params.lat, longitude: params.lng },
          radius: 20000,
        },
      };
    }

    const res = await fetch(`${BASE_URL}/places:autocomplete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.warn(`Places autocomplete failed: ${res.status} ${text}`);
      throw new Error(`Places autocomplete failed: ${res.status}`);
    }

    const payload = (await res.json()) as {
      suggestions?: Array<{
        placePrediction?: {
          placeId: string;
          structuredFormat?: {
            mainText?: { text: string };
            secondaryText?: { text: string };
          };
        };
      }>;
    };

    return (payload.suggestions ?? [])
      .map((s) => s.placePrediction)
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => ({
        placeId: p.placeId,
        name: p.structuredFormat?.mainText?.text ?? '',
        address: p.structuredFormat?.secondaryText?.text ?? '',
      }));
  }

  async getDetails(
    placeId: string,
    sessionToken: string,
  ): Promise<PlaceDetails> {
    const apiKey = this.config.get<string>('googlePlaces.apiKey');
    if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY not configured');

    const url = `${BASE_URL}/places/${encodeURIComponent(placeId)}?sessionToken=${encodeURIComponent(sessionToken)}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': DETAILS_FIELD_MASK,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.warn(`Places details failed: ${res.status} ${text}`);
      throw new Error(`Places details failed: ${res.status}`);
    }

    const d = (await res.json()) as {
      id: string;
      displayName?: { text: string };
      formattedAddress?: string;
      location?: { latitude: number; longitude: number };
      nationalPhoneNumber?: string;
      regularOpeningHours?: { weekdayDescriptions?: string[] };
      rating?: number;
    };

    return {
      placeId: d.id,
      name: d.displayName?.text ?? '',
      address: d.formattedAddress ?? '',
      lat: d.location?.latitude ?? 0,
      lng: d.location?.longitude ?? 0,
      phone: d.nationalPhoneNumber ?? null,
      openingHours:
        d.regularOpeningHours?.weekdayDescriptions?.join('\n') ?? null,
      rating: d.rating ?? null,
    };
  }
}
