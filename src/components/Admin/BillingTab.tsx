import React, { useState } from 'react';
import { 
  Invoice, 
  Patient, 
  DentalProcedure, 
  PaymentMethod, 
  InvoiceLineItem 
} from '../../types/dental';
import { 
  TrendingUp, 
  Receipt, 
  CreditCard, 
  Search, 
  Plus, 
  Printer, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  DollarSign,
  QrCode,
  ShieldCheck,
  X,
  Download,
  FileDown
} from 'lucide-react';

interface BillingTabProps {
  invoices: Invoice[];
  patients: Patient[];
  procedures: DentalProcedure[];
  onCreateInvoice: (invoice: Invoice) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice['paymentStatus']) => void;
  initialPatientForInvoice?: Patient | null;
}

export const BillingTab: React.FC<BillingTabProps> = ({
  invoices,
  patients,
  procedures,
  onCreateInvoice,
  onUpdateInvoiceStatus,
  initialPatientForInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Invoice for printable receipt view
  const [selectedReceipt, setSelectedReceipt] = useState<Invoice | null>(null);

  // Export to PDF Patient Selector Modal State
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [selectedExportPatientId, setSelectedExportPatientId] = useState<string>(patients[0]?.id || '');
  const [selectedExportInvoiceId, setSelectedExportInvoiceId] = useState<string>('latest');

  // Invoice Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(!!initialPatientForInvoice);
  const [invPatientId, setInvPatientId] = useState<string>(
    initialPatientForInvoice ? initialPatientForInvoice.id : (patients[0]?.id || '')
  );
  const [invPaymentMethod, setInvPaymentMethod] = useState<PaymentMethod>('GCash');
  const [invRefNumber, setInvRefNumber] = useState<string>(
    `GC-${Math.floor(100000000000 + Math.random() * 900000000000)}`
  );
  const [invStatus, setInvStatus] = useState<Invoice['paymentStatus']>('Settled');
  const [invDiscountType, setInvDiscountType] = useState<Invoice['discountType']>('None');
  const [invNotes, setInvNotes] = useState<string>('');

  // Line items state in creation modal
  const [selectedProcedureIds, setSelectedProcedureIds] = useState<{ procId: string; qty: number }[]>([
    { procId: procedures[0]?.id || '', qty: 1 },
  ]);

  // Update auto reference number generator when method changes
  const handleMethodSelect = (method: PaymentMethod) => {
    setInvPaymentMethod(method);
    if (method === 'GCash') {
      setInvRefNumber(`GC-${Math.floor(100000000000 + Math.random() * 900000000000)}`);
    } else if (method === 'Maya') {
      setInvRefNumber(`MY-${Math.floor(10000000000 + Math.random() * 90000000000)}`);
    } else if (method === 'Bank Transfer') {
      setInvRefNumber(`BDO-TRF-${Math.floor(100000 + Math.random() * 900000)}`);
    } else if (method === 'Credit/Debit Card') {
      setInvRefNumber(`POS-AUTH-${Math.floor(100000 + Math.random() * 900000)}`);
    } else {
      setInvRefNumber(`CSH-REC-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  // Add another line item
  const handleAddLineItem = () => {
    setSelectedProcedureIds([...selectedProcedureIds, { procId: procedures[1]?.id || procedures[0].id, qty: 1 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (selectedProcedureIds.length <= 1) return;
    const updated = [...selectedProcedureIds];
    updated.splice(index, 1);
    setSelectedProcedureIds(updated);
  };

  // Calculate modal line items subtotal & discounts
  const builtLineItems: InvoiceLineItem[] = selectedProcedureIds.map((item) => {
    const proc = procedures.find((p) => p.id === item.procId) || procedures[0];
    return {
      procedureId: proc.id,
      description: proc.name,
      quantity: item.qty,
      unitPrice: proc.standardFee,
      total: proc.standardFee * item.qty,
    };
  });

  const subtotal = builtLineItems.reduce((sum, item) => sum + item.total, 0);
  const discountRate = (invDiscountType === 'Senior Citizen (20%)' || invDiscountType === 'PWD (20%)') ? 0.20 : 0;
  const discountAmount = Math.round(subtotal * discountRate);
  const totalAmount = subtotal - discountAmount;

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === invPatientId) || patients[0];
    const newInvoiceNumber = `TC-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: newInvoiceNumber,
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      date: '2026-10-06',
      dentistName: 'Dr. Maria Corazon Santos, DMD',
      lineItems: builtLineItems,
      subtotal,
      discountType: invDiscountType,
      discountAmount,
      totalAmount,
      paymentMethod: invPaymentMethod,
      referenceNumber: invRefNumber,
      paymentStatus: invStatus,
      notes: invNotes || 'Rendered treatment billed via TeethCare Point of Sale.',
    };

    onCreateInvoice(newInvoice);
    setShowCreateModal(false);
    setSelectedReceipt(newInvoice);
  };

  // Financial Metrics
  const settledInvoices = invoices.filter((i) => i.paymentStatus === 'Settled');
  const pendingInvoices = invoices.filter((i) => i.paymentStatus === 'Pending');

  const totalIncomeSettled = settledInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPendingAmount = pendingInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

  const gcashShare = settledInvoices
    .filter((i) => i.paymentMethod === 'GCash')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const mayaShare = settledInvoices
    .filter((i) => i.paymentMethod === 'Maya')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const cashlessTotal = gcashShare + mayaShare + settledInvoices
    .filter((i) => i.paymentMethod === 'Bank Transfer' || i.paymentMethod === 'Credit/Debit Card')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const cashlessPercentage = totalIncomeSettled > 0 ? Math.round((cashlessTotal / totalIncomeSettled) * 100) : 0;

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      inv.invoiceNumber.toLowerCase().includes(query) ||
      inv.patientName.toLowerCase().includes(query) ||
      inv.referenceNumber.toLowerCase().includes(query);

    const matchesMethod = methodFilter === 'all' ? true : inv.paymentMethod === methodFilter;
    const matchesStatus = statusFilter === 'all' ? true : inv.paymentStatus === statusFilter;

    return matchesQuery && matchesMethod && matchesStatus;
  });

  return (
    <div className="space-y-8">
      
      {/* Header and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Cashless Payments & Revenue Summary</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Philippine Pesos (₱) transaction ledger, GCash & Maya gateways, and statutory BIR receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => {
              if (patients.length > 0) {
                setSelectedExportPatientId(patients[0].id);
                setSelectedExportInvoiceId('latest');
                setShowExportModal(true);
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
            title="Export a printable PDF invoice document for a patient using the browser print API"
          >
            <FileDown className="w-4 h-4 text-teal-600" />
            <span>Export to PDF</span>
          </button>

          <button
            onClick={() => {
              handleMethodSelect('GCash');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Dental Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Clean clinical layout, tabular numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Settled Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Settled Revenue (PHP)</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              ₱{totalIncomeSettled.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            {settledInvoices.length} settled procedures this period
          </div>
        </div>

        {/* Cashless Adoption Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Cashless Adoption (GCash/Maya)</span>
            <QrCode className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-teal-700">
              {cashlessPercentage}%
            </span>
            <span className="text-xs text-slate-500">
              (₱{cashlessTotal.toLocaleString()})
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            GCash: ₱{gcashShare.toLocaleString()} · Maya: ₱{mayaShare.toLocaleString()}
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pending Receivables</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              ₱{totalPendingAmount.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            {pendingInvoices.length} invoices awaiting completion
          </div>
        </div>

        {/* Official Receipts Logged */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Logged Official Receipts</span>
            <Receipt className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {invoices.length}
            </span>
            <span className="text-xs text-slate-500">transactions</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Compliant BIR Electronic Ledger
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice #, patient, or reference #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">All Payment Channels</option>
            <option value="GCash">GCash QR / Mobile</option>
            <option value="Maya">Maya Business</option>
            <option value="Bank Transfer">Bank Transfer (BDO/BPI)</option>
            <option value="Credit/Debit Card">Credit / Debit Card</option>
            <option value="Cash">Cash at Clinic Desk</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">All Settlement Statuses</option>
            <option value="Settled">Settled (Paid)</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
          </select>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-5 py-3">Invoice # & Date</th>
                <th className="px-5 py-3">Patient Name</th>
                <th className="px-5 py-3">Rendered Procedures</th>
                <th className="px-4 py-3">Gateway & Ref #</th>
                <th className="px-4 py-3 text-right">Total (₱)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    No billing records found matching query.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Invoice Number */}
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</div>
                      <div className="text-[11px] text-slate-400 font-mono tabular-nums">{inv.date}</div>
                    </td>

                    {/* Patient */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{inv.patientName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{inv.patientPhone}</div>
                    </td>

                    {/* Procedures */}
                    <td className="px-5 py-3.5 text-slate-700">
                      <div className="line-clamp-1 font-medium">
                        {inv.lineItems.map((li) => li.description).join(', ')}
                      </div>
                      {inv.discountAmount > 0 && (
                        <div className="text-[11px] text-teal-700 font-medium">
                          {inv.discountType} (-₱{inv.discountAmount.toLocaleString()})
                        </div>
                      )}
                    </td>

                    {/* Gateway & Reference */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{inv.paymentMethod}</div>
                      <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                        {inv.referenceNumber}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ₱{inv.totalAmount.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <select
                        value={inv.paymentStatus}
                        onChange={(e) => onUpdateInvoiceStatus(inv.id, e.target.value as any)}
                        className={`text-xs font-semibold px-2 py-0.5 rounded border focus:outline-none ${
                          inv.paymentStatus === 'Settled'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : inv.paymentStatus === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="Settled">Settled</option>
                        <option value="Pending">Pending</option>
                        <option value="Partial">Partial</option>
                      </select>
                    </td>

                    {/* Receipt & Export Action */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedReceipt(inv);
                            setTimeout(() => {
                              window.print();
                            }, 250);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          title="Export / Print PDF Invoice using browser print API"
                        >
                          <FileDown className="w-3.5 h-3.5 text-teal-600" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => setSelectedReceipt(inv)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          title="Preview full electronic dental invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Preview</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold">Create Dental Procedure Invoice</h3>
                <p className="text-[11px] text-slate-400">TeethCare Point-of-Sale & Billing Terminal</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveInvoice} className="p-6 space-y-5 text-xs">
              
              {/* Select Patient */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">Select Patient *</label>
                <select
                  value={invPatientId}
                  onChange={(e) => setInvPatientId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.id}) — {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line items selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                    Rendered Procedures (Line Items)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1"
                  >
                    <span>+ Add Procedure Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedProcedureIds.map((item, index) => {
                    return (
                      <div key={index} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <select
                          value={item.procId}
                          onChange={(e) => {
                            const updated = [...selectedProcedureIds];
                            updated[index].procId = e.target.value;
                            setSelectedProcedureIds(updated);
                          }}
                          className="flex-1 bg-white border border-slate-200 rounded p-1.5 text-slate-800"
                        >
                          {procedures.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — ₱{p.standardFee.toLocaleString()}
                            </option>
                          ))}
                        </select>

                        <div className="w-20">
                          <input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={(e) => {
                              const updated = [...selectedProcedureIds];
                              updated[index].qty = Math.max(1, Number(e.target.value));
                              setSelectedProcedureIds(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded p-1.5 text-center font-mono"
                            title="Quantity"
                          />
                        </div>

                        {selectedProcedureIds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(index)}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Statutory Philippine Discounts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Statutory Discount (Philippine Republic Act)
                  </label>
                  <select
                    value={invDiscountType}
                    onChange={(e) => setInvDiscountType(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800"
                  >
                    <option value="None">None (Standard Rate)</option>
                    <option value="Senior Citizen (20%)">Senior Citizen (20% under RA 9994)</option>
                    <option value="PWD (20%)">Person with Disability (20% under RA 10754)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Payment Status</label>
                  <select
                    value={invStatus}
                    onChange={(e) => setInvStatus(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800"
                  >
                    <option value="Settled">Settled (Paid in Full)</option>
                    <option value="Pending">Pending Settlement</option>
                    <option value="Partial">Partial Downpayment</option>
                  </select>
                </div>
              </div>

              {/* Cashless Gateway Selector */}
              <div>
                <label className="block text-slate-700 font-semibold uppercase tracking-wider text-[11px] mb-2">
                  Select Cashless Gateway / Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['GCash', 'Maya', 'Bank Transfer', 'Credit/Debit Card', 'Cash'] as PaymentMethod[]).map((method) => {
                    const isSelected = invPaymentMethod === method;
                    return (
                      <button
                        type="button"
                        key={method}
                        onClick={() => handleMethodSelect(method)}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold ring-1 ring-teal-600'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-xs">{method}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Automated Reference Number */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Gateway Transaction Reference Number *
                </label>
                <input
                  type="text"
                  required
                  value={invRefNumber}
                  onChange={(e) => setInvRefNumber(e.target.value)}
                  className="w-full font-mono border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Calculation Summary Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums">₱{subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-teal-700 font-medium">
                    <span>Discount ({invDiscountType}):</span>
                    <span className="font-mono tabular-nums">-₱{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                  <span>Net Amount Due:</span>
                  <span className="font-mono tabular-nums text-teal-800">₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Issue Invoice & Generate Receipt
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Printable Official Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            
            {/* Modal Controls Top Bar */}
            <div className="bg-slate-900 px-6 py-3 text-white flex justify-between items-center no-print">
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-semibold">Official Dental Invoice & BIR Receipt Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  title="Print or Save as PDF in the browser print dialog"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export to PDF / Print</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Receipt Printable Sheet */}
            <div className="p-8 space-y-6 text-slate-900 bg-white" id="printable-receipt">
              
              {/* Header */}
              <div className="text-center border-b border-slate-200 pb-4">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">TEETHCARE DENTAL CLINIC</h2>
                <p className="text-xs text-slate-600">Makati Medical Plaza Suite 402, Legaspi Village, Makati City</p>
                <p className="text-[11px] text-slate-500 font-mono">TIN: 402-991-824-000 · Tel: (02) 8842-1900</p>
                <p className="text-[11px] text-teal-800 font-medium mt-1">PRC Accredited Dental Healthcare Facility</p>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-4">
                <div>
                  <span className="text-slate-500 block text-[11px]">Official Receipt No:</span>
                  <span className="font-mono font-bold">{selectedReceipt.invoiceNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[11px]">Date Issued:</span>
                  <span className="font-mono tabular-nums">{selectedReceipt.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Patient Name:</span>
                  <span className="font-semibold">{selectedReceipt.patientName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[11px]">Attending Dentist:</span>
                  <span>{selectedReceipt.dentistName}</span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 pb-1">
                  <span>Dental Procedure</span>
                  <span className="text-right">Amount (PHP)</span>
                </div>
                {selectedReceipt.lineItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-100">
                    <div>
                      <span className="font-medium">{item.description}</span>
                      {item.quantity > 1 && (
                        <span className="text-slate-500 text-[11px] ml-1">x{item.quantity}</span>
                      )}
                    </div>
                    <span className="font-mono tabular-nums font-semibold">
                      ₱{item.total.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals & Discounts */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums">₱{selectedReceipt.subtotal.toLocaleString()}</span>
                </div>
                {selectedReceipt.discountAmount > 0 && (
                  <div className="flex justify-between text-teal-800 font-medium">
                    <span>{selectedReceipt.discountType}:</span>
                    <span className="font-mono tabular-nums">-₱{selectedReceipt.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono tabular-nums text-teal-800">
                    ₱{selectedReceipt.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Settlement Gateway Details */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Gateway:</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Reference:</span>
                  <span className="font-mono font-bold text-teal-900">{selectedReceipt.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-semibold text-emerald-700">Settled & Cleared</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <p>Thank you for choosing TeethCare Dental Clinic.</p>
                <p className="mt-0.5">This document serves as an electronic official dental receipt.</p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Export to PDF for Selected Patient Record Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <FileDown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Export Printable PDF Invoice</h3>
                  <p className="text-[11px] text-slate-400">Generate printable invoice document for a selected patient record</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Patient Selection Dropdown */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                  1. Select Patient Record *
                </label>
                <select
                  value={selectedExportPatientId}
                  onChange={(e) => {
                    setSelectedExportPatientId(e.target.value);
                    setSelectedExportInvoiceId('latest');
                  }}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium bg-slate-50/50"
                >
                  {patients.map((p) => {
                    const patientInvoices = invoices.filter((i) => i.patientId === p.id || i.patientName === p.fullName);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.id}) — {patientInvoices.length} invoice(s) on file
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Patient Record Information Card */}
              {(() => {
                const targetPatient = patients.find((p) => p.id === selectedExportPatientId) || patients[0];
                if (!targetPatient) return null;

                const patientInvoices = invoices.filter(
                  (i) => i.patientId === targetPatient.id || i.patientName === targetPatient.fullName
                );

                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Patient Dossier</span>
                        <h4 className="font-bold text-slate-900 text-sm">{targetPatient.fullName}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                        {targetPatient.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Contact Mobile:</span>
                        <span className="font-mono text-slate-800 font-medium">{targetPatient.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Demographics:</span>
                        <span className="text-slate-800 font-medium">{targetPatient.age} yrs · {targetPatient.gender}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px]">Clinic Address:</span>
                        <span className="text-slate-800 font-medium truncate block">{targetPatient.address}</span>
                      </div>
                    </div>

                    {/* Invoice Choice */}
                    <div className="pt-2 border-t border-slate-200">
                      <label className="block text-slate-700 font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                        2. Select Patient Invoice Document
                      </label>
                      {patientInvoices.length === 0 ? (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                          No existing invoice on file for this patient. A comprehensive clinical statement invoice will be synthesized from their primary visit record for export.
                        </div>
                      ) : (
                        <select
                          value={selectedExportInvoiceId}
                          onChange={(e) => setSelectedExportInvoiceId(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium bg-white"
                        >
                          <option value="latest">Latest Transaction ({patientInvoices[0].invoiceNumber} — ₱{patientInvoices[0].totalAmount.toLocaleString()})</option>
                          {patientInvoices.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                              {inv.invoiceNumber} · {inv.date} · ₱{inv.totalAmount.toLocaleString()} ({inv.paymentMethod})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetPatient = patients.find((p) => p.id === selectedExportPatientId) || patients[0];
                    if (!targetPatient) return;

                    const patientInvoices = invoices.filter(
                      (i) => i.patientId === targetPatient.id || i.patientName === targetPatient.fullName
                    );

                    let targetInv: Invoice;
                    if (patientInvoices.length > 0) {
                      if (selectedExportInvoiceId === 'latest') {
                        targetInv = patientInvoices[0];
                      } else {
                        targetInv = patientInvoices.find((i) => i.id === selectedExportInvoiceId) || patientInvoices[0];
                      }
                    } else {
                      // Construct a valid official invoice from procedures or standard dental package
                      const defaultProc = procedures[0] || {
                        id: 'proc-1',
                        name: 'Comprehensive Dental Examination & Consultation',
                        standardFee: 1200,
                      };
                      targetInv = {
                        id: `inv-export-${Date.now()}`,
                        invoiceNumber: `TC-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                        patientId: targetPatient.id,
                        patientName: targetPatient.fullName,
                        patientPhone: targetPatient.phone,
                        date: '2026-10-06',
                        dentistName: 'Dr. Maria Corazon Santos, DMD',
                        lineItems: [
                          {
                            procedureId: defaultProc.id,
                            description: defaultProc.name,
                            quantity: 1,
                            unitPrice: defaultProc.standardFee,
                            total: defaultProc.standardFee,
                          },
                        ],
                        subtotal: defaultProc.standardFee,
                        discountType: 'None',
                        discountAmount: 0,
                        totalAmount: defaultProc.standardFee,
                        paymentMethod: 'GCash',
                        referenceNumber: `GC-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
                        paymentStatus: 'Settled',
                        notes: `Generated official patient statement and clinical tax invoice for ${targetPatient.fullName}.`,
                      };
                    }

                    setShowExportModal(false);
                    setSelectedReceipt(targetInv);

                    // Trigger browser print dialog for printable invoice document / save as PDF
                    setTimeout(() => {
                      window.print();
                    }, 300);
                  }}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Generate & Export PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
