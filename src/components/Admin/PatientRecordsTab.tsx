import React, { useState } from 'react';
import { Patient, VisitRecord } from '../../types/dental';
import { 
  Search, 
  Plus, 
  User, 
  Phone, 
  Mail, 
  AlertTriangle, 
  Activity, 
  FileText, 
  Calendar, 
  ChevronRight, 
  X,
  CreditCard,
  MapPin,
  Heart
} from 'lucide-react';

interface PatientRecordsTabProps {
  patients: Patient[];
  onAddPatient: (patient: Patient) => void;
  onOpenOdontogram: (patientId: string) => void;
  onCreateInvoice: (patient: Patient) => void;
}

export const PatientRecordsTab: React.FC<PatientRecordsTabProps> = ({
  patients,
  onAddPatient,
  onOpenOdontogram,
  onCreateInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [selectedPatientForDrawer, setSelectedPatientForDrawer] = useState<Patient | null>(null);

  // New Patient Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newFullName, setNewFullName] = useState<string>('');
  const [newAge, setNewAge] = useState<number>(30);
  const [newGender, setNewGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [newPhone, setNewPhone] = useState<string>('+63 9');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('Makati City, Metro Manila');
  const [newEmergencyName, setNewEmergencyName] = useState<string>('');
  const [newEmergencyPhone, setNewEmergencyPhone] = useState<string>('+63 9');
  const [newBloodType, setNewBloodType] = useState<string>('O+');
  const [newConditions, setNewConditions] = useState<string>('');
  const [newAllergies, setNewAllergies] = useState<string>('None reported');
  const [newNotes, setNewNotes] = useState<string>('');

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;

    const patientId = `TC-PT-${1040 + patients.length + 1}`;
    const conditionsArr = newConditions
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const allergiesArr = newAllergies
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const newPatient: Patient = {
      id: patientId,
      fullName: newFullName.trim(),
      age: Number(newAge),
      gender: newGender,
      phone: newPhone.trim(),
      email: newEmail.trim() || `${newFullName.toLowerCase().replace(/\s+/g, '.')}@patient.ph`,
      address: newAddress.trim(),
      emergencyContact: {
        name: newEmergencyName.trim() || 'Not specified',
        relationship: 'Family',
        phone: newEmergencyPhone.trim(),
      },
      bloodType: newBloodType,
      medicalConditions: conditionsArr.length > 0 ? conditionsArr : ['None reported'],
      allergies: allergiesArr.length > 0 ? allergiesArr : ['None reported'],
      lastVisitDate: '2026-10-06',
      notes: newNotes.trim() || 'New registration at TeethCare clinic.',
      visitHistory: [
        {
          id: `vh-${Date.now()}`,
          date: '2026-10-06',
          dentistName: 'Dr. Maria Corazon Santos, DMD',
          procedures: ['Initial Oral Examination & Panoramic Consultation'],
          diagnosis: 'General dentition assessment pending odontogram completion.',
          clinicalNotes: 'Initial medical and dental history recorded.',
          amountPaid: 800,
        },
      ],
    };

    onAddPatient(newPatient);
    setShowAddModal(false);
    setNewFullName('');
    setNewConditions('');
    setNewNotes('');
  };

  // Filter logic
  const filteredPatients = patients.filter((pt) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      pt.fullName.toLowerCase().includes(query) ||
      pt.id.toLowerCase().includes(query) ||
      pt.phone.includes(query) ||
      pt.allergies.some((a) => a.toLowerCase().includes(query)) ||
      pt.medicalConditions.some((c) => c.toLowerCase().includes(query));

    const matchesCondition =
      conditionFilter === 'all'
        ? true
        : pt.medicalConditions.some((c) => c.toLowerCase().includes(conditionFilter.toLowerCase())) ||
          pt.allergies.some((a) => a.toLowerCase().includes(conditionFilter.toLowerCase()));

    return matchesSearch && matchesCondition;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Centralized Patient Dental Records</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Searchable patient dossiers, medical risk pre-conditions, and past clinical treatment logs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Patient Dossier</span>
        </button>
      </div>

      {/* Search and Condition Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient Name, ID (e.g. TC-PT-1041), Mobile, or Allergy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">All Medical Conditions</option>
            <option value="hypertension">Hypertension</option>
            <option value="diabetes">Diabetes</option>
            <option value="penicillin">Penicillin Allergy</option>
            <option value="latex">Latex Sensitivity</option>
          </select>
        </div>
      </div>

      {/* Patient Dossiers Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-5 py-3">Patient ID</th>
                <th className="px-5 py-3">Full Name & Demographics</th>
                <th className="px-5 py-3">Contact Details</th>
                <th className="px-5 py-3">Medical Alerts / Allergies</th>
                <th className="px-5 py-3">Last Visit</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No patient records found matching query &ldquo;{searchQuery}&rdquo;.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pt) => {
                  const hasPenicillin = pt.allergies.some((a) => a.toLowerCase().includes('penicillin'));
                  const hasMedicalAlert = pt.medicalConditions.some(
                    (c) => c.toLowerCase().includes('hyper') || c.toLowerCase().includes('diabet')
                  );

                  return (
                    <tr key={pt.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* ID */}
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900 tabular-nums">
                        {pt.id}
                      </td>

                      {/* Name */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{pt.fullName}</div>
                        <div className="text-[11px] text-slate-500">
                          {pt.age} yrs · {pt.gender} · Blood: {pt.bloodType}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-slate-700 tabular-nums">{pt.phone}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{pt.address}</div>
                      </td>

                      {/* Medical Preconditions / Allergies */}
                      <td className="px-5 py-3.5">
                        <div className="space-y-1">
                          {pt.allergies.map((allergy, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              {allergy !== 'None reported' ? (
                                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                  <span>{allergy}</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400">No known allergies</span>
                              )}
                            </div>
                          ))}

                          {pt.medicalConditions.map((cond, idx) => (
                            <div key={idx} className="text-[11px] text-slate-600">
                              {cond !== 'None reported' && (
                                <span className="text-amber-800 font-medium">· {cond}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Last Visit */}
                      <td className="px-5 py-3.5 text-slate-600 font-mono tabular-nums">
                        {pt.lastVisitDate}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right space-x-1">
                        <button
                          onClick={() => setSelectedPatientForDrawer(pt)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors"
                          title="View Complete Clinical Dossier"
                        >
                          Dossier
                        </button>

                        <button
                          onClick={() => onOpenOdontogram(pt.id)}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded text-xs font-medium transition-colors"
                          title="Open Odontogram Dental Chart"
                        >
                          Chart
                        </button>

                        <button
                          onClick={() => onCreateInvoice(pt)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
                          title="Issue Dental Invoice"
                        >
                          Bill
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expandable History Drawer / Slide-Over */}
      {selectedPatientForDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div>
              <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-teal-300 font-bold">{selectedPatientForDrawer.id}</span>
                    <span className="text-slate-400">·</span>
                    <h3 className="text-base font-bold">{selectedPatientForDrawer.fullName}</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedPatientForDrawer.age} years old · {selectedPatientForDrawer.gender} · Blood Type: {selectedPatientForDrawer.bloodType}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedPatientForDrawer(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Patient Core Summary Body */}
              <div className="p-6 space-y-6">
                
                {/* Contact & Emergency Section */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2.5">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Contact & Emergency Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Mobile:</span>
                      <span className="font-mono tabular-nums font-semibold">{selectedPatientForDrawer.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Email:</span>
                      <span className="truncate block">{selectedPatientForDrawer.email}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block text-[11px]">Address:</span>
                      <span>{selectedPatientForDrawer.address}</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Emergency Contact:</span>
                      <span className="font-medium text-slate-800">
                        {selectedPatientForDrawer.emergencyContact.name} ({selectedPatientForDrawer.emergencyContact.relationship}) —{' '}
                        <span className="font-mono">{selectedPatientForDrawer.emergencyContact.phone}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medical Alerts & Preconditions Card */}
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900 uppercase tracking-wider text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Medical Pre-conditions & Allergies</span>
                  </div>
                  <div className="space-y-1 text-slate-800">
                    <div>
                      <span className="text-rose-700 font-semibold">Reported Allergies: </span>
                      <span>{selectedPatientForDrawer.allergies.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-amber-800 font-semibold">Systemic Conditions: </span>
                      <span>{selectedPatientForDrawer.medicalConditions.join(', ')}</span>
                    </div>
                    {selectedPatientForDrawer.notes && (
                      <div className="pt-1 text-slate-600 italic">
                        Special Notes: {selectedPatientForDrawer.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Past Visit Logs & Clinical Diagnoses */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      Past Visit Logs & Diagnoses ({selectedPatientForDrawer.visitHistory.length})
                    </h4>
                    <span className="text-xs text-slate-500">Chronological Record</span>
                  </div>

                  <div className="space-y-4">
                    {selectedPatientForDrawer.visitHistory.map((visit) => (
                      <div key={visit.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-xs space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-teal-800 tabular-nums">{visit.date}</span>
                          <span className="font-medium text-slate-600">{visit.dentistName}</span>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-900 block">Procedures:</span>
                          <ul className="list-disc list-inside text-slate-700 pl-1">
                            {visit.procedures.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-900 block">Diagnosis:</span>
                          <p className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                            {visit.diagnosis}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-900 block">Clinical Remarks:</span>
                          <p className="text-slate-600">{visit.clinicalNotes}</p>
                        </div>

                        {visit.prescriptions && visit.prescriptions.length > 0 && (
                          <div className="pt-2 border-t border-slate-100">
                            <span className="font-semibold text-slate-900 block">Rx / Medications:</span>
                            <span className="font-mono text-teal-900 text-[11px]">
                              {visit.prescriptions.join('; ')}
                            </span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                          <span>Amount Billed:</span>
                          <span className="font-mono font-bold text-slate-900">₱{visit.amountPaid.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
              <button
                onClick={() => {
                  onOpenOdontogram(selectedPatientForDrawer.id);
                  setSelectedPatientForDrawer(null);
                }}
                className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Activity className="w-4 h-4" />
                <span>Open Odontogram Chart</span>
              </button>

              <button
                onClick={() => {
                  onCreateInvoice(selectedPatientForDrawer);
                  setSelectedPatientForDrawer(null);
                }}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Create Invoice</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add New Patient Dossier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold">New Patient Clinical Registration</h3>
                <p className="text-[11px] text-slate-400">TeethCare Patient Dossier</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreatePatient} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Antonio Luis Santos"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Age</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Philippine Mobile *</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full font-mono border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Blood Type</label>
                  <select
                    value={newBloodType}
                    onChange={(e) => setNewBloodType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Maria Santos (Spouse)"
                    value={newEmergencyName}
                    onChange={(e) => setNewEmergencyName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Emergency Mobile Number</label>
                  <input
                    type="text"
                    value={newEmergencyPhone}
                    onChange={(e) => setNewEmergencyPhone(e.target.value)}
                    className="w-full font-mono border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    Known Drug Allergies (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Aspirin, Sulfa drugs"
                    value={newAllergies}
                    onChange={(e) => setNewAllergies(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    Medical Pre-conditions (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hypertension, Diabetes, Asthma"
                    value={newConditions}
                    onChange={(e) => setNewConditions(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Clinical Observations</label>
                  <textarea
                    rows={2}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Initial remarks, dental anxiety, preferred appointment days..."
                    className="w-full border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 resize-none"
                  />
                </div>
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
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
