'use client';

import React, { useState, useRef } from 'react';
import { MapPin, Navigation2, Compass, Wrench } from 'lucide-react';

interface MapMockProps {
  pinPosition?: { x: number; y: number }; // Percentage 0-100
  onPinChange?: (pos: { x: number; y: number; address: string }) => void;
  isDraggable?: boolean;
  showRadar?: boolean;
  isNavigationMode?: boolean;
  customerAddress?: string;
  nearbyMechanicsCount?: number;
}

const mockLocations = [
  'Outer Ring Road, Near HSR Sector 2, Bengaluru',
  'Sarjapur Main Road, Bellandur Junction, Bengaluru',
  '100 Feet Road, Koramangala 4th Block, Bengaluru',
  'Hosur Road, Silk Board Flyover Ramp, Bengaluru',
  'Old Airport Road, Domlur Flyover, Bengaluru',
];

export default function MapMock({
  pinPosition = { x: 50, y: 50 },
  onPinChange,
  isDraggable = true,
  showRadar = false,
  isNavigationMode = false,
  customerAddress = 'Outer Ring Road, Near HSR Sector 2',
  nearbyMechanicsCount = 3,
}: MapMockProps) {
  const [pos, setPos] = useState(pinPosition);
  const [isDragging, setIsDragging] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggable) return;
    setIsDragging(true);
    updatePositionFromEvent(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !isDraggable) return;
    updatePositionFromEvent(e);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const updatePositionFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const clientX = Math.max(rect.left + 20, Math.min(rect.right - 20, e.clientX));
    const clientY = Math.max(rect.top + 20, Math.min(rect.bottom - 20, e.clientY));

    const x = Math.round(((clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((clientY - rect.top) / rect.height) * 100);

    setPos({ x, y });
    const randomAddress = mockLocations[Math.floor((x + y) % mockLocations.length)];
    if (onPinChange) {
      onPinChange({ x, y, address: randomAddress });
    }
  };

  return (
    <div
      ref={mapRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative w-full h-full min-h-[220px] bg-[#0c1322] select-none overflow-hidden ${
        isDraggable ? 'cursor-crosshair' : 'cursor-default'
      }`}
    >
      {/* Background SVG Grid and stylized road map */}
      <svg className="absolute inset-0 w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
          <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#mapGrid)" />

        {/* Major Arterial Roads */}
        <path d="M-50,60 Q150,80 300,160 T650,220" fill="none" stroke="#1e293b" strokeWidth="18" />
        <path d="M-50,60 Q150,80 300,160 T650,220" fill="none" stroke="#334155" strokeWidth="8" strokeDasharray="6 4" />

        <path d="M120,-30 Q160,180 220,380" fill="none" stroke="#1e293b" strokeWidth="14" />
        <path d="M120,-30 Q160,180 220,380" fill="none" stroke="#253248" strokeWidth="6" />

        <path d="M380,-30 Q330,120 450,380" fill="none" stroke="#1e293b" strokeWidth="12" />
        <path d="M380,-30 Q330,120 450,380" fill="none" stroke="#253248" strokeWidth="5" />

        <path d="M-20,240 C180,210 280,290 650,110" fill="none" stroke="#1e293b" strokeWidth="16" />
        <path d="M-20,240 C180,210 280,290 650,110" fill="none" stroke="#334155" strokeWidth="7" />

        {/* Navigation Route Path if in active navigation mode */}
        {isNavigationMode && (
          <>
            <path
              d="M 60,260 Q 140,240 210,180 T 310,130"
              fill="none"
              stroke="#0284c7"
              strokeWidth="9"
              strokeLinecap="round"
              className="opacity-40"
            />
            <path
              d="M 60,260 Q 140,240 210,180 T 310,130"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="8 4"
            />
          </>
        )}
      </svg>

      {/* Radar scanning effect overlay when searching */}
      {showRadar && (
        <div
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          {/* Concentric pulsing radar waves */}
          <div className="absolute -inset-16 rounded-full border border-orange-500/30 animate-pulse-ring" />
          <div className="absolute -inset-28 rounded-full border border-orange-500/20 animate-pulse-ring" style={{ animationDelay: '0.8s' }} />
          <div className="absolute -inset-40 rounded-full border border-orange-500/10 animate-pulse-ring" style={{ animationDelay: '1.6s' }} />

          {/* Sweeping Radar Scanner Line */}
          <div className="relative w-44 h-44 rounded-full border border-orange-500/40 overflow-hidden -translate-x-1/2 -translate-y-1/2">
            <div className="w-full h-full animate-radar-sweep origin-center bg-gradient-to-tr from-transparent via-orange-500/15 to-orange-500/40 rounded-full" />
          </div>
        </div>
      )}

      {/* Nearby Mock Mechanics floating markers */}
      {!isNavigationMode && (
        <>
          <div
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 pointer-events-none"
            style={{ left: `${Math.max(15, pos.x - 22)}%`, top: `${Math.max(15, pos.y + 18)}%` }}
          >
            <div className="relative flex items-center justify-center p-1.5 bg-slate-900/90 text-amber-400 border border-amber-500/40 rounded-full shadow-lg shadow-amber-950/50">
              <Wrench className="w-3.5 h-3.5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
            </div>
            <div className="text-[10px] bg-slate-900/90 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300 whitespace-nowrap mt-1 font-mono shadow">
              Rajesh • 1.2km
            </div>
          </div>

          <div
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 pointer-events-none"
            style={{ left: `${Math.min(85, pos.x + 28)}%`, top: `${Math.max(18, pos.y - 20)}%` }}
          >
            <div className="relative flex items-center justify-center p-1.5 bg-slate-900/90 text-cyan-400 border border-cyan-500/40 rounded-full shadow-lg shadow-cyan-950/50">
              <Wrench className="w-3.5 h-3.5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950" />
            </div>
            <div className="text-[10px] bg-slate-900/90 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300 whitespace-nowrap mt-1 font-mono shadow">
              Amit • 2.4km
            </div>
          </div>
        </>
      )}

      {/* Mechanic Vehicle Marker in Navigation Mode */}
      {isNavigationMode && (
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: '20%', top: '75%' }}
        >
          <div className="relative p-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full shadow-xl shadow-cyan-500/30 ring-4 ring-cyan-400/20 animate-bounce">
            <Navigation2 className="w-4 h-4 transform rotate-45" />
          </div>
          <div className="mt-1 text-[11px] font-semibold bg-slate-900 text-cyan-400 border border-cyan-500/50 px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
            You (Mechanic)
          </div>
        </div>
      )}

      {/* User / Emergency Pin Marker */}
      <div
        className="absolute z-20 -translate-x-1/2 -translate-y-full transition-transform duration-100"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      >
        <div className="relative flex flex-col items-center">
          {/* Tooltip badge */}
          <div className="mb-1 px-2.5 py-1 bg-slate-950/95 border border-orange-500/50 rounded-full shadow-xl backdrop-blur-sm flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
            <span>{isNavigationMode ? 'Customer Breakdown' : isDraggable ? 'Drag or tap to set pin' : 'Emergency Spot'}</span>
          </div>

          {/* Glowing Pin */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-red-500/40 ring-4 ring-orange-500/20">
              <MapPin className="w-5 h-5 text-white fill-white" />
            </div>
            {/* Ground pulse shadow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/60 rounded-full blur-[1px]" />
          </div>
        </div>
      </div>

      {/* Map Floating UI HUD controls */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-full shadow">
        <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '14s' }} />
        <span className="font-mono text-[11px]">{customerAddress.split(',')[0]}</span>
      </div>

      {isDraggable && (
        <div className="absolute bottom-3 right-3 z-30 bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-300 text-[11px] px-2.5 py-1 rounded-full shadow flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{nearbyMechanicsCount} mechanics active</span>
        </div>
      )}
    </div>
  );
}
