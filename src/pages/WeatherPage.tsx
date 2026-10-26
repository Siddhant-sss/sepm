import React, { useState } from 'react';
import {
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Gauge,
  AlertTriangle,
  Plane,
  Truck,
  Compass,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useTacticalStore } from '../hooks/useTacticalStore';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TacticalButton } from '../components/common/TacticalButton';
import { WeatherObservation } from '../types';

export const WeatherPage: React.FC = () => {
  const { weather, activeUser } = useTacticalStore();

  const [selectedStationId, setSelectedStationId] = useState<string>(weather[0].stationId);

  const selectedStation = weather.find((w) => w.stationId === selectedStationId) || weather[0];

  return (
    <div className="space-y-6">
      {/* Telemetry Accuracy & Integration Notice */}
      <div className="rounded-lg border border-[#465044] bg-[#202821] p-3 text-xs text-[#A9B39F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CloudLightning className="text-[#48C774]" size={16} />
          <span>
            <strong>Atmospheric Telemetry & Operational Safety Guidance:</strong> Monitors flight condition ceilings and ground vehicle transit safety.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#B7AA83]">
          <span className="rounded bg-[#151A17] px-2 py-0.5 border border-[#465044]">
            TELEMETRY: VERIFIED SIMULATION (NOAA API COMPATIBLE)
          </span>
        </div>
      </div>

      {/* Station Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#465044] pb-3">
        {weather.map((stn) => {
          const isSelected = selectedStationId === stn.stationId;
          const hasAlerts = stn.activeAlerts.length > 0;
          return (
            <button
              key={stn.stationId}
              onClick={() => setSelectedStationId(stn.stationId)}
              className={`rounded-md px-3 py-2 text-xs font-mono font-medium transition-colors flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#414B32] text-[#E8EBDD] border border-[#747653]'
                  : 'bg-[#202821] text-[#A9B39F] hover:bg-[#263128] hover:text-[#E8EBDD] border border-[#465044]'
              }`}
            >
              <span>{stn.stationName}</span>
              {hasAlerts && (
                <span className="h-2 w-2 rounded-full bg-[#FF6464] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Weather Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Primary Station Readings */}
        <div className="lg:col-span-2 space-y-6">
          <TacticalCard
            title={`Atmospheric Telemetry: ${selectedStation.stationName}`}
            subtitle={`Observation Recorded: ${selectedStation.timestamp} • Sensor Node: ${selectedStation.stationId}`}
            badge={
              selectedStation.activeAlerts.length > 0 ? (
                <span className="rounded bg-[#FF6464] text-white px-1.5 py-0.5 text-[10px] font-mono font-bold">
                  {selectedStation.activeAlerts.length} ACTIVE HAZARDS
                </span>
              ) : (
                <span className="rounded bg-[#48C774]/20 text-[#48C774] px-1.5 py-0.5 text-[10px] font-mono font-bold">
                  CONDITIONS NOMINAL
                </span>
              )
            }
          >
            <div className="space-y-6">
              {/* Primary Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#151A17] rounded border border-[#465044]">
                  <div className="flex items-center gap-1.5 text-xs text-[#B7AA83] font-mono">
                    <Thermometer size={14} /> Surface Temperature
                  </div>
                  <p className="text-2xl font-bold font-mono text-[#E8EBDD] mt-1 tabular-nums">
                    {selectedStation.tempCelsius}°C / {(selectedStation.tempCelsius * 1.8 + 32).toFixed(1)}°F
                  </p>
                  <p className="text-[11px] text-[#A9B39F] mt-0.5">{selectedStation.condition}</p>
                </div>

                <div className="p-3 bg-[#151A17] rounded border border-[#465044]">
                  <div className="flex items-center gap-1.5 text-xs text-[#B7AA83] font-mono">
                    <Wind size={14} /> Sustained Wind
                  </div>
                  <p className="text-2xl font-bold font-mono text-[#E8EBDD] mt-1 tabular-nums">
                    {selectedStation.windSpeedKmh} km/h
                  </p>
                  <p className="text-[11px] text-[#A9B39F] mt-0.5 font-mono">
                    Direction: {selectedStation.windDirection}
                  </p>
                </div>

                <div className="p-3 bg-[#151A17] rounded border border-[#465044]">
                  <div className="flex items-center gap-1.5 text-xs text-[#B7AA83] font-mono">
                    <Eye size={14} /> Surface Visibility
                  </div>
                  <p className="text-2xl font-bold font-mono text-[#E8EBDD] mt-1 tabular-nums">
                    {selectedStation.visibilityKm} km
                  </p>
                  <p className="text-[11px] text-[#A9B39F] mt-0.5">
                    {selectedStation.visibilityKm >= 10 ? 'Unrestricted' : 'Precipitation Haze'}
                  </p>
                </div>

                <div className="p-3 bg-[#151A17] rounded border border-[#465044]">
                  <div className="flex items-center gap-1.5 text-xs text-[#B7AA83] font-mono">
                    <Droplets size={14} /> 24h Precipitation
                  </div>
                  <p className="text-2xl font-bold font-mono text-[#E8EBDD] mt-1 tabular-nums">
                    {selectedStation.precipitationMm} mm
                  </p>
                  <p className="text-[11px] text-[#A9B39F] mt-0.5">
                    {selectedStation.precipitationMm > 15 ? 'Runoff Risk High' : 'Trace Runoff'}
                  </p>
                </div>

                <div className="p-3 bg-[#151A17] rounded border border-[#465044]">
                  <div className="flex items-center gap-1.5 text-xs text-[#B7AA83] font-mono">
                    <Gauge size={14} /> Barometric Pressure
                  </div>
                  <p className="text-2xl font-bold font-mono text-[#E8EBDD] mt-1 tabular-nums">
                    {selectedStation.barometricHpa} hPa
                  </p>
                  <p className="text-[11px] text-[#A9B39F] mt-0.5">QNH Altimeter Setting</p>
                </div>

                <div className="p-3 bg-[#151A17] rounded border border-[#465044]">
                  <div className="flex items-center gap-1.5 text-xs text-[#B7AA83] font-mono">
                    <Compass size={14} /> Telemetry Source
                  </div>
                  <p className="text-xs text-[#48C774] font-mono font-semibold mt-1">
                    Direct Sensor Stream
                  </p>
                  <p className="text-[10px] text-[#A9B39F] truncate mt-0.5">
                    {selectedStation.dataSource}
                  </p>
                </div>
              </div>

              {/* Active Weather Hazard Warnings */}
              {selectedStation.activeAlerts.length > 0 ? (
                <div className="space-y-3 border-t border-[#465044] pt-4">
                  <h4 className="font-bold text-xs font-mono uppercase text-[#FF6464] flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Active Meteorological Warning Bulletins
                  </h4>
                  {selectedStation.activeAlerts.map((alt) => (
                    <div
                      key={alt.id}
                      className="p-3 rounded border border-[#FF6464]/60 bg-[#FF6464]/10 text-xs text-[#E8EBDD] space-y-1"
                    >
                      <div className="flex justify-between font-mono font-bold text-[#FF6464]">
                        <span>{alt.type}</span>
                        <span>Valid Until: {alt.validUntil}</span>
                      </div>
                      <p className="text-[#E8EBDD] text-xs">{alt.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-t border-[#465044] pt-4 text-xs font-mono text-[#48C774] flex items-center gap-2">
                  <ShieldCheck size={16} /> No severe convective storms or flood warnings currently active in this sector.
                </div>
              )}
            </div>
          </TacticalCard>
        </div>

        {/* Right Column (1 span): Operational Transport Disruption Impact */}
        <div className="space-y-6">
          <TacticalCard
            title="Operational Transport Readiness"
            subtitle="Flight rules & vehicular trafficability"
          >
            <div className="space-y-4 text-xs">
              {/* Flight Rules Box */}
              <div className="p-3 rounded bg-[#1a211b] border border-[#465044] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#B7AA83] font-mono uppercase flex items-center gap-1.5">
                    <Plane size={14} /> Aviation Flight Rules
                  </span>
                  <StatusBadge status={selectedStation.flightCondition} size="sm" />
                </div>
                <p className="text-[#A9B39F] text-[11px]">
                  {selectedStation.flightCondition.includes('VFR')
                    ? 'Visual flight rules permit unrestricted tactical rotary & fixed wing sorties.'
                    : 'Instrument meteorological conditions. Air operations restricted to emergency medevac with certified instrument pilots.'}
                </p>
              </div>

              {/* Ground Mobility Box */}
              <div className="p-3 rounded bg-[#1a211b] border border-[#465044] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#B7AA83] font-mono uppercase flex items-center gap-1.5">
                    <Truck size={14} /> Heavy Ground Mobility Index
                  </span>
                  <StatusBadge status={selectedStation.groundMobility} size="sm" />
                </div>
                <p className="text-[#A9B39F] text-[11px]">
                  {selectedStation.groundMobility.includes('GO')
                    ? 'All wheeled and tracked vehicles may transit without speed restrictions.'
                    : 'Soil saturation and flash runoff require tire chains and convoy speeds capped at 15 km/h.'}
                </p>
              </div>

              {/* Safety Guidance Box */}
              <div className="p-3 rounded bg-[#151A17] border border-[#747653]/60 text-[11px] font-mono text-[#A9B39F] space-y-1">
                <p className="text-[#B7AA83] font-semibold uppercase">COMMAND SAFETY DIRECTIVE:</p>
                <p>• Hydration schedule: 1.0 Liter/hr during ambient peaks</p>
                <p>• Avoid low-water river crossings during flash flood watch</p>
                <p>• Tie down communications antenna masts in &gt;50 km/h wind</p>
              </div>
            </div>
          </TacticalCard>
        </div>
      </div>
    </div>
  );
};
