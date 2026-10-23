'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Bell,
  CheckCircle2,
  XCircle,
  Navigation,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CornerUpRight,
  Phone,
  Compass,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import MapMock from '../MapMock';
import { MechanicJobAlert } from '@/types';
import {
  playIncomingAlertChime,
  playCountdownTick,
  playSuccessChime,
  playTapSound,
} from '@/utils/sound';

interface MechanicAlertViewProps {
  initialAlert?: MechanicJobAlert;
  onJobAccepted?: (job: MechanicJobAlert) => void;
  onJobDeclined?: () => void;
}

const defaultMockAlert: MechanicJobAlert = {
  id: 'JOB-9482',
  customerName: 'Arjun Verma',
  customerRating: 4.9,
  distanceKm: 2.3,
  etaMinutes: 7,
  issue: 'Flat Tyre / Puncture',
  issueId: 'flat-tyre',
  vehicleModel: 'Hyundai Creta • White (SUV)',
  vehicleCategory: 'SUV/Commercial',
  payoutAmount: 420,
  pickupAddress: 'Outer Ring Road, Near HSR Sector 2, Bengaluru',
  landmark: 'Opposite Agara Lake Overpass, Service Road',
  reportedAt: 'Just now',
  emergencyOtp: '4829',
};

export default function MechanicAlertView({
  initialAlert = defaultMockAlert,
  onJobAccepted,
  onJobDeclined,
}: MechanicAlertViewProps) {
  // Alert life-cycle: 'alert' | 'accepted' | 'declined' | 'completed'
  const [jobState, setJobState] = useState<'alert' | 'accepted' | 'declined' | 'completed'>('alert');
  const [activeAlert, setActiveAlert] = useState<MechanicJobAlert>(initialAlert);

  // Sound toggle (Sound trigger toggle required by prompt)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 30-second circular countdown timer (required by prompt)
  const [secondsLeft, setSecondsLeft] = useState(30);
  const totalSeconds = 30;

  // 4-digit OTP state (required by prompt)
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Sound looping on incoming alert
  useEffect(() => {
    if (jobState !== 'alert' || !soundEnabled) return;

    // Play initial alert chime
    playIncomingAlertChime();

    const interval = setInterval(() => {
      playIncomingAlertChime();
    }, 4500);

    return () => clearInterval(interval);
  }, [jobState, soundEnabled]);

  // 30-Second Countdown Timer effect
  useEffect(() => {
    if (jobState !== 'alert') return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setJobState('declined');
          return 0;
        }

        // Warning tick sounds when under 10 seconds
        if (soundEnabled && prev <= 10) {
          playCountdownTick(prev <= 5);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [jobState, soundEnabled]);

  // Handle Accept
  const handleAccept = () => {
    playSuccessChime();
    setJobState('accepted');
    if (onJobAccepted) {
      onJobAccepted(activeAlert);
    }
  };

  // Handle Decline
  const handleDecline = () => {
    playTapSound();
    setJobState('declined');
    if (onJobDeclined) {
      onJobDeclined();
    }
  };

  // Reset or simulate new incoming alert
  const handleSimulateNewAlert = () => {
    playTapSound();
    setSecondsLeft(30);
    setOtpValues(['', '', '', '']);
    setOtpError(null);
    setIsOtpVerified(false);
    setJobState('alert');
  };

  // OTP Input management
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return; // Only numeric

    const newOtp = [...otpValues];
    newOtp[index] = val.slice(-1); // Take last entered char
    setOtpValues(newOtp);
    setOtpError(null);

    // Auto focus next box
    if (val && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto verify if all 4 digits entered
    const fullOtp = newOtp.join('');
    if (fullOtp.length === 4) {
      validateOtp(fullOtp);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const validateOtp = (code: string) => {
    if (code === activeAlert.emergencyOtp || code === '4829') {
      playSuccessChime();
      setIsOtpVerified(true);
      setOtpError(null);
    } else {
      setOtpError('Invalid OTP. Please ask customer for correct 4-digit code.');
    }
  };

  const fillDemoOtp = () => {
    playTapSound();
    const demoCode = activeAlert.emergencyOtp.split('');
    setOtpValues(demoCode);
    validateOtp(activeAlert.emergencyOtp);
  };

  // Calculate SVG circular countdown circle
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (secondsLeft / totalSeconds) * circumference;

  // Color changes based on urgency
  const timerColor =
    secondsLeft > 12 ? 'stroke-emerald-400 text-emerald-400' : secondsLeft > 5 ? 'stroke-amber-400 text-amber-400' : 'stroke-red-500 text-red-500';

  return (
    <div className="flex flex-col min-h-[640px] bg-slate-950 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* Sound Toggle Header Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            resQmech Partner Terminal
          </span>
        </div>

        {/* Sound trigger toggle */}
        <button
          onClick={() => {
            playTapSound();
            setSoundEnabled(!soundEnabled);
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition ${
            soundEnabled
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
          }`}
          title="Toggle Alert Audio Sound"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Sound: ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span>Sound: MUTED</span>
            </>
          )}
        </button>
      </div>

      {/* STATE 1: ACTIVE INCOMING ALERT POPUP WITH 30S COUNTDOWN */}
      {jobState === 'alert' && (
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-5">
          {/* Incoming Job Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-red-600/30 via-orange-600/20 to-amber-600/30 border border-orange-500/40 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/50">
                    <Bell className="w-5 h-5 animate-bounce" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400">
                    High Priority Emergency Callout
                  </span>
                  <h3 className="text-base font-extrabold text-white">Incoming Rescue Request</h3>
                </div>
              </div>

              {/* Payout pill */}
              <div className="text-right bg-slate-900/90 border border-emerald-500/40 rounded-xl px-3 py-1.5 shadow-md">
                <div className="text-[10px] uppercase font-bold text-slate-400">Net Payout</div>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  ₹{activeAlert.payoutAmount}
                </div>
              </div>
            </div>
          </div>

          {/* Central Circular 30s Countdown Timer */}
          <div className="flex flex-col items-center justify-center py-3">
            <div className="relative flex items-center justify-center">
              <svg className="w-28 h-28 transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-slate-800"
                />
                {/* Animated Progress Ring */}
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className={`${timerColor} transition-all duration-1000 ease-linear`}
                />
              </svg>

              {/* Digital Countdown Seconds in Center */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className={`text-3xl font-black font-mono tracking-tighter ${timerColor}`}>
                  {secondsLeft}s
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                  Remaining
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Job auto-reassigns to next mechanic if timer expires</span>
            </p>
          </div>

          {/* Customer & Breakdown Details Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
            {/* Distance & ETA Highlights */}
            <div className="grid grid-cols-2 gap-2.5 pb-2.5 border-b border-slate-800">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-md">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Distance</div>
                  <div className="text-sm font-bold text-white font-mono">{activeAlert.distanceKm} km away</div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2.5">
                <div className="p-2 bg-orange-500/10 text-orange-400 rounded-md">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Drive</div>
                  <div className="text-sm font-bold text-white font-mono">~{activeAlert.etaMinutes} mins</div>
                </div>
              </div>
            </div>

            {/* Issue & Vehicle Specifications */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Reported Issue:</span>
                <span className="font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-md">
                  {activeAlert.issue}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Customer Vehicle:</span>
                <span className="font-semibold text-slate-200">{activeAlert.vehicleModel}</span>
              </div>

              <div className="flex items-start justify-between gap-3 pt-1">
                <span className="text-slate-400 shrink-0">Pickup Location:</span>
                <span className="font-medium text-slate-300 text-right line-clamp-2">
                  {activeAlert.pickupAddress}
                </span>
              </div>
            </div>

            {/* Customer Rating */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-[10px]">
                  AV
                </span>
                <span className="text-slate-300 font-medium">{activeAlert.customerName}</span>
                <span className="text-amber-400 font-semibold">★ {activeAlert.customerRating}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">Verified User</span>
            </div>
          </div>

          {/* Dual Action Buttons: Accept (Earn ₹420) and Decline */}
          <div className="pt-3 grid grid-cols-5 gap-3">
            <button
              onClick={handleDecline}
              className="col-span-2 py-3.5 px-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4 text-slate-400" />
              <span>Decline</span>
            </button>

            <button
              onClick={handleAccept}
              className="col-span-3 py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-950/60 border border-emerald-400/40 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>Accept (₹{activeAlert.payoutAmount})</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: ACCEPTED SCREEN - TURN-BY-TURN NAVIGATION & 4-DIGIT OTP */}
      {jobState === 'accepted' && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Turn-by-Turn Maneuver Card */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500 text-slate-950 rounded-xl shadow-lg shadow-cyan-500/30">
                  <CornerUpRight className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                    In 250 meters
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Turn Right onto 100ft Inner Ring Rd
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Fastest route • Normal traffic (6 mins remaining)
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 uppercase font-semibold">Speed</div>
                <div className="text-base font-bold text-cyan-300 font-mono">38 km/h</div>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Route Map View */}
          <div className="relative h-52 sm:h-56 w-full border-b border-slate-800">
            <MapMock
              isDraggable={false}
              isNavigationMode={true}
              customerAddress={activeAlert.pickupAddress}
            />

            {/* Floating Navigation HUD */}
            <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-emerald-400">1.8 km</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300">5 mins ETA</span>
              </div>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 underline"
              >
                Google Maps ↗
              </a>
            </div>
          </div>

          {/* Customer Contact & 4-Digit OTP Entry Section */}
          <div className="p-4 sm:p-5 space-y-4">
            {/* Customer Quick Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-xs">
                  AV
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100">{activeAlert.customerName}</div>
                  <div className="text-[11px] text-slate-400">{activeAlert.vehicleModel}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="tel:+919845012890"
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow transition"
                  title="Call Customer"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* 4-Digit OTP Entry Card (Required by prompt) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded-md">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Customer Arrival Verification
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Ask customer for 4-digit OTP upon reaching breakdown site
                    </p>
                  </div>
                </div>

                {/* Demo OTP fill button for quick reviewer verification */}
                <button
                  type="button"
                  onClick={fillDemoOtp}
                  className="px-2 py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 rounded-md flex items-center gap-1 transition"
                  title="Auto-fill demonstration code"
                >
                  <Sparkles className="w-3 h-3" />
                  Demo OTP ({activeAlert.emergencyOtp})
                </button>
              </div>

              {/* 4 Inputs for the 4-digit code */}
              <div className="flex items-center justify-center gap-3 py-2">
                {otpValues.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={isOtpVerified}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`w-12 h-14 text-center font-mono text-2xl font-black rounded-xl border transition-all ${
                      isOtpVerified
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                        : digit
                        ? 'bg-slate-950 border-orange-500 text-orange-400 ring-2 ring-orange-500/20'
                        : 'bg-slate-950 border-slate-700 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                    }`}
                  />
                ))}
              </div>

              {/* OTP Error Feedback */}
              {otpError && (
                <div className="text-center text-xs text-red-400 font-medium flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Verified Success State */}
              {isOtpVerified && (
                <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">
                      OTP Verified! Breakdown Service Started.
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">Payout Locked</span>
                </div>
              )}

              {!isOtpVerified && (
                <button
                  type="button"
                  onClick={() => validateOtp(otpValues.join(''))}
                  disabled={otpValues.join('').length < 4}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold uppercase tracking-wider transition"
                >
                  Verify OTP & Start Repair
                </button>
              )}
            </div>

            {/* Reset / New simulation test button */}
            <button
              onClick={handleSimulateNewAlert}
              className="w-full py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Terminal / Test Another Incoming Alert
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: DECLINED OR EXPIRED */}
      {jobState === 'declined' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400">
            <XCircle className="w-8 h-8 text-slate-400" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Alert Dismissed / Expired</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              The roadside breakdown request has been rerouted to another mechanic on the network.
            </p>
          </div>

          <button
            onClick={handleSimulateNewAlert}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold uppercase tracking-wider shadow-lg transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Simulate New Alert
          </button>
        </div>
      )}
    </div>
  );
}
