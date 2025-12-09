// screens/ConvenioDetailScreen.js
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import useSafeBack from '../../../components/useSafeBack';
import { useDeviceType } from '../../../hooks/useDeviceType';
import { API_URL } from '../../config/api';

// --- Paleta de Colores ---
const COLORS = {
  GRADIENT_START: '#0D1B4C',
  GRADIENT_END: '#4B0082',
  WHITE: '#FFFFFF',
  ACCENT_BLUE: '#4990E2',
  ACCENT_GREEN: '#4ade80',
  SECTION_BG: 'rgba(30, 58, 138, 0.4)',
};

const HeaderConvenio = ({ title }) => {
  const safeBack = useSafeBack();
  return (
    <View style={styles.headerConvenio}>
      <TouchableOpacity onPress={safeBack} style={styles.headerButton}>
        <Ionicons name="arrow-back-outline" size={28} color={COLORS.WHITE} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 44 }} />
    </View>
  );
};

const ConvenioDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isDesktop } = useDeviceType();
  const [convenio, setConvenio] = useState(null);
  const [loading, setLoading] = useState(true);

  const contentWidthStyle = isDesktop ? styles.desktopContentArea : styles.mobileContentArea;

  useEffect(() => {
    if (id) {
      fetchConvenio();
    }
  }, [id]);

  const fetchConvenio = async () => {
    try {
      const response = await fetch(`${API_URL}/convenios/${id}`);
      if (response.ok) {
        const data = await response.json();
        setConvenio(data.convenio);
      } else {
        console.error('Convenio not found');
      }
    } catch (error) {
      console.error('Error fetching convenio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.WHITE} />
      </LinearGradient>
    );
  }

  if (!convenio) {
    return (
      <LinearGradient colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]} style={styles.container}>
        <HeaderConvenio title="Error" />
        <View style={styles.center}>
          <Text style={{ color: COLORS.WHITE }}>Convenio no encontrado.</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
      style={styles.container}
    >
      <HeaderConvenio title={convenio.nombre} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={contentWidthStyle}>

          <View style={styles.logoContainer}>
            {convenio.logo_url && convenio.logo_url.startsWith('http') ? (
              <Image source={{ uri: convenio.logo_url }} style={styles.logoImage} resizeMode="contain" />
            ) : (
              <Text style={styles.logoText}>{convenio.nombre}</Text>
            )}
          </View>

          {/* Sección 1: ¿Quienes somos? */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>¿Quiénes somos?</Text>
            <Text style={styles.sectionBody}>
              {convenio.descripcion || 'Sin descripción disponible.'}
            </Text>
          </View>

          {/* Sección 2: ¿Que requerimos? (Optional / Generic) */}
          <View style={[styles.sectionCard, isDesktop && styles.desktopSectionCard]}>
            <Text style={styles.sectionTitle}>Oportunidades</Text>
            <Text style={styles.sectionBody}>
              En {convenio.nombre}, estamos constantemente en búsqueda de talento. Contáctanos para conocer las vacantes disponibles.
            </Text>
            <TouchableOpacity style={styles.moreInfoButton}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.ACCENT_BLUE} />
              <Text style={styles.moreInfoText}>Solicitar más información</Text>
            </TouchableOpacity>
          </View>

          {/* Icono de Facebook flotante */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    height: 150,
  },
  logoImage: {
    width: '100%',
    height: '100%',
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