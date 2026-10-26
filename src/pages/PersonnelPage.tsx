import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  HeartPulse,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  Phone,
  Eye,
  Check,
  Lock,
} from 'lucide-react';
import { useTacticalStore } from '../hooks/useTacticalStore';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TacticalButton } from '../components/common/TacticalButton';
import { TacticalModal } from '../components/common/TacticalModal';
import { TacticalInput, TacticalSelect, TacticalTextarea } from '../components/common/TacticalInputs';
import { Personnel, CasualtyIncident, PersonnelStatus, VerificationStatus } from '../types';

export const PersonnelPage: React.FC = () => {
  const { store, activeUser, personnel, casualties, medicalFacilities } = useTacticalStore();

  const [activeTab, setActiveTab] = useState<'roster' | 'casualties'>('roster');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [unitFilter, setUnitFilter] = useState<string>('ALL');

  // Modals
  const [showAddPersonnelModal, setShowAddPersonnelModal] = useState(false);
  const [showLogCasualtyModal, setShowLogCasualtyModal] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [returnToDutyIncident, setReturnToDutyIncident] = useState<CasualtyIncident | null>(null);
  const [newRtdStatus, setNewRtdStatus] = useState<CasualtyIncident['returnToDutyStatus']>('Cleared Full Duty');

  // Form states for Add Personnel
  const [newPerson, setNewPerson] = useState({
    serviceId: '',
    name: '',
    rank: 'Sergeant (E-5)',
    unit: '1st Recon Battalion',
    assignedRole: 'Rifleman',
    status: 'Active' as PersonnelStatus,
    bloodType: 'O POS',
    verificationStatus: 'Confirmed' as VerificationStatus,
    phone: '+1 (555) 000-0000',
    emergencyContact: '',
    emergencyPhone: '',
  });

  // Form states for Log Casualty
  const [newCasualty, setNewCasualty] = useState({
    serviceId: '',
    incidentReference: `INC-GRID-${Math.floor(Math.random() * 899) + 100}`,
    incidentType: 'IED Blast / Concussive Impact',
    severity: 'Moderate' as CasualtyIncident['severity'],
    verificationStatus: 'Confirmed' as VerificationStatus,
    medevacRequested: true,
    receivingFacilityId: medicalFacilities[0]?.id || 'MED-FAC-01',
    notes: '',
  });

  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Role permissions checks
  const canEditPersonnel = ['System Administrator', 'Personnel Officer', 'Command Supervisor'].includes(activeUser.role);
  const canClearRtd = ['System Administrator', 'Medical Officer'].includes(activeUser.role);
  const canViewSensitiveNok = ['System Administrator', 'Personnel Officer', 'Command Supervisor'].includes(activeUser.role);

  // Filters for Personnel
  const filteredPersonnel = personnel.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assignedRole.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesUnit = unitFilter === 'ALL' || p.unit.toLowerCase().includes(unitFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesUnit;
  });

  // Filters for Casualties
  const filteredCasualties = casualties.filter((c) => {
    return (
      c.personnelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.serviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.incidentReference.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Check for duplicate / conflicting reports
  const duplicateServiceIds = casualties
    .map((c) => c.serviceId)
    .filter((id, idx, arr) => arr.indexOf(id) !== idx);

  const handleAddPersonnelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPerson.serviceId || !newPerson.name) {
      setFeedbackMsg({ text: 'Service ID and Full Name are mandatory.', error: true });
      return;
    }

    const res = store.addPersonnel({
      serviceId: newPerson.serviceId,
      name: newPerson.name,
      rank: newPerson.rank,
      unit: newPerson.unit,
      assignedRole: newPerson.assignedRole,
      status: newPerson.status,
      contactInfo: {
        phone: newPerson.phone,
        emergencyContact: newPerson.emergencyContact || 'Pending Submission',
        emergencyPhone: newPerson.emergencyPhone || 'N/A',
      },
      bloodType: newPerson.bloodType,
      verificationStatus: newPerson.verificationStatus,
      nokStatus: 'Not Applicable',
      assignedEquipment: [],
    });

    if (res.success) {
      setShowAddPersonnelModal(false);
      setFeedbackMsg({ text: res.message });
      setNewPerson({
        serviceId: '',
        name: '',
        rank: 'Sergeant (E-5)',
        unit: '1st Recon Battalion',
        assignedRole: 'Rifleman',
        status: 'Active',
        bloodType: 'O POS',
        verificationStatus: 'Confirmed',
        phone: '+1 (555) 000-0000',
        emergencyContact: '',
        emergencyPhone: '',
      });
    } else {
      setFeedbackMsg({ text: res.message, error: true });
    }
  };

  const handleLogCasualtySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedSoldier = personnel.find((p) => p.serviceId === newCasualty.serviceId);
    if (!matchedSoldier) {
      setFeedbackMsg({ text: 'Select a valid service member from the roster.', error: true });
      return;
    }

    const targetFacility = medicalFacilities.find((f) => f.id === newCasualty.receivingFacilityId);

    const res = store.fileCasualtyIncident({
      serviceId: matchedSoldier.serviceId,
      personnelName: matchedSoldier.name,
      unit: matchedSoldier.unit,
      incidentReference: newCasualty.incidentReference,
      incidentType: newCasualty.incidentType,
      severity: newCasualty.severity,
      reportingAuthority: activeUser.displayName,
      verificationStatus: newCasualty.verificationStatus,
      medevacRequested: newCasualty.medevacRequested,
      medevacStatus: newCasualty.medevacRequested ? 'Pending' : 'N/A',
      receivingFacilityId: newCasualty.receivingFacilityId,
      receivingFacilityName: targetFacility ? targetFacility.name : 'Aid Station Alpha',
      returnToDutyStatus: 'Not Cleared',
      nokNotificationState: 'Pending',
    });

    if (res.success) {
      setShowLogCasualtyModal(false);
      setFeedbackMsg({ text: res.message });
    } else {
      setFeedbackMsg({ text: res.message, error: true });
    }
  };

  const handleVerifyCasualty = (incidentId: string) => {
    const res = store.verifyCasualtyIncident(incidentId);
    setFeedbackMsg({ text: res.message, error: !res.success });
  };

  const handleReturnToDutySubmit = () => {
    if (!returnToDutyIncident) return;
    const res = store.updateReturnToDuty(returnToDutyIncident.id, newRtdStatus);
    setFeedbackMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setReturnToDutyIncident(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
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

      {/* Conflicting reports detection notification */}
      {duplicateServiceIds.length > 0 && (
        <div className="rounded-lg border border-[#F2B84B] bg-[#F2B84B]/10 p-3 text-[#F2B84B] text-xs flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            <strong>Conflict Detection Alert:</strong> Multiple casualty reports exist for Service Member{' '}
            <code className="font-mono bg-[#151A17] px-1 py-0.5 rounded">{duplicateServiceIds.join(', ')}</code>.
            Verify details to prevent double counting.
          </span>
        </div>
      )}

      {/* Top Controls: Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#465044] pb-4">
        {/* Toggle between Personnel Roster & Casualty Log */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('roster')}
            className={`rounded-md px-4 py-2 text-xs font-mono font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'roster'
                ? 'bg-[#414B32] text-[#E8EBDD] border border-[#747653]'
                : 'text-[#A9B39F] hover:bg-[#202821] hover:text-[#E8EBDD]'
            }`}
          >
            <Users size={14} /> Personnel Directory ({personnel.length})
          </button>
          <button
            onClick={() => setActiveTab('casualties')}
            className={`rounded-md px-4 py-2 text-xs font-mono font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'casualties'
                ? 'bg-[#414B32] text-[#E8EBDD] border border-[#747653]'
                : 'text-[#A9B39F] hover:bg-[#202821] hover:text-[#E8EBDD]'
            }`}
          >
            <HeartPulse size={14} /> Casualty Incident Log ({casualties.length})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canEditPersonnel && (
            <TacticalButton
              size="sm"
              variant="outline"
              icon={Plus}
              onClick={() => setShowAddPersonnelModal(true)}
            >
              Add Personnel
            </TacticalButton>
          )}
          <TacticalButton
            size="sm"
            variant="danger"
            icon={HeartPulse}
            onClick={() => setShowLogCasualtyModal(true)}
          >
            Report Casualty
          </TacticalButton>
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
            placeholder="Search by Service ID, Name, Rank, or Incident Ref..."
            className="w-full rounded border border-[#465044] bg-[#151A17] pl-9 pr-3 py-1.5 text-xs text-[#E8EBDD] placeholder-[#747653] focus:border-[#747653] focus:outline-none"
          />
        </div>

        {activeTab === 'roster' && (
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-[#465044] bg-[#151A17] px-2.5 py-1.5 text-xs text-[#E8EBDD] font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Injured">Injured</option>
              <option value="Hospitalized">Hospitalized</option>
              <option value="Missing">Missing</option>
              <option value="Deceased">Deceased</option>
              <option value="Temporarily Unavailable">Temporarily Unavailable</option>
            </select>

            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="rounded border border-[#465044] bg-[#151A17] px-2.5 py-1.5 text-xs text-[#E8EBDD] font-mono"
            >
              <option value="ALL">All Units</option>
              <option value="1st Recon">1st Recon Battalion</option>
              <option value="4th Mechanized">4th Mechanized Brigade</option>
              <option value="8th Support">8th Support Group</option>
              <option value="12th Aviation">12th Aviation Regiment</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Table: Personnel Roster */}
      {activeTab === 'roster' && (
        <TacticalCard noPadding title="Active Personnel Registry" subtitle="Unit assignments, combat status & verification flags">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#465044] bg-[#1c231e] text-[#B7AA83] font-mono uppercase">
                  <th className="py-3 px-4">Service ID</th>
                  <th className="py-3 px-4">Rank & Full Name</th>
                  <th className="py-3 px-4">Assigned Unit</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Blood</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#465044]/50 font-mono">
                {filteredPersonnel.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#A9B39F]">
                      No personnel records match the specified filters.
                    </td>
                  </tr>
                ) : (
                  filteredPersonnel.map((p) => (
                    <tr key={p.serviceId} className="hover:bg-[#263128]/60 transition-colors">
                      <td className="py-3 px-4 text-[#B7AA83] font-bold">{p.serviceId}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className="font-semibold text-[#E8EBDD] block">{p.name}</span>
                        <span className="text-[11px] text-[#A9B39F] font-mono">{p.rank}</span>
                      </td>
                      <td className="py-3 px-4 text-[#E8EBDD] font-sans">{p.unit}</td>
                      <td className="py-3 px-4 text-[#A9B39F] font-sans">{p.assignedRole}</td>
                      <td className="py-3 px-4 text-[#E8EBDD]">{p.bloodType}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            p.verificationStatus === 'Confirmed'
                              ? 'bg-[#48C774]/15 text-[#48C774] border border-[#48C774]/40'
                              : 'bg-[#F2B84B]/15 text-[#F2B84B] border border-[#F2B84B]/40'
                          }`}
                        >
                          {p.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedPersonnel(p)}
                          className="rounded border border-[#465044] bg-[#151A17] p-1.5 text-[#A9B39F] hover:text-[#E8EBDD] hover:border-[#747653] transition-colors"
                          title="View Personnel Dossier"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TacticalCard>
      )}

      {/* Main Table: Casualties Log */}
      {activeTab === 'casualties' && (
        <TacticalCard
          noPadding
          title="Casualty Incidents & Medical Evacuation Log"
          subtitle="Verification state, medevac destination & next-of-kin delivery tracking"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#465044] bg-[#1c231e] text-[#B7AA83] font-mono uppercase">
                  <th className="py-3 px-4">Incident Ref / Time</th>
                  <th className="py-3 px-4">Service Member</th>
                  <th className="py-3 px-4">Incident Type & Severity</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Medevac & Facility</th>
                  <th className="py-3 px-4">Return to Duty</th>
                  <th className="py-3 px-4">NOK Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#465044]/50 font-mono">
                {filteredCasualties.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#A9B39F]">
                      No casualty records found.
                    </td>
                  </tr>
                ) : (
                  filteredCasualties.map((c) => (
                    <tr key={c.id} className="hover:bg-[#263128]/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#E8EBDD] block">{c.id}</span>
                        <span className="text-[11px] text-[#A9B39F] block">{c.incidentReference}</span>
                        <span className="text-[10px] text-[#747653] block">{c.timestamp}</span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="font-semibold text-[#E8EBDD] block">{c.personnelName}</span>
                        <span className="text-[11px] text-[#A9B39F] font-mono">{c.serviceId}</span>
                        <span className="text-[10px] text-[#747653] block">{c.unit}</span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="text-[#E8EBDD] block">{c.incidentType}</span>
                        <div className="mt-1">
                          <StatusBadge status={c.severity} size="sm" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block ${
                              c.verificationStatus === 'Confirmed'
                                ? 'bg-[#48C774]/15 text-[#48C774] border border-[#48C774]/40'
                                : 'bg-[#F2B84B]/15 text-[#F2B84B] border border-[#F2B84B]/40'
                            }`}
                          >
                            {c.verificationStatus}
                          </span>
                          {c.verificationStatus === 'Unverified' && canEditPersonnel && (
                            <button
                              onClick={() => handleVerifyCasualty(c.id)}
                              className="text-[10px] text-[#48C774] hover:underline block flex items-center gap-0.5"
                            >
                              <Check size={10} /> Confirm
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="text-[#E8EBDD] text-xs block">{c.receivingFacilityName}</span>
                        <span className="text-[10px] text-[#A9B39F] font-mono block">
                          Medevac: {c.medevacStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <StatusBadge status={c.returnToDutyStatus} size="sm" />
                          {c.clearedByMedicalOfficer && (
                            <span className="text-[10px] text-[#747653] block truncate">
                              Signed: {c.clearedByMedicalOfficer}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] font-mono ${
                            c.nokNotificationState === 'Delivered - In Person'
                              ? 'text-[#48C774]'
                              : c.nokNotificationState === 'Notified - Phone'
                              ? 'text-[#62B7E8]'
                              : 'text-[#F2B84B]'
                          }`}
                        >
                          {c.nokNotificationState}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canClearRtd && (
                            <TacticalButton
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReturnToDutyIncident(c);
                                setNewRtdStatus(c.returnToDutyStatus);
                              }}
                              title="Medical Return-to-Duty Evaluation"
                            >
                              Evaluate RTD
                            </TacticalButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TacticalCard>
      )}

      {/* Modal 1: Register New Personnel */}
      <TacticalModal
        isOpen={showAddPersonnelModal}
        onClose={() => setShowAddPersonnelModal(false)}
        title="Register New Military Personnel"
        subtitle="Enters service member into authenticated administrative database"
        maxWidth="lg"
      >
        <form onSubmit={handleAddPersonnelSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <TacticalInput
              label="Service ID"
              placeholder="e.g. USA-990-1144"
              value={newPerson.serviceId}
              onChange={(e) => setNewPerson({ ...newPerson, serviceId: e.target.value })}
              required
            />
            <TacticalInput
              label="Full Name (Last, First M.)"
              placeholder="e.g. Reynolds, Frank J."
              value={newPerson.name}
              onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TacticalSelect
              label="Military Rank"
              value={newPerson.rank}
              onChange={(e) => setNewPerson({ ...newPerson, rank: e.target.value })}
            >
              <option value="Private (E-1)">Private (E-1)</option>
              <option value="Private First Class (E-3)">Private First Class (E-3)</option>
              <option value="Corporal (E-4)">Corporal (E-4)</option>
              <option value="Sergeant (E-5)">Sergeant (E-5)</option>
              <option value="Staff Sergeant (E-6)">Staff Sergeant (E-6)</option>
              <option value="First Lieutenant (O-2)">First Lieutenant (O-2)</option>
              <option value="Captain (O-3)">Captain (O-3)</option>
              <option value="Major (O-4)">Major (O-4)</option>
            </TacticalSelect>

            <TacticalSelect
              label="Assigned Unit"
              value={newPerson.unit}
              onChange={(e) => setNewPerson({ ...newPerson, unit: e.target.value })}
            >
              <option value="1st Recon Battalion">1st Recon Battalion</option>
              <option value="4th Mechanized Brigade">4th Mechanized Brigade</option>
              <option value="8th Support Group">8th Support Group</option>
              <option value="12th Aviation Regiment">12th Aviation Regiment</option>
            </TacticalSelect>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <TacticalInput
              label="Role Assignment"
              placeholder="e.g. Lead Scout"
              value={newPerson.assignedRole}
              onChange={(e) => setNewPerson({ ...newPerson, assignedRole: e.target.value })}
            />
            <TacticalSelect
              label="Blood Type"
              value={newPerson.bloodType}
              onChange={(e) => setNewPerson({ ...newPerson, bloodType: e.target.value })}
            >
              <option value="O POS">O POS</option>
              <option value="O NEG">O NEG</option>
              <option value="A POS">A POS</option>
              <option value="A NEG">A NEG</option>
              <option value="B POS">B POS</option>
              <option value="AB POS">AB POS</option>
            </TacticalSelect>
            <TacticalSelect
              label="Initial Status"
              value={newPerson.status}
              onChange={(e) => setNewPerson({ ...newPerson, status: e.target.value as PersonnelStatus })}
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Temporarily Unavailable">Temporarily Unavailable</option>
            </TacticalSelect>
          </div>

          <div className="border-t border-[#465044] pt-3">
            <p className="text-xs font-mono text-[#B7AA83] uppercase mb-2">Next-of-Kin Contact</p>
            <div className="grid grid-cols-2 gap-3">
              <TacticalInput
                label="Emergency Contact Name"
                placeholder="e.g. Karen Reynolds (Spouse)"
                value={newPerson.emergencyContact}
                onChange={(e) => setNewPerson({ ...newPerson, emergencyContact: e.target.value })}
              />
              <TacticalInput
                label="Emergency Phone"
                placeholder="+1 (555) 901-2244"
                value={newPerson.emergencyPhone}
                onChange={(e) => setNewPerson({ ...newPerson, emergencyPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#465044]">
            <TacticalButton variant="outline" size="sm" onClick={() => setShowAddPersonnelModal(false)}>
              Cancel
            </TacticalButton>
            <TacticalButton type="submit" variant="primary" size="sm">
              Authorize Registration
            </TacticalButton>
          </div>
        </form>
      </TacticalModal>

      {/* Modal 2: Report Casualty Incident */}
      <TacticalModal
        isOpen={showLogCasualtyModal}
        onClose={() => setShowLogCasualtyModal(false)}
        title="File Casualty Incident Report"
        subtitle="Mandatory reporting: Generates verified casualty record and medevac request"
        maxWidth="lg"
      >
        <form onSubmit={handleLogCasualtySubmit} className="space-y-4">
          <TacticalSelect
            label="Involved Personnel"
            value={newCasualty.serviceId}
            onChange={(e) => setNewCasualty({ ...newCasualty, serviceId: e.target.value })}
            required
          >
            <option value="">-- Select Service Member --</option>
            {personnel.map((p) => (
              <option key={p.serviceId} value={p.serviceId}>
                {p.serviceId} — {p.rank} {p.name} ({p.unit})
              </option>
            ))}
          </TacticalSelect>

          <div className="grid grid-cols-2 gap-3">
            <TacticalInput
              label="Incident Reference ID"
              value={newCasualty.incidentReference}
              onChange={(e) => setNewCasualty({ ...newCasualty, incidentReference: e.target.value })}
              required
            />
            <TacticalSelect
              label="Triage Severity"
              value={newCasualty.severity}
              onChange={(e) =>
                setNewCasualty({
                  ...newCasualty,
                  severity: e.target.value as CasualtyIncident['severity'],
                })
              }
            >
              <option value="Minor">Minor (First aid / Ambulatory)</option>
              <option value="Moderate">Moderate (Splinted / Observation)</option>
              <option value="Severe">Severe (Urgent Surgical Stabilization)</option>
              <option value="Critical">Critical (Immediate Life-Threatening)</option>
              <option value="Fatal">Fatal (Confirmed KIA / Deceased)</option>
            </TacticalSelect>
          </div>

          <TacticalInput
            label="Incident Trauma Type"
            value={newCasualty.incidentType}
            onChange={(e) => setNewCasualty({ ...newCasualty, incidentType: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <TacticalSelect
              label="Verification Status"
              value={newCasualty.verificationStatus}
              onChange={(e) =>
                setNewCasualty({
                  ...newCasualty,
                  verificationStatus: e.target.value as VerificationStatus,
                })
              }
            >
              <option value="Confirmed">Confirmed (Eyewitness / Officer Verified)</option>
              <option value="Unverified">Unverified (Pending Battlefield Positive ID)</option>
            </TacticalSelect>

            <TacticalSelect
              label="Receiving Healthcare Facility"
              value={newCasualty.receivingFacilityId}
              onChange={(e) =>
                setNewCasualty({ ...newCasualty, receivingFacilityId: e.target.value })
              }
            >
              {medicalFacilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.echelonRole})
                </option>
              ))}
            </TacticalSelect>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#151A17] rounded border border-[#465044]">
            <input
              type="checkbox"
              id="medevac-toggle"
              checked={newCasualty.medevacRequested}
              onChange={(e) => setNewCasualty({ ...newCasualty, medevacRequested: e.target.checked })}
              className="rounded border-[#465044] bg-[#202821] text-[#48C774] focus:ring-0"
            />
            <label htmlFor="medevac-toggle" className="text-xs text-[#E8EBDD]">
              <strong>Request Immediate Air/Ground Medevac Transport</strong>
              <span className="block text-[11px] text-[#A9B39F]">
                Alerts 12th Aviation Regiment and nearest Role 2 Forward Surgical Team.
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#465044]">
            <TacticalButton variant="outline" size="sm" onClick={() => setShowLogCasualtyModal(false)}>
              Cancel
            </TacticalButton>
            <TacticalButton type="submit" variant="danger" size="sm">
              Submit Casualty Incident
            </TacticalButton>
          </div>
        </form>
      </TacticalModal>

      {/* Modal 3: Return to Duty Evaluation (Medical Officer restriction) */}
      <TacticalModal
        isOpen={!!returnToDutyIncident}
        onClose={() => setReturnToDutyIncident(null)}
        title="Medical Return-to-Duty Clearance"
        subtitle={`Evaluation for Incident ${returnToDutyIncident?.id} (${returnToDutyIncident?.personnelName})`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#E8EBDD]">
            Authorized Medical Officer sign-off. Updating clearance to <strong>Cleared Full Duty</strong> will
            automatically reactivate the service member in the unit registry.
          </p>

          <TacticalSelect
            label="Evaluation Decision"
            value={newRtdStatus}
            onChange={(e) =>
              setNewRtdStatus(e.target.value as CasualtyIncident['returnToDutyStatus'])
            }
          >
            <option value="Not Cleared">Not Cleared (Inpatient / Critical Care)</option>
            <option value="Pending Medical Evaluation">Pending Medical Evaluation (Observation)</option>
            <option value="Cleared for Limited Duty">Cleared for Limited Duty (Desk / Light Ops)</option>
            <option value="Cleared Full Duty">Cleared Full Duty (Return to Unit Roster)</option>
          </TacticalSelect>

          <div className="p-3 bg-[#151A17] rounded border border-[#465044] text-[11px] font-mono text-[#A9B39F]">
            <p className="text-[#B7AA83] font-semibold">MEDICAL SIGN-OFF AUTHORITY:</p>
            <p>Evaluating Officer: {activeUser.displayName}</p>
            <p>Role: {activeUser.role}</p>
            <p>Timestamp: {new Date().toISOString().slice(0, 16)} UTC</p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#465044]">
            <TacticalButton variant="outline" size="sm" onClick={() => setReturnToDutyIncident(null)}>
              Cancel
            </TacticalButton>
            <TacticalButton variant="primary" size="sm" onClick={handleReturnToDutySubmit}>
              Confirm RTD Evaluation
            </TacticalButton>
          </div>
        </div>
      </TacticalModal>

      {/* Modal 4: Personnel Dossier Detail Drawer */}
      {selectedPersonnel && (
        <TacticalModal
          isOpen={true}
          onClose={() => setSelectedPersonnel(null)}
          title={`Personnel Dossier: ${selectedPersonnel.name}`}
          subtitle={`Service ID: ${selectedPersonnel.serviceId} • ${selectedPersonnel.rank}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded bg-[#1a211b] border border-[#465044]">
              <div>
                <p className="text-[#B7AA83] font-mono text-[11px] uppercase">Service ID</p>
                <p className="font-bold text-[#E8EBDD] font-mono mt-0.5">{selectedPersonnel.serviceId}</p>
              </div>
              <div>
                <p className="text-[#B7AA83] font-mono text-[11px] uppercase">Current Status</p>
                <div className="mt-0.5">
                  <StatusBadge status={selectedPersonnel.status} size="sm" />
                </div>
              </div>
              <div>
                <p className="text-[#B7AA83] font-mono text-[11px] uppercase">Unit</p>
                <p className="text-[#E8EBDD] mt-0.5">{selectedPersonnel.unit}</p>
              </div>
              <div>
                <p className="text-[#B7AA83] font-mono text-[11px] uppercase">Assigned Role</p>
                <p className="text-[#E8EBDD] mt-0.5">{selectedPersonnel.assignedRole}</p>
              </div>
              <div>
                <p className="text-[#B7AA83] font-mono text-[11px] uppercase">Blood Group</p>
                <p className="text-[#E8EBDD] font-mono mt-0.5">{selectedPersonnel.bloodType}</p>
              </div>
              <div>
                <p className="text-[#B7AA83] font-mono text-[11px] uppercase">Verification</p>
                <p className="text-[#48C774] font-mono mt-0.5">{selectedPersonnel.verificationStatus}</p>
              </div>
            </div>

            {/* Next-of-Kin Section (Role protected!) */}
            <div className="p-4 rounded bg-[#1a211b] border border-[#465044]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#B7AA83] uppercase font-mono text-[11px]">
                  Emergency & Next-of-Kin Records
                </span>
                {!canViewSensitiveNok && (
                  <span className="flex items-center gap-1 text-[10px] text-[#FF6464] font-mono">
                    <Lock size={12} /> RESTRICTED
                  </span>
                )}
              </div>

              {canViewSensitiveNok ? (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <p>
                    <span className="text-[#A9B39F]">Contact: </span>
                    <span className="text-[#E8EBDD]">{selectedPersonnel.contactInfo.emergencyContact}</span>
                  </p>
                  <p>
                    <span className="text-[#A9B39F]">Emergency Phone: </span>
                    <span className="text-[#E8EBDD]">{selectedPersonnel.contactInfo.emergencyPhone}</span>
                  </p>
                  <p>
                    <span className="text-[#A9B39F]">Direct Phone: </span>
                    <span className="text-[#E8EBDD]">{selectedPersonnel.contactInfo.phone}</span>
                  </p>
                  <p>
                    <span className="text-[#A9B39F]">NOK Notification Status: </span>
                    <span className="text-[#B7AA83]">{selectedPersonnel.nokStatus}</span>
                  </p>
                </div>
              ) : (
                <div className="py-3 text-center text-[#A9B39F]">
                  <Lock size={18} className="mx-auto mb-1 text-[#F2B84B]" />
                  <p className="text-[11px]">
                    Next-of-kin emergency contact details are restricted to Personnel Officers and Command Supervisors under Privacy Act 5 U.S.C. § 552a.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <TacticalButton variant="outline" size="sm" onClick={() => setSelectedPersonnel(null)}>
                Close Dossier
              </TacticalButton>
            </div>
          </div>
        </TacticalModal>
      )}
    </div>
  );
};
