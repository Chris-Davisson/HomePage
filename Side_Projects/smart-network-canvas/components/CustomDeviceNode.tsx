import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Router, 
  ArrowLeftRight, 
  Shield, 
  Wifi, 
  Monitor, 
  Server, 
  Printer, 
  Cpu, 
  Lightbulb, 
  Video, 
  Cloud,
  Eye,
  ShieldAlert,
  AppWindow,
  Scale,
  Lock,
  Skull,
  Globe
} from 'lucide-react';
import { DeviceType, NetworkDeviceData } from '../types';
import clsx from 'clsx';

// Icon mapper
const getIcon = (type: DeviceType) => {
  switch (type) {
    case DeviceType.ROUTER: return <Router size={24} />;
    case DeviceType.SWITCH_L3: return <ArrowLeftRight size={24} className="text-purple-400" />;
    case DeviceType.SWITCH_L2: return <ArrowLeftRight size={24} />;
    case DeviceType.FIREWALL: return <Shield size={24} className="text-red-400" />;
    case DeviceType.ACCESS_POINT: return <Wifi size={24} />;
    case DeviceType.PC: return <Monitor size={24} />;
    case DeviceType.SERVER: return <Server size={24} />;
    case DeviceType.PRINTER: return <Printer size={24} />;
    case DeviceType.IOT_DEVICE: return <Cpu size={24} />;
    case DeviceType.INTERNET: return <Globe size={24} className="text-blue-300" />;
    // New Security Devices
    case DeviceType.IDS: return <Eye size={24} className="text-yellow-400" />;
    case DeviceType.IPS: return <ShieldAlert size={24} className="text-orange-500" />;
    case DeviceType.WAF: return <AppWindow size={24} className="text-indigo-400" />;
    case DeviceType.LOAD_BALANCER: return <Scale size={24} className="text-blue-400" />;
    case DeviceType.BASTION_HOST: return <Lock size={24} className="text-green-400" />;
    default: return <Monitor size={24} />;
  }
};

const CustomDeviceNode = ({ data, selected }: NodeProps<NetworkDeviceData>) => {
  const isConfigured = data.configMode === 'STATIC' ? !!data.ip : true;
  const hasError = data.status === 'error';
  const isInfected = data.infectionState === 'infected';
  const isCrashed = data.infectionState === 'crashed';

  return (
    <div
      className={clsx(
        "relative flex flex-col items-center justify-center p-3 rounded-lg shadow-md transition-all duration-500 border-2 min-w-[80px] cursor-grab active:cursor-grabbing",
        selected ? "border-blue-500 bg-gray-700 shadow-blue-500/20" : "border-gray-600 bg-gray-800",
        hasError && "border-red-500",
        isInfected && "border-red-600 bg-red-900/50 animate-pulse ring-4 ring-red-500/20",
        isCrashed && "border-gray-700 bg-gray-900 grayscale opacity-75"
      )}
    >
      {/* Status Indicator */}
      <div className={clsx(
        "absolute top-1 right-1 w-2 h-2 rounded-full transition-colors duration-300",
        isInfected ? "bg-red-600 animate-ping" : (hasError ? "bg-red-500" : (isConfigured ? "bg-green-400" : "bg-yellow-400"))
      )} />
      
      {isInfected && <div className="absolute -top-3 -right-3 bg-red-600 rounded-full p-1 shadow text-white"><Skull size={12}/></div>}

      <div className="text-gray-200 mb-2 transition-transform duration-300 hover:scale-110 pointer-events-none">
        {getIcon(data.type)}
      </div>
      
      <div className="text-xs font-bold text-gray-100 text-center whitespace-nowrap pointer-events-none">
        {data.hostname}
      </div>
      
      {data.ip && (
        <div className="text-[10px] text-gray-400 font-mono mt-1 bg-gray-900 px-1 rounded opacity-80 pointer-events-none">
          {data.ip}{data.type === DeviceType.ROUTER ? `/${data.cidr}` : ''}
        </div>
      )}

      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-3 !h-3 !border-2 !border-gray-800 hover:!bg-blue-500 transition-colors" />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-3 !h-3 !border-2 !border-gray-800 hover:!bg-blue-500 transition-colors" />
      <Handle type="target" position={Position.Left} className="!bg-gray-400 !w-3 !h-3 !border-2 !border-gray-800 hover:!bg-blue-500 transition-colors" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400 !w-3 !h-3 !border-2 !border-gray-800 hover:!bg-blue-500 transition-colors" />
    </div>
  );
};

export default memo(CustomDeviceNode);