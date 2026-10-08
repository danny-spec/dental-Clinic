import React from 'react';
import { RoleMode, AdminTab } from '../types/dental';
import { 
  Calendar, 
  Users, 
  Activity, 
  Package, 
  CreditCard, 
  LayoutDashboard, 
  UserCheck, 
  Stethoscope, 
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface NavbarProps {
  currentRole: RoleMode;
  onRoleChange: (role: RoleMode) => void;
  adminTab: AdminTab;
  onAdminTabChange: (tab: AdminTab) => void;
  onPatientNavClick: (section: 'booking' | 'dentists' | 'procedures' | 'lookup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  adminTab,
  onAdminTabChange,
  onPatientNavClick,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Single element brand wordmark */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onRoleChange('patient')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-700/20 group-hover:bg-teal-700 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C8.5 2 6 4.5 6 8c0 3.2 1.2 5.5 2.1 8.2.8 2.3 1.9 5.8 3.9 5.8s3.1-3.5 3.9-5.8c.9-2.7 2.1-5 2.1-8.2 0-3.5-2.5-6-6-6zm0 2.2c2.4 0 3.8 1.8 3.8 4.2 0 2.5-1 4.5-1.9 7.1-.6 1.8-1.3 4.1-1.9 4.4-.6-.3-1.3-2.6-1.9-4.4-.9-2.6-1.9-4.6-1.9-7.1 0-2.4 1.4-4.2 3.8-4.2z"/>
                </svg>
              </div>
              <div className="leading-tight">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  TeethCare
                </span>
                <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500 ml-2 tracking-normal">
                  Makati & BGC Dental Clinic
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (single line, functional) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {currentRole === 'patient' ? (
              <>
                <button
                  onClick={() => onPatientNavClick('booking')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-md transition-colors"
                >
                  Book Online
                </button>
                <button
                  onClick={() => onPatientNavClick('lookup')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-md transition-colors"
                >
                  Check My Booking
                </button>
                <button
                  onClick={() => onPatientNavClick('dentists')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-md transition-colors"
                >
                  Our Specialists
                </button>
                <button
                  onClick={() => onPatientNavClick('procedures')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-md transition-colors"
                >
                  Dental Fees (PHP)
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onAdminTabChange('overview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    adminTab === 'overview'
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => onAdminTabChange('appointments')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    adminTab === 'appointments'
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Appointments</span>
                </button>
                <button
                  onClick={() => onAdminTabChange('patients')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    adminTab === 'patients'
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Patients Dossier</span>
                </button>
                <button
                  onClick={() => onAdminTabChange('odontogram')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    adminTab === 'odontogram'
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Odontogram Charting</span>
                </button>
                <button
                  onClick={() => onAdminTabChange('inventory')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    adminTab === 'inventory'
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Inventory</span>
                </button>
                <button
                  onClick={() => onAdminTabChange('billing')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    adminTab === 'billing'
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Billing & Cashless</span>
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Interactive Role Switcher & Action */}
          <div className="flex items-center gap-3">
            {/* Role Switcher Segmented Control */}
            <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200/80 rounded-lg">
              <button
                onClick={() => onRoleChange('patient')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  currentRole === 'patient'
                    ? 'bg-white text-teal-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Patient Portal</span>
              </button>
              <button
                onClick={() => onRoleChange('staff')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  currentRole === 'staff'
                    ? 'bg-teal-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Clinic Admin</span>
              </button>
            </div>

            {/* Quick Call hotline for emergency */}
            <a
              href="tel:+63288421900"
              className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-teal-700 px-2 py-1.5 transition-colors"
              title="Makati Clinic: (02) 8842-1900"
            >
              <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-mono tabular-nums">(02) 8842-1900</span>
            </a>
          </div>

        </div>

        {/* Mobile secondary tab navigation row for staff when on mobile */}
        {currentRole === 'staff' && (
          <div className="flex md:hidden items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
            <button
              onClick={() => onAdminTabChange('overview')}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
                adminTab === 'overview' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onAdminTabChange('appointments')}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
                adminTab === 'appointments' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => onAdminTabChange('patients')}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
                adminTab === 'patients' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
              }`}
            >
              Patients
            </button>
            <button
              onClick={() => onAdminTabChange('odontogram')}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
                adminTab === 'odontogram' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
              }`}
            >
              Odontogram
            </button>
            <button
              onClick={() => onAdminTabChange('inventory')}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
                adminTab === 'inventory' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => onAdminTabChange('billing')}
              className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap ${
                adminTab === 'billing' ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600'
              }`}
            >
              Billing
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
