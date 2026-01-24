import { useState } from 'react';
import {
  Package,
  Camera,
  ChevronRight,
  Zap,
  PackageCheck,
  BarChart3,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AppMode, Box } from './types';
import VisionSystem from './components/VisionSystem';
import ARSimulator from './components/ARSimulator';
import PalletCalculator from './components/PalletCalculator';
import './App.css';

function App() {
  const [mode, setMode] = useState<AppMode>('landing');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedBoxes, setDetectedBoxes] = useState<Box[]>([]);

  const handleDetectionComplete = (boxes: Box[], image: string) => {
    setDetectedBoxes(boxes);
    setCapturedImage(image);
    setMode('simulate');
  };

  const handleReset = () => {
    setMode('landing');
    setCapturedImage(null);
    setDetectedBoxes([]);
  };

  return (
    <div className="app-container">
      <header className="main-header glass-panel animate-in">
        <div className="logo-section" onClick={handleReset} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">
            <Package className="primary-icon" />
            <div className="pulse-ring"></div>
          </div>
          <div className="logo-text">
            <span className="brand-name">LOGI<span className="gradient-text">PRO</span></span>
            <span className="brand-tagline">AI LOGISTICS SYSTEM</span>
          </div>
        </div>

        <nav className="status-nav">
          <div className={`nav-item ${mode === 'capture' ? 'active' : ''}`} onClick={() => setMode('capture')}>
            <Camera size={18} />
            <span>Escáner IA</span>
          </div>
          <ChevronRight size={14} className="sep" />
          <div className={`nav-item ${mode === 'calculator' ? 'active' : ''}`} onClick={() => setMode('calculator')}>
            <Calculator size={18} />
            <span>Optimi-Load</span>
          </div>
        </nav>
      </header>

      <main className="content">
        <AnimatePresence mode="wait">
          {mode === 'landing' && (
            <motion.section
              key="landing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="landing-hero"
            >
              <div className="hero-content">
                <div className="badge">
                  <Zap size={14} />
                  <span>LOGISTICA 4.0 ACTIVADA</span>
                </div>
                <h1>Logística Inteligente <span className="gradient-text">Profesional</span></h1>
                <p>Herramientas de precisión para operadores logísticos. Escaneo de bultos y cálculo de carga en palets.</p>

                <div className="action-cards">
                  <div className="action-card glass-panel" onClick={() => setMode('capture')}>
                    <div className="card-icon"><Camera /></div>
                    <h3>Escáner Bultos</h3>
                    <p>Detecta y cuenta cajas con la cámara.</p>
                    <div className="card-arrow"><ChevronRight /></div>
                  </div>

                  <div className="action-card glass-panel" onClick={() => setMode('calculator')}>
                    <div className="card-icon"><Calculator /></div>
                    <h3>Calc. Paletización</h3>
                    <p>Optimiza la carga de tus palets 3D.</p>
                    <div className="card-arrow"><ChevronRight /></div>
                  </div>
                </div>

                <div className="features-strip">
                  <div className="f-item">
                    <PackageCheck size={16} />
                    <span>Conteo Automático</span>
                  </div>
                  <div className="f-item">
                    <BarChart3 size={16} />
                    <span>Eficiencia de Carga</span>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {mode === 'calculator' && (
            <motion.section
              key="calculator"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="full-view"
            >
              <PalletCalculator onBack={handleReset} />
            </motion.section>
          )}

          {mode === 'capture' && (
            <motion.section
              key="capture"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="full-view"
            >
              <VisionSystem
                onDetectionComplete={handleDetectionComplete}
                onCancel={handleReset}
              />
            </motion.section>
          )}

          {mode === 'simulate' && capturedImage && (
            <motion.section
              key="simulate"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="full-view"
            >
              <ARSimulator
                backgroundImage={capturedImage}
                initialBoxes={detectedBoxes}
                onExit={handleReset}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="footer-status glass-panel">
        <div className="system-health">
          <div className="health-dot pulse"></div>
          <span>Status: Neural Engine Online</span>
        </div>
        <div className="version-info">
          LOGI PRO AI &copy; 2026 | Logística Inteligente
        </div>
      </footer>

      <style>{`
        .full-view {
          height: 100%;
          width: 100%;
          border-radius: 20px;
          overflow: hidden;
        }
        .features-strip {
          display: flex;
          gap: 2rem;
          margin-top: 1rem;
        }
        .f-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-dim);
          font-size: 0.85rem;
          font-weight: 500;
        }
        .ai-scanner-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, transparent, var(--primary), transparent);
          box-shadow: 0 0 15px var(--primary);
          animation: scan-line 4s infinite linear;
          z-index: 5;
        }
        @keyframes scan-line {
          0% { top: 0% }
          50% { top: 100% }
          100% { top: 0% }
        }
      `}</style>
    </div>
  );
}

export default App;
