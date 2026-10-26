import React, { useState } from 'react';
import {
  Truck,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Package,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Warehouse,
  ExternalLink,
} from 'lucide-react';
import { useTacticalStore } from '../hooks/useTacticalStore';
import { TacticalCard } from '../components/common/TacticalCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { TacticalButton } from '../components/common/TacticalButton';
import { TacticalModal } from '../components/common/TacticalModal';
import { TacticalInput, TacticalSelect } from '../components/common/TacticalInputs';
import { SupplyItem } from '../types';

export const LogisticsPage: React.FC = () => {
  const { store, activeUser, supplies } = useTacticalStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedSupplyForReorder, setSelectedSupplyForReorder] = useState<SupplyItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(500);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const canManageLogistics = ['System Administrator', 'Logistics Officer', 'Command Supervisor'].includes(activeUser.role);

  // Filter supplies
  const filteredSupplies = supplies.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.warehouseLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || s.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Calculate high-level logistics metrics
  const totalItems = supplies.length;
  const criticalCount = supplies.filter((s) => s.replenishmentStatus === 'Critical Shortage').length;
  const reorderCount = supplies.filter((s) => s.replenishmentStatus === 'Reorder Suggested').length;
  const inTransitCount = supplies.filter((s) => s.replenishmentStatus === 'In Transit').length;

  const handleReorderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplyForReorder) return;

    const res = store.requestSupplyRequisition(selectedSupplyForReorder.id, orderQuantity);
    setFeedbackMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setSelectedSupplyForReorder(null);
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

      {/* Burn Rate Forecast Disclaimer */}
      <div className="rounded-lg border border-[#465044] bg-[#202821] p-3 text-xs text-[#A9B39F] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Warehouse className="text-[#48C774]" size={16} />
          <span>
            <strong>Burn Rate & Days of Supply Forecasting:</strong> Calculated from average consumption across past 30 days. Items under 10 Days of Supply are prioritized for emergency transport.
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#B7AA83] bg-[#151A17] px-2 py-0.5 rounded border border-[#465044]">
          ESTIMATION MODEL: LINEAR BURN
        </span>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-xs font-mono text-[#A9B39F] uppercase">Tracked Commodities</p>
          <p className="text-2xl font-bold font-mono text-[#E8EBDD] mt-1 tabular-nums">{totalItems}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-xs font-mono text-[#A9B39F] uppercase">Critical Shortages</p>
          <p className="text-2xl font-bold font-mono text-[#FF6464] mt-1 tabular-nums">{criticalCount}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-xs font-mono text-[#A9B39F] uppercase">Reorder Suggested</p>
          <p className="text-2xl font-bold font-mono text-[#F2B84B] mt-1 tabular-nums">{reorderCount}</p>
        </div>
        <div className="p-4 rounded-lg border border-[#465044] bg-[#202821]">
          <p className="text-xs font-mono text-[#A9B39F] uppercase">Convoys In Transit</p>
          <p className="text-2xl font-bold font-mono text-[#62B7E8] mt-1 tabular-nums">{inTransitCount}</p>
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
            placeholder="Search supplies, warehouse depots, or vendor suppliers..."
            className="w-full rounded border border-[#465044] bg-[#151A17] pl-9 pr-3 py-1.5 text-xs text-[#E8EBDD] placeholder-[#747653] focus:border-[#747653] focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded border border-[#465044] bg-[#151A17] px-2.5 py-1.5 text-xs text-[#E8EBDD] font-mono"
        >
          <option value="ALL">All Supply Classes</option>
          <option value="Rations (MRE)">Class I: Rations (MRE)</option>
          <option value="Potable Water">Class I: Potable Water</option>
          <option value="Fuel (JP-8/Diesel)">Class III: Petroleum, Oil & Lubricants (POL)</option>
          <option value="Medical Supplies">Class VIII: Medical Supplies</option>
          <option value="Tactical Batteries">Class IX: Tactical Electronics & Batteries</option>
        </select>
      </div>

      {/* Supply Inventory & Burn Rate Table */}
      <TacticalCard
        noPadding
        title="Commodity Catalogue & Depots"
        subtitle="Stock levels, warehouse depots, daily burn rates & automated replenishment triggers"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#465044] bg-[#1c231e] text-[#B7AA83] font-mono uppercase">
                <th className="py-3 px-4">Commodity / Class</th>
                <th className="py-3 px-4">Warehouse Depot</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Daily Burn</th>
                <th className="py-3 px-4">Estimated Duration</th>
                <th className="py-3 px-4">Reorder Point</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#465044]/50 font-mono">
              {filteredSupplies.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#A9B39F]">
                    No supply records found.
                  </td>
                </tr>
              ) : (
                filteredSupplies.map((s) => {
                  const isLow = s.daysOfSupplyRemaining <= 10;
                  const isExpiringSoon =
                    s.expiryDate && new Date(s.expiryDate).getTime() - Date.now() < 90 * 86400000;

                  return (
                    <tr key={s.id} className="hover:bg-[#263128]/60 transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <span className="font-semibold text-[#E8EBDD] block">{s.name}</span>
                        <span className="text-[11px] text-[#B7AA83] font-mono">{s.category}</span>
                      </td>
                      <td className="py-3 px-4 text-[#A9B39F] font-sans">{s.warehouseLocation}</td>
                      <td className="py-3 px-4 text-[#E8EBDD] tabular-nums font-bold">
                        {s.currentStock.toLocaleString()} {s.unit}
                      </td>
                      <td className="py-3 px-4 text-[#A9B39F] tabular-nums">
                        {s.dailyBurnRate} {s.unit} / day
                      </td>
                      <td className="py-3 px-4 tabular-nums">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            isLow
                              ? 'bg-[#FF6464]/15 text-[#FF6464] border border-[#FF6464]/40'
                              : 'text-[#48C774]'
                          }`}
                        >
                          {s.daysOfSupplyRemaining} Days
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#A9B39F] tabular-nums">
                        {s.minReorderPoint.toLocaleString()} {s.unit}
                      </td>
                      <td className="py-3 px-4 text-[#A9B39F]">
                        {s.expiryDate ? (
                          <span className={isExpiringSoon ? 'text-[#F2B84B] font-semibold' : ''}>
                            {s.expiryDate}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={s.replenishmentStatus} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canManageLogistics && (
                          <TacticalButton
                            size="sm"
                            variant={isLow ? 'danger' : 'outline'}
                            onClick={() => {
                              setSelectedSupplyForReorder(s);
                              setOrderQuantity(s.minReorderPoint * 2);
                            }}
                          >
                            Requisition
                          </TacticalButton>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </TacticalCard>

      {/* Modal: Supply Requisition Form */}
      <TacticalModal
        isOpen={!!selectedSupplyForReorder}
        onClose={() => setSelectedSupplyForReorder(null)}
        title={`Requisition Order: ${selectedSupplyForReorder?.name}`}
        subtitle={`Warehouse Location: ${selectedSupplyForReorder?.warehouseLocation}`}
        maxWidth="md"
      >
        <form onSubmit={handleReorderSubmit} className="space-y-4 text-xs">
          <p className="text-[#E8EBDD]">
            Issue purchase requisition to primary defense contractor{' '}
            <strong className="text-[#B7AA83]">{selectedSupplyForReorder?.supplier}</strong>.
          </p>

          <TacticalInput
            label={`Order Quantity (${selectedSupplyForReorder?.unit})`}
            type="number"
            value={orderQuantity}
            onChange={(e) => setOrderQuantity(Number(e.target.value))}
            min={1}
            required
          />

          <div className="p-3 bg-[#151A17] rounded border border-[#465044] font-mono text-[11px] text-[#A9B39F] space-y-1">
            <p className="text-[#B7AA83] font-semibold">PROCUREMENT AUDIT:</p>
            <p>Authorizing Officer: {activeUser.displayName}</p>
            <p>Role: {activeUser.role}</p>
            <p>Current In-Stock: {selectedSupplyForReorder?.currentStock.toLocaleString()}</p>
            <p>Projected New Duration: +{(orderQuantity / (selectedSupplyForReorder?.dailyBurnRate || 1)).toFixed(1)} Days</p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#465044]">
            <TacticalButton variant="outline" size="sm" onClick={() => setSelectedSupplyForReorder(null)}>
              Cancel
            </TacticalButton>
            <TacticalButton type="submit" variant="primary" size="sm">
              Authorize Delivery Convoy
            </TacticalButton>
          </div>
        </form>
      </TacticalModal>
    </div>
  );
};
