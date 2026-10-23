import {
  User,
  MechanicProfile,
  AssistanceRequest,
  Coordinates,
} from '../types';

export class MockStore {
  private users: Map<string, User> = new Map();
  private mechanics: Map<string, MechanicProfile> = new Map();
  private requests: Map<string, AssistanceRequest> = new Map();

  constructor() {
    this.seed();
  }

  /**
   * Seed realistic sample data centered around Chennai, Tamil Nadu, India.
   * Central coordinates: lat 13.0827, lng 80.2707 (Chennai Central / Park Town)
   */
  public seed(): void {
    this.users.clear();
    this.mechanics.clear();
    this.requests.clear();

    // 1. Seed sample customers
    const customers: User[] = [
      {
        id: 'cust-001',
        name: 'Priya Sharma',
        phone: '+919884011223',
        role: 'customer',
        createdAt: new Date('2026-01-15T09:00:00Z'),
      },
      {
        id: 'cust-002',
        name: 'Anbu Selvan',
        phone: '+919884044556',
        role: 'customer',
        createdAt: new Date('2026-01-20T10:30:00Z'),
      },
      {
        id: 'cust-003',
        name: 'Arvind Krishnan',
        phone: '+919884077889',
        role: 'customer',
        createdAt: new Date('2026-02-01T14:15:00Z'),
      },
    ];

    for (const c of customers) {
      this.users.set(c.id, c);
    }

    // 2. Seed 5 realistic mechanics across major Chennai hubs
    const seedMechanics: Array<{ user: User; profile: MechanicProfile }> = [
      {
        user: {
          id: 'mech-001',
          name: 'Suresh Kumar',
          phone: '+919840123456',
          role: 'mechanic',
          createdAt: new Date('2025-11-10T08:00:00Z'),
        },
        profile: {
          userId: 'mech-001',
          vehicleTypeServed: ['TWO_WHEELER', 'FOUR_WHEELER'],
          supportedIssues: [
            'PUNCTURE',
            'BATTERY_JUMP',
            'ENGINE_BREAKDOWN',
            'GENERAL_MECHANICAL',
          ],
          isAvailable: true,
          // T. Nagar (~6.2 km from Chennai Central)
          currentLocation: { lat: 13.0418, lng: 80.2341 },
          rating: 4.8,
          experienceYears: 7,
          workshopName: 'Suresh Auto Care & Quick Fix, T. Nagar',
        },
      },
      {
        user: {
          id: 'mech-002',
          name: 'Ramesh Babu',
          phone: '+919840234567',
          role: 'mechanic',
          createdAt: new Date('2025-10-05T08:00:00Z'),
        },
        profile: {
          userId: 'mech-002',
          vehicleTypeServed: ['FOUR_WHEELER', 'COMMERCIAL'],
          supportedIssues: [
            'TOWING',
            'BATTERY_JUMP',
            'ENGINE_BREAKDOWN',
            'LOCKOUT',
            'GENERAL_MECHANICAL',
          ],
          isAvailable: true,
          // Guindy Industrial Estate (~11.0 km from Chennai Central)
          currentLocation: { lat: 13.0067, lng: 80.2026 },
          rating: 4.9,
          experienceYears: 12,
          workshopName: 'Ramesh Heavy Towing & Rescue, Guindy',
        },
      },
      {
        user: {
          id: 'mech-003',
          name: 'Karthik Raja',
          phone: '+919840345678',
          role: 'mechanic',
          createdAt: new Date('2025-12-01T08:00:00Z'),
        },
        profile: {
          userId: 'mech-003',
          vehicleTypeServed: ['TWO_WHEELER', 'FOUR_WHEELER'],
          supportedIssues: [
            'PUNCTURE',
            'BATTERY_JUMP',
            'FUEL_DELIVERY',
            'LOCKOUT',
            'GENERAL_MECHANICAL',
          ],
          isAvailable: true,
          // Anna Nagar (~6.5 km from Chennai Central)
          currentLocation: { lat: 13.085, lng: 80.2101 },
          rating: 4.7,
          experienceYears: 5,
          workshopName: 'Karthik Rapid Roadside Express, Anna Nagar',
        },
      },
      {
        user: {
          id: 'mech-004',
          name: "Vignesh 'Vicky' Selvam",
          phone: '+919840456789',
          role: 'mechanic',
          createdAt: new Date('2026-01-08T08:00:00Z'),
        },
        profile: {
          userId: 'mech-004',
          vehicleTypeServed: ['TWO_WHEELER', 'FOUR_WHEELER'],
          supportedIssues: [
            'PUNCTURE',
            'BATTERY_JUMP',
            'FUEL_DELIVERY',
            'GENERAL_MECHANICAL',
          ],
          isAvailable: true,
          // Adyar / Besant Nagar (~9.2 km from Chennai Central)
          currentLocation: { lat: 13.0012, lng: 80.2565 },
          rating: 4.6,
          experienceYears: 6,
          workshopName: 'Vicky Bike & Car Clinic, Adyar',
        },
      },
      {
        user: {
          id: 'mech-005',
          name: 'Praveen Kumar',
          phone: '+919840567890',
          role: 'mechanic',
          createdAt: new Date('2026-01-12T08:00:00Z'),
        },
        profile: {
          userId: 'mech-005',
          vehicleTypeServed: ['TWO_WHEELER'],
          supportedIssues: [
            'PUNCTURE',
            'BATTERY_JUMP',
            'FUEL_DELIVERY',
            'GENERAL_MECHANICAL',
          ],
          isAvailable: true,
          // Royapettah / Marina Beach (~2.8 km from Chennai Central)
          currentLocation: { lat: 13.0583, lng: 80.2642 },
          rating: 4.9,
          experienceYears: 8,
          workshopName: 'Praveen 2-Wheeler Rescue Hub, Royapettah',
        },
      },
    ];

    for (const { user, profile } of seedMechanics) {
      this.users.set(user.id, user);
      this.mechanics.set(profile.userId, profile);
    }
  }

  // --- User Operations ---
  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  // --- Mechanic Operations ---
  public getMechanicById(userId: string): MechanicProfile | undefined {
    return this.mechanics.get(userId);
  }

  public getAllMechanics(): MechanicProfile[] {
    return Array.from(this.mechanics.values());
  }

  public updateMechanic(
    userId: string,
    updates: Partial<MechanicProfile>
  ): MechanicProfile | undefined {
    const existing = this.mechanics.get(userId);
    if (!existing) return undefined;

    const updated = {
      ...existing,
      ...updates,
      currentLocation: updates.currentLocation ?? existing.currentLocation,
    };
    this.mechanics.set(userId, updated);
    return updated;
  }

  public updateMechanicLocation(
    userId: string,
    coords: Coordinates
  ): MechanicProfile | undefined {
    const existing = this.mechanics.get(userId);
    if (!existing) return undefined;

    existing.currentLocation = { ...coords };
    return existing;
  }

  // --- Assistance Request Operations ---
  public createRequest(request: AssistanceRequest): AssistanceRequest {
    this.requests.set(request.id, { ...request });
    return this.requests.get(request.id)!;
  }

  public getRequestById(id: string): AssistanceRequest | undefined {
    const req = this.requests.get(id);
    return req ? { ...req } : undefined;
  }

  public getAllRequests(): AssistanceRequest[] {
    return Array.from(this.requests.values()).map((r) => ({ ...r }));
  }

  public updateRequest(
    id: string,
    updates: Partial<AssistanceRequest>
  ): AssistanceRequest | undefined {
    const existing = this.requests.get(id);
    if (!existing) return undefined;

    const updated: AssistanceRequest = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.requests.set(id, updated);
    return { ...updated };
  }
}

// Singleton instance across the application
export const mockDb = new MockStore();
