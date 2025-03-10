import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { WS_URL } from '../config';

interface SensorChartProps {
  buildingId?: string;
}

// Styled Components
const ChartContainer = styled('div')({
  width: '100%',
  height: '400px'
});

const LoadingContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  padding: '24px'
});

const ChartHeader = styled('div')({
  marginBottom: '16px'
});

interface SensorData {
  time: string;
  temperature?: number;
  humidity?: number;
  [key: string]: any;
}

export const SensorChart: React.FC<SensorChartProps> = ({ buildingId }) => {
  const [data, setData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);

  if (!buildingId) {
    return <Typography>No building selected</Typography>;
  }

  useEffect(() => {
    console.log('Connecting to WebSocket:', `${WS_URL}/ws/building/${buildingId}`); // Debug
    const ws = new WebSocket(`${WS_URL}/ws/building/${buildingId}`);
    
    ws.onopen = () => {
        console.log('WebSocket connected'); // Debug
        setLoading(false);
    };
    
    ws.onmessage = (event) => {
        try {
            const newData = JSON.parse(event.data);
            console.log('Received data:', newData); // Debug
            setData(prev => [...prev, {
                time: new Date().toLocaleTimeString(),
                ...newData
            }].slice(-20));
        } catch (error) {
            console.error('Error parsing WebSocket data:', error);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setLoading(false);
    };

    return () => {
        console.log('Closing WebSocket connection'); // Debug
        ws.close();
    };
  }, [buildingId]);

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartHeader>
        <Typography variant="h6" gutterBottom>
          Sensor Readings
        </Typography>
      </ChartHeader>
      
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#8884d8" 
            name="Temperature" 
          />
          <Line 
            type="monotone" 
            dataKey="humidity" 
            stroke="#82ca9d" 
            name="Humidity" 
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}; 