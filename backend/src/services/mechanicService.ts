import { mockDb } from '../db/mockStore';
import {
  Coordinates,
  IssueType,
  MechanicWithDistance,
  VehicleType,
} from '../types';
import { calculateHaversineDistance, estimateArrivalTimeMinutes } from '../utils/haversine';
import { NotFoundError } from '../utils/errors';

export interface NearbyMechanicsFilter {
  lat: number;
  lng: number;
  radiusKm?: number;
  issueType?: IssueType | string;
  vehicleType?: VehicleType | string;
  availableOnly?: boolean;
}

export class MechanicService {
  /**
   * Find nearby mechanics sorted by Haversine distance ascending.
   */
  public findNearby(filter: NearbyMechanicsFilter): MechanicWithDistance[] {
    const {
      lat,
      lng,
      radiusKm = 15,
      issueType,
      vehicleType,
      availableOnly = true,
    } = filter;

    const userCoord: Coordinates = { lat, lng };
    const allProfiles = mockDb.getAllMechanics();
    const results: MechanicWithDistance[] = [];

    for (const profile of allProfiles) {
      if (availableOnly && !profile.isAvailable) {
        continue;
      }

      // Filter by vehicle type if specified
      if (vehicleType) {
        const matchesVehicle = profile.vehicleTypeServed.some(
          (v) => v.toUpperCase() === vehicleType.toUpperCase()
        );
        if (!matchesVehicle) {
          continue;
        }
      }

      // Filter by issue type if mechanic has defined supported issues
      if (issueType && profile.supportedIssues && profile.supportedIssues.length > 0) {
        const matchesIssue = profile.supportedIssues.some(
          (i) => i.toUpperCase() === issueType.toUpperCase()
        );
        if (!matchesIssue) {
          continue;
        }
      }

      const distanceKm = calculateHaversineDistance(userCoord, profile.currentLocation);

      if (distanceKm <= radiusKm) {
        const user = mockDb.getUserById(profile.userId);
        if (!user) continue;

        const eta = estimateArrivalTimeMinutes(distanceKm);

        results.push({
          ...profile,
          user,
          distanceKm,
          estimatedArrivalMinutes: eta,
        });
      }
    }

    // Sort ascending by Haversine distance
    results.sort((a, b) => a.distanceKm - b.distanceKm);

    return results;
  }

  /**
   * Update live GPS location of a mechanic.
   */
  public updateLocation(mechanicId: string, coords: Coordinates) {
    const mechanic = mockDb.getMechanicById(mechanicId);
    if (!mechanic) {
      throw new NotFoundError(`Mechanic with ID '${mechanicId}' not found`);
    }

    const updated = mockDb.updateMechanicLocation(mechanicId, coords);
    const user = mockDb.getUserById(mechanicId);

    return {
      mechanic: updated,
      user,
    };
  }

  /**
   * Get mechanic by ID
   */
  public getById(mechanicId: string) {
    const mechanic = mockDb.getMechanicById(mechanicId);
    if (!mechanic) {
      throw new NotFoundError(`Mechanic with ID '${mechanicId}' not found`);
    }
    const user = mockDb.getUserById(mechanicId);
    return { mechanic, user };
  }

  /**
   * List all mechanics
   */
  public listAll() {
    const all = mockDb.getAllMechanics();
    return all.map((m) => ({
      ...m,
      user: mockDb.getUserById(m.userId),
    }));
  }
}

export const mechanicService = new MechanicService();
