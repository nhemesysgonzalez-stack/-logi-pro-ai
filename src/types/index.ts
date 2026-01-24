export interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  color?: string;
}

export interface SpaceDimensions {
  width: number;
  height: number;
  depth: number;
  unit: 'cm' | 'm' | 'in' | 'ft';
}

export interface SimulationBox extends Box {
  virtualX: number;
  virtualY: number;
  isPlaced: boolean;
  depth?: number;
}

export type AppMode = 'landing' | 'capture' | 'detect' | 'simulate' | 'report' | 'calculator';
