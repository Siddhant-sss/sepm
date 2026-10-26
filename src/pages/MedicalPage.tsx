import React, { useState } from 'react';
import {
  HeartPulse,
  Activity,
  Bed,
  Droplet,
  Phone,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Clock,
  Send,
  Lock,
} from 'lucide-react';
import { useTacticalStore } from '../hooks/useTacticalStore';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TacticalButton } from '../components/common/TacticalButton';
import { TacticalModal } from '../components/common/TacticalModal';
import { MedicalFacility } from '../types';

export const MedicalPage: React.FC = () => {
  const { store, activeUser, medicalFacilities, casualties } = useTacticalStore();

  const [selectedFacility, setSelectedFacility] = useState<MedicalFacility>(medicalFacilities[0]);
  const [bloodRequisitionModal, setBloodRequisitionModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const isMedicalOfficer = ['System Administrator', 'Medical Officer'].includes(activeUser.role);

  // Active medevac transfer requests
  const activeMedevacTransfers = casualties.filter(
    (c) => c.medevacRequested && c.returnToDutyStatus !== 'Cleared Full Duty'
  );

  const handleEscalateSurge = (facilityId: string) => {
    store.addAuditLog(
      'MASS_CASUALTY_SURGE_DECLARED',
      'Medical & Emergency',
      `Declared Emergency Surge Protocol at ${facilityId} by ${activeUser.displayName}`,
      'SUCCESS',
      facilityId
    );
    store.addNotification(
      'MASS CASUALTY PROTOCOL ACTIVATED',
      `Forward Surgical Facility Alpha has declared Surge Alert. Diverting non-critical trauma to Regional Hospital.`,
      'Medical & Emergency Management',
      'Critical',
      'medical'
    );
    setFeedbackMsg({ text: 'Emergency Surge Alert broadcast to all forward operating elements.' });
  };

  const handleBloodRequisition = () => {
    store.addAuditLog(
      'EMERGENCY_BLOOD_DISPATCH_REQUESTED',
      'Medical & Emergency',
      `Requested 20 Units of O-Negative Blood Cold Chain Delivery from Central Military Blood Bank.`,
      'SUCCESS'
    );
    setBloodRequisitionModal(false);
    setFeedbackMsg({ text: 'Cold-chain Blood Courier dispatched via 12th Aviation Regiment Falcon-6.' });
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

      {/* Medical Governance Notice */}
      <div className="rounded-lg border border-[#465044] bg-[#202821] p-3 text-xs text-[#A9B39F] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulse className="text-[#48C774]" size={16} />
          <span>
            <strong>Healthcare Privacy & Triage Doctrine:</strong> In accordance with DoD Directive 6000.12, medical decisions reflect professional judgment of certified military physicians. Automated triage algorithms provide coordination support only.
          </span>
        </div>
        {!isMedicalOfficer && (
          <span className="flex items-center gap-1 text-[11px] font-mono text-[#F2B84B] bg-[#151A17] px-2 py-0.5 rounded border border-[#465044]">
            <Lock size={12} /> RESTRICTED (PHYSICIAN ACCESS)
          </span>
        )}
      </div>

      {/* Facilities Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {medicalFacilities.map((fac) => {
          const isSelected = selectedFacility.id === fac.id;
          const bedPct = Math.round((fac.occupiedBeds / (fac.totalBeds || 1)) * 100);
          return (
            <div
              key={fac.id}
              onClick={() => setSelectedFacility(fac)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#B7AA83] bg-[#263128] shadow-raised'
                  : 'border-[#465044] bg-[#202821] hover:bg-[#263128]/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#E8EBDD] font-mono">{fac.name}</h3>
                  <p className="text-xs text-[#B7AA83] font-mono">{fac.echelonRole}</p>
                </div>
                <StatusBadge status={fac.emergencyResponseStatus} size="sm" />
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-[#A9B39F]">Bed Utilization:</span>
                    <span className="text-[#E8EBDD] font-bold tabular-nums">
                      {fac.occupiedBeds} / {fac.totalBeds} ({bedPct}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded bg-[#151A17] overflow-hidden mt-1">
                    <div
                      className={`h-full ${
                        bedPct > 80 ? 'bg-[#FF6464]' : bedPct > 60 ? 'bg-[#F2B84B]' : 'bg-[#48C774]'
                      }`}
                      style={{ width: `${bedPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[11px] font-mono pt-1 text-[#A9B39F]">
                  <span>ICU Occupied: {fac.occupiedIcuBeds}/{fac.icuBeds}</span>
                  <span>Surgical Suites: {fac.surgicalActive}/{fac.surgicalTheaters}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Facility Deep Dive & Blood Bank Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Selected Facility Details & Active Patient Pipeline */}
        <div className="lg:col-span-2 space-y-6">
          <TacticalCard
            title={`Facility Profile: ${selectedFacility.name}`}
            subtitle={`Location: ${selectedFacility.location} • Contact: ${selectedFacility.contactAuthority}`}
            headerAction={
              isMedicalOfficer && (
                <TacticalButton
                  size="sm"
                  variant="warning"
                  onClick={() => handleEscalateSurge(selectedFacility.id)}
                >
                  Declare Surge Alert
                </TacticalButton>
              )
            }
          >
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#151A17] rounded border border-[#465044] font-mono">
                <div>
                  <span className="text-[#A9B39F] text-[10px] block">TOTAL BEDS</span>
                  <span className="text-base font-bold text-[#E8EBDD]">{selectedFacility.totalBeds}</span>
                </div>
                <div>
                  <span className="text-[#A9B39F] text-[10px] block">AVAILABLE BEDS</span>
                  <span className="text-base font-bold text-[#48C774]">
                    {selectedFacility.totalBeds - selectedFacility.occupiedBeds}
                  </span>
                </div>
                <div>
                  <span className="text-[#A9B39F] text-[10px] block">CRITICAL ICU</span>
                  <span className="text-base font-bold text-[#62B7E8]">
                    {selectedFacility.icuBeds - selectedFacility.occupiedIcuBeds} Open
                  </span>
                </div>
                <div>
                  <span className="text-[#A9B39F] text-[10px] block">SURGICAL SUITES</span>
                  <span className="text-base font-bold text-[#B7AA83]">
                    {selectedFacility.surgicalActive} / {selectedFacility.surgicalTheaters} Active
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[#B7AA83] font-mono text-[11px] uppercase block font-semibold">
                  Authorized Medical Point of Contact:
                </span>
                <p className="text-[#E8EBDD] mt-0.5">
                  {selectedFacility.contactAuthority} • Direct Telecommunications:{' '}
                  <span className="font-mono text-[#B7AA83]">{selectedFacility.contactPhone}</span>
                </p>
              </div>
            </div>
          </TacticalCard>

          {/* Active Medevac Evacuation Pipeline */}
          <TacticalCard
            title="Medevac Evacuation & Transfer Pipeline"
            subtitle="Real-time patient transit tracking and hospital reception status"
          >
            <div className="space-y-3">
              {activeMedevacTransfers.length === 0 ? (
                <div className="py-6 text-center text-[#A9B39F]">
                  <p className="text-xs font-mono">No active medevac patient transfers currently in transit.</p>
                </div>
              ) : (
                activeMedevacTransfers.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded border border-[#465044] bg-[#1a211b] text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-[#E8EBDD] font-mono">{item.id}</span>
                        <span className="text-[#A9B39F] ml-2">({item.personnelName} - {item.unit})</span>
                      </div>
                      <StatusBadge status={item.severity} size="sm" />
                    </div>

                    <p className="text-[#E8EBDD]">{item.incidentType}</p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[#747653] pt-1 border-t border-[#465044]/60">
                      <span>Dest: {item.receivingFacilityName}</span>
                      <span className="text-[#62B7E8]">Medevac: {item.medevacStatus}</span>
                      <span className="text-[#B7AA83]">RTD: {item.returnToDutyStatus}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TacticalCard>
        </div>

        {/* Right Column (1 span): Authorized Blood Bank Inventory */}
        <div className="space-y-6">
          <TacticalCard
            title="Blood Bank Reserve Units"
            subtitle={`${selectedFacility.name} Cold Vault`}
            headerAction={
              isMedicalOfficer && (
                <TacticalButton
                  size="sm"
                  variant="outline"
                  icon={Droplet}
                  onClick={() => setBloodRequisitionModal(true)}
                >
                  Request Courier
                </TacticalButton>
              )
            }
          >
            <div className="space-y-3">
              {selectedFacility.bloodInventory.map((blood) => {
                const isCritical = blood.unitsAvailable <= blood.minThreshold;
                return (
                  <div
                    key={blood.bloodType}
                    className="p-2.5 rounded border border-[#465044] bg-[#151A17] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#FF6464]/20 border border-[#FF6464]/60 flex items-center justify-center font-bold font-mono text-[#FF6464]">
                        {blood.bloodType}
                      </div>
                      <div>
                        <span className="font-semibold text-[#E8EBDD] font-mono">{blood.bloodType} Packed RBCs</span>
                        <p className="text-[10px] text-[#A9B39F] font-mono">
                          Min Buffer: {blood.minThreshold} Units
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span
                        className={`text-sm font-bold tabular-nums block ${
                          isCritical ? 'text-[#FF6464]' : 'text-[#48C774]'
                        }`}
                      >
                        {blood.unitsAvailable} Units
                      </span>
                      {blood.expiresSoonUnits > 0 && (
                        <span className="text-[10px] text-[#F2B84B]">
                          {blood.expiresSoonUnits} exp. &lt;7d
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TacticalCard>
        </div>
      </div>

      {/* Modal: Blood Requisition */}
      <TacticalModal
        isOpen={bloodRequisitionModal}
        onClose={() => setBloodRequisitionModal(false)}
        title="Emergency Blood Reserve Resupply Order"
        subtitle="Requests high-priority cold-chain aeromedical blood courier"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#E8EBDD]">
            Order 20 units of universal O-Negative donor packed red blood cells for delivery to{' '}
            <strong>{selectedFacility.name}</strong>.
          </p>
          <div className="p-3 bg-[#151A17] rounded border border-[#465044] font-mono text-[11px] text-[#A9B39F] space-y-1">
            <p className="text-[#B7AA83] font-semibold">COLD CHAIN TRANSPORT PROTOCOL:</p>
            <p>Packaging: Active Stirling Cooling Box (1°C - 6°C)</p>
            <p>Carrier: UH-60M Medevac Falcon-6</p>
            <p>Physician Approval: {activeUser.displayName}</p>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-[#465044]">
            <TacticalButton variant="outline" size="sm" onClick={() => setBloodRequisitionModal(false)}>
              Cancel
            </TacticalButton>
            <TacticalButton variant="primary" size="sm" onClick={handleBloodRequisition}>
              Dispatch Flight Courier
            </TacticalButton>
          </div>
        </div>
      </TacticalModal>
    </div>
  );
};
