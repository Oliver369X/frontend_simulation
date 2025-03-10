import React from 'react';
import { Floor3D as Floor3DType } from '../../types/visualization';
import { Room3D } from './Room3D';

interface Floor3DProps {
  floor: Floor3DType;
  position: [number, number, number];
}

export const Floor3D: React.FC<Floor3DProps> = ({ floor, position }) => {
  if (!floor?.rooms?.length) {
    console.warn('No floor data or rooms available');
    return null;
  }

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[20, 0.2, 20]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>

      {floor.rooms.map((room, index) => (
        <Room3D 
          key={`room-${floor.number}-${room.number}-${index}`}
          room={room} 
          position={[
            (index % 3) * 6 - 6,
            1.4,
            Math.floor(index / 3) * 6 - 6
          ]}
        />
      ))}
    </group>
  );
}; 