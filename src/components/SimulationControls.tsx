import React, { useState } from 'react';
import { 
  Button, TextField, CircularProgress,
  Alert, Stack, Typography, Select, MenuItem, FormControl, InputLabel 
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { styled } from '@mui/material/styles';
import { ENDPOINTS } from '../config';

interface SimulationControlsProps {
  onStart: (simulationId: string) => void;
  onStop: () => void;
  buildings?: { id: string; name: string }[];
}

// Styled Components
const ControlsContainer = styled('div')({
  padding: '16px'
});

const AlertContainer = styled(Alert)(({ theme }) => ({
  marginTop: theme.spacing(2)
}));

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  onStart,
  onStop,
  buildings = []
}) => {
  const [duration, setDuration] = useState<number>(24);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');

  const handleStart = async () => {
    try {
      if (!selectedBuilding) {
        setError('Please select a building first');
        return;
      }

      setLoading(true);
      setError(null);
      
      const response = await fetch(`${ENDPOINTS.simulation}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          building_id: selectedBuilding,
          duration: duration * 60,
          events_per_second: 1.0
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to start simulation');
      }

      const data = await response.json();
      setActiveSimulation(data.simulation_id);
      onStart(data.simulation_id);
    } catch (error) {
      console.error('Error starting simulation:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!activeSimulation) return;

    try {
      setLoading(true);
      const response = await fetch(`${ENDPOINTS.simulation}/${activeSimulation}/stop`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to stop simulation');
      }

      setActiveSimulation(null);
      onStop();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ControlsContainer>
      <Typography variant="h6" gutterBottom>
        Simulation Controls
      </Typography>
      
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Select Building</InputLabel>
          <Select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            disabled={loading || !!activeSimulation}
            label="Select Building"
          >
            {buildings.map(building => (
              <MenuItem key={building.id} value={building.id}>
                {building.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          type="number"
          label="Duration (hours)"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          disabled={loading || !!activeSimulation}
          size="small"
          inputProps={{ min: 1 }}
        />
        
        {!activeSimulation ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleStart}
            disabled={loading || !selectedBuilding}
            startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          >
            Start Simulation
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            onClick={handleStop}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <StopIcon />}
          >
            Stop Simulation
          </Button>
        )}
      </Stack>

      {error && (
        <AlertContainer severity="error">
          {error}
        </AlertContainer>
      )}
    </ControlsContainer>
  );
}; 