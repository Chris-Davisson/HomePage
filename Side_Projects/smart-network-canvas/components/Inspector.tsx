import React, { useEffect, useState } from 'react';
import { Edge } from 'reactflow';
import { NetworkNode, DeviceType, FirewallRule, NatRule, EdgeData, AuditResult } from '../types';
import { isValidIp, getSubnetRange } from '../services/networkUtils';
import { 
    Settings, Info, Activity, Network, Trash2, Cable, Hash, 
    Globe, Shield, List, Plus, X, Router, ArrowLeftRight, 
    Skull, PlayCircle, FileText, Lock, Unlock, Wrench
} from 'lucide-react';

interface InspectorProps {
  selectedNode: NetworkNode | null;
  selectedEdge: Edge | null;
  updateNodeData: (id: string, data: any) => void;
  updateEdgeData: (id: string, data: any) => void;
  onDeleteEdge: (id: string) => void;
  onRunAttack: (type: 'RANSOMWARE' | 'DDOS', targetId: string) => void;
  auditResults: AuditResult[] | null;
  nodes: NetworkNode[];
  onFixIssue: (auditId: string) => void;
}

const Inspector: React.FC<InspectorProps> = ({ 
    selectedNode, selectedEdge, updateNodeData, updateEdgeData, onDeleteEdge, onRunAttack, auditResults, nodes, onFixIssue
}) => {
  const [localData, setLocalData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'config' | 'firewall' | 'nat'>('config');

  useEffect(() => {
    if (selectedNode) {
      setLocalData({ ...selectedNode.data });
      setActiveTab('config');
    }
  }, [selectedNode]);

  const handleChange = (field: string, value: any) => {
    setLocalData((prev: any) => {
      const newData = { ...prev, [field]: value };
      updateNodeData(selectedNode!.id, newData);
      return newData;
    });
  };
  
  const handleEdgeChange = (field: string, value: any) => {
      if (selectedEdge) {
          const newData = { ...(selectedEdge.data || {}), [field]: value };
          updateEdgeData(selectedEdge.id, newData);
      }
  };

  // Helper for adding firewall rules
  const addFirewallRule = () => {
      const newRule: FirewallRule = {
          id: Math.random().toString(36).substr(2, 5).toUpperCase(),
          action: 'ALLOW',
          protocol: 'ANY',
          port: 'ANY',
          source: 'ANY',
          destination: 'ANY'
      };
      const currentRules = localData.firewallRules || [];
      handleChange('firewallRules', [...currentRules, newRule]);
  };

  const removeFirewallRule = (id: string) => {
      const currentRules = localData.firewallRules || [];
      handleChange('firewallRules', currentRules.filter((r: FirewallRule) => r.id !== id));
  };

  const updateFirewallRule = (id: string, field: keyof FirewallRule, value: string) => {
      const currentRules = localData.firewallRules || [];
      const updated = currentRules.map((r: FirewallRule) => r.id === id ? { ...r, [field]: value } : r);
      handleChange('firewallRules', updated);
  };

  // Helper for adding NAT rules
  const addNatRule = () => {
      const newRule: NatRule = {
          id: Math.random().toString(36).substr(2, 5).toUpperCase(),
          protocol: 'TCP',
          publicPort: 80,
          privateIp: '',
          privatePort: 80
      };
      const currentRules = localData.natRules || [];
      handleChange('natRules', [...currentRules, newRule]);
  };

  const removeNatRule = (id: string) => {
      const currentRules = localData.natRules || [];
      handleChange('natRules', currentRules.filter((r: NatRule) => r.id !== id));
  };

    const updateNatRule = (id: string, field: keyof NatRule, value: any) => {
      const currentRules = localData.natRules || [];
      const updated = currentRules.map((r: NatRule) => r.id === id ? { ...r, [field]: value } : r);
      handleChange('natRules', updated);
  };


  // Edge Inspector
  if (selectedEdge && !selectedNode) {
      const edgeData = selectedEdge.data as EdgeData || {};
      return (
        <aside className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col h-full">
            <div className="p-5 border-b border-gray-700">
                <div className="flex items-center text-blue-400 mb-2">
                    <Cable size={20} className="mr-2" />
                    <span className="font-bold text-lg">Connection</span>
                </div>
                <p className="text-xs text-gray-500 font-mono">{selectedEdge.id}</p>
            </div>
            <div className="p-5 space-y-6">
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                    <div className="text-sm text-gray-300 mb-2 flex justify-between">
                        <span>Source:</span>
                        <span className="font-mono text-gray-400">{selectedEdge.source}</span>
                    </div>
                    <div className="text-sm text-gray-300 mb-4 flex justify-between">
                        <span>Target:</span>
                        <span className="font-mono text-gray-400">{selectedEdge.target}</span>
                    </div>
                    
                    {/* Protocol Selection */}
                    <div className="mb-4">
                        <label className="block text-xs text-gray-500 mb-1">Application Protocol</label>
                        <select 
                            value={edgeData.protocol || 'RAW'}
                            onChange={(e) => handleEdgeChange('protocol', e.target.value)}
                            className="w-full bg-gray-900 text-sm text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
                        >
                            <option value="RAW">Ethernet / Raw IP</option>
                            <option value="HTTP">HTTP (Unencrypted)</option>
                            <option value="HTTPS">HTTPS (Encrypted)</option>
                            <option value="SSH">SSH (Encrypted)</option>
                            <option value="TELNET">Telnet (Unencrypted)</option>
                            <option value="SMB">SMB (File Share)</option>
                        </select>
                    </div>
                    
                    <button 
                        onClick={() => onDeleteEdge(selectedEdge.id)}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow flex items-center justify-center transition-colors text-sm font-bold"
                    >
                        <Trash2 size={16} className="mr-2" /> Disconnect Link
                    </button>
                </div>
            </div>
        </aside>
      );
  }

  if (!selectedNode) {
    if (auditResults) {
        return (
             <aside className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col h-full overflow-y-auto">
                <div className="p-5 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
                    <h3 className="font-bold text-lg text-white flex items-center"><FileText className="mr-2"/> Audit Report</h3>
                </div>
                <div className="p-4 space-y-3">
                    {auditResults.map((res, idx) => {
                        const isFixable = res.id.startsWith('AUDIT-EDGE') || res.id.startsWith('AUDIT-RTR');
                        return (
                            <div key={idx} className={`p-3 rounded border ${res.severity === 'PASS' ? 'border-green-800 bg-green-900/20' : res.severity === 'CRITICAL' ? 'border-red-800 bg-red-900/20' : 'border-yellow-800 bg-yellow-900/20'}`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${res.severity === 'PASS' ? 'bg-green-600 text-white' : res.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'}`}>{res.severity}</span>
                                    {res.deviceLabel && <span className="text-xs text-gray-400">{res.deviceLabel}</span>}
                                </div>
                                <p className="text-sm text-gray-300 leading-snug">{res.message}</p>
                                
                                {isFixable && (
                                    <button 
                                        onClick={() => onFixIssue(res.id)}
                                        className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded flex items-center justify-center transition-all group shadow-md"
                                    >
                                        <Wrench size={12} className="mr-1.5 group-hover:rotate-45 transition-transform"/> 
                                        Auto-Fix Issue
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
             </aside>
        );
    }

    return (
      <aside className="w-80 bg-gray-900 border-l border-gray-700 p-6 flex flex-col justify-center items-center text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Settings className="text-gray-500" size={32} />
        </div>
        <h3 className="text-gray-300 font-medium text-lg mb-2">No Selection</h3>
        <p className="text-gray-500 text-sm">Select a device, zone, or connection to configure properties.</p>
      </aside>
    );
  }

  // --- ZONE INSPECTOR ---
  if (selectedNode.data.type === DeviceType.ZONE) {
      return (
        <aside className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col h-full">
            <div className="p-5 border-b border-gray-700">
                <h3 className="font-bold text-lg text-blue-400">Zone Configuration</h3>
            </div>
            <div className="p-5 space-y-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Zone Name</label>
                    <input 
                        type="text" 
                        value={localData.label || ''}
                        onChange={(e) => handleChange('label', e.target.value)}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Trust Level</label>
                    <select 
                        value={localData.zoneType || 'TRUSTED'}
                        onChange={(e) => handleChange('zoneType', e.target.value)}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700"
                    >
                        <option value="TRUSTED">Trusted (Internal)</option>
                        <option value="DMZ">DMZ (Semi-Public)</option>
                        <option value="UNTRUSTED">Untrusted (Public/Internet)</option>
                    </select>
                </div>
            </div>
        </aside>
      );
  }

  const isRouter = selectedNode.data.type === DeviceType.ROUTER;
  const isFirewall = selectedNode.data.type === DeviceType.FIREWALL || selectedNode.data.type === DeviceType.WAF;
  const isEndpoint = [DeviceType.PC, DeviceType.SERVER, DeviceType.IOT_DEVICE].includes(selectedNode.data.type);
  
  return (
    <aside className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col h-full overflow-y-auto">
      <div className="p-5 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
        <div className="flex items-center justify-between mb-1">
           <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{localData.type}</span>
           <span className="text-xs text-gray-500 font-mono">{selectedNode.id}</span>
        </div>
        <input 
            type="text" 
            value={localData.hostname || ''}
            onChange={(e) => handleChange('hostname', e.target.value)}
            className="w-full bg-transparent text-2xl font-bold text-white border-none focus:ring-0 p-0 placeholder-gray-600"
            placeholder="Hostname"
        />
        
        {/* Tab Navigation */}
        {(isFirewall || isRouter) && (
             <div className="flex mt-4 space-x-1 bg-gray-800 p-1 rounded">
                 <button 
                    onClick={() => setActiveTab('config')}
                    className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${activeTab === 'config' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                 >
                     Config
                 </button>
                 {isFirewall && (
                     <button 
                        onClick={() => setActiveTab('firewall')}
                        className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${activeTab === 'firewall' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                     >
                         ACL Rules
                     </button>
                 )}
                 {isRouter && (
                     <button 
                        onClick={() => setActiveTab('nat')}
                        className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${activeTab === 'nat' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                     >
                         NAT
                     </button>
                 )}
             </div>
        )}
      </div>

      <div className="p-5 space-y-6">
        
        {/* ATTACK SIMULATOR ACTIONS */}
        {isEndpoint && (
            <div className="border-b border-gray-700 pb-6 mb-2">
                <h4 className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center"><Skull size={14} className="mr-1"/> Red Team Tools</h4>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => onRunAttack('RANSOMWARE', selectedNode.id)}
                        className="bg-red-600 hover:bg-red-500 text-white shadow py-2 px-3 rounded text-xs font-bold flex flex-col items-center justify-center text-center transition-colors"
                    >
                        <PlayCircle size={16} className="mb-1"/>
                        Infect (SMB)
                    </button>
                    <button 
                        onClick={() => onRunAttack('DDOS', selectedNode.id)}
                        className="bg-orange-600 hover:bg-orange-500 text-white shadow py-2 px-3 rounded text-xs font-bold flex flex-col items-center justify-center text-center transition-colors"
                    >
                        <Activity size={16} className="mb-1"/>
                        DDoS Target
                    </button>
                </div>
            </div>
        )}

        {/* MAIN CONFIG TAB */}
        {activeTab === 'config' && (
            <>
                <div className="space-y-3">
                    <div className="flex items-center text-gray-300 font-semibold text-sm">
                        <Network size={16} className="mr-2" /> IP Configuration
                    </div>
                    
                    <div className="bg-gray-800 p-3 rounded border border-gray-700 space-y-3">
                        {isEndpoint && (
                            <div className="flex bg-gray-900 rounded p-1 mb-2">
                                <button 
                                    onClick={() => handleChange('configMode', 'DHCP')}
                                    className={`flex-1 py-1 text-xs rounded font-bold transition-colors ${localData.configMode === 'DHCP' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    DHCP
                                </button>
                                <button 
                                    onClick={() => handleChange('configMode', 'STATIC')}
                                    className={`flex-1 py-1 text-xs rounded font-bold transition-colors ${localData.configMode === 'STATIC' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    Static
                                </button>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">IP Address</label>
                            <input 
                                type="text" 
                                value={localData.ip || ''}
                                disabled={isEndpoint && localData.configMode === 'DHCP'}
                                onChange={(e) => handleChange('ip', e.target.value)}
                                className={`w-full bg-gray-900 text-sm text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                                placeholder={isEndpoint && localData.configMode === 'DHCP' ? "Obtaining IP..." : "e.g. 192.168.1.10"}
                            />
                        </div>

                        {isRouter && (
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">CIDR / Subnet Mask</label>
                                <select 
                                    value={localData.cidr || 24}
                                    onChange={(e) => handleChange('cidr', parseInt(e.target.value))}
                                    className="w-full bg-gray-900 text-sm text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
                                >
                                    {[8, 16, 24, 26, 28, 30, 32].map(cidr => (
                                        <option key={cidr} value={cidr}>/{cidr}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        {isEndpoint && (
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Gateway</label>
                                <input 
                                    type="text" 
                                    value={localData.gateway || ''}
                                    disabled={localData.configMode === 'DHCP'}
                                    onChange={(e) => handleChange('gateway', e.target.value)}
                                    className="w-full bg-gray-900 text-sm text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </>
        )}

        {/* FIREWALL TAB */}
        {activeTab === 'firewall' && (
            <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Access Control List</span>
                    <button onClick={addFirewallRule} className="p-1 bg-blue-600 text-white rounded hover:bg-blue-500 shadow">
                        <Plus size={14} />
                    </button>
                </div>
                
                <div className="space-y-2">
                    {(!localData.firewallRules || localData.firewallRules.length === 0) && (
                        <div className="text-xs text-gray-500 italic text-center py-4 border border-dashed border-gray-700 rounded">
                            No rules defined (Default: Allow)
                        </div>
                    )}
                    {localData.firewallRules?.map((rule: FirewallRule, idx: number) => (
                        <div key={rule.id} className="bg-gray-800 border border-gray-700 rounded p-2 text-xs">
                             <div className="flex justify-between items-center mb-2">
                                 <span className="font-bold text-gray-500">Rule #{idx + 1}</span>
                                 <button onClick={() => removeFirewallRule(rule.id)} className="text-red-500 hover:text-red-400"><X size={12}/></button>
                             </div>
                             <div className="grid grid-cols-2 gap-2 mb-2">
                                 <select 
                                    value={rule.action} 
                                    onChange={(e) => updateFirewallRule(rule.id, 'action', e.target.value)}
                                    className={`bg-gray-900 border border-gray-700 rounded px-1 py-1 font-bold ${rule.action === 'ALLOW' ? 'text-green-400' : 'text-red-400'}`}
                                 >
                                     <option value="ALLOW">ALLOW</option>
                                     <option value="DENY">DENY</option>
                                 </select>
                                 <select 
                                     value={rule.protocol} 
                                     onChange={(e) => updateFirewallRule(rule.id, 'protocol', e.target.value)}
                                     className="bg-gray-900 border border-gray-700 rounded px-1 py-1 text-white"
                                 >
                                     <option value="ANY">ANY</option>
                                     <option value="TCP">TCP</option>
                                     <option value="UDP">UDP</option>
                                     <option value="ICMP">ICMP</option>
                                 </select>
                             </div>
                             {/* Source/Dest inputs - kept simple for now */}
                             <div className="space-y-1">
                                 <input 
                                    type="text" 
                                    value={rule.port || 'ANY'} 
                                    placeholder="Port (e.g. 80, 445)"
                                    onChange={(e) => updateFirewallRule(rule.id, 'port', e.target.value)}
                                    className="w-full bg-gray-900 border-gray-700 rounded px-1 py-0.5 text-gray-300" 
                                 />
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

         {/* NAT TAB */}
         {activeTab === 'nat' && (
            <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Port Forwarding</span>
                    <button onClick={addNatRule} className="p-1 bg-blue-600 text-white rounded hover:bg-blue-500 shadow">
                        <Plus size={14} />
                    </button>
                </div>
                 {/* Simplified NAT display */}
                 {localData.natRules?.map((rule: NatRule) => (
                     <div key={rule.id} className="bg-gray-800 p-2 rounded text-xs">
                        Forward Port {rule.publicPort} to {rule.privateIp}:{rule.privatePort}
                     </div>
                 ))}
            </div>
         )}

      </div>
    </aside>
  );
};

export default Inspector;