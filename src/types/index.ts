export interface Device {
  id: string;
  type: string;
  status: 'active' | 'inactive';
  readings?: {
    temperature?: number;
    humidity?: number;
    motion?: boolean;
    [key: string]: any;
  };
}

export interface DeviceCreate {
  type: string;
  status: 'active' | 'inactive';
}

export interface Room {
  number: number;
  devices: Device[];
}

export interface RoomCreate {
  number: number;
  devices: DeviceCreate[];
}

export interface Floor {
  number: number;
  rooms: Room[];
}

export interface FloorCreate {
  number: number;
  rooms: RoomCreate[];
}

export interface Building {
  id: string;
  name: string;
  type: 'office' | 'residential' | 'commercial';
  floors: Floor[];
  devices_count: number;
}

export interface BuildingCreateRequest {
  name: string;
  type: 'office' | 'residential' | 'commercial';
  floors: FloorCreate[];
}

export interface SimulationData {
  status: string;
  active_devices_count: number;
  events_per_second: number;
}

export interface BuildingResponse {
  building: Building;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
} 