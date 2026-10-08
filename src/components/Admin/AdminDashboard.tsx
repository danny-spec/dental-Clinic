import React, { useState } from 'react';
import { 
  AdminTab, 
  Dentist, 
  DentalProcedure, 
  Appointment, 
  Patient, 
  InventoryItem, 
  Invoice 
} from '../../types/dental';
import { OverviewTab } from './OverviewTab';
import { AppointmentsTab } from './AppointmentsTab';
import { PatientRecordsTab } from './PatientRecordsTab';
import { OdontogramTab } from './OdontogramTab';
import { InventoryTab } from './InventoryTab';
import { BillingTab } from './BillingTab';

interface AdminDashboardProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  dentists: Dentist[];
  procedures: DentalProcedure[];
  appointments: Appointment[];
  patients: Patient[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'smsNotificationSent'>) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  onAddPatient: (patient: Patient) => void;
  onRestockItem: (id: string, quantityToAdd: number, lotNumber?: string) => void;
  onDeductItem: (id: string, quantityToDeduct: number) => void;
  onAddInventoryItem: (item: InventoryItem) => void;
  onCreateInvoice: (invoice: Invoice) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice['paymentStatus']) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentTab,
  onTabChange,
  dentists,
  procedures,
  appointments,
  patients,
  inventory,
  invoices,
  onAddAppointment,
  onUpdateAppointmentStatus,
  onAddPatient,
  onRestockItem,
  onDeductItem,
  onAddInventoryItem,
  onCreateInvoice,
  onUpdateInvoiceStatus,
}) => {
  // Selected patient to view in odontogram
  const [selectedPatientForChart, setSelectedPatientForChart] = useState<string>(
    patients[0]?.id || ''
  );

  // Selected patient to create invoice for
  const [targetPatientForInvoice, setTargetPatientForInvoice] = useState<Patient | null>(null);

  const handleOpenChartForPatient = (patientId: string) => {
    setSelectedPatientForChart(patientId);
    onTabChange('odontogram');
  };

  const handleCreateInvoiceForPatient = (patient: Patient) => {
    setTargetPatientForInvoice(patient);
    onTabChange('billing');
  };

  const handleUpdatePatientHistoryNotes = (patientId: string, notes: string) => {
    const pt = patients.find((p) => p.id === patientId);
    if (pt) {
      pt.notes = notes;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {currentTab === 'overview' && (
        <OverviewTab
          appointments={appointments}
          patients={patients}
          inventory={inventory}
          invoices={invoices}
          onNavigateTab={onTabChange}
          onSelectPatientForChart={handleOpenChartForPatient}
          onUpdateAppointmentStatus={onUpdateAppointmentStatus}
          onCreateInvoiceForPatient={handleCreateInvoiceForPatient}
        />
      )}

      {currentTab === 'appointments' && (
        <AppointmentsTab
          appointments={appointments}
          dentists={dentists}
          procedures={procedures}
          onAddAppointment={onAddAppointment}
          onUpdateStatus={onUpdateAppointmentStatus}
        />
      )}

      {currentTab === 'patients' && (
        <PatientRecordsTab
          patients={patients}
          onAddPatient={onAddPatient}
          onOpenOdontogram={handleOpenChartForPatient}
          onCreateInvoice={handleCreateInvoiceForPatient}
        />
      )}

      {currentTab === 'odontogram' && (
        <OdontogramTab
          patients={patients}
          selectedPatientId={selectedPatientForChart}
          onUpdatePatientHistory={handleUpdatePatientHistoryNotes}
        />
      )}

      {currentTab === 'inventory' && (
        <InventoryTab
          inventory={inventory}
          onRestockItem={onRestockItem}
          onDeductItem={onDeductItem}
          onAddItem={onAddInventoryItem}
        />
      )}

      {currentTab === 'billing' && (
        <BillingTab
          invoices={invoices}
          patients={patients}
          procedures={procedures}
          onCreateInvoice={onCreateInvoice}
          onUpdateInvoiceStatus={onUpdateInvoiceStatus}
          initialPatientForInvoice={targetPatientForInvoice}
        />
      )}
    </div>
  );
};
