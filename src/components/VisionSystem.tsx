import { useRef, useState, useEffect, type FC } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Scan, RefreshCcw, Camera } from 'lucide-react';
import type { Box } from '../types';
import confetti from 'canvas-confetti';

interface VisionSystemProps {
    onDetectionComplete: (boxes: Box[], image: string) => void;
    onCancel: () => void;
}

const VisionSystem: FC<VisionSystemProps> = ({ onDetectionComplete, onCancel }) => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);
    const [status, setStatus] = useState('Cargando modelos de IA...');

    // Load COCO-SSD model
    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                setStatus('Sistema listo. Apunte a las cajas.');
            } catch (error) {
                console.error('Error loading model:', error);
                setStatus('Error al cargar la IA.');
            }
        };
        loadModel();
    }, []);

    const drawRects = (boxes: Box[]) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        boxes.forEach(box => {
            ctx.strokeStyle = box.color || '#00f2ff';
            ctx.lineWidth = 4;
            ctx.strokeRect(box.x, box.y, box.width, box.height);

            // Label background
            ctx.fillStyle = box.color || '#00f2ff';
            const labelText = `${box.label} ${Math.round(box.confidence * 100)}%`;
            const labelWidth = ctx.measureText(labelText).width;
            ctx.fillRect(box.x, box.y - 25, labelWidth + 10, 25);

            // Label text
            ctx.fillStyle = '#000';
            ctx.font = '14px Inter';
            ctx.fillText(labelText, box.x + 5, box.y - 7);
        });
    };

    useEffect(() => {
        let animationId: number;

        const runDetection = async () => {
            if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4 && model) {
                const video = webcamRef.current.video;
                const { videoWidth, videoHeight } = video;

                if (canvasRef.current) {
                    canvasRef.current.width = videoWidth;
                    canvasRef.current.height = videoHeight;

                    const predictions = await model.detect(video);

                    const detectedBoxes: Box[] = predictions.map((p, i) => ({
                        id: `box-${i}-${Date.now()}`,
                        x: p.bbox[0],
                        y: p.bbox[1],
                        width: p.bbox[2],
                        height: p.bbox[3],
                        label: 'Caja',
                        confidence: p.score,
                        color: '#00f2ff'
                    }));

                    drawRects(detectedBoxes);
                }
            }
            animationId = requestAnimationFrame(runDetection);
        };

        if (model && !isDetecting) {
            runDetection();
        }

        return () => cancelAnimationFrame(animationId);
    }, [model, isDetecting]);

    const handleCapture = async () => {
        if (!webcamRef.current || !model) return;

        setIsDetecting(true);
        setStatus('Procesando cubicaje...');

        const video = webcamRef.current.video!;
        const predictions = await model.detect(video);

        const imageSrc = webcamRef.current.getScreenshot();

        if (imageSrc) {
            const finalBoxes: Box[] = predictions.map((p, i) => ({
                id: `box-${i}`,
                x: p.bbox[0],
                y: p.bbox[1],
                width: p.bbox[2],
                height: p.bbox[3],
                label: 'Caja Detectada',
                confidence: p.score
            }));

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            setTimeout(() => {
                onDetectionComplete(finalBoxes, imageSrc);
            }, 800);
        }
    };

    return (
        <div className="vision-system">
            <div className="vision-stage">
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: 'environment' }}
                    className="webcam-stream"
                />
                <canvas ref={canvasRef} className="vision-overlay" />

                {!model && (
                    <div className="vision-loader">
                        <RefreshCcw className="spinning" size={48} />
                        <p>{status}</p>
                    </div>
                )}
            </div>

            <div className="vision-controls">
                <button className="btn-secondary" onClick={onCancel}>CERRAR</button>

                <div className="status-indicator">
                    <Scan size={18} className={isDetecting ? 'pulse-icon' : ''} />
                    <span>{status}</span>
                </div>

                <button
                    className="capture-btn"
                    onClick={handleCapture}
                    disabled={!model || isDetecting}
                >
                    <div className="btn-inner">
                        <Camera />
                    </div>
                </button>
            </div>

            <style>{`
        .vision-system {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #000;
        }
        .vision-stage {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .webcam-stream {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .vision-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .vision-loader {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          color: var(--primary);
          z-index: 10;
        }
        .spinning {
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .vision-controls {
          height: 100px;
          background: #020617;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .capture-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #fff;
          padding: 4px;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        .capture-btn:active { transform: scale(0.9); }
        .capture-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-dim);
          font-size: 0.9rem;
          font-weight: 500;
        }
        .pulse-icon {
          color: var(--primary);
          animation: icon-pulse 1.5s infinite;
        }
        @keyframes icon-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default VisionSystem;
