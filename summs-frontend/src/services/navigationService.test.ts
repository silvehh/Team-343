import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  validateCoordinates,
  buildGoogleMapsUrl,
  buildAppleMapsUrl,
  buildNavigationUrl,
  navigateToStation,
  isApplePlatform,
} from './navigationService';

describe('navigationService', () => {
  describe('validateCoordinates', () => {
    it('returns valid for correct coordinates', () => {
      const result = validateCoordinates(45.515, -73.575);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('returns error for null latitude', () => {
      const result = validateCoordinates(null, -73.575);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Latitude is missing');
    });

    it('returns error for undefined latitude', () => {
      const result = validateCoordinates(undefined, -73.575);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Latitude is missing');
    });

    it('returns error for null longitude', () => {
      const result = validateCoordinates(45.515, null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Longitude is missing');
    });

    it('returns error for undefined longitude', () => {
      const result = validateCoordinates(45.515, undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Longitude is missing');
    });

    it('returns error for NaN latitude', () => {
      const result = validateCoordinates(NaN, -73.575);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Latitude is not a valid number');
    });

    it('returns error for NaN longitude', () => {
      const result = validateCoordinates(45.515, NaN);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Longitude is not a valid number');
    });

    it('returns error for latitude out of range (< -90)', () => {
      const result = validateCoordinates(-91, -73.575);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Latitude must be between -90 and 90');
    });

    it('returns error for latitude out of range (> 90)', () => {
      const result = validateCoordinates(91, -73.575);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Latitude must be between -90 and 90');
    });

    it('returns error for longitude out of range (< -180)', () => {
      const result = validateCoordinates(45.515, -181);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Longitude must be between -180 and 180');
    });

    it('returns error for longitude out of range (> 180)', () => {
      const result = validateCoordinates(45.515, 181);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Longitude must be between -180 and 180');
    });

    it('accepts boundary values', () => {
      expect(validateCoordinates(90, 180).valid).toBe(true);
      expect(validateCoordinates(-90, -180).valid).toBe(true);
      expect(validateCoordinates(0, 0).valid).toBe(true);
    });
  });

  describe('buildGoogleMapsUrl', () => {
    it('generates correct URL with coordinates only', () => {
      const result = buildGoogleMapsUrl({
        latitude: 45.515,
        longitude: -73.575,
      });

      expect(result.success).toBe(true);
      expect(result.url).toContain('https://www.google.com/maps/search/');
      expect(result.url).toContain('45.515');
      expect(result.url).toContain('-73.575');
    });

    it('generates correct URL with label', () => {
      const result = buildGoogleMapsUrl({
        latitude: 45.515,
        longitude: -73.575,
        label: 'Downtown Station',
      });

      expect(result.success).toBe(true);
      expect(result.url).toContain('Downtown%20Station');
      expect(result.url).toContain('center=45.515,-73.575');
    });

    it('encodes special characters in label', () => {
      const result = buildGoogleMapsUrl({
        latitude: 45.515,
        longitude: -73.575,
        label: 'Station #1 & Main',
      });

      expect(result.success).toBe(true);
      expect(result.url).toContain('Station%20%231%20%26%20Main');
    });

    it('returns error for invalid coordinates', () => {
      const result = buildGoogleMapsUrl({
        latitude: null,
        longitude: -73.575,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Latitude is missing');
      expect(result.url).toBeUndefined();
    });

    it('handles empty string label by using coordinates', () => {
      const result = buildGoogleMapsUrl({
        latitude: 45.515,
        longitude: -73.575,
        label: '',
      });

      expect(result.success).toBe(true);
      expect(result.url).toContain('query=45.515,-73.575');
    });
  });

  describe('buildAppleMapsUrl', () => {
    it('generates correct URL with coordinates only', () => {
      const result = buildAppleMapsUrl({
        latitude: 45.515,
        longitude: -73.575,
      });

      expect(result.success).toBe(true);
      expect(result.url).toContain('https://maps.apple.com/');
      expect(result.url).toContain('ll=45.515%2C-73.575');
    });

    it('generates correct URL with label', () => {
      const result = buildAppleMapsUrl({
        latitude: 45.515,
        longitude: -73.575,
        label: 'Downtown Station',
      });

      expect(result.success).toBe(true);
      expect(result.url).toContain('q=Downtown+Station');
    });

    it('returns error for invalid coordinates', () => {
      const result = buildAppleMapsUrl({
        latitude: 45.515,
        longitude: undefined,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Longitude is missing');
    });
  });

  describe('buildNavigationUrl', () => {
    it('uses Google Maps when provider is "google"', () => {
      const result = buildNavigationUrl(
        { latitude: 45.515, longitude: -73.575 },
        'google'
      );

      expect(result.success).toBe(true);
      expect(result.url).toContain('google.com/maps');
    });

    it('uses Apple Maps when provider is "apple"', () => {
      const result = buildNavigationUrl(
        { latitude: 45.515, longitude: -73.575 },
        'apple'
      );

      expect(result.success).toBe(true);
      expect(result.url).toContain('maps.apple.com');
    });
  });

  describe('isApplePlatform', () => {
    const originalNavigator = globalThis.navigator;

    afterEach(() => {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    });

    it('returns false when navigator is undefined', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      expect(isApplePlatform()).toBe(false);
    });
  });

  describe('navigateToStation', () => {
    const mockWindowOpen = vi.fn();

    beforeEach(() => {
      mockWindowOpen.mockReset();
      mockWindowOpen.mockReturnValue({} as Window);
      vi.stubGlobal('window', { open: mockWindowOpen });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('opens navigation URL in new tab', () => {
      const result = navigateToStation(
        { latitude: 45.515, longitude: -73.575, label: 'Test Station' },
        'google'
      );

      expect(result.success).toBe(true);
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('google.com/maps'),
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('returns error when coordinates are invalid', () => {
      const result = navigateToStation({
        latitude: null,
        longitude: -73.575,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Latitude is missing');
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('returns error when popup is blocked', () => {
      mockWindowOpen.mockReturnValue(null);

      const result = navigateToStation({
        latitude: 45.515,
        longitude: -73.575,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('popups are blocked');
      expect(result.url).toBeDefined(); // URL should still be provided
    });

    it('handles window.open throwing an error', () => {
      mockWindowOpen.mockImplementation(() => {
        throw new Error('Security error');
      });

      const result = navigateToStation({
        latitude: 45.515,
        longitude: -73.575,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Security error');
    });

    it('includes URL in result even on error', () => {
      mockWindowOpen.mockReturnValue(null);

      const result = navigateToStation({
        latitude: 45.515,
        longitude: -73.575,
        label: 'Test',
      });

      expect(result.url).toBeDefined();
      expect(result.url).toContain('45.515');
    });
  });
});
