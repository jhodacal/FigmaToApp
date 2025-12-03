import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

// Puntos de quiebre (Breakpoints) comunes para diseño responsivo
const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
};

/**
 * Hook personalizado para determinar el tipo de dispositivo (móvil, tablet, desktop)
 * basado en el ancho de la ventana.
 * @returns {{deviceType: string, isMobile: boolean, isTablet: boolean, isDesktop: boolean}}
 */
export const useDeviceType = () => {
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const updateDimensions = ({ window }) => {
      setWindowWidth(window.width);
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);

    return () => subscription.remove();
  }, []);

  let deviceType = 'mobile';
  let isMobile = true;
  let isTablet = false;
  let isDesktop = false;

  if (Platform.OS === 'web') {
    if (windowWidth >= BREAKPOINTS.desktop) {
      deviceType = 'desktop';
      isMobile = false;
      isDesktop = true;
    } else if (windowWidth >= BREAKPOINTS.tablet) {
      deviceType = 'tablet';
      isMobile = false;
      isTablet = true;
    }
  } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
    // En nativo, asumimos que si el ancho es mayor al de un móvil típico, es una tablet
    if (windowWidth >= BREAKPOINTS.tablet) {
      deviceType = 'tablet';
      isMobile = false;
      isTablet = true;
    }
  }

  return {
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
  };
};
