import React, { useState } from 'react';
import { 
  ToothData, 
  ToothCondition, 
  ToothSurface, 
  Patient 
} from '../../types/dental';
import { 
  generateDefaultAdultTeeth, 
  generateDeciduousTeeth 
} from '../../data/mockData';
import { 
  Activity, 
  User, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  Sparkles, 
  FileCheck,
  AlertCircle,
  HelpCircle,
  Layers,
  Printer
} from 'lucide-react';

interface OdontogramTabProps {
  patients: Patient[];
  selectedPatientId?: string;
  onUpdatePatientHistory?: (patientId: string, notes: string) => void;
}

// Condition details & color codes
const TOOTH_CONDITIONS: {
  id: ToothCondition;
  label: string;
  color: string;
  badgeBg: string;
  textColor: string;
  description: string;
}[] = [
  { 
    id: 'sound', 
    label: 'Sound (Healthy)', 
    color: '#f8fafc', 
    badgeBg: 'bg-slate-100', 
    textColor: 'text-slate-700',
    description: 'Intact tooth structure without decay' 
  },
  { 
    id: 'caries', 
    label: 'Cavity (Caries)', 
    color: '#e11d48', 
    badgeBg: 'bg-rose-100', 
    textColor: 'text-rose-800',
    description: 'Active dental caries requiring restoration' 
  },
  { 
    id: 'composite', 
    label: 'Composite Filling', 
    color: '#0d9488', 
    badgeBg: 'bg-teal-100', 
    textColor: 'text-teal-800',
    description: 'Tooth-colored resin restoration present' 
  },
  { 
    id: 'amalgam', 
    label: 'Amalgam Filling', 
    color: '#475569', 
    badgeBg: 'bg-slate-200', 
    textColor: 'text-slate-800',
    description: 'Silver amalgam metallic restoration' 
  },
  { 
    id: 'extraction_indicated', 
    label: 'Extraction Indicated', 
    color: '#dc2626', 
    badgeBg: 'bg-red-100', 
    textColor: 'text-red-800',
    description: 'Non-restorable; surgical removal recommended' 
  },
  { 
    id: 'missing', 
    label: 'Missing Tooth', 
    color: '#cbd5e1', 
    badgeBg: 'bg-slate-100', 
    textColor: 'text-slate-400',
    description: 'Congenitally missing or previously extracted' 
  },
  { 
    id: 'root_canal', 
    label: 'Root Canal Treated', 
    color: '#7c3aed', 
    badgeBg: 'bg-purple-100', 
    textColor: 'text-purple-800',
    description: 'Endodontically treated with obturation' 
  },
  { 
    id: 'crown_bridge', 
    label: 'Crown / Porcelain', 
    color: '#d97706', 
    badgeBg: 'bg-amber-100', 
    textColor: 'text-amber-800',
    description: 'Prosthetic porcelain or zirconia full coverage' 
  },
];

export const OdontogramTab: React.FC<OdontogramTabProps> = ({
  patients,
  selectedPatientId: initialPatientId,
  onUpdatePatientHistory,
}) => {
  // Active Patient State
  const [activePatientId, setActivePatientId] = useState<string>(
    initialPatientId || patients[0]?.id || ''
  );

  // Dentition Type: Adult (32 teeth) vs Deciduous (20 teeth)
  const [dentitionType, setDentitionType] = useState<'adult' | 'deciduous'>('adult');

  // Numbering system: FDI Two-Digit vs Universal
  const [numberingSystem, setNumberingSystem] = useState<'FDI' | 'Universal'>('FDI');

  // Teeth Chart State
  const [adultTeeth, setAdultTeeth] = useState<ToothData[]>(generateDefaultAdultTeeth());
  const [deciduousTeeth, setDeciduousTeeth] = useState<ToothData[]>(generateDeciduousTeeth());

  // Active Tool Palette Condition
  const [activeCondition, setActiveCondition] = useState<ToothCondition>('caries');

  // Selected Tooth for detail inspector
  const [inspectedToothNum, setInspectedToothNum] = useState<number>(14);

  // Clinical Observations & Treatment Planning Notes
  const [clinicalNotes, setClinicalNotes] = useState<string>(
    'Patient presents with occlusal caries on tooth #14 (FDI 26). Tooth #38 impacted indicated for surgical extraction. Scaling completed.'
  );
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  // Current active teeth dataset
  const currentTeeth = dentitionType === 'adult' ? adultTeeth : deciduousTeeth;
  const currentPatient = patients.find((p) => p.id === activePatientId) || patients[0];

  const updateTeeth = (newTeeth: ToothData[]) => {
    if (dentitionType === 'adult') {
      setAdultTeeth(newTeeth);
    } else {
      setDeciduousTeeth(newTeeth);
    }
  };

  // Handler to paint an individual surface
  const handleSurfaceClick = (toothNumber: number, surface: ToothSurface, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = currentTeeth.map((tooth) => {
      if (tooth.toothNumber !== toothNumber) return tooth;

      if (surface === 'root') {
        return {
          ...tooth,
          surfaces: { ...tooth.surfaces, root: activeCondition },
        };
      }

      if (surface === 'crown') {
        return {
          ...tooth,
          generalCondition: activeCondition,
        };
      }

      const newSurfaces = {
        ...tooth.surfaces,
        [surface]: activeCondition,
      };

      const newCondition: ToothCondition = activeCondition === 'sound' ? 'sound' : activeCondition;

      return {
        ...tooth,
        generalCondition: newCondition,
        surfaces: newSurfaces,
      };
    });

    updateTeeth(updated);
    setInspectedToothNum(toothNumber);
  };

  // Handler to set condition for entire tooth
  const handleWholeToothCondition = (toothNumber: number, condition: ToothCondition) => {
    const updated = currentTeeth.map((tooth) => {
      if (tooth.toothNumber !== toothNumber) return tooth;

      const newSurfaces = { ...tooth.surfaces };
      if (condition === 'sound' || condition === 'missing' || condition === 'extraction_indicated' || condition === 'crown_bridge') {
        (Object.keys(newSurfaces) as ToothSurface[]).forEach((s) => {
          if (s !== 'root') newSurfaces[s as keyof typeof newSurfaces] = condition;
        });
      }

      return {
        ...tooth,
        generalCondition: condition,
        surfaces: newSurfaces,
      };
    });

    updateTeeth(updated);
    setInspectedToothNum(toothNumber);
  };

  const handleSaveChart = () => {
    if (onUpdatePatientHistory && currentPatient) {
      onUpdatePatientHistory(currentPatient.id, clinicalNotes);
    }
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3500);
  };

  const handleResetChart = () => {
    if (dentitionType === 'adult') {
      setAdultTeeth(generateDefaultAdultTeeth());
    } else {
      setDeciduousTeeth(generateDeciduousTeeth());
    }
  };

  // Split teeth into Upper (Maxilla) and Lower (Mandible) arches
  const upperTeeth = dentitionType === 'adult' 
    ? currentTeeth.slice(0, 16) // 1 to 16
    : currentTeeth.slice(0, 10); // A to J

  const lowerTeeth = dentitionType === 'adult'
    ? currentTeeth.slice(16, 32).reverse() // 32 down to 17 or organized
    : currentTeeth.slice(10, 20).reverse();

  // Inspected tooth data
  const inspectedTooth = currentTeeth.find((t) => t.toothNumber === inspectedToothNum) || currentTeeth[0];

  // Helper to color individual SVG tooth zone
  const getSurfaceColor = (cond: ToothCondition) => {
    switch (cond) {
      case 'caries': return '#e11d48'; // red-600
      case 'composite': return '#0d9488'; // teal-600
      case 'amalgam': return '#475569'; // slate-600
      case 'root_canal': return '#7c3aed'; // violet-600
      case 'crown_bridge': return '#d97706'; // amber-600
      case 'extraction_indicated': return '#dc2626';
      case 'missing': return '#94a3b8';
      default: return '#f8fafc'; // sound white
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <span>Clinical Odontogram Module</span>
            <span className="text-slate-300">·</span>
            <span>Electronic Dental Records</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Interactive Dental Odontogram & Charting
          </h2>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600 whitespace-nowrap">Patient:</label>
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

      {/* Toolbar: Adult/Pediatric toggle, FDI/Universal toggle, Save button */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Toggle Dentition */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
          <button
            onClick={() => {
              setDentitionType('adult');
              setInspectedToothNum(14);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              dentitionType === 'adult'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Permanent Dentition (32 Teeth)
          </button>
          <button
            onClick={() => {
              setDentitionType('deciduous');
              setInspectedToothNum(1);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              dentitionType === 'deciduous'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Deciduous / Primary (20 Teeth)
          </button>
        </div>

        {/* Numbering Format */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Notation:</span>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setNumberingSystem('FDI')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                numberingSystem === 'FDI'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600'
              }`}
              title="FDI Two-Digit World Dental Federation Notation"
            >
              FDI Two-Digit
            </button>
            <button
              onClick={() => setNumberingSystem('Universal')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                numberingSystem === 'Universal'
                  ? 'bg-white text-teal-800 shadow-xs font-semibold'
                  : 'text-slate-600'
              }`}
              title="Universal Numbering System (1-32 / A-T)"
            >
              Universal (1-32)
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChart}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs transition-colors"
            title="Reset to default initial chart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSaveChart}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Chart & Notes</span>
          </button>
        </div>

      </div>

      {savedNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Odontogram chart and clinical observations saved successfully to {currentPatient.fullName}&apos;s dossier.</span>
        </div>
      )}

      {/* Main Odontogram Workspace: Canvas (Left) + Legend & Inspector (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Odontogram Visual Map (8 cols) */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-8">
          
          {/* Instructions banner */}
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <span className="font-medium text-slate-700">
              Active Tool: <span className="font-bold text-teal-700 uppercase">{TOOTH_CONDITIONS.find(c => c.id === activeCondition)?.label}</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Click any tooth zone (B/M/O/D/L/Root) to stamp current tool
            </span>
          </div>

          {/* Upper Arch (Maxilla) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Maxillary Arch (Upper Jaw)
              </span>
              <span className="text-[11px] text-slate-400">
                Right Quadrant (1) — Midline — Left Quadrant (2)
              </span>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 min-w-[700px]">
                {upperTeeth.map((tooth) => {
                  const isInspected = inspectedToothNum === tooth.toothNumber;
                  const displayNum = numberingSystem === 'FDI' ? tooth.fdiNumber : (tooth.deciduousNumber || tooth.toothNumber);
                  const isMissing = tooth.generalCondition === 'missing';
                  const isExtract = tooth.generalCondition === 'extraction_indicated';

                  return (
                    <div
                      key={tooth.toothNumber}
                      onClick={() => setInspectedToothNum(tooth.toothNumber)}
                      className={`cursor-pointer flex flex-col items-center p-1.5 rounded-lg border transition-all ${
                        isInspected
                          ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-500'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50'
                      }`}
                    >
                      {/* Tooth Number */}
                      <span className="text-[11px] font-mono font-bold text-slate-800 tabular-nums mb-1">
                        {displayNum}
                      </span>

                      {/* Root indicator (top for maxillary) */}
                      <button
                        type="button"
                        onClick={(e) => handleSurfaceClick(tooth.toothNumber, 'root', e)}
                        className="w-3.5 h-3.5 rounded-t-sm mb-1 border border-slate-300 transition-colors"
                        style={{ backgroundColor: getSurfaceColor(tooth.surfaces.root) }}
                        title="Root / Apical Surface"
                      />

                      {/* Anatomic 5-Surface Interactive SVG Box */}
                      <div className="relative w-10 h-10 border border-slate-300 rounded bg-white shadow-xs">
                        {/* Buccal (Top) */}
                        <button
                          type="button"
                          onClick={(e) => handleSurfaceClick(tooth.toothNumber, 'buccal', e)}
                          className="absolute inset-x-2 top-0 h-2.5 transition-colors hover:opacity-80"
                          style={{ backgroundColor: getSurfaceColor(tooth.surfaces.buccal) }}
                          title="Buccal / Facial surface"
                        />

                        {/* Mesial (Left for Upper Right, Right for Upper Left) */}
                        <button
                          type="button"
                          onClick={(e) => handleSurfaceClick(tooth.toothNumber, 'mesial', e)}
                          className="absolute inset-y-2 left-0 w-2.5 transition-colors hover:opacity-80"
                          style={{ backgroundColor: getSurfaceColor(tooth.surfaces.mesial) }}
                          title="Mesial surface"
                        />

                        {/* Occlusal / Incisal (Center) */}
                        <button
                          type="button"
                          onClick={(e) => handleSurfaceClick(tooth.toothNumber, 'occlusal', e)}
                          className="absolute inset-2.5 transition-colors hover:opacity-80 border border-slate-200"
                          style={{ backgroundColor: getSurfaceColor(tooth.surfaces.occlusal) }}
                          title="Occlusal / Center surface"
                        />

                        {/* Distal */}
                        <button
                          type="button"
                          onClick={(e) => handleSurfaceClick(tooth.toothNumber, 'distal', e)}
                          className="absolute inset-y-2 right-0 w-2.5 transition-colors hover:opacity-80"
                          style={{ backgroundColor: getSurfaceColor(tooth.surfaces.distal) }}
                          title="Distal surface"
                        />

                        {/* Lingual (Bottom) */}
                        <button
                          type="button"
                          onClick={(e) => handleSurfaceClick(tooth.toothNumber, 'lingual', e)}
                          className="absolute inset-x-2 bottom-0 h-2.5 transition-colors hover:opacity-80"
                          style={{ backgroundColor: getSurfaceColor(tooth.surfaces.lingual) }}
                          title="Lingual / Palatal surface"
                        />

                        {/* Overlays for Missing or Extract */}
                        {isMissing && (
                          <div className="absolute inset-0 bg-slate-200/80 flex items-center justify-center pointer-events-none">
                            <span className="text-slate-600 font-bold text-xs">✕</span>
                          </div>
                        )}
                        {isExtract && (
                          <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center pointer-events-none">
                            <span className="text-rose-600 font-bold text-sm">⊘</span>
                          </div>
                        )}
                      </div>

                      {/* Condition Label */}
                      <span className="text-[9px] text-slate-500 mt-1 uppercase font-medium truncate max-w-[42px]">
                        {tooth.generalCondition !== 'sound' ? tooth.generalCondition.slice(0, 4) : 'OK'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Midline horizontal anatomical dividing line */}
          <div className="relative py-2">
            <div className="border-t-2 border-dashed border-slate-300"></div>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Occlusal Plane
            </span>
          </div>

          {/* Lower Arch (Mandible) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Mandibular Arch (Lower Jaw)
              </span>
              <span className="text-[11px] text-slate-400">
                Right Quadrant (4) — Midline — Left Quadrant (3)
              </span>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 min-w-[700px]">
                {lowerTeeth.map((tooth) => {
                  const isInspected = inspectedToothNum === tooth.toothNumber;
                  const displayNum = numberingSystem === 'FDI' ? tooth.fdiNumber : (tooth.deciduousNumber || tooth.toothNumber);
                  const isMissing = tooth.generalCondition === 'missing';
                  const isExtract = tooth.generalCondition === 'extraction_indicated';

                  return (
                    <div
                      key={tooth.toothNumber}
                      onClick={() => setInspectedToothNum(tooth.toothNumber)}
                      className={`cursor-pointer flex flex-col items-center p-1.5 rounded-lg border transition-all ${
                        isInspected
                          ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-500'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50'
                      }`}
                    >
                      {/* Condition Label */}
                      <span className="text-[9px] text-slate-500 mb-1 uppercase font-medium truncate max-w-[42px]">
                        {tooth.generalCondition !== 'sound' ? tooth.generalCondition.slice(0, 4) : 'OK'}
                      </span>

                      {/* Anatomic 5-Surface Box */}
                      <div className="relative w-10 h-10 border border-slate-300 rounded bg-white shadow-xs">
                        {/* Lingual (Top for mandibular) */}
                        <button
                          type="button"
                          onClick={(e) => handleSurfaceClick(tooth.toothNumber, 'lingual', e)}
                          className="absolute inset-x-2 top-0 h-2.5 transition-colors hover:opacity-80"
                          style={{ backgroundColor: getSurfaceColor(tooth.surfaces.lingual) }}
                          title="Lingual surface"
                        />

                        {/* Mesial */}
                        <button
                          type="button"
                          onClick={(e) => handleSurfaceClick(tooth.toothNumber, 'mesial', e)}
                          className="absolute inset-y-2 left-0 w-2.5 transition-colors hover:opacity-80"
                          style={{ backgroundColor: getSurfaceColor(tooth.surfaces.mesial) }}
                          title="Mesial surface"
                        />

                        {/* Occlusal (Center) */}
                        <button
                          type="button"
                          onClick={(e) => handleSurfaceClick(tooth.toothNumber, 'occlusal', e)}
                          className="absolute inset-2.5 transition-colors hover:opacity-80 border border-slate-200"
                          style={{ backgroundColor: getSurfaceColor(tooth.surfaces.occlusal) }}
                          title="Occlusal surface"
                        />

                        {/* Distal */}
                        <button
                          type="button"
                          onClick={(e) => handleSurfaceClick(tooth.toothNumber, 'distal', e)}
                          className="absolute inset-y-2 right-0 w-2.5 transition-colors hover:opacity-80"
                          style={{ backgroundColor: getSurfaceColor(tooth.surfaces.distal) }}
                          title="Distal surface"
                        />

                        {/* Buccal (Bottom for mandibular) */}
                        <button
                          type="button"
                          onClick={(e) => handleSurfaceClick(tooth.toothNumber, 'buccal', e)}
                          className="absolute inset-x-2 bottom-0 h-2.5 transition-colors hover:opacity-80"
                          style={{ backgroundColor: getSurfaceColor(tooth.surfaces.buccal) }}
                          title="Buccal / Facial surface"
                        />

                        {isMissing && (
                          <div className="absolute inset-0 bg-slate-200/80 flex items-center justify-center pointer-events-none">
                            <span className="text-slate-600 font-bold text-xs">✕</span>
                          </div>
                        )}
                        {isExtract && (
                          <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center pointer-events-none">
                            <span className="text-rose-600 font-bold text-sm">⊘</span>
                          </div>
                        )}
                      </div>

                      {/* Root indicator (bottom for mandibular) */}
                      <button
                        type="button"
                        onClick={(e) => handleSurfaceClick(tooth.toothNumber, 'root', e)}
                        className="w-3.5 h-3.5 rounded-b-sm mt-1 border border-slate-300 transition-colors"
                        style={{ backgroundColor: getSurfaceColor(tooth.surfaces.root) }}
                        title="Root / Apical Surface"
                      />

                      {/* Tooth Number */}
                      <span className="text-[11px] font-mono font-bold text-slate-800 tabular-nums mt-1">
                        {displayNum}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Notes Box for Observations & Treatment Planning */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              Clinical Observations & Treatment Planning Notes
            </label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Record periodontal probing depths, restorative recommendations, caries risk, or planned surgical procedures..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

        </div>

        {/* Right Column: Condition Palette & Inspected Tooth Detail (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Condition Selector Legend Palette */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Clinical Condition Palette
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Select a condition below, then tap any tooth surface or tooth to apply.
            </p>

            <div className="space-y-2">
              {TOOTH_CONDITIONS.map((cond) => {
                const isActive = activeCondition === cond.id;
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setActiveCondition(cond.id)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                      isActive
                        ? 'border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600 font-semibold text-slate-900'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded border border-slate-300 shrink-0 shadow-xs"
                        style={{ backgroundColor: cond.color }}
                      />
                      <span>{cond.label}</span>
                    </div>

                    {isActive && (
                      <span className="text-[10px] text-teal-700 uppercase font-bold tracking-wider">
                        Active Tool
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inspected Tooth Detail Panel */}
          {inspectedTooth && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-mono text-teal-700 font-bold block">
                  {numberingSystem === 'FDI' ? `FDI #${inspectedTooth.fdiNumber}` : `Tooth #${inspectedTooth.toothNumber}`}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{inspectedTooth.name}</h4>
              </div>

              {/* Surface conditions breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Occlusal (O):</span>
                  <span className="font-semibold capitalize text-slate-800">
                    {inspectedTooth.surfaces.occlusal.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Mesial (M):</span>
                  <span className="font-semibold capitalize text-slate-800">
                    {inspectedTooth.surfaces.mesial.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Distal (D):</span>
                  <span className="font-semibold capitalize text-slate-800">
                    {inspectedTooth.surfaces.distal.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Buccal / Facial (B):</span>
                  <span className="font-semibold capitalize text-slate-800">
                    {inspectedTooth.surfaces.buccal.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Lingual / Palatal (L):</span>
                  <span className="font-semibold capitalize text-slate-800">
                    {inspectedTooth.surfaces.lingual.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Root / Apical:</span>
                  <span className="font-semibold capitalize text-slate-800">
                    {inspectedTooth.surfaces.root.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Quick Actions for this tooth */}
              <div className="pt-2">
                <span className="text-[11px] font-medium text-slate-600 block mb-2">
                  Apply to Entire Tooth:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleWholeToothCondition(inspectedTooth.toothNumber, 'sound')}
                    className="p-1.5 border border-slate-200 rounded text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Mark Healthy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWholeToothCondition(inspectedTooth.toothNumber, 'extraction_indicated')}
                    className="p-1.5 border border-rose-200 bg-rose-50 text-rose-700 rounded hover:bg-rose-100 font-medium"
                  >
                    Extraction
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWholeToothCondition(inspectedTooth.toothNumber, 'missing')}
                    className="p-1.5 border border-slate-200 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 font-medium"
                  >
                    Mark Missing
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWholeToothCondition(inspectedTooth.toothNumber, 'crown_bridge')}
                    className="p-1.5 border border-amber-200 bg-amber-50 text-amber-800 rounded hover:bg-amber-100 font-medium"
                  >
                    Porcelain Crown
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
