import React, { useState } from 'react';
import { Appointment, Patient, InventoryItem, Invoice, AdminTab } from '../../types/dental';
import { 
  Calendar, 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Activity,
  AlertTriangle,
  Receipt,
  Phone,
  Check,
  X,
  AlertCircle,
  Smartphone
} from 'lucide-react';

interface OverviewTabProps {
  appointments: Appointment[];
  patients: Patient[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  onNavigateTab: (tab: AdminTab) => void;
  onSelectPatientForChart: (patientId: string) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status'], rejectionReason?: string) => void;
  onCreateInvoiceForPatient: (patient: Patient) => void;
  onAcceptAppointment?: (id: string) => void;
  onRejectAppointment?: (id: string, reason: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  appointments,
  patients,
  inventory,
  invoices,
  onNavigateTab,
  onSelectPatientForChart,
  onUpdateAppointmentStatus,
  onCreateInvoiceForPatient,
  onAcceptAppointment,
  onRejectAppointment,
}) => {
  // Rejection Modal State
  const [rejectingApt, setRejectingApt] = useState<Appointment | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectError, setRejectError] = useState<string>('');
  const [showRejectSmsPreview, setShowRejectSmsPreview] = useState<boolean>(true);

  // Accept Modal State
  const [acceptingApt, setAcceptingApt] = useState<Appointment | null>(null);
  const [showAcceptSmsPreview, setShowAcceptSmsPreview] = useState<boolean>(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compute Key Metrics
  const today = '2026-10-06';
  const todayAppointments = appointments.filter((a) => a.date === today);
  const inChairApt = todayAppointments.find((a) => a.status === 'In-Chair');
  const lowStockItems = inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Depleted');

  // Filter Pending Online Requests
  const pendingRequests = appointments.filter((a) => a.status === 'Pending');

  // Revenue calculation for today
  const todayInvoices = invoices.filter((i) => i.date === today);
  const todaySettledTotal = todayInvoices
    .filter((i) => i.paymentStatus === 'Settled')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const pendingInvoicesTotal = invoices
    .filter((i) => i.paymentStatus === 'Pending')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleOpenAcceptModal = (apt: Appointment) => {
    setAcceptingApt(apt);
    setShowAcceptSmsPreview(true);
  };

  const handleConfirmAccept = () => {
    if (!acceptingApt) return;
    if (onAcceptAppointment) {
      onAcceptAppointment(acceptingApt.id);
    } else {
      onUpdateAppointmentStatus(acceptingApt.id, 'Confirmed');
    }
    showToast(`Appointment for ${acceptingApt.patientName} CONFIRMED! Calendar slot locked & confirmation SMS dispatched.`);
    setAcceptingApt(null);
  };

  const handleOpenRejectModal = (apt: Appointment) => {
    setRejectingApt(apt);
    setRejectionReason('Doctor has emergency surgical procedure');
    setRejectError('');
    setShowRejectSmsPreview(true);
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingApt) return;
    if (!rejectionReason.trim()) {
      setRejectError('Please input an explanation note for the patient.');
      return;
    }

    if (onRejectAppointment) {
      onRejectAppointment(rejectingApt.id, rejectionReason.trim());
    } else {
      onUpdateAppointmentStatus(rejectingApt.id, 'Rejected', rejectionReason.trim());
    }

    showToast(`Appointment request for ${rejectingApt.patientName} marked as REJECTED. Explanation note saved & SMS dispatched.`);
    setRejectingApt(null);
    setRejectionReason('');
    setRejectError('');
  };

  const quickReasons = [
    'Doctor has emergency surgical procedure',
    'Slot unavailable due to clinic maintenance',
    'Doctor not on duty on requested day',
    'Specialist consultation requires longer slot',
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Banner / Operations Kicker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <span>Clinic Operational Console</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-normal">Makati Medical Plaza Suite 402</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Today&apos;s Clinical Overview & Schedule
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-xs font-mono tabular-nums">
          <Clock className="w-3.5 h-3.5 text-teal-600" />
          <span>Tuesday, October 06, 2026</span>
        </div>
      </div>

      {/* KPI Cards Grid (4 columns, clean borders, no pill clutter) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today's Appointments */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Today&apos;s Appointments</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {todayAppointments.length}
            </span>
            <span className="text-xs text-slate-500">
              ({todayAppointments.filter((a) => a.status === 'Completed').length} completed)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Scheduled slots</span>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1"
            >
              <span>View queue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Currently Seated / In-Chair */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Currently In-Chair</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            {inChairApt ? (
              <div>
                <span className="text-sm font-bold text-emerald-800 block truncate">
                  {inChairApt.patientName}
                </span>
                <span className="text-xs text-slate-500 truncate block">
                  {inChairApt.procedureType}
                </span>
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-400">Chair Available</span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Operatory 1</span>
            {inChairApt && (
              <button
                onClick={() => {
                  const pt = patients.find((p) => p.fullName === inChairApt.patientName);
                  if (pt) onSelectPatientForChart(pt.id);
                  else onNavigateTab('odontogram');
                }}
                className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
              >
                <span>Open Chart</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Supply Alerts */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Low Stock Alerts</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {lowStockItems.length}
            </span>
            <span className="text-xs text-amber-700 font-medium">
              items require reorder
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Consumables & PPE</span>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
            >
              <span>Restock now</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Daily Revenue (PHP) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Today&apos;s Settled (PHP)</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              ₱{todaySettledTotal.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">
              (GCash & Maya)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">₱{pendingInvoicesTotal.toLocaleString()} pending</span>
            <button
              onClick={() => onNavigateTab('billing')}
              className="text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1"
            >
              <span>Billing ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* Pending Online Requests Section (NEW: Appointment Verification Workflow) */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-teal-50/50 via-white to-amber-50/30 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600/10 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Pending Online Requests
                </h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  pendingRequests.length > 0 
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {pendingRequests.length} {pendingRequests.length === 1 ? 'Request' : 'Requests'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Newly booked appointments from patients awaiting dentist verification and calendar confirmation.
              </p>
            </div>
          </div>
          {pendingRequests.length > 0 && (
            <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Action required: Confirm or decline</span>
            </div>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center bg-slate-50/40">
            <CheckCircle className="w-8 h-8 text-teal-600 mx-auto mb-2 opacity-70" />
            <h4 className="text-sm font-semibold text-slate-700">No Pending Requests In Queue</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              All self-service bookings from the patient portal have been processed. New patient bookings will appear here instantly for approval.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Details Column */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {req.patientName}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {req.patientPhone}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      Ref: {req.referenceNumber}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>{req.date}</span>
                      <span className="text-slate-400">at</span>
                      <span className="font-semibold text-teal-700 font-mono">{req.timeSlot}</span>
                    </div>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-700 font-medium">
                      {req.procedureType}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 text-[11px]">
                      Dentist: {req.dentistName.split(',')[0]}
                    </span>
                  </div>

                  {req.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 border border-slate-100 px-2 py-0.5 rounded inline-block max-w-xl">
                      &ldquo;{req.notes}&rdquo;
                    </p>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Submitted: {req.createdAt || 'Recently'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenAcceptModal(req)}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept / Confirm</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenRejectModal(req)}
                    className="px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 hover:border-rose-400 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline / Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Main Grid: Today's Clinical Queue (Left) & Urgent Alerts (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Today's Chair Queue (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today&apos;s Patient Chair Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live status progression for seated and arriving patients.</p>
            </div>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-xs text-teal-700 font-semibold hover:text-teal-800"
            >
              Full Calendar
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {todayAppointments.map((apt) => {
              const matchedPt = patients.find((p) => p.fullName === apt.patientName);
              const hasAllergy = matchedPt && matchedPt.allergies.length > 0 && matchedPt.allergies[0] !== 'None reported';

              return (
                <div key={apt.id} className="p-4 sm:px-6 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 tabular-nums">{apt.timeSlot}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">{apt.patientName}</span>
                      {hasAllergy && (
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                          Alert: {matchedPt.allergies.join(', ')}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span>{apt.procedureType}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">{apt.dentistName.split(',')[0]}</span>
                    </div>

                    {apt.notes && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-1">
                        Note: {apt.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions & Status Changer */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      apt.status === 'In-Chair'
                        ? 'bg-emerald-100 text-emerald-800'
                        : apt.status === 'Checked-In'
                        ? 'bg-amber-100 text-amber-800'
                        : apt.status === 'Completed'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-teal-50 text-teal-700'
                    }`}>
                      {apt.status}
                    </span>

                    {/* Quick status dropdown */}
                    <select
                      value={apt.status}
                      onChange={(e) => onUpdateAppointmentStatus(apt.id, e.target.value as Appointment['status'])}
                      className="bg-white border border-slate-200 rounded text-xs px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Checked-In">Checked-In</option>
                      <option value="In-Chair">In-Chair</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    {/* Chart shortcut if patient matched */}
                    {matchedPt && (
                      <button
                        title="Open Tooth Chart"
                        onClick={() => onSelectPatientForChart(matchedPt.id)}
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded transition-colors"
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Inventory Quick Alert & Philippine Cashless Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Low Stock Items Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Critical Consumables
              </h3>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs text-teal-700 hover:text-teal-800 font-medium"
              >
                All Supplies
              </button>
            </div>

            <div className="space-y-3">
              {lowStockItems.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="pr-2">
                    <div className="font-medium text-slate-800 truncate max-w-[180px]">{item.name}</div>
                    <div className="text-[11px] text-slate-400">{item.unit}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-rose-600 tabular-nums">
                      {item.stockOnHand} left
                    </div>
                    <div className="text-[10px] text-slate-400">Min: {item.reorderThreshold}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Cashless Settlement Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Cashless Payment Gateways
              </h3>
              <Receipt className="w-4 h-4 text-teal-600" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700">GCash Merchant QR:</span>
                <span className="font-semibold text-teal-800 font-mono">0917 842 1900</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700">Maya Business ID:</span>
                <span className="font-semibold text-teal-800 font-mono">TC-DENT-8842</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-700">BDO Online Account:</span>
                <span className="font-semibold text-slate-800 font-mono">0024 1092 8471</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigateTab('billing')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Create Procedure Invoice
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Decline / Reject Prompt Modal */}
      {rejectingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-rose-800">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Decline Appointment Request</h3>
                  <p className="text-xs text-rose-700">Provide an explanation note for the patient</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectingApt(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmRejection} className="p-6 space-y-4">
              {/* Request Summary Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800 text-sm">{rejectingApt.patientName}</span>
                  <span className="font-mono text-[11px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                    {rejectingApt.referenceNumber}
                  </span>
                </div>
                <div className="text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
                  <span>📅 <strong>{rejectingApt.date}</strong> at <strong>{rejectingApt.timeSlot}</strong></span>
                  <span>·</span>
                  <span>🦷 {rejectingApt.procedureType}</span>
                </div>
              </div>

              {/* Quick Preset Reasons */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Quick Explanation Presets:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickReasons.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border text-left transition-colors ${
                        rejectionReason === preset
                          ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Reason Textarea with Preview SMS button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-800">
                    Dentist Explanation Note <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRejectSmsPreview(!showRejectSmsPreview)}
                    className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>{showRejectSmsPreview ? 'Hide SMS Preview' : 'Preview SMS'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (rejectError) setRejectError('');
                  }}
                  placeholder="e.g., Doctor has emergency surgical procedure. Please select an alternative afternoon or weekend slot."
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none text-slate-800 resize-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This explanation will be immediately displayed in the patient&apos;s portal notification banner.
                </p>
                {rejectError && (
                  <p className="text-xs text-rose-600 font-medium mt-1">
                    {rejectError}
                  </p>
                )}
              </div>

              {/* Decline SMS Preview Box */}
              {showRejectSmsPreview && (
                <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-2 border border-slate-800 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1.5 border-b border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                      Patient SMS Preview (Globe/Smart Gateway)
                    </span>
                    <span className="text-teal-400">
                      {Math.ceil((`TeethCare Notice: Hello ${rejectingApt.patientName}, your requested appointment on ${rejectingApt.date} at ${rejectingApt.timeSlot} cannot be accommodated. Note from Doctor: "${rejectionReason || 'Schedule conflict'}". Ref: ${rejectingApt.referenceNumber}. Please select an alternative date via our portal.`).length / 160)} segment
                    </span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400">To:</span> <span className="text-teal-300 font-bold">{rejectingApt.patientPhone} ({rejectingApt.patientName})</span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-lg text-slate-100 border border-slate-700/60 leading-relaxed font-sans text-xs">
                    TeethCare Notice: Hello {rejectingApt.patientName}, your requested appointment on {rejectingApt.date} at {rejectingApt.timeSlot} cannot be accommodated. Note from Doctor: &ldquo;{rejectionReason.trim() || 'Doctor schedule conflict'}&rdquo;. Ref: {rejectingApt.referenceNumber}. Please visit our portal to choose an alternative schedule.
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingApt(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Decline & Send Reason</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accept Appointment Modal (with Preview SMS) */}
      {acceptingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-teal-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/30 border border-teal-300 flex items-center justify-center text-white">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Accept & Confirm Appointment</h3>
                  <p className="text-xs text-teal-100">Lock dental chair slot & dispatch patient SMS</p>
                </div>
              </div>
              <button
                onClick={() => setAcceptingApt(null)}
                className="text-teal-200 hover:text-white p-1 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 space-y-1">
                <div className="flex justify-between items-center font-semibold text-slate-800">
                  <span className="text-sm font-bold text-slate-900">{acceptingApt.patientName}</span>
                  <span className="font-mono text-[11px] text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                    Ref: {acceptingApt.referenceNumber}
                  </span>
                </div>
                <div className="text-slate-600 flex flex-wrap gap-x-3 gap-y-1 pt-1">
                  <span>📅 <span className="font-medium text-slate-800">{acceptingApt.date} at {acceptingApt.timeSlot}</span></span>
                  <span>·</span>
                  <span>🦷 <span className="font-medium text-slate-800">{acceptingApt.procedureType}</span></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Automated Patient SMS Notification:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAcceptSmsPreview(!showAcceptSmsPreview)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/70 border border-teal-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>{showAcceptSmsPreview ? 'Hide SMS Preview' : 'Preview SMS'}</span>
                </button>
              </div>

              {/* Accept SMS Preview Box */}
              {showAcceptSmsPreview && (
                <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-2 border border-slate-800 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1.5 border-b border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Philippine Telco Gateway (Globe/Smart)
                    </span>
                    <span className="text-teal-400">1 segment (154 chars)</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400">Recipient:</span> <span className="text-teal-300 font-bold">{acceptingApt.patientPhone} ({acceptingApt.patientName})</span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-lg text-slate-100 border border-slate-700/60 leading-relaxed font-sans text-xs">
                    TeethCare: Hello {acceptingApt.patientName}, your appointment for {acceptingApt.procedureType} on {acceptingApt.date} at {acceptingApt.timeSlot} with {acceptingApt.dentistName} has been CONFIRMED. Ref: {acceptingApt.referenceNumber}. Please arrive 10 minutes before your schedule at Makati Medical Plaza Suite 402.
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Clicking confirm will update the appointment status to <strong>Confirmed</strong>, lock the calendar slot, and simulate instantaneous Philippine mobile SMS dispatch to the patient.
              </p>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAcceptingApt(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAccept}
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm & Dispatch SMS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
