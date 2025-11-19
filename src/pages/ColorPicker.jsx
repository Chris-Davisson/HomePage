import React, { useState, useEffect, useRef } from 'react';
import './ColorPicker.css';
import { Plus, Trash2, Save, RefreshCw, Shirt, Globe } from 'lucide-react';

// --- Helper Functions ---
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const rgbToHsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    let d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h, s, v };
};

const hsvToRgb = (h, s, v) => {
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
};

const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h, s, l };
};

const hslToHex = (h, s, l) => {
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const getContrastColor = (hex) => {
    const rgb = hexToRgb(hex);
    const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
};

const isWarm = (hex) => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const h = hsl.h * 360;
    return (h >= 0 && h < 90) || (h >= 270 && h <= 360);
};

// --- Components ---

const CustomPicker = ({ color, onChange, onClose }) => {
    const [hsv, setHsv] = useState({ h: 0, s: 1, v: 1 });
    const padRef = useRef(null);
    const sliderRef = useRef(null);
    const isDraggingPad = useRef(false);
    const isDraggingHue = useRef(false);

    useEffect(() => {
        const rgb = hexToRgb(color);
        setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
    }, []); // Only on mount/open

    const updateColor = (newHsv) => {
        setHsv(newHsv);
        const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
        onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
    };

    const handlePad = (e) => {
        if (!padRef.current) return;
        const rect = padRef.current.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));
        updateColor({ ...hsv, s: x / rect.width, v: 1 - (y / rect.height) });
    };

    const handleHue = (e) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        updateColor({ ...hsv, h: x / rect.width });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDraggingPad.current) handlePad(e);
            if (isDraggingHue.current) handleHue(e);
        };
        const handleMouseUp = () => {
            isDraggingPad.current = false;
            isDraggingHue.current = false;
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [hsv]);

    const padColor = hsvToRgb(hsv.h, 1, 1);

    return (
        <div className="custom-picker" onMouseDown={(e) => e.stopPropagation()}>
            <div
                className="picker-pad"
                ref={padRef}
                style={{ backgroundColor: `rgb(${padColor.r}, ${padColor.g}, ${padColor.b})` }}
                onMouseDown={(e) => { isDraggingPad.current = true; handlePad(e); }}
            >
                <div
                    className="picker-cursor"
                    style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
                />
            </div>
            <div className="picker-slider-container">
                <div
                    className="hue-slider"
                    ref={sliderRef}
                    onMouseDown={(e) => { isDraggingHue.current = true; handleHue(e); }}
                >
                    <div
                        className="slider-thumb"
                        style={{ left: `${hsv.h * 100}%`, backgroundColor: `hsl(${hsv.h * 360}, 100%, 50%)` }}
                    />
                </div>
            </div>
        </div>
    );
};

const ColorPicker = () => {
    const [colors, setColors] = useState(['#38bdf8', '#8b5cf6']);
    const [activeColorIndex, setActiveColorIndex] = useState(0);
    const [mode, setMode] = useState('website');
    const [showPicker, setShowPicker] = useState(false);
    const [savedPalettes, setSavedPalettes] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem('chromaSavedPalettes');
        if (saved) setSavedPalettes(JSON.parse(saved));
        const active = localStorage.getItem('chromaActiveColors');
        if (active) setColors(JSON.parse(active));
    }, []);

    useEffect(() => {
        localStorage.setItem('chromaActiveColors', JSON.stringify(colors));
    }, [colors]);

    const addColor = (hex = null) => {
        if (colors.length >= 8) return;
        const newColor = hex || '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        setColors([...colors, newColor]);
        setActiveColorIndex(colors.length);
    };

    const updateColor = (index, newColor) => {
        const newColors = [...colors];
        newColors[index] = newColor;
        setColors(newColors);
    };

    const removeColor = () => {
        if (colors.length > 1) {
            const newColors = [...colors];
            newColors.pop();
            setColors(newColors);
            if (activeColorIndex >= newColors.length) {
                setActiveColorIndex(newColors.length - 1);
            }
        }
    };

    const clearColors = () => {
        setColors(['#38bdf8']);
        setActiveColorIndex(0);
    };

    const savePalette = () => {
        const name = prompt('Enter a name for this palette:', 'My Palette ' + (savedPalettes.length + 1));
        if (!name) return;
        const newPalette = { name, colors: [...colors], date: new Date().toISOString() };
        const newSaved = [...savedPalettes, newPalette];
        setSavedPalettes(newSaved);
        localStorage.setItem('chromaSavedPalettes', JSON.stringify(newSaved));
        alert('Palette saved!');
    };

    const generateSuggestions = (baseColor) => {
        const rgb = hexToRgb(baseColor);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        const suggestions = [];

        if (mode === 'clothing') {
            const isNeutral = (hsl.s < 0.15 || hsl.l < 0.15 || hsl.l > 0.9);
            const isWarmNeutral = (hsl.h > 0.05 && hsl.h < 0.15);

            if (isNeutral) {
                if (isWarmNeutral) {
                    suggestions.push({ name: 'Olive Green', color: '#556b2f' });
                    suggestions.push({ name: 'Terracotta', color: '#e2725b' });
                    suggestions.push({ name: 'Mustard', color: '#ffdb58' });
                    suggestions.push({ name: 'Cream', color: '#fffdd0' });
                } else {
                    suggestions.push({ name: 'Royal Blue', color: '#4169e1' });
                    suggestions.push({ name: 'Emerald', color: '#50c878' });
                    suggestions.push({ name: 'Burgundy', color: '#800020' });
                    suggestions.push({ name: 'Crisp White', color: '#ffffff' });
                }
            } else {
                suggestions.push({ name: 'Classic Black', color: '#000000' });
                suggestions.push({ name: 'White', color: '#ffffff' });
                suggestions.push({ name: 'Navy', color: '#000080' });
                suggestions.push({ name: 'Charcoal', color: '#36454f' });
                suggestions.push({ name: 'Beige', color: '#f5f5dc' });
                suggestions.push({ name: 'Monochrome', color: hslToHex(hsl.h, hsl.s, Math.max(0.1, hsl.l - 0.3)) });
            }
        } else {
            suggestions.push({ name: 'Complementary', color: hslToHex((hsl.h + 0.5) % 1, hsl.s, hsl.l) });
            suggestions.push({ name: 'Analogous', color: hslToHex((hsl.h + 1 / 12) % 1, hsl.s, hsl.l) });
            suggestions.push({ name: 'Triadic', color: hslToHex((hsl.h + 1 / 3) % 1, hsl.s, hsl.l) });
            suggestions.push({ name: 'Split Comp', color: hslToHex((hsl.h + 0.5 + 1 / 12) % 1, hsl.s, hsl.l) });
        }
        return suggestions;
    };

    const activeColor = colors[activeColorIndex];

    return (
        <div className="color-picker-page">
            <div className="app-container">
                <aside className="sidebar">
                    <div className="logo">
                        <h1>Chroma</h1>
                    </div>
                    <nav className="nav-menu">
                        <button className={`nav-btn ${mode === 'website' ? 'active' : ''}`} onClick={() => setMode('website')}>
                            <Globe size={18} style={{ marginRight: '8px' }} /> Website Palette
                        </button>
                        <button className={`nav-btn ${mode === 'clothing' ? 'active' : ''}`} onClick={() => setMode('clothing')}>
                            <Shirt size={18} style={{ marginRight: '8px' }} /> Outfit Matcher
                        </button>
                    </nav>
                    <div className="controls">
                        <h3>Actions</h3>
                        <button className="btn primary" onClick={() => addColor()}>
                            <Plus size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Add Color
                        </button>
                        <button className="btn secondary" onClick={removeColor}>
                            <Trash2 size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Remove Last
                        </button>
                        <button className="btn secondary" onClick={clearColors}>
                            <RefreshCw size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Clear All
                        </button>
                        <button className="btn secondary" onClick={savePalette}>
                            <Save size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Save Palette
                        </button>
                    </div>
                </aside>

                <main className="main-content" onClick={() => setShowPicker(false)}>
                    <div className="view">
                        <div className="palette-header">
                            <h2>Current Palette</h2>
                            <p className="subtitle">Click a box to edit color</p>
                        </div>

                        <div className="boxes-container">
                            {colors.map((color, index) => (
                                <div
                                    key={index}
                                    className={`box ${index === activeColorIndex ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveColorIndex(index);
                                        setShowPicker(true);
                                    }}
                                    style={{ position: 'relative' }}
                                >
                                    <div className="color-picker-swatch" style={{ backgroundColor: color }}></div>
                                    <div className="color-hex">{color.toUpperCase()}</div>
                                    {showPicker && index === activeColorIndex && (
                                        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', zIndex: 100, marginTop: '10px' }}>
                                            <CustomPicker
                                                color={color}
                                                onChange={(hex) => updateColor(index, hex)}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="analysis-section">
                            <h3>Color Theory Analysis</h3>
                            <div className="theory-grid">
                                {colors.map((color, index) => (
                                    <div key={index} className="theory-card">
                                        <div style={{ width: '100%', height: '40px', background: color, borderRadius: '4px', marginBottom: '8px' }}></div>
                                        <span className={`temp-badge ${isWarm(color) ? 'temp-warm' : 'temp-cold'}`}>
                                            {isWarm(color) ? 'Warm' : 'Cool'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="suggestions-section">
                            <h3>{mode === 'website' ? 'Harmonic Suggestions' : 'Outfit Suggestions'}</h3>
                            <div className="suggestions-grid">
                                {generateSuggestions(activeColor).map((s, i) => (
                                    <div
                                        key={i}
                                        className="suggestion-item"
                                        style={{ backgroundColor: s.color, color: getContrastColor(s.color) }}
                                        onClick={() => addColor(s.color)}
                                        title={`Click to add ${s.name}`}
                                    >
                                        {s.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ColorPicker;
