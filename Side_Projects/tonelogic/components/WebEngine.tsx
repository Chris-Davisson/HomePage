import React, { useState, useEffect } from 'react';
import { Palette, Vibe } from '../types';
import { generateSystem, isAccessible, getContrastRatio } from '../utils/colorMath';
import { LivePreview } from './LivePreview';
import { AlertTriangle, Check, Copy, Moon, Sun, RefreshCcw } from 'lucide-react';

export const WebEngine: React.FC = () => {
  const [seed, setSeed] = useState<string>('#3b82f6');
  const [vibe, setVibe] = useState<Vibe>(Vibe.HIGH_CONTRAST);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [palette, setPalette] = useState<Palette>(generateSystem('#3b82f6', Vibe.HIGH_CONTRAST, false));

  useEffect(() => {
    setPalette(generateSystem(seed, vibe, isDark));
  }, [seed, vibe, isDark]);

  const handleManualColorChange = (key: string, value: string) => {
    setPalette((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // Accessibility Checks
  const contrastTextBg = getContrastRatio(palette.background, palette.text);
  const isSafe = contrastTextBg >= 4.5;

  const copyToClipboard = () => {
    const cssVars = `
:root {
  --primary: ${palette.primary};
  --secondary: ${palette.secondary};
  --accent: ${palette.accent};
  --background: ${palette.background};
  --surface: ${palette.surface};
  --text: ${palette.text};
  --muted: ${palette.muted};
  --success: ${palette.success};
  --error: ${palette.error};
  --warning: ${palette.warning};
}
    `;
    navigator.clipboard.writeText(cssVars);
    alert("CSS Variables copied to clipboard!");
  };

  const colorKeys = [
    'primary', 'secondary', 'accent', 
    'background', 'surface', 'text', 'muted', 
    'success', 'warning', 'error'
  ];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
      {/* Left Control Panel */}
      <div className="w-full lg:w-96 bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto flex flex-col gap-8 shadow-xl z-10">
        
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-slate-100 font-bold text-xl mb-1">Semantic Input</h2>
            <p className="text-slate-400 text-sm mb-4">Define the core intent.</p>
            
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Seed Color</label>
            <div className="flex gap-2 items-center">
              <div className="relative group cursor-pointer">
                <input 
                  type="color" 
                  value={seed} 
                  onChange={(e) => setSeed(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="h-12 w-12 rounded border border-slate-600 shadow-sm transition-transform group-hover:scale-105" style={{backgroundColor: seed}}></div>
              </div>
              <input 
                type="text" 
                value={seed} 
                onChange={(e) => setSeed(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 px-3 py-3 rounded font-mono uppercase focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">Mode</label>
              <button 
                onClick={() => setIsDark(!isDark)}
                className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                {isDark ? <Moon size={12} /> : <Sun size={12} />}
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {Object.values(Vibe).map((v) => (
                <button 
                  key={v}
                  onClick={() => setVibe(v)}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-all border text-left ${
                    vibe === v 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <hr className="border-slate-800" />

        {/* Output List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-100 font-bold text-xl">Logic Palette</h2>
            <button 
              onClick={() => setPalette(generateSystem(seed, vibe, isDark))}
              title="Reset to generated defaults"
              className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
            >
              <RefreshCcw size={14} />
            </button>
          </div>
          
          <div className="space-y-1 bg-slate-950/50 p-2 rounded-xl border border-slate-800">
             {colorKeys.map((key) => {
               // @ts-ignore
               const colorValue = palette[key];
               return (
                 <div key={key} className="flex items-center justify-between group hover:bg-slate-900/80 p-2 rounded-lg transition-colors">
                   <div className="flex items-center gap-3">
                     <div className="relative w-8 h-8 rounded shadow-sm ring-1 ring-white/10 overflow-hidden hover:ring-indigo-500 hover:ring-2 transition-all">
                        <input 
                            type="color" 
                            value={colorValue}
                            onChange={(e) => handleManualColorChange(key, e.target.value)}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 opacity-0 cursor-pointer" 
                        />
                        <div className="w-full h-full pointer-events-none" style={{ backgroundColor: colorValue }}></div>
                     </div>
                     <div className="flex flex-col">
                       <span className="text-xs text-slate-300 capitalize font-medium leading-none">{key}</span>
                       <span className="text-[10px] text-slate-600">Edit</span>
                     </div>
                   </div>
                   <input 
                      type="text" 
                      value={colorValue}
                      onChange={(e) => handleManualColorChange(key, e.target.value)}
                      className="w-24 bg-transparent text-right text-xs text-slate-500 font-mono group-hover:text-indigo-300 focus:text-white focus:bg-slate-800 outline-none rounded px-2 py-1 transition-all border border-transparent focus:border-slate-700"
                   />
                 </div>
               )
             })}
          </div>
        </div>

        {/* Safety Guard */}
        <div className={`mt-auto p-4 rounded-lg border transition-colors duration-300 ${isSafe ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-red-950/20 border-red-900/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {isSafe ? <Check className="text-emerald-500" size={18} /> : <AlertTriangle className="text-red-500" size={18} />}
            <h3 className={`font-bold text-sm ${isSafe ? 'text-emerald-500' : 'text-red-500'}`}>
              {isSafe ? 'WCAG AA Compliant' : 'Accessibility Fail'}
            </h3>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-xs text-slate-500">
              Contrast Ratio (Bg/Txt)
            </p>
            <span className={`font-mono text-lg font-bold ${isSafe ? 'text-emerald-400' : 'text-red-400'}`}>
              {contrastTextBg.toFixed(2)}:1
            </span>
          </div>
        </div>

        <button 
          onClick={copyToClipboard}
          disabled={!isSafe}
          className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            !isSafe 
              ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500' 
              : 'bg-white text-black hover:bg-slate-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
          }`}
        >
          <Copy size={18} /> Export CSS
        </button>

      </div>

      {/* Right Preview Panel */}
      <div className="flex-1 bg-neutral-100 relative overflow-hidden">
        <div className="absolute top-4 right-6 z-10 pointer-events-none">
          <span className="bg-black/50 text-white text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded backdrop-blur-md shadow-xl">
            Live Preview // {vibe} // {isDark ? 'Dark' : 'Light'}
          </span>
        </div>
        <LivePreview palette={palette} />
      </div>
    </div>
  );
};
