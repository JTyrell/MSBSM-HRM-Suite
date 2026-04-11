// Geofence validation utilities

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeoPolygon {
  type: string;
  coordinates: number[][][]; // GeoJSON format: [lng, lat] pairs
}

/**
 * Point-in-polygon algorithm using ray casting
 */
function isPointInPolygon(point: LatLng, polygon: number[][]): boolean {
  const x = point.lat;
  const y = point.lng;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Check if a point (lat, lng) is within a geofence
 * Supports both polygon (GeoJSON) and circular geofences
 */
export function isPointInGeofence(
  lat: number,
  lng: number,
  geofence: {
    polygon?: string | null;
    centerLat: number;
    centerLng: number;
    radius: number;
  }
): boolean {
  // If polygon exists, use polygon check
  if (geofence.polygon) {
    try {
      const geoJson = JSON.parse(geofence.polygon) as GeoPolygon;
      // GeoJSON coordinates are [lng, lat], convert to [lat, lng] for our check
      const polygon = geoJson.coordinates[0].map((coord) => [coord[1], coord[0]]);
      return isPointInPolygon({ lat, lng }, polygon);
    } catch {
      // Fallback to circular check if polygon is invalid
    }
  }

  // Fallback: circular geofence using Haversine distance
  return haversineDistance(lat, lng, geofence.centerLat, geofence.centerLng) <= geofence.radius;
}

/**
 * Calculate distance between two points using Haversine formula (meters)
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Create a regular polygon coordinates for a given center and radius
 * Returns GeoJSON format [lng, lat] pairs
 */
export function createCirclePolygon(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  sides: number = 32
): number[][] {
  const coords: number[][] = [];
  const R = 6371000;

  for (let i = 0; i <= sides; i++) {
    const angle = (2 * Math.PI * i) / sides;
    const dLat = (radiusMeters * Math.cos(angle)) / R;
    const dLng = (radiusMeters * Math.sin(angle)) / (R * Math.cos(toRad(centerLat)));

    coords.push([centerLng + toDeg(dLng), centerLat + toDeg(dLat)]);
  }

  return coords;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Get a human-readable distance string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
