'use client';

import React, { useState } from 'react';
import {
  Wrench,
  ShieldAlert,
  Smartphone,
  Monitor,
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
  Radio,
  Car,
  BellRing,
  Info,
} from 'lucide-react';
import CustomerEmergencyView from '@/components/customer/CustomerEmergencyView';
import MechanicAlertView from '@/components/mechanic/MechanicAlertView';
import { MechanicJobAlert, MechanicInfo } from '@/types';
import { playTapSound } from '@/utils/sound';

export default function Home() {
  // Screen selector: 'customer' | 'mechanic' | 'dual'
  const [activeTab, setActiveTab] = useState<'customer' | 'mechanic' | 'dual'>('customer');
  // Device frame toggle: true for simulated mobile container, false for fluid
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Cross-screen state simulation
  const [currentOtp] = useState('4829');
  const [mechanicAlertData, setMechanicAlertData] = useState<MechanicJobAlert>({
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
    landmark: 'Opposite Agara Lake Overpass',
    reportedAt: 'Just now',
    emergencyOtp: currentOtp,
  });

  const [dispatchedMechanic, setDispatchedMechanic] = useState<MechanicInfo | null>(null);

  // Triggered when Customer submits emergency request
  const handleCustomerTriggerAlert = (data: {
    issueTitle: string;
    vehicleTitle: string;
    payout: number;
    address: string;
    otp: string;
  }) => {
    setMechanicAlertData((prev) => ({
      ...prev,
      issue: data.issueTitle,
      vehicleModel: `${data.vehicleTitle} • Customer breakdown`,
      payoutAmount: data.payout,
      pickupAddress: data.address,
      emergencyOtp: data.otp,
    }));
  };

  // Triggered when Mechanic accepts the job
  const handleMechanicJobAccepted = () => {
    setDispatchedMechanic({
      name: 'Rajesh Kumar',
      phone: '+91 98450 12890',
      rating: 4.9,
      jobsCompleted: 342,
      vehiclePlate: 'KA 01 EK 8841 (Hero Glamour Mobile Tool Kit)',
      currentDistanceKm: 2.1,
      etaMinutes: 6,
    });
  };

  const handleResetEmergency = () => {
    setDispatchedMechanic(null);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Platform Tagline */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-orange-600 to-amber-500 shadow-lg shadow-orange-600/30">
              <Wrench className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">resQmech</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded">
                  MVP Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Uber for Roadside Emergency Assistance</p>
            </div>
          </div>

          {/* Screen Switcher Tabs */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => {
                playTapSound();
                setActiveTab('customer');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'customer'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>1. Customer Screen</span>
            </button>

            <button
              onClick={() => {
                playTapSound();
                setActiveTab('mechanic');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'mechanic'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BellRing className="w-4 h-4" />
              <span>2. Mechanic Alert Screen</span>
            </button>

            <button
              onClick={() => {
                playTapSound();
                setActiveTab('dual');
              }}
              className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'dual'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Side-by-Side Dual View</span>
            </button>
          </div>

          {/* Frame View Toggle (Mobile mockup vs full) */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setIsMobileFrame(true)}
              className={`p-1.5 rounded-lg text-xs transition ${
                isMobileFrame ? 'bg-slate-800 text-orange-400 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile Device Mockup View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMobileFrame(false)}
              className={`p-1.5 rounded-lg text-xs transition ${
                !isMobileFrame ? 'bg-slate-800 text-cyan-400 shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Responsive View"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Quick Interactive Testing Guide Pill */}
      <section className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
            <span>
              <strong className="text-white">Interactive MVP:</strong> Test Customer breakdown booking
              (Base ₹199 fee + radar searching) & Mechanic Partner alert (30s circular timer + navigation &
              4-digit OTP).
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Sound Synth Enabled
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Demo OTP: <strong className="font-mono text-cyan-300 font-semibold">{currentOtp}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Main Screen Display Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        {/* CASE A: CUSTOMER EMERGENCY SCREEN ONLY */}
        {activeTab === 'customer' && (
          <div className={`w-full ${isMobileFrame ? 'max-w-[430px]' : 'max-w-2xl'} transition-all`}>
            {isMobileFrame ? (
              <div className="bg-slate-950 p-2 sm:p-3 rounded-[36px] border-[3px] border-slate-700 shadow-2xl ring-1 ring-slate-800">
                {/* Mobile top speaker & camera bezel */}
                <div className="flex items-center justify-center pb-2">
                  <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                    <span className="w-6 h-1 rounded-full bg-slate-950" />
                  </div>
                </div>
                <CustomerEmergencyView
                  onTriggerMechanicAlert={handleCustomerTriggerAlert}
                  activeDispatchedMechanic={dispatchedMechanic}
                  emergencyOtp={currentOtp}
                  onResetEmergency={handleResetEmergency}
                />
              </div>
            ) : (
              <CustomerEmergencyView
                onTriggerMechanicAlert={handleCustomerTriggerAlert}
                activeDispatchedMechanic={dispatchedMechanic}
                emergencyOtp={currentOtp}
                onResetEmergency={handleResetEmergency}
              />
            )}
          </div>
        )}

        {/* CASE B: MECHANIC ALERT SCREEN ONLY */}
        {activeTab === 'mechanic' && (
          <div className={`w-full ${isMobileFrame ? 'max-w-[430px]' : 'max-w-2xl'} transition-all`}>
            {isMobileFrame ? (
              <div className="bg-slate-950 p-2 sm:p-3 rounded-[36px] border-[3px] border-slate-700 shadow-2xl ring-1 ring-slate-800">
                {/* Mobile top speaker & camera bezel */}
                <div className="flex items-center justify-center pb-2">
                  <div className="w-20 h-4 bg-slate-900 rounded-full flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                    <span className="w-6 h-1 rounded-full bg-slate-950" />
                  </div>
                </div>
                <MechanicAlertView
                  initialAlert={mechanicAlertData}
                  onJobAccepted={handleMechanicJobAccepted}
                />
              </div>
            ) : (
              <MechanicAlertView
                initialAlert={mechanicAlertData}
                onJobAccepted={handleMechanicJobAccepted}
              />
            )}
          </div>
        )}

        {/* CASE C: SIDE-BY-SIDE DUAL VIEW (DESKTOP) */}
        {activeTab === 'dual' && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-5xl">
            {/* Left Screen: Customer Emergency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 text-xs font-bold text-orange-400">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Screen 1: Customer Emergency App
                </span>
                <span className="text-slate-400 font-normal text-[11px]">Breakdown view</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-[32px] border-2 border-slate-800 shadow-xl">
                <CustomerEmergencyView
                  onTriggerMechanicAlert={handleCustomerTriggerAlert}
                  activeDispatchedMechanic={dispatchedMechanic}
                  emergencyOtp={currentOtp}
                  onResetEmergency={handleResetEmergency}
                />
              </div>
            </div>

            {/* Right Screen: Mechanic Partner Alert */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 text-xs font-bold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <BellRing className="w-4 h-4" />
                  Screen 2: Mechanic Partner Terminal
                </span>
                <span className="text-slate-400 font-normal text-[11px]">Incoming alert view</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-[32px] border-2 border-slate-800 shadow-xl">
                <MechanicAlertView
                  initialAlert={mechanicAlertData}
                  onJobAccepted={handleMechanicJobAccepted}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 resQmech Roadside Tech. Built with Next.js App Router, TypeScript & Tailwind CSS.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Callout Base: ₹199</span>
            <span>•</span>
            <span>30s Dispatch Dispatch SLA</span>
            <span>•</span>
            <span>Secure 4-Digit OTP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
