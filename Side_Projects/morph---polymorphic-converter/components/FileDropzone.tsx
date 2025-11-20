import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFileSelect }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
      // Reset value to allow selecting the same file again if the user resets
      e.target.value = '';
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="group relative w-full max-w-2xl h-64 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center transition-all duration-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 cursor-pointer overflow-hidden"
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
        onChange={handleInputChange}
        title="" 
      />
      
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="z-20 flex flex-col items-center space-y-4 text-zinc-400 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors pointer-events-none">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-700 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-zinc-700 dark:text-white mb-1">Drag & Drop your file</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">or click to browse</p>
        </div>
        <div className="flex gap-2 text-xs text-zinc-500 dark:text-zinc-600 font-mono mt-4">
          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">DOCX</span>
          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">PDF</span>
          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">ZIP</span>
          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">MKV</span>
        </div>
      </div>
    </div>
  );
};

export default FileDropzone;