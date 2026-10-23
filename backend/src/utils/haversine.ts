import { Coordinates } from '../types';

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates the great-circle distance between two coordinates in kilometers using the Haversine formula.
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const lat1 = toRadians(coord1.lat);
  const lat2 = toRadians(coord2.lat);
  const deltaLat = toRadians(coord2.lat - coord1.lat);
  const deltaLng = toRadians(coord2.lng - coord1.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

/**
 * Estimates arrival time in minutes based on distance and average city driving speed.
 * Assumption: ~25 km/h average city speed in Chennai traffic + 5 min response preparation.
 */
export function estimateArrivalTimeMinutes(distanceKm: number): number {
  const averageSpeedKmH = 25;
  const transitMinutes = (distanceKm / averageSpeedKmH) * 60;
  const dispatchPreparationMinutes = 5;
  return Math.max(5, Math.round(transitMinutes + dispatchPreparationMinutes));
}
