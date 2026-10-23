import crypto from 'crypto';
import { mockDb } from '../db/mockStore';
import {
  AssistanceRequest,
  Coordinates,
  IssueType,
  VehicleType,
} from '../types';
import { calculateBaseFee } from '../utils/feeCalculator';
import { generateFourDigitOtp } from '../utils/otp';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors';
import { mechanicService } from './mechanicService';

export interface CreateRequestInput {
  customerId?: string;
  pickupLocation: Coordinates;
  vehicleType: VehicleType | string;
  issueType: IssueType | string;
  notes?: string;
}

export class DispatchService {
  /**
   * Creates an assistance request, calculates base fee, and triggers dispatch to nearby mechanics.
   */
  public createRequest(input: CreateRequestInput) {
    const {
      customerId = 'cust-001', // Fallback to seeded customer if omitted
      pickupLocation,
      vehicleType,
      issueType,
      notes,
    } = input;

    // Verify customer exists or create guest customer
    let customer = mockDb.getUserById(customerId);
    if (!customer) {
      customer = mockDb.createUser({
        id: customerId,
        name: 'Guest Customer',
        phone: '+919999999999',
        role: 'customer',
        createdAt: new Date(),
      });
    }

    // Calculate base fee based on vehicle type and issue complexity
    const baseFee = calculateBaseFee(vehicleType, issueType);

    // Generate unique ID
    const requestId = `req-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;

    const newRequest: AssistanceRequest = {
      id: requestId,
      customerId: customer.id,
      mechanicId: null,
      issueType,
      vehicleType,
      status: 'SEARCHING',
      pickupLocation,
      baseFee,
      otp: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes,
    };

    mockDb.createRequest(newRequest);

    // Dispatch logic: query nearby eligible mechanics within 15 km
    const candidates = mechanicService.findNearby({
      lat: pickupLocation.lat,
      lng: pickupLocation.lng,
      radiusKm: 15,
      vehicleType,
      issueType,
      availableOnly: true,
    });

    return {
      request: newRequest,
      dispatchSummary: {
        totalEligibleMechanicsFound: candidates.length,
        candidateMechanics: candidates.map((c) => ({
          mechanicId: c.userId,
          name: c.user.name,
          phone: c.user.phone,
          distanceKm: c.distanceKm,
          estimatedArrivalMinutes: c.estimatedArrivalMinutes,
          rating: c.rating,
          workshopName: c.workshopName,
        })),
        nearestEtaMinutes: candidates.length > 0 ? candidates[0].estimatedArrivalMinutes : null,
      },
    };
  }

  /**
   * Mechanic accepts the booking: locks the request and generates a 4-digit verification OTP.
   */
  public acceptRequest(requestId: string, mechanicId: string) {
    const request = mockDb.getRequestById(requestId);
    if (!request) {
      throw new NotFoundError(`Assistance request '${requestId}' not found`);
    }

    // Lock check: Only allow acceptance if request is currently in SEARCHING state
    if (request.status !== 'SEARCHING') {
      throw new ConflictError(
        `Request cannot be accepted. Current status is '${request.status}' (already accepted or resolved).`
      );
    }

    // Verify mechanic exists and is currently available
    const mechanic = mockDb.getMechanicById(mechanicId);
    if (!mechanic) {
      throw new NotFoundError(`Mechanic '${mechanicId}' not found`);
    }

    if (!mechanic.isAvailable) {
      throw new ConflictError(
        `Mechanic '${mechanicId}' is currently busy or marked unavailable.`
      );
    }

    // Generate 4-digit verification OTP
    const otp = generateFourDigitOtp();

    // Lock request: update status, assign mechanic, record OTP
    const updatedRequest = mockDb.updateRequest(requestId, {
      mechanicId,
      status: 'ACCEPTED',
      otp,
      acceptedAt: new Date(),
    });

    // Mark mechanic as busy with active request
    mockDb.updateMechanic(mechanicId, {
      isAvailable: false,
      activeRequestId: requestId,
    });

    const mechanicUser = mockDb.getUserById(mechanicId);

    return {
      request: updatedRequest,
      mechanic: {
        id: mechanicId,
        name: mechanicUser?.name,
        phone: mechanicUser?.phone,
        rating: mechanic.rating,
        currentLocation: mechanic.currentLocation,
        workshopName: mechanic.workshopName,
      },
      verificationOtp: otp, // In a production app, OTP is sent to the customer app/SMS
      message: 'Request locked and accepted successfully. Share the OTP with the mechanic upon arrival.',
    };
  }

  /**
   * Completes handoff when mechanic arrives on scene.
   */
  public verifyOtp(requestId: string, inputOtp: string, mechanicId?: string) {
    const request = mockDb.getRequestById(requestId);
    if (!request) {
      throw new NotFoundError(`Assistance request '${requestId}' not found`);
    }

    // Validate request status
    if (request.status !== 'ACCEPTED' && request.status !== 'IN_TRANSIT') {
      throw new ConflictError(
        `Cannot verify OTP for request with status '${request.status}'. Status must be 'ACCEPTED' or 'IN_TRANSIT'.`
      );
    }

    // Check mechanic ownership if provided
    if (mechanicId && request.mechanicId !== mechanicId) {
      throw new BadRequestError(
        `Mechanic '${mechanicId}' is not the assigned technician for this request.`
      );
    }

    // Validate OTP
    if (!request.otp || request.otp.trim() !== inputOtp.trim()) {
      throw new BadRequestError('Invalid OTP verification code. Please check and retry.');
    }

    // Transition status to IN_PROGRESS (handoff completed)
    const updatedRequest = mockDb.updateRequest(requestId, {
      status: 'IN_PROGRESS',
      verifiedAt: new Date(),
    });

    return {
      request: updatedRequest,
      message: 'Handoff verified successfully. Mechanic has arrived on scene and assistance is IN_PROGRESS.',
    };
  }

  /**
   * Complete assistance when service work is finished.
   */
  public completeRequest(requestId: string) {
    const request = mockDb.getRequestById(requestId);
    if (!request) {
      throw new NotFoundError(`Assistance request '${requestId}' not found`);
    }

    if (request.status !== 'IN_PROGRESS' && request.status !== 'ACCEPTED') {
      throw new ConflictError(
        `Cannot complete request with current status '${request.status}'.`
      );
    }

    const updatedRequest = mockDb.updateRequest(requestId, {
      status: 'COMPLETED',
      completedAt: new Date(),
    });

    // Free the mechanic
    if (request.mechanicId) {
      mockDb.updateMechanic(request.mechanicId, {
        isAvailable: true,
        activeRequestId: null,
      });
    }

    return {
      request: updatedRequest,
      message: 'Assistance request successfully marked as COMPLETED.',
    };
  }

  /**
   * Cancel assistance request.
   */
  public cancelRequest(requestId: string, reason?: string) {
    const request = mockDb.getRequestById(requestId);
    if (!request) {
      throw new NotFoundError(`Assistance request '${requestId}' not found`);
    }

    if (request.status === 'COMPLETED' || request.status === 'CANCELLED') {
      throw new ConflictError(`Request is already '${request.status}'.`);
    }

    const updatedRequest = mockDb.updateRequest(requestId, {
      status: 'CANCELLED',
      notes: reason ? `${request.notes ? request.notes + ' | ' : ''}Cancellation reason: ${reason}` : request.notes,
    });

    // Free assigned mechanic if any
    if (request.mechanicId) {
      mockDb.updateMechanic(request.mechanicId, {
        isAvailable: true,
        activeRequestId: null,
      });
    }

    return {
      request: updatedRequest,
      message: 'Assistance request has been CANCELLED.',
    };
  }

  /**
   * Get request by ID
   */
  public getRequest(requestId: string) {
    const request = mockDb.getRequestById(requestId);
    if (!request) {
      throw new NotFoundError(`Assistance request '${requestId}' not found`);
    }

    const customer = mockDb.getUserById(request.customerId);
    const mechanic = request.mechanicId ? mockDb.getMechanicById(request.mechanicId) : null;
    const mechanicUser = request.mechanicId ? mockDb.getUserById(request.mechanicId) : null;

    return {
      request,
      customer,
      mechanic: mechanic
        ? {
            ...mechanic,
            user: mechanicUser,
          }
        : null,
    };
  }
}

export const dispatchService = new DispatchService();
