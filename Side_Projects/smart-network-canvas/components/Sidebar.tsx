import React, { useState } from 'react';
import { DEVICE_LIBRARY } from '../constants';
import { DeviceType } from '../types';
import { Router, ArrowLeftRight, Monitor, ChevronDown, ChevronRight, Search, BoxSelect, Lock, Shield, Eye } from 'lucide-react';

const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Infrastructure': true,
    'Endpoints': true,
    'Security': true,
    'IoT': false,
    'Zones': true
  });

  const onDragStart = (event: React.DragEvent, nodeType: DeviceType, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const categories = Array.from(new Set(DEVICE_LIBRARY.map(d => d.category)));

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400 mb-2 tracking-tight">NetCanvas <span className="text-red-500 text-xs border border-red-500 px-1 rounded">PRO</span></h1>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 text-gray-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Find component..." 
            className="w-full bg-gray-800 text-sm text-gray-200 pl-8 pr-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {categories.map(category => {
            const devices = DEVICE_LIBRARY.filter(d => 
              d.category === category && 
              d.label.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (devices.length === 0) return null;

            return (
              <div key={category} className="border border-gray-800 rounded bg-gray-800/30">
                <button 
                  onClick={() => toggleCategory(category)}
                  className="flex items-center w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase hover:text-gray-200 transition-colors"
                >
                  {expandedCategories[category] ? <ChevronDown size={14} className="mr-1"/> : <ChevronRight size={14} className="mr-1"/>}
                  {category}
                </button>
                
                {expandedCategories[category] && (
                  <div className="p-2 grid grid-cols-2 gap-2">
                    {devices.map((device) => (
                      <div
                        key={device.label}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 p-3 rounded flex flex-col items-center cursor-grab active:cursor-grabbing transition-all text-center group relative"
                        onDragStart={(event) => onDragStart(event, device.type, device.label)}
                        draggable
                      >
                        <div className="mb-2 p-2 bg-gray-900 rounded-full group-hover:bg-blue-900/30 transition-colors">
                           {/* Simplified icon logic for brevity, real app would use map */}
                           {device.type.includes('ROUTER') && <Router size={20} />}
                           {device.type.includes('SWITCH') && <ArrowLeftRight size={20} />}
                           {(device.type === 'PC' || device.type === 'SERVER') && <Monitor size={20} />}
                           {device.category === 'Security' && <Shield size={20} />}
                           {device.category === 'Zones' && <BoxSelect size={20} />}
                           {device.category === 'IoT' && <div className="w-5 h-5 bg-green-600/50 rounded-full" />}
                        </div>
                        <span className="text-[10px] font-medium leading-tight">{device.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-700 text-xs text-gray-500 text-center">
        Drag items to canvas
      </div>
    </aside>
  );
};

export default Sidebar;