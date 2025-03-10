import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { RoomView } from './RoomView';
import { Floor3D } from '../types/visualization';

interface FloorViewProps {
  floor: Floor3D;
  onDeviceClick?: (deviceId: string) => void;
}

export const FloorView: React.FC<FloorViewProps> = ({ floor, onDeviceClick }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Floor {floor.number + 1}
      </Typography>
      <Grid container spacing={2}>
        {floor.rooms.map((room) => (
          <Grid item xs={12} md={6} lg={4} key={room.id}>
            <RoomView 
              room={room} 
              onDeviceClick={onDeviceClick}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}; 