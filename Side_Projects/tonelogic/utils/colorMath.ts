import { LCH, Palette, Vibe } from '../types';

// --- LCH Conversions ---
// HEX -> RGB -> XYZ -> LAB -> LCH
// Reverse for output

const hexToRgb = (hex: string): [number, number, number] => {
  const cleanHex = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }
  return [r, g, b];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// sRGB to Linear RGB
const sRgbToLinear = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

// Linear RGB to sRGB
const linearToSRgb = (v: number) => {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1.0 / 2.4) - 0.055;
};

const rgbToLch = (r: number, g: number, b: number): LCH => {
  const lr = sRgbToLinear(r);
  const lg = sRgbToLinear(g);
  const lb = sRgbToLinear(b);

  // RGB to XYZ (D65)
  const x = (lr * 0.4124 + lg * 0.3576 + lb * 0.1805) / 0.95047;
  const y = (lr * 0.2126 + lg * 0.7152 + lb * 0.0722) / 1.00000;
  const z = (lr * 0.0193 + lg * 0.1192 + lb * 0.9505) / 1.08883;

  // XYZ to Lab
  const epsilon = 0.008856;
  const kappa = 903.3;
  const f = (v: number) => v > epsilon ? Math.pow(v, 1/3) : (kappa * v + 16) / 116;

  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  const lVal = 116 * fy - 16;
  const aVal = 500 * (fx - fy);
  const bVal = 200 * (fy - fz);

  // Lab to LCH
  const cVal = Math.sqrt(aVal * aVal + bVal * bVal);
  let hVal = Math.atan2(bVal, aVal) * (180 / Math.PI);
  if (hVal < 0) hVal += 360;

  return { l: lVal, c: cVal, h: hVal };
};

const lchToRgb = (l: number, c: number, h: number): [number, number, number] => {
  // LCH to Lab
  const hRad = h * (Math.PI / 180);
  const aVal = c * Math.cos(hRad);
  const bVal = c * Math.sin(hRad);

  // Lab to XYZ
  const fy = (l + 16) / 116;
  const fx = aVal / 500 + fy;
  const fz = fy - bVal / 200;

  const epsilon = 0.008856;
  const kappa = 903.3;
  const fInv = (val: number) => {
    const val3 = val * val * val;
    return val3 > epsilon ? val3 : (116 * val - 16) / kappa;
  };

  const x = fInv(fx) * 0.95047;
  const y = fInv(fy) * 1.00000;
  const z = fInv(fz) * 1.08883;

  // XYZ to RGB
  const lr = x *  3.2406 + y * -1.5372 + z * -0.4986;
  const lg = x * -0.9689 + y *  1.8758 + z *  0.0415;
  const lb = x *  0.0557 + y * -0.2040 + z *  1.0570;

  const finalR = linearToSRgb(lr) * 255;
  const finalG = linearToSRgb(lg) * 255;
  const finalB = linearToSRgb(lb) * 255;

  return [finalR, finalG, finalB];
};

export const hexToLCH = (hex: string): LCH => {
  const [r, g, b] = hexToRgb(hex);
  return rgbToLch(r, g, b);
};

export const LCHToHex = ({ l, c, h }: LCH): string => {
  const [r, g, b] = lchToRgb(l, c, h);
  return rgbToHex(r, g, b);
};

// --- Accessibility ---

export const getLuminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex);
  const [lr, lg, lb] = [r, g, b].map(v => {
    const vComp = v / 255;
    return vComp <= 0.03928 ? vComp / 12.92 : Math.pow((vComp + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

export const getContrastRatio = (hex1: string, hex2: string) => {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const isAccessible = (bg: string, text: string) => {
  return getContrastRatio(bg, text) >= 4.5; // WCAG AA Normal Text
};

// --- Algorithmic Generation (LCH) ---

export const generateSystem = (seedHex: string, vibe: Vibe, isDark: boolean = false): Palette => {
  const seed = hexToLCH(seedHex);
  
  // Base variables
  let primaryL = seed.l;
  let primaryC = seed.c;
  let primaryH = seed.h;

  let bgL, bgC, bgH;
  let surfaceL, surfaceC, surfaceH;
  let textL, textC, textH;
  let mutedL, mutedC, mutedH;
  
  let secL, secC, secH;
  let accL, accC, accH;

  // Default Base Settings (Neutral/Professional start)
  bgH = seed.h;
  bgC = 3; 
  
  if (isDark) {
    bgL = 10;
    surfaceL = 16;
    textL = 94;
    mutedL = 60;
    // Normalize primary for dark mode visibility
    if (primaryL < 40) primaryL = 55;
  } else {
    bgL = 97;
    surfaceL = 93;
    textL = 12;
    mutedL = 50;
    // Normalize primary for light mode visibility
    if (primaryL > 80) primaryL = 60; 
    if (primaryL < 30) primaryL = 45;
  }

  // VIBE LOGIC: OVERRIDES
  
  // 1. BACKGROUND & NEUTRALS
  switch (vibe) {
    case Vibe.CYBERPUNK:
      if (isDark) {
        bgL = 5; // Deep black/void
        bgC = 15; // Tinted darkness
        bgH = (seed.h + 240) % 360; // Cool tint
        surfaceL = 12;
      } else {
        // Light Cyberpunk is rare, let's make it stark
        bgL = 98;
        bgC = 2;
        textL = 0; // Pitch black
      }
      break;

    case Vibe.NATURAL:
      bgC = 6; // Earthier neutrals
      bgH = (seed.h > 20 && seed.h < 60) ? seed.h : 40; // Force warm beige tint if natural
      if (!isDark) {
        bgL = 95; // Cream
        surfaceL = 90; // Darker cream
      } else {
        bgL = 18; // Dark brown/green tint
        surfaceL = 24;
      }
      break;
    
    case Vibe.WARM:
      bgH = 35; // Warm tint
      bgC = 5;
      if (!isDark) {
        bgL = 96; 
        textL = 15; // Soft charcoal
      }
      break;

    case Vibe.TECHNICAL:
      bgC = 0; // Strict greyscale
      surfaceL = isDark ? 20 : 90;
      break;
  }

  // 2. PRIMARY ADJUSTMENTS
  switch (vibe) {
    case Vibe.CYBERPUNK:
      primaryC = Math.max(seed.c, 85); // Neon
      primaryL = 60; // Bright mid-tone
      break;
    case Vibe.SUBTLE:
      primaryC = Math.min(seed.c, 30); // Muted
      break;
    case Vibe.HIGH_CONTRAST:
      primaryC = Math.max(seed.c, 70);
      break;
  }

  // 3. SECONDARY & ACCENT LOGIC
  switch (vibe) {
    case Vibe.HIGH_CONTRAST:
      secH = (seed.h + 180) % 360;
      secC = Math.max(seed.c, 75);
      secL = isDark ? 70 : 45;
      
      accH = (seed.h + 120) % 360; // Triadic
      accC = 80;
      accL = 60;
      break;

    case Vibe.SUBTLE:
      secH = (seed.h + 20) % 360; // Analogous
      secC = 20; 
      secL = isDark ? 65 : 55;

      accH = (seed.h + 160) % 360; // Soft split
      accC = 30;
      accL = 60;
      break;

    case Vibe.CYBERPUNK:
      // Electric & Synthetic
      secH = (seed.h + 180) % 360;
      secC = 100; // Max pop
      secL = 65;

      accH = (seed.h + 300) % 360; // Often pinks/purples work well here
      accC = 110;
      accL = 60;
      break;

    case Vibe.NATURAL:
      // 90 degree shift often finds adjacent nature colors (Green->Blue, Orange->Green)
      secH = (seed.h + 90) % 360;
      secC = 35;
      secL = isDark ? 60 : 50;

      accH = (seed.h + 180) % 360;
      accC = 45;
      accL = isDark ? 70 : 40;
      break;

    case Vibe.WARM:
      secH = (seed.h + 30) % 360;
      secC = 40;
      secL = isDark ? 70 : 50;

      accH = (seed.h - 30 + 360) % 360;
      accC = 50;
      accL = 60;
      break;

    case Vibe.TECHNICAL:
      // Monochromatic or strict complementary
      secH = seed.h; 
      secC = 10; // Very dull secondary
      secL = isDark ? 80 : 30;

      accH = (seed.h + 180) % 360; // Signal color
      accC = 70;
      accL = 50;
      break;
      
    default:
      secH = (seed.h + 180) % 360;
      secC = 50;
      secL = 50;
      accH = (seed.h + 120) % 360;
      accC = 50;
      accL = 50;
  }

  const primary = LCHToHex({ l: primaryL, c: primaryC, h: primaryH });
  const background = LCHToHex({ l: bgL, c: bgC, h: bgH });
  const surface = LCHToHex({ l: surfaceL, c: bgC, h: bgH }); // Match bg Hue/Chroma
  const text = LCHToHex({ l: textL, c: 4, h: bgH }); // Tinted text
  const muted = LCHToHex({ l: mutedL, c: 10, h: bgH });
  
  const secondary = LCHToHex({ l: secL, c: secC, h: secH });
  const accent = LCHToHex({ l: accL, c: accC, h: accH });

  // Functional colors should fit the Vibe
  const funcC = vibe === Vibe.SUBTLE ? 40 : 75;
  const funcL = isDark ? 65 : 50;

  const error = LCHToHex({ l: funcL, c: funcC, h: 30 });
  const warning = LCHToHex({ l: funcL, c: funcC, h: 85 });
  const success = LCHToHex({ l: funcL, c: funcC, h: 145 });

  return {
    primary,
    secondary,
    accent,
    background,
    surface,
    text,
    muted,
    success,
    error,
    warning,
    isDark
  };
};

export const generateWardrobeSuggestions = (anchorHex: string, skinTone: 'Cool' | 'Warm' | 'Neutral'): string[] => {
  const seed = hexToLCH(anchorHex);
  const suggestions: string[] = [];

  suggestions.push(LCHToHex({ l: Math.min(seed.l + 40, 95), c: seed.c, h: seed.h }));

  if (skinTone === 'Cool') {
    suggestions.push('#ffffff'); 
    suggestions.push('#334155');
  } else if (skinTone === 'Warm') {
    suggestions.push('#fff7ed');
    suggestions.push('#78350f');
  } else {
    suggestions.push('#f3f4f6');
    suggestions.push('#1f2937');
  }

  let compH = (seed.h + 180) % 360;
  
  if (skinTone === 'Cool') {
    if (compH > 60 && compH < 100) compH = 340; 
  } else if (skinTone === 'Warm') {
    if (compH > 230 && compH < 260) compH = 150;
  }

  suggestions.push(LCHToHex({ l: 60, c: 50, h: compH }));
  
  const splitH = (seed.h + 150) % 360;
  suggestions.push(LCHToHex({ l: 70, c: 40, h: splitH }));

  return suggestions.slice(0, 4);
};