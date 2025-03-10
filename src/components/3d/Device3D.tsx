import React from 'react';
import { Text } from '@react-three/drei';
import { Device3D as Device3DType } from '../../types/visualization';

interface Device3DProps {
  device: Device3DType;
  position: [number, number, number];
}

export const Device3D: React.FC<Device3DProps> = ({ device, position }) => {
  const color = device.status === 'active' ? '#4caf50' : '#f44336';

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {device.type}
      </Text>
    </group>
  );
}; 