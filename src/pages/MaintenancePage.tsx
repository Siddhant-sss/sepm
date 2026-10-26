import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Check,
  FileText,
  Calendar,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useTacticalStore } from '../hooks/useTacticalStore';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TacticalButton } from '../components/common/TacticalButton';
import { TacticalModal } from '../components/common/TacticalModal';
import { TacticalInput, TacticalSelect, TacticalTextarea } from '../components/common/TacticalInputs';
import { MaintenanceAsset, MaintenanceFaultTicket, AssetServiceability } from '../types';

export const MaintenancePage: React.FC = () => {
  const { store, activeUser, maintenanceAssets } = useTacticalStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [serviceabilityFilter, setServiceabilityFilter] = useState('ALL');

  // Modals
  const [selectedAssetForTicket, setSelectedAssetForTicket] = useState<MaintenanceAsset | null>(null);
  const [newFaultDescription, setNewFaultDescription] = useState('');
  const [newFaultSeverity, setNewFaultSeverity] = useState<MaintenanceFaultTicket['severity']>('High');
  const [newAssignedTech, setNewAssignedTech] = useState('Cpl. Thornton, James');

  const [inspectAssetModal, setInspectAssetModal] = useState<MaintenanceAsset | null>(null);
  const [inspectorNotes, setInspectorNotes] = useState('Complete 240-point technical inspection passed. O-rings and torque specifications verified.');

  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const isMaintenanceOfficer = ['System Administrator', 'Maintenance Officer'].includes(activeUser.role);

  // Filter assets
  const filteredAssets = maintenanceAssets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.custodian.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = serviceabilityFilter === 'ALL' || a.serviceability === serviceabilityFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const total = maintenanceAssets.length;
  const serviceable = maintenanceAssets.filter((a) => a.serviceability === 'Serviceable').length;
  const underRepair = maintenanceAssets.filter((a) => a.serviceability === 'Under Repair').length;
  const overdueCount = maintenanceAssets.filter((a) => a.overdue).length;
  const readinessPct = Math.round((serviceable / (total || 1)) * 100);

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForTicket || !newFaultDescription) return;

    const res = store.createFaultTicket(selectedAssetForTicket.id, {
      reportedBy: activeUser.displayName,
      faultDescription: newFaultDescription,
      severity: newFaultSeverity,
      stage: 'Reported',
      assignedTechnician: newAssignedTech,
      replacedParts: [],
    });

    setFeedbackMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setSelectedAssetForTicket(null);
      setNewFaultDescription('');
    }
  };

  const handleAdvanceStage = (
    assetId: string,
    ticketId: string,
    currentStage: MaintenanceFaultTicket['stage']
  ) => {
    const stageFlow: Record<MaintenanceFaultTicket['stage'], MaintenanceFaultTicket['stage']> = {
      Reported: 'Diagnosis',
      Diagnosis: 'In Repair',
      'In Repair': 'Testing',
      Testing: 'Awaiting Sign-off',
      'Awaiting Sign-off': 'Closed',
      Closed: 'Closed',
    };
    const nextStage = stageFlow[currentStage];
    const res = store.advanceMaintenanceStage(assetId, ticketId, nextStage);
    setFeedbackMsg({ text: res.message, error: !res.success });
  };

  const handleAuthorizeServiceability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectAssetModal) return;

    const res = store.authorizeAssetReturnToService(inspectAssetModal.id, activeUser.displayName);
    setFeedbackMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setInspectAssetModal(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`rounded-lg border p-3 text-xs flex items-center justify-between ${
            feedbackMsg.error
              ? 'border-[#FF6464] bg-[#FF6464]/15 text-[#FF6464]'
              : 'border-[#48C774] bg-[#48C774]/15 text-[#48C774]'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="underline font-mono">
            Dismiss
          </button>
        </div>
      )}

      {/* Enforcement Rule Banner */}
      <div className="rounded-lg border border-[#465044] bg-[#202821] p-3 text-xs text-[#A9B39F] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-[#48C774]" size={16} />
          <span>
            <strong>Serviceability Enforcement Protocol:</strong> Assets under repair or overdue for PMCS cannot return to "Serviceable" status without recorded technical verification by an authorized Maintenance Officer.
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#48C774] bg-[#151A17] px-2 py-0.5 rounded border border-[#465044]">
          READINESS INDEX: {readinessPct}%
        </span>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-xs font-mono text-[#A9B39F] uppercase">Fleet / Asset Count</p>
          <p className="text-2xl font-bold font-mono text-[#E8EBDD] mt-1 tabular-nums">{total}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-xs font-mono text-[#A9B39F] uppercase">Combat Serviceable</p>
          <p className="text-2xl font-bold font-mono text-[#48C774] mt-1 tabular-nums">
            {serviceable} ({readinessPct}%)
          </p>
        </div>
        <div className="p-4 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-xs font-mono text-[#A9B39F] uppercase">Active In-Shop Repairs</p>
          <p className="text-2xl font-bold font-mono text-[#F2B84B] mt-1 tabular-nums">{underRepair}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-xs font-mono text-[#A9B39F] uppercase">Overdue PMCS</p>
          <p className="text-2xl font-bold font-mono text-[#FF6464] mt-1 tabular-nums">{overdueCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-[#202821] p-3 rounded-lg border border-[#465044]">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-[#747653]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assets by tag (e.g. VEH-JLTV-401), name, or custodian..."
            className="w-full rounded border border-[#465044] bg-[#151A17] pl-9 pr-3 py-1.5 text-xs text-[#E8EBDD] placeholder-[#747653] focus:border-[#747653] focus:outline-none"
          />
        </div>

        <select
          value={serviceabilityFilter}
          onChange={(e) => setServiceabilityFilter(e.target.value)}
          className="rounded border border-[#465044] bg-[#151A17] px-2.5 py-1.5 text-xs text-[#E8EBDD] font-mono"
        >
          <option value="ALL">All Serviceability States</option>
          <option value="Serviceable">Serviceable (Ready for Combat)</option>
          <option value="Restricted">Restricted (Defects / PMCS Overdue)</option>
          <option value="Under Repair">Under Repair (In Motor Pool)</option>
          <option value="Awaiting Inspection">Awaiting Inspection</option>
          <option value="Retired">Retired / Salvaged</option>
        </select>
      </div>

      {/* Asset Registry Cards & Multi-Stage Tickets */}
      <div className="space-y-4">
        {filteredAssets.map((asset) => (
          <TacticalCard
            key={asset.id}
            title={`${asset.assetTag} — ${asset.name}`}
            subtitle={`Custodian: ${asset.custodian} • Location: ${asset.location} • Odometer: ${asset.meterHoursOrKm}`}
            badge={<StatusBadge status={asset.serviceability} size="sm" />}
            headerAction={
              <div className="flex items-center gap-2">
                {isMaintenanceOfficer && asset.serviceability !== 'Serviceable' && (
                  <TacticalButton
                    size="sm"
                    variant="primary"
                    icon={ShieldCheck}
                    onClick={() => setInspectAssetModal(asset)}
                  >
                    Certify Serviceability
                  </TacticalButton>
                )}
                {isMaintenanceOfficer && (
                  <TacticalButton
                    size="sm"
                    variant="outline"
                    icon={Plus}
                    onClick={() => setSelectedAssetForTicket(asset)}
                  >
                    Open Fault Ticket
                  </TacticalButton>
                )}
              </div>
            }
          >
            <div className="space-y-4 text-xs">
              {/* PMCS Status Details */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded bg-[#151A17] border border-[#465044] font-mono text-[11px]">
                <span>Last PMCS: {asset.lastPmcsDate}</span>
                <span>
                  Next PMCS Due:{' '}
                  <strong className={asset.overdue ? 'text-[#FF6464]' : 'text-[#48C774]'}>
                    {asset.nextPmcsDue} {asset.overdue && '(OVERDUE)'}
                  </strong>
                </span>
                <span>Category: {asset.category}</span>
              </div>

              {/* Fault Tickets Pipeline */}
              {asset.faultTickets.length === 0 ? (
                <div className="py-2 text-[#A9B39F] font-mono text-[11px]">
                  ✔ No outstanding repair tickets on this asset.
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-semibold text-xs text-[#B7AA83] font-mono uppercase">
                    Active Repair Tickets ({asset.faultTickets.length})
                  </p>
                  {asset.faultTickets.map((t) => (
                    <div
                      key={t.ticketId}
                      className="p-3 rounded border border-[#465044] bg-[#1a211b] space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-[#E8EBDD] font-mono">{t.ticketId}</span>
                          <span className="text-[#A9B39F] ml-2">Reported: {t.reportedDate} by {t.reportedBy}</span>
                        </div>
                        <StatusBadge status={t.severity} size="sm" />
                      </div>

                      <p className="text-[#E8EBDD] font-sans">{t.faultDescription}</p>

                      {/* Multi-stage repair progression indicator */}
                      <div className="pt-2 border-t border-[#465044]/60 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-[#A9B39F]">Current Stage:</span>
                          <span className="text-[#F2B84B] font-bold uppercase">{t.stage}</span>
                          <span className="text-[#747653]">• Tech: {t.assignedTechnician}</span>
                          {t.replacedParts.length > 0 && (
                            <span className="text-[#A9B39F]">
                              • Parts: {t.replacedParts.join(', ')}
                            </span>
                          )}
                        </div>

                        {isMaintenanceOfficer && t.stage !== 'Closed' && (
                          <TacticalButton
                            size="sm"
                            variant="secondary"
                            onClick={() => handleAdvanceStage(asset.id, t.ticketId, t.stage)}
                          >
                            Advance Stage →
                          </TacticalButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TacticalCard>
        ))}
      </div>

      {/* Modal 1: Open Fault Ticket */}
      <TacticalModal
        isOpen={!!selectedAssetForTicket}
        onClose={() => setSelectedAssetForTicket(null)}
        title={`Open Maintenance Ticket: ${selectedAssetForTicket?.assetTag}`}
        subtitle={`Asset: ${selectedAssetForTicket?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleCreateTicketSubmit} className="space-y-4 text-xs">
          <TacticalTextarea
            label="Fault Symptoms & Failure Description"
            placeholder="e.g. Hydraulic line pressure loss observed during high rpm test..."
            value={newFaultDescription}
            onChange={(e) => setNewFaultDescription(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <TacticalSelect
              label="Fault Severity"
              value={newFaultSeverity}
              onChange={(e) =>
                setNewFaultSeverity(e.target.value as MaintenanceFaultTicket['severity'])
              }
            >
              <option value="Low">Low (Cosmetic / Non-critical)</option>
              <option value="Medium">Medium (Operable with limitations)</option>
              <option value="High">High (Deadlined / Restricted)</option>
              <option value="Critical">Critical (Immediate Hazard)</option>
            </TacticalSelect>

            <TacticalInput
              label="Assigned Lead Technician"
              value={newAssignedTech}
              onChange={(e) => setNewAssignedTech(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#465044]">
            <TacticalButton variant="outline" size="sm" onClick={() => setSelectedAssetForTicket(null)}>
              Cancel
            </TacticalButton>
            <TacticalButton type="submit" variant="primary" size="sm">
              Register Ticket
            </TacticalButton>
          </div>
        </form>
      </TacticalModal>

      {/* Modal 2: Technical Serviceability Certification */}
      <TacticalModal
        isOpen={!!inspectAssetModal}
        onClose={() => setInspectAssetModal(null)}
        title={`Authorized Serviceability Certification: ${inspectAssetModal?.assetTag}`}
        subtitle="Mandatory inspection verification before returning equipment to active duty"
        maxWidth="md"
      >
        <form onSubmit={handleAuthorizeServiceability} className="space-y-4 text-xs">
          <p className="text-[#E8EBDD]">
            By certifying, you verify that all outstanding faults on{' '}
            <strong>{inspectAssetModal?.name}</strong> have been repaired, calibrated, and road/field tested in accordance with Army Maintenance Directives.
          </p>

          <TacticalTextarea
            label="Inspector Technical Verification Notes"
            value={inspectorNotes}
            onChange={(e) => setInspectorNotes(e.target.value)}
            required
          />

          <div className="p-3 bg-[#151A17] rounded border border-[#465044] font-mono text-[11px] text-[#A9B39F] space-y-1">
            <p className="text-[#48C774] font-semibold">CERTIFICATION CREDENTIALS:</p>
            <p>Certifying Officer: {activeUser.displayName}</p>
            <p>Role: {activeUser.role}</p>
            <p>Next PMCS Reset: +30 Days</p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#465044]">
            <TacticalButton variant="outline" size="sm" onClick={() => setInspectAssetModal(null)}>
              Cancel
            </TacticalButton>
            <TacticalButton type="submit" variant="primary" size="sm">
              Authorize Return to Serviceable
            </TacticalButton>
          </div>
        </form>
      </TacticalModal>
    </div>
  );
};
