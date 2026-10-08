import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  RefreshCcw, 
  Layers, 
  Info,
  CheckCircle,
  Eye
} from 'lucide-react';

export type ToothCondition3D = 
  | 'sound' 
  | 'caries' 
  | 'filled' 
  | 'missing' 
  | 'extraction' 
  | 'crown';

export interface ToothState3D {
  number: number;
  fdi: number;
  name: string;
  arch: 'maxillary' | 'mandibular';
  condition: ToothCondition3D;
  notes?: string;
}

interface Odontogram3DProps {
  onToothSelect?: (tooth: ToothState3D) => void;
  onToothConditionChange?: (toothNumber: number, condition: ToothCondition3D) => void;
  initialConditions?: Record<number, ToothCondition3D>;
}

const CONDITION_COLORS: Record<ToothCondition3D, { color: number; hex: string; label: string }> = {
  sound: { color: 0xf8fafc, hex: '#f8fafc', label: 'Sound (Healthy)' },
  caries: { color: 0xe11d48, hex: '#e11d48', label: 'Cavity (Caries)' },
  filled: { color: 0x0d9488, hex: '#0d9488', label: 'Filled (Restored)' },
  missing: { color: 0x94a3b8, hex: '#94a3b8', label: 'Missing' },
  extraction: { color: 0xdc2626, hex: '#dc2626', label: 'Extraction Indicated' },
  crown: { color: 0xd97706, hex: '#d97706', label: 'Crown / Ceramic' },
};

export const Odontogram3D: React.FC<Odontogram3DProps> = ({
  onToothSelect,
  onToothConditionChange,
  initialConditions,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedTooth, setSelectedTooth] = useState<ToothState3D | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [archView, setArchView] = useState<'both' | 'upper' | 'lower'>('both');

  // Tooth states (1-32)
  const [teethData, setTeethData] = useState<Record<number, ToothState3D>>(() => {
    const data: Record<number, ToothState3D> = {};
    
    const universalNames: Record<number, { name: string; fdi: number; arch: 'maxillary' | 'mandibular' }> = {
      1: { name: 'Upper Right 3rd Molar (Wisdom)', fdi: 18, arch: 'maxillary' },
      2: { name: 'Upper Right 2nd Molar', fdi: 17, arch: 'maxillary' },
      3: { name: 'Upper Right 1st Molar', fdi: 16, arch: 'maxillary' },
      4: { name: 'Upper Right 2nd Premolar', fdi: 15, arch: 'maxillary' },
      5: { name: 'Upper Right 1st Premolar', fdi: 14, arch: 'maxillary' },
      6: { name: 'Upper Right Canine', fdi: 13, arch: 'maxillary' },
      7: { name: 'Upper Right Lateral Incisor', fdi: 12, arch: 'maxillary' },
      8: { name: 'Upper Right Central Incisor', fdi: 11, arch: 'maxillary' },
      9: { name: 'Upper Left Central Incisor', fdi: 21, arch: 'maxillary' },
      10: { name: 'Upper Left Lateral Incisor', fdi: 22, arch: 'maxillary' },
      11: { name: 'Upper Left Canine', fdi: 23, arch: 'maxillary' },
      12: { name: 'Upper Left 1st Premolar', fdi: 24, arch: 'maxillary' },
      13: { name: 'Upper Left 2nd Premolar', fdi: 25, arch: 'maxillary' },
      14: { name: 'Upper Left 1st Molar', fdi: 26, arch: 'maxillary' },
      15: { name: 'Upper Left 2nd Molar', fdi: 27, arch: 'maxillary' },
      16: { name: 'Upper Left 3rd Molar (Wisdom)', fdi: 28, arch: 'maxillary' },
      17: { name: 'Lower Left 3rd Molar (Wisdom)', fdi: 38, arch: 'mandibular' },
      18: { name: 'Lower Left 2nd Molar', fdi: 37, arch: 'mandibular' },
      19: { name: 'Lower Left 1st Molar', fdi: 36, arch: 'mandibular' },
      20: { name: 'Lower Left 2nd Premolar', fdi: 35, arch: 'mandibular' },
      21: { name: 'Lower Left 1st Premolar', fdi: 34, arch: 'mandibular' },
      22: { name: 'Lower Left Canine', fdi: 33, arch: 'mandibular' },
      23: { name: 'Lower Left Lateral Incisor', fdi: 32, arch: 'mandibular' },
      24: { name: 'Lower Left Central Incisor', fdi: 31, arch: 'mandibular' },
      25: { name: 'Lower Right Central Incisor', fdi: 41, arch: 'mandibular' },
      26: { name: 'Lower Right Lateral Incisor', fdi: 42, arch: 'mandibular' },
      27: { name: 'Lower Right Canine', fdi: 43, arch: 'mandibular' },
      28: { name: 'Lower Right 1st Premolar', fdi: 44, arch: 'mandibular' },
      29: { name: 'Lower Right 2nd Premolar', fdi: 45, arch: 'mandibular' },
      30: { name: 'Lower Right 1st Molar', fdi: 46, arch: 'mandibular' },
      31: { name: 'Lower Right 2nd Molar', fdi: 47, arch: 'mandibular' },
      32: { name: 'Lower Right 3rd Molar (Wisdom)', fdi: 48, arch: 'mandibular' },
    };

    for (let i = 1; i <= 32; i++) {
      let defaultCond: ToothCondition3D = 'sound';
      if (initialConditions && initialConditions[i]) {
        defaultCond = initialConditions[i];
      } else {
        if (i === 14) defaultCond = 'caries';
        if (i === 19) defaultCond = 'filled';
        if (i === 30) defaultCond = 'crown';
        if (i === 32) defaultCond = 'extraction';
        if (i === 1) defaultCond = 'missing';
      }

      data[i] = {
        number: i,
        fdi: universalNames[i]?.fdi || i,
        name: universalNames[i]?.name || `Tooth #${i}`,
        arch: universalNames[i]?.arch || 'maxillary',
        condition: defaultCond,
      };
    }
    return data;
  });

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const toothMeshesRef = useRef<Map<number, THREE.Mesh>>(new Map());
  const selectedMeshRef = useRef<THREE.Mesh | null>(null);

  // Setup Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf8fafc); // soft clinical slate

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 10, 20);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 35;
    controls.minDistance = 6;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting (Studio Three-Point clinical lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(10, 20, 15);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x99f6e4, 0.4); // soft teal fill
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(0, -15, 10);
    scene.add(rimLight);

    // Build Anatomic Dental Arches (Upper & Lower)
    const toothMeshes = new Map<number, THREE.Mesh>();
    toothMeshesRef.current = toothMeshes;

    // Helper to calculate parabolic arch positions
    // Maxillary (Upper): 16 teeth (1 to 16)
    // Mandibular (Lower): 16 teeth (32 to 17)
    const createToothMesh = (num: number, isUpper: boolean, tIndex: number) => {
      // Parabolic dental arch curve:
      // t ranges from -1 to 1 across 16 teeth
      const t = -1 + (tIndex / 15) * 2;
      const angle = (t * Math.PI) / 2.4;
      
      const radiusX = isUpper ? 6.2 : 5.8;
      const radiusZ = isUpper ? 7.2 : 6.8;

      const x = Math.sin(angle) * radiusX;
      const z = -Math.cos(angle) * radiusZ + (radiusZ * 0.4);
      const y = isUpper ? 1.6 : -1.6;

      // Create tooth anatomical geometry (molar vs premolar vs incisor)
      let geom: THREE.BufferGeometry;
      const isMolar = (num >= 1 && num <= 3) || (num >= 14 && num <= 19) || (num >= 30 && num <= 32);
      const isPremolar = (num >= 4 && num <= 5) || (num >= 12 && num <= 13) || (num >= 20 && num <= 21) || (num >= 28 && num <= 29);

      if (isMolar) {
        // Broad crown with root
        geom = new THREE.CylinderGeometry(0.72, 0.55, 1.1, 12);
      } else if (isPremolar) {
        geom = new THREE.CylinderGeometry(0.55, 0.45, 1.15, 10);
      } else {
        // Incisor / Canine: wedge shape
        geom = new THREE.BoxGeometry(0.58, 1.25, 0.42);
      }

      const toothState = teethData[num] || { condition: 'sound' };
      const condInfo = CONDITION_COLORS[toothState.condition] || CONDITION_COLORS.sound;

      const mat = new THREE.MeshStandardMaterial({
        color: condInfo.color,
        roughness: 0.25,
        metalness: toothState.condition === 'crown' ? 0.35 : 0.05,
        transparent: toothState.condition === 'missing',
        opacity: toothState.condition === 'missing' ? 0.25 : 1.0,
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y, z);

      // Orient tooth along tangent to arch curve
      mesh.rotation.y = -angle;
      if (!isUpper) {
        mesh.rotation.z = Math.PI; // Invert lower teeth
      }

      mesh.userData = { toothNumber: num, isUpper };
      scene.add(mesh);
      toothMeshes.set(num, mesh);
    };

    // Build Upper Arch (teeth 1 to 16)
    for (let i = 0; i < 16; i++) {
      createToothMesh(i + 1, true, i);
    }

    // Build Lower Arch (teeth 32 down to 17)
    for (let i = 0; i < 16; i++) {
      const toothNum = 32 - i;
      createToothMesh(toothNum, false, i);
    }

    // Add Translucent Anatomical Gum Ridge Curves for reference
    const createGumArch = (isUpper: boolean) => {
      const curvePoints = [];
      const steps = 30;
      const radiusX = isUpper ? 6.2 : 5.8;
      const radiusZ = isUpper ? 7.2 : 6.8;
      const y = isUpper ? 2.3 : -2.3;

      for (let i = 0; i <= steps; i++) {
        const t = -1 + (i / steps) * 2;
        const angle = (t * Math.PI) / 2.3;
        const x = Math.sin(angle) * radiusX;
        const z = -Math.cos(angle) * radiusZ + (radiusZ * 0.4);
        curvePoints.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const tubeGeom = new THREE.TubeGeometry(curve, 32, 0.4, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e, // soft pink/rose gum
        roughness: 0.6,
        metalness: 0.1,
        transparent: true,
        opacity: 0.28,
      });
      const gumMesh = new THREE.Mesh(tubeGeom, tubeMat);
      scene.add(gumMesh);
    };

    createGumArch(true);
    createGumArch(false);

    // Raycaster for interactive tooth clicking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Array.from(toothMeshes.values()));

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const toothNum = hit.userData?.toothNumber;
        if (toothNum) {
          const tooth = teethData[toothNum];
          if (tooth) {
            setSelectedTooth(tooth);
            if (onToothSelect) onToothSelect(tooth);

            // Highlight selected tooth
            if (selectedMeshRef.current) {
              // Reset previous
              const prevMat = selectedMeshRef.current.material as THREE.MeshStandardMaterial;
              prevMat.emissive.setHex(0x000000);
            }

            const currentMat = hit.material as THREE.MeshStandardMaterial;
            currentMat.emissive.setHex(0x0d9488); // teal glow
            selectedMeshRef.current = hit;
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', handlePointerDown);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 1.5;
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Window Resize Handling
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handlePointerDown);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update 3D tooth color dynamically when condition changes
  const applyConditionToTooth = (condition: ToothCondition3D) => {
    if (!selectedTooth) return;

    const toothNum = selectedTooth.number;
    const updatedTeeth = {
      ...teethData,
      [toothNum]: {
        ...selectedTooth,
        condition,
      },
    };
    setTeethData(updatedTeeth);
    setSelectedTooth(updatedTeeth[toothNum]);

    // Update 3D Mesh Material Color in scene
    const mesh = toothMeshesRef.current.get(toothNum);
    if (mesh) {
      const condColor = CONDITION_COLORS[condition] || CONDITION_COLORS.sound;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.setHex(condColor.color);
      mat.transparent = condition === 'missing';
      mat.opacity = condition === 'missing' ? 0.25 : 1.0;
      mat.metalness = condition === 'crown' ? 0.35 : 0.05;
      mat.emissive.setHex(0x0d9488); // keep active selection glow
    }

    if (onToothConditionChange) {
      onToothConditionChange(toothNum, condition);
    }
  };

  // Camera presets
  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 10, 20);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  const viewArch = (view: 'upper' | 'lower' | 'occlusal') => {
    if (!cameraRef.current || !controlsRef.current) return;
    if (view === 'upper') {
      cameraRef.current.position.set(0, 16, 2);
    } else if (view === 'lower') {
      cameraRef.current.position.set(0, -16, 2);
    } else {
      cameraRef.current.position.set(0, 0, 22);
    }
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <div className="relative w-full h-[540px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-md">
      
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Navigation HUD Controls (Top Left) */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-slate-900/85 backdrop-blur-md p-2 rounded-lg border border-slate-700 text-white text-xs">
        <button
          onClick={resetCamera}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
          title="Reset Camera Orientation"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <div className="h-4 w-px bg-slate-700" />

        <button
          onClick={() => viewArch('upper')}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors"
        >
          Maxilla (Upper)
        </button>
        <button
          onClick={() => viewArch('lower')}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors"
        >
          Mandible (Lower)
        </button>
        <button
          onClick={() => viewArch('occlusal')}
          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition-colors"
        >
          Frontal Occlusion
        </button>

        <div className="h-4 w-px bg-slate-700" />

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            autoRotate ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          title="Toggle Slow Auto-Orbit"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Auto-Spin</span>
        </button>
      </div>

      {/* Floating Interactive Instructions (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <span>Drag to orbit 360° · Scroll to zoom · Click any 3D tooth to mark condition</span>
      </div>

      {/* Selected 3D Tooth Condition Inspector Popup (Top Right) */}
      {selectedTooth ? (
        <div className="absolute top-4 right-4 z-20 w-80 bg-white/95 backdrop-blur-md rounded-xl p-5 border border-slate-200 shadow-xl text-slate-900 animate-in fade-in zoom-in-95 duration-150">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Tooth #{selectedTooth.number} (FDI {selectedTooth.fdi})
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {selectedTooth.arch}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                {selectedTooth.name}
              </h4>
            </div>

            <button
              onClick={() => setSelectedTooth(null)}
              className="text-slate-400 hover:text-slate-700 text-sm p-1"
            >
              ✕
            </button>
          </div>

          {/* Current Condition Indicator */}
          <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-500">Current Status:</span>
            <span className="font-bold flex items-center gap-1.5" style={{ color: CONDITION_COLORS[selectedTooth.condition]?.hex }}>
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: CONDITION_COLORS[selectedTooth.condition]?.hex }} 
              />
              {CONDITION_COLORS[selectedTooth.condition]?.label}
            </span>
          </div>

          {/* 1-Click Condition Selector Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-600 block uppercase tracking-wider">
              Mark Clinical Condition:
            </span>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {(Object.keys(CONDITION_COLORS) as ToothCondition3D[]).map((cond) => {
                const info = CONDITION_COLORS[cond];
                const isActive = selectedTooth.condition === cond;

                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => applyConditionToTooth(cond)}
                    className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      isActive
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold ring-1 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border border-slate-300"
                      style={{ backgroundColor: info.hex }}
                    />
                    <span className="truncate text-[11px]">{info.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Dynamic 3D Render Sync</span>
            <span className="text-teal-700 font-medium">Auto-saved to Chart</span>
          </div>

        </div>
      ) : (
        <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-slate-700 text-xs text-slate-300">
          <span>Click any 3D tooth to inspect & mark condition</span>
        </div>
      )}

    </div>
  );
};
