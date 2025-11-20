export interface ConversionTarget {
  ext: string;
  desc: string;
  engine: string;
  cmd: string;
  isOptimization?: boolean;
}

export interface ConversionCategory {
  input: string[];
  targets: ConversionTarget[];
}

export interface ConversionData {
  conversions: {
    text_docs: ConversionCategory[];
    images: ConversionCategory[];
    video_audio: ConversionCategory[];
    archives: ConversionCategory[];
  };
}

export interface ConversionFile {
  name: string;
  size: number;
  type: string;
  extension: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING', // Gemini analyzing
  SELECTING = 'SELECTING', // User picking target
  CONVERTING = 'CONVERTING', // Simulation running
  COMPLETED = 'COMPLETED' // Success screen
}

export interface AiRecommendation {
  recommendedExt: string;
  reason: string;
}