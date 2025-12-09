// src/hooks/useDeviceType.js
import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';

export const useDeviceType = () => {
  const { width, height } = useWindowDimensions();
  const [deviceType, setDeviceType] = useState({
    isMobile: true,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const minDim = Math.min(width, height);

    const isDesktop = minDim >= 1024;
    const isTablet = minDim >= 768 && minDim < 1024;
    const isMobile = !isDesktop && !isTablet;

    setDeviceType({
      isMobile,
      isTablet,
      isDesktop,
    });
  }, [width, height]);

  return deviceType;
};

// Para evitar warning de expo-router (este archivo está dentro de src/app)
// exportamos un componente por defecto que no renderiza nada.
export default function _useDeviceTypeRoute() {
  return null;
}