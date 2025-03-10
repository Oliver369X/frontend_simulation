import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent,
  Grid, Typography, Paper, Button,
  Box, CircularProgress, Tabs, Tab,
  Alert, Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Building } from '../types';
import { DeviceMonitor } from './DeviceMonitor';
import DeviceGraphs from './DeviceGraphs';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { API_URL } from '../config';

// Componentes estilizados
const InfoBox = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1)
}));

const InfoPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2)
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const StyledTabPanel = styled('div')({
  padding: '24px'
});

const TitleContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

const ButtonContainer = styled('div')({
  display: 'flex',
  alignItems: 'center'
});

const TabsContainer = styled('div')(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2)
}));

interface BuildingDetailsProps {
  building: Building | null;
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <StyledTabPanel
    role="tabpanel"
    hidden={value !== index}
    id={`building-tab-${index}`}
    aria-labelledby={`building-tab-${index}`}
  >
    {value === index && children}
  </StyledTabPanel>
);

export const BuildingDetails: React.FC<BuildingDetailsProps> = ({
  building,
  open,
  onClose
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [simulationId, setSimulationId] = useState<string | null>(null);

  const handleStartSimulation = async () => {
    if (!building) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('Iniciando simulación para edificio:', building.id);
      const response = await fetch(`${API_URL}/simulation/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          building_id: building.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al iniciar la simulación');
      }

      console.log('Simulación iniciada:', data);
      setSimulationId(data.simulation_id);
      setIsSimulating(true);
    } catch (err) {
      console.error('Error al iniciar simulación:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleStopSimulation = async () => {
    if (!building || !simulationId) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('Deteniendo simulación:', simulationId);
      const response = await fetch(`${API_URL}/simulation/${simulationId}/stop`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Error al detener la simulación');
      }

      setIsSimulating(false);
      setSimulationId(null);
    } catch (err) {
      console.error('Error al detener simulación:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!building) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      aria-labelledby="building-details-title"
      keepMounted={false}
    >
      <DialogTitle id="building-details-title">
        <TitleContainer>
          <Typography variant="h6">
            {building.name || 'Detalles del Edificio'}
          </Typography>
          <ButtonContainer>
            <ActionButton
              variant="contained"
              color={isSimulating ? "error" : "primary"}
              onClick={isSimulating ? handleStopSimulation : handleStartSimulation}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : 
                isSimulating ? <StopIcon /> : <PlayArrowIcon />}
              aria-label={loading ? 'Procesando...' : 
                isSimulating ? 'Detener Simulación' : 'Iniciar Simulación'}
            >
              {loading ? 'Procesando...' : 
               isSimulating ? 'Detener Simulación' : 'Iniciar Simulación'}
            </ActionButton>
          </ButtonContainer>
        </TitleContainer>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <InfoPaper>
              <Typography variant="h6" gutterBottom>
                Información del Edificio
              </Typography>
              <InfoBox>
                <Typography component="div">
                  <strong>Tipo:</strong> {building.type}
                </Typography>
                <Typography component="div">
                  <strong>Pisos:</strong> {building.floors.length}
                </Typography>
                <Typography component="div">
                  <strong>Dispositivos Totales:</strong> {building.devices_count}
                </Typography>
                <Typography component="div" color={isSimulating ? "success.main" : "error.main"}>
                  <strong>Estado:</strong> {isSimulating ? 'Simulación en curso' : 'Simulación detenida'}
                </Typography>
                {simulationId && (
                  <Typography component="div" variant="caption">
                    ID Simulación: {simulationId}
                  </Typography>
                )}
              </InfoBox>
            </InfoPaper>
          </Grid>
          <Grid item xs={12} md={8}>
            <TabsContainer>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                aria-label="Pestañas de visualización"
              >
                <Tab 
                  label="Estado Actual" 
                  id="building-tab-0"
                  aria-controls="building-tabpanel-0"
                />
                <Tab 
                  label="Gráficos" 
                  id="building-tab-1"
                  aria-controls="building-tabpanel-1"
                />
              </Tabs>
            </TabsContainer>
            <TabPanel value={tabValue} index={0}>
              <DeviceMonitor buildingId={building.id} simulationId={simulationId} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <DeviceGraphs buildingId={building.id} simulationId={simulationId} />
            </TabPanel>
          </Grid>
        </Grid>
      </DialogContent>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          variant="filled"
        >
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}; 