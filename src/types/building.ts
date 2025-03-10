export interface Device {
  id: string;
  type: string;
  status: 'active' | 'inactive';
}

export interface Room {
  number: number;
  devices: Device[];
}

export interface Floor {
  number: number;
  rooms: Room[];
}

export interface Building {
  id: string;
  name: string;
  type: 'office' | 'residential' | 'commercial';
  floors: Floor[];
  devices_count: number;
}

export interface BuildingResponse {
  building: Building;
} 