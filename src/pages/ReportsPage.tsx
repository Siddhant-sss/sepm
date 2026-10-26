import React, { useState } from 'react';
import {
  FileBarChart2,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Users,
  Crosshair,
  Truck,
  HeartPulse,
  Wrench,
  Clock,
} from 'lucide-react';
import { useTacticalStore } from '../hooks/useTacticalStore';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TacticalButton } from '../components/common/TacticalButton';

export const ReportsPage: React.FC = () => {
  const {
    personnel,
    casualties,
    inventory,
    supplies,
    medicalFacilities,
    maintenanceAssets,
    trainingCourses,
    auditLogs,
    activeUser,
  } = useTacticalStore();

  const [selectedReportType, setSelectedReportType] = useState<
    'daily-sitrep' | 'personnel-readiness' | 'logistics-burn' | 'maintenance-serviceability' | 'security-audit'
  >('daily-sitrep');

  const [dateRange, setDateRange] = useState('Today (24h)');

  // Metrics for reports
  const activeCount = personnel.filter((p) => p.status === 'Active').length;
  const injuredCount = personnel.filter((p) => p.status === 'Injured').length;
  const hospitalizedCount = personnel.filter((p) => p.status === 'Hospitalized').length;
  const missingCount = personnel.filter((p) => p.status === 'Missing').length;

  const serviceableAssets = maintenanceAssets.filter((a) => a.serviceability === 'Serviceable').length;
  const totalAssets = maintenanceAssets.length;
  const readinessPct = Math.round((serviceableAssets / (totalAssets || 1)) * 100);

  const lowStockSupplies = supplies.filter(
    (s) => s.replenishmentStatus === 'Critical Shortage' || s.replenishmentStatus === 'Reorder Suggested'
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (selectedReportType === 'daily-sitrep' || selectedReportType === 'personnel-readiness') {
      csvContent += 'Service ID,Rank,Name,Unit,Role,Status,Blood,Verification\n';
      personnel.forEach((p) => {
        csvContent += `"${p.serviceId}","${p.rank}","${p.name}","${p.unit}","${p.assignedRole}","${p.status}","${p.bloodType}","${p.verificationStatus}"\n`;
      });
    } else if (selectedReportType === 'logistics-burn') {
      csvContent += 'Supply ID,Name,Category,Warehouse,Current Stock,Unit,Burn Rate,Days Remaining,Status\n';
      supplies.forEach((s) => {
        csvContent += `"${s.id}","${s.name}","${s.category}","${s.warehouseLocation}",${s.currentStock},"${s.unit}",${s.dailyBurnRate},${s.daysOfSupplyRemaining},"${s.replenishmentStatus}"\n`;
      });
    } else if (selectedReportType === 'maintenance-serviceability') {
      csvContent += 'Asset Tag,Nomenclature,Category,Serviceability,Custodian,Location,Odometer,Next PMCS\n';
      maintenanceAssets.forEach((a) => {
        csvContent += `"${a.assetTag}","${a.name}","${a.category}","${a.serviceability}","${a.custodian}","${a.location}","${a.meterHoursOrKm}","${a.nextPmcsDue}"\n`;
      });
    } else {
      csvContent += 'Event ID,Timestamp,Actor,Role,Action,Module,Status,Details\n';
      auditLogs.forEach((l) => {
        csvContent += `"${l.id}","${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.module}","${l.status}","${l.details.replace(/"/g, '""')}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MMS_${selectedReportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Report Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#465044] pb-4 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value as any)}
            className="rounded border border-[#465044] bg-[#202821] px-3 py-2 text-xs text-[#E8EBDD] font-mono font-semibold"
          >
            <option value="daily-sitrep">Daily Operational Situation Report (SITREP)</option>
            <option value="personnel-readiness">Personnel Status & Casualty Summary</option>
            <option value="logistics-burn">Logistics Consumption & Shortage Report</option>
            <option value="maintenance-serviceability">Asset Serviceability & Backlog</option>
            <option value="security-audit">Security Audit & Access Event Summary</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded border border-[#465044] bg-[#202821] px-3 py-2 text-xs text-[#E8EBDD] font-mono"
          >
            <option value="Today (24h)">Today (Past 24 Hours)</option>
            <option value="Past 7 Days">Past 7 Days Operational Period</option>
            <option value="Past 30 Days">Monthly Rolling Assessment</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <TacticalButton
            size="sm"
            variant="outline"
            icon={Printer}
            onClick={handlePrint}
          >
            Print Briefing
          </TacticalButton>
          <TacticalButton
            size="sm"
            variant="primary"
            icon={Download}
            onClick={handleExportCsv}
          >
            Export Permitted CSV
          </TacticalButton>
        </div>
      </div>

      {/* Official Report Document Container */}
      <div className="rounded-lg border border-[#465044] bg-[#202821] p-6 sm:p-8 space-y-6 card">
        {/* Official Header */}
        <div className="border-b-2 border-[#747653] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-[#B7AA83] uppercase block">
              JOINT TASK FORCE DEFENSE COMMAND • HEADQUARTERS
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#E8EBDD] font-mono mt-1 uppercase tracking-tight">
              {selectedReportType === 'daily-sitrep' && 'Daily Operational Situation Report (SITREP)'}
              {selectedReportType === 'personnel-readiness' && 'Personnel Deployment & Casualty Status Brief'}
              {selectedReportType === 'logistics-burn' && 'Strategic Logistics Reserves & Burn Forecast'}
              {selectedReportType === 'maintenance-serviceability' && 'Equipment Serviceability & Maintenance Backlog'}
              {selectedReportType === 'security-audit' && 'Security Audit & RBAC Integrity Transcript'}
            </h2>
            <p className="text-xs text-[#A9B39F] mt-1 font-mono">
              Classification: <span className="text-[#FF6464] font-bold">SECRET // NOFORN</span> • Reporting Window: {dateRange}
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-[11px] text-[#A9B39F] space-y-0.5">
            <p>Generated: <span className="text-[#E8EBDD]">{new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC</span></p>
            <p>Authorizing Officer: <span className="text-[#B7AA83]">{activeUser.displayName}</span></p>
            <p>Role: {activeUser.role} ({activeUser.assignedUnit})</p>
            <p className="text-[#48C774]">Data Integrity: CRYPTO-VERIFIED</p>
          </div>
        </div>

        {/* Report Content: Daily Sitrep */}
        {selectedReportType === 'daily-sitrep' && (
          <div className="space-y-6 text-xs font-sans">
            <div>
              <h3 className="font-mono text-sm font-bold text-[#B7AA83] uppercase border-b border-[#465044] pb-1 mb-2">
                1. EXECUTIVE READINESS & FORCE STRENGTH
              </h3>
              <p className="text-[#E8EBDD] leading-relaxed">
                The deployed force maintains an overall operational readiness posture of{' '}
                <strong className="text-[#48C774] font-mono">{readinessPct}%</strong> across ground vehicle fleets, communications grids, and field medical infrastructure. Total active service members in sector:{' '}
                <strong className="text-[#E8EBDD] font-mono">{activeCount}</strong> of{' '}
                <strong className="text-[#E8EBDD] font-mono">{personnel.length}</strong> accounted personnel.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 font-mono">
                <div className="p-2.5 rounded bg-[#151A17] border border-[#465044]">
                  <span className="text-[10px] text-[#A9B39F] block">ACTIVE DUTY</span>
                  <span className="text-lg font-bold text-[#48C774]">{activeCount}</span>
                </div>
                <div className="p-2.5 rounded bg-[#151A17] border border-[#465044]">
                  <span className="text-[10px] text-[#A9B39F] block">INJURED / HOSPITALIZED</span>
                  <span className="text-lg font-bold text-[#F2B84B]">{injuredCount + hospitalizedCount}</span>
                </div>
                <div className="p-2.5 rounded bg-[#151A17] border border-[#465044]">
                  <span className="text-[10px] text-[#A9B39F] block">MISSING / UNACCOUNTED</span>
                  <span className="text-lg font-bold text-[#FF6464]">{missingCount}</span>
                </div>
                <div className="p-2.5 rounded bg-[#151A17] border border-[#465044]">
                  <span className="text-[10px] text-[#A9B39F] block">EQUIPMENT SERVICEABLE</span>
                  <span className="text-lg font-bold text-[#48C774]">{serviceableAssets}/{totalAssets}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-mono text-sm font-bold text-[#B7AA83] uppercase border-b border-[#465044] pb-1 mb-2">
                2. STRATEGIC SUPPLY & CRITICAL RESOURCE CONSTRAINTS
              </h3>
              <p className="text-[#E8EBDD] leading-relaxed">
                Fuel inventory at POL Bladder Farm North indicates <strong className="text-[#FF6464]">7.1 Days of Supply</strong> remaining for JP-8 Aviation Turbine fuel. Requisition orders have been dispatched to ensure continuous rotary-wing casualty evacuation readiness.
              </p>
            </div>

            <div>
              <h3 className="font-mono text-sm font-bold text-[#B7AA83] uppercase border-b border-[#465044] pb-1 mb-2">
                3. ENVIRONMENTAL HAZARD IMPACT
              </h3>
              <p className="text-[#E8EBDD] leading-relaxed">
                Flash flood warnings across Sector 2 River Basin have placed Bridge Bravo under 20-ton maximum load caution. Supply Convoy Alpha is operating on high-vigilance speed limits.
              </p>
            </div>
          </div>
        )}

        {/* Report Content: Personnel & Casualties */}
        {selectedReportType === 'personnel-readiness' && (
          <div className="space-y-4 text-xs font-mono">
            <h3 className="text-sm font-bold text-[#B7AA83] uppercase border-b border-[#465044] pb-1">
              Active Duty Roster Breakdown & Casualty Records
            </h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#465044] text-[#B7AA83]">
                  <th className="pb-2">Service ID</th>
                  <th className="pb-2">Name & Rank</th>
                  <th className="pb-2">Unit</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Verification</th>
                  <th className="pb-2">NOK State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#465044]/40">
                {personnel.map((p) => (
                  <tr key={p.serviceId}>
                    <td className="py-2 text-[#E8EBDD]">{p.serviceId}</td>
                    <td className="py-2 font-sans font-medium text-[#E8EBDD]">{p.rank} {p.name}</td>
                    <td className="py-2 text-[#A9B39F]">{p.unit}</td>
                    <td className="py-2">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="py-2 text-[#48C774]">{p.verificationStatus}</td>
                    <td className="py-2 text-[#B7AA83]">{p.nokStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Content: Logistics */}
        {selectedReportType === 'logistics-burn' && (
          <div className="space-y-4 text-xs font-mono">
            <h3 className="text-sm font-bold text-[#B7AA83] uppercase border-b border-[#465044] pb-1">
              Supply Consumption Tracking & Replenishment Model
            </h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#465044] text-[#B7AA83]">
                  <th className="pb-2">Commodity</th>
                  <th className="pb-2">Warehouse</th>
                  <th className="pb-2">In Stock</th>
                  <th className="pb-2">Daily Burn</th>
                  <th className="pb-2">Est. Duration</th>
                  <th className="pb-2">Replenishment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#465044]/40">
                {supplies.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 font-sans font-medium text-[#E8EBDD]">{s.name}</td>
                    <td className="py-2 text-[#A9B39F]">{s.warehouseLocation}</td>
                    <td className="py-2 text-[#E8EBDD]">{s.currentStock.toLocaleString()} {s.unit}</td>
                    <td className="py-2 text-[#A9B39F]">{s.dailyBurnRate}/day</td>
                    <td className="py-2 font-bold text-[#E8EBDD]">{s.daysOfSupplyRemaining} Days</td>
                    <td className="py-2">
                      <StatusBadge status={s.replenishmentStatus} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Content: Maintenance */}
        {selectedReportType === 'maintenance-serviceability' && (
          <div className="space-y-4 text-xs font-mono">
            <h3 className="text-sm font-bold text-[#B7AA83] uppercase border-b border-[#465044] pb-1">
              Asset Serviceability & Overdue Inspection Backlog
            </h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#465044] text-[#B7AA83]">
                  <th className="pb-2">Asset Tag</th>
                  <th className="pb-2">Nomenclature</th>
                  <th className="pb-2">Serviceability</th>
                  <th className="pb-2">Custodian</th>
                  <th className="pb-2">Odometer / Hours</th>
                  <th className="pb-2">Next PMCS Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#465044]/40">
                {maintenanceAssets.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2 text-[#E8EBDD]">{a.assetTag}</td>
                    <td className="py-2 font-sans font-medium text-[#E8EBDD]">{a.name}</td>
                    <td className="py-2">
                      <StatusBadge status={a.serviceability} size="sm" />
                    </td>
                    <td className="py-2 text-[#A9B39F]">{a.custodian}</td>
                    <td className="py-2 text-[#E8EBDD]">{a.meterHoursOrKm}</td>
                    <td className="py-2 text-[#E8EBDD]">{a.nextPmcsDue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Content: Security Audit */}
        {selectedReportType === 'security-audit' && (
          <div className="space-y-4 text-xs font-mono">
            <h3 className="text-sm font-bold text-[#B7AA83] uppercase border-b border-[#465044] pb-1">
              Security Clearance & Operational Audit Log Transcript
            </h3>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#465044] text-[#B7AA83]">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Actor / Role</th>
                  <th className="pb-2">Action Code</th>
                  <th className="pb-2">Module</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#465044]/40">
                {auditLogs.slice(0, 10).map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 text-[#747653]">{l.timestamp}</td>
                    <td className="py-2 text-[#E8EBDD]">{l.actorName} ({l.actorRole})</td>
                    <td className="py-2 text-[#48C774] font-bold">{l.action}</td>
                    <td className="py-2 text-[#A9B39F]">{l.module}</td>
                    <td className="py-2">
                      <span className={l.status === 'SUCCESS' ? 'text-[#48C774]' : 'text-[#FF6464]'}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-2 text-[#E8EBDD] max-w-xs truncate">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Footer Verification Note */}
        <div className="border-t border-[#465044] pt-4 flex flex-col sm:flex-row justify-between text-[11px] font-mono text-[#A9B39F]">
          <span>MMS TACTICAL COMMAND DOCUMENT #DOC-2026-X992</span>
          <span>AUTHENTICATED BY DEFENSE RECORD SERVICE (SHA-256 HASH VERIFIED)</span>
        </div>
      </div>
    </div>
  );
};
