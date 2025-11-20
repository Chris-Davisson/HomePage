import { DeviceDefinition, DeviceType } from './types';

export const DEVICE_LIBRARY: DeviceDefinition[] = [
  // Infrastructure
  { type: DeviceType.ROUTER, label: 'Router', category: 'Infrastructure', defaultIcon: 'Router' },
  { type: DeviceType.SWITCH_L3, label: 'L3 Switch', category: 'Infrastructure', defaultIcon: 'ArrowLeftRight' },
  { type: DeviceType.SWITCH_L2, label: 'Switch', category: 'Infrastructure', defaultIcon: 'ArrowLeftRight' },
  { type: DeviceType.ACCESS_POINT, label: 'Access Point', category: 'Infrastructure', defaultIcon: 'Wifi' },
  { type: DeviceType.LOAD_BALANCER, label: 'Load Balancer', category: 'Infrastructure', defaultIcon: 'Scale' },
  
  // Endpoints
  { type: DeviceType.PC, label: 'Workstation', category: 'Endpoints', defaultIcon: 'Monitor' },
  { type: DeviceType.SERVER, label: 'Server', category: 'Endpoints', defaultIcon: 'Server' },
  { type: DeviceType.PRINTER, label: 'Printer', category: 'Endpoints', defaultIcon: 'Printer' },
  { type: DeviceType.INTERNET, label: 'Internet', category: 'Endpoints', defaultIcon: 'Globe' },
  
  // Security
  { type: DeviceType.FIREWALL, label: 'Firewall', category: 'Security', defaultIcon: 'Shield' },
  { type: DeviceType.IDS, label: 'IDS Sensor', category: 'Security', defaultIcon: 'Eye' },
  { type: DeviceType.IPS, label: 'IPS Appliance', category: 'Security', defaultIcon: 'ShieldAlert' },
  { type: DeviceType.WAF, label: 'WAF', category: 'Security', defaultIcon: 'AppWindow' },
  { type: DeviceType.BASTION_HOST, label: 'Bastion Host', category: 'Security', defaultIcon: 'Lock' },
  
  // IoT
  { type: DeviceType.IOT_DEVICE, label: 'IoT Controller', category: 'IoT', defaultIcon: 'Cpu' },
  { type: DeviceType.IOT_DEVICE, label: 'Smart Light', category: 'IoT', defaultIcon: 'Lightbulb' },
  { type: DeviceType.IOT_DEVICE, label: 'IP Camera', category: 'IoT', defaultIcon: 'Video' },

  // Zones
  { type: DeviceType.ZONE, label: 'Zone Container', category: 'Zones', defaultIcon: 'BoxSelect' }
];

export const DEFAULT_CIDR = 24;
export const DEFAULT_IP_BLOCK = '192.168.1.1';