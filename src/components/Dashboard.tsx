import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, 
  Box, Tab, Tabs, Button, Alert, CircularProgress 
} from '@mui/material';
import { BuildingList } from './BuildingList';
import { BuildingForm } from './BuildingForm';
import { BuildingDetails } from './BuildingDetails';
import { BuildingViewer } from './BuildingViewer';
import { Building } from '../types';
import { API_URL } from '../config';
import { NotificationSystem } from './NotificationSystem';
import { v4 as uuidv4 } from 'uuid';
import { StyledContainer } from './styled/StyledContainer';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: '20px 0' }}>
    {value === index && children}
  </div>
);

interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

export const Dashboard: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchBuildings = async () => {
    try {
      const response = await fetch(`${API_URL}/buildings`);
      if (!response.ok) throw new Error('Error al cargar edificios');
      const data = await response.json();
      setBuildings(data.buildings || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los edificios. Por favor, intente nuevamente.');
      console.error('Error fetching buildings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
    // Actualizar la lista cada 30 segundos
    const interval = setInterval(fetchBuildings, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBuildingSelect = (id: string) => {
    const building = buildings.find(b => b.id === id);
    if (building) {
      setSelectedBuilding(building);
      setIsDetailsOpen(true);
    }
  };

  const handleBuildingCreated = (building: Building) => {
    setBuildings(prev => [...prev, building]);
    setIsFormOpen(false);
    addNotification('success', 'Edificio Creado', `El edificio ${building.name} ha sido creado exitosamente.`);
  };

  const handleBuildingDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/buildings/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar el edificio');

      setBuildings(prev => prev.filter(b => b.id !== id));
      if (selectedBuilding?.id === id) {
        setSelectedBuilding(null);
        setIsDetailsOpen(false);
      }

      addNotification('success', 'Edificio Eliminado', 'El edificio ha sido eliminado exitosamente.');
    } catch (err) {
      addNotification('error', 'Error', 'No se pudo eliminar el edificio. Por favor, intente nuevamente.');
    }
  };

  const addNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const notification: AppNotification = {
      id: uuidv4(),
      type,
      title,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, notification]);
  };

  return (
    <Container maxWidth="xl">
      <StyledContainer>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" gutterBottom>
              Panel de Control
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setIsFormOpen(true)}
            >
              Agregar Edificio
            </Button>
          </Grid>
        </Grid>
      </StyledContainer>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Lista de Edificios" />
          <Tab label="Visualización 3D" disabled={!selectedBuilding} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <BuildingList
            buildings={buildings}
            onBuildingSelect={handleBuildingSelect}
            onBuildingDelete={handleBuildingDelete}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {selectedBuilding && (
            <BuildingViewer building={selectedBuilding} />
          )}
        </TabPanel>
      </Paper>

      <BuildingForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleBuildingCreated}
      />

      <BuildingDetails
        building={selectedBuilding}
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <NotificationSystem 
        notifications={notifications}
        onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />
    </Container>
  );
}; 