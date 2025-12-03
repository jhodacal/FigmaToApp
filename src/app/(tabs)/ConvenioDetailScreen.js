// screens/ConvenioDetailScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDeviceType } from '../../../hooks/useDeviceType';

// --- Paleta de Colores ---
const COLORS = {
  GRADIENT_START: '#0D1B4C',
  GRADIENT_END: '#4B0082',
  WHITE: '#FFFFFF',
  ACCENT_BLUE: '#4990E2',
  ACCENT_GREEN: '#4ade80',
  SECTION_BG: 'rgba(30, 58, 138, 0.4)', // Fondo de las cajas de texto
};

// Mock Data simplificado para un convenio (NTT DATA)
const mockConvenio = {
    id: 'c1',
    name: 'NTT DATA',
    logo: 'NTT DATA', // Placeholder de texto
    description: 'Somos una consultora multinacional de negocios y tecnología que impulsa la transformación y reinvención de las organizaciones a través de la innovación y soluciones tecnológicas avanzadas.',
    requirements: [
        'Consultoría: Consultores de Negocios, Gerentes de Proyectos.',
        'Tecnología: Desarrolladores de Software, Ingenieros en la Nube, Especialistas en Ciberseguridad.',
        'Datos e IA: Analistas de Datos, Ingenieros en Inteligencia Artificial.',
        'Programación: Desarrolladores Full-Stack, Especialistas en DevOps.',
        'Ventas: Gerentes de Cuentas, Consultores de Ventas.',
        'Diseño: Diseñadores UX/UI.',
        'Operaciones: Analistas Financieros, Especialistas en Recursos Humanos.',
        'Programas Especiales: Recién graduados.',
    ],
};


const HeaderConvenio = ({ router, title }) => (
  <View style={styles.headerConvenio}>
    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
      <Ionicons name="arrow-back-outline" size={28} color={COLORS.WHITE} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
    <View style={{ width: 44 }} /> {/* Placeholder para centrar */}
  </View>
);

const ConvenioDetailScreen = () => {
  const router = useRouter();
  const { isDesktop } = useDeviceType();
  // En un caso real, buscarías el convenio por ID usando useLocalSearchParams

  // Usar mock data directamente por ahora
  const convenio = mockConvenio; 
  const contentWidthStyle = isDesktop ? styles.desktopContentArea : styles.mobileContentArea;

  // Componente Logo placeholder NTT DATA
  const NttDataLogo = () => (
    <View style={styles.logoContainer}>
        <Text style={styles.logoText}>{convenio.name}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
      style={styles.container}
    >
      <HeaderConvenio router={router} title={convenio.name} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={contentWidthStyle}>
          
          <NttDataLogo />
          
          {/* Sección 1: ¿Quienes somos? */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>¿Quienes somos?</Text>
            <Text style={styles.sectionBody}>{convenio.description}</Text>
          </View>

          {/* Sección 2: ¿Que requerimos? */}
          <View style={[styles.sectionCard, isDesktop && styles.desktopSectionCard]}>
            <Text style={styles.sectionTitle}>¿Que requerimos?</Text>
            <Text style={styles.sectionBody}>
                En {convenio.name}, buscamos talento para impulsar la innovación y la transformación digital. Únete a nuestro equipo global en roles clave:
            </Text>
            <View style={styles.requirementsList}>
                {convenio.requirements.map((req, index) => (
                    <Text key={index} style={styles.requirementItem}>
                        • {req}
                    </Text>
                ))}
            </View>
            <TouchableOpacity style={styles.moreInfoButton}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.ACCENT_BLUE} />
                <Text style={styles.moreInfoText}>solicitar más información</Text>
            </TouchableOpacity>
          </View>

          {/* Icono de Facebook flotante (simulación) */}
          <View style={styles.facebookFloat}>
            <Ionicons name="logo-facebook" size={30} color={COLORS.WHITE} />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center', 
    paddingBottom: 40,
  },
  mobileContentArea: {
    width: '100%',
    paddingHorizontal: 20,
  },
  desktopContentArea: {
    width: '100%',
    maxWidth: 700, 
    paddingHorizontal: 20,
  },
  // Header
  headerConvenio: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  headerButton: {
    padding: 5,
  },
  // Logo
  logoContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 150, // Altura fija para el banner del logo
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  // Secciones
  sectionCard: {
    backgroundColor: COLORS.SECTION_BG,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  desktopSectionCard: {
    // Para Desktop, hacer las secciones más anchas si es necesario, o mantener el flujo vertical
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.ACCENT_BLUE,
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionBody: {
    fontSize: 15,
    color: COLORS.WHITE,
    lineHeight: 22,
    marginBottom: 15,
  },
  requirementsList: {
    marginTop: 5,
    paddingLeft: 10,
  },
  requirementItem: {
    fontSize: 14,
    color: COLORS.WHITE,
    marginBottom: 8,
    lineHeight: 20,
  },
  moreInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  moreInfoText: {
    fontSize: 14,
    color: COLORS.ACCENT_BLUE,
    marginLeft: 5,
  },
  // Float
  facebookFloat: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1877F2',
    borderRadius: 30,
    padding: 10,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
});

export default ConvenioDetailScreen;    