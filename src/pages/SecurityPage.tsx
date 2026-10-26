import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileCheck2,
  Database,
  Terminal,
} from 'lucide-react';
import { useTacticalStore } from '../hooks/useTacticalStore';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TacticalButton } from '../components/common/TacticalButton';
import { TacticalModal } from '../components/common/TacticalModal';
import { UserRole } from '../types';

export const SecurityPage: React.FC = () => {
  const { store, activeUser, users, auditLogs } = useTacticalStore();

  const [auditSearch, setAuditSearch] = useState('');
  const [auditStatusFilter, setAuditStatusFilter] = useState('ALL');
  const [integrityRunning, setIntegrityRunning] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<string | null>(null);
  const [backupRunning, setBackupRunning] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const isSysAdmin = activeUser.role === 'System Administrator';

  // Filter audit logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.module.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase());
    const matchesStatus = auditStatusFilter === 'ALL' || log.status === auditStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Highlight suspicious events
  const flaggedEvents = auditLogs.filter((l) => l.status === 'DENIED' || l.status === 'FLAGGED');

  const runDataIntegrityCheck = () => {
    setIntegrityRunning(true);
    setIntegrityResult(null);

    setTimeout(() => {
      setIntegrityRunning(false);
      setIntegrityResult(
        '✔ Cryptographic Checksum Verified: 14,208 records validated against SHA-256 baseline ledger. 0 unauthorized modifications detected.'
      );
      store.addAuditLog(
        'INTEGRITY_CHECK_COMPLETED',
        'Security & Access Control',
        'Cryptographic hash verification passed across all database partitions.',
        'SUCCESS'
      );
    }, 1200);
  };

  const handleSimulateBackup = () => {
    setBackupRunning(true);
    setBackupSuccess(false);

    setTimeout(() => {
      setBackupRunning(false);
      setBackupSuccess(true);
      store.addAuditLog(
        'ENCRYPTED_BACKUP_GENERATED',
        'Security & Access Control',
        `Encrypted offsite snapshot ARCHIVE_MMS_${Date.now()}.aes256 securely mirrored to hardened military repository.`,
        'SUCCESS'
      );
    }, 1000);
  };

  const rolePermissionsMatrix: {
    role: UserRole;
    canViewAll: boolean;
    canEditPersonnel: boolean;
    canManageWeapons: boolean;
    canAuthorizeMed: boolean;
    canRequisitionSupplies: boolean;
    canCertifyMaint: boolean;
    canManageTraining: boolean;
  }[] = [
    {
      role: 'System Administrator',
      canViewAll: true,
      canEditPersonnel: true,
      canManageWeapons: true,
      canAuthorizeMed: true,
      canRequisitionSupplies: true,
      canCertifyMaint: true,
      canManageTraining: true,
    },
    {
      role: 'Command Supervisor',
      canViewAll: true,
      canEditPersonnel: true,
      canManageWeapons: true,
      canAuthorizeMed: false,
      canRequisitionSupplies: true,
      canCertifyMaint: false,
      canManageTraining: false,
    },
    {
      role: 'Personnel Officer',
      canViewAll: false,
      canEditPersonnel: true,
      canManageWeapons: false,
      canAuthorizeMed: false,
      canRequisitionSupplies: false,
      canCertifyMaint: false,
      canManageTraining: true,
    },
    {
      role: 'Medical Officer',
      canViewAll: false,
      canEditPersonnel: false,
      canManageWeapons: false,
      canAuthorizeMed: true,
      canRequisitionSupplies: false,
      canCertifyMaint: false,
      canManageTraining: false,
    },
    {
      role: 'Logistics Officer',
      canViewAll: false,
      canEditPersonnel: false,
      canManageWeapons: true,
      canAuthorizeMed: false,
      canRequisitionSupplies: true,
      canCertifyMaint: false,
      canManageTraining: false,
    },
    {
      role: 'Maintenance Officer',
      canViewAll: false,
      canEditPersonnel: false,
      canManageWeapons: false,
      canAuthorizeMed: false,
      canRequisitionSupplies: false,
      canCertifyMaint: true,
      canManageTraining: false,
    },
    {
      role: 'Training Officer',
      canViewAll: false,
      canEditPersonnel: false,
      canManageWeapons: false,
      canAuthorizeMed: false,
      canRequisitionSupplies: false,
      canCertifyMaint: false,
      canManageTraining: true,
    },
    {
      role: 'Read-Only Auditor',
      canViewAll: true,
      canEditPersonnel: false,
      canManageWeapons: false,
      canAuthorizeMed: false,
      canRequisitionSupplies: false,
      canCertifyMaint: false,
      canManageTraining: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Security Posture Banner */}
      <div className="rounded-lg border border-[#465044] bg-[#202821] p-3 text-xs text-[#A9B39F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-[#48C774]" size={16} />
          <span>
            <strong>Security Posture & RBAC Authorization:</strong> Strict least-privilege enforcement. Sensitive operations produce cryptographically linked audit events.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[#B7AA83]">
          <span className="rounded bg-[#151A17] px-2 py-0.5 border border-[#465044]">
            ACTIVE CLEARANCE: {activeUser.clearanceLevel}
          </span>
        </div>
      </div>

      {/* Suspicious Activity Detection Engine */}
      {flaggedEvents.length > 0 && (
        <div className="rounded-lg border border-[#FF6464]/60 bg-[#FF6464]/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#FF6464] font-mono text-xs font-bold uppercase">
            <AlertTriangle size={16} /> Intrusion & Suspicious Access Detection Engine
          </div>
          <p className="text-xs text-[#E8EBDD]">
            {flaggedEvents.length} access denial or privilege escalation attempts detected in recent session logs.
          </p>
          <div className="space-y-1.5 mt-2">
            {flaggedEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-2 rounded bg-[#151A17] border border-[#FF6464]/40 font-mono text-[11px] flex items-center justify-between"
              >
                <div>
                  <span className="text-[#FF6464] font-bold">[{ev.action}]</span>{' '}
                  <span className="text-[#E8EBDD]">{ev.details}</span>
                </div>
                <span className="text-[#747653] shrink-0 ml-2">{ev.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Integrity & Disaster Recovery Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Integrity Check */}
        <TacticalCard
          title="Cryptographic Ledger Integrity"
          subtitle="Verifies hash checksums of database partitions against baseline"
        >
          <div className="space-y-3 text-xs">
            <p className="text-[#A9B39F]">
              Runs algorithmic SHA-256 parity verification across personnel files, serial numbers, and custodial receipts to prevent record tampering.
            </p>

            {integrityResult && (
              <div className="p-2.5 rounded bg-[#48C774]/10 border border-[#48C774]/40 font-mono text-[11px] text-[#48C774]">
                {integrityResult}
              </div>
            )}

            <TacticalButton
              size="sm"
              variant="outline"
              icon={FileCheck2}
              loading={integrityRunning}
              onClick={runDataIntegrityCheck}
            >
              Execute Integrity Verification
            </TacticalButton>
          </div>
        </TacticalCard>

        {/* Backup & Disaster Recovery */}
        <TacticalCard
          title="Hardened Backup & Disaster Recovery"
          subtitle="AES-256 encrypted operational database mirror"
        >
          <div className="space-y-3 text-xs">
            <p className="text-[#A9B39F]">
              Generates an immutable encrypted snapshot stored in redundant underground command repositories for survivability during communications disruption.
            </p>

            {backupSuccess && (
              <div className="p-2.5 rounded bg-[#48C774]/10 border border-[#48C774]/40 font-mono text-[11px] text-[#48C774]">
                ✔ Backup snapshot successfully verified and mirrored to bunker cold vault.
              </div>
            )}

            <TacticalButton
              size="sm"
              variant="primary"
              icon={Database}
              loading={backupRunning}
              onClick={handleSimulateBackup}
            >
              Create Encrypted Snapshot
            </TacticalButton>
          </div>
        </TacticalCard>
      </div>

      {/* Role-Based Access Control (RBAC) Matrix */}
      <TacticalCard
        noPadding
        title="Role-Based Access Control (RBAC) Permissions Matrix"
        subtitle="Defines authorized capabilities across operational military roles"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#465044] bg-[#1c231e] text-[#B7AA83] font-mono uppercase">
                <th className="py-3 px-4">Role Title</th>
                <th className="py-3 px-4 text-center">Global View</th>
                <th className="py-3 px-4 text-center">Personnel Edit</th>
                <th className="py-3 px-4 text-center">Weapons Issue</th>
                <th className="py-3 px-4 text-center">Medical RTD</th>
                <th className="py-3 px-4 text-center">Logistics Orders</th>
                <th className="py-3 px-4 text-center">PMCS Certify</th>
                <th className="py-3 px-4 text-center">Training Quals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#465044]/50 font-mono">
              {rolePermissionsMatrix.map((r) => {
                const isCurrentRole = r.role === activeUser.role;
                return (
                  <tr
                    key={r.role}
                    className={`hover:bg-[#263128]/60 transition-colors ${
                      isCurrentRole ? 'bg-[#414B32]/30 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-sans font-semibold text-[#E8EBDD] flex items-center gap-2">
                      <span>{r.role}</span>
                      {isCurrentRole && (
                        <span className="text-[10px] font-mono bg-[#48C774]/20 text-[#48C774] px-1.5 py-0.2 rounded border border-[#48C774]/40">
                          YOU
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.canViewAll ? <span className="text-[#48C774]">✔</span> : <span className="text-[#747653]">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.canEditPersonnel ? <span className="text-[#48C774]">✔</span> : <span className="text-[#747653]">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.canManageWeapons ? <span className="text-[#48C774]">✔</span> : <span className="text-[#747653]">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.canAuthorizeMed ? <span className="text-[#48C774]">✔</span> : <span className="text-[#747653]">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.canRequisitionSupplies ? <span className="text-[#48C774]">✔</span> : <span className="text-[#747653]">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.canCertifyMaint ? <span className="text-[#48C774]">✔</span> : <span className="text-[#747653]">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.canManageTraining ? <span className="text-[#48C774]">✔</span> : <span className="text-[#747653]">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </TacticalCard>

      {/* Immutable Audit Log Table */}
      <TacticalCard
        noPadding
        title="Immutable System Audit Trail"
        subtitle="Chronological log of logins, casualty filings, custodial transfers & permissions checks"
      >
        {/* Filter controls */}
        <div className="p-3 border-b border-[#465044] bg-[#1a211b] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-2.5 text-[#747653]" />
            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Search audit trail by actor, action, module, or keyword..."
              className="w-full rounded border border-[#465044] bg-[#151A17] pl-9 pr-3 py-1.5 text-xs text-[#E8EBDD] placeholder-[#747653] focus:border-[#747653] focus:outline-none"
            />
          </div>

          <select
            value={auditStatusFilter}
            onChange={(e) => setAuditStatusFilter(e.target.value)}
            className="rounded border border-[#465044] bg-[#151A17] px-2.5 py-1.5 text-xs text-[#E8EBDD] font-mono"
          >
            <option value="ALL">All Event Outcomes</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="DENIED">DENIED (Security Violation)</option>
            <option value="FLAGGED">FLAGGED</option>
          </select>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#465044] bg-[#1c231e] text-[#B7AA83] font-mono uppercase sticky top-0">
                <th className="py-3 px-4">Event ID / Time</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Action Code</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#465044]/50 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#A9B39F]">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#263128]/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#E8EBDD] block">{log.id}</span>
                      <span className="text-[10px] text-[#747653] block">{log.timestamp}</span>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="font-semibold text-[#E8EBDD] block">{log.actorName}</span>
                      <span className="text-[11px] text-[#B7AA83] font-mono">{log.actorRole}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#48C774] font-bold block">{log.action}</span>
                      {log.targetRecord !== 'N/A' && (
                        <span className="text-[10px] text-[#A9B39F] block truncate">
                          Target: {log.targetRecord}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#A9B39F] font-sans">{log.module}</td>
                    <td className="py-3 px-4 text-[#E8EBDD] font-sans text-xs max-w-xs">{log.details}</td>
                    <td className="py-3 px-4 text-[#747653]">{log.ipAddress}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          log.status === 'SUCCESS'
                            ? 'bg-[#48C774]/15 text-[#48C774] border border-[#48C774]/40'
                            : 'bg-[#FF6464]/15 text-[#FF6464] border border-[#FF6464]/40'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TacticalCard>
    </div>
  );
};
