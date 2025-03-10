import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Building } from '../types';
import { Scene } from './3d/Scene';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface BuildingViewerProps {
  building: Building;
}

const ErrorBox = styled('div')(({ theme }) => ({
  padding: theme.spacing(2)
}));

const ErrorFallback: React.FC<{ 
  error: Error; 
  resetErrorBoundary: () => void 
}> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <ErrorBox>
    <Alert 
      severity="error" 
      onClose={resetErrorBoundary}
    >
      Error en la visualización 3D: {error.message}
    </Alert>
  </ErrorBox>
);

export const BuildingViewer: React.FC<BuildingViewerProps> = ({ building }) => {
  const [key, setKey] = useState(0);

  if (!building) {
    console.warn('No building data provided to BuildingViewer');
    return null;
  }

  const handleError = () => {
    console.log('Reiniciando visualización 3D...');
    setKey(prev => prev + 1);
  };

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={handleError}
      resetKeys={[key]}
    >
      <div style={{ height: '500px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }}>
        <Canvas
          key={key}
          camera={{ position: [15, 15, 15], fov: 60 }}
          style={{ background: '#f5f5f5' }}
          onCreated={({ gl }) => {
            gl.setClearColor('#f5f5f5');
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          }}
        >
          <Suspense fallback={null}>
            <Scene building={building} />
            <OrbitControls enableDamping dampingFactor={0.05} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <gridHelper args={[30, 30, '#666666', '#222222']} />
            <axesHelper args={[5]} />
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}; 