// components/BottomBar.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// Colores consistentes con la paleta de detalles
const COLORS = {
  GRADIENT_START: '#0D1B4C',
  GRADIENT_END: '#4B0082',
  ACTIVE_COLOR: '#4ade80', // Verde brillante para resaltado
  INACTIVE_COLOR: '#CCCCCC',
  BAR_BG: '#121212',
};

const BottomBar = ({ activeRoute = 'home' }) => {
  const router = useRouter();

  const navItems = [
    { name: 'home', icon: 'home-outline', route: '/dashboard' },
    { name: 'search', icon: 'search-outline', route: '/search' },
    { name: 'favorites', icon: 'star-outline', route: '/favorites' },
  ];

  return (
    <LinearGradient
      colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
      style={styles.bottomBar}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      {navItems.map((item) => {
        const isActive = activeRoute === item.name;
        const color = isActive ? COLORS.ACTIVE_COLOR : COLORS.INACTIVE_COLOR;
        
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => router.push(item.route)}
          >
            <Ionicons name={item.icon} size={26} color={color} />
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    // Ajuste para el 'safe area' de iOS en la parte inferior
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navItem: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.ACTIVE_COLOR,
  }
});

export default BottomBar;