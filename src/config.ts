declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_API_URL: string;
      REACT_APP_WS_URL: string;
      NODE_ENV: 'development' | 'production';
    }
  }
}

const isDev = process.env.NODE_ENV === 'development';

// URL base para la API usando variable de entorno
// Aseguramos que sea una URL completa
export const API_URL = process.env.REACT_APP_API_URL?.startsWith('http') 
  ? process.env.REACT_APP_API_URL 
  : 'https://iot-building-simulator-1.onrender.com';

export const ENDPOINTS = {
  buildings: `${API_URL}/buildings`,
  simulation: `${API_URL}/simulation`,
};

// WebSocket URL usando variable de entorno
export const WS_URL = process.env.REACT_APP_WS_URL?.startsWith('http') 
? process.env.REACT_APP_WS_URL 
: 'ws://iot-building-simulator-1.onrender.com';

// Agregar console.log para debug
console.log('Variables de entorno:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  NODE_ENV: process.env.NODE_ENV,
  API_URL
});
console.log('Endpoints configurados:', ENDPOINTS); 