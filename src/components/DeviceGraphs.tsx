import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  styled,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { WS_URL } from '../config';

interface DeviceReading {
  device_id: string;
  type: string;
  data: {
    temperature?: number;
    humidity?: number;
    pressure?: number;
    value?: number;
    [key: string]: number | undefined;
  };
  timestamp: string;
}

interface DeviceData {
  [deviceId: string]: {
    type: string;
    data: Array<{
      timestamp: number;
      value: number;
    }>;
    lastValue?: number;
    min?: number;
    max?: number;
    avg?: number;
  };
}

interface DeviceGraphsProps {
  buildingId: string;
  simulationId: string | null;
}

const LoadingBox = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  padding: '24px'
});

const ChartBox = styled(Box)(({ theme }) => ({
  height: 350,
  padding: theme.spacing(2),
  position: 'relative',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1]
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  padding: theme.spacing(1),
  marginTop: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1)
}));

const DeviceGraphs: React.FC<DeviceGraphsProps> = ({ buildingId, simulationId }) => {
  const theme = useTheme();
  const [deviceData, setDeviceData] = useState<DeviceData>({});
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!simulationId) return;

    const ws = new WebSocket(`${WS_URL}/ws/simulation/${simulationId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket conectado');
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const reading: DeviceReading = JSON.parse(event.data);
        console.log('Datos recibidos:', reading); // Para debug

        if (!reading.data || !reading.device_id || !reading.type) {
          console.warn('Datos incompletos recibidos:', reading);
          return;
        }

        setDeviceData(prevData => {
          const deviceId = reading.device_id;
          const newData = { ...prevData };
          
          if (!newData[deviceId]) {
            newData[deviceId] = {
              type: reading.type,
              data: [],
              lastValue: undefined,
              min: undefined,
              max: undefined,
              avg: undefined
            };
          }

          // Extraer el valor correcto según el tipo de dispositivo
          let value: number | undefined;
          
          switch (reading.type) {
            case 'temperature_sensor':
              value = reading.data.temperature;
              break;
            case 'pressure_sensor':
              value = reading.data.pressure;
              break;
            case 'valve_controller':
              value = reading.data.position;
              break;
            case 'damper_controller':
              value = reading.data.position;
              break;
            case 'frequency_controller':
              value = reading.data.frequency;
              break;
            case 'power_meter':
              value = reading.data.current_power ?? reading.data.power;
              break;
            default:
              value = reading.data.value;
          }

          // Solo actualizar si tenemos un valor válido
          if (typeof value === 'number' && !isNaN(value)) {
            const timestamp = Date.now();
            const newDataPoint = { timestamp, value };

            // Actualizar datos y estadísticas
            const updatedData = [...newData[deviceId].data, newDataPoint].slice(-50);
            const values = updatedData.map(d => d.value);

            newData[deviceId] = {
              ...newData[deviceId],
              data: updatedData,
              lastValue: value,
              min: values.length > 0 ? Math.min(...values) : undefined,
              max: values.length > 0 ? Math.max(...values) : undefined,
              avg: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : undefined
            };
          } else {
            console.warn(`Valor inválido recibido para ${reading.type}:`, value);
          }

          return newData;
        });
      } catch (error) {
        console.error('Error procesando datos:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket desconectado');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('Error en WebSocket:', error);
      setError('Error en la conexión WebSocket');
    };

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [simulationId]);

  const renderDeviceChart = (deviceId: string, deviceData: DeviceData[string]) => {
    const formatValue = (value: number) => value.toFixed(2);

    // Configurar el rango del eje Y según el tipo de dispositivo
    const getYAxisDomain = (type: string): [number, number] => {
      switch (type) {
        case 'temperature_sensor':
          return [15, 30]; // Rango de temperatura
        case 'pressure_sensor':
          return [0, 1000]; // Rango de presión
        case 'valve_controller':
        case 'damper_controller':
          return [0, 100]; // Rango de porcentaje
        case 'frequency_controller':
          return [0, 60]; // Rango de frecuencia
        case 'power_meter':
          return [0, 1000]; // Rango de consumo
        default:
          return [0, 100];
      }
    };

    return (
      <ChartBox>
        <Typography variant="h6" gutterBottom align="center">
          {getDeviceTypeName(deviceData.type)}
        </Typography>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={deviceData.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['auto', 'auto']}
              tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString()}
              stroke={theme.palette.text.secondary}
            />
            <YAxis
              domain={getYAxisDomain(deviceData.type)}
              stroke={theme.palette.text.secondary}
              label={{
                value: getUnitByDeviceType(deviceData.type),
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: theme.palette.text.primary }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`
              }}
              labelFormatter={(value) => new Date(value).toLocaleTimeString()}
              formatter={(value: number) => [
                `${formatValue(value)} ${getUnitByDeviceType(deviceData.type)}`,
                'Valor'
              ]}
            />
            <Legend />
            <Line
              name={getDeviceTypeName(deviceData.type)}
              type="monotone"
              dataKey="value"
              stroke={getColorByDeviceType(deviceData.type)}
              dot={false}
              isAnimationActive={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>

        <StatsContainer>
          <StatItem>
            <Typography variant="caption" color="textSecondary">
              Último
            </Typography>
            <Typography variant="body2">
              {deviceData.lastValue !== undefined 
                ? `${formatValue(deviceData.lastValue)} ${getUnitByDeviceType(deviceData.type)}`
                : 'Sin datos'}
            </Typography>
          </StatItem>
          <StatItem>
            <Typography variant="caption" color="textSecondary">
              Mínimo
            </Typography>
            <Typography variant="body2">
              {deviceData.min !== undefined 
                ? `${formatValue(deviceData.min)} ${getUnitByDeviceType(deviceData.type)}`
                : 'Sin datos'}
            </Typography>
          </StatItem>
          <StatItem>
            <Typography variant="caption" color="textSecondary">
              Máximo
            </Typography>
            <Typography variant="body2">
              {deviceData.max !== undefined 
                ? `${formatValue(deviceData.max)} ${getUnitByDeviceType(deviceData.type)}`
                : 'Sin datos'}
            </Typography>
          </StatItem>
          <StatItem>
            <Typography variant="caption" color="textSecondary">
              Promedio
            </Typography>
            <Typography variant="body2">
              {deviceData.avg !== undefined 
                ? `${formatValue(deviceData.avg)} ${getUnitByDeviceType(deviceData.type)}`
                : 'Sin datos'}
            </Typography>
          </StatItem>
        </StatsContainer>
      </ChartBox>
    );
  };

  if (!simulationId) {
    return (
      <Alert severity="info">
        Inicia una simulación para ver los gráficos en tiempo real
      </Alert>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!isConnected) {
    return (
      <LoadingBox>
        <CircularProgress />
      </LoadingBox>
    );
  }

  return (
    <Grid container spacing={3}>
      {Object.entries(deviceData).map(([deviceId, data]) => (
        <Grid item xs={12} md={6} key={deviceId}>
          {renderDeviceChart(deviceId, data)}
        </Grid>
      ))}
    </Grid>
  );
};

const getDeviceTypeName = (type: string): string => {
  switch (type) {
    case 'temperature_sensor':
      return 'Temperatura';
    case 'pressure_sensor':
      return 'Presión';
    case 'valve_controller':
      return 'Válvula';
    case 'damper_controller':
      return 'Compuerta';
    case 'frequency_controller':
      return 'Frecuencia';
    case 'power_meter':
      return 'Consumo de Energía';
    default:
      return type;
  }
};

const getUnitByDeviceType = (type: string): string => {
  switch (type) {
    case 'temperature_sensor':
      return '°C';
    case 'pressure_sensor':
      return 'Pa';
    case 'valve_controller':
      return '%';
    case 'damper_controller':
      return '%';
    case 'frequency_controller':
      return 'Hz';
    case 'power_meter':
      return 'kW';
    default:
      return 'Valor';
  }
};

const getColorByDeviceType = (type: string): string => {
  switch (type) {
    case 'temperature_sensor':
      return '#ff6384';
    case 'pressure_sensor':
      return '#36a2eb';
    case 'valve_controller':
      return '#4bc0c0';
    case 'damper_controller':
      return '#ffce56';
    case 'frequency_controller':
      return '#9966ff';
    case 'power_meter':
      return '#ff9f40';
    default:
      return '#666666';
  }
};

export default DeviceGraphs; 