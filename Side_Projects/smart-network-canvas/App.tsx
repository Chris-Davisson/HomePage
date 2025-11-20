import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  MarkerType,
  Panel,
  ReactFlowInstance
} from 'reactflow';
import { 
  Download, 
  Play, 
  Square, 
  Trash2, 
  Maximize, 
  Wifi,
  AlertTriangle,
  Skull,
  CheckCircle,
  ShieldCheck,
  ShieldPlus
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Inspector from './components/Inspector';
import CustomDeviceNode from './components/CustomDeviceNode';
import ZoneNode from './components/ZoneNode';
import { DeviceType, NetworkNode, NetworkDeviceData, AuditResult, FirewallRule } from './types';
import { 
    generateMacAddress, isValidIp, areIpsInSameSubnet, findConnectedRouter, getNextAvailableIp, 
    findPath, checkFirewallRules, propagateInfection, checkDDoSResilience, runComplianceAudit 
} from './services/networkUtils';

const nodeTypes = {
  customDevice: CustomDeviceNode,
  zoneNode: ZoneNode
};

const initialNodes: NetworkNode[] = [];
const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `dndnode_${id++}`;

const NetworkCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [pingSource, setPingSource] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<{msg: string, type: 'success' | 'error' | 'warning'} | null>(null);
  const [auditResults, setAuditResults] = useState<AuditResult[] | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string } | null>(null);

  // --- Auto-Configuration Helpers ---
  
  const autoConfigureNode = (nodeId: string, currentNodes: NetworkNode[], currentEdges: Edge[]) => {
    const node = currentNodes.find(n => n.id === nodeId);
    if (!node) return null;
    
    const isEndpoint = [DeviceType.PC, DeviceType.SERVER, DeviceType.IOT_DEVICE, DeviceType.PRINTER].includes(node.data.type as DeviceType);
    if (isEndpoint && node.data.configMode === 'DHCP' && !node.data.ip) {
        const router = findConnectedRouter(nodeId, currentNodes, currentEdges);
        if (router && router.data.ip && router.data.cidr) {
            const usedIps = currentNodes.map(n => n.data.ip).filter(ip => !!ip) as string[];
            const nextIp = getNextAvailableIp(router.data.ip, router.data.cidr, usedIps);
            
            if (nextIp) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ip: nextIp,
                        gateway: router.data.ip,
                        status: 'online' as const
                    }
                };
            }
        }
    }
    return null;
  };

  const onConnect = useCallback((params: Connection) => {
    let strokeColor = '#b1b1b7';
    
    const newEdge = { 
        ...params, 
        id: `e${params.source}-${params.target}`,
        type: 'smoothstep', 
        animated: false,
        style: { stroke: strokeColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor }
    } as Edge;

    setEdges((eds) => {
        const updatedEdges = addEdge(newEdge, eds);
        setTimeout(() => {
            setNodes((currentNodes) => {
                let nodesChanged = false;
                const newNodes = currentNodes.map(n => {
                    if (n.id === params.source || n.id === params.target) {
                        const updated = autoConfigureNode(n.id, currentNodes, updatedEdges);
                        if (updated) {
                            nodesChanged = true;
                            return updated;
                        }
                    }
                    return n;
                });
                return nodesChanged ? newNodes : currentNodes;
            });
        }, 100); 
        return updatedEdges;
    });
  }, [setNodes, setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow') as DeviceType;
      const label = event.dataTransfer.getData('application/label');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const isRouter = type === DeviceType.ROUTER;
      const isZone = type === DeviceType.ZONE;
      
      const newNodeId = getId();
      
      const newNode: NetworkNode = {
        id: newNodeId,
        type: isZone ? 'zoneNode' : 'customDevice',
        position,
        data: { 
            label: `${label}`,
            type: type,
            hostname: isZone ? label : `${label}-${newNodeId.split('_')[1]}`, 
            status: 'online',
            ip: isRouter ? '192.168.1.1' : undefined,
            cidr: isRouter ? 24 : undefined,
            configMode: 'DHCP',
            macAddress: isZone ? undefined : generateMacAddress(),
            gateway: '',
            isDhcpServer: isRouter,
            vlan: 1,
            zoneType: 'TRUSTED',
            infectionState: 'clean'
        },
        zIndex: isZone ? -1 : 10,
        width: isZone ? 300 : undefined,
        height: isZone ? 200 : undefined
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    if (contextMenu) setContextMenu(null);
    
    if (isSimulationMode) {
      handleSimulationClick(node.id);
    } else {
      setSelectedNodeId(node.id);
      setSelectedEdgeId(null);
      setAuditResults(null);
    }
  };
  
  const onNodeContextMenu = (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({ 
          x: event.clientX, 
          y: event.clientY, 
          nodeId: node.id 
      });
      setSelectedNodeId(node.id);
  };

  const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
      if (!isSimulationMode) {
          setSelectedEdgeId(edge.id);
          setSelectedNodeId(null);
          setAuditResults(null);
      }
      setContextMenu(null);
  };

  const onPaneClick = () => {
    if (!isSimulationMode) {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setAuditResults(null);
    }
    setContextMenu(null);
  };
  
  const onDeleteEdge = (id: string) => {
      setEdges((eds) => eds.filter(e => e.id !== id));
      setSelectedEdgeId(null);
  };

  const updateNodeData = (id: string, newData: Partial<NetworkDeviceData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  };
  
  const updateEdgeData = (id: string, newData: any) => {
      setEdges((eds) => eds.map(e => e.id === id ? { ...e, data: { ...e.data, ...newData } } : e));
  };

  // --- Simulation Logic ---

  const handleSimulationClick = (nodeId: string) => {
    if (!pingSource) {
        setPingSource(nodeId);
        setSimulationResult({ msg: "Select destination...", type: 'success' });
    } else {
        if (pingSource === nodeId) {
            setPingSource(null);
            setSimulationResult(null);
            return;
        }
        runPingSimulation(pingSource, nodeId);
        setPingSource(null);
    }
  };

  const runPingSimulation = (sourceId: string, targetId: string) => {
    const source = nodes.find(n => n.id === sourceId);
    const target = nodes.find(n => n.id === targetId);
    if (!source || !target) return;

    if (!source.data.ip || !target.data.ip) {
        setSimulationResult({ msg: "Ping Failed: Missing IP Configuration", type: 'error' });
        return;
    }

    const path = findPath(sourceId, targetId, nodes, edges);
    if (!path) {
         setSimulationResult({ msg: "Request timed out. (No physical path)", type: 'error' });
         return;
    }

    for (const node of path) {
        if (node.data.type === DeviceType.FIREWALL) {
            const result = checkFirewallRules(node.data.firewallRules, source.data.ip, target.data.ip);
            if (!result.allowed) {
                setSimulationResult({ msg: `Blocked by Firewall (${result.reason})`, type: 'error' });
                return;
            }
        }
    }

    const isSameSubnet = areIpsInSameSubnet(source.data.ip, target.data.ip, 24);
    if (isSameSubnet || (source.data.gateway && target.data.gateway)) {
        setSimulationResult({ msg: `Reply from ${target.data.ip}: bytes=32 time=${isSameSubnet ? '<1ms' : '12ms'} TTL=64`, type: 'success' });
    } else {
        setSimulationResult({ msg: `Request timed out. (No Route)`, type: 'error' });
    }
  };
  
  const runInfectionSimulation = (startNodeId: string) => {
      const infectedIds = propagateInfection(startNodeId, nodes, edges);
      
      setNodes(nds => nds.map(n => {
          if (infectedIds.includes(n.id)) {
              return { ...n, data: { ...n.data, infectionState: 'infected' } };
          }
          return n;
      }));
      
      setSimulationResult({ msg: `Ransomware Simulation: ${infectedIds.length} devices compromised!`, type: 'error' });
      setContextMenu(null);
  };
  
  const runDDoSAttack = (targetId: string) => {
      const resilient = checkDDoSResilience(targetId, nodes, edges);
      
      if (resilient) {
          setSimulationResult({ msg: "DDoS Mitigation Successful! WAF/Load Balancer absorbed traffic.", type: 'success' });
      } else {
          setNodes(nds => nds.map(n => n.id === targetId ? { ...n, data: { ...n.data, infectionState: 'crashed' } } : n));
          setSimulationResult({ msg: "DDoS Successful! Target crashed (No Mitigation found).", type: 'error' });
      }
      setContextMenu(null);
  };
  
  const handleComplianceAudit = () => {
      const results = runComplianceAudit(nodes, edges);
      setAuditResults(results);
      setSelectedNodeId(null); // Deselect to show audit panel
  };
  
  // --- AUTO SECURE LOGIC ---
  const handleAutoSecure = () => {
      const internetNode = nodes.find(n => n.data.type === DeviceType.INTERNET);
      if (!internetNode) {
          setSimulationResult({ msg: "Auto-Secure: No Internet connection found to secure.", type: 'warning' });
          return;
      }
      
      // Find connection from Internet to Router
      const internetEdges = edges.filter(e => e.source === internetNode.id || e.target === internetNode.id);
      let securedCount = 0;
      let newNodes = [...nodes];
      let newEdges = [...edges];

      internetEdges.forEach(edge => {
          const neighborId = edge.source === internetNode.id ? edge.target : edge.source;
          const neighbor = nodes.find(n => n.id === neighborId);
          
          // If Internet connects directly to a Router, Intercept it!
          if (neighbor && neighbor.data.type === DeviceType.ROUTER) {
              // Calculate mid position
              const midX = (internetNode.position.x + neighbor.position.x) / 2;
              const midY = (internetNode.position.y + neighbor.position.y) / 2;
              
              const firewallId = `auto_fw_${id++}`;
              const firewallNode: NetworkNode = {
                  id: firewallId,
                  type: 'customDevice',
                  position: { x: midX, y: midY },
                  data: {
                      type: DeviceType.FIREWALL,
                      label: 'Perimeter FW',
                      hostname: `Firewall-${id}`,
                      status: 'online',
                      infectionState: 'clean',
                      firewallRules: [
                          { id: 'AUTO-1', action: 'DENY', protocol: 'ANY', source: 'ANY', destination: 'ANY', port: 'ANY' },
                          { id: 'AUTO-2', action: 'ALLOW', protocol: 'TCP', source: 'ANY', destination: 'ANY', port: '80' },
                          { id: 'AUTO-3', action: 'ALLOW', protocol: 'TCP', source: 'ANY', destination: 'ANY', port: '443' }
                      ]
                  },
                  zIndex: 10
              };
              
              newNodes.push(firewallNode);
              
              // Remove old edge
              newEdges = newEdges.filter(e => e.id !== edge.id);
              
              // Add new edges
              newEdges.push({
                  id: `e-${internetNode.id}-${firewallId}`,
                  source: internetNode.id,
                  target: firewallId,
                  type: 'smoothstep',
                  style: { stroke: '#b1b1b7', strokeWidth: 2 }
              });
              
              newEdges.push({
                  id: `e-${firewallId}-${neighborId}`,
                  source: firewallId,
                  target: neighborId,
                  type: 'smoothstep',
                  style: { stroke: '#b1b1b7', strokeWidth: 2 }
              });
              
              securedCount++;
          }
      });
      
      if (securedCount > 0) {
          setNodes(newNodes);
          setEdges(newEdges);
          setSimulationResult({ msg: `Auto-Secure: Added ${securedCount} Perimeter Firewalls.`, type: 'success' });
      } else {
          setSimulationResult({ msg: "Auto-Secure: Network is already segmented or no direct Internet-Router links found.", type: 'success' });
      }
  };
  
  const handleFixAuditIssue = (auditId: string) => {
      // Fix EDGE Protocol Issues
      if (auditId.startsWith('AUDIT-EDGE')) {
          const edgeId = auditId.replace('AUDIT-EDGE-', '');
          let updatedEdges: Edge[] = [];
          
          setEdges(eds => {
             updatedEdges = eds.map(e => {
                  if (e.id === edgeId) {
                      const currentProto = (e.data as any)?.protocol;
                      // Upgrade insecure protocols
                      let newProto = currentProto;
                      if (currentProto === 'HTTP') newProto = 'HTTPS';
                      if (currentProto === 'TELNET') newProto = 'SSH';
                      
                      return { ...e, data: { ...e.data, protocol: newProto, isEncrypted: true } };
                  }
                  return e;
              });
              return updatedEdges;
          });
          
          // Run audit again with new edges
          setTimeout(() => {
            const results = runComplianceAudit(nodes, updatedEdges);
            setAuditResults(results);
          }, 50);
      }
      
      // Fix Router ACL Issues
      if (auditId.startsWith('AUDIT-RTR')) {
          const nodeId = auditId.replace('AUDIT-RTR-', '');
          let updatedNodes: NetworkNode[] = [];
          
          setNodes(nds => {
              updatedNodes = nds.map(n => {
                  if (n.id === nodeId) {
                       const newRule: FirewallRule = {
                          id: `FIX-${Math.floor(Math.random()*1000)}`,
                          action: 'ALLOW',
                          protocol: 'ANY',
                          port: 'ANY',
                          source: 'ANY',
                          destination: 'ANY'
                      };
                      return { ...n, data: { ...n.data, firewallRules: [newRule] } };
                  }
                  return n;
              });
              return updatedNodes;
          });
          
          // Run audit again with new nodes
          setTimeout(() => {
            const results = runComplianceAudit(updatedNodes, edges);
            setAuditResults(results);
          }, 50);
      }
  };
  
  const resetSimulations = () => {
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, infectionState: 'clean' } })));
      setSimulationResult(null);
  };

  const validatedEdges = useMemo(() => {
    return edges.map(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        const isSelected = edge.id === selectedEdgeId;
        
        let stroke = isSelected ? '#60a5fa' : '#64748b'; 
        let strokeWidth = isSelected ? 3 : 2;
        let strokeDasharray = '';
        let animation = false;

        if (isSimulationMode) {
            stroke = '#3b82f6'; 
            if (pingSource === edge.source || pingSource === edge.target) {
                animation = true;
                stroke = '#10b981'; 
            }
        } else if (source && target && source.data.ip && target.data.ip) {
            const valid = areIpsInSameSubnet(source.data.ip, target.data.ip, 24);
            const bothEndpoints = source.data.type !== DeviceType.ROUTER && target.data.type !== DeviceType.ROUTER;
            
            if (!valid && bothEndpoints) {
                stroke = '#ef4444'; 
                strokeDasharray = '5 5';
            }
        }

        return {
            ...edge,
            animated: animation,
            style: { stroke, strokeWidth, strokeDasharray }
        };
    });
  }, [edges, nodes, isSimulationMode, pingSource, selectedEdgeId]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;
  const selectedEdge = edges.find(e => e.id === selectedEdgeId) || null;

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-white overflow-hidden font-sans" onClick={() => setContextMenu(null)}>
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative h-full">
        <header className="h-14 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-800 p-1 rounded-lg flex border border-gray-700">
                <button 
                    onClick={() => setIsSimulationMode(false)}
                    className={`px-3 py-1.5 text-xs font-bold rounded flex items-center transition-all ${!isSimulationMode ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
                >
                    <Square size={14} className="mr-2" /> Design
                </button>
                <button 
                    onClick={() => setIsSimulationMode(true)}
                    className={`px-3 py-1.5 text-xs font-bold rounded flex items-center transition-all ${isSimulationMode ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
                >
                    <Play size={14} className="mr-2" /> Simulate
                </button>
            </div>
            <div className="h-6 w-px bg-gray-700 mx-1"></div>
             <button 
                onClick={handleComplianceAudit}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-bold flex items-center transition-colors shadow-sm"
            >
                <ShieldCheck size={14} className="mr-2" /> Compliance Audit
            </button>
            <button 
                onClick={handleAutoSecure}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold flex items-center transition-colors shadow-sm"
            >
                <ShieldPlus size={14} className="mr-2" /> Auto Secure
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-red-900/50 hover:text-red-400 rounded text-gray-400 transition-colors" title="Clear Canvas" onClick={() => { setNodes([]); setEdges([]); }}>
                <Trash2 size={18} />
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded text-xs font-bold border border-slate-600 flex items-center transition-colors">
                <Download size={14} className="mr-2" /> Export
            </button>
          </div>
        </header>

        <div className="flex-1 relative bg-gray-900" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={validatedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid={true}
            snapGrid={[15, 15]}
            deleteKeyCode={['Backspace', 'Delete']}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
          >
            <Background color="#334155" variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls className="bg-gray-800 border border-gray-700 fill-white text-white" />
            
            {isSimulationMode && (
               <Panel position="top-center" className="m-4">
                   <div className="bg-gray-900/90 backdrop-blur-md border border-gray-600 px-6 py-3 rounded-full shadow-xl flex items-center space-x-4 animate-in slide-in-from-top-4">
                      <div className={`w-3 h-3 rounded-full ${pingSource ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                      <span className="text-sm font-mono text-gray-200">
                          {pingSource ? `Ping Source: Node ${pingSource} (Select Dest)` : 'Select a source device...'}
                      </span>
                   </div>
               </Panel>
            )}
            
            {simulationResult && (
                <Panel position="bottom-center" className="m-8">
                     <div className={`px-6 py-4 rounded shadow-2xl border flex items-center ${simulationResult.type === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' : simulationResult.type === 'error' ? 'bg-red-900/90 border-red-500 text-red-100' : 'bg-yellow-900/90 border-yellow-500 text-yellow-100'}`}>
                        {simulationResult.type === 'error' && <AlertTriangle size={20} className="mr-3" />}
                        {simulationResult.type === 'success' && <Wifi size={20} className="mr-3" />}
                        <span className="font-mono text-sm">{simulationResult.msg}</span>
                        {simulationResult.type === 'error' && (
                            <button onClick={resetSimulations} className="ml-4 text-xs underline hover:no-underline">Reset</button>
                        )}
                        <button onClick={() => setSimulationResult(null)} className="ml-4 opacity-50 hover:opacity-100">✕</button>
                     </div>
                </Panel>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <div 
                    style={{ top: contextMenu.y, left: contextMenu.x }} 
                    className="fixed z-50 bg-gray-800 border border-gray-700 shadow-xl rounded-lg py-1 min-w-[160px]"
                >
                    <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 flex items-center"
                        onClick={() => { setPingSource(contextMenu.nodeId); setIsSimulationMode(true); setContextMenu(null); }}
                    >
                        <Wifi size={14} className="mr-2 text-green-400" /> Ping from Here
                    </button>
                    <div className="h-px bg-gray-700 my-1"></div>
                    <div className="px-4 py-1 text-[10px] font-bold text-red-500 uppercase tracking-widest">Red Team</div>
                    <button 
                        className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-gray-700 flex items-center"
                        onClick={() => runInfectionSimulation(contextMenu.nodeId)}
                    >
                        <Skull size={14} className="mr-2" /> Compromise Node
                    </button>
                     <button 
                        className="w-full text-left px-4 py-2 text-sm text-orange-300 hover:bg-gray-700 flex items-center"
                        onClick={() => runDDoSAttack(contextMenu.nodeId)}
                    >
                        <AlertTriangle size={14} className="mr-2" /> DDoS Attack
                    </button>
                </div>
            )}
          </ReactFlow>
        </div>
      </div>

      <Inspector 
        selectedNode={selectedNode} 
        selectedEdge={selectedEdge}
        updateNodeData={updateNodeData} 
        updateEdgeData={updateEdgeData}
        onDeleteEdge={onDeleteEdge}
        onRunAttack={(type, id) => type === 'RANSOMWARE' ? runInfectionSimulation(id) : runDDoSAttack(id)}
        auditResults={auditResults}
        nodes={nodes}
        onFixIssue={handleFixAuditIssue}
      />
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <NetworkCanvas />
    </ReactFlowProvider>
  );
}