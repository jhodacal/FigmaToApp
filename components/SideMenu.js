// components/SideMenu.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// --- Paleta de Colores (Consistente con Dashboard) ---
const COLORS = {
  MENU_BG_DARK: '#191970', // Un azul oscuro para el menú
  WHITE: '#FFFFFF',
  TEXT_MAIN_BLUE: '#4990E2', 
  ACCENT_GREEN: '#4ade80',
};

// --- Items del Menú ---
const menuItems = [
  { name: 'Mis Datos', icon: 'person-circle-outline', route: '/profile' },
  { name: 'Inicio', icon: 'home-outline', route: '/dashboard' },
  { name: 'Mis Cursos', icon: 'book-outline', route: '/my-courses' },
  { name: 'Ayuda', icon: 'help-circle-outline', route: '/help' },
  { name: 'Terminos y Condiciones', icon: 'document-text-outline', route: '/terms' },
];

const SideMenu = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [userName, setUserName] = useState('Admin');

  // Animación del menú (solo para el renderizado nativo/web)
  const animatedValue = React.useRef(new Animated.Value(isOpen ? 0 : -width)).current;

  useEffect(() => {
    const getUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name);
      }
    };
    if (isOpen) {
      getUser();
    }
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
    router.push(route);
  };

  if (!isOpen && animatedValue.__getValue() === -width) return null;

  return (
    <>
      {/* Overlay Oscuro */}
      {isOpen && (
        <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />
      )}

      {/* Menú Principal */}
      <Animated.View
        style={[
          styles.menuContainer,
          { transform: [{ translateX: animatedValue }] },
          Platform.OS === 'web' && isOpen && styles.webMenuOpen, // Estilo CSS para web si es necesario
        ]}
      >
        <LinearGradient
            colors={['#1e3a8a', '#4c1d95']}
            style={styles.gradientBackground}
        >
          {/* Header del Menú */}
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
                style={[styles.menuItem, index === 1 && styles.activeItem]} // Inicio activo por defecto
                onPress={() => handleNavigate(item.route)}
              >
                <Ionicons name={item.icon} size={24} color={COLORS.WHITE} style={styles.itemIcon} />
                <Text style={styles.itemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Pie de Página (Cerrar Sesión) */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton} onPress={() => handleNavigate('/logout')}>
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
    width: width * 0.75, // Ocupa el 75% del ancho de la pantalla
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
  // Solo para web, para asegurar que el menú no sea empujado por el layout
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