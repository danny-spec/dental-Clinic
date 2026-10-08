import React, { useState } from 'react';
import { Patient, Appointment } from '../../types/dental';
import { Odontogram3D, ToothCondition3D, ToothState3D } from './Odontogram3D';
import { 
  UserCheck, 
  Activity, 
  Save, 
  AlertTriangle, 
  FileText, 
  Stethoscope, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ShieldAlert,
  Calendar
} from 'lucide-react';

interface DoctorAdminPanelProps {
  patients: Patient[];
  appointments: Appointment[];
  onSaveClinicalRecord?: (patientId: string, notes: string, diagnosis: string) => void;
}

export const DoctorAdminPanel: React.FC<DoctorAdminPanelProps> = ({
  patients,
  appointments,
  onSaveClinicalRecord,
}) => {
  // Current seated patient
  const inChairApt = appointments.find((a) => a.status === 'In-Chair') || appointments[0];
  const matchedPt = patients.find((p) => p.fullName === inChairApt?.patientName) || patients[0];

  const [activePatientId, setActivePatientId] = useState<string>(matchedPt?.id || patients[0]?.id || '');
  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];

  // Clinical notes state
  const [diagnosis, setDiagnosis] = useState<string>(
    'Localized dental caries on tooth #14 occlusal surface. Mild subgingival calculus on lower anterior teeth.'
  );
  const [clinicalNotes, setClinicalNotes] = useState<string>(
    'Administered 1 carpule 2% Lidocaine with 1:100k Epinephrine. Caries excavated using round diamond bur #2. Composite restoration (Filtek Z350 Body A2) placed with Scotchbond Universal adhesive.'
  );

  const [selectedToothInfo, setSelectedToothInfo] = useState<ToothState3D | null>(null);
  const [savedAlert, setSavedAlert] = useState<boolean>(false);

  const handleSaveNotes = () => {
    if (onSaveClinicalRecord && activePatient) {
      onSaveClinicalRecord(activePatient.id, clinicalNotes, diagnosis);
    }
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3500);
  };

  const hasAllergy = activePatient?.allergies && activePatient.allergies.length > 0 && activePatient.allergies[0] !== 'None reported';

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            <span>Private Doctor Operatory Console · 3D Odontogram Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Doctor Admin & 3D Interactive Dental Charting
          </h2>
        </div>

        {/* Patient Switcher for Chair */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Select Seated Patient:</label>
          <select
            value={activePatientId}
            onChange={(e) => setActivePatientId(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Patient Active Session Indicator Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-teal-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE PATIENT IN-CHAIR (OPERATORY 1)
              </span>
              <span className="text-xs font-mono text-slate-400">{activePatient?.id}</span>
            </div>

            <h3 className="text-lg font-bold text-white mt-1">
              {activePatient?.fullName}
            </h3>

            <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3 mt-0.5">
              <span>{activePatient?.age} yrs old · {activePatient?.gender}</span>
              <span>·</span>
              <span>Blood: {activePatient?.bloodType}</span>
              <span>·</span>
              <span className="font-mono">{activePatient?.phone}</span>
            </div>
          </div>
        </div>

        {/* Medical Preconditions / Allergies Warning Alert in Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {hasAllergy ? (
            <div className="bg-rose-500/20 border border-rose-400/40 px-3.5 py-2 rounded-lg text-xs text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold block uppercase text-[10px] text-rose-300">Drug Allergy Alert:</span>
                <span>{activePatient.allergies.join(', ')}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-slate-300">
              No reported systemic allergies
            </div>
          )}

          <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-slate-300 font-mono">
            Last Visit: {activePatient?.lastVisitDate}
          </div>
        </div>

      </div>

      {savedAlert && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Clinical records and 3D chart observations saved successfully to {activePatient?.fullName}&apos;s dossier.</span>
        </div>
      )}

      {/* 2. Interactive 3D Odontogram Engine */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Interactive 3D Dental Arch & Tooth Map (WebGL / Three.js)
            </h3>
            <p className="text-xs text-slate-500">
              Rotate 360° to inspect lingual, buccal, and occlusal surfaces. Click any tooth to mark clinical status.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
            <Activity className="w-3.5 h-3.5" />
            <span>OrbitControls Enabled</span>
          </div>
        </div>

        {/* 3D Viewport Component */}
        <Odontogram3D
          onToothSelect={(t) => setSelectedToothInfo(t)}
          onToothConditionChange={(num, cond) => {
            // Log in diagnosis text dynamically
            setClinicalNotes((prev) => 
              `${prev}\n[Tooth #${num} marked as ${cond.toUpperCase()}]`
            );
          }}
        />
      </div>

      {/* 3. Clinical Notes & Diagnosis Area */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Clinical Diagnosis & Chairside Notes</h3>
            <p className="text-xs text-slate-500">Document treatment rendered, local anesthesia dosage, and post-op prescriptions.</p>
          </div>

          <button
            onClick={handleSaveNotes}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to Patient Dossier</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Primary Diagnosis
            </label>
            <textarea
              rows={3}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Irreversible pulpitis tooth #24; Class II dentinal caries tooth #14..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 resize-none font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Rendered Treatment & Clinical Remarks
            </label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="e.g. Lidocaine 2% carpules used, restorative materials, post-op instructions..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 resize-none font-sans"
            />
          </div>
        </div>

        {/* Treatment Checklist */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-800">Quick Clinical Checklist:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-teal-600 focus:ring-teal-500" />
              <span>Medical History Verified</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-teal-600 focus:ring-teal-500" />
              <span>Blood Pressure Logged</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-teal-600 focus:ring-teal-500" />
              <span>Post-op Care Explained</span>
            </label>
          </div>

          <div className="text-[11px] text-slate-400">
            Attending Clinician: Dr. Maria Corazon Santos, DMD (PRC #0054219)
          </div>
        </div>
      </div>

    </div>
  );
};
