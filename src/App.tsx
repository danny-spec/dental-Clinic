/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Appointment, 
  Patient, 
  InventoryItem, 
  Invoice 
} from './types/dental';
import { 
  INITIAL_DENTISTS, 
  DENTAL_PROCEDURES, 
  INITIAL_APPOINTMENTS, 
  INITIAL_PATIENTS, 
  INITIAL_INVENTORY, 
  INITIAL_INVOICES 
} from './data/mockData';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { OverviewTab } from './components/Admin/OverviewTab';
import { DoctorAdminPanel } from './components/Doctor3D/DoctorAdminPanel';
import { StreamlinedPatientPortal } from './components/PatientPortal/StreamlinedPatientPortal';
import { PatientDashboard } from './components/PatientPortal/PatientDashboard';
import { PatientRecordsTab } from './components/Admin/PatientRecordsTab';
import { InventoryTab } from './components/Admin/InventoryTab';
import { BillingTab } from './components/Admin/BillingTab';

export default function App() {
  // Navigation & Sidebar State
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Clinic Operational State
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

  // Handlers
  const handleBookAppointment = (
    bookingData: Omit<Appointment, 'id' | 'createdAt' | 'smsNotificationSent'>
  ) => {
    const newApt: Appointment = {
      ...bookingData,
      status: bookingData.status || 'Pending',
      id: `apt-${Date.now()}`,
      smsNotificationSent: true,
      createdAt: '2026-10-06 ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAppointments((prev) => [newApt, ...prev]);
  };

  const handleUpdateAppointmentStatus = (
    id: string, 
    status: Appointment['status'],
    rejectionReason?: string
  ) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status, ...(rejectionReason ? { rejectionReason } : {}) } : apt))
    );
  };

  const handleAcceptAppointment = (id: string) => {
    handleUpdateAppointmentStatus(id, 'Confirmed');
  };

  const handleRejectAppointment = (id: string, reason: string) => {
    handleUpdateAppointmentStatus(id, 'Rejected', reason);
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
  };

  const handleRestockItem = (id: string, quantityToAdd: number, lotNumber?: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newStock = item.stockOnHand + quantityToAdd;
        return {
          ...item,
          stockOnHand: newStock,
          lotNumber: lotNumber || item.lotNumber,
          lastRestocked: '2026-10-06',
          status: newStock > item.reorderThreshold ? 'In Stock' : 'Low Stock',
        };
      })
    );
  };

  const handleDeductItem = (id: string, quantityToDeduct: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newStock = Math.max(0, item.stockOnHand - quantityToDeduct);
        return {
          ...item,
          stockOnHand: newStock,
          status: newStock <= 0 ? 'Depleted' : newStock <= item.reorderThreshold ? 'Low Stock' : 'In Stock',
        };
      })
    );
  };

  const handleAddInventoryItem = (newItem: InventoryItem) => {
    setInventory((prev) => [newItem, ...prev]);
  };

  const handleCreateInvoice = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const handleUpdateInvoiceStatus = (id: string, status: Invoice['paymentStatus']) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, paymentStatus: status } : inv))
    );
  };

  const handleSaveClinicalRecord = (patientId: string, notes: string, diagnosis: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          notes,
          visitHistory: [
            {
              id: `vh-${Date.now()}`,
              date: '2026-10-06',
              dentistName: 'Dr. Maria Corazon Santos, DMD',
              procedures: ['Chairside Evaluation & 3D Odontogram'],
              diagnosis,
              clinicalNotes: notes,
              amountPaid: 1500,
            },
            ...p.visitHistory,
          ],
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      
      {/* 1. Left-Side Modern Collapsible Sidebar (Top bar removed completely) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Content Area (Dynamically adjusts margin based on sidebar width) */}
      <div
        className={`flex-1 transition-all duration-300 min-h-screen flex flex-col ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64 sm:ml-72'
        }`}
      >
        
        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {/* Tab 1: Clinical Overview (Staff Dashboard) */}
          {activeTab === 'overview' && (
            <OverviewTab
              appointments={appointments}
              patients={patients}
              inventory={inventory}
              invoices={invoices}
              onNavigateTab={(tab) => {
                if (tab === 'odontogram') setActiveTab('doctor-admin');
                else if (tab === 'patients') setActiveTab('patients-dossier');
                else if (tab === 'inventory') setActiveTab('inventory');
                else if (tab === 'billing') setActiveTab('billing');
                else setActiveTab('overview');
              }}
              onSelectPatientForChart={() => setActiveTab('doctor-admin')}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onCreateInvoiceForPatient={() => setActiveTab('billing')}
              onAcceptAppointment={handleAcceptAppointment}
              onRejectAppointment={handleRejectAppointment}
            />
          )}

          {/* Tab 2: Doctor Admin Panel & 3D Interactive Odontogram */}
          {activeTab === 'doctor-admin' && (
            <DoctorAdminPanel
              patients={patients}
              appointments={appointments}
              onSaveClinicalRecord={handleSaveClinicalRecord}
            />
          )}

          {/* Tab 3: Patient Portal (Streamlined Booking) */}
          {activeTab === 'patient-portal' && (
            <StreamlinedPatientPortal
              procedures={DENTAL_PROCEDURES}
              appointments={appointments}
              onBookAppointment={handleBookAppointment}
              onNavigateToDashboard={() => setActiveTab('patient-dashboard')}
            />
          )}

          {/* Tab 3.5: Patient Dashboard (Summary of Appointment History & Reminders) */}
          {activeTab === 'patient-dashboard' && (
            <PatientDashboard
              patient={patients[1] || patients[0]}
              appointments={appointments}
              invoices={invoices}
              procedures={DENTAL_PROCEDURES}
              onNavigateToBooking={() => setActiveTab('patient-portal')}
            />
          )}

          {/* Tab 4: Patients Dossier (Medical Records) */}
          {activeTab === 'patients-dossier' && (
            <PatientRecordsTab
              patients={patients}
              onAddPatient={handleAddPatient}
              onOpenOdontogram={() => setActiveTab('doctor-admin')}
              onCreateInvoice={() => setActiveTab('billing')}
            />
          )}

          {/* Tab 5: Inventory & Consumables */}
          {activeTab === 'inventory' && (
            <InventoryTab
              inventory={inventory}
              onRestockItem={handleRestockItem}
              onDeductItem={handleDeductItem}
              onAddItem={handleAddInventoryItem}
            />
          )}

          {/* Tab 6: Cashless Billing & Analytics */}
          {activeTab === 'billing' && (
            <BillingTab
              invoices={invoices}
              patients={patients}
              procedures={DENTAL_PROCEDURES}
              onCreateInvoice={handleCreateInvoice}
              onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            />
          )}

        </main>

        {/* Clean Clinic Footer */}
        <footer className="border-t border-slate-200 bg-white/70 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">TeethCare Dental Clinic Management</span>
            <span>·</span>
            <span>Makati & BGC Practices</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>RA 10173 Compliant</span>
            <span>·</span>
            <span>PRC License Accredited</span>
          </div>
        </footer>

      </div>

    </div>
  );
}
