import { Node, Edge } from 'reactflow';

export enum DeviceType {
  ROUTER = 'ROUTER',
  SWITCH_L3 = 'SWITCH_L3',
  SWITCH_L2 = 'SWITCH_L2',
  FIREWALL = 'FIREWALL',
  ACCESS_POINT = 'ACCESS_POINT',
  PC = 'PC',
  SERVER = 'SERVER',
  PRINTER = 'PRINTER',
  IOT_DEVICE = 'IOT_DEVICE',
  INTERNET = 'INTERNET',
  // Security & Middleboxes
  IDS = 'IDS',
  IPS = 'IPS',
  WAF = 'WAF',
  LOAD_BALANCER = 'LOAD_BALANCER',
  BASTION_HOST = 'BASTION_HOST',
  // Zones
  ZONE = 'ZONE'
}

export interface FirewallRule {
  id: string;
  action: 'ALLOW' | 'DENY';
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'ANY';
  port: string;
  source: string;
  destination: string;
}

export interface NatRule {
  id: string;
  publicPort: number;
  privateIp: string;
  privatePort: number;
  protocol: 'TCP' | 'UDP';
}

export interface NetworkInterface {
  id: string;
  name: string;
  ipAddress: string;
  subnetMask: string; 
  cidr: number; 
  connectedTo?: string; 
  isUp: boolean;
}

export interface NetworkDeviceData {
  label: string;
  type: DeviceType;
  hostname: string;
  ip?: string; 
  cidr?: number;
  isDhcpServer?: boolean;
  dhcpRangeStart?: string;
  dhcpRangeEnd?: string;
  configMode?: 'DHCP' | 'STATIC';
  gateway?: string;
  macAddress?: string;
  dns?: string;
  vlan?: number;
  status?: 'online' | 'offline' | 'error';
  infectionState?: 'clean' | 'infected' | 'crashed';
  customIcon?: string;
  firewallRules?: FirewallRule[];
  natRules?: NatRule[];
  // Zone properties
  zoneType?: 'TRUSTED' | 'DMZ' | 'UNTRUSTED';
  width?: number;
  height?: number;
}

export type NetworkNode = Node<NetworkDeviceData>;

export interface SimulationResult {
  success: boolean;
  path: string[];
  latency: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface AuditResult {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'PASS';
  message: string;
  deviceLabel?: string;
}

export interface DeviceDefinition {
  type: DeviceType;
  label: string;
  category: 'Infrastructure' | 'Endpoints' | 'IoT' | 'Security' | 'Zones';
  defaultIcon: string;
}

export interface EdgeData {
  protocol?: 'HTTP' | 'HTTPS' | 'SSH' | 'TELNET' | 'SMB' | 'RAW';
  isEncrypted?: boolean;
}