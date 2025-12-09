// hooks/platformStyles.js
// Utilidades globales para estilos específicos de plataforma

import { Platform } from 'react-native';

// ===== COLORES GLOBALES =====
export const COLORS = {
    // Backgrounds
    BACKGROUND_DARK: '#121212',
    CONTAINER_DARK: '#0D1B4C',
    HEADER_BLUE: '#191970',

    // Text
    WHITE: '#FFFFFF',
    TEXT_LIGHT: '#ADD8E6',
    TEXT_GRAY: '#CCCCCC',
    TEXT_MAIN_BLUE: '#4990E2',
    TEXT_DARK: '#1f2937',

    // Cards
    CARD_BG: '#FFFFFF',

    // Accents
    ACCENT_GREEN: '#4ade80',
    ACCENT_PURPLE: '#8A2BE2',
    ACCENT_CYAN: '#22d3ee',

    // Gradients
    GRADIENT_PURPLE: ['#7c3aed', '#6d28d9'],
    GRADIENT_BLUE: ['#4c1d95', '#1e3a8a', '#1e40af'],
    GRADIENT_BLUE_DARK: ['#1e40af', '#1e3a8a'],
};

// ===== TAMAÑOS DE FUENTE =====
export const getFontSize = (baseSize, { isMobile, isTablet, isDesktop }) => {
    if (isDesktop) return baseSize + 4;
    if (isTablet) return baseSize + 2;
    return baseSize;
};

export const FONT_SIZES = {
    small: 12,
    regular: 14,
    medium: 16,
    large: 18,
    xlarge: 22,
    xxlarge: 28,
    title: 36,
};

// ===== ESPACIADO =====
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const getPadding = (baseSize, { isMobile, isTablet, isDesktop }) => {
    if (isDesktop) return baseSize + 8;
    if (isTablet) return baseSize + 4;
    return baseSize;
};

// ===== ESTILOS DE BOTONES =====
export const getButtonStyles = ({ isMobile, isTablet, isDesktop }) => {
    return {
        borderRadius: 12,
        paddingVertical: isDesktop ? 16 : isTablet ? 14 : 12,
        paddingHorizontal: isDesktop ? 24 : isTablet ? 20 : 16,
    };
};

export const getButtonTextSize = ({ isMobile, isTablet, isDesktop }) => {
    if (isDesktop) return 18;
    if (isTablet) return 16;
    return 16;
};

// ===== ESTILOS DE INPUT =====
export const getInputStyles = ({ isMobile, isTablet, isDesktop }) => {
    return {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: isDesktop ? 16 : isTablet ? 14 : 12,
        fontSize: isDesktop ? 16 : 15,
        backgroundColor: COLORS.WHITE,
        color: COLORS.TEXT_DARK,
    };
};

// ===== ESTILOS DE TARJETAS =====
export const getCardStyles = ({ isMobile, isTablet, isDesktop }) => {
    return {
        borderRadius: isDesktop ? 12 : 10,
        padding: isDesktop ? 20 : isTablet ? 18 : 15,
        marginBottom: 15,
        backgroundColor: COLORS.CARD_BG,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    };
};

// ===== TAMAÑOS DE CONTENEDORES =====
export const getContainerMaxWidth = ({ isDesktop, isTablet }) => {
    if (isDesktop) return 1400;
    if (isTablet) return 1200;
    return '100%';
};

export const getFormMaxWidth = ({ isDesktop, isTablet }) => {
    if (isDesktop) return 500;
    if (isTablet) return 450;
    return 400;
};

// ===== HELPERS PARA ANIMACIONES =====
export const getAnimationStyles = () => {
    if (Platform.OS === 'web') {
        return {
            animation: '$fadeInUp 0.8s ease-out forwards',
        };
    }
    return {};
};

export const getKeyframes = () => {
    if (Platform.OS === 'web') {
        return {
            '@keyframes fadeInUp': {
                '0%': {
                    opacity: 0,
                    transform: 'translateY(50px)',
                },
                '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                },
            },
        };
    }
    return {};
};

// ===== ESTILOS DE NAVEGACIÓN =====
export const getHeaderHeight = ({ isMobile, isTablet, isDesktop }) => {
    if (isDesktop) return 80;
    if (isTablet) return 70;
    return 60;
};

// ===== UTILIDAD PARA APLICAR ESTILOS RESPONSIVOS =====
export const responsive = (mobileStyle, tabletStyle, desktopStyle, deviceInfo) => {
    const { isMobile, isTablet, isDesktop } = deviceInfo;
    if (isDesktop && desktopStyle) return desktopStyle;
    if (isTablet && tabletStyle) return tabletStyle;
    return mobileStyle;
};

// ===== TAMAÑOS DE ICONOS =====
export const getIconSize = ({ isMobile, isTablet, isDesktop }) => {
    if (isDesktop) return 28;
    if (isTablet) return 26;
    return 24;
};
