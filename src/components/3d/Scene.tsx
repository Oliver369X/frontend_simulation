import React from 'react';
import { Building } from '../../types';
import { Floor3D } from './Floor3D';
import { convertToFloor3D } from '../../utils/typeConverters';

interface SceneProps {
  building: Building;
}

export const Scene: React.FC<SceneProps> = ({ building }) => {
  if (!building?.floors?.length) {
    console.warn('No building data or floors available');
    return null;
  }

  return (
    <group>
      {building.floors.map((floor, index) => (
        <Floor3D
          key={`floor-${building.id}-${floor.number}-${index}`}
          floor={convertToFloor3D(floor)}
          position={[0, floor.number * 3, 0]}
        />
      ))}
    </group>
  );
}; 