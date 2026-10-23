export type IssueId = 'flat-tyre' | 'battery-jumpstart' | 'engine-breakdown' | 'towing';

export interface IssueOption {
  id: IssueId;
  title: string;
  subtitle: string;
  iconName: 'CircleDot' | 'Zap' | 'Wrench' | 'Truck';
  estimatedMinutes: number;
  priceAddon: number;
  popular?: boolean;
}

export type VehicleId = '2-wheeler' | 'hatchback-sedan' | 'suv-commercial';

export interface VehicleOption {
  id: VehicleId;
  title: string;
  subtitle: string;
  badge: string;
  iconName: 'Bike' | 'Car' | 'Truck';
  baseMultiplier: number;
}

export interface UserLocation {
  address: string;
  cityArea: string;
  lat: number;
  lng: number;
  isAutoDetected: boolean;
  landmark?: string;
}

export interface MechanicInfo {
  name: string;
  phone: string;
  rating: number;
  jobsCompleted: number;
  vehiclePlate: string;
  currentDistanceKm: number;
  etaMinutes: number;
  photoUrl?: string;
}

export interface EmergencyState {
  status: 'idle' | 'searching' | 'mechanic_assigned' | 'in_progress';
  selectedIssue: IssueId;
  selectedVehicle: VehicleId;
  location: UserLocation;
  calloutFee: number;
  estimatedArrival: string;
  notes: string;
  dispatchedMechanic?: MechanicInfo;
  otpCode: string;
}

export interface MechanicJobAlert {
  id: string;
  customerName: string;
  customerRating: number;
  distanceKm: number;
  etaMinutes: number;
  issue: string;
  issueId: IssueId;
  vehicleModel: string;
  vehicleCategory: string;
  payoutAmount: number;
  pickupAddress: string;
  landmark: string;
  reportedAt: string;
  emergencyOtp: string;
}
