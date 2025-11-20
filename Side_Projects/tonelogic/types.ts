export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface LCH {
  l: number;
  c: number;
  h: number;
}

export interface Palette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  success: string;
  error: string;
  warning: string;
  isDark: boolean;
}

export enum AppMode {
  WEB_ENGINE = 'WEB_ENGINE',
  WARDROBE = 'WARDROBE',
}

export enum Vibe {
  HIGH_CONTRAST = 'High Contrast',
  SUBTLE = 'Subtle/Muted',
  CYBERPUNK = 'Cyberpunk',
  NATURAL = 'Natural',
  WARM = 'Warm & Welcoming',
  TECHNICAL = 'Technical',
}

export interface SkinToneAnalysis {
  tone: 'Cool' | 'Warm' | 'Neutral';
  reasoning: string;
  avoidColors: string[];
  bestColors: string[];
}

export interface WardrobeItem {
  id: string;
  name: string;
  color: string; // Hex
  category: 'top' | 'bottom' | 'shoes' | 'accessory';
}
