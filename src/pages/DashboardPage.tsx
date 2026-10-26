import React, { useState } from 'react';
import {
  Users,
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  Crosshair,
  Truck,
  Wrench,
  CloudLightning,
  Activity,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useTacticalStore } from '../hooks/useTacticalStore';
import { KpiCard } from '../components/common/KpiCard';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TacticalButton } from '../components/common/TacticalButton';
import { ActiveTab } from '../components/layout/Sidebar';

interface DashboardPageProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const {
    personnel,
    casualties,
    inventory,
    supplies,
    medicalFacilities,
    maintenanceAssets,
    weather,
    notifications,
    auditLogs,
  } = useTacticalStore();

  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');

  // Filter calculations based on unit
  const filteredPersonnel =
    selectedUnit === 'ALL'
      ? personnel
      : personnel.filter((p) => p.unit.toLowerCase().includes(selectedUnit.toLowerCase()));

  const activeCount = filteredPersonnel.filter((p) => p.status === 'Active').length;
  const injuredCount = filteredPersonnel.filter((p) => p.status === 'Injured').length;
  const hospitalizedCount = filteredPersonnel.filter((p) => p.status === 'Hospitalized').length;
  const missingDeceasedCount = filteredPersonnel.filter(
    (p) => p.status === 'Missing' || p.status === 'Deceased'
  ).length;

  const lowStockSupplies = supplies.filter(
    (s) => s.replenishmentStatus === 'Critical Shortage' || s.replenishmentStatus === 'Reorder Suggested'
  );
  const openCasualtyIncidents = casualties.filter((c) => c.returnToDutyStatus !== 'Cleared Full Duty');
  const assetsAwaitingMaint = maintenanceAssets.filter(
    (a) => a.serviceability === 'Under Repair' || a.serviceability === 'Awaiting Inspection' || a.overdue
  );
  const unverifiedCasualties = casualties.filter((c) => c.verificationStatus === 'Unverified');

  // Critical Alerts list
  const criticalNotifications = notifications.filter((n) => n.severity === 'Critical');

  // Serviceability metrics
  const totalAssets = maintenanceAssets.length;
  const serviceableAssets = maintenanceAssets.filter((a) => a.serviceability === 'Serviceable').length;
  const readinessPercentage = Math.round((serviceableAssets / (totalAssets || 1)) * 100);

  // Total hospital bed occupancy
  const totalBeds = medicalFacilities.reduce((sum, f) => sum + f.totalBeds, 0);
  const occupiedBeds = medicalFacilities.reduce((sum, f) => sum + f.occupiedBeds, 0);
  const totalIcuBeds = medicalFacilities.reduce((sum, f) => sum + f.icuBeds, 0);
  const occupiedIcuBeds = medicalFacilities.reduce((sum, f) => sum + f.occupiedIcuBeds, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner: Verification Status & Unit Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-[#465044] bg-[#202821] p-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[#48C774] animate-pulse" />
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#B7AA83]">
              DEFENSE TELEMETRY NODE: FORT VANGUARD TOC
            </span>
            <p className="text-xs text-[#A9B39F]">
              Data verification: <span className="text-[#48C774] font-mono">100% AUDITED</span> • Cache Freshness: <span className="font-mono text-[#E8EBDD]">34s ago</span>
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#747653]" />
            <span className="text-xs font-mono text-[#A9B39F] uppercase">Unit Scope:</span>
          </div>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="rounded border border-[#465044] bg-[#151A17] px-2.5 py-1 text-xs text-[#E8EBDD] font-mono focus:outline-none focus:ring-1 focus:ring-[#B7AA83]"
          >
            <option value="ALL">All Deployed Units</option>
            <option value="1st Recon">1st Recon Battalion</option>
            <option value="4th Mechanized">4th Mechanized Brigade</option>
            <option value="8th Support">8th Support Group</option>
            <option value="12th Aviation">12th Aviation Wing</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Row 1: Personnel & Casualties */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Personnel"
          value={activeCount}
          subtitle={`Total tracked in unit: ${filteredPersonnel.length}`}
          icon={Users}
          variant="success"
          trend={{ value: `${Math.round((activeCount / (filteredPersonnel.length || 1)) * 100)}%`, isPositive: true, label: 'ready' }}
          onClick={() => onNavigate('personnel')}
        />
        <KpiCard
          title="Reported Injured"
          value={injuredCount}
          subtitle="Triage stabilized & under evaluation"
          icon={HeartPulse}
          variant={injuredCount > 0 ? 'warning' : 'default'}
          onClick={() => onNavigate('personnel')}
        />
        <KpiCard
          title="Hospitalized"
          value={hospitalizedCount}
          subtitle="Admitted across regional medical facilities"
          icon={Activity}
          variant={hospitalizedCount > 0 ? 'info' : 'default'}
          onClick={() => onNavigate('medical')}
        />
        <KpiCard
          title="Missing / Deceased"
          value={missingDeceasedCount}
          subtitle="Requires positive command identification"
          icon={ShieldAlert}
          variant={missingDeceasedCount > 0 ? 'critical' : 'default'}
          onClick={() => onNavigate('personnel')}
        />
      </div>

      {/* KPI Cards Row 2: Logistics, Maintenance & Readiness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Supply Shortages"
          value={lowStockSupplies.length}
          subtitle="Items below mandatory reserve buffer"
          icon={Truck}
          variant={lowStockSupplies.length > 0 ? 'critical' : 'success'}
          onClick={() => onNavigate('logistics')}
        />
        <KpiCard
          title="Equip. Needing Maint."
          value={assetsAwaitingMaint.length}
          subtitle={`${serviceableAssets}/${totalAssets} assets combat serviceable (${readinessPercentage}%)`}
          icon={Wrench}
          variant={assetsAwaitingMaint.length > 0 ? 'warning' : 'success'}
          onClick={() => onNavigate('maintenance')}
        />
        <KpiCard
          title="Open Med Incidents"
          value={openCasualtyIncidents.length}
          subtitle={`${medicalFacilities[1]?.emergencyResponseStatus || 'Normal'} at Forward Surg.`}
          icon={HeartPulse}
          variant={openCasualtyIncidents.length > 0 ? 'info' : 'success'}
          onClick={() => onNavigate('medical')}
        />
        <KpiCard
          title="Active Met Hazards"
          value={weather.reduce((sum, w) => sum + w.activeAlerts.length, 0)}
          subtitle="Flash flood & high wind shear watches"
          icon={CloudLightning}
          variant="warning"
          onClick={() => onNavigate('weather')}
        />
      </div>

      {/* Unverified Reports Notice (Rule 6: Distinguish confirmed from unverified reports) */}
      {unverifiedCasualties.length > 0 && (
        <div className="rounded-lg border border-[#F2B84B]/60 bg-[#F2B84B]/10 p-4 text-[#F2B84B]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm tracking-wide uppercase font-mono">
                  Attention: {unverifiedCasualties.length} Unverified Casualty Incident Pending
                </p>
                <p className="text-xs text-[#E8EBDD] mt-1">
                  Incident reports require confirmation by an authorized Personnel Officer or Command Supervisor before being classified as confirmed battlefield casualties.
                </p>
              </div>
            </div>
            <TacticalButton
              size="sm"
              variant="warning"
              onClick={() => onNavigate('personnel')}
            >
              Review Incidents
            </TacticalButton>
          </div>
        </div>
      )}

      {/* Grid: Main Operations View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Operational Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personnel Status Breakdown */}
          <TacticalCard
            title="Personnel Deployment & Status Overview"
            subtitle="Personnel distribution across readiness categories"
            headerAction={
              <button
                onClick={() => onNavigate('personnel')}
                className="text-xs text-[#B7AA83] hover:text-[#E8EBDD] flex items-center gap-1 font-mono"
              >
                Full Roster <ArrowUpRight size={12} />
              </button>
            }
          >
            <div className="space-y-3">
              {[
                { label: 'Active Duty', count: activeCount, color: 'bg-[#48C774]', status: 'Active' },
                { label: 'On Approved Leave', count: filteredPersonnel.filter((p) => p.status === 'On Leave').length, color: 'bg-[#747653]', status: 'On Leave' },
                { label: 'Combat / Field Injured', count: injuredCount, color: 'bg-[#F2B84B]', status: 'Injured' },
                { label: 'Admitted Hospitalized', count: hospitalizedCount, color: 'bg-[#62B7E8]', status: 'Hospitalized' },
                { label: 'Missing in Action', count: filteredPersonnel.filter((p) => p.status === 'Missing').length, color: 'bg-[#FF6464]', status: 'Missing' },
                { label: 'Deceased', count: filteredPersonnel.filter((p) => p.status === 'Deceased').length, color: 'bg-[#FF6464]', status: 'Deceased' },
              ].map((row) => {
                const pct = Math.round((row.count / (filteredPersonnel.length || 1)) * 100);
                return (
                  <div key={row.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#E8EBDD] flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${row.color}`} />
                        {row.label}
                      </span>
                      <span className="text-[#A9B39F] tabular-nums">
                        {row.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded bg-[#151A17] overflow-hidden">
                      <div
                        className={`h-full ${row.color} transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </TacticalCard>

          {/* Strategic Supply & Logistics Burn Status */}
          <TacticalCard
            title="Strategic Supply Reserves & Burn Rate"
            subtitle="Estimated days of supply remaining calculated from historical burn"
            headerAction={
              <button
                onClick={() => onNavigate('logistics')}
                className="text-xs text-[#B7AA83] hover:text-[#E8EBDD] flex items-center gap-1 font-mono"
              >
                Supply Depot <ArrowUpRight size={12} />
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#465044] text-[#B7AA83] font-mono">
                    <th className="pb-2">Supply Nomenclature</th>
                    <th className="pb-2">Current Stock</th>
                    <th className="pb-2">Daily Burn</th>
                    <th className="pb-2">Days Remaining</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#465044]/40 font-mono">
                  {supplies.slice(0, 5).map((sup) => (
                    <tr key={sup.id} className="hover:bg-[#263128]/50">
                      <td className="py-2.5 font-medium text-[#E8EBDD]">{sup.name}</td>
                      <td className="py-2.5 text-[#A9B39F] tabular-nums">
                        {sup.currentStock.toLocaleString()} {sup.unit}
                      </td>
                      <td className="py-2.5 text-[#A9B39F] tabular-nums">
                        {sup.dailyBurnRate} / day
                      </td>
                      <td className="py-2.5 tabular-nums">
                        <span
                          className={`font-bold ${
                            sup.daysOfSupplyRemaining <= 10
                              ? 'text-[#FF6464]'
                              : sup.daysOfSupplyRemaining <= 15
                              ? 'text-[#F2B84B]'
                              : 'text-[#48C774]'
                          }`}
                        >
                          {sup.daysOfSupplyRemaining} Days
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <StatusBadge status={sup.replenishmentStatus} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TacticalCard>

          {/* Regional Medical Bed & Surgical Capacity */}
          <TacticalCard
            title="Medical Facilities & Triage Capacity"
            subtitle="Bed availability, ICU capacity, and surgical status across echelons"
            headerAction={
              <button
                onClick={() => onNavigate('medical')}
                className="text-xs text-[#B7AA83] hover:text-[#E8EBDD] flex items-center gap-1 font-mono"
              >
                Medevac Board <ArrowUpRight size={12} />
              </button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {medicalFacilities.map((fac) => {
                const bedPct = Math.round((fac.occupiedBeds / (fac.totalBeds || 1)) * 100);
                const icuPct = Math.round((fac.occupiedIcuBeds / (fac.icuBeds || 1)) * 100);
                return (
                  <div
                    key={fac.id}
                    className="rounded border border-[#465044] bg-[#1a211b] p-3 text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-semibold text-[#E8EBDD]">{fac.name}</span>
                      <StatusBadge status={fac.emergencyResponseStatus} size="sm" />
                    </div>
                    <p className="text-[11px] text-[#B7AA83] font-mono">{fac.echelonRole}</p>

                    <div className="space-y-1.5 pt-1">
                      <div>
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-[#A9B39F]">Ward Beds:</span>
                          <span className="text-[#E8EBDD] tabular-nums">
                            {fac.occupiedBeds} / {fac.totalBeds} ({bedPct}%)
                          </span>
                        </div>
                        <div className="h-1.5 rounded bg-[#151A17] overflow-hidden">
                          <div
                            className={`h-full ${
                              bedPct > 80 ? 'bg-[#FF6464]' : bedPct > 60 ? 'bg-[#F2B84B]' : 'bg-[#48C774]'
                            }`}
                            style={{ width: `${bedPct}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-[#A9B39F]">ICU Beds:</span>
                          <span className="text-[#E8EBDD] tabular-nums">
                            {fac.occupiedIcuBeds} / {fac.icuBeds} ({icuPct}%)
                          </span>
                        </div>
                        <div className="h-1.5 rounded bg-[#151A17] overflow-hidden">
                          <div
                            className={`h-full ${
                              icuPct > 80 ? 'bg-[#FF6464]' : 'bg-[#62B7E8]'
                            }`}
                            style={{ width: `${icuPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TacticalCard>
        </div>

        {/* Right Column (1 span): Live Activity Feed & Critical Alerts */}
        <div className="space-y-6">
          {/* Critical Alerts Card */}
          <TacticalCard
            title="Immediate Operational Alerts"
            subtitle="High-priority events requiring command response"
            badge={
              criticalNotifications.length > 0 ? (
                <span className="rounded bg-[#FF6464] px-1.5 py-0.5 text-[10px] font-mono font-bold text-white">
                  {criticalNotifications.length} CRITICAL
                </span>
              ) : undefined
            }
          >
            <div className="space-y-3">
              {criticalNotifications.length === 0 ? (
                <div className="py-6 text-center text-[#A9B39F]">
                  <CheckCircle2 size={24} className="mx-auto text-[#48C774] mb-1" />
                  <p className="text-xs font-mono">No unresolved critical alerts</p>
                </div>
              ) : (
                criticalNotifications.map((crit) => (
                  <div
                    key={crit.id}
                    className="rounded border border-[#FF6464]/50 bg-[#FF6464]/10 p-3 text-xs"
                  >
                    <p className="font-semibold text-[#FF6464]">{crit.title}</p>
                    <p className="text-[#E8EBDD] text-[11px] mt-1 leading-snug">{crit.message}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#A9B39F]">
                      <span>{crit.timestamp}</span>
                      {crit.linkModule && (
                        <button
                          onClick={() => onNavigate(crit.linkModule as ActiveTab)}
                          className="text-[#B7AA83] hover:underline"
                        >
                          Resolve →
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TacticalCard>

          {/* Quick Action Station */}
          <TacticalCard title="Tactical Action Station" subtitle="Direct operational actions">
            <div className="grid grid-cols-2 gap-2">
              <TacticalButton
                variant="primary"
                size="sm"
                icon={HeartPulse}
                onClick={() => onNavigate('personnel')}
                className="w-full text-xs"
              >
                Log Casualty
              </TacticalButton>
              <TacticalButton
                variant="secondary"
                size="sm"
                icon={Crosshair}
                onClick={() => onNavigate('inventory')}
                className="w-full text-xs"
              >
                Issue Weapon
              </TacticalButton>
              <TacticalButton
                variant="secondary"
                size="sm"
                icon={Truck}
                onClick={() => onNavigate('logistics')}
                className="w-full text-xs"
              >
                Requisition
              </TacticalButton>
              <TacticalButton
                variant="secondary"
                size="sm"
                icon={Wrench}
                onClick={() => onNavigate('maintenance')}
                className="w-full text-xs"
              >
                Repair Ticket
              </TacticalButton>
            </div>
          </TacticalCard>

          {/* Real-Time Operational Audit Feed */}
          <TacticalCard
            title="Authorized Audit Stream"
            subtitle="Immutable operational event log"
            headerAction={
              <button
                onClick={() => onNavigate('security')}
                className="text-xs text-[#B7AA83] hover:text-[#E8EBDD] font-mono flex items-center gap-1"
              >
                Full Log <ArrowUpRight size={12} />
              </button>
            }
          >
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {auditLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="rounded border border-[#465044]/60 bg-[#151A17] p-2.5 text-xs font-mono"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#48C774] font-semibold">{log.action}</span>
                    <span className="text-[#747653] tabular-nums">{log.timestamp.slice(11, 16)} UTC</span>
                  </div>
                  <p className="text-[#E8EBDD] text-[11px] mt-1 font-sans line-clamp-2">
                    {log.details}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-[#A9B39F]">
                    <span>{log.actorName}</span>
                    <span className="text-[#B7AA83]">{log.module}</span>
                  </div>
                </div>
              ))}
            </div>
          </TacticalCard>
        </div>
      </div>
    </div>
  );
};
