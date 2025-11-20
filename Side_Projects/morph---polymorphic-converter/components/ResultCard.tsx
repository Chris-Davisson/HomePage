import React from 'react';
import { CheckCircle2, Download, RefreshCcw, ArrowRight } from 'lucide-react';
import { ConversionFile, ConversionTarget } from '../types';

interface ResultCardProps {
  inputFile: ConversionFile;
  target: ConversionTarget;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ inputFile, target, onReset }) => {
  // Simulate logic for size reduction
  let sizeMultiplier = 0.85;
  if (target.isOptimization) sizeMultiplier = 0.4;
  if (target.ext === 'txt') sizeMultiplier = 0.01;
  if (target.ext === 'zip' || target.ext === 'tar') sizeMultiplier = 0.6;

  const outputSize = Math.floor(inputFile.size * sizeMultiplier);
  const savings = Math.round(((inputFile.size - outputSize) / inputFile.size) * 100);
  
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    // Create a dummy blob to simulate the file download
    const content = `MORPH CONVERSION RECEIPT\n\nOriginal File: ${inputFile.name}\nTarget Format: .${target.ext}\nEngine Used: ${target.engine}\n\nThis is a simulated file for demonstration purposes.`;
    
    // Determine mime type (simplified)
    let mimeType = 'text/plain';
    if (['png', 'jpg', 'jpeg', 'webp'].includes(target.ext)) mimeType = 'image/png'; 
    if (['pdf'].includes(target.ext)) mimeType = 'application/pdf';
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `morph-output.${target.ext}`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-lg animate-in zoom-in-95 duration-500">
      <div className="bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-black border border-emerald-500/30 rounded-xl p-1 shadow-[0_0_50px_-12px_rgba(16,185,129,0.2)]">
        <div className="bg-white/80 dark:bg-zinc-900/50 rounded-lg p-6 backdrop-blur-sm">
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-emerald-500/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
            </div>
            <h2 className="text-2xl font-semibold text-zinc-800 dark:text-white">Conversion Complete</h2>
            <p className="text-zinc-500 mt-1">Your file is ready for download</p>
          </div>

          {/* Diff Card */}
          <div className="bg-zinc-50 dark:bg-black/40 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 mb-6 flex items-center justify-between">
             <div className="text-left">
                <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase font-mono mb-1">Original</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[100px]">{inputFile.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-0.5">{formatSize(inputFile.size)}</p>
             </div>
             
             <div className="flex flex-col items-center gap-1 px-4">
                <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                {savings > 0 && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-500/10 px-1.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                    -{savings}%
                  </span>
                )}
             </div>

             <div className="text-right">
                <p className="text-xs text-emerald-600 dark:text-emerald-500/80 uppercase font-mono mb-1">Result</p>
                <p className="text-sm text-zinc-900 dark:text-white font-medium truncate max-w-[100px]">output.{target.ext}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-600 mt-0.5">{formatSize(outputSize)}</p>
             </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onReset}
              className="flex-1 py-2.5 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Convert Another
            </button>
            <button 
              onClick={handleDownload}
              className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transform"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ResultCard;