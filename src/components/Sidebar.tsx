import React from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  CalendarCheck, 
  Users, 
  Package, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  UserCheck
} from 'lucide-react';

export type ActiveTab = 
  | 'overview' 
  | 'doctor-admin' 
  | 'patient-portal' 
  | 'patient-dashboard'
  | 'patients-dossier' 
  | 'inventory' 
  | 'billing';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface MenuItem {
  id: ActiveTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const menuItems: MenuItem[] = [
    {
      id: 'overview',
      label: 'Clinical Overview',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'doctor-admin',
      label: 'Doctor Admin Panel & 3D Chart',
      shortLabel: '3D Doctor',
      icon: Stethoscope,
      badge: '3D',
    },
    {
      id: 'patient-portal',
      label: 'Patient Portal (Booking)',
      shortLabel: 'Booking',
      icon: CalendarCheck,
    },
    {
      id: 'patient-dashboard',
      label: 'Patient Dashboard & Reminders',
      shortLabel: 'Dashboard',
      icon: UserCheck,
      badge: 'Portal',
    },
    {
      id: 'patients-dossier',
      label: 'Patients Dossier (Records)',
      shortLabel: 'Patients',
      icon: Users,
    },
    {
      id: 'inventory',
      label: 'Inventory & Consumables',
      shortLabel: 'Inventory',
      icon: Package,
    },
    {
      id: 'billing',
      label: 'Cashless Billing & Analytics',
      shortLabel: 'Billing',
      icon: CreditCard,
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between select-none ${
        isCollapsed ? 'w-20' : 'w-64 sm:w-72'
      }`}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-teal-700/20">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.5 2 6 4.5 6 8c0 3.2 1.2 5.5 2.1 8.2.8 2.3 1.9 5.8 3.9 5.8s3.1-3.5 3.9-5.8c.9-2.7 2.1-5 2.1-8.2 0-3.5-2.5-6-6-6zm0 2.2c2.4 0 3.8 1.8 3.8 4.2 0 2.5-1 4.5-1.9 7.1-.6 1.8-1.3 4.1-1.9 4.4-.6-.3-1.3-2.6-1.9-4.4-.9-2.6-1.9-4.6-1.9-7.1 0-2.4 1.4-4.2 3.8-4.2z" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden animate-in fade-in duration-200">
                <div className="font-bold text-base text-slate-900 tracking-tight leading-none">
                  TeethCare
                </div>
                <div className="text-[10px] text-teal-700 font-medium tracking-tight mt-1 truncate">
                  Dental Practice OS
                </div>
              </div>
            )}
          </div>

          {/* Collapse / Expand Toggle Button */}
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  
                  {!isCollapsed && (
                    <span className="flex-1 truncate tracking-tight">
                      {item.label}
                    </span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-teal-800 text-white' : 'bg-teal-50 text-teal-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Floating Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 z-50 transition-opacity">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Clinic Status & Profile */}
      <div className="p-3 border-t border-slate-100">
        {!isCollapsed ? (
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                Clinic Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Makati Suite 402 · Operatory 1 Active
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Clinic Live"></span>
          </div>
        )}
      </div>
    </aside>
  );
};
