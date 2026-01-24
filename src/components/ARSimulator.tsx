import { type FC, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Move,
  Trash2,
  Plus,
  Layout,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Maximize2
} from 'lucide-react';
import type { Box, SimulationBox } from '../types';

interface ARSimulatorProps {
  backgroundImage: string;
  initialBoxes: Box[];
  onExit: () => void;
}

const ARSimulator: FC<ARSimulatorProps> = ({ backgroundImage, initialBoxes, onExit }) => {
  const [simBoxes, setSimBoxes] = useState<SimulationBox[]>(
    initialBoxes.map(b => ({ ...b, virtualX: b.x, virtualY: b.y, isPlaced: true }))
  );

  const addBox = () => {
    const newBox: SimulationBox = {
      id: `virtual-${Date.now()}`,
      x: 50,
      y: 50,
      virtualX: 50,
      virtualY: 50,
      width: 100,
      height: 100,
      label: 'Caja Manual',
      confidence: 1,
      isPlaced: true,
      color: '#6366f1'
    };
    setSimBoxes([...simBoxes, newBox]);
  };

  const removeBox = (id: string) => {
    setSimBoxes(simBoxes.filter(b => b.id !== id));
  };

  const totalUsedSpace = simBoxes.length * 8.5;
  const isOverlimit = totalUsedSpace > 100;

  return (
    <div className="ar-simulator">
      <div className="simulator-header glass-panel">
        <button className="btn-back" onClick={onExit}>
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>
        <div className="sim-stats">
          <div className="stat-item">
            <span className="label">Cajas:</span>
            <span className="value">{simBoxes.length}</span>
          </div>
          <div className="stat-item">
            <span className="label">Espacio:</span>
            <span className={`value ${isOverlimit ? 'danger' : 'success'}`}>
              {Math.round(totalUsedSpace)}%
            </span>
          </div>
        </div>
        <button className="btn-finish" onClick={() => alert('Simulación guardada con éxito.')}>
          <span>Finalizar</span>
          <CheckCircle size={18} />
        </button>
      </div>

      <div className="sim-main">
        <div className="canvas-wrapper glass-panel">
          <img src={backgroundImage} alt="Espacio" className="canvas-bg" />
          <div className="interactive-overlay">
            {simBoxes.map((box) => (
              <motion.div
                key={box.id}
                drag
                dragMomentum={false}
                className="virtual-box"
                style={{
                  width: box.width,
                  height: box.height,
                  x: box.virtualX,
                  y: box.virtualY,
                  borderColor: box.color || 'var(--primary)',
                  boxShadow: `0 0 15px ${box.color || 'var(--primary)'}44`
                }}
              >
                <div className="box-label">{box.label.split(' ')[0]}</div>
                <button className="delete-box" onClick={() => removeBox(box.id)}>
                  <Trash2 size={12} />
                </button>
                <div className="drag-handle"><Move size={14} /></div>
              </motion.div>
            ))}
          </div>

          {isOverlimit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="alert-overlay"
            >
              <AlertCircle size={32} />
              <div>
                <h4>Límite de Espacio excedido</h4>
                <p>La disposición actual supera la capacidad óptima estimada.</p>
              </div>
            </motion.div>
          )}
        </div>

        <aside className="sim-toolbar glass-panel">
          <h3>Herramientas AR</h3>

          <div className="tool-group">
            <button className="tool-btn active" onClick={addBox}>
              <Plus size={20} />
              <span>Añadir Caja</span>
            </button>
            <button className="tool-btn">
              <Layout size={20} />
              <span>Auto-Acomodar</span>
            </button>
            <button className="tool-btn">
              <Maximize2 size={20} />
              <span>Medir Espacio</span>
            </button>
          </div>

          <div className="optimization-card">
            <h4>Sugerencia LogiPro</h4>
            <p>Apila las cajas de mayor peso en la base para optimizar el {Math.max(0, Math.round(100 - totalUsedSpace))}% de espacio libre.</p>
          </div>
        </aside>
      </div>

      <style>{`
        .ar-simulator {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 1rem;
          color: #fff;
        }
        .simulator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
        }
        .btn-back {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          font-weight: 600;
        }
        .sim-stats {
          display: flex;
          gap: 2rem;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stat-item .label { font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; }
        .stat-item .value { font-size: 1.2rem; font-weight: 800; }
        .value.success { color: var(--accent); }
        .value.danger { color: var(--danger); text-shadow: 0 0 10px rgba(239, 68, 68, 0.4); }
        
        .btn-finish {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--accent);
          color: #000;
          border: none;
          padding: 8px 15px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .sim-main {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 1.5rem;
          min-height: 0;
        }

        .canvas-wrapper {
          position: relative;
          overflow: hidden;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
        }

        .canvas-bg {
          max-width: 100%;
          max-height: 100%;
          opacity: 0.7;
          object-fit: contain;
        }

        .interactive-overlay {
          position: absolute;
          inset: 0;
        }

        .virtual-box {
          position: absolute;
          background: rgba(0, 242, 255, 0.15);
          border: 2px solid var(--primary);
          border-radius: 4px;
          cursor: move;
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
        }

        .box-label {
          font-size: 0.7rem;
          font-weight: 800;
          background: var(--primary);
          color: #000;
          padding: 2px 6px;
          position: absolute;
          top: -20px;
          left: -2px;
          border-radius: 2px;
          white-space: nowrap;
        }

        .delete-box {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 20px;
          height: 20px;
          background: var(--danger);
          border: none;
          border-radius: 50%;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .virtual-box:hover .delete-box { opacity: 1; }

        .drag-handle {
          position: absolute;
          bottom: 5px;
          right: 5px;
          color: var(--primary);
          opacity: 0.5;
        }

        .alert-overlay {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(239, 68, 68, 0.9);
          padding: 1rem 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 20;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          width: 90%;
          max-width: 400px;
        }
        .alert-overlay h4 { font-size: 0.9rem; margin: 0; }
        .alert-overlay p { font-size: 0.8rem; margin: 0; opacity: 0.9; }

        .sim-toolbar {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .tool-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .tool-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px;
          border-radius: 12px;
          color: var(--text-main);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .tool-btn:hover { background: rgba(255, 255, 255, 0.1); }
        .tool-btn.active { border-color: var(--primary); background: rgba(0, 242, 255, 0.1); }

        .optimization-card {
          margin-top: auto;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(0, 242, 255, 0.1));
          border: 1px solid rgba(0, 242, 255, 0.2);
          padding: 1rem;
          border-radius: 16px;
        }

        .optimization-card h4 {
          color: var(--primary);
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .optimization-card p {
          font-size: 0.8rem;
          line-height: 1.5;
          color: var(--text-dim);
        }

        @media (max-width: 900px) {
          .sim-main { grid-template-columns: 1fr; }
          .sim-toolbar { display: none; }
        }
      `}</style>
    </div>
  );
};

export default ARSimulator;
