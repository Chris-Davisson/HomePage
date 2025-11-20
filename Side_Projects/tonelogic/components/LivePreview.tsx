import React from 'react';
import { Palette } from '../types';
import { 
  Check, X, AlertTriangle, Info, 
  BarChart3, PieChart, Activity,
  Menu, ArrowRight, Mail, Lock
} from 'lucide-react';

interface Props {
  palette: Palette;
}

export const LivePreview: React.FC<Props> = ({ palette }) => {
  
  // Helper for contrast to determine text color on top of colored backgrounds
  const getContrastColor = (hexcolor: string) => {
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? '#000000' : '#FFFFFF';
  }

  const onPrimary = getContrastColor(palette.primary);
  const onSecondary = getContrastColor(palette.secondary);

  return (
    <div 
      className="w-full h-full overflow-y-auto transition-colors duration-500 ease-in-out font-sans selection:bg-opacity-30 p-8 md:p-12"
      style={{ backgroundColor: palette.background, color: palette.text }}
    >
      <header className="mb-12 pb-6 border-b" style={{ borderColor: palette.muted + '40' }}>
          <h1 className="text-4xl font-bold mb-3 tracking-tight">System Components</h1>
          <p className="text-lg" style={{ color: palette.muted }}>
            Interactive component library demonstrating the applied color logic.
          </p>
      </header>

      <div className="grid gap-20 max-w-6xl mx-auto">
          
          {/* Typography Section */}
          <section>
              <div className="flex items-center gap-4 mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border" style={{ borderColor: palette.muted, color: palette.muted }}>01</span>
                  <h2 className="text-xl font-bold">Typography & Hierarchy</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                  <div className="space-y-6">
                      <h1 className="text-6xl font-black tracking-tight">Display H1</h1>
                      <h2 className="text-5xl font-bold tracking-tight">Heading H2</h2>
                      <h3 className="text-4xl font-bold tracking-tight">Heading H3</h3>
                      <h4 className="text-3xl font-bold tracking-tight">Heading H4</h4>
                      <h5 className="text-2xl font-bold tracking-tight">Heading H5</h5>
                      <h6 className="text-xl font-bold tracking-tight">Heading H6</h6>
                  </div>
                  <div className="space-y-6 pt-2">
                       <p className="text-2xl leading-relaxed font-light">
                          <span style={{ color: palette.primary, fontWeight: 600 }}>Lead Paragraph:</span> The quick brown fox jumps over the lazy dog. Design is intelligence made visible.
                       </p>
                       <p className="leading-relaxed opacity-90">
                          Standard body text is optimized for readability against the background. 
                          High contrast ratios ensure accessibility. <a href="#" className="underline decoration-2 underline-offset-2 font-medium" style={{ color: palette.secondary, textDecorationColor: palette.accent }}>Interactive links</a> use secondary or accent colors to denote clickability without breaking the reading flow.
                       </p>
                       <blockquote className="pl-4 border-l-4 italic opacity-80" style={{ borderColor: palette.accent }}>
                          "Color does not add a pleasant quality to design - it reinforces it."
                       </blockquote>
                       <p className="text-sm font-mono p-3 rounded bg-black/5" style={{ color: palette.muted }}>
                          // Monospaced text for code or technical data uses the muted tone.
                       </p>
                  </div>
              </div>
          </section>

          {/* Buttons & Inputs Section */}
          <section>
              <div className="flex items-center gap-4 mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border" style={{ borderColor: palette.muted, color: palette.muted }}>02</span>
                  <h2 className="text-xl font-bold">Actions & Inputs</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-16">
                  <div className="space-y-8">
                      <div>
                          <h3 className="text-sm font-bold uppercase opacity-50 mb-4">Button Hierarchy</h3>
                          <div className="flex flex-wrap gap-4">
                              <button className="px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{ backgroundColor: palette.primary, color: onPrimary }}>
                                Primary Action
                              </button>
                              <button className="px-8 py-3 rounded-lg font-bold shadow-sm hover:opacity-90 hover:-translate-y-0.5 transition-all" style={{ backgroundColor: palette.secondary, color: onSecondary }}>
                                Secondary
                              </button>
                              <button className="px-8 py-3 rounded-lg font-bold border-2 transition-all hover:bg-black/5" style={{ borderColor: palette.primary, color: palette.primary }}>
                                Outline
                              </button>
                          </div>
                      </div>
                      <div>
                           <h3 className="text-sm font-bold uppercase opacity-50 mb-4">Functional Sizes</h3>
                           <div className="flex items-center flex-wrap gap-4">
                              <button className="px-3 py-1.5 rounded text-xs font-bold" style={{ backgroundColor: palette.primary, color: onPrimary }}>Small</button>
                              <button className="px-5 py-2.5 rounded-md text-sm font-bold" style={{ backgroundColor: palette.primary, color: onPrimary }}>Default</button>
                              <button className="px-8 py-4 rounded-xl text-lg font-bold" style={{ backgroundColor: palette.primary, color: onPrimary }}>Large</button>
                          </div>
                      </div>
                      <div>
                          <h3 className="text-sm font-bold uppercase opacity-50 mb-4">Icon Actions</h3>
                          <div className="flex gap-4">
                              <button className="p-3 rounded-full shadow-md transition-transform hover:scale-110" style={{ backgroundColor: palette.accent, color: getContrastColor(palette.accent) }}>
                                  <ArrowRight size={20} />
                              </button>
                              <button className="p-3 rounded-full border transition-colors hover:bg-black/5" style={{ borderColor: palette.muted, color: palette.muted }}>
                                  <Menu size={20} />
                              </button>
                          </div>
                      </div>
                  </div>

                  <div className="p-8 rounded-3xl border shadow-sm" style={{ backgroundColor: palette.surface, borderColor: palette.muted + '20' }}>
                       <h3 className="font-bold text-lg mb-6">Form Components</h3>
                       <div className="space-y-5">
                          <div className="space-y-1">
                              <label className="text-xs font-bold uppercase opacity-60">Email Address</label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 opacity-40" size={18} />
                                <input type="text" placeholder="name@example.com" className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-transparent outline-none focus:ring-2 transition-all" style={{ borderColor: palette.muted, '--tw-ring-color': palette.primary } as any} />
                              </div>
                          </div>
                          
                          <div className="space-y-1">
                              <div className="flex justify-between">
                                <label className="text-xs font-bold uppercase opacity-60">Password</label>
                                <span className="text-xs underline cursor-pointer" style={{ color: palette.primary }}>Forgot?</span>
                              </div>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 opacity-40" size={18} />
                                <input type="password" value="Password123" className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-transparent outline-none ring-2 transition-all" style={{ borderColor: palette.primary, '--tw-ring-color': palette.primary } as any} />
                                <div className="absolute right-3 top-3 w-2 h-2 rounded-full" style={{ backgroundColor: palette.success }}></div>
                              </div>
                          </div>

                          <div className="pt-2">
                             <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-black/5 transition-colors" style={{ borderColor: palette.muted + '40' }}>
                                <div className="w-5 h-5 rounded flex items-center justify-center border transition-colors" style={{ backgroundColor: palette.primary, borderColor: palette.primary }}>
                                   <Check size={14} color={onPrimary} />
                                </div>
                                <span className="text-sm font-medium">Subscribe to newsletter</span>
                             </label>
                          </div>
                          
                          <div className="flex gap-4 pt-2">
                             <label className="flex items-center gap-2 cursor-pointer">
                                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: palette.secondary }}>
                                   <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: palette.secondary }}></div>
                                </div>
                                <span className="text-sm">Option A</span>
                             </label>
                             <label className="flex items-center gap-2 cursor-pointer opacity-60">
                                <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: palette.muted }}></div>
                                <span className="text-sm">Option B</span>
                             </label>
                          </div>
                       </div>
                  </div>
              </div>
          </section>

          {/* Data Visualization Section */}
          <section>
               <div className="flex items-center gap-4 mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border" style={{ borderColor: palette.muted, color: palette.muted }}>03</span>
                  <h2 className="text-xl font-bold">Data Visualization</h2>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-8">
                   {/* Bar Chart */}
                   <div className="p-6 rounded-2xl border shadow-sm flex flex-col" style={{ backgroundColor: palette.surface, borderColor: palette.muted + '20' }}>
                      <div className="flex items-center justify-between mb-8">
                          <div>
                              <h4 className="font-bold">Traffic Source</h4>
                              <span className="text-xs opacity-50">Last 7 Days</span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/5">
                             <BarChart3 size={20} color={palette.primary} />
                          </div>
                      </div>
                      <div className="flex items-end gap-2 flex-1 h-32">
                          {[35, 55, 40, 70, 50, 85, 60].map((h, i) => (
                              <div key={i} className="flex-1 rounded-t transition-all hover:opacity-80 relative group" 
                                   style={{ height: `${h}%`, backgroundColor: i === 5 ? palette.primary : palette.muted + '40' }}>
                              </div>
                          ))}
                      </div>
                   </div>

                   {/* Donut Chart */}
                   <div className="p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center relative overflow-hidden" style={{ backgroundColor: palette.surface, borderColor: palette.muted + '20' }}>
                      <div className="absolute top-4 left-4">
                          <h4 className="font-bold">Storage</h4>
                      </div>
                      <div className="absolute top-4 right-4">
                          <PieChart size={20} color={palette.secondary} />
                      </div>
                      <div className="relative w-40 h-40 mt-4">
                          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={palette.muted + '20'} strokeWidth="3" />
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke={palette.secondary} strokeWidth="3" strokeDasharray="75, 100" />
                              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke={palette.accent} strokeWidth="3" strokeDasharray="25, 100" strokeDashoffset="-75" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-2xl font-black">75%</span>
                              <span className="text-[10px] uppercase font-bold opacity-50">Used</span>
                          </div>
                      </div>
                   </div>

                   {/* Activity Feed */}
                   <div className="p-6 rounded-2xl border shadow-sm" style={{ backgroundColor: palette.surface, borderColor: palette.muted + '20' }}>
                      <div className="flex items-center justify-between mb-6">
                          <h4 className="font-bold">Activity</h4>
                          <Activity size={20} color={palette.accent} />
                      </div>
                      <div className="space-y-4">
                          {[
                            { label: 'Server Reset', time: '2m ago', col: palette.error },
                            { label: 'New User', time: '15m ago', col: palette.success },
                            { label: 'Deployment', time: '1h ago', col: palette.primary },
                          ].map((item, i) => (
                             <div key={i} className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.col }}></div>
                                <div className="flex-1 border-b pb-2 border-dashed" style={{ borderColor: palette.muted + '20' }}>
                                   <div className="flex justify-between items-center">
                                       <span className="text-sm font-medium">{item.label}</span>
                                       <span className="text-[10px] font-mono opacity-50">{item.time}</span>
                                   </div>
                                </div>
                             </div>
                          ))}
                      </div>
                      <div className="mt-4 pt-2">
                         <div className="h-1.5 w-full rounded-full overflow-hidden flex bg-black/5">
                            <div className="w-[30%]" style={{backgroundColor: palette.primary}}></div>
                            <div className="w-[20%]" style={{backgroundColor: palette.secondary}}></div>
                            <div className="w-[10%]" style={{backgroundColor: palette.accent}}></div>
                         </div>
                      </div>
                   </div>
              </div>
          </section>

          {/* States & Feedback Section */}
          <section>
               <div className="flex items-center gap-4 mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border" style={{ borderColor: palette.muted, color: palette.muted }}>04</span>
                  <h2 className="text-xl font-bold">States & Feedback</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Success */}
                  <div className="p-4 rounded-xl border flex flex-col gap-3 hover:scale-105 transition-transform" style={{ backgroundColor: palette.success + '10', borderColor: palette.success + '40' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: palette.success, color: '#FFF' }}>
                          <Check size={16} />
                      </div>
                      <div>
                          <h5 className="font-bold text-sm mb-1" style={{ color: palette.success }}>Success</h5>
                          <p className="text-xs opacity-70">Your data has been successfully synced to the cloud.</p>
                      </div>
                  </div>

                  {/* Error */}
                  <div className="p-4 rounded-xl border flex flex-col gap-3 hover:scale-105 transition-transform" style={{ backgroundColor: palette.error + '10', borderColor: palette.error + '40' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: palette.error, color: '#FFF' }}>
                          <X size={16} />
                      </div>
                      <div>
                          <h5 className="font-bold text-sm mb-1" style={{ color: palette.error }}>Failed</h5>
                          <p className="text-xs opacity-70">Connection timed out. Please try again later.</p>
                      </div>
                  </div>

                   {/* Warning */}
                   <div className="p-4 rounded-xl border flex flex-col gap-3 hover:scale-105 transition-transform" style={{ backgroundColor: palette.warning + '10', borderColor: palette.warning + '40' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: palette.warning, color: '#FFF' }}>
                          <AlertTriangle size={16} />
                      </div>
                      <div>
                          <h5 className="font-bold text-sm mb-1" style={{ color: palette.warning }}>Warning</h5>
                          <p className="text-xs opacity-70">Storage is 95% full. Archive old projects.</p>
                      </div>
                  </div>

                   {/* Info */}
                   <div className="p-4 rounded-xl border flex flex-col gap-3 hover:scale-105 transition-transform" style={{ backgroundColor: palette.primary + '10', borderColor: palette.primary + '40' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: palette.primary, color: onPrimary }}>
                          <Info size={16} />
                      </div>
                      <div>
                          <h5 className="font-bold text-sm mb-1" style={{ color: palette.primary }}>Update</h5>
                          <p className="text-xs opacity-70">New color modes are available in the settings.</p>
                      </div>
                  </div>
              </div>
          </section>

           {/* Footer */}
           <footer className="pt-12 mt-12 border-t flex justify-between items-center opacity-50" style={{ borderColor: palette.muted + '30' }}>
              <div className="text-sm">ToneLogic Display System v2.1</div>
              <div className="flex gap-4">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.primary }}></div>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.secondary }}></div>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.accent }}></div>
              </div>
           </footer>
      </div>
    </div>
  );
};