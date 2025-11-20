import React, { useState, useRef } from 'react';
import { Camera, Upload, Shirt, ChevronRight, Loader2, User } from 'lucide-react';
import { analyzeSkinToneFromImage } from '../services/geminiService';
import { generateWardrobeSuggestions } from '../utils/colorMath';
import { SkinToneAnalysis } from '../types';

export const WardrobeHelper: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [skinData, setSkinData] = useState<SkinToneAnalysis | null>(null);
  const [manualTone, setManualTone] = useState<'Cool' | 'Warm' | 'Neutral'>('Neutral');
  const [isManualMode, setIsManualMode] = useState(false);
  const [anchorHex, setAnchorHex] = useState<string>('#1e3a8a'); // Default Blue Jeans
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setIsManualMode(false);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const result = await analyzeSkinToneFromImage(base64);
      setSkinData(result);
      if (result.tone) setManualTone(result.tone as any);
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  // Determine the tone to use for math
  const currentTone = skinData ? skinData.tone : manualTone;
  const suggestions = generateWardrobeSuggestions(anchorHex, currentTone as any);

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-12">
      
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">Wardrobe Logic</h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Don't trust your eyes. Trust the algorithm. Calibrate your skin tone, pick an anchor item, and let us mathematically solve your outfit.
        </p>
      </div>

      {/* Calibration Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">Step 1: Calibration</h3>
            <p className="text-slate-400 text-sm mb-6">
              Upload a photo for precise analysis, or manually select your undertone.
            </p>
            
            {!skinData && !isManualMode ? (
              <div className="flex flex-wrap gap-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                  {isAnalyzing ? 'Scanning Pigment...' : 'Upload Photo'}
                </button>
                <button 
                  onClick={() => setIsManualMode(true)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <User size={20} />
                  Manual Select
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                 
                 {/* Status Badge */}
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border border-slate-700">
                    <span className={`w-3 h-3 rounded-full ${skinData ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`}></span>
                    <span className="text-white font-bold">
                      {skinData ? 'AI Analysis Complete' : 'Manual Configuration Active'}
                    </span>
                 </div>

                 {/* Controls */}
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Undertone Profile</label>
                    <div className="flex gap-2">
                      {['Cool', 'Neutral', 'Warm'].map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                             setManualTone(t as any);
                             setSkinData(null); // Clear AI data if manually overriding
                             setIsManualMode(true);
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                            currentTone === t 
                              ? 'bg-white text-black border-white' 
                              : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                 </div>

                 {skinData && (
                   <p className="text-sm text-slate-300 italic border-l-2 border-indigo-500 pl-4 py-1">
                     "{skinData.reasoning}"
                   </p>
                 )}
                 
                 <button onClick={() => { setSkinData(null); setIsManualMode(false); }} className="text-xs text-slate-500 underline hover:text-white">
                   Reset Calibration
                 </button>
              </div>
            )}
          </div>

          <div className="w-full md:w-1/3 bg-slate-950 rounded-xl p-6 border border-slate-800 min-h-[200px] flex flex-col justify-center">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Profile Metadata</h4>
            {skinData ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Avoid</p>
                  <div className="flex gap-2">
                    {skinData.avoidColors.map(c => (
                      <div key={c} className="w-8 h-8 rounded bg-current" style={{color: c}} title={c}></div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Best Matches</p>
                  <div className="flex gap-2">
                    {skinData.bestColors.map(c => (
                      <div key={c} className="w-8 h-8 rounded bg-current shadow-lg ring-1 ring-white/10" style={{color: c}} title={c}></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-slate-600">
                {isManualMode ? (
                   <div>
                      <User size={32} className="mx-auto mb-2 opacity-50 text-blue-500" />
                      <p className="text-sm text-slate-400">Using standard color theory for <span className="text-blue-400 font-bold">{manualTone}</span> skin tones.</p>
                   </div>
                ) : (
                  <div>
                    <Camera size={32} className="mx-auto mb-2 opacity-50" />
                    <span className="text-xs">No data available</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Logic Section */}
      <section className="grid md:grid-cols-2 gap-8">
        
        {/* Input */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Step 2: The Anchor</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">Select Anchor Item Color</label>
            <div className="flex items-center gap-4">
              <input 
                type="color" 
                value={anchorHex}
                onChange={(e) => setAnchorHex(e.target.value)}
                className="w-16 h-16 rounded-lg cursor-pointer bg-transparent border-0 p-0"
              />
              <div>
                <div className="text-white font-mono text-lg uppercase">{anchorHex}</div>
                <div className="text-slate-500 text-sm">e.g., Navy Jeans, Grey Suit</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex gap-3">
              <div className="p-2 bg-slate-700 rounded text-slate-300 h-fit">
                <Shirt size={20} />
              </div>
              <div>
                <h5 className="text-sm font-bold text-white">Locked Variable</h5>
                <p className="text-xs text-slate-400 mt-1">
                  The algorithm is now calculating harmonic matches for {anchorHex} considering a {currentTone} undertone profile.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
           <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
             Matches Found <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{suggestions.length}</span>
           </h3>

           <div className="space-y-4">
             {suggestions.map((color, idx) => (
               <div key={idx} className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-slate-200 shadow-inner" style={{backgroundColor: color}}></div>
                    <div>
                      <p className="font-bold text-lg uppercase font-mono">{color}</p>
                      <p className="text-xs text-slate-500">
                        {idx === 0 ? 'Monochromatic (Subtle)' : idx === 1 ? 'Neutral Anchor' : 'High Contrast Pop'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-slate-600" />
               </div>
             ))}
           </div>
           
           {!skinData && !isManualMode && (
             <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center text-center p-6 z-10">
                <div>
                  <p className="text-slate-900 font-bold mb-2">Calibration Required</p>
                  <p className="text-slate-500 text-sm mb-4">Upload a photo or select a manual profile to unlock outfit generation.</p>
                  <button 
                    onClick={() => setIsManualMode(true)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-lg hover:scale-105 transition-transform"
                  >
                    Enable Manual Mode
                  </button>
                </div>
             </div>
           )}
        </div>

      </section>
    </div>
  );
};