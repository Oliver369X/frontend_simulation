import React from 'react';
import { Room3D as Room3DType } from '../../types/visualization';
import { Device3D } from './Device3D';

interface Room3DProps {
  room: Room3DType;
  position: [number, number, number];
}

export const Room3D: React.FC<Room3DProps> = ({ room, position }) => {
  if (!room?.devices?.length) {
    console.warn('No room data or devices available');
    return null;
  }

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[5, 2.8, 5]} />
        <meshStandardMaterial color="#f0f0f0" transparent opacity={0.5} />
      </mesh>

      {room.devices.map((device, index) => (
        <Device3D 
          key={`device-${room.id}-${device.id}`}
          device={device}
          position={[
            (index % 2) * 2 - 1,
            0.5,
            Math.floor(index / 2) * 2 - 1
          ]}
        />
      ))}
    </group>
  );
}; 