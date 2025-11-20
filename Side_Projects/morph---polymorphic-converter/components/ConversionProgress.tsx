import React from 'react';
import { Loader2, Terminal, Cpu } from 'lucide-react';

interface ConversionProgressProps {
  progress: number; // 0 to 100
  command: string;
  targetName: string;
  isLargeFile?: boolean;
}

const ConversionProgress: React.FC<ConversionProgressProps> = ({ progress, command, targetName, isLargeFile }) => {
  return (
    <div className="w-full max-w-xl animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-2xl">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur opacity-20 animate-pulse"></div>
              {isLargeFile ? (
                <Cpu className="w-6 h-6 text-emerald-500 animate-pulse relative z-10" />
              ) : (
                <Loader2 className="w-6 h-6 text-emerald-500 animate-spin relative z-10" />
              )}
            </div>
            <div>
              <h3 className="text-zinc-900 dark:text-white font-medium flex items-center gap-2">
                {isLargeFile ? 'Processing Large File...' : 'Morphing...'}
              </h3>
              <p className="text-xs text-zinc-500">Creating {targetName}</p>
            </div>
          </div>
          <span className="text-2xl font-mono font-light text-emerald-600 dark:text-emerald-500">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Terminal Output Simulation */}
        <div className="bg-zinc-900 dark:bg-black rounded-lg p-3 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-400 overflow-hidden shadow-inner">
          <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800 pb-2 mb-2">
            <Terminal className="w-3 h-3" />
            <span>morph-engine {isLargeFile ? '(wasm-mode)' : ''}</span>
          </div>
          <div className="space-y-1">
             <p className="opacity-50 break-all">$ {command}</p>
             {isLargeFile && progress > 5 && <p className="text-blue-400/80">→ Allocating WASM heap memory (4GB)...</p>}
             {progress > 10 && <p className="text-emerald-500/80">→ Ingesting source stream...</p>}
             {isLargeFile && progress > 20 && <p className="text-blue-400/80">→ Multi-threaded chunk processing active...</p>}
             {progress > 30 && <p className="text-emerald-500/80">→ Transcoding data packets...</p>}
             {progress > 60 && <p className="text-emerald-500/80">→ Optimizing output headers...</p>}
             {progress > 90 && <p className="text-emerald-500/80">→ Finalizing file structure...</p>}
          </div>
        </div>
        
        {isLargeFile && (
            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-zinc-400 bg-zinc-50 dark:bg-zinc-800/30 py-1 rounded">
                <Cpu className="w-3 h-3" />
                <span>WebAssembly Acceleration Enabled</span>
            </div>
        )}

      </div>
    </div>
  );
};

export default ConversionProgress;