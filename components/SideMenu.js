// components/SideMenu.js
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { API_URL } from '../src/config/api';

const { width } = Dimensions.get('window');

// --- Paleta de Colores (Consistente con Dashboard) ---
const COLORS = {
  MENU_BG_DARK: '#191970',
  WHITE: '#FFFFFF',
  TEXT_MAIN_BLUE: '#4990E2',
  ACCENT_GREEN: '#4ade80',
};

// --- Items del Menú (se muestra según rol)
// Usuario normal ve estas 5 opciones
const userMenu = [
  { name: 'Mis Datos', icon: 'person-circle-outline', route: '/(tabs)/profile' },
  { name: 'Inicio', icon: 'home-outline', route: '/(tabs)/dashboard' },
  { name: 'Mis Cursos', icon: 'book-outline', route: '/(tabs)/MyCourses' },
  { name: 'Convenios', icon: 'briefcase-outline', route: '/(tabs)/convenios' },
  { name: 'Ayuda', icon: 'help-circle-outline', route: '/(tabs)/help' },
  { name: 'Términos y Condiciones', icon: 'document-text-outline', route: '/(tabs)/terms' },
];

// Admin solo ve Panel de Control
const adminMenu = [
  { name: 'Panel de control', icon: 'speedometer-outline', route: '/admin' },
];

const SideMenu = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [userName, setUserName] = useState('Usuario');
  const [role, setRole] = useState('user');

  const animatedValue = React.useRef(new Animated.Value(isOpen ? 0 : -width)).current;

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.nombres || user.username || 'Usuario');
          // Verificar si es admin
          const isAdmin = user.role === 'admin' || user.id == 1;
          setRole(isAdmin ? 'admin' : 'user');
        }

        const token = await AsyncStorage.getItem('token');
        if (token) {
          try {
            const resp = await fetch(`${API_URL}/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resp.ok) {
              const body = await resp.json();
              const user = body.user || {};
              if (user.nombres) setUserName(user.nombres);
              const isAdmin = user.role === 'admin' || user.id == 1;
              setRole(isAdmin ? 'admin' : 'user');
            }
          } catch (err) {
            console.warn('Profile fetch failed', err);
          }
        }
      } catch (err) {
        console.warn('Error leyendo user desde AsyncStorage', err);
      }
    };

    if (isOpen) getUser();
  }, [isOpen]);

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isOpen ? 0 : -width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const handleNavigate = (route) => {
    onClose();
    if (route === '/(tabs)/convenios') {
      router.push(route);
      return;
    }

    if (route.startsWith('/(tabs)') || route === '/admin') {
      router.replace(route);
    } else {
      router.push(route);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      onClose();
      router.replace('/');
    } catch (err) {
      console.error('Error cerrando sesión', err);
    }
  };

  // Admin solo ve Panel de Control, usuarios normales ven las 5 secciones
  const menuItems = role === 'admin' ? adminMenu : userMenu;

  if (!isOpen && animatedValue.__getValue() === -width) return null;

  return (
    <>
      {isOpen && (
        <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />
      )}

      <Animated.View
        style={[
          styles.menuContainer,
          { transform: [{ translateX: animatedValue }] },
          Platform.OS === 'web' && isOpen && styles.webMenuOpen,
        ]}
      >
        <LinearGradient
          colors={['#1e3a8a', '#4c1d95']}
          style={styles.gradientBackground}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={30} color={COLORS.WHITE} />
            </TouchableOpacity>
            <Text style={styles.greetingText}>
              Hola, <Text style={styles.userNameText}>{userName}</Text>
            </Text>
          </View>

          <ScrollView style={styles.menuItemsContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, index === 0 && styles.activeItem]}
                onPress={() => handleNavigate(item.route)}
              >
                <Ionicons name={item.icon} size={24} color={COLORS.WHITE} style={styles.itemIcon} />
                <Text style={styles.itemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.WHITE} style={styles.itemIcon} />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.75,
    height: '100%',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  gradientBackground: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webMenuOpen: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 30,
    right: 15,
    zIndex: 10,
  },
  greetingText: {
    fontSize: 20,
    color: COLORS.WHITE,
    fontWeight: '300',
  },
  userNameText: {
    fontWeight: 'bold',
  },
  menuItemsContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderLeftWidth: 5,
    borderLeftColor: 'transparent',
  },
  activeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderLeftColor: COLORS.ACCENT_GREEN,
  },
  itemIcon: {
    marginRight: 15,
  },
  itemText: {
    fontSize: 16,
    color: COLORS.WHITE,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 16,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
});

export default SideMenu;