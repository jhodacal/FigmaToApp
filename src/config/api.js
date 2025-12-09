import { Platform } from 'react-native';

// Configuración de la API
export const API_BASE_URL = Platform.OS === 'web'
    ? 'http://localhost:3000'
    : 'http://192.168.1.3:3000'; // IP Local para dispositivos físicos

export const API_URL = `${API_BASE_URL}/api`;
