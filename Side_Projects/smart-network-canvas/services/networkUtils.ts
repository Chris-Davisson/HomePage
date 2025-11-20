import { Node, Edge } from 'reactflow';
import { DeviceType, NetworkNode, FirewallRule, AuditResult, EdgeData } from '../types';

/**
 * Converts an IP address string to a long integer.
 */
export const ipToLong = (ip: string): number => {
  const parts = ip.split('.');
  if (parts.length !== 4) return 0;
  return ((parseInt(parts[0], 10) << 24) |
          (parseInt(parts[1], 10) << 16) |
          (parseInt(parts[2], 10) << 8) |
          parseInt(parts[3], 10)) >>> 0;
};

/**
 * Converts a long integer back to an IP address string.
 */
export const longToIp = (long: number): string => {
  return [
    (long >>> 24) & 0xff,
    (long >>> 16) & 0xff,
    (long >>> 8) & 0xff,
    long & 0xff
  ].join('.');
};

/**
 * Calculates the network address for a given IP and CIDR.
 */
export const getNetworkAddress = (ip: string, cidr: number): number => {
  const mask = ~((1 << (32 - cidr)) - 1);
  return ipToLong(ip) & mask;
};

/**
 * Checks if two IP addresses are in the same subnet.
 */
export const areIpsInSameSubnet = (ip1: string, ip2: string, cidr: number): boolean => {
  if (!isValidIp(ip1) || !isValidIp(ip2)) return false;
  const net1 = getNetworkAddress(ip1, cidr);
  const net2 = getNetworkAddress(ip2, cidr);
  return net1 === net2;
};

/**
 * Validates if a string is a valid IPv4 address.
 */
export const isValidIp = (ip: string): boolean => {
  const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return regex.test(ip);
};

/**
 * Generates a random MAC address.
 */
export const generateMacAddress = (): string => {
  return 'XX:XX:XX:XX:XX:XX'.replace(/X/g, () => {
    return "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16));
  });
};

/**
 * Calculate first and last usable IP in a subnet.
 */
export const getSubnetRange = (ip: string, cidr: number) => {
  const network = getNetworkAddress(ip, cidr);
  const broadcast = network | ((1 << (32 - cidr)) - 1);
  
  return {
    networkAddress: longToIp(network),
    broadcastAddress: longToIp(broadcast),
    firstUsable: longToIp(network + 1),
    lastUsable: longToIp(broadcast - 1),
    hostCount: Math.pow(2, 32 - cidr) - 2
  };
};

/**
 * Finds the first usable IP address in a subnet that is not in the usedIps list.
 */
export const getNextAvailableIp = (networkIp: string, cidr: number, usedIps: string[]): string | null => {
    if (!isValidIp(networkIp)) return null;
    const { firstUsable, lastUsable } = getSubnetRange(networkIp, cidr);
    const startLong = ipToLong(firstUsable);
    const endLong = ipToLong(lastUsable);
    const usedLongs = new Set(usedIps.map(ip => ipToLong(ip)));

    const limit = Math.min(endLong, startLong + 500); 

    for (let i = startLong; i <= limit; i++) {
        if (!usedLongs.has(i)) {
            return longToIp(i);
        }
    }
    return null;
};

/**
 * BFS to find a router connected to a node through L2 switches.
 */
export const findConnectedRouter = (startNodeId: string, nodes: NetworkNode[], edges: Edge[]): NetworkNode | null => {
    const visited = new Set<string>();
    const queue = [startNodeId];
    visited.add(startNodeId);

    while (queue.length > 0) {
        const currentId = queue.shift();
        const currentNode = nodes.find(n => n.id === currentId);
        
        if (currentNode?.data.type === DeviceType.ROUTER) {
            return currentNode;
        }

        const connectedEdges = edges.filter(e => e.source === currentId || e.target === currentId);
        for (const edge of connectedEdges) {
            const neighborId = edge.source === currentId ? edge.target : edge.source;
            const neighborNode = nodes.find(n => n.id === neighborId);
            
            const isInfrastructure = [DeviceType.SWITCH_L2, DeviceType.SWITCH_L3, DeviceType.ACCESS_POINT, DeviceType.IDS, DeviceType.IPS, DeviceType.WAF].includes(neighborNode?.data.type as DeviceType);
            
            if (neighborNode && (isInfrastructure || neighborNode.data.type === DeviceType.ROUTER)) {
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push(neighborId);
                }
            }
        }
    }
    return null;
};

/**
 * BFS to find path between two nodes.
 */
export const findPath = (startId: string, endId: string, nodes: NetworkNode[], edges: Edge[]): NetworkNode[] | null => {
    const queue: { id: string; path: string[] }[] = [{ id: startId, path: [startId] }];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
        const { id, path } = queue.shift()!;
        
        if (id === endId) {
             return path.map(pId => nodes.find(n => n.id === pId)).filter(n => n !== undefined) as NetworkNode[];
        }

        const connectedEdges = edges.filter(e => e.source === id || e.target === id);
        for (const edge of connectedEdges) {
            const neighborId = edge.source === id ? edge.target : edge.source;
            if (!visited.has(neighborId)) {
                visited.add(neighborId);
                queue.push({ id: neighborId, path: [...path, neighborId] });
            }
        }
    }
    return null;
};

/**
 * Checks firewall rules against a simulated packet.
 * Returns TRUE if allowed, FALSE if denied.
 */
export const checkFirewallRules = (rules: FirewallRule[] | undefined, srcIp: string, destIp: string, protocol: string = 'ICMP', port: string = 'ANY'): { allowed: boolean; reason: string } => {
    if (!rules || rules.length === 0) {
        return { allowed: true, reason: 'No Rules' };
    }

    for (const rule of rules) {
        const protocolMatch = rule.protocol === 'ANY' || rule.protocol === protocol; 
        const srcMatch = rule.source === 'ANY' || rule.source === srcIp;
        const destMatch = rule.destination === 'ANY' || rule.destination === destIp;
        const portMatch = rule.port === 'ANY' || rule.port === port;

        if (protocolMatch && srcMatch && destMatch && portMatch) {
            return { 
                allowed: rule.action === 'ALLOW', 
                reason: `Rule ${rule.id}: ${rule.action}` 
            };
        }
    }
    
    return { allowed: false, reason: 'Implicit Deny' };
};

// --- Advanced Simulation ---

/**
 * Simulates Ransomware/Lateral Movement propagation.
 * Returns a list of infected Node IDs.
 */
export const propagateInfection = (startNodeId: string, nodes: NetworkNode[], edges: Edge[]): string[] => {
    const infectedIds = new Set<string>([startNodeId]);
    const queue = [startNodeId];
    const startNode = nodes.find(n => n.id === startNodeId);

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentIp = nodes.find(n => n.id === currentId)?.data.ip || '0.0.0.0';
        
        // Find neighbors
        const connectedEdges = edges.filter(e => e.source === currentId || e.target === currentId);
        
        for (const edge of connectedEdges) {
            const neighborId = edge.source === currentId ? edge.target : edge.source;
            const neighborNode = nodes.find(n => n.id === neighborId);
            
            if (!neighborNode || infectedIds.has(neighborId)) continue;

            // Security Check: Is this neighbor a security device?
            if (neighborNode.data.type === DeviceType.IPS) {
                // IPS stops infection
                continue;
            }
            
            if (neighborNode.data.type === DeviceType.FIREWALL) {
                // Firewall Check - Logic: Can "SMB" (Port 445) pass?
                const neighborIp = neighborNode.data.ip || '0.0.0.0';
                const fwCheck = checkFirewallRules(neighborNode.data.firewallRules, currentIp, neighborIp, 'TCP', '445');
                if (!fwCheck.allowed) continue;
            }

            // If we pass security checks, the neighbor gets infected
            // Infrastructure devices (Switches) pass infection but don't "crash" usually, 
            // but for sim visual we mark them infected to show path.
            
            infectedIds.add(neighborId);
            queue.push(neighborId);
        }
    }
    return Array.from(infectedIds);
};

/**
 * Checks compliance audit rules.
 */
export const runComplianceAudit = (nodes: NetworkNode[], edges: Edge[]): AuditResult[] => {
    const results: AuditResult[] = [];

    // 1. Single Point of Failure Check (Firewalls)
    const firewalls = nodes.filter(n => n.data.type === DeviceType.FIREWALL);
    if (firewalls.length === 1) {
        results.push({
            id: 'AUDIT-01',
            severity: 'WARNING',
            message: 'Single Point of Failure detected: Only 1 Firewall present.',
            deviceLabel: firewalls[0].data.label
        });
    }

    // 2. Cleartext Protocols
    edges.forEach(edge => {
        const data = edge.data as EdgeData | undefined;
        if (data?.protocol === 'HTTP' || data?.protocol === 'TELNET') {
            results.push({
                id: `AUDIT-EDGE-${edge.id}`,
                severity: 'WARNING',
                message: `Insecure Protocol (${data.protocol}) detected on link.`,
                deviceLabel: `Link ${edge.id}`
            });
        }
    });

    // 3. Open Management (Mock check - implies Routers should check ACLs)
    nodes.filter(n => n.data.type === DeviceType.ROUTER).forEach(router => {
        // In a real app, we'd check if SSH is allowed from 0.0.0.0/0 in ACLs
        // Here we just mock a check if no ACLs exist
        if (!router.data.firewallRules || router.data.firewallRules.length === 0) {
             results.push({
                id: `AUDIT-RTR-${router.id}`,
                severity: 'CRITICAL',
                message: 'Router has no Access Control Lists (ACLs) defined. Management interfaces may be exposed.',
                deviceLabel: router.data.hostname
            });
        }
    });

    // 4. WAF Check
    const webServers = nodes.filter(n => n.data.label.toLowerCase().includes('web') || n.data.type === DeviceType.SERVER);
    const wafs = nodes.filter(n => n.data.type === DeviceType.WAF);
    
    if (webServers.length > 0 && wafs.length === 0) {
         results.push({
            id: 'AUDIT-WAF-01',
            severity: 'WARNING',
            message: 'Web Servers detected but no WAF (Web Application Firewall) found.',
            deviceLabel: 'General'
        });
    }

    if (results.length === 0) {
        results.push({ id: 'AUDIT-PASS', severity: 'PASS', message: 'No major compliance issues found.' });
    }

    return results;
};

/**
 * Checks for DDoS Resilience (WAF/LB).
 */
export const checkDDoSResilience = (targetNodeId: string, nodes: NetworkNode[], edges: Edge[]): boolean => {
    // Find path from Internet to Target
    const internet = nodes.find(n => n.data.type === DeviceType.INTERNET);
    if (!internet) return false; // No internet, no DDoS from outside

    const path = findPath(internet.id, targetNodeId, nodes, edges);
    if (!path) return true; // Not reachable, so "safe" from external DDoS

    // Check if WAF or Load Balancer exists in path
    const hasProtection = path.some(n => n.data.type === DeviceType.WAF || n.data.type === DeviceType.LOAD_BALANCER);
    return hasProtection;
};