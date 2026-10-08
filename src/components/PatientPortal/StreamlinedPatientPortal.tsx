import React, { useState } from 'react';
import { Appointment, DentalProcedure } from '../../types/dental';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  AlertCircle, 
  AlertTriangle,
  Bell,
  X,
  Sparkles,
  MapPin,
  Check
} from 'lucide-react';

interface StreamlinedPatientPortalProps {
  procedures: DentalProcedure[];
  appointments: Appointment[];
  onBookAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'smsNotificationSent'>) => void;
  onNavigateToDashboard?: () => void;
}

export const StreamlinedPatientPortal: React.FC<StreamlinedPatientPortalProps> = ({
  procedures,
  appointments,
  onBookAppointment,
  onNavigateToDashboard,
}) => {
  // Notification Banners Dismissal State
  const [dismissedAptIds, setDismissedAptIds] = useState<string[]>([]);
  // Calendar Month State (Year and Month 0-11)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 9 = October (0-indexed)

  // Selected Date string (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-08');

  // Selected Time Slot
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM');

  // Form Fields
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('+63 9');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [selectedProcedureName, setSelectedProcedureName] = useState<string>(procedures[0]?.name || '');
  const [notes, setNotes] = useState<string>('');

  // Confirmation Modal
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to build 7x5 or 7x6 month grid (Sunday to Saturday)
  const getMonthCalendarDays = () => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      days.push({
        dayNum,
        isCurrentMonth: false,
        iso: '',
        status: 'disabled',
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const iso = `${currentYear}-${monthStr}-${dayStr}`;

      // Simulate clinic Sunday closure or booked dates
      const dayOfWeek = new Date(currentYear, currentMonth, d).getDay();
      const isSunday = dayOfWeek === 0;

      // Check if day has multiple appointments or is fully booked
      const bookedCount = appointments.filter((a) => a.date === iso && a.status !== 'Cancelled').length;
      const isFullyBooked = bookedCount >= 6 || (currentMonth === 9 && (d === 11 || d === 18)); // Sunday or special full days

      let status = 'available';
      if (isSunday) {
        status = 'closed';
      } else if (isFullyBooked) {
        status = 'fully-booked';
      }

      days.push({
        dayNum: d,
        isCurrentMonth: true,
        iso,
        status,
      });
    }

    // Next month filler days to complete rows (multiples of 7)
    const totalSlots = Math.ceil(days.length / 7) * 7;
    const remaining = totalSlots - days.length;
    for (let j = 1; j <= remaining; j++) {
      days.push({
        dayNum: j,
        isCurrentMonth: false,
        iso: '',
        status: 'disabled',
      });
    }

    return days;
  };

  const calendarDays = getMonthCalendarDays();

  // Dynamic Morning and Afternoon Time Slots
  const MORNING_SLOTS = ['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
  const AFTERNOON_SLOTS = ['01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

  const getSlotState = (time: string) => {
    // Check if slot is booked on selected date
    const isBooked = appointments.some(
      (a) => a.date === selectedDate && a.timeSlot === time && a.status !== 'Cancelled' && a.status !== 'Rejected'
    );
    if (isBooked) return 'booked';
    if (selectedSlot === time) return 'selected';
    return 'available';
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!patientName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!patientPhone.trim() || patientPhone.trim().length < 10) {
      setFormError('Please enter a valid Philippine mobile number for automated SMS reminders.');
      return;
    }

    const generatedRef = `TC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Omit<Appointment, 'id' | 'createdAt' | 'smsNotificationSent'> = {
      referenceNumber: generatedRef,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim() || 'patient@unified.ph',
      procedureType: selectedProcedureName,
      dentistId: 'clinic-faculty',
      dentistName: 'Dr. Maria Corazon Santos, DMD',
      date: selectedDate,
      timeSlot: selectedSlot,
      status: 'Pending',
      notes: notes.trim() || 'Online Patient Portal Self-Service Booking.',
      smsRecipient: patientPhone.trim(),
    };

    onBookAppointment(newBooking);

    const confirmed: Appointment = {
      ...newBooking,
      id: `apt-${Date.now()}`,
      smsNotificationSent: true,
      createdAt: '2026-10-06 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConfirmedBooking(confirmed);
    setShowConfirmModal(true);

    // Reset Form
    setPatientName('');
    setNotes('');
  };

  const handleDismissAlert = (id: string) => {
    setDismissedAptIds((prev) => [...prev, id]);
  };

  // Strict Single Active Notification Banner Filtered to Current Patient
  const currentPatientApts = appointments.filter((a) => {
    if (dismissedAptIds.includes(a.id)) return false;
    const nameMatch = a.patientName.toLowerCase().includes('eduardo') || a.patientName.toLowerCase().includes('ramos');
    const phoneMatch = a.patientPhone.replace(/\D/g, '').includes('9285517382');
    return nameMatch || phoneMatch;
  });

  const activeRejectedApt = currentPatientApts.find((a) => a.status === 'Rejected');
  const activeConfirmedApt = !activeRejectedApt 
    ? currentPatientApts.find((a) => a.status === 'Confirmed' || a.status === 'Checked-In' || a.status === 'In-Chair') 
    : undefined;
  const activePendingApt = (!activeRejectedApt && !activeConfirmedApt) 
    ? currentPatientApts.find((a) => a.status === 'Pending') 
    : undefined;

  return (
    <div className="space-y-6">
      
      {/* Strict Single Active Notification Banner (Priority: Rejected -> Confirmed -> Pending) */}
      {activeRejectedApt && (
        <div className="animate-in fade-in duration-200">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 sm:p-5 text-rose-950 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100/90 border border-rose-200 px-2 py-0.5 rounded">
                    Booking Update
                  </span>
                  <span className="text-xs font-mono text-rose-500 font-medium">Ref: {activeRejectedApt.referenceNumber}</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-rose-900 leading-relaxed">
                  <strong className="font-bold text-rose-950">Notice:</strong> Your requested appointment for{' '}
                  <span className="font-semibold text-rose-950">{activeRejectedApt.date} at {activeRejectedApt.timeSlot}</span> was not approved. Reason from Doctor:{' '}
                  <span className="font-bold text-rose-900 bg-rose-100/80 px-1.5 py-0.5 rounded border border-rose-200/60">
                    &ldquo;{activeRejectedApt.rejectionReason || 'Slot unavailable due to clinical schedule'}&rdquo;
                  </span>. Please select an alternative date.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleDismissAlert(activeRejectedApt.id)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-800 bg-white hover:bg-rose-100/60 border border-rose-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Acknowledge
              </button>
              <button
                type="button"
                onClick={() => handleDismissAlert(activeRejectedApt.id)}
                title="Close"
                className="p-1.5 text-rose-500 hover:text-rose-800 hover:bg-rose-200/50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!activeRejectedApt && activeConfirmedApt && (
        <div className="animate-in fade-in duration-200">
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 sm:p-5 text-teal-950 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-teal-100 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                <Bell className="w-5 h-5 text-teal-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/90 border border-teal-200 px-2 py-0.5 rounded">
                    Confirmed Appointment
                  </span>
                  <span className="text-xs font-mono text-teal-600 font-medium">Ref: {activeConfirmedApt.referenceNumber}</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-teal-900 leading-relaxed">
                  <strong className="font-bold text-teal-950">Reminder:</strong> You have an upcoming appointment scheduled for{' '}
                  <span className="font-semibold text-teal-950">{activeConfirmedApt.date} at {activeConfirmedApt.timeSlot}</span> with{' '}
                  <span className="font-semibold text-teal-950">{activeConfirmedApt.dentistName}</span> for{' '}
                  <span className="font-semibold text-teal-950">{activeConfirmedApt.procedureType}</span>. Please arrive 10 minutes early.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleDismissAlert(activeConfirmedApt.id)}
                className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-white hover:bg-teal-100/60 border border-teal-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => handleDismissAlert(activeConfirmedApt.id)}
                title="Close"
                className="p-1.5 text-teal-500 hover:text-teal-800 hover:bg-teal-200/50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!activeRejectedApt && !activeConfirmedApt && activePendingApt && (
        <div className="animate-in fade-in duration-200">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 text-amber-950 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                    Awaiting Dentist Review
                  </span>
                  <span className="text-xs font-mono text-amber-700 font-medium">Ref: {activePendingApt.referenceNumber}</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-amber-900 leading-relaxed">
                  Your booking request for <span className="font-semibold text-amber-950">{activePendingApt.date} at {activePendingApt.timeSlot}</span> ({activePendingApt.procedureType}) is awaiting dentist review and confirmation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleDismissAlert(activePendingApt.id)}
                className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => handleDismissAlert(activePendingApt.id)}
                title="Close"
                className="p-1.5 text-amber-500 hover:text-amber-800 hover:bg-amber-200/50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            <span>Self-Service Booking Portal · Unified Private Practice</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Reserve Your Dental Care Visit
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Pick your preferred date and time on our live clinic calendar. Our unified clinical faculty is automatically assigned to deliver streamlined, world-class dental care with instant SMS appointment notifications.
          </p>
        </div>

        {onNavigateToDashboard && (
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className="px-4 py-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-bold border border-slate-200 hover:border-teal-300 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 self-start sm:self-center cursor-pointer shadow-2xs"
          >
            <span>My Dashboard & Reminders</span>
            <ChevronRight className="w-4 h-4 text-teal-600" />
          </button>
        )}
      </div>

      {/* Main Booking Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Full Month Calendar + Dynamic Time Slots (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Full Month Interactive Calendar (7x5 / 7x6 Grid) */}
          <div id="booking-calendar-section" className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs scroll-mt-6">
            
            {/* Calendar Header with Prev/Next Controls */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                <p className="text-xs text-slate-500">Select any active date</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header (Sunday to Saturday) */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-[11px] font-bold uppercase tracking-wider text-slate-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* 7x5 or 7x6 Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, idx) => {
                if (!day.isCurrentMonth) {
                  return (
                    <div
                      key={idx}
                      className="h-12 flex items-center justify-center text-xs text-slate-300 bg-slate-50/40 rounded-lg select-none"
                    >
                      {day.dayNum}
                    </div>
                  );
                }

                const isSelected = selectedDate === day.iso;
                const isAvailable = day.status === 'available';
                const isFullyBooked = day.status === 'fully-booked';
                const isClosed = day.status === 'closed';

                return (
                  <button
                    type="button"
                    key={idx}
                    disabled={!isAvailable}
                    onClick={() => {
                      if (isAvailable) setSelectedDate(day.iso);
                    }}
                    className={`h-12 rounded-lg border flex flex-col items-center justify-center transition-all relative ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white font-bold shadow-xs ring-1 ring-teal-600'
                        : isAvailable
                        ? 'border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/50 text-slate-800'
                        : isFullyBooked
                        ? 'border-slate-100 bg-slate-100/70 text-slate-400 cursor-not-allowed'
                        : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-xs font-mono tabular-nums leading-none">
                      {day.dayNum}
                    </span>

                    {/* Small Status Indicator */}
                    <span className="text-[9px] mt-1 uppercase font-medium leading-none">
                      {isSelected 
                        ? 'Picked' 
                        : isAvailable 
                        ? 'Open' 
                        : isFullyBooked 
                        ? 'Full' 
                        : 'Closed'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-white border border-slate-300"></span> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-teal-600"></span> Selected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-100"></span> Fully Booked / Closed
                </span>
              </div>
              <span className="font-mono text-slate-700 font-semibold">
                Selected: {selectedDate}
              </span>
            </div>

          </div>

          {/* Dynamic Time Slots Grid (Morning & Afternoon) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Available Chair Time Slots</h3>
                <p className="text-xs text-slate-500">For {selectedDate}</p>
              </div>
              <span className="text-xs font-mono text-teal-800 bg-teal-50 px-2 py-1 rounded">
                Slot: {selectedSlot}
              </span>
            </div>

            {/* Morning Sessions */}
            <div>
              <span className="text-xs font-semibold text-slate-600 block uppercase tracking-wider mb-2">
                Morning Sessions (8:30 AM – 11:30 AM)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MORNING_SLOTS.map((slot) => {
                  const state = getSlotState(slot);
                  const isSelected = selectedSlot === slot && state !== 'booked';
                  const isBooked = state === 'booked';

                  return (
                    <button
                      type="button"
                      key={slot}
                      disabled={isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-lg border text-xs text-center transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white font-bold shadow-xs'
                          : isBooked
                          ? 'border-slate-200 bg-slate-100 text-slate-400 line-through cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/40 text-slate-800'
                      }`}
                    >
                      <div className="font-mono tabular-nums">{slot}</div>
                      <div className="text-[10px] mt-0.5">
                        {isSelected ? 'Selected' : isBooked ? 'Booked' : 'Available'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Afternoon Sessions */}
            <div>
              <span className="text-xs font-semibold text-slate-600 block uppercase tracking-wider mb-2">
                Afternoon Sessions (1:00 PM – 4:30 PM)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AFTERNOON_SLOTS.map((slot) => {
                  const state = getSlotState(slot);
                  const isSelected = selectedSlot === slot && state !== 'booked';
                  const isBooked = state === 'booked';

                  return (
                    <button
                      type="button"
                      key={slot}
                      disabled={isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-lg border text-xs text-center transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white font-bold shadow-xs'
                          : isBooked
                          ? 'border-slate-200 bg-slate-100 text-slate-400 line-through cursor-not-allowed'
                          : 'border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50/40 text-slate-800'
                      }`}
                    >
                      <div className="font-mono tabular-nums">{slot}</div>
                      <div className="text-[10px] mt-0.5">
                        {isSelected ? 'Selected' : isBooked ? 'Booked' : 'Available'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Streamlined Booking Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-6">
          
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Patient Details & Procedure</h3>
              <p className="text-xs text-slate-500">Automated SMS reminder will be dispatched to this mobile.</p>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Dental Procedure Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Dental Procedure *
              </label>
              <select
                value={selectedProcedureName}
                onChange={(e) => setSelectedProcedureName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                {procedures.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} — ₱{p.standardFee.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Patient Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Corazon Bautista"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Philippine Mobile Number (SMS Reminders) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="+63 917 123 4567"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Format: +63 9xx xxx xxxx</span>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.ph"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            {/* Clinical Concern / Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Dental Concerns / Medical Notes
              </label>
              <textarea
                rows={2}
                placeholder="Tooth sensitivity, bleeding gums, pain when chewing..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 resize-none"
              />
            </div>

            {/* Summary Ticket Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Appointment Date:</span>
                <span className="font-mono font-bold text-slate-900">{selectedDate}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Time Slot:</span>
                <span className="font-mono font-bold text-teal-800">{selectedSlot}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Doctor Assignment:</span>
                <span className="text-slate-800 font-medium">Automatic Unified Faculty</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200 text-sm">
                <span>Procedure Fee:</span>
                <span className="font-mono text-teal-700">
                  ₱{procedures.find((p) => p.name === selectedProcedureName)?.standardFee.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-teal-700/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Appointment & Trigger SMS</span>
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              By confirming, you agree to receive automated Philippine SMS alerts from TeethCare Clinic.
            </p>

          </form>

          {/* Clinic Trust Badges */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>PRC Licensed Practice</span>
            </span>
            <span>·</span>
            <span>GCash / Maya Cashless</span>
            <span>·</span>
            <span>Makati & BGC</span>
          </div>

        </div>

      </div>

      {/* Confirmation Dialog / Modal */}
      {showConfirmModal && confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="bg-teal-600 px-6 py-5 text-white">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-teal-100" />
                <h3 className="text-base font-bold">Booking Request Submitted!</h3>
              </div>
              <p className="text-xs text-teal-100">
                Your request is now in queue for dentist review and calendar confirmation.
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase">Reference ID</span>
                  <span className="text-sm font-mono font-bold text-teal-900">{confirmedBooking.referenceNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block uppercase">Requested Slot</span>
                  <span className="font-mono font-bold text-slate-900">{confirmedBooking.date} @ {confirmedBooking.timeSlot}</span>
                </div>
              </div>

              {/* Status Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Status: Pending Dentist Verification</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Our dentist will review your requested slot. Once approved, the calendar slot will lock and an automated SMS confirmation will be sent to your mobile phone.
                </p>
              </div>

              {/* Automated SMS Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-slate-700">
                <div className="flex items-center gap-2 font-bold mb-1 text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  <span>Philippine Mobile SMS Contact Logged</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[11px] text-slate-700 mt-2">
                  <p className="text-slate-400 text-[10px] mb-1">
                    Registered Mobile: {confirmedBooking.patientPhone}
                  </p>
                  &ldquo;TeethCare: Hello {confirmedBooking.patientName}! We received your request ({confirmedBooking.referenceNumber}) for {confirmedBooking.date} at {confirmedBooking.timeSlot}. Awaiting dentist review.&rdquo;
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Close & View Request Status
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
