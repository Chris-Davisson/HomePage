import React, { memo } from 'react';
import { NodeProps, NodeResizer } from 'reactflow';
import { NetworkDeviceData } from '../types';
import clsx from 'clsx';

const ZoneNode = ({ data, selected }: NodeProps<NetworkDeviceData>) => {
  const zoneColors = {
    'TRUSTED': 'border-green-500/50 bg-green-900/10',
    'DMZ': 'border-yellow-500/50 bg-yellow-900/10',
    'UNTRUSTED': 'border-red-500/50 bg-red-900/10'
  };

  const colorClass = data.zoneType ? zoneColors[data.zoneType] : 'border-gray-500/50 bg-gray-500/10';

  return (
    <>
      <NodeResizer 
        isVisible={selected} 
        minWidth={100} 
        minHeight={100} 
        lineClassName="border-blue-500" 
        handleClassName="h-3 w-3 bg-blue-500 border-2 border-white rounded"
      />
      <div
        className={clsx(
          "w-full h-full border-2 border-dashed rounded-xl flex flex-col items-start p-2",
          colorClass,
          selected && "border-solid ring-2 ring-blue-500/50"
        )}
        style={{ minWidth: '100%', minHeight: '100%' }}
      >
         <span className={clsx(
             "text-xs font-bold uppercase tracking-widest px-2 py-1 rounded",
             data.zoneType === 'TRUSTED' ? "text-green-100 bg-green-600" : 
             data.zoneType === 'DMZ' ? "text-yellow-100 bg-yellow-600" :
             data.zoneType === 'UNTRUSTED' ? "text-red-100 bg-red-600" : "text-gray-100 bg-gray-600"
         )}>
             {data.label}
         </span>
      </div>
    </>
  );
};

export default memo(ZoneNode);