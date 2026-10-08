import React, { useState } from 'react';
import { Appointment, Dentist, DentalProcedure } from '../../types/dental';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Plus, 
  MessageSquare, 
  Check, 
  Clock, 
  User, 
  Phone, 
  AlertCircle,
  Filter
} from 'lucide-react';

interface AppointmentsTabProps {
  appointments: Appointment[];
  dentists: Dentist[];
  procedures: DentalProcedure[];
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'smsNotificationSent'>) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({
  appointments,
  dentists,
  procedures,
  onAddAppointment,
  onUpdateStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [selectedDentistFilter, setSelectedDentistFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modal State for Manual Walk-In
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [modalPatientName, setModalPatientName] = useState<string>('');
  const [modalPhone, setModalPhone] = useState<string>('+63 9');
  const [modalDate, setModalDate] = useState<string>('2026-10-06');
  const [modalTime, setModalTime] = useState<string>('11:30 AM');
  const [modalDentistId, setModalDentistId] = useState<string>(dentists[0]?.id || '');
  const [modalProcedure, setModalProcedure] = useState<string>(procedures[0]?.name || '');
  const [modalNotes, setModalNotes] = useState<string>('');

  // Toast for SMS notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerSmsToast = (patientName: string, phone: string, ref: string) => {
    setToastMessage(`SMS Reminder dispatched to ${patientName} (${phone}) [Ref: ${ref}]`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalPatientName.trim()) return;

    const dentist = dentists.find((d) => d.id === modalDentistId) || dentists[0];
    const generatedRef = `TC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    onAddAppointment({
      referenceNumber: generatedRef,
      patientName: modalPatientName.trim(),
      patientPhone: modalPhone.trim(),
      patientEmail: 'walkin@clinic.ph',
      procedureType: modalProcedure,
      dentistId: dentist.id,
      dentistName: dentist.name,
      date: modalDate,
      timeSlot: modalTime,
      status: 'Confirmed',
      notes: modalNotes.trim() || 'Walk-in / Front Desk booking',
      smsRecipient: modalPhone.trim(),
    });

    triggerSmsToast(modalPatientName, modalPhone, generatedRef);
    setShowAddModal(false);
    setModalPatientName('');
    setModalNotes('');
  };

  // Filter Logic
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = 
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.procedureType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = 
      selectedDateFilter === 'all' ? true : apt.date === selectedDateFilter;

    const matchesDentist = 
      selectedDentistFilter === 'all' ? true : apt.dentistId === selectedDentistFilter;

    const matchesStatus = 
      selectedStatusFilter === 'all' ? true : apt.status === selectedStatusFilter;

    return matchesSearch && matchesDate && matchesDentist && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Appointments Schedule & Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage dental chair reservations, walk-ins, and automated SMS reminder dispatches.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Appointment / Walk-In</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient, Ref #, procedure..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">All Dates</option>
              <option value="2026-10-06">Today (Oct 06, 2026)</option>
              <option value="2026-10-07">Tomorrow (Oct 07, 2026)</option>
            </select>
          </div>

          {/* Dentist Filter */}
          <div>
            <select
              value={selectedDentistFilter}
              onChange={(e) => setSelectedDentistFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">All Dentists</option>
              {dentists.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name.split(',')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked-In">Checked-In</option>
              <option value="In-Chair">In-Chair</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-5 py-3">Ref & Time</th>
                <th className="px-5 py-3">Patient Name & Contact</th>
                <th className="px-5 py-3">Procedure</th>
                <th className="px-5 py-3">Attending Dentist</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No appointments found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Time & Ref */}
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-slate-900 tabular-nums">{apt.timeSlot}</div>
                      <div className="text-[11px] font-mono text-teal-700">{apt.referenceNumber}</div>
                      <div className="text-[11px] text-slate-400">{apt.date}</div>
                    </td>

                    {/* Patient */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{apt.patientName}</div>
                      <div className="text-[11px] font-mono text-slate-500 tabular-nums">{apt.patientPhone}</div>
                      {apt.notes && (
                        <div className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                          {apt.notes}
                        </div>
                      )}
                    </td>

                    {/* Procedure */}
                    <td className="px-5 py-3.5 text-slate-700">
                      <div className="font-medium">{apt.procedureType}</div>
                    </td>

                    {/* Dentist */}
                    <td className="px-5 py-3.5 text-slate-600">
                      <div>{apt.dentistName}</div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="px-4 py-3.5">
                      <select
                        value={apt.status}
                        onChange={(e) => onUpdateStatus(apt.id, e.target.value as Appointment['status'])}
                        className={`text-xs font-semibold px-2 py-1 rounded border focus:outline-none ${
                          apt.status === 'In-Chair'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : apt.status === 'Checked-In'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : apt.status === 'Pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : apt.status === 'Completed'
                            ? 'bg-slate-100 text-slate-600 border-slate-300'
                            : apt.status === 'Cancelled' || apt.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-300'
                            : 'bg-teal-50 text-teal-800 border-teal-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Checked-In">Checked-In</option>
                        <option value="In-Chair">In-Chair</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => triggerSmsToast(apt.patientName, apt.patientPhone, apt.referenceNumber)}
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded transition-colors"
                        title="Resend SMS Notification"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Walk-In Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold">Create Appointment / Walk-In</h3>
                <p className="text-[11px] text-slate-400">Log immediate chair booking at front desk</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gabriel Mendoza"
                  value={modalPatientName}
                  onChange={(e) => setModalPatientName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Philippine Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  className="w-full font-mono border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={modalTime}
                    onChange={(e) => setModalTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Attending Dentist</label>
                <select
                  value={modalDentistId}
                  onChange={(e) => setModalDentistId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  {dentists.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Dental Procedure</label>
                <select
                  value={modalProcedure}
                  onChange={(e) => setModalProcedure(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  {procedures.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} (₱{p.standardFee.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Clinical Notes / Reason</label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Urgent tooth pain, broken cusp, etc."
                  className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 resize-none"
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
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
