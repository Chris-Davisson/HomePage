import React, { useState } from 'react';
import { WebEngine } from './components/WebEngine';
import { WardrobeHelper } from './components/WardrobeHelper';
import { AppMode } from './types';
import { LayoutGrid, Shirt, Hexagon } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.WEB_ENGINE);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Hexagon className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Tone<span className="text-indigo-500">Logic</span></h1>
        </div>

        <nav className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setMode(AppMode.WEB_ENGINE)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === AppMode.WEB_ENGINE 
                ? 'bg-slate-700 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid size={16} />
            Web Engine
          </button>
          <button
            onClick={() => setMode(AppMode.WARDROBE)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === AppMode.WARDROBE 
                ? 'bg-slate-700 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shirt size={16} />
            Wardrobe
          </button>
        </nav>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-slate-800"></div>
      </header>

      {/* Main Content */}
      <main>
        {mode === AppMode.WEB_ENGINE ? <WebEngine /> : <WardrobeHelper />}
      </main>
    </div>
  );
};

export default App;
