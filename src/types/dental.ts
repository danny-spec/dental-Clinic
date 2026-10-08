export type RoleMode = 'patient' | 'staff';

export type AdminTab = 'overview' | 'appointments' | 'patients' | 'odontogram' | 'inventory' | 'billing';

export interface Dentist {
  id: string;
  name: string;
  title: string;
  specialty: string;
  prcLicense: string;
  avatar: string;
  availableDays: string[];
}

export interface DentalProcedure {
  id: string;
  name: string;
  category: 'Diagnostic' | 'Preventive' | 'Restorative' | 'Surgical' | 'Orthodontics' | 'Endodontics' | 'Cosmetic';
  standardFee: number; // in PHP
  durationMinutes: number;
  description: string;
}

export interface Appointment {
  id: string;
  referenceNumber: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  procedureType: string;
  dentistId: string;
  dentistName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00 AM"
  status: 'Pending' | 'Confirmed' | 'Checked-In' | 'In-Chair' | 'Completed' | 'Cancelled' | 'Rejected';
  notes?: string;
  rejectionReason?: string;
  smsNotificationSent: boolean;
  smsRecipient?: string;
  createdAt: string;
}

export interface VisitRecord {
  id: string;
  date: string;
  dentistName: string;
  procedures: string[];
  diagnosis: string;
  clinicalNotes: string;
  prescriptions?: string[];
  amountPaid: number;
}

export interface Patient {
  id: string; // e.g. "TC-PT-1041"
  fullName: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bloodType: string;
  medicalConditions: string[]; // e.g. ["Hypertension", "Penicillin Allergy"]
  allergies: string[];
  lastVisitDate: string;
  nextScheduledDate?: string;
  visitHistory: VisitRecord[];
  notes: string;
}

export type ToothSurface = 'mesial' | 'distal' | 'occlusal' | 'buccal' | 'lingual' | 'root' | 'crown';

export type ToothCondition = 
  | 'sound' 
  | 'caries' 
  | 'composite' 
  | 'amalgam' 
  | 'extraction_indicated' 
  | 'missing' 
  | 'root_canal' 
  | 'crown_bridge'
  | 'impacted';

export interface ToothData {
  toothNumber: number; // 1-32 (Universal) or FDI 11-48
  fdiNumber: number;
  deciduousNumber?: string; // For pediatric
  name: string;
  generalCondition: ToothCondition;
  surfaces: {
    mesial: ToothCondition;
    distal: ToothCondition;
    occlusal: ToothCondition;
    buccal: ToothCondition;
    lingual: ToothCondition;
    root: ToothCondition;
  };
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Anesthetics' | 'Infection Control' | 'Restorative' | 'Consumables' | 'Endodontics' | 'Orthodontics' | 'Hygiene';
  stockOnHand: number;
  unit: string; // "Carpules", "Boxes", "Syringes", "Packs", "Bottles"
  reorderThreshold: number;
  costPerUnit: number; // PHP
  supplier: string;
  lotNumber?: string;
  expiryDate?: string;
  lastRestocked: string;
  status: 'In Stock' | 'Low Stock' | 'Depleted';
}

export type PaymentMethod = 'GCash' | 'Maya' | 'Bank Transfer' | 'Credit/Debit Card' | 'Cash';

export interface InvoiceLineItem {
  procedureId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "TC-INV-2026-0812"
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  dentistName: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discountType?: 'None' | 'Senior Citizen (20%)' | 'PWD (20%)' | 'Special Promo';
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string; // GCash / Maya / Card terminal ref
  paymentStatus: 'Settled' | 'Pending' | 'Partial';
  notes?: string;
}
