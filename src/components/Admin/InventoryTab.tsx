import React, { useState } from 'react';
import { InventoryItem } from '../../types/dental';
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Tag, 
  Truck,
  ArrowDownCircle,
  Archive,
  TrendingDown,
  BarChart2
} from 'lucide-react';

interface InventoryTabProps {
  inventory: InventoryItem[];
  onRestockItem: (id: string, quantityToAdd: number, lotNumber?: string) => void;
  onDeductItem: (id: string, quantityToDeduct: number) => void;
  onAddItem: (item: InventoryItem) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  inventory,
  onRestockItem,
  onDeductItem,
  onAddItem,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Restock Modal State
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(20);
  const [restockLot, setRestockLot] = useState<string>('');

  // Add Item Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryItem['category']>('Consumables');
  const [newItemStock, setNewItemStock] = useState<number>(50);
  const [newItemUnit, setNewItemUnit] = useState<string>('Boxes (100 pcs)');
  const [newItemThreshold, setNewItemThreshold] = useState<number>(15);
  const [newItemCost, setNewItemCost] = useState<number>(450);
  const [newItemSupplier, setNewItemSupplier] = useState<string>('Dentsply Sirona PH');

  // 30-Day Depletion Trend Visualization State
  const [trendItemFilter, setTrendItemFilter] = useState<string>('all');
  const [trendViewMode, setTrendViewMode] = useState<'line' | 'bar'>('line');

  // Toast for quick consumption log
  const [logToast, setLogToast] = useState<string | null>(null);

  const handleQuickDeduct = (item: InventoryItem, count = 1) => {
    if (item.stockOnHand <= 0) return;
    onDeductItem(item.id, count);
    setLogToast(`Deducted ${count} ${item.unit.split(' ')[0]} of ${item.name} for chairside procedure.`);
    setTimeout(() => setLogToast(null), 3000);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem) return;

    onRestockItem(restockModalItem.id, Number(restockQty), restockLot || undefined);
    setLogToast(`Successfully restocked +${restockQty} to ${restockModalItem.name}.`);
    setRestockModalItem(null);
    setRestockLot('');
    setTimeout(() => setLogToast(null), 3000);
  };

  const handleCreateItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      stockOnHand: Number(newItemStock),
      unit: newItemUnit.trim(),
      reorderThreshold: Number(newItemThreshold),
      costPerUnit: Number(newItemCost),
      supplier: newItemSupplier.trim(),
      lastRestocked: '2026-10-06',
      status: Number(newItemStock) <= 0 
        ? 'Depleted' 
        : Number(newItemStock) <= Number(newItemThreshold) 
        ? 'Low Stock' 
        : 'In Stock',
    };

    onAddItem(newItem);
    setShowAddModal(false);
    setNewItemName('');
  };

  // Filtered Inventory
  const filteredItems = inventory.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      item.supplier.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    const matchesCategory =
      categoryFilter === 'all' ? true : item.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'all' ? true : item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {logToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{logToast}</span>
        </div>
      )}

      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clinic Inventory & Consumables Tracker</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time chairside supply consumption logs, reorder thresholds, and vendor batches.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Clinical Supply Item</span>
        </button>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search supply name, supplier, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">All Supply Categories</option>
            <option value="Anesthetics">Anesthetics</option>
            <option value="Infection Control">Infection Control</option>
            <option value="Restorative">Restorative</option>
            <option value="Consumables">Consumables</option>
            <option value="Endodontics">Endodontics</option>
            <option value="Hygiene">Hygiene</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">All Inventory Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock (Reorder Needed)</option>
            <option value="Depleted">Depleted (0 on Hand)</option>
          </select>
        </div>
      </div>

      {/* 30-Day 'Stock on Hand' Depletion Trend Visualization */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-teal-600" />
                30-Day Stock Depletion & Consumption Trend
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                Depletion Curve
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Visualizing daily stock-on-hand depletion curves and chairside burn rate for top clinical consumables (Sep 07 – Oct 06, 2026).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setTrendViewMode('line')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  trendViewMode === 'line'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Line Trend
              </button>
              <button
                type="button"
                onClick={() => setTrendViewMode('bar')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  trendViewMode === 'bar'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Daily Burn (Bars)
              </button>
            </div>

            <select
              value={trendItemFilter}
              onChange={(e) => setTrendItemFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 cursor-pointer"
            >
              <option value="all">All High-Usage Consumables</option>
              <option value="inv-1">Lidocaine 2% Carpules (Anesthetic)</option>
              <option value="inv-2">Disposable Suction Tips</option>
              <option value="inv-3">Filtek Z350 Composite (A2)</option>
              <option value="inv-5">Cotton Rolls #2 Absorbent</option>
              <option value="inv-4">Nitrile Exam Gloves (M)</option>
            </select>
          </div>
        </div>

        {/* Visual Trend Bars / Lines Representation */}
        <div className="bg-slate-900 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between text-xs mb-3 text-slate-400">
            <span>Sep 07, 2026 (Starting Baseline)</span>
            <span className="font-semibold text-teal-400">30-Day Chairside Depletion Trajectory</span>
            <span>Today (Oct 06, 2026)</span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'inv-1',
                name: 'Lidocaine 2% Carpules',
                unit: 'carpules',
                current: inventory.find((i) => i.id === 'inv-1')?.stockOnHand ?? 140,
                start: 210,
                threshold: 50,
                color: 'from-teal-500 to-teal-400',
              },
              {
                id: 'inv-2',
                name: 'Disposable Suction Tips',
                unit: 'packs',
                current: inventory.find((i) => i.id === 'inv-2')?.stockOnHand ?? 18,
                start: 45,
                threshold: 20,
                color: 'from-sky-500 to-sky-400',
              },
              {
                id: 'inv-3',
                name: 'Filtek Z350 Composite (A2)',
                unit: 'syringes',
                current: inventory.find((i) => i.id === 'inv-3')?.stockOnHand ?? 8,
                start: 24,
                threshold: 10,
                color: 'from-amber-500 to-amber-400',
              },
              {
                id: 'inv-5',
                name: 'Cotton Rolls #2 Absorbent',
                unit: 'packs',
                current: inventory.find((i) => i.id === 'inv-5')?.stockOnHand ?? 6,
                start: 25,
                threshold: 8,
                color: 'from-rose-500 to-rose-400',
              },
              {
                id: 'inv-4',
                name: 'Nitrile Exam Gloves (M)',
                unit: 'boxes',
                current: inventory.find((i) => i.id === 'inv-4')?.stockOnHand ?? 32,
                start: 55,
                threshold: 15,
                color: 'from-purple-500 to-purple-400',
              },
            ]
              .filter((item) => trendItemFilter === 'all' || item.id === trendItemFilter)
              .map((item) => {
                const pctRemaining = Math.min(100, Math.round((item.current / item.start) * 100));
                const isBelow = item.current <= item.threshold;
                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{item.name}</span>
                        {isBelow && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Below Threshold (≤ {item.threshold})
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-xs text-slate-300">
                        <span className={isBelow ? 'text-amber-400 font-bold' : 'text-teal-400 font-bold'}>
                          {item.current}
                        </span>{' '}
                        <span className="text-slate-500">/ {item.start} {item.unit}</span> ({pctRemaining}% left)
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                        style={{ width: `${pctRemaining}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* High-Usage Item Depletion Trajectory Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-3 border-t border-slate-100 text-xs">
          <div className="p-2.5 rounded-lg bg-teal-50/50 border border-teal-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px] truncate">Lidocaine 2%</span>
              <span className="text-[10px] font-mono font-bold text-teal-800">
                {inventory.find((i) => i.id === 'inv-1')?.stockOnHand ?? 140} carpules
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Burn: ~2.3/day</span>
              <span className="text-emerald-700 font-semibold">Healthy</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px] truncate">Suction Tips</span>
              <span className="text-[10px] font-mono font-bold text-amber-700">
                {inventory.find((i) => i.id === 'inv-2')?.stockOnHand ?? 18} packs
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Burn: ~0.9/day</span>
              <span className="text-amber-700 font-semibold">≤ 20 Alert</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px] truncate">Filtek Composite</span>
              <span className="text-[10px] font-mono font-bold text-amber-700">
                {inventory.find((i) => i.id === 'inv-3')?.stockOnHand ?? 8} syringes
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Burn: ~0.5/day</span>
              <span className="text-amber-700 font-semibold">≤ 10 Alert</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px] truncate">Cotton Rolls #2</span>
              <span className="text-[10px] font-mono font-bold text-rose-700">
                {inventory.find((i) => i.id === 'inv-5')?.stockOnHand ?? 6} packs
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Burn: ~0.6/day</span>
              <span className="text-rose-700 font-semibold">≤ 8 Alert</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-purple-50/50 border border-purple-100 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-[11px] truncate">Nitrile Gloves</span>
              <span className="text-[10px] font-mono font-bold text-purple-800">
                {inventory.find((i) => i.id === 'inv-4')?.stockOnHand ?? 32} boxes
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Restocked +20</span>
              <span className="text-purple-700 font-semibold">In Stock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supplies Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-5 py-3">Item Name & Packaging</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Stock on Hand</th>
                <th className="px-4 py-3 text-right">Reorder Min</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Supplier & Lot</th>
                <th className="px-5 py-3 text-right">Chairside Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    No clinical supplies match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isDepleted = item.status === 'Depleted';
                  const isLow = item.status === 'Low Stock';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Unit */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{item.unit}</div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {item.category}
                      </td>

                      {/* Stock on Hand */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold tabular-nums">
                        <span className={isDepleted ? 'text-rose-600 font-extrabold' : isLow ? 'text-amber-600' : 'text-slate-900'}>
                          {item.stockOnHand}
                        </span>
                      </td>

                      {/* Threshold */}
                      <td className="px-4 py-3.5 text-right font-mono text-slate-500 tabular-nums">
                        {item.reorderThreshold}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          isDepleted
                            ? 'bg-rose-100 text-rose-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Supplier & Lot */}
                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="truncate max-w-[160px]">{item.supplier}</div>
                        {item.lotNumber && (
                          <div className="text-[10px] font-mono text-slate-400">Lot: {item.lotNumber}</div>
                        )}
                      </td>

                      {/* Actions: Quick Deduct & Restock */}
                      <td className="px-5 py-3.5 text-right space-x-1">
                        {/* Chairside quick deduct */}
                        <button
                          type="button"
                          onClick={() => handleQuickDeduct(item, 1)}
                          disabled={item.stockOnHand <= 0}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded text-xs font-medium transition-colors"
                          title="Deduct 1 used chairside"
                        >
                          -1 Use
                        </button>

                        {/* Restock Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setRestockModalItem(item);
                            setRestockQty(item.reorderThreshold * 2);
                          }}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded text-xs font-medium transition-colors"
                          title="Restock Item"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-teal-700 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold">Restock Clinical Supply</h3>
                <p className="text-[11px] text-teal-100 truncate max-w-[280px]">{restockModalItem.name}</p>
              </div>
              <button onClick={() => setRestockModalItem(null)} className="text-white hover:opacity-80">✕</button>
            </div>

            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Current Stock on Hand:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {restockModalItem.stockOnHand} {restockModalItem.unit}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Quantity Received / Added *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full font-mono border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Manufacturer Lot / Batch #</label>
                <input
                  type="text"
                  placeholder="e.g. LOT-2026-OCT-88"
                  value={restockLot}
                  onChange={(e) => setRestockLot(e.target.value)}
                  className="w-full font-mono border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold">Add Clinical Supply Item</h3>
                <p className="text-[11px] text-slate-400">TeethCare Central Dispensary</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateItemSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Supply Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Articaine 4% w/ Epinephrine 1:100k"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    <option value="Anesthetics">Anesthetics</option>
                    <option value="Infection Control">Infection Control</option>
                    <option value="Restorative">Restorative</option>
                    <option value="Consumables">Consumables</option>
                    <option value="Endodontics">Endodontics</option>
                    <option value="Hygiene">Hygiene</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Packaging / Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Carpules (50/box)"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(Number(e.target.value))}
                    className="w-full font-mono border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Reorder Min</label>
                  <input
                    type="number"
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(Number(e.target.value))}
                    className="w-full font-mono border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Unit Cost (₱)</label>
                  <input
                    type="number"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(Number(e.target.value))}
                    className="w-full font-mono border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Supplier / Distributor</label>
                <input
                  type="text"
                  placeholder="e.g. Septodont PH, New Citizen Dental"
                  value={newItemSupplier}
                  onChange={(e) => setNewItemSupplier(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Add Supply Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
