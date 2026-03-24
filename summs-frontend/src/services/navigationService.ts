/**
 * Navigation Service
 * 
 * Provides utilities for generating deep links/URLs to external navigation services.
 * Supports Google Maps (universal) and Apple Maps (macOS/iOS).
 * 
 * This service does NOT store any routing data - it only generates redirect URLs.
 */

export interface NavigationParams {
  latitude: number | undefined | null;
  longitude: number | undefined | null;
  label?: string;
}

export interface NavigationResult {
  success: boolean;
  url?: string;
  error?: string;
}

export type NavigationProvider = 'google' | 'apple' | 'auto';

/**
 * Detects if the current platform is Apple (macOS or iOS)
 */
export function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();
  
  // Check for iOS devices
  const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
    (platform === 'macintel' && navigator.maxTouchPoints > 1); // iPad with desktop mode
  
  // Check for macOS
  const isMacOS = platform.includes('mac');
  
  return isIOS || isMacOS;
}

/**
 * Validates that coordinates are valid numbers within acceptable ranges
 */
export function validateCoordinates(
  latitude: number | undefined | null,
  longitude: number | undefined | null
): { valid: boolean; error?: string } {
  if (latitude === undefined || latitude === null) {
    return { valid: false, error: 'Latitude is missing' };
  }
  
  if (longitude === undefined || longitude === null) {
    return { valid: false, error: 'Longitude is missing' };
  }
  
  if (typeof latitude !== 'number' || isNaN(latitude)) {
    return { valid: false, error: 'Latitude is not a valid number' };
  }
  
  if (typeof longitude !== 'number' || isNaN(longitude)) {
    return { valid: false, error: 'Longitude is not a valid number' };
  }
  
  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }
  
  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  return { valid: true };
}

/**
 * Generates a Google Maps URL for navigation to the specified coordinates
 * @see https://developers.google.com/maps/documentation/urls/get-started
 */
export function buildGoogleMapsUrl(params: NavigationParams): NavigationResult {
  const validation = validateCoordinates(params.latitude, params.longitude);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  const lat = params.latitude as number;
  const lng = params.longitude as number;
  
  // Use the Google Maps search URL with coordinates and optional label
  // This format works universally (web, Android, iOS with Google Maps app)
  const baseUrl = 'https://www.google.com/maps/search/?api=1';
  const query = params.label 
    ? `${encodeURIComponent(params.label)}` 
    : `${lat},${lng}`;
  
  const url = `${baseUrl}&query=${query}&query_place_id=&center=${lat},${lng}`;
  
  return { success: true, url };
}

/**
 * Generates an Apple Maps URL for navigation to the specified coordinates
 * @see https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html
 */
export function buildAppleMapsUrl(params: NavigationParams): NavigationResult {
  const validation = validateCoordinates(params.latitude, params.longitude);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  const lat = params.latitude as number;
  const lng = params.longitude as number;
  
  // Apple Maps URL scheme
  // ll = latitude,longitude for the map center
  // q = label/query for the pin
  const baseUrl = 'https://maps.apple.com/';
  const queryParams = new URLSearchParams({
    ll: `${lat},${lng}`,
    q: params.label || `${lat},${lng}`,
  });
  
  const url = `${baseUrl}?${queryParams.toString()}`;
  
  return { success: true, url };
}

/**
 * Builds a navigation URL based on the specified provider or auto-detects the best option
 */
export function buildNavigationUrl(
  params: NavigationParams,
  provider: NavigationProvider = 'auto'
): NavigationResult {
  // Determine which provider to use
  let selectedProvider: 'google' | 'apple';
  
  if (provider === 'auto') {
    selectedProvider = isApplePlatform() ? 'apple' : 'google';
  } else {
    selectedProvider = provider;
  }
  
  // Build URL for the selected provider
  if (selectedProvider === 'apple') {
    return buildAppleMapsUrl(params);
  }
  
  return buildGoogleMapsUrl(params);
}

/**
 * Opens external navigation to the specified coordinates
 * Opens in a new tab/window to preserve app state
 * 
 * @returns NavigationResult with success status and any error message
 */
export function navigateToStation(
  params: NavigationParams,
  provider: NavigationProvider = 'auto'
): NavigationResult {
  const result = buildNavigationUrl(params, provider);
  
  if (!result.success || !result.url) {
    return result;
  }
  
  try {
    // Open in new tab to preserve app state
    // noopener for security, noreferrer for privacy
    const newWindow = window.open(result.url, '_blank', 'noopener,noreferrer');
    
    if (!newWindow) {
      return { 
        success: false, 
        error: 'Unable to open navigation. Please check if popups are blocked.',
        url: result.url 
      };
    }
    
    return { success: true, url: result.url };
  } catch (err) {
    return { 
      success: false, 
      error: `Failed to open navigation: ${err instanceof Error ? err.message : 'Unknown error'}`,
      url: result.url
    };
  }
}
