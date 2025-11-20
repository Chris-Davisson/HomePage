import React, { useState, useEffect } from 'react';
import { Command as CommandIcon, Moon, Sun } from 'lucide-react';
import FileDropzone from './components/FileDropzone';
import TargetSelector from './components/TargetSelector';
import ConversionProgress from './components/ConversionProgress';
import ResultCard from './components/ResultCard';
import { CONVERSION_BRAIN } from './constants';
import { AppState, ConversionFile, ConversionTarget, AiRecommendation } from './types';
import { getConversionRecommendation } from './services/geminiService';

// Large file threshold (bytes) - 50MB
const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024;

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentFile, setCurrentFile] = useState<ConversionFile | null>(null);
  const [possibleTargets, setPossibleTargets] = useState<ConversionTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<ConversionTarget | null>(null);
  const [progress, setProgress] = useState(0);
  const [recommendation, setRecommendation] = useState<AiRecommendation | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Initial Theme Setup
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Reset logic
  const resetApp = () => {
    setAppState(AppState.IDLE);
    setCurrentFile(null);
    setPossibleTargets([]);
    setSelectedTarget(null);
    setProgress(0);
    setRecommendation(null);
  };

  // Identify targets based on file extension
  const handleFileSelect = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const conversionData = CONVERSION_BRAIN.conversions;
    
    // Search the brain
    let foundTargets: ConversionTarget[] = [];
    
    // Helper to collect targets
    const collect = (groups: any[]) => {
        groups.forEach(group => {
            if (group.input.includes(ext)) foundTargets = [...foundTargets, ...group.targets];
        });
    };

    collect(conversionData.text_docs);
    collect(conversionData.images);
    collect(conversionData.video_audio);
    collect(conversionData.archives);

    if (foundTargets.length === 0) {
      alert(`No supported conversions found for .${ext} files. Try a standard format (jpg, pdf, docx, mkv, zip).`);
      return;
    }

    setCurrentFile({
      name: file.name,
      size: file.size,
      type: file.type,
      extension: ext
    });
    setPossibleTargets(foundTargets);
    setAppState(AppState.ANALYZING);

    // Gemini Analysis
    try {
      const aiRec = await getConversionRecommendation(file.name, foundTargets);
      if (aiRec) {
        setRecommendation(aiRec);
      }
    } catch (e) {
      console.log("AI Rec skipped");
    }

    setAppState(AppState.SELECTING);
  };

  const startConversion = (target: ConversionTarget) => {
    setSelectedTarget(target);
    setAppState(AppState.CONVERTING);
    setProgress(0);

    const isLarge = (currentFile?.size || 0) > LARGE_FILE_THRESHOLD;
    // Slower simulation for large files or WASM tasks
    const tickSpeed = isLarge ? 800 : 400; 
    const incrementBase = isLarge ? 5 : 15;

    // Simulation Loop
    let p = 0;
    const interval = setInterval(() => {
      // Non-linear progress for realism
      const increment = Math.random() * incrementBase; 
      p += increment;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
           setAppState(AppState.COMPLETED);
        }, 600);
      }
      setProgress(Math.min(Math.floor(p), 100));
    }, tickSpeed);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 selection:bg-emerald-500/30 ${
      theme === 'dark' ? 'bg-[#09090b] text-zinc-100' : 'bg-zinc-50 text-zinc-900'
    }`}>
      
      {/* Top Bar */}
      <header className="border-b border-zinc-200 dark:border-zinc-800/60 p-4 flex items-center justify-between bg-white/50 dark:bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
            <CommandIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-800 dark:text-zinc-100">Morph</span>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="text-xs text-zinc-500 dark:text-zinc-600 font-mono hidden sm:block">
            {appState === AppState.IDLE ? 'READY' : appState}
            </div>
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
            >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* Background Decor */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="z-10 w-full flex flex-col items-center gap-8">
          
          {appState === AppState.IDLE && (
            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center w-full">
               <div className="text-center mb-8 space-y-2">
                  <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-zinc-800 to-zinc-500 dark:from-white dark:to-zinc-500">
                    Universal Polymorphic Engine
                  </h1>
                  <p className="text-zinc-500 dark:text-zinc-500 max-w-md mx-auto">
                    Context-aware file conversion powered by intelligent detection.
                  </p>
               </div>
               <FileDropzone onFileSelect={handleFileSelect} />
            </div>
          )}

          {(appState === AppState.SELECTING || appState === AppState.ANALYZING) && currentFile && (
            <TargetSelector 
              inputFilename={currentFile.name}
              targets={possibleTargets}
              onSelect={startConversion}
              recommendation={recommendation}
            />
          )}

          {appState === AppState.CONVERTING && currentFile && selectedTarget && (
             <ConversionProgress 
                progress={progress}
                targetName={`output.${selectedTarget.ext}`}
                isLargeFile={currentFile.size > LARGE_FILE_THRESHOLD}
                command={selectedTarget.cmd
                  .replace('{input}', currentFile.name)
                  .replace('{output}', `output.${selectedTarget.ext}`)
                }
             />
          )}

          {appState === AppState.COMPLETED && currentFile && selectedTarget && (
             <ResultCard 
                inputFile={currentFile}
                target={selectedTarget}
                onReset={resetApp}
             />
          )}

        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-4 text-center text-zinc-400 dark:text-zinc-700 text-xs">
         Powered by React, Tailwind & Gemini
      </footer>
    </div>
  );
}