export type UserRole = 'customer' | 'mechanic';

export type RequestStatus =
  | 'SEARCHING'
  | 'ACCEPTED'
  | 'IN_TRANSIT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type VehicleType =
  | 'TWO_WHEELER'
  | 'FOUR_WHEELER'
  | 'COMMERCIAL'
  | 'OTHER';

export type IssueType =
  | 'PUNCTURE'
  | 'BATTERY_JUMP'
  | 'TOWING'
  | 'ENGINE_BREAKDOWN'
  | 'FUEL_DELIVERY'
  | 'LOCKOUT'
  | 'GENERAL_MECHANICAL';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  createdAt: Date;
}

export interface MechanicProfile {
  userId: string;
  vehicleTypeServed: VehicleType[];
  supportedIssues?: IssueType[];
  isAvailable: boolean;
  currentLocation: Coordinates;
  rating: number; // e.g., 4.8 out of 5
  activeRequestId?: string | null;
  experienceYears?: number;
  workshopName?: string;
}

export interface AssistanceRequest {
  id: string;
  customerId: string;
  mechanicId: string | null;
  issueType: IssueType | string;
  vehicleType: VehicleType | string;
  status: RequestStatus;
  pickupLocation: Coordinates;
  baseFee: number;
  otp: string | null;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date | null;
  verifiedAt?: Date | null;
  completedAt?: Date | null;
  notes?: string;
}

export interface MechanicWithDistance extends MechanicProfile {
  user: User;
  distanceKm: number;
  estimatedArrivalMinutes: number;
}
