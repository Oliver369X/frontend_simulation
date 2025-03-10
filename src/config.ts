declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_API_URL: string;
      REACT_APP_WS_URL: string;
    }
  }
}

const isDev = process.env.NODE_ENV === 'development';

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const ENDPOINTS = {
  buildings: `${API_URL}/buildings`,
  simulation: `${API_URL}/simulation`,
};

export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000'; 