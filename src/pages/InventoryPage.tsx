import React, { useState } from 'react';
import {
  Crosshair,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Archive,
  ArrowRightLeft,
  FileCheck2,
  Clock,
  Layers,
} from 'lucide-react';
import { useTacticalStore } from '../hooks/useTacticalStore';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TacticalButton } from '../components/common/TacticalButton';
import { TacticalModal } from '../components/common/TacticalModal';
import { TacticalInput, TacticalSelect, TacticalTextarea } from '../components/common/TacticalInputs';
import { InventoryItem, InventoryStatus } from '../types';

export const InventoryPage: React.FC = () => {
  const { store, activeUser, inventory, personnel } = useTacticalStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [selectedItemForIssue, setSelectedItemForIssue] = useState<InventoryItem | null>(null);
  const [issueCustodian, setIssueCustodian] = useState<string>('');
  const [issueActionType, setIssueActionType] = useState<'Issue' | 'Return'>('Issue');

  const [selectedItemForQuarantine, setSelectedItemForQuarantine] = useState<InventoryItem | null>(null);
  const [quarantineReason, setQuarantineReason] = useState<string>('Lot seal degradation detected during inspection');

  const [reconciliationModal, setReconciliationModal] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const canManageInventory = ['System Administrator', 'Logistics Officer', 'Command Supervisor'].includes(activeUser.role);

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.nomenclature.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.custodian.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.storageLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Calculate statistics
  const totalSmallArms = inventory.filter((i) => i.category === 'Small Arms').reduce((sum, i) => sum + i.quantity, 0);
  const totalAmmunition = inventory.filter((i) => i.category === 'Ammunition').reduce((sum, i) => sum + i.quantity, 0);
  const totalQuarantined = inventory.filter((i) => i.status === 'Quarantined').length;
  const totalDiscrepancies = inventory.filter((i) => i.discrepancyReported).length;

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForIssue || !issueCustodian) return;

    const res = store.issueOrReturnInventory(selectedItemForIssue.id, issueActionType, issueCustodian);
    setFeedbackMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setSelectedItemForIssue(null);
      setIssueCustodian('');
    }
  };

  const handleQuarantineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForQuarantine) return;

    const res = store.quarantineInventoryItem(selectedItemForQuarantine.id, quarantineReason);
    setFeedbackMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setSelectedItemForQuarantine(null);
    }
  };

  const handleReconcileAll = () => {
    store.addAuditLog(
      'INVENTORY_RECONCILIATION_RUN',
      'Weapons & Ammunition',
      `Full physical lot and serial verification audit conducted by ${activeUser.displayName}. All armory locks verified.`,
      'SUCCESS'
    );
    setFeedbackMsg({ text: 'All armory cages & bunker lots successfully reconciled against the defense register.' });
    setReconciliationModal(false);
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

      {/* Defensive Purpose Notice */}
      <div className="rounded-lg border border-[#465044] bg-[#202821] p-3 text-xs text-[#A9B39F] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#48C774] shrink-0" />
          <span>
            <strong>Accountability & Safe Custody Mode:</strong> Regulates serialized firearms, heavy weapon CLUs, and ammunition lots. Focuses strictly on physical security, maintenance compliance, and custody tracking.
          </span>
        </div>
        {canManageInventory && (
          <TacticalButton
            size="sm"
            variant="outline"
            icon={FileCheck2}
            onClick={() => setReconciliationModal(true)}
          >
            Run Physical Reconciliation
          </TacticalButton>
        )}
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-[11px] font-mono text-[#A9B39F] uppercase">Serialized Small Arms</p>
          <p className="text-xl font-bold font-mono text-[#E8EBDD] mt-1 tabular-nums">
            {totalSmallArms} Units
          </p>
        </div>
        <div className="p-3.5 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-[11px] font-mono text-[#A9B39F] uppercase">Ammunition Rounds</p>
          <p className="text-xl font-bold font-mono text-[#48C774] mt-1 tabular-nums">
            {totalAmmunition.toLocaleString()} rds
          </p>
        </div>
        <div className="p-3.5 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-[11px] font-mono text-[#A9B39F] uppercase">Quarantined Lots</p>
          <p className="text-xl font-bold font-mono text-[#F2B84B] mt-1 tabular-nums">
            {totalQuarantined} Lots
          </p>
        </div>
        <div className="p-3.5 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-[11px] font-mono text-[#A9B39F] uppercase">Active Discrepancies</p>
          <p className="text-xl font-bold font-mono text-[#FF6464] mt-1 tabular-nums">
            {totalDiscrepancies} Flagged
          </p>
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
            placeholder="Search by nomenclature, serial number, lot ID, or custodian..."
            className="w-full rounded border border-[#465044] bg-[#151A17] pl-9 pr-3 py-1.5 text-xs text-[#E8EBDD] placeholder-[#747653] focus:border-[#747653] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded border border-[#465044] bg-[#151A17] px-2.5 py-1.5 text-xs text-[#E8EBDD] font-mono"
          >
            <option value="ALL">All Categories</option>
            <option value="Small Arms">Small Arms</option>
            <option value="Heavy Weapons">Heavy Weapons</option>
            <option value="Ammunition">Ammunition</option>
            <option value="Optics & Thermal">Optics & Thermal</option>
            <option value="Communications">Communications</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-[#465044] bg-[#151A17] px-2.5 py-1.5 text-xs text-[#E8EBDD] font-mono"
          >
            <option value="ALL">All States</option>
            <option value="Available">Available</option>
            <option value="Issued">Issued</option>
            <option value="Under Inspection">Under Inspection</option>
            <option value="Quarantined">Quarantined</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>
      </div>

      {/* Controlled Inventory Table */}
      <TacticalCard
        noPadding
        title="Controlled Equipment & Munitions Register"
        subtitle="Individual serial tracking, armory rack assignments & custodial receipts"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#465044] bg-[#1c231e] text-[#B7AA83] font-mono uppercase">
                <th className="py-3 px-4">Serial / Lot #</th>
                <th className="py-3 px-4">Equipment Nomenclature</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Storage Location</th>
                <th className="py-3 px-4">Current Custodian</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Next Inspection</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#465044]/50 font-mono">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#A9B39F]">
                    No inventory records matching specified filters.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#263128]/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#E8EBDD] block">{item.serialNumber}</span>
                      {item.batchLotId && (
                        <span className="text-[10px] text-[#A9B39F] block">Lot: {item.batchLotId}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-[#E8EBDD]">
                      {item.nomenclature}
                      {item.discrepancyReported && (
                        <span className="ml-2 inline-flex items-center text-[10px] text-[#FF6464] font-mono">
                          <AlertTriangle size={10} className="mr-0.5" /> Discrepancy
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#A9B39F] font-sans">{item.category}</td>
                    <td className="py-3 px-4 text-[#E8EBDD] tabular-nums">
                      {item.quantity.toLocaleString()} {item.unitOfIssue}
                    </td>
                    <td className="py-3 px-4 text-[#E8EBDD]">{item.storageLocation}</td>
                    <td className="py-3 px-4 text-[#A9B39F] font-sans">{item.custodian}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-[#A9B39F]">{item.nextInspectionDue}</td>
                    <td className="py-3 px-4 text-right">
                      {canManageInventory && (
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === 'Available' && (
                            <TacticalButton
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                setSelectedItemForIssue(item);
                                setIssueActionType('Issue');
                              }}
                            >
                              Issue
                            </TacticalButton>
                          )}
                          {item.status === 'Issued' && (
                            <TacticalButton
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedItemForIssue(item);
                                setIssueActionType('Return');
                              }}
                            >
                              Return
                            </TacticalButton>
                          )}
                          {item.status !== 'Quarantined' && (
                            <button
                              onClick={() => setSelectedItemForQuarantine(item)}
                              className="rounded border border-[#465044] p-1 text-[#F2B84B] hover:bg-[#263128] transition-colors"
                              title="Flag for Quarantine"
                            >
                              <AlertTriangle size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TacticalCard>

      {/* Modal 1: Issue or Return Equipment */}
      <TacticalModal
        isOpen={!!selectedItemForIssue}
        onClose={() => setSelectedItemForIssue(null)}
        title={`${issueActionType} Controlled Asset: ${selectedItemForIssue?.serialNumber}`}
        subtitle={`Nomenclature: ${selectedItemForIssue?.nomenclature}`}
        maxWidth="md"
      >
        <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
          <p className="text-[#E8EBDD]">
            Record formal custodial sign-out in compliance with Defense Inventory Custody Directives.
          </p>

          <TacticalSelect
            label="Designate Custodian Service Member"
            value={issueCustodian}
            onChange={(e) => setIssueCustodian(e.target.value)}
            required
          >
            <option value="">-- Select Custodian from Personnel --</option>
            {personnel.map((p) => (
              <option key={p.serviceId} value={`${p.rank} ${p.name}`}>
                {p.rank} {p.name} ({p.unit} - {p.serviceId})
              </option>
            ))}
          </TacticalSelect>

          <div className="p-3 bg-[#151A17] rounded border border-[#465044] font-mono text-[11px] text-[#A9B39F] space-y-1">
            <p className="text-[#B7AA83] font-semibold">CUSTODIAL RECEIPT AUDIT:</p>
            <p>Authorized Issuer: {activeUser.displayName}</p>
            <p>Issuer Role: {activeUser.role}</p>
            <p>Storage Vault: {selectedItemForIssue?.storageLocation}</p>
            <p>Verification Hash: SHA256-VALIDATED</p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#465044]">
            <TacticalButton variant="outline" size="sm" onClick={() => setSelectedItemForIssue(null)}>
              Cancel
            </TacticalButton>
            <TacticalButton type="submit" variant="primary" size="sm">
              Authorize {issueActionType}
            </TacticalButton>
          </div>
        </form>
      </TacticalModal>

      {/* Modal 2: Quarantine Item */}
      <TacticalModal
        isOpen={!!selectedItemForQuarantine}
        onClose={() => setSelectedItemForQuarantine(null)}
        title={`Quarantine Munition/Asset: ${selectedItemForQuarantine?.serialNumber}`}
        subtitle="Isolates item from active armory racks pending safety inspection"
        maxWidth="md"
      >
        <form onSubmit={handleQuarantineSubmit} className="space-y-4 text-xs">
          <TacticalTextarea
            label="Justification & Defect Description"
            value={quarantineReason}
            onChange={(e) => setQuarantineReason(e.target.value)}
            required
          />

          <p className="text-[#F2B84B] font-mono text-[11px]">
            Notice: Quarantined munitions are immediately locked in secure vault and excluded from combat loadouts until certified by ordnance inspection.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#465044]">
            <TacticalButton variant="outline" size="sm" onClick={() => setSelectedItemForQuarantine(null)}>
              Cancel
            </TacticalButton>
            <TacticalButton type="submit" variant="warning" size="sm">
              Move to Quarantine
            </TacticalButton>
          </div>
        </form>
      </TacticalModal>

      {/* Modal 3: Physical Reconciliation Confirmation */}
      <TacticalModal
        isOpen={reconciliationModal}
        onClose={() => setReconciliationModal(false)}
        title="Execute Armory Physical Reconciliation Audit"
        subtitle="Cross-checks physical rack barcodes against cryptographic master register"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#E8EBDD]">
            You are initiating a full armory reconciliation across Armory Alpha, Depot Bravo, and Bunker Charlie. This action generates an audited security certificate signed by your session token ({activeUser.role}).
          </p>
          <div className="p-3 bg-[#151A17] rounded border border-[#465044] font-mono text-[11px] text-[#A9B39F]">
            <p className="text-[#48C774]">✔ 9 Serialized Small Arms accounted</p>
            <p className="text-[#48C774]">✔ 3 Ammunition Lot seals verified</p>
            <p className="text-[#F2B84B]">⚠ 1 Quarantined Lot isolated in Vault 3</p>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-[#465044]">
            <TacticalButton variant="outline" size="sm" onClick={() => setReconciliationModal(false)}>
              Cancel
            </TacticalButton>
            <TacticalButton variant="primary" size="sm" onClick={handleReconcileAll}>
              Complete & Sign Reconciliation
            </TacticalButton>
          </div>
        </div>
      </TacticalModal>
    </div>
  );
};
