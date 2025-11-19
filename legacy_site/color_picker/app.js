class CustomPicker {
    constructor(onChange) {
        this.onChange = onChange;
        this.element = document.getElementById('custom-picker');
        this.pad = document.getElementById('picker-pad');
        this.cursor = document.getElementById('picker-cursor');
        this.hueSlider = document.getElementById('hue-slider');
        this.hueThumb = document.getElementById('slider-thumb');

        this.h = 0;
        this.s = 1;
        this.v = 1;

        this.isDraggingPad = false;
        this.isDraggingHue = false;

        this.initEvents();
    }

    initEvents() {
        // Pad Events
        this.pad.addEventListener('mousedown', (e) => {
            this.isDraggingPad = true;
            this.updatePad(e);
        });

        // Hue Events
        this.hueSlider.addEventListener('mousedown', (e) => {
            this.isDraggingHue = true;
            this.updateHue(e);
        });

        // Global Mouse Events
        window.addEventListener('mousemove', (e) => {
            if (this.isDraggingPad) this.updatePad(e);
            if (this.isDraggingHue) this.updateHue(e);
        });

        window.addEventListener('mouseup', () => {
            this.isDraggingPad = false;
            this.isDraggingHue = false;
        });

        // Close on click outside
        document.addEventListener('mousedown', (e) => {
            if (!this.element.classList.contains('hidden') &&
                !this.element.contains(e.target) &&
                !e.target.classList.contains('box')) {
                this.close();
            }
        });
    }

    open(targetElement, hexColor, onChange) {
        this.onChange = onChange;
        this.element.classList.remove('hidden');

        // Position
        const rect = targetElement.getBoundingClientRect();
        const pickerRect = this.element.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Default: To the right
        let top = rect.top + window.scrollY;
        let left = rect.right + 10 + window.scrollX;

        // Horizontal Check: If not enough space on right, move to left
        if (left + pickerRect.width > viewportWidth) {
            left = rect.left - pickerRect.width - 10 + window.scrollX;
        }

        // Vertical Check: If not enough space below, move up
        if (top + pickerRect.height > viewportHeight + window.scrollY) {
            top = (rect.bottom + window.scrollY) - pickerRect.height;
        }

        // Ensure it's not off-screen top/left
        top = Math.max(10, top);
        left = Math.max(10, left);

        this.element.style.top = `${top}px`;
        this.element.style.left = `${left}px`;

        // Set initial color
        this.setColor(hexColor);
    }

    close() {
        this.element.classList.add('hidden');
    }

    setColor(hex) {
        const rgb = this.hexToRgb(hex);
        const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
        this.h = hsv.h;
        this.s = hsv.s;
        this.v = hsv.v;
        this.updateUI();
    }

    updatePad(e) {
        const rect = this.pad.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        this.s = x / rect.width;
        this.v = 1 - (y / rect.height);

        this.updateUI();
        this.emitChange();
    }

    updateHue(e) {
        const rect = this.hueSlider.getBoundingClientRect();
        let x = e.clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));

        this.h = x / rect.width;

        this.updateUI();
        this.emitChange();
    }

    updateUI() {
        // Update Pad Background (Hue)
        const rgb = this.hsvToRgb(this.h, 1, 1);
        this.pad.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        // Update Cursor Position
        this.cursor.style.left = `${this.s * 100}%`;
        this.cursor.style.top = `${(1 - this.v) * 100}%`;

        // Update Hue Thumb
        this.hueThumb.style.left = `${this.h * 100}%`;
        // Update Hue Thumb Color
        const hueRgb = this.hsvToRgb(this.h, 1, 1);
        this.hueThumb.style.backgroundColor = `rgb(${hueRgb.r}, ${hueRgb.g}, ${hueRgb.b})`;
    }

    emitChange() {
        const rgb = this.hsvToRgb(this.h, this.s, this.v);
        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        if (this.onChange) this.onChange(hex);
    }

    // Helpers
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    rgbToHsv(r, g, b) {
        r /= 255, g /= 255, b /= 255;
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
    }

    hsvToRgb(h, s, v) {
        let r, g, b;
        let i = Math.floor(h * 6);
        let f = h * 6 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
}

class ColorApp {
    constructor() {
        this.colors = [];
        this.maxColors = 8;
        this.mode = 'website'; // 'website' | 'clothing'
        this.activeColorIndex = null;
        this.picker = null;
        this.init();
    }

    init() {
        // Initial setup
        this.boxesContainer = document.getElementById('boxes');
        this.theoryContainer = document.getElementById('color-theory-display');
        this.suggestionsContainer = document.getElementById('suggestions-container');

        // Initialize Custom Picker
        this.picker = new CustomPicker((hex) => {
            if (this.activeColorIndex !== null) {
                this.updateColor(this.activeColorIndex, hex);
            }
        });

        // Load saved or start fresh
        this.loadPalette();

        if (this.colors.length === 0) {
            this.addColor('#38bdf8'); // Default accent color
            this.addColor('#8b5cf6'); // Secondary default
        } else {
            this.renderAll();
        }

        // Select last color by default
        this.activeColorIndex = this.colors.length - 1;
        this.renderAll();
    }

    setMode(newMode) {
        this.mode = newMode;

        // Update UI Buttons
        document.getElementById('btn-website').classList.toggle('active', newMode === 'website');
        document.getElementById('btn-clothing').classList.toggle('active', newMode === 'clothing');

        this.renderAll();
    }

    // --- Core Color Management ---

    addColor(hex = null) {
        if (this.colors.length >= this.maxColors) return;

        const color = hex || this.randomColor();
        this.colors.push(color);
        this.activeColorIndex = this.colors.length - 1;
        this.renderAll();
    }

    subColor() {
        if (this.colors.length > 1) {
            this.colors.pop();
            if (this.activeColorIndex >= this.colors.length) {
                this.activeColorIndex = this.colors.length - 1;
            }
            this.renderAll();
        }
    }

    clearBoxes() {
        this.colors = [];
        this.addColor('#38bdf8');
        this.activeColorIndex = 0;
        this.renderAll();
    }

    updateColor(index, newColor) {
        this.colors[index] = newColor;
        // Only re-render specific box and suggestions to improve performance
        this.renderBox(index);
        this.renderTheory();
        this.renderSuggestions();
    }

    randomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    setActiveColor(index) {
        this.activeColorIndex = index;
        this.renderAll();
    }

    // --- Rendering ---

    renderAll() {
        this.boxesContainer.innerHTML = '';
        this.colors.forEach((_, index) => {
            // Create placeholder
            const box = document.createElement('div');
            this.boxesContainer.appendChild(box);
            this.renderBox(index);
        });
        this.renderTheory();
        this.renderSuggestions();
    }

    renderBox(index) {
        const color = this.colors[index];
        // Find existing box or create new if needed (though renderAll handles structure)
        let box = this.boxesContainer.children[index];
        if (!box) return; // Should not happen if synced

        box.className = `box ${index === this.activeColorIndex ? 'active' : ''}`;
        box.innerHTML = ''; // Clear content to rebuild

        // Interaction Logic: Click to Select AND Open Picker
        box.onclick = (e) => {
            e.stopPropagation(); // Prevent closing picker immediately

            // Always set active and open picker
            this.setActiveColor(index);
            this.picker.open(box, color, (hex) => {
                this.updateColor(index, hex);
            });
        };

        // Color Swatch (Visual only)
        const swatch = document.createElement('div');
        swatch.className = 'color-picker'; // Reusing class for style
        swatch.style.backgroundColor = color;
        // swatch.style.border = '4px solid rgba(255, 255, 255, 0.2)'; // Removed for clean look

        // Hex Text
        const hexText = document.createElement('div');
        hexText.className = 'color-hex';
        hexText.textContent = color.toUpperCase();

        box.appendChild(swatch);
        box.appendChild(hexText);
    }

    renderTheory() {
        this.theoryContainer.innerHTML = '';

        this.colors.forEach(color => {
            const card = document.createElement('div');
            card.className = 'theory-card';

            const isWarm = this.isWarm(color);
            const tempClass = isWarm ? 'temp-warm' : 'temp-cold';
            const tempText = isWarm ? 'Warm' : 'Cool';

            card.innerHTML = `
                <div style="width: 100%; height: 40px; background: ${color}; border-radius: 4px; margin-bottom: 8px;"></div>
                <span class="temp-badge ${tempClass}">${tempText}</span>
            `;

            this.theoryContainer.appendChild(card);
        });
    }

    renderSuggestions() {
        this.suggestionsContainer.innerHTML = '';
        if (this.colors.length === 0 || this.activeColorIndex === null) return;

        const baseColor = this.colors[this.activeColorIndex];
        let suggestions = [];

        if (this.mode === 'clothing') {
            document.querySelector('.suggestions-section h3').textContent = 'Outfit Suggestions';
            suggestions = this.generateOutfitSuggestions(baseColor);
        } else {
            document.querySelector('.suggestions-section h3').textContent = 'Harmonic Suggestions';
            suggestions = this.generateHarmonies(baseColor);
        }

        suggestions.forEach(s => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.style.backgroundColor = s.color;
            item.style.color = this.getContrastColor(s.color);
            item.textContent = s.name;
            item.title = `Click to add ${s.name}`;
            item.style.cursor = 'pointer';

            item.onclick = () => this.addColor(s.color);

            this.suggestionsContainer.appendChild(item);
        });
    }

    // --- Color Theory Logic ---

    isWarm(hex) {
        const rgb = this.hexToRgb(hex);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const h = hsl.h * 360;
        return (h >= 0 && h < 90) || (h >= 270 && h <= 360);
    }

    generateHarmonies(hex) {
        const rgb = this.hexToRgb(hex);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

        const harmonies = [];

        // Complementary
        harmonies.push({
            name: 'Complementary',
            color: this.hslToHex((hsl.h + 0.5) % 1, hsl.s, hsl.l)
        });

        // Analogous
        harmonies.push({
            name: 'Analogous',
            color: this.hslToHex((hsl.h + 1 / 12) % 1, hsl.s, hsl.l)
        });

        // Triadic
        harmonies.push({
            name: 'Triadic',
            color: this.hslToHex((hsl.h + 1 / 3) % 1, hsl.s, hsl.l)
        });

        // Split Complementary
        harmonies.push({
            name: 'Split Comp',
            color: this.hslToHex((hsl.h + 0.5 + 1 / 12) % 1, hsl.s, hsl.l)
        });

        return harmonies;
    }

    generateOutfitSuggestions(hex) {
        // Clothing Logic: Neutrals vs Accents
        const rgb = this.hexToRgb(hex);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

        const isNeutral = (hsl.s < 0.15 || hsl.l < 0.15 || hsl.l > 0.9);
        const suggestions = [];

        if (isNeutral) {
            // Suggest Accents based on "Season" (Simulated)
            // If Warm Neutral (Beige/Brown) -> Earth Tones
            // If Cool Neutral (Black/Grey/Navy) -> Jewel Tones
            const isWarmNeutral = (hsl.h > 0.05 && hsl.h < 0.15); // Orange/Yellow hues

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
            // Suggest Neutrals to balance the outfit
            suggestions.push({ name: 'Classic Black', color: '#000000' });
            suggestions.push({ name: 'White', color: '#ffffff' });
            suggestions.push({ name: 'Navy', color: '#000080' });
            suggestions.push({ name: 'Charcoal', color: '#36454f' });
            suggestions.push({ name: 'Beige', color: '#f5f5dc' });

            // Monochromatic option
            suggestions.push({
                name: 'Monochrome',
                color: this.hslToHex(hsl.h, hsl.s, Math.max(0.1, hsl.l - 0.3))
            });
        }

        return suggestions;
    }

    // --- Helpers ---

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max == min) {
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
    }

    hslToHex(h, s, l) {
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
    }

    getContrastColor(hex) {
        const rgb = this.hexToRgb(hex);
        const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    }

    // --- Comparison & Storage ---

    savePalette() {
        const paletteName = prompt('Enter a name for this palette:', 'My Palette ' + (this.savedPalettes.length + 1));
        if (!paletteName) return;

        this.savedPalettes.push({
            name: paletteName,
            colors: [...this.colors],
            date: new Date().toISOString()
        });

        localStorage.setItem('chromaSavedPalettes', JSON.stringify(this.savedPalettes));
        this.renderComparison();
        alert('Palette saved!');
    }

    loadPalette() {
        const saved = localStorage.getItem('chromaSavedPalettes');
        this.savedPalettes = saved ? JSON.parse(saved) : [];

        // Load last active state if exists, else default
        const active = localStorage.getItem('chromaActiveColors');
        if (active) {
            this.colors = JSON.parse(active);
        }
    }

    renderComparison() {
        const container = document.getElementById('compare-container');
        if (!container) return;

        container.innerHTML = '';

        if (this.savedPalettes.length === 0) {
            container.innerHTML = '<p class="subtitle">No saved palettes to compare. Save your current palette first!</p>';
            return;
        }

        this.savedPalettes.forEach((palette, index) => {
            const card = document.createElement('div');
            card.className = 'compare-card';
            card.style.padding = '1rem';
            card.style.borderRadius = '12px';
            card.style.marginBottom = '1rem';

            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.marginBottom = '0.5rem';
            header.innerHTML = `<strong>${palette.name}</strong> <button class="btn secondary" onclick="app.loadSavedPalette(${index})">Load</button>`;

            const grid = document.createElement('div');
            grid.style.display = 'flex';
            grid.style.height = '50px';
            grid.style.borderRadius = '8px';
            grid.style.overflow = 'hidden';

            palette.colors.forEach(color => {
                const swatch = document.createElement('div');
                swatch.style.flex = '1';
                swatch.style.backgroundColor = color;
                grid.appendChild(swatch);
            });

            card.appendChild(header);
            card.appendChild(grid);
            container.appendChild(card);
        });
    }

    loadSavedPalette(index) {
        this.colors = [...this.savedPalettes[index].colors];
        this.renderAll();
        switchView('palette');
    }
}

// Initialize App
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ColorApp();
    // Save state on unload
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('chromaActiveColors', JSON.stringify(app.colors));
    });
});

// Global wrappers for HTML onclick events
function addColor() { app.addColor(); }
function subColor() { app.subColor(); }
function clearBoxes() { app.clearBoxes(); }
function savePalette() { app.savePalette(); }
function setMode(mode) { app.setMode(mode); }

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    document.getElementById(viewId + '-view').classList.remove('hidden');
    document.getElementById(viewId + '-view').classList.add('active');

    // Find button that called this
    const btns = document.querySelectorAll('.nav-btn');
    btns.forEach(btn => {
        // Simple check if button text matches view
        if (btn.textContent.toLowerCase().includes(viewId)) {
            btn.classList.add('active');
        }
    });
}
