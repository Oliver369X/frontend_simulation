import { Building, Floor, Room, Device } from '../types';
import { Building3D, Floor3D, Room3D, Device3D, Position3D } from '../types/visualization';

const createPosition = (x: number = 0, y: number = 0, z: number = 0): Position3D => ({
  x, y, z
});

export const convertToDevice3D = (device: Device): Device3D => ({
  id: device.id,
  type: device.type,
  status: device.status,
  position: createPosition()
});

export const convertToRoom3D = (room: Room): Room3D => ({
  id: `room-${room.number}`,
  number: room.number,
  devices: room.devices.map((device, index) => ({
    ...convertToDevice3D(device),
    position: createPosition(index * 2, 0, 0)
  })),
  position: createPosition()
});

export const convertToFloor3D = (floor: Floor): Floor3D => ({
  number: floor.number,
  rooms: floor.rooms.map((room, index) => ({
    ...convertToRoom3D(room),
    position: createPosition(0, floor.number * 3, 0)
  }))
});

export const convertToBuilding3D = (building: Building): Building3D => ({
  id: building.id,
  name: building.name,
  type: building.type,
  floors: building.floors.map(convertToFloor3D)
}); 