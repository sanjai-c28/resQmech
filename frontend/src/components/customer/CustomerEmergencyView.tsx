'use client';

import React, { useState } from 'react';
import {
  MapPin,
  LocateFixed,
  CircleDot,
  Zap,
  Wrench,
  Truck,
  Bike,
  Car,
  ShieldAlert,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
  Phone,
  ShieldCheck,
  Radar,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import MapMock from '../MapMock';
import { IssueId, VehicleId, UserLocation, IssueOption, VehicleOption, MechanicInfo } from '@/types';
import { playTapSound, playSuccessChime } from '@/utils/sound';

const issueOptions: IssueOption[] = [
  {
    id: 'flat-tyre',
    title: 'Flat Tyre / Puncture',
    subtitle: 'Tube/tubeless repair or spare swap',
    iconName: 'CircleDot',
    estimatedMinutes: 10,
    priceAddon: 150,
    popular: true,
  },
  {
    id: 'battery-jumpstart',
    title: 'Battery Jumpstart',
    subtitle: '12V/24V booster jump & terminal check',
    iconName: 'Zap',
    estimatedMinutes: 8,
    priceAddon: 200,
  },
  {
    id: 'engine-breakdown',
    title: 'Engine Breakdown',
    subtitle: 'Overheating, coolant leak & diagnosis',
    iconName: 'Wrench',
    estimatedMinutes: 15,
    priceAddon: 300,
  },
  {
    id: 'towing',
    title: 'Towing Service',
    subtitle: 'Flatbed & wheel-lift safe tow',
    iconName: 'Truck',
    estimatedMinutes: 20,
    priceAddon: 700,
  },
];

const vehicleOptions: VehicleOption[] = [
  {
    id: '2-wheeler',
    title: '2-Wheeler',
    subtitle: 'Bikes & Scooters',
    badge: 'Fast Dispatch',
    iconName: 'Bike',
    baseMultiplier: 1.0,
  },
  {
    id: 'hatchback-sedan',
    title: 'Hatchback/Sedan',
    subtitle: 'Compact & Mid-size Cars',
    badge: 'Standard',
    iconName: 'Car',
    baseMultiplier: 1.25,
  },
  {
    id: 'suv-commercial',
    title: 'SUV/Commercial',
    subtitle: 'Heavy 4x4s, Pickups & Vans',
    badge: 'Heavy Duty',
    iconName: 'Truck',
    baseMultiplier: 1.5,
  },
];

interface CustomerEmergencyViewProps {
  onTriggerMechanicAlert?: (data: {
    issueTitle: string;
    vehicleTitle: string;
    payout: number;
    address: string;
    otp: string;
  }) => void;
  activeDispatchedMechanic?: MechanicInfo | null;
  emergencyOtp?: string;
  onResetEmergency?: () => void;
}

export default function CustomerEmergencyView({
  onTriggerMechanicAlert,
  activeDispatchedMechanic,
  emergencyOtp = '4829',
  onResetEmergency,
}: CustomerEmergencyViewProps) {
  // Screen state: 'idle' | 'searching' | 'assigned'
  const [screenState, setScreenState] = useState<'idle' | 'searching' | 'assigned'>(
    activeDispatchedMechanic ? 'assigned' : 'idle'
  );

  const [selectedIssue, setSelectedIssue] = useState<IssueId>('flat-tyre');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleId>('hatchback-sedan');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationInput, setLocationInput] = useState('Outer Ring Road, Near HSR Sector 2, Bengaluru');
  const [location, setLocation] = useState<UserLocation>({
    address: 'Outer Ring Road, Near HSR Sector 2, Bengaluru',
    cityArea: 'HSR Layout • Outer Ring Road',
    lat: 12.9121,
    lng: 77.6446,
    isAutoDetected: true,
    landmark: 'Opposite Agara Lake Overpass',
  });

  const [pinPos, setPinPos] = useState({ x: 50, y: 50 });
  const [etaTime, setEtaTime] = useState('8 - 12 mins');

  // Pricing calculations
  const baseCalloutFee = 199; // Explicitly required: ₹199 Callout Base Fee
  const currentIssue = issueOptions.find((i) => i.id === selectedIssue) || issueOptions[0];
  const currentVehicle = vehicleOptions.find((v) => v.id === selectedVehicle) || vehicleOptions[1];
  const estimatedServiceCost = Math.round(currentIssue.priceAddon * currentVehicle.baseMultiplier);
  const estimatedTotal = baseCalloutFee + estimatedServiceCost;

  // Auto detect location handler
  const handleAutoDetectLocation = () => {
    playTapSound();
    setIsDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingLocation(false);
          setLocation((prev) => ({
            ...prev,
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            isAutoDetected: true,
            address: 'GPS Verified: Outer Ring Road, Near HSR Sector 2',
          }));
        },
        () => {
          setTimeout(() => {
            setIsDetectingLocation(false);
            setLocation((prev) => ({
              ...prev,
              isAutoDetected: true,
              address: 'GPS Pin: Outer Ring Road, Near HSR Sector 2, Bengaluru',
            }));
          }, 800);
        },
        { timeout: 4000 }
      );
    } else {
      setTimeout(() => {
        setIsDetectingLocation(false);
      }, 700);
    }
  };

  const handlePinChange = (newPos: { x: number; y: number; address: string }) => {
    setPinPos({ x: newPos.x, y: newPos.y });
    setLocation((prev) => ({
      ...prev,
      address: newPos.address,
      cityArea: newPos.address.split(',')[1] || prev.cityArea,
      isAutoDetected: false,
    }));
  };

  const handleSaveManualLocation = () => {
    playTapSound();
    if (locationInput.trim()) {
      setLocation((prev) => ({
        ...prev,
        address: locationInput,
        cityArea: locationInput.split(',')[0],
        isAutoDetected: false,
      }));
    }
    setShowLocationModal(false);
  };

  const handleRequestEmergency = () => {
    playTapSound();
    setScreenState('searching');

    // Trigger Mechanic alert event so both screens are connected
    if (onTriggerMechanicAlert) {
      onTriggerMechanicAlert({
        issueTitle: currentIssue.title,
        vehicleTitle: currentVehicle.title,
        payout: Math.round(estimatedTotal * 0.82), // Mechanic gets 82% cut
        address: location.address,
        otp: emergencyOtp,
      });
    }
  };

  const handleCancelRequest = () => {
    playTapSound();
    setScreenState('idle');
    if (onResetEmergency) {
      onResetEmergency();
    }
  };

  const handleSimulateAccept = () => {
    playSuccessChime();
    setScreenState('assigned');
  };

  // Render issue icon dynamically
  const renderIssueIcon = (iconName: string, isSelected: boolean) => {
    const iconClass = `w-5 h-5 ${isSelected ? 'text-white' : 'text-orange-400'}`;
    switch (iconName) {
      case 'CircleDot':
        return <CircleDot className={iconClass} />;
      case 'Zap':
        return <Zap className={iconClass} />;
      case 'Wrench':
        return <Wrench className={iconClass} />;
      case 'Truck':
        return <Truck className={iconClass} />;
      default:
        return <CircleDot className={iconClass} />;
    }
  };

  // Render vehicle icon dynamically
  const renderVehicleIcon = (iconName: string, isSelected: boolean) => {
    const iconClass = `w-5 h-5 ${isSelected ? 'text-white' : 'text-cyan-400'}`;
    switch (iconName) {
      case 'Bike':
        return <Bike className={iconClass} />;
      case 'Car':
        return <Car className={iconClass} />;
      case 'Truck':
        return <Truck className={iconClass} />;
      default:
        return <Car className={iconClass} />;
    }
  };

  // SCREEN 1 - STATE B: SEARCHING RADAR SCREEN
  if (screenState === 'searching') {
    return (
      <div className="flex flex-col min-h-[640px] bg-slate-950 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
        {/* Top Emergency Scanning Bar */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}>
              <Radar className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-orange-200">
                Priority Dispatch Active
              </div>
              <h2 className="text-base font-extrabold tracking-tight">Finding Nearest Mechanic...</h2>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-black/40 text-orange-200 border border-orange-400/30 animate-pulse">
            LIVE SEARCH
          </span>
        </div>

        {/* Radar Map Visual Container */}
        <div className="relative h-64 sm:h-72 w-full border-b border-slate-800">
          <MapMock
            pinPosition={pinPos}
            showRadar={true}
            isDraggable={false}
            customerAddress={location.address}
            nearbyMechanicsCount={4}
          />

          {/* Floating Radar Center Badge */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-orange-500/40 text-xs font-medium text-orange-300 shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span>Broadcasting to 4 mechanics in 3.0 km</span>
          </div>
        </div>

        {/* Searching Status & Details */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Request Summary Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400">
                  {renderIssueIcon(currentIssue.iconName, false)}
                </div>
                <div>
                  <div className="text-xs text-slate-400">Selected Breakdown Issue</div>
                  <div className="text-sm font-semibold text-slate-100">{currentIssue.title}</div>
                  <div className="text-xs text-slate-400">{currentVehicle.title}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Callout Base</div>
                <div className="text-base font-bold text-orange-400">₹{baseCalloutFee}</div>
              </div>
            </div>

            {/* Pulsing Status Stepper */}
            <div className="space-y-2 bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5">
              <div className="flex items-center gap-2.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Emergency request broadcasted to network</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-amber-400 animate-pulse">
                <div className="w-4 h-4 shrink-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                <span>Awaiting mechanic partner acceptance (avg ~25s)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-500">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Live GPS location sharing will begin on accept</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Simulator trigger for pair testing */}
          <div className="bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-800/50 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <div className="text-xs text-cyan-200">
                <span className="font-semibold">Interactive Demo:</span> Switch to Mechanic Tab or simulate accept here.
              </div>
            </div>
            <button
              onClick={handleSimulateAccept}
              className="px-3 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow transition"
            >
              Simulate Accept
            </button>
          </div>

          {/* Action buttons */}
          <div className="pt-2">
            <button
              onClick={handleCancelRequest}
              className="w-full py-3 px-4 rounded-xl border border-red-900/40 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 font-medium text-sm transition flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel Emergency Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 1 - STATE C: MECHANIC ASSIGNED STATE
  if (screenState === 'assigned') {
    const mechanic = activeDispatchedMechanic || {
      name: 'Rajesh Kumar',
      phone: '+91 98450 12890',
      rating: 4.9,
      jobsCompleted: 342,
      vehiclePlate: 'KA 01 EK 8841 (Hero Glamour Tool Kit)',
      currentDistanceKm: 1.8,
      etaMinutes: 7,
    };

    return (
      <div className="flex flex-col min-h-[640px] bg-slate-950 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
        {/* Dispatched Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black/20 rounded-full">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-emerald-200">
                Mechanic En Route
              </div>
              <h2 className="text-base font-extrabold tracking-tight">Arriving in {mechanic.etaMinutes} mins</h2>
            </div>
          </div>
          <div className="bg-black/30 border border-emerald-400/40 px-2.5 py-1 rounded-full text-xs font-mono text-emerald-200 font-semibold">
            {mechanic.currentDistanceKm} km away
          </div>
        </div>

        {/* Live Tracking Map View */}
        <div className="relative h-56 sm:h-64 w-full border-b border-slate-800">
          <MapMock
            pinPosition={pinPos}
            isDraggable={false}
            isNavigationMode={true}
            customerAddress={location.address}
          />
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          {/* OTP Security Verification Card */}
          <div className="bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-slate-900 border border-orange-500/40 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-orange-400" />
                  Share OTP with Mechanic
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Give this code to mechanic upon arrival to start repair
                </div>
              </div>
              <div className="text-center bg-slate-950 border border-orange-500/60 rounded-lg px-4 py-2">
                <div className="font-mono text-2xl font-black tracking-widest text-orange-400">
                  {emergencyOtp}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">4-Digit OTP</div>
              </div>
            </div>
          </div>

          {/* Mechanic Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-bold text-lg text-slate-950 shadow-md">
                  RK
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100">{mechanic.name}</h3>
                    <span className="text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      ★ {mechanic.rating}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {mechanic.jobsCompleted}+ roadside rescues completed
                  </div>
                  <div className="text-xs font-mono text-cyan-400 mt-0.5">{mechanic.vehiclePlate}</div>
                </div>
              </div>
              <a
                href={`tel:${mechanic.phone}`}
                className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg transition active:scale-95"
                title="Call Mechanic"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={() => {
              playTapSound();
              setScreenState('idle');
              if (onResetEmergency) onResetEmergency();
            }}
            className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold transition"
          >
            Create New Emergency Request
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 1 - STATE A: PRIMARY EMERGENCY REQUEST FORM
  return (
    <div className="flex flex-col bg-slate-950 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* Location Auto-Detect & Pin Header Card */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Breakdown Location
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoDetectLocation}
              disabled={isDetectingLocation}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95"
            >
              <LocateFixed className={`w-3.5 h-3.5 text-cyan-400 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'Locating...' : 'Auto-Detect'}</span>
            </button>
            <button
              onClick={() => setShowLocationModal(true)}
              className="px-2.5 py-1 text-xs font-medium rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 transition"
            >
              Edit Pin
            </button>
          </div>
        </div>

        {/* Address Display Bar */}
        <div
          onClick={() => setShowLocationModal(true)}
          className="flex items-center gap-2.5 bg-slate-950/70 hover:bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 cursor-pointer transition group"
        >
          <MapPin className="w-4 h-4 text-orange-500 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-200 truncate">{location.address}</div>
            <div className="text-[11px] text-slate-400 truncate">{location.landmark || 'Near GPS pinpoint'}</div>
          </div>
          <span className="text-xs text-slate-500 group-hover:text-slate-300">Change</span>
        </div>
      </div>

      {/* Interactive Map Visual with Drag Pin */}
      <div className="relative h-48 sm:h-52 w-full border-b border-slate-800">
        <MapMock
          pinPosition={pinPos}
          onPinChange={handlePinChange}
          isDraggable={true}
          customerAddress={location.address}
          nearbyMechanicsCount={3}
        />
      </div>

      {/* Main Options Form */}
      <div className="p-4 sm:p-5 space-y-5">
        {/* Issue Selector Section */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>1. Select Emergency Issue</span>
              <span className="text-red-400">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Fixed rate inspection included</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {issueOptions.map((issue) => {
              const isSelected = selectedIssue === issue.id;
              return (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setSelectedIssue(issue.id);
                  }}
                  className={`relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-orange-600/25 to-red-600/20 border-orange-500 shadow-lg shadow-orange-950/30 ring-1 ring-orange-500'
                      : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  {issue.popular && (
                    <span className="absolute -top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-slate-950 uppercase tracking-tight">
                      Most Common
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-600/30'
                          : 'bg-slate-800 text-orange-400'
                      }`}
                    >
                      {renderIssueIcon(issue.iconName, isSelected)}
                    </div>
                    <span
                      className={`text-xs font-mono font-semibold ${
                        isSelected ? 'text-orange-400' : 'text-slate-400'
                      }`}
                    >
                      +{issue.priceAddon}
                    </span>
                  </div>
                  <div>
                    <div
                      className={`text-xs font-bold leading-tight ${
                        isSelected ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {issue.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{issue.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vehicle Selector Section */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>2. Vehicle Category</span>
              <span className="text-red-400">*</span>
            </label>
            <span className="text-[11px] text-cyan-400 font-mono">Dispatches right mechanic tools</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {vehicleOptions.map((veh) => {
              const isSelected = selectedVehicle === veh.id;
              return (
                <button
                  key={veh.id}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setSelectedVehicle(veh.id);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-gradient-to-b from-cyan-950/40 to-slate-900 border-cyan-500 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500'
                      : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg mb-1.5 ${
                      isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400'
                    }`}
                  >
                    {renderVehicleIcon(veh.iconName, isSelected)}
                  </div>
                  <div
                    className={`text-xs font-bold tracking-tight ${
                      isSelected ? 'text-cyan-300' : 'text-slate-200'
                    }`}
                  >
                    {veh.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{veh.badge}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Estimation Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded-md">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400">Estimated Arrival</div>
                <div className="text-sm font-bold text-slate-100">{etaTime}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-medium text-slate-400">Estimated Total</div>
              <div className="text-lg font-black text-orange-400 font-mono">₹{estimatedTotal}</div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Callout Base Fee (Mandatory)
              </span>
              <span className="font-mono font-semibold text-slate-200">₹{baseCalloutFee}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{currentIssue.title} service estimate</span>
              <span className="font-mono text-slate-300">₹{estimatedServiceCost}</span>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Base fee covers mechanic dispatch, on-site arrival & diagnosis.</span>
            </div>
          </div>
        </div>

        {/* Prominent Emergency Action Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleRequestEmergency}
            className="w-full py-4 px-5 rounded-xl font-black text-base uppercase tracking-wider bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white shadow-xl shadow-red-950/60 border border-orange-400/40 animate-emergency-glow active:scale-[0.98] transition flex items-center justify-center gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
            <span>Request Emergency Help</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
          <div className="text-center text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>No advance payment needed • Pay on arrival</span>
          </div>
        </div>
      </div>

      {/* Edit Pin / Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                Edit Breakdown Location
              </h3>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Street Address or Landmark</label>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                placeholder="Enter street, highway KM, or landmark"
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-xs text-slate-400">Quick Highway & City Presets:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Outer Ring Road, HSR Sector 2',
                  'Silk Board Flyover Ramp, Hosur Rd',
                  'NH 44 Highway KM 32, Electronic City',
                  'Indiranagar 100ft Road Junction',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setLocationInput(preset)}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveManualLocation}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow"
              >
                Update Pin Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
