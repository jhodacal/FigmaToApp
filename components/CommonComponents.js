import React, { useEffect } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native';

import Svg, { Circle, G, Path, Polygon, Rect } from 'react-native-svg';

// --- Logo Component ---
export const Logo = ({ style }) => {

  const fadeAnim = new Animated.Value(0);
  const floatAnim = new Animated.Value(0);
  const { width, height } = useWindowDimensions();

  // Detectar tipo de dispositivo basado en dimensiones
  const getDeviceType = () => {
    if (Platform.OS === 'web') {
      // Para web, usar breakpoints estándar
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    } else {
      // Para React Native
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    }
  };

  const deviceType = getDeviceType();

  // Configuraciones específicas por plataforma
  const platformConfig = {
    mobile: {
      containerWidth: 240,
      containerHeight: 70,
      position: 'absolute',
      top: -450, // 10% desde la parte superior
      right: 85, // 5% desde la derecha
      imageWidth: 500,
    },
    tablet: {
      containerWidth: 280,
      containerHeight: 80,
      position: 'absolute',
      top: -420, // 8% desde la parte superior
      right: 230, // 10% desde la derecha
      imageWidth: 900,

    },
    desktop: {
      containerWidth: 320,
      containerHeight: 100,
      position: 'absolute',
      top: -600,
      right: 200,
      imageWidth: 900,
    }
  };

  const config = platformConfig[deviceType];

  useEffect(() => {
    // Animación de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Animación de flotación
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatInterpolate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  return (
    <View style={[
      styles.logoContainer,
      {
        width: config.containerWidth,
        height: config.containerHeight,
        position: config.position,
        top: config.top,
        right: config.right
      }
    ]}>
      <Animated.Image
        source={require('../assets/images/Impulsatech (1).png')}
        style={[
          styles.logoImage,
          {
            width: config.imageWidth,
            opacity: fadeAnim,
            transform: [{ translateY: floatInterpolate }]
          }
        ]}
        resizeMode="contain"
      />
      <View style={styles.logoLine} />
    </View>
  );
};





// --- Figuras Decorativas Mejoradas ---
export const WaveDivider = ({
  position = 'top',
  style,
  figureType = 'waves', // 'waves', 'circles', 'triangles', 'mountains', 'clouds'
  color = '#2700c3c6',
  intensity = 'medium'

}) => {
  const { width } = useWindowDimensions();
  const height = intensity === 'high' ? 80 : intensity === 'medium' ? 400 : 250;

  const getFigurePath = () => {
    const startY = height * 0.5; // Punto de inicio de la ola
    const waveAmplitude = height * 0.2; // Qué tan alta o baja es la ola

    // M = Mover a (Move to)
    // Q = Curva de Bézier Cuadrática (Quadratic Bézier curve)
    // T = Atajo para una curva cuadrática suave (Smooth quadratic Bézier curveto)
    // L = Línea a (Line to)
    // Z = Cerrar trazado (Close path)
    const path = `
    M0,${startY} 
    Q${width * 0.25},${startY - waveAmplitude} ${width * 0.5},${startY}
    T${width},${startY}
    L${width},${height}
    L0,${height}
    Z
  `;
    return path;
  };

  return (
    <View style={[
      styles.figureContainer,
      {
        height,
        transform: [
          ...(position === 'bottom' ? [{ rotateX: '180deg' }] : []),
          ...(position === 'top' ? x = 100 : []),
          ...(position === 'left' ? y = 200[{ translateY: -1 * (height - 1) }] : []),
          ...(position === 'right' ? [{ rotatey: '180deg' }] : [])
        ]

      },
      style
    ]}>
      <Svg height="100%" width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <Path d={getFigurePath()} fill={color} opacity="0.8" />
      </Svg>
    </View>
  );
};

// --- Figura de Iconos Circulares (como en tu imagen original) ---
export const CircleIconsFigure = ({
  icons = ['⚽', '🎵', '🎨', '💻'],
  colors = [['#FF6B6B', '#FF8E53'], ['#4ECDC4', '#44A08D'], ['#FFD93D', '#FF9C33'], ['#9D50BB', '#6E48AA']],
  labels = ['Deportes', 'Música', 'Arte', 'Tech'],
  size = 70
}) => {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.circleIconsContainer}>
      <Svg height="150" width={width} viewBox={`0 0 ${width} 150`} preserveAspectRatio="none">
        {/* Fondo con gradiente */}
        <Path
          d={`M0,150 L0,50 Q${width / 4},0 ${width / 2},50 T${width},50 L${width},150 Z`}
          fill="url(#gradient)"
        />
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#00c8ff" stopOpacity="0.1" />
            <Stop offset="1" stopColor="#00c8ff" stopOpacity="0.3" />
          </LinearGradient>
        </Defs>
      </Svg>

      {/* Iconos sobrepuestos */}
      <View style={[styles.iconsOverlay, { width }]}>
        {icons.map((icon, index) => (
          <View key={index} style={styles.iconItem}>
            <View style={[
              styles.gradientCircle,
              {
                width: size,
                height: size,
                backgroundColor: colors[index] ? undefined : '#ccc'
              }
            ]}>
              {colors[index] && (
                <Svg width={size} height={size}>
                  <Defs>
                    <LinearGradient id={`circleGrad${index}`} x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0" stopColor={colors[index][0]} />
                      <Stop offset="1" stopColor={colors[index][1]} />
                    </LinearGradient>
                  </Defs>
                  <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2 - 2}
                    fill={`url(#circleGrad${index})`}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </Svg>
              )}
              <Text style={styles.iconText}>{icon}</Text>
            </View>
            <Text style={styles.iconLabel}>{labels[index]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// --- Figura Abstracta Decorativa ---
export const AbstractFigure = ({
  type = 'geometric',
  colors = ['#00c8ff', '#0099cc', '#006699'],
  size = 200
}) => {
  const { width } = useWindowDimensions();

  const renderGeometricFigure = () => (
    <Svg width={width} height={size} viewBox={`0 0 ${width} ${size}`}>
      {/* Triángulos superpuestos */}
      <Polygon
        points={`${width / 2},0 ${width},${size} 0,${size}`}
        fill={colors[0]}
        opacity="0.6"
      />
      <Circle cx={width / 4} cy={size / 3} r={size / 6} fill={colors[1]} opacity="0.7" />
      <Circle cx={width * 3 / 4} cy={size / 2} r={size / 8} fill={colors[2]} opacity="0.8" />
      <Rect x={width / 3} y={size / 4} width={width / 3} height={size / 2} fill="#fff" opacity="0.3" rx="10" />
    </Svg>
  );

  const renderOrganicFigure = () => (
    <Svg width={width} height={size} viewBox={`0 0 ${width} ${size}`}>
      {/* Formas orgánicas */}
      <Path
        d={`M0,${size / 2} 
            C${width / 4},${size / 4} ${width / 2},${size * 0.8} ${width * 0.75},${size / 3}
            S${width},${size / 2} ${width},${size}
            L0,${size} Z`}
        fill={colors[0]}
        opacity="0.7"
      />
      <G opacity="0.8">
        <Circle cx={width / 5} cy={size / 4} r={size / 10} fill={colors[1]} />
        <Circle cx={width * 4 / 5} cy={size / 3} r={size / 12} fill={colors[2]} />
      </G>
    </Svg>
  );

  return (
    <View style={styles.abstractContainer}>
      {type === 'geometric' ? renderGeometricFigure() : renderOrganicFigure()}
    </View>
  );
};



export { Circle, G, Polygon, Rect };

// --- PeruFlag Component ---
export const PeruFlag = ({ size = 'small' }) => {
  const flagSize = size === 'large' ? 120 : 60;
  const shieldSize = size === 'large' ? 40 : 20;

  return (
    <View style={[styles.flag, { width: flagSize, height: flagSize * 2 / 3 }]}>
      <View style={[styles.flagSection, { flex: 1, backgroundColor: '#D91023' }]} />
      <View style={[styles.flagSection, { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }]}>

      </View>
      <View style={[styles.flagSection, { flex: 1, backgroundColor: '#D91023' }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    // Estilos basados en las imágenes adjuntas
    padding: 10,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    fontStyle: 'italic',
  },
  waveContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  flag: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  flagSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  figureContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  circleIconsContainer: {
    position: 'relative',
    height: 200,
    marginVertical: 20,
  },
  iconsOverlay: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  iconItem: {
    alignItems: 'center',
  },
  gradientCircle: {
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  iconText: {
    position: 'absolute',
    fontSize: 24,
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  abstractContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
});
