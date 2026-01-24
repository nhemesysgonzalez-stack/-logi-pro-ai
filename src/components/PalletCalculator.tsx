import { useState, useRef, useEffect, type FC } from 'react';
import { Layers, RefreshCw, ArrowRight, Package, Calculator } from 'lucide-react';

interface PalletCalculatorProps {
    onBack: () => void;
}

type PalletType = 'euro' | 'iso' | 'custom';

interface PalletDimensions {
    width: number;
    length: number;
    name: string;
}

const PALLETS: Record<PalletType, PalletDimensions> = {
    euro: { width: 80, length: 120, name: 'Europalet (120x80)' },
    iso: { width: 100, length: 120, name: 'Americano (120x100)' },
    custom: { width: 100, length: 120, name: 'Personalizado' }
};

const PalletCalculator: FC<PalletCalculatorProps> = ({ onBack }) => {
    // Inputs
    const [boxLength, setBoxLength] = useState(40);
    const [boxWidth, setBoxWidth] = useState(30);
    const [boxHeight, setBoxHeight] = useState(20);
    const [boxWeight, setBoxWeight] = useState(5);
    const [palletType, setPalletType] = useState<PalletType>('euro');
    const [maxHeight, setMaxHeight] = useState(180); // cm

    // Results
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [result, setResult] = useState<{
        boxesPerLayer: number;
        layers: number;
        totalBoxes: number;
        totalWeight: number;
        efficiency: number;
        orientation: 'mixed' | 'straight' | 'rotated';
    } | null>(null);

    const calculateLoad = () => {
        const pallet = PALLETS[palletType];
        const palletArea = pallet.width * pallet.length;

        // Simple fitting algorithm (Naïve approach for MVP)
        // 1. Try Normal Orientation
        const fitW_Normal = Math.floor(pallet.width / boxWidth);
        const fitL_Normal = Math.floor(pallet.length / boxLength);
        const totalNormal = fitW_Normal * fitL_Normal;

        // 2. Try Rotated Orientation
        const fitW_Rotated = Math.floor(pallet.width / boxLength);
        const fitL_Rotated = Math.floor(pallet.length / boxWidth);
        const totalRotated = fitW_Rotated * fitL_Rotated;

        // Determine best single-orientation pattern
        let boxesPerLayer = 0;
        let orientation: 'straight' | 'rotated' = 'straight';

        if (totalRotated > totalNormal) {
            boxesPerLayer = totalRotated;
            orientation = 'rotated';
        } else {
            boxesPerLayer = totalNormal;
            orientation = 'straight';
        }

        // Vertical calc
        const layers = Math.floor(maxHeight / boxHeight);
        const totalBoxes = boxesPerLayer * layers;
        const totalWeight = totalBoxes * boxWeight;

        // Efficiency
        const usedArea = boxesPerLayer * (boxLength * boxWidth);
        const efficiency = (usedArea / palletArea) * 100;

        setResult({
            boxesPerLayer,
            layers,
            totalBoxes,
            totalWeight,
            efficiency,
            orientation
        });
    };

    // Draw visualization
    useEffect(() => {
        if (!result || !canvasRef.current) return;

        const pallet = PALLETS[palletType];
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Scale logic
        const padding = 20;
        const availableW = canvasRef.current.width - (padding * 2);
        const availableH = canvasRef.current.height - (padding * 2);

        const scaleX = availableW / pallet.length; // Draw length horizontally
        const scaleY = availableH / pallet.width;
        const scale = Math.min(scaleX, scaleY);

        const drawW = pallet.length * scale;
        const drawH = pallet.width * scale;
        const startX = (canvasRef.current.width - drawW) / 2;
        const startY = (canvasRef.current.height - drawH) / 2;

        // Clear
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Draw Pallet
        ctx.fillStyle = '#8B4513'; // Wood color
        ctx.fillRect(startX, startY, drawW, drawH);
        ctx.strokeStyle = '#5D2906';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, drawW, drawH);

        // Draw Boxes
        ctx.fillStyle = '#6366f1'; // Primary color box
        ctx.strokeStyle = '#312e81';

        // Determine box dimensions on canvas based on orientation
        // Note: Pallet Length is X, Pallet Width is Y on screen
        let bL = boxLength;
        let bW = boxWidth;

        if (result.orientation === 'rotated') {
            // If rotated, the box LENGTH aligns with pallet WIDTH
            // So on screen (where Pallet Y is Width), box dimension Y is Box Length
            bL = boxWidth; // On screen X
            bW = boxLength; // On screen Y
        }

        const drawBoxL = bL * scale;
        const drawBoxW = bW * scale;

        const cols = Math.floor(pallet.length / bL);
        const rows = Math.floor(pallet.width / bW);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = startX + (c * drawBoxL);
                const y = startY + (r * drawBoxW);

                // Gap details
                const gap = 1;
                ctx.fillRect(x + gap, y + gap, drawBoxL - (gap * 2), drawBoxW - (gap * 2));
                ctx.strokeRect(x + gap, y + gap, drawBoxL - (gap * 2), drawBoxW - (gap * 2));

                // Draw center text
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.font = '10px sans-serif';
                ctx.fillText('#', x + drawBoxL / 2 - 3, y + drawBoxW / 2 + 3);
                ctx.fillStyle = '#6366f1';
            }
        }

    }, [result, palletType, boxLength, boxWidth]);

    // Initial Calculation
    useEffect(() => {
        calculateLoad();
    }, []);

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center glass-panel z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                    <ArrowRight className="rotate-180" size={20} />
                    Volver
                </button>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Calculator className="text-primary" />
                    Optimi-Load
                </h2>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* INPUTS PANEL */}
                <div className="w-full lg:w-1/3 p-6 flex flex-col gap-6 overflow-y-auto bg-slate-800/50">

                    <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <Package size={16} /> Dimensiones Carga
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Largo (cm)</label>
                                <input type="number" value={boxLength} onChange={e => setBoxLength(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 font-bold text-white focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Ancho (cm)</label>
                                <input type="number" value={boxWidth} onChange={e => setBoxWidth(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 font-bold text-white focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Alto (cm)</label>
                                <input type="number" value={boxHeight} onChange={e => setBoxHeight(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 font-bold text-white focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Peso (kg)</label>
                                <input type="number" value={boxWeight} onChange={e => setBoxWeight(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 font-bold text-white focus:border-primary outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <Layers size={16} /> Config Palet
                        </h3>
                        <div className="space-y-3">
                            <div className="flex gap-2 p-1 bg-slate-900 rounded-lg">
                                {Object.entries(PALLETS).map(([key, p]) => (
                                    <button
                                        key={key}
                                        onClick={() => setPalletType(key as PalletType)}
                                        className={`flex-1 py-2 rounded-md text-xs font-bold transition ${palletType === key ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {p.name.split(' (')[0]}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400">Altura Máxima Carga (cm)</label>
                                <input type="number" value={maxHeight} onChange={e => setMaxHeight(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 font-bold text-white focus:border-primary outline-none" />
                            </div>
                        </div>
                    </div>

                    <button onClick={calculateLoad} className="mt-auto py-4 bg-primary rounded-xl font-black uppercase tracking-widest hover:bg-primary/80 transition shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
                        <RefreshCw size={20} /> Calcular
                    </button>
                </div>

                {/* VISUALIZATION PANEL */}
                <div className="flex-1 p-6 flex flex-col gap-6 bg-black relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/40 via-black to-black pointer-events-none"></div>

                    <div className="relative z-10 flex-1 flex flex-col">
                        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5 p-4">
                            <canvas ref={canvasRef} width={600} height={400} className="max-w-full max-h-full object-contain" />
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-2">Vista Superior (Planta)</p>
                    </div>

                    {/* RESULTS STATS */}
                    {result && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                            <div className="bg-slate-800 p-4 rounded-xl border border-white/10">
                                <span className="text-xs text-gray-400 block mb-1">Cajas Totales</span>
                                <span className="text-3xl font-black text-white">{result.totalBoxes}</span>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-xl border border-white/10">
                                <span className="text-xs text-gray-400 block mb-1">Por Capa</span>
                                <span className="text-2xl font-bold text-primary">{result.boxesPerLayer} <span className="text-sm text-gray-500">x {result.layers} capas</span></span>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-xl border border-white/10">
                                <span className="text-xs text-gray-400 block mb-1">Peso Total</span>
                                <span className="text-2xl font-bold text-emerald-400">{result.totalWeight} <span className="text-sm text-emerald-600">kg</span></span>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-xl border border-white/10">
                                <span className="text-xs text-gray-400 block mb-1">Eficiencia Base</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${result.efficiency}%` }}></div>
                                    </div>
                                    <span className="text-sm font-bold">{result.efficiency.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PalletCalculator;
