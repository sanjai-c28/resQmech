import { VehicleType, IssueType } from '../types';

const VEHICLE_BASE_PRICES: Record<string, number> = {
  TWO_WHEELER: 199,
  FOUR_WHEELER: 449,
  COMMERCIAL: 899,
  OTHER: 399,
};

const ISSUE_SURCHARGES: Record<string, number> = {
  PUNCTURE: 150,
  BATTERY_JUMP: 250,
  FUEL_DELIVERY: 200,
  LOCKOUT: 300,
  ENGINE_BREAKDOWN: 500,
  TOWING: 850,
  GENERAL_MECHANICAL: 350,
};

/**
 * Calculates base fee for an assistance request based on vehicle and issue type.
 */
export function calculateBaseFee(
  vehicleType: VehicleType | string,
  issueType: IssueType | string
): number {
  const normalizedVehicle = vehicleType.toUpperCase();
  const normalizedIssue = issueType.toUpperCase();

  const vehicleBase = VEHICLE_BASE_PRICES[normalizedVehicle] ?? 350;
  const issueSurcharge = ISSUE_SURCHARGES[normalizedIssue] ?? 250;

  return vehicleBase + issueSurcharge;
}
