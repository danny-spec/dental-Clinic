import React, { useState } from 'react';
import { Appointment, Patient, DentalProcedure, Invoice } from '../../types/dental';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  User, 
  Sparkles, 
  Phone, 
  Mail, 
  FileText, 
  ChevronRight, 
  Activity, 
  Award, 
  Bell, 
  Stethoscope,
  MapPin,
  Search,
  ArrowRight,
  Smile,
  Shield,
  CreditCard,
  AlertTriangle,
  Receipt,
  Download,
  Printer,
  X,
  Check,
  Info,
  ExternalLink
} from 'lucide-react';

interface PatientDashboardProps {
  patient?: Patient;
  appointments: Appointment[];
  invoices?: Invoice[];
  procedures?: DentalProcedure[];
  onNavigateToBooking: () => void;
  onSelectProcedureForBooking?: (procedureName: string) => void;
}

interface DentalReminder {
  id: string;
  title: string;
  category: 'recall' | 'follow-up' | 'hygiene';
  categoryLabel: string;
  urgency: 'high' | 'medium' | 'routine';
  timelineText: string;
  description: string;
  targetMonth: string;
  dentistName: string;
  relatedProcedure?: string;
  clinicalNote?: string;
  highlightText?: string;
  statusBadge: string;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patient,
  appointments,
  invoices = [],
  procedures = [],
  onNavigateToBooking,
  onSelectProcedureForBooking,
}) => {
  // Navigation / Tab filter inside dashboard
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'appointments' | 'invoices'>('overview');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'upcoming' | 'completed' | 'pending' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive reminders state (completed or acknowledged)
  const [completedReminderIds, setCompletedReminderIds] = useState<string[]>([]);
  const [dismissedReminderIds, setDismissedReminderIds] = useState<string[]>([]);

  // Selected appointment for detail modal
  const [selectedAptForModal, setSelectedAptForModal] = useState<Appointment | null>(null);

  // Selected invoice for digital receipt modal
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<Invoice | null>(null);

  // Default patient info fallback if none provided
  const patientData: Partial<Patient> = patient || {
    id: 'TC-PT-1042',
    fullName: 'Eduardo Gabriel Ramos',
    age: 45,
    gender: 'Male',
    phone: '+63 928 551 7382',
    email: 'egramos@outlook.ph',
    address: '88 Valero St., Bel-Air Village, Makati City',
    bloodType: 'A+',
    medicalConditions: ['Hypertension (Stage 1 controlled)', 'Type 2 Diabetes'],
    allergies: ['No known drug allergies (NKDA)'],
    lastVisitDate: '2026-08-19',
    nextScheduledDate: '2026-10-06',
    notes: 'Restoration on tooth #14 completed. Regular checkups advised.',
  };

  // Filter appointments for this patient
  const patientAppointments = appointments.filter((apt) => {
    const pName = patientData.fullName?.toLowerCase().trim() || 'eduardo gabriel ramos';
    const pPhone = patientData.phone?.replace(/\D/g, '') || '639285517382';
    const pEmail = patientData.email?.toLowerCase().trim() || 'egramos@outlook.ph';

    const matchName = apt.patientName && (
      apt.patientName.toLowerCase().trim() === pName ||
      apt.patientName.toLowerCase().includes('ramos') ||
      apt.patientName.toLowerCase().includes('eduardo')
    );
    const matchPhone = apt.patientPhone && apt.patientPhone.replace(/\D/g, '').includes(pPhone.slice(-7));
    const matchEmail = apt.patientEmail && apt.patientEmail.toLowerCase().trim() === pEmail;

    return matchName || matchPhone || matchEmail;
  });

  // Filter invoices for this patient
  const patientInvoices = invoices.filter((inv) => {
    const pId = patientData.id || 'TC-PT-1042';
    const pName = patientData.fullName?.toLowerCase().trim() || 'eduardo gabriel ramos';
    return inv.patientId === pId || inv.patientName.toLowerCase().trim() === pName;
  });

  // Upcoming / active appointments
  const upcomingApts = patientAppointments.filter(
    (a) => a.status === 'Confirmed' || a.status === 'In-Chair' || a.status === 'Checked-In'
  );

  // Pending requests
  const pendingApts = patientAppointments.filter((a) => a.status === 'Pending');

  // Rejected requests
  const rejectedApts = patientAppointments.filter((a) => a.status === 'Rejected');

  // Next primary appointment
  const nextApt = upcomingApts[0] || pendingApts[0];

  // Completed visits count
  const completedCount = patientAppointments.filter((a) => a.status === 'Completed').length + 
    (patientData.visitHistory?.length || 2);

  // Filter history records based on user selection
  const filteredHistory = patientAppointments.filter((apt) => {
    if (historyFilter === 'upcoming') {
      return apt.status === 'Confirmed' || apt.status === 'Checked-In' || apt.status === 'In-Chair';
    }
    if (historyFilter === 'completed') {
      return apt.status === 'Completed';
    }
    if (historyFilter === 'pending') {
      return apt.status === 'Pending';
    }
    if (historyFilter === 'rejected') {
      return apt.status === 'Rejected';
    }
    return true;
  }).filter((apt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      apt.procedureType.toLowerCase().includes(q) ||
      apt.dentistName.toLowerCase().includes(q) ||
      apt.date.includes(q) ||
      apt.referenceNumber.toLowerCase().includes(q)
    );
  });

  // Clinical Reminders Data
  const INITIAL_REMINDERS: DentalReminder[] = [
    {
      id: 'rem-1',
      title: 'Routine Oral Prophylaxis & Deep Scaling',
      category: 'recall',
      categoryLabel: 'Preventive Recall',
      urgency: 'high',
      timelineText: 'Due in ~2 Weeks',
      description: 'Recommended every 6 months to remove subgingival calculus, prevent gingivitis, and maintain optimal periodontal attachment.',
      targetMonth: 'October 2026',
      dentistName: 'Dr. Maria Corazon Santos, DMD',
      relatedProcedure: 'Oral Prophylaxis & Scaling (Deep Cleaning)',
      highlightText: 'Last cleaning: April 2026 (6 months ago)',
      statusBadge: 'Preventive Recall Due',
    },
    {
      id: 'rem-2',
      title: 'Restoration Check — Tooth #14 (Upper Right 1st Molar)',
      category: 'follow-up',
      categoryLabel: 'Treatment Follow-Up',
      urgency: 'medium',
      timelineText: 'Post-Op Review',
      description: 'Follow-up clinical examination to verify composite filling marginal adaptation, bite equilibration, and cold sensitivity resolution.',
      targetMonth: 'October 2026',
      dentistName: 'Dr. Carmela Bautista-Tan, DMD',
      relatedProcedure: 'Composite Light-Cure Restoration (Tooth Filling)',
      clinicalNote: 'Light-Cure Composite (Occlusal/Mesial surfaces)',
      highlightText: 'Status: Healed & Asymptomatic',
      statusBadge: 'Post-Op Review',
    },
    {
      id: 'rem-3',
      title: 'Interdental Flossing & Nightly Fluoride Rinse',
      category: 'hygiene',
      categoryLabel: 'Daily Regimen',
      urgency: 'routine',
      timelineText: 'Daily At-Home Routine',
      description: 'Use waxed dental tape around posterior contact areas daily. Use 0.05% Sodium Fluoride mouthwash before bed to fortify tooth enamel.',
      targetMonth: 'Ongoing Daily Regimen',
      dentistName: 'Preventive Oral Health Faculty',
      clinicalNote: 'Prescribed 0.05% Sodium Fluoride rinse before bedtime',
      highlightText: 'Protects treated tooth #14 and preserves adjacent enamel',
      statusBadge: 'Active Habit',
    },
  ];

  const handleToggleReminderDone = (id: string) => {
    setCompletedReminderIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDismissReminder = (id: string) => {
    setDismissedReminderIds((prev) => [...prev, id]);
  };

  const activeReminders = INITIAL_REMINDERS.filter((r) => !dismissedReminderIds.includes(r.id));

  // Calendar sync helper (creates calendar link or downloads .ics file)
  const handleAddToCalendar = (apt: Appointment) => {
    const title = encodeURIComponent(`TeethCare Dental: ${apt.procedureType}`);
    const details = encodeURIComponent(
      `Appointment Ref: ${apt.referenceNumber}\nDentist: ${apt.dentistName}\nClinic: TeethCare Dental Clinic, Makati City\nNotes: ${apt.notes || 'Routine consultation'}`
    );
    const location = encodeURIComponent('TeethCare Dental Clinic, Valero St., Bel-Air, Makati City');
    
    // Parse date and time into rough ISO string
    const dateStr = apt.date.replace(/-/g, '');
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateStr}T090000Z/${dateStr}T100000Z`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER & PATIENT IDENTITY CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-teal-800/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Patient Avatar */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-teal-600/30 border border-teal-400/40 flex items-center justify-center text-teal-200 font-bold text-xl sm:text-2xl shadow-inner shrink-0">
              {patientData.fullName
                ? patientData.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join('')
                : 'PT'}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {patientData.fullName}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Dental Record
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {patientData.id}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                <span className="flex items-center gap-1 text-slate-300">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  {patientData.age} yrs · {patientData.gender} · Blood Type {patientData.bloodType}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-teal-400" />
                  <span className="font-mono">{patientData.phone}</span>
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-teal-400" />
                  <span>{patientData.email}</span>
                </span>
              </div>

              {patientData.address && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{patientData.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
            <button
              onClick={onNavigateToBooking}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. GRAPHICAL METRIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Next Appointment */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:border-teal-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Next Scheduled Visit
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            {nextApt ? (
              <div>
                <div className="text-lg font-bold text-slate-900 tracking-tight">
                  {nextApt.date}
                </div>
                <div className="text-xs font-medium text-teal-700 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{nextApt.timeSlot}</span>
                </div>
                <div className="mt-2 text-xs text-slate-600 truncate font-medium">
                  {nextApt.procedureType}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 truncate">
                  {nextApt.dentistName}
                </div>
                <span className={`inline-block mt-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  nextApt.status === 'Confirmed' ? 'bg-teal-100 text-teal-800' :
                  nextApt.status === 'In-Chair' ? 'bg-indigo-100 text-indigo-800' :
                  nextApt.status === 'Checked-In' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {nextApt.status}
                </span>
              </div>
            ) : (
              <div>
                <div className="text-sm font-semibold text-slate-700">No active visit scheduled</div>
                <p className="text-xs text-slate-400 mt-1">Book a slot on the clinic calendar</p>
                <button
                  onClick={onNavigateToBooking}
                  className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Select Date</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          {nextApt && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => handleAddToCalendar(nextApt)}
                className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 cursor-pointer text-[11px]"
              >
                <span>Add to Calendar</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={() => setSelectedAptForModal(nextApt)}
                className="text-slate-500 hover:text-slate-800 font-semibold text-[11px] cursor-pointer"
              >
                View Slip →
              </button>
            </div>
          )}
        </div>

        {/* Card 2: 6-Month Routine Cleaning Recall */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Preventive Recall Due
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-slate-900 tracking-tight">
              October 2026
            </div>
            <div className="text-xs text-emerald-700 font-semibold mt-0.5">
              Routine Oral Prophylaxis (Due)
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Last cleaning: <span className="font-medium text-slate-700">April 2026</span> (6 mos ago)
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-5/6 transition-all duration-500"></div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] font-medium text-emerald-700">5 of 6 mos elapsed</span>
            <button
              onClick={() => {
                if (onSelectProcedureForBooking) {
                  onSelectProcedureForBooking('Oral Prophylaxis & Scaling (Deep Cleaning)');
                }
                onNavigateToBooking();
              }}
              className="text-teal-700 hover:text-teal-900 font-bold text-[11px] cursor-pointer"
            >
              Book Now →
            </button>
          </div>
        </div>

        {/* Card 3: Oral Health Index / Care Stage */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Oral Health Score
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">92</span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Optimal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Tooth restoration #14 healed. Low caries vulnerability index.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="text-[11px] text-blue-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Gingival Health: Healthy</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Stage 1</span>
          </div>
        </div>

        {/* Card 4: Historical Visits & Invoices */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:border-purple-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Care Ledger & Receipts
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {completedCount}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Visits On File
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              All clinical records, treatments, and cashless e-receipts archived.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" />
              <span>E-Receipts Active</span>
            </div>
            <button
              onClick={() => setActiveSubTab('invoices')}
              className="text-purple-700 hover:text-purple-900 font-bold text-[11px] cursor-pointer"
            >
              View ({patientInvoices.length}) →
            </button>
          </div>
        </div>

      </div>

      {/* 3. UPCOMING DENTAL REMINDERS & PREVENTIVE DIRECTIVES (GRAPHICAL CARDS) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-teal-600" />
              <span>Upcoming Dental Reminders & Preventive Care Alerts</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized clinical reminders recommended by your attending dentist
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200/80 px-2.5 py-1 rounded-lg">
              {activeReminders.length} Active Directives
            </span>
            {completedReminderIds.length > 0 && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-1 rounded-lg flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>{completedReminderIds.length} Completed</span>
              </span>
            )}
          </div>
        </div>

        {activeReminders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeReminders.map((reminder) => {
              const isDone = completedReminderIds.includes(reminder.id);

              return (
                <div
                  key={reminder.id}
                  className={`bg-white rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group border ${
                    isDone 
                      ? 'border-emerald-200 bg-emerald-50/20' 
                      : reminder.category === 'recall'
                      ? 'border-teal-200 hover:border-teal-400'
                      : reminder.category === 'follow-up'
                      ? 'border-indigo-200 hover:border-indigo-400'
                      : 'border-amber-200 hover:border-amber-400'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                        reminder.category === 'recall'
                          ? 'bg-teal-100 text-teal-800 border-teal-200'
                          : reminder.category === 'follow-up'
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {reminder.categoryLabel}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-mono font-bold ${
                          reminder.category === 'recall'
                            ? 'text-teal-700'
                            : reminder.category === 'follow-up'
                            ? 'text-indigo-700'
                            : 'text-amber-700'
                        }`}>
                          {reminder.timelineText}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDismissReminder(reminder.id)}
                          title="Dismiss reminder"
                          className="text-slate-300 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-sm font-bold transition-colors ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-900 group-hover:text-teal-700'
                      }`}>
                        {reminder.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {reminder.description}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-2.5 text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target Period:</span>
                        <span className="font-semibold text-slate-800">{reminder.targetMonth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Attending:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[170px]">{reminder.dentistName}</span>
                      </div>
                      {reminder.highlightText && (
                        <div className="pt-1 mt-1 border-t border-slate-200/40 text-[11px] font-medium text-slate-700">
                          {reminder.highlightText}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    {reminder.category === 'recall' ? (
                      <button
                        onClick={() => {
                          if (onSelectProcedureForBooking && reminder.relatedProcedure) {
                            onSelectProcedureForBooking(reminder.relatedProcedure);
                          }
                          onNavigateToBooking();
                        }}
                        className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span>Schedule Cleaning Slot</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : reminder.category === 'follow-up' ? (
                      <button
                        onClick={onNavigateToBooking}
                        className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold border border-indigo-300 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Review with Doctor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="flex-1 text-[11px] font-medium text-amber-900 bg-amber-50 rounded-lg p-2 border border-amber-200/80 flex items-center gap-1.5">
                        <Smile className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate">Maintain daily oral hygiene regimen</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleReminderDone(reminder.id)}
                      title={isDone ? 'Mark as incomplete' : 'Mark as done'}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500 space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
            <div className="font-semibold text-slate-800">All Reminders Acknowledged</div>
            <p>You have reviewed all active dental health directives for this period.</p>
          </div>
        )}
      </div>

      {/* 4. TABS: APPOINTMENT HISTORY VS DIGITAL RECEIPTS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pt-2 pb-0">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'overview'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Appointment History & Records ({patientAppointments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('invoices')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'invoices'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Official E-Receipts & Billing ({patientInvoices.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: APPOINTMENT HISTORY */}
      {activeSubTab === 'overview' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span>Personal Appointment History & Clinical Records</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comprehensive log of all requested, confirmed, and completed visits
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search procedure, doctor, or ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    historyFilter === 'all'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({patientAppointments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('upcoming')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    historyFilter === 'upcoming'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upcoming ({upcomingApts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('pending')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    historyFilter === 'pending'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending ({pendingApts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('rejected')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    historyFilter === 'rejected'
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rejected ({rejectedApts.length})
                </button>
              </div>
            </div>
          </div>

          {/* List of Appointment Cards */}
          {filteredHistory.length > 0 ? (
            <div className="space-y-3">
              {filteredHistory.map((apt) => {
                const isConfirmed = apt.status === 'Confirmed';
                const isInChair = apt.status === 'In-Chair';
                const isCheckedIn = apt.status === 'Checked-In';
                const isPending = apt.status === 'Pending';
                const isRejected = apt.status === 'Rejected';
                const isCompleted = apt.status === 'Completed';

                return (
                  <div
                    key={apt.id}
                    className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Graphical Date Block */}
                      <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-slate-900 font-mono leading-none">
                          {new Date(apt.date).getDate()}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                          {apt.timeSlot.split(' ')[0]}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {apt.procedureType}
                          </h3>
                          <span className="font-mono text-xs text-slate-400">
                            Ref: {apt.referenceNumber}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                          <span className="flex items-center gap-1 font-medium text-teal-800">
                            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                            <span>{apt.dentistName}</span>
                          </span>
                          <span className="flex items-center gap-1 font-mono text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{apt.date} at {apt.timeSlot}</span>
                          </span>
                        </div>

                        {apt.notes && (
                          <p className="text-xs text-slate-500 italic mt-1 max-w-xl">
                            &ldquo;{apt.notes}&rdquo;
                          </p>
                        )}

                        {isRejected && apt.rejectionReason && (
                          <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                            <strong>Dentist's Feedback:</strong> &ldquo;{apt.rejectionReason}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          isConfirmed
                            ? 'bg-teal-100 text-teal-800 border border-teal-200'
                            : isInChair
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : isCheckedIn
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : isPending
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : isRejected
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isConfirmed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isPending && <Clock className="w-3.5 h-3.5" />}
                        {isRejected && <AlertCircle className="w-3.5 h-3.5" />}
                        {isCompleted && <Check className="w-3.5 h-3.5" />}
                        <span>{apt.status}</span>
                      </span>

                      <button
                        onClick={() => setSelectedAptForModal(apt)}
                        title="View Full Appointment Slip"
                        className="p-2 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">No appointments found matching filter</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try adjusting your filter selection or book a new appointment using the portal.
              </p>
              <button
                onClick={onNavigateToBooking}
                className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Book New Appointment
              </button>
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: OFFICIAL DIGITAL RECEIPTS */}
      {activeSubTab === 'invoices' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-600" />
                <span>Official Electronic Receipts & Statement of Account</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official BIR & PRC compliant electronic receipts for all dental treatments and diagnostic services
              </p>
            </div>
          </div>

          {patientInvoices.length > 0 ? (
            <div className="space-y-3">
              {patientInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {inv.date}
                      </span>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {inv.paymentStatus} via {inv.paymentMethod}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800">
                      Attending: {inv.dentistName}
                    </div>

                    <div className="text-xs text-slate-600">
                      Line Items:{' '}
                      <span className="font-medium">
                        {inv.lineItems.map((li) => `${li.description} (₱${li.total.toLocaleString()})`).join(', ')}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      Payment Ref: {inv.referenceNumber}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-medium">Total Settled</div>
                      <div className="text-lg font-mono font-bold text-teal-800">
                        ₱{inv.totalAmount.toLocaleString()}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedInvoiceForModal(inv)}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold border border-teal-200 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>View Receipt</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2 text-xs text-slate-500">
              <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-700">No settled electronic receipts on file</div>
              <p>Invoices will be recorded upon chairside treatment completion.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: APPOINTMENT DETAIL SLIP */}
      {selectedAptForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300">
                  TeethCare Dental Clinic · Appointment Slip
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedAptForModal.procedureType}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAptForModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Details */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block">Date & Time:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {selectedAptForModal.date}
                  </span>
                  <div className="text-teal-700 font-semibold">{selectedAptForModal.timeSlot}</div>
                </div>
                <div>
                  <span className="text-slate-400 block">Booking Reference:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {selectedAptForModal.referenceNumber}
                  </span>
                  <div className="font-semibold text-slate-600">{selectedAptForModal.status}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-semibold text-slate-900">{selectedAptForModal.patientName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="font-semibold text-slate-900 font-mono">{selectedAptForModal.patientPhone}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Attending Clinician:</span>
                  <span className="font-semibold text-teal-800">{selectedAptForModal.dentistName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Clinic Location:</span>
                  <span className="font-semibold text-slate-900">Valero St., Bel-Air, Makati City</span>
                </div>
              </div>

              {selectedAptForModal.notes && (
                <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-lg text-slate-700">
                  <strong className="text-teal-900 block mb-1">Appointment Notes:</strong>
                  <p>{selectedAptForModal.notes}</p>
                </div>
              )}

              {selectedAptForModal.rejectionReason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                  <strong className="text-rose-900 block mb-1">Doctor&apos;s Review Feedback:</strong>
                  <p>{selectedAptForModal.rejectionReason}</p>
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-500 leading-relaxed">
                ℹ️ Please arrive 10–15 minutes before your reserved time. If you have any medical symptoms or need to reschedule, call clinic support at <span className="font-mono text-slate-700">+63 928 551 7382</span>.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleAddToCalendar(selectedAptForModal)}
                className="px-3 py-2 text-teal-700 hover:text-teal-900 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Add to Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedAptForModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFICIAL DIGITAL RECEIPT */}
      {selectedInvoiceForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-teal-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300">
                  Official Electronic Receipt · Cashless Settlement
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {selectedInvoiceForModal.invoiceNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceForModal(null)}
                className="text-teal-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="text-center pb-3 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-900">TeethCare Dental Clinic Management</h4>
                <p className="text-slate-500 text-[11px]">Makati & BGC Practices · Republic Act 10173 & PRC Accredited</p>
                <p className="text-slate-400 font-mono text-[10px] mt-0.5">Date: {selectedInvoiceForModal.date}</p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Patient:</span>
                  <span className="font-semibold text-slate-900">{selectedInvoiceForModal.patientName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Attending Dentist:</span>
                  <span className="font-semibold text-slate-900">{selectedInvoiceForModal.dentistName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Settlement Method:</span>
                  <span className="font-semibold text-teal-800">{selectedInvoiceForModal.paymentMethod} ({selectedInvoiceForModal.paymentStatus})</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Transaction Reference:</span>
                  <span className="font-mono text-slate-700">{selectedInvoiceForModal.referenceNumber}</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Procedure</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoiceForModal.lineItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-slate-800">{item.description}</td>
                        <td className="p-2.5 text-center text-slate-500">{item.quantity}</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-slate-900">
                          ₱{item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">₱{selectedInvoiceForModal.subtotal.toLocaleString()}</span>
                </div>
                {selectedInvoiceForModal.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({selectedInvoiceForModal.discountType}):</span>
                    <span className="font-mono">-₱{selectedInvoiceForModal.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono text-teal-800">₱{selectedInvoiceForModal.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400 font-mono">
                Official Electronic Confirmation · Valid for Health Insurance Reimbursement
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedInvoiceForModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
