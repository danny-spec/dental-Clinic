import React, { useState } from 'react';
import { Appointment, Dentist, DentalProcedure } from '../../types/dental';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  Phone, 
  Mail, 
  AlertCircle, 
  ChevronRight, 
  Search,
  Sparkles,
  MapPin,
  Award,
  HeartHandshake
} from 'lucide-react';

interface PatientPortalProps {
  dentists: Dentist[];
  procedures: DentalProcedure[];
  appointments: Appointment[];
  onBookAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'smsNotificationSent'>) => void;
  activeSection?: 'booking' | 'dentists' | 'procedures' | 'lookup';
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  dentists,
  procedures,
  appointments,
  onBookAppointment,
  activeSection = 'booking',
}) => {
  // Booking Form State
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-07');
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00 AM');
  const [selectedDentistId, setSelectedDentistId] = useState<string>(dentists[0]?.id || '');
  const [selectedProcedureName, setSelectedProcedureName] = useState<string>(procedures[0]?.name || '');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('+63 9');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Live Confirmation Modal State
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string>('');

  // Booking Lookup State
  const [lookupQuery, setLookupQuery] = useState<string>('');
  const [lookupResult, setLookupResult] = useState<Appointment | null>(null);
  const [lookupSearched, setLookupSearched] = useState<boolean>(false);

  // Time Slots Definition
  const ALL_SLOTS = [
    { time: '08:30 AM', status: 'available' },
    { time: '09:00 AM', status: 'booked' },
    { time: '09:30 AM', status: 'available' },
    { time: '10:00 AM', status: 'available' },
    { time: '10:30 AM', status: 'available' },
    { time: '11:00 AM', status: 'available' },
    { time: '11:30 AM', status: 'available' },
    { time: '01:00 PM', status: 'available' },
    { time: '01:30 PM', status: 'available' },
    { time: '02:00 PM', status: 'booked' },
    { time: '02:30 PM', status: 'available' },
    { time: '03:00 PM', status: 'available' },
    { time: '03:30 PM', status: 'booked' },
    { time: '04:00 PM', status: 'available' },
    { time: '04:30 PM', status: 'available' },
    { time: '05:00 PM', status: 'closed' },
  ];

  // Helper to determine slot state for chosen date & dentist
  const getSlotStatus = (time: string) => {
    // Check if slot is already booked in our appointments data
    const isBooked = appointments.some(
      (apt) => apt.date === selectedDate && apt.timeSlot === time && apt.dentistId === selectedDentistId && apt.status !== 'Cancelled'
    );
    if (isBooked) return 'booked';

    const defaultSlot = ALL_SLOTS.find((s) => s.time === time);
    return defaultSlot?.status || 'available';
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (!patientName.trim()) {
      setBookingError('Please enter your full name.');
      return;
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 10) {
      setBookingError('Please enter a valid Philippine mobile number (e.g. +63 917 123 4567).');
      return;
    }

    const dentist = dentists.find((d) => d.id === selectedDentistId) || dentists[0];
    const generatedRef = `TC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Omit<Appointment, 'id' | 'createdAt' | 'smsNotificationSent'> = {
      referenceNumber: generatedRef,
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientEmail: patientEmail.trim() || 'unspecified@patient.ph',
      procedureType: selectedProcedureName,
      dentistId: dentist.id,
      dentistName: dentist.name,
      date: selectedDate,
      timeSlot: selectedSlot,
      status: 'Confirmed',
      notes: notes.trim() || 'Self-service online booking via TeethCare portal.',
      smsRecipient: patientPhone.trim(),
    };

    onBookAppointment(newBooking);

    // Prepare confirmed modal display
    const confirmed: Appointment = {
      ...newBooking,
      id: `apt-${Date.now()}`,
      smsNotificationSent: true,
      createdAt: new Date().toISOString(),
    };
    setConfirmedBooking(confirmed);
    setShowConfirmModal(true);

    // Reset inputs
    setPatientName('');
    setNotes('');
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupSearched(true);
    const cleaned = lookupQuery.trim().toLowerCase();
    if (!cleaned) {
      setLookupResult(null);
      return;
    }

    const found = appointments.find(
      (a) =>
        a.referenceNumber.toLowerCase() === cleaned ||
        a.patientPhone.replace(/\s+/g, '').includes(cleaned.replace(/\s+/g, '')) ||
        a.patientName.toLowerCase().includes(cleaned)
    );
    setLookupResult(found || null);
  };

  // Next 7 days generator for friendly date picker
  const getUpcomingDays = () => {
    const days = [];
    const base = new Date(2026, 9, 7); // Oct 7, 2026
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      days.push({ iso, weekday, dayNum });
    }
    return days;
  };

  const availableDays = getUpcomingDays();

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-slate-50 border-b border-slate-200 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Tagline kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              <span>Digitize care · Simplify operations · Improve access</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Gentle, World-Class Dental Care in Metro Manila
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Experience transparent, digital dental clinic appointments with board-certified oral surgeons and orthodontists. Book in under 60 seconds with instant Philippine SMS confirmations and cashless payments via GCash & Maya.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-xs">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>PRC Licensed Specialists</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-xs">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Makati & BGC Clinics</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-3 py-1.5 rounded-lg shadow-xs">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Instant SMS & GCash/Maya</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Real-Time Online Booking Module */}
        <section id="booking-section" className="scroll-mt-20">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Real-Time Dental Appointment Booking
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select your preferred dental specialist, service, and live available chair slot.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-teal-600"></span> Available
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-300"></span> Booked
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-200"></span> Closed
                </span>
              </div>
            </div>

            {/* Booking Form Grid */}
            <form onSubmit={handleBookingSubmit} className="p-6">
              
              {bookingError && (
                <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{bookingError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Date & Slot Selection (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Step 1: Select Preferred Dentist */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2.5">
                      1. Select Attending Dentist
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {dentists.map((d) => {
                        const isSelected = selectedDentistId === d.id;
                        return (
                          <button
                            type="button"
                            key={d.id}
                            onClick={() => setSelectedDentistId(d.id)}
                            className={`p-3 text-left rounded-lg border transition-all ${
                              isSelected
                                ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {d.avatar}
                              </div>
                              <span className="text-[11px] font-mono text-slate-500 truncate">{d.prcLicense}</span>
                            </div>
                            <div className="text-xs font-semibold text-slate-900 leading-snug line-clamp-1">{d.name}</div>
                            <div className="text-[11px] text-teal-700 font-medium truncate mt-0.5">{d.specialty}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Date Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                        2. Choose Appointment Date
                      </label>
                      <span className="text-xs text-slate-500">October 2026</span>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                      {availableDays.map((day) => {
                        const isSelected = selectedDate === day.iso;
                        return (
                          <button
                            type="button"
                            key={day.iso}
                            onClick={() => setSelectedDate(day.iso)}
                            className={`p-2.5 text-center rounded-lg border transition-all ${
                              isSelected
                                ? 'border-teal-600 bg-teal-600 text-white shadow-xs font-semibold'
                                : 'border-slate-200 bg-white hover:border-teal-300 text-slate-700'
                            }`}
                          >
                            <div className={`text-[10px] uppercase font-medium ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                              {day.weekday}
                            </div>
                            <div className="text-xs sm:text-sm font-bold mt-0.5 tabular-nums">
                              {day.dayNum}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Interactive Time Slots */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2.5">
                      3. Select Clinic Time Slot
                    </label>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {ALL_SLOTS.map((slot) => {
                        const status = getSlotStatus(slot.time);
                        const isSelected = selectedSlot === slot.time && status === 'available';
                        const isAvailable = status === 'available';

                        return (
                          <button
                            type="button"
                            key={slot.time}
                            disabled={!isAvailable}
                            onClick={() => {
                              if (isAvailable) setSelectedSlot(slot.time);
                            }}
                            className={`px-2.5 py-2 rounded-lg border text-xs font-medium text-center transition-all ${
                              isSelected
                                ? 'border-teal-600 bg-teal-600 text-white shadow-xs font-semibold ring-1 ring-teal-600'
                                : isAvailable
                                ? 'border-slate-200 bg-white text-slate-800 hover:border-teal-400 hover:bg-teal-50/40'
                                : status === 'booked'
                                ? 'border-slate-200 bg-slate-100/80 text-slate-400 cursor-not-allowed line-through'
                                : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <div className="font-mono tabular-nums">{slot.time}</div>
                            <div className="text-[10px] mt-0.5">
                              {isSelected ? 'Selected' : isAvailable ? 'Available' : status === 'booked' ? 'Booked' : 'Closed'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Right Column: Procedure & Patient Details (5 cols) */}
                <div className="lg:col-span-5 bg-slate-50/70 p-5 rounded-xl border border-slate-200/80 space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">Patient Information & Details</h3>
                    <p className="text-xs text-slate-500 mt-0.5">We will send your SMS booking pass to this number.</p>
                  </div>

                  {/* Procedure Type Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Consultation / Dental Procedure
                    </label>
                    <select
                      value={selectedProcedureName}
                      onChange={(e) => setSelectedProcedureName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                      {procedures.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} — ₱{p.standardFee.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Patient Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Patient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Maria Teresa Cruz"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Philippine Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="+63 917 123 4567"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-mono tabular-nums text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">Format: +63 9xx xxx xxxx (Globe / Smart / DITO)</span>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        placeholder="patient@example.com"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  {/* Notes / Concern */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Chief Complaint / Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Sensitivity when drinking cold water, bleeding gums..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 resize-none"
                    />
                  </div>

                  {/* Booking Summary Box */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Date & Time:</span>
                      <span className="font-semibold text-slate-900 font-mono tabular-nums">
                        {selectedDate} at {selectedSlot}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Estimated Fee:</span>
                      <span className="font-bold text-teal-700 font-mono tabular-nums">
                        ₱{procedures.find((p) => p.name === selectedProcedureName)?.standardFee.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[11px]">
                      <span>Payment Method:</span>
                      <span className="text-slate-800">Cashless (GCash/Maya) or Cash at clinic</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-teal-700/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Confirm Dental Appointment</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-slate-500 text-center">
                    Automated SMS dispatch will immediately notify your Philippine mobile number.
                  </p>

                </div>

              </div>
            </form>

          </div>
        </section>

        {/* Check Existing Booking Lookup Section */}
        <section id="lookup-section" className="mt-12 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="max-w-2xl">
            <h2 className="text-base font-bold text-slate-900">Check Your Appointment Status</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your TeethCare Reference ID (e.g. TC-2026-8941) or Philippine phone number to review your booking details.
            </p>

            <form onSubmit={handleLookup} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. TC-2026-8941 or 09178421928"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                Search Booking
              </button>
            </form>

            {lookupSearched && (
              <div className="mt-4">
                {lookupResult ? (
                  <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-mono font-bold text-teal-900">{lookupResult.referenceNumber}</div>
                      <span className="text-xs font-medium text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                        Status: {lookupResult.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Patient:</span>
                        <span className="font-semibold">{lookupResult.patientName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Dentist:</span>
                        <span className="font-semibold">{lookupResult.dentistName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Date & Time:</span>
                        <span className="font-mono tabular-nums">{lookupResult.date} at {lookupResult.timeSlot}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Procedure:</span>
                        <span>{lookupResult.procedureType}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <span>No appointment found matching &ldquo;{lookupQuery}&rdquo;. Please verify your reference number.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Dentists & Specialists Catalog */}
        <section id="dentists-section" className="mt-12">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Our Dental Faculty & Specialists</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Philippine Professional Regulation Commission (PRC) accredited clinicians with advanced international credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dentists.map((d) => (
              <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {d.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{d.name}</h3>
                      <div className="text-xs text-teal-700 font-medium">{d.title}</div>
                      <div className="text-[11px] font-mono text-slate-500">{d.prcLicense}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 mb-4">
                    <span className="font-medium text-slate-800">Specialization:</span> {d.specialty}
                  </div>

                  <div className="text-[11px] text-slate-500 mb-4">
                    <span className="font-medium text-slate-700">Clinic Schedule:</span> {d.availableDays.join(', ')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDentistId(d.id);
                    document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2 px-3 border border-slate-200 hover:border-teal-600 hover:text-teal-700 text-xs font-semibold rounded-lg text-slate-700 transition-colors"
                >
                  Book with {d.name.split(',')[0]}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Procedures & Standard Dental Fees in PHP */}
        <section id="procedures-section" className="mt-12">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Dental Services & Fee Schedule (PHP)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent standard clinic pricing adhering to Philippine Dental Association benchmarks. Eligible for 20% Senior Citizen and PWD statutory discount.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="px-5 py-3">Dental Procedure</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Est. Duration</th>
                    <th className="px-5 py-3 text-right">Standard Fee (₱)</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {procedures.map((proc) => (
                    <tr key={proc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{proc.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{proc.description}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <span>{proc.category}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono tabular-nums">
                        {proc.durationMinutes} mins
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900 font-mono tabular-nums">
                        ₱{proc.standardFee.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProcedureName(proc.name);
                            document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-medium rounded text-xs transition-colors"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>

      {/* Live Confirmation Modal with Automated SMS Notice */}
      {showConfirmModal && confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-teal-600 px-6 py-5 text-white">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-teal-100" />
                <h3 className="text-base font-bold">Appointment Confirmed!</h3>
              </div>
              <p className="text-xs text-teal-100">
                Your chair reservation has been logged into TeethCare Clinic schedule.
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              
              {/* Reference Banner */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase block">Reference Number</span>
                  <span className="text-sm font-bold font-mono text-teal-900">{confirmedBooking.referenceNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 uppercase block">Status</span>
                  <span className="text-xs font-semibold text-teal-700">Confirmed (Live)</span>
                </div>
              </div>

              {/* Summary Details */}
              <div className="space-y-2 text-xs text-slate-700 border-b border-slate-100 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-semibold text-slate-900">{confirmedBooking.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Attending Dentist:</span>
                  <span className="font-semibold text-slate-900">{confirmedBooking.dentistName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Slot:</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {confirmedBooking.date} at {confirmedBooking.timeSlot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Procedure:</span>
                  <span className="text-slate-900">{confirmedBooking.procedureType}</span>
                </div>
              </div>

              {/* Automated Philippine SMS Notice Box */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Automated Philippine SMS Notification Notice</span>
                </div>
                <div className="text-xs text-emerald-800 font-mono bg-white p-2.5 rounded border border-emerald-100 mt-2">
                  <p className="text-[11px] text-slate-500 mb-1">
                    [Smart/Globe SMS Gateway: Sent to {confirmedBooking.patientPhone}]
                  </p>
                  &ldquo;TeethCare Clinic: Mabuhay {confirmedBooking.patientName}! Your dental appointment ({confirmedBooking.referenceNumber}) on {confirmedBooking.date} at {confirmedBooking.timeSlot} with {confirmedBooking.dentistName} is confirmed. Location: Unit 402 Makati Medical Plaza. Inquiries: (02) 8842-1900.&rdquo;
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Done & Back to Portal
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
