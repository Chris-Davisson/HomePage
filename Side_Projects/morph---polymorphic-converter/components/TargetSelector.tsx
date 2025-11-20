import React, { useState } from 'react';
import { ArrowRight, Command, Sparkles, FileCode, Image, Video, Box, Minimize2 } from 'lucide-react';
import { ConversionTarget, AiRecommendation } from '../types';

interface TargetSelectorProps {
  inputFilename: string;
  targets: ConversionTarget[];
  onSelect: (target: ConversionTarget) => void;
  recommendation: AiRecommendation | null;
}

const TargetSelector: React.FC<TargetSelectorProps> = ({ inputFilename, targets, onSelect, recommendation }) => {
  const [filter, setFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredTargets = targets.filter(t => 
    t.ext.toLowerCase().includes(filter.toLowerCase()) || 
    t.desc.toLowerCase().includes(filter.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => Math.min(prev + 1, filteredTargets.length - 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredTargets[selectedIndex]) {
      onSelect(filteredTargets[selectedIndex]);
    }
  };

  const getIcon = (engine: string, isOpt: boolean) => {
    if (isOpt) return <Minimize2 className="w-4 h-4" />;
    if (engine === 'pandoc' || engine === 'pdf.js' || engine === 'libreoffice') return <FileCode className="w-4 h-4" />;
    if (engine === 'imagemagick' || engine === 'svgo') return <Image className="w-4 h-4" />;
    if (engine === 'ffmpeg') return <Video className="w-4 h-4" />;
    if (engine === 'wasm-archive' || engine === '7zip') return <Box className="w-4 h-4" />;
    return <Command className="w-4 h-4" />;
  };

  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-700/50 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-black/20">
          <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded flex items-center justify-center text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase shrink-0">
            {inputFilename.split('.').pop()}
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
          <input
            autoFocus
            type="text"
            placeholder="Type to filter targets..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 w-full text-sm"
          />
        </div>

        {/* List */}
        <div className="max-h-[400px] overflow-y-auto py-2">
          {filteredTargets.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No compatible formats found.</div>
          ) : (
            filteredTargets.map((target, idx) => {
              const isRecommended = recommendation?.recommendedExt === target.ext;
              const isActive = idx === selectedIndex;
              
              return (
                <div
                  key={idx}
                  onClick={() => onSelect(target)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isActive ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                       {getIcon(target.engine, !!target.isOptimization)}
                    </div>
                    <div>
                      <div className={`font-medium flex items-center gap-2 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-200'}`}>
                        {target.desc}
                        <span className="text-xs font-mono opacity-50 uppercase">.{target.ext}</span>
                        {isRecommended && (
                          <span className="flex items-center gap-1 text-[10px] bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-500/30">
                            <Sparkles className="w-3 h-3" /> AI Pick
                          </span>
                        )}
                        {target.isOptimization && (
                             <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-500/30">
                                Reduce Size
                             </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono truncate max-w-[300px]">
                         {target.cmd.replace('{input}', inputFilename).replace('{output}', `output.${target.ext}`)}
                      </div>
                    </div>
                  </div>
                  
                  {isActive && (
                     <div className="text-xs text-emerald-600 dark:text-emerald-500 font-medium animate-pulse hidden sm:block">
                        Press Enter
                     </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        {/* Status Bar Footer */}
        <div className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 text-[10px] text-zinc-500 flex justify-between items-center">
           <span>Engine: {filteredTargets[selectedIndex]?.engine || 'Unknown'}</span>
           {recommendation && selectedIndex !== -1 && filteredTargets[selectedIndex]?.ext === recommendation.recommendedExt && (
              <span className="text-purple-600 dark:text-purple-400/80 italic truncate max-w-[300px]">"{recommendation.reason}"</span>
           )}
        </div>
      </div>
    </div>
  );
};

export default TargetSelector;