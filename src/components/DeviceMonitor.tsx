import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, Grid, Typography, 
  CircularProgress, Alert, Box,
  Chip, IconButton, Tooltip,
  Accordion, AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import PowerIcon from '@mui/icons-material/Power';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { API_URL } from '../config';

interface DeviceReading {
  temperature?: number;
  humidity?: number;
  motion_detected?: boolean;
  power_consumption?: number;
}

interface Device {
  id: string;
  type: string;
  status: string;
  lastReading?: DeviceReading;
}

interface DeviceMonitorProps {
  buildingId: string;
  simulationId: string | null;
}

interface FloorDevices {
  floorNumber: number;
  devices: Device[];
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4]
  }
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2)
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  backgroundColor: status === 'active' ? theme.palette.success.main : theme.palette.error.main,
  color: theme.palette.common.white
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:before': {
    display: 'none',
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  '&.Mui-expanded': {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  }
}));

const LoadingContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(3)
}));

const UpdateContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const FlexBox = styled('div')({
  flex: 1
});

export const DeviceMonitor: React.FC<DeviceMonitorProps> = ({ buildingId, simulationId }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [expandedFloor, setExpandedFloor] = useState<number | false>(false);

  const fetchDevices = async () => {
    try {
      const response = await fetch(`${API_URL}/buildings/${buildingId}/devices`);
      if (!response.ok) {
        throw new Error('Error al obtener datos de los dispositivos');
      }
      const data = await response.json();
      setDevices(data.devices);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, [buildingId]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'temperature_sensor':
        return <ThermostatIcon fontSize="large" color="primary" />;
      case 'humidity_sensor':
        return <WaterDropIcon fontSize="large" color="info" />;
      case 'motion_sensor':
        return <DirectionsRunIcon fontSize="large" color="warning" />;
      case 'smart_plug':
        return <PowerIcon fontSize="large" color="success" />;
      case 'hvac_controller':
        return <AcUnitIcon fontSize="large" color="primary" />;
      default:
        return <DevicesOtherIcon fontSize="large" />;
    }
  };

  const getDeviceTypeName = (type: string) => {
    switch (type) {
      case 'temperature_sensor':
        return 'Sensor de Temperatura';
      case 'humidity_sensor':
        return 'Sensor de Humedad';
      case 'motion_sensor':
        return 'Sensor de Movimiento';
      case 'smart_plug':
        return 'Enchufe Inteligente';
      case 'hvac_controller':
        return 'Control de HVAC';
      default:
        return type;
    }
  };

  const formatReading = (type: string, reading?: DeviceReading) => {
    if (!reading) return 'Sin lecturas';

    switch (type) {
      case 'temperature_sensor':
        return reading.temperature ? `${reading.temperature.toFixed(1)}°C` : 'Sin datos';
      case 'humidity_sensor':
        return reading.humidity ? `${reading.humidity.toFixed(1)}%` : 'Sin datos';
      case 'motion_sensor':
        return reading.motion_detected ? '🟢 Movimiento detectado' : '⚪ Sin movimiento';
      case 'smart_plug':
        return reading.power_consumption ? `${reading.power_consumption.toFixed(1)}W` : 'Sin datos';
      default:
        return 'Lectura no disponible';
    }
  };

  // Función para organizar dispositivos por piso
  const organizeByFloor = (devices: Device[]): FloorDevices[] => {
    const floorMap = new Map<number, Device[]>();
    
    devices.forEach(device => {
      // Extraer el número de piso del ID del dispositivo
      const floorMatch = device.id.match(/floor_(\d+)/);
      const floorNumber = floorMatch ? parseInt(floorMatch[1]) : 0;
      
      if (!floorMap.has(floorNumber)) {
        floorMap.set(floorNumber, []);
      }
      floorMap.get(floorNumber)?.push(device);
    });

    return Array.from(floorMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([floorNumber, devices]) => ({
        floorNumber,
        devices: devices.sort((a, b) => a.type.localeCompare(b.type))
      }));
  };

  const handleAccordionChange = (floorNumber: number) => (
    _event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedFloor(isExpanded ? floorNumber : false);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ m: 2 }}
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={fetchDevices}
          >
            <RefreshIcon />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  const floorDevices = organizeByFloor(devices);

  return (
    <>
      <UpdateContainer>
        <Typography variant="subtitle2" color="text.secondary">
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </Typography>
        <Tooltip title="Actualizar">
          <IconButton onClick={fetchDevices} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </UpdateContainer>

      {floorDevices.length === 0 ? (
        <Alert severity="info">
          No hay dispositivos disponibles
        </Alert>
      ) : (
        floorDevices.map(({ floorNumber, devices }) => (
          <StyledAccordion
            key={floorNumber}
            expanded={expandedFloor === floorNumber}
            onChange={handleAccordionChange(floorNumber)}
          >
            <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Piso {floorNumber} ({devices.length} dispositivos)
              </Typography>
            </StyledAccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {devices.map((device) => (
                  <Grid item xs={12} sm={6} md={4} key={device.id}>
                    <StyledCard>
                      <CardContent>
                        <CardHeader>
                          {getDeviceIcon(device.type)}
                          <FlexBox>
                            <Typography variant="h6" gutterBottom>
                              {getDeviceTypeName(device.type)}
                            </Typography>
                            <StatusChip
                              label={device.status === 'active' ? 'Activo' : 'Inactivo'}
                              size="small"
                              status={device.status}
                            />
                          </FlexBox>
                        </CardHeader>
                        
                        <Typography color="text.secondary" variant="body2" gutterBottom>
                          ID: {device.id}
                        </Typography>
                        
                        <Typography variant="body1" sx={{ mt: 2 }}>
                          {formatReading(device.type, device.lastReading)}
                        </Typography>
                      </CardContent>
                    </StyledCard>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </StyledAccordion>
        ))
      )}
    </>
  );
}; 