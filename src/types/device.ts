export interface Device {
  id: string;
  type: string;
  status: 'active' | 'inactive';
  lastReading?: {
    temperature?: number;
    humidity?: number;
    motion_detected?: boolean;
    power_consumption?: number;
    [key: string]: any;
  };
} 