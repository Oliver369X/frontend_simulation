import React from 'react';
import { 
  List, ListItem, ListItemText, 
  Typography, Chip, Stack 
} from '@mui/material';
import { Room3D } from '../types/visualization';

interface RoomViewProps {
  room: Room3D;
  onDeviceClick?: (deviceId: string) => void;
}

export const RoomView: React.FC<RoomViewProps> = ({ room, onDeviceClick }) => {
  return (
    <List>
      <ListItem>
        <ListItemText
          primary={
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="subtitle1" component="span">
                Room {room.number}
              </Typography>
              <Stack direction="row" spacing={1}>
                {room.devices.map((device) => (
                  <Chip
                    key={device.id}
                    label={device.type}
                    color={device.status === 'active' ? 'success' : 'default'}
                    size="small"
                    onClick={() => onDeviceClick?.(device.id)}
                  />
                ))}
              </Stack>
            </Stack>
          }
        />
      </ListItem>
    </List>
  );
}; 