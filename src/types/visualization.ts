export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Device3D {
  id: string;
  type: string;
  status: 'active' | 'inactive';
  position: Position3D;
}

export interface Room3D {
  id: string;
  number: number;
  devices: Device3D[];
  position?: Position3D;
}

export interface Floor3D {
  id?: string;
  number: number;
  rooms: Room3D[];
  position?: Position3D;
}

export interface Building3D {
  id: string;
  name: string;
  type: 'office' | 'residential' | 'commercial';
  floors: Floor3D[];
} 