import React, { useState } from 'react';
import { Search, Users, Crosshair, MapPin, HeartPulse, Truck, ArrowRight } from 'lucide-react';
import { TacticalModal } from '../common/TacticalModal';
import { useTacticalStore } from '../../hooks/useTacticalStore';
import { ActiveTab } from '../layout/Sidebar';
import { StatusBadge } from '../common/StatusBadge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { personnel, inventory, supplies, medicalFacilities, casualties } = useTacticalStore();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();

  const matchedPersonnel = q
    ? personnel.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.serviceId.toLowerCase().includes(q) ||
          p.unit.toLowerCase().includes(q) ||
          p.assignedRole.toLowerCase().includes(q)
      )
    : [];

  const matchedInventory = q
    ? inventory.filter(
        (i) =>
          i.nomenclature.toLowerCase().includes(q) ||
          i.serialNumber.toLowerCase().includes(q) ||
          i.custodian.toLowerCase().includes(q)
      )
    : [];

  const matchedSupplies = q
    ? supplies.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.warehouseLocation.toLowerCase().includes(q)
      )
    : [];

  const matchedFacilities = q
    ? medicalFacilities.filter(
        (f) => f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q)
      )
    : [];

  const totalMatches =
    matchedPersonnel.length + matchedInventory.length + matchedSupplies.length + matchedFacilities.length;

  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tactical Global Record Search"
      subtitle="Query authorized personnel, controlled inventory, medical facilities, and supplies"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-[#747653]" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Service ID, Name, Serial #, Facility, or Unit..."
            autoFocus
            className="w-full rounded-md border border-[#465044] bg-[#151A17] pl-10 pr-4 py-2.5 text-sm text-[#E8EBDD] placeholder-[#747653] focus:border-[#747653] focus:outline-none focus:ring-1 focus:ring-[#B7AA83]"
          />
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
          {!q && (
            <div className="py-8 text-center text-[#A9B39F]">
              <p className="text-xs font-mono uppercase tracking-wider">
                Type keywords to query classified databases
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <span className="rounded bg-[#263128] px-2 py-1 text-[11px] font-mono text-[#B7AA83]">
                  Try: "M4A1"
                </span>
                <span className="rounded bg-[#263128] px-2 py-1 text-[11px] font-mono text-[#B7AA83]">
                  "Harrison"
                </span>
                <span className="rounded bg-[#263128] px-2 py-1 text-[11px] font-mono text-[#B7AA83]">
                  "Fuel"
                </span>
                <span className="rounded bg-[#263128] px-2 py-1 text-[11px] font-mono text-[#B7AA83]">
                  "Falcon"
                </span>
              </div>
            </div>
          )}

          {q && totalMatches === 0 && (
            <div className="py-8 text-center text-[#A9B39F]">
              <p className="text-xs font-mono uppercase text-[#F2B84B]">No matching records found</p>
              <p className="text-xs mt-1">Verify search criteria or check role clearance restrictions.</p>
            </div>
          )}

          {/* Personnel Matches */}
          {matchedPersonnel.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#B7AA83] uppercase pb-1 border-b border-[#465044]">
                <Users size={14} /> Personnel Directory ({matchedPersonnel.length})
              </div>
              <div className="mt-2 space-y-1">
                {matchedPersonnel.map((p) => (
                  <div
                    key={p.serviceId}
                    onClick={() => {
                      onNavigate('personnel');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded hover:bg-[#263128] cursor-pointer transition-colors border border-transparent hover:border-[#465044]"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#E8EBDD]">
                        {p.rank} {p.name}
                      </div>
                      <div className="text-xs text-[#A9B39F] font-mono">
                        {p.serviceId} • {p.unit} • {p.assignedRole}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.status} size="sm" />
                      <ArrowRight size={14} className="text-[#747653]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weapons & Inventory Matches */}
          {matchedInventory.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#B7AA83] uppercase pb-1 border-b border-[#465044]">
                <Crosshair size={14} /> Controlled Weapons & Ammunition ({matchedInventory.length})
              </div>
              <div className="mt-2 space-y-1">
                {matchedInventory.map((i) => (
                  <div
                    key={i.id}
                    onClick={() => {
                      onNavigate('inventory');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded hover:bg-[#263128] cursor-pointer transition-colors border border-transparent hover:border-[#465044]"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#E8EBDD]">{i.nomenclature}</div>
                      <div className="text-xs text-[#A9B39F] font-mono">
                        Serial: {i.serialNumber} • Loc: {i.storageLocation} • Custodian: {i.custodian}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={i.status} size="sm" />
                      <ArrowRight size={14} className="text-[#747653]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supplies Matches */}
          {matchedSupplies.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#B7AA83] uppercase pb-1 border-b border-[#465044]">
                <Truck size={14} /> Logistics Supplies & Fuel ({matchedSupplies.length})
              </div>
              <div className="mt-2 space-y-1">
                {matchedSupplies.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onNavigate('logistics');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded hover:bg-[#263128] cursor-pointer transition-colors border border-transparent hover:border-[#465044]"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#E8EBDD]">{s.name}</div>
                      <div className="text-xs text-[#A9B39F] font-mono">
                        Stock: {s.currentStock.toLocaleString()} {s.unit} • Burn: {s.dailyBurnRate}/day • Loc: {s.warehouseLocation}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={s.replenishmentStatus} size="sm" />
                      <ArrowRight size={14} className="text-[#747653]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Facilities */}
          {matchedFacilities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#B7AA83] uppercase pb-1 border-b border-[#465044]">
                <HeartPulse size={14} /> Medical Facilities ({matchedFacilities.length})
              </div>
              <div className="mt-2 space-y-1">
                {matchedFacilities.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => {
                      onNavigate('medical');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2 rounded hover:bg-[#263128] cursor-pointer transition-colors border border-transparent hover:border-[#465044]"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#E8EBDD]">{f.name}</div>
                      <div className="text-xs text-[#A9B39F] font-mono">
                        {f.echelonRole} • Beds: {f.occupiedBeds}/{f.totalBeds} • ICU: {f.occupiedIcuBeds}/{f.icuBeds}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={f.emergencyResponseStatus} size="sm" />
                      <ArrowRight size={14} className="text-[#747653]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </TacticalModal>
  );
};
