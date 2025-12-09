import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import useSafeBack from '../../../components/useSafeBack';
import { useDeviceType } from '../../../hooks/useDeviceType';
import { API_URL } from '../../config/api';

// Default banner if none provided
const DEFAULT_BANNER = require('../../../assets/images/default_course_banner.png');

const { width } = Dimensions.get('window');

// --- Componentes Reutilizables ---

// Replicando la paleta de colores sugerida
const COLORS = {
  GRADIENT_START: '#0D1B4C',
  GRADIENT_END: '#4B0082',
  BACKGROUND_DARK: '#121212',
  WHITE: '#FFFFFF',
  TEXT_LIGHT: '#ADD8E6',
  TEXT_GRAY: '#CCCCCC',
  BUTTON_GRADIENT_START: '#FF007F', // Rosa Vibrante
  BUTTON_GRADIENT_END: '#8A2BE2',   // Púrpura Brillante
  ACCENT_GREEN: '#4ade80',
};

const HeaderDetail = ({ router, title, showIcon = true }) => {
  const safeBack = useSafeBack();
  return (
    <View style={styles.headerDetail}>
      <TouchableOpacity onPress={safeBack} style={styles.headerButton}>
        <Ionicons name="arrow-back-outline" size={28} color={COLORS.WHITE} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {showIcon ? (
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="share-social-outline" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 44 }} /> // Placeholder para centrar
      )}
    </View>
  );
};

const BulletPoint = ({ text }) => (
  <View style={styles.bulletItem}>
    <Ionicons name="checkmark-circle" size={18} color="#4ade80" style={styles.bulletIcon} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const InscribirseButton = ({ onPress, isEnrolled, loading }) => (
  <TouchableOpacity style={styles.inscribirseButton} onPress={onPress} disabled={loading}>
    <LinearGradient
      colors={isEnrolled ? [COLORS.ACCENT_GREEN, '#38b000'] : [COLORS.BUTTON_GRADIENT_START, COLORS.BUTTON_GRADIENT_END]}
      style={styles.inscribirseGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.WHITE} />
      ) : (
        <Text style={styles.inscribirseText}>
          {isEnrolled ? 'VER LECCIONES' : 'INSCRIBIRSE'}
        </Text>
      )}
    </LinearGradient>
  </TouchableOpacity>
);


// --- Lógica Principal del Detalle del Curso ---

const CourseDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const safeBack = useSafeBack();
  const { id } = params;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const { isDesktop } = useDeviceType();
  const contentWidthStyle = isDesktop ? styles.desktopContentArea : styles.mobileContentArea;

  useEffect(() => {
    loadCourseData();
  }, [id]);

  const loadCourseData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      // Cargar datos del curso
      const courseResponse = await fetch(`${API_URL}/cursos/${id}`);
      if (courseResponse.ok) {
        const courseData = await courseResponse.json();
        const curso = courseData.curso;
        setCourse({
          id: curso.id.toString(),
          title: curso.titulo,
          subtitle: curso.subtitulo || '',
          description: curso.descripcion || '',
          logoIcon: curso.logo_icon || '📚',
          bannerUrl: curso.banner_url || null, // Add bannerUrl
          periods: (curso.periods || []).map(p => ({
            name: p.nombre,
            duration: p.duracion
          })),
          learningObjectives: curso.learningObjectives || []
        });
      }

      // Verificar si está inscrito
      if (token) {
        const enrollmentResponse = await fetch(`${API_URL}/cursos/${id}/inscrito`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (enrollmentResponse.ok) {
          const enrollmentData = await enrollmentResponse.json();
          setIsEnrolled(enrollmentData.enrolled);
        }
      }
    } catch (error) {
      console.error('Error cargando curso:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async () => {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      router.push('/(tabs)/index');
      return;
    }

    if (isEnrolled) {
      router.push({ pathname: '/CourseLessons', params: { id } });
    } else {
      router.push({
        pathname: '/(tabs)/InscripcionScreen',
        params: {
          courseId: id,
          courseName: course.titulo
        }
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: COLORS.BACKGROUND_DARK }]}>
        <ActivityIndicator size="large" color={COLORS.WHITE} />
        <Text style={[styles.errorText, { marginTop: 10 }]}>Cargando curso...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Curso no encontrado.</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={safeBack}>
          <Text style={styles.headerTitle}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
      style={styles.container}
    >
      <HeaderDetail router={router} title="Detalle del Curso" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={contentWidthStyle}>
          {/* Banner Superior */}
          <View style={styles.bannerContainer}>
            {course.bannerUrl ? (
              <Image
                source={{ uri: course.bannerUrl }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={DEFAULT_BANNER}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerText}>CURSO {course.title.toUpperCase()}</Text>
            </View>
          </View>

          {/* Contenido Principal del Curso */}
          <View style={styles.detailCard}>
            <Text style={styles.title}>{course.title}</Text>
            <Text style={styles.subtitle}>{course.subtitle}</Text>

            {/* Descripción */}
            <Text style={styles.sectionHeader}>Descripción General</Text>
            <Text style={styles.description}>{course.description}</Text>

            {/* Periodos */}
            {course.periods && course.periods.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Periodos y Duración</Text>
                {course.periods.map((period, index) => (
                  <BulletPoint key={index} text={`${period.name}: ${period.duration}`} />
                ))}
              </>
            )}

            {/* Lo que Aprenderás */}
            {course.learningObjectives && course.learningObjectives.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Lo que aprenderás</Text>
                <View style={styles.learningObjectivesList}>
                  {course.learningObjectives.map((objective, index) => (
                    <BulletPoint key={index} text={objective} />
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Botón Fijo en la parte inferior */}
      <View style={styles.bottomFixedButton}>
        <InscribirseButton onPress={handleEnrollment} isEnrolled={isEnrolled} loading={enrolling} />
      </View>
    </LinearGradient>
  );
};

// --- Estilos ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_DARK,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_DARK,
  },
  errorText: {
    color: COLORS.WHITE,
    fontSize: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Espacio para el botón fijo inferior
    alignItems: 'center', // Para centrar el contenido en desktop
  },
  // Contenedores de ancho limitado para Desktop/Web
  mobileContentArea: {
    width: '100%',
    paddingHorizontal: 20,
  },
  desktopContentArea: {
    width: '100%',
    maxWidth: 600, // Ancho máximo sugerido para legibilidad
    paddingHorizontal: 20,
  },
  // Header
  headerDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.1)', // Sutilmente más oscuro
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  headerButton: {
    padding: 5,
  },
  // Banner
  bannerContainer: {
    marginVertical: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#374151',
    height: width * 0.5 > 300 ? 300 : width * 0.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 5px rgba(0,0,0,0.3)',
      },
    }),
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
  },
  bannerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.TEXT_LIGHT,
    ...Platform.select({
      web: {
        textShadow: '-1px 1px 10px rgba(0,0,0,0.75)',
      },
      default: {
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
      },
    }),
  },
  // Tarjeta de Contenido
  detailCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.WHITE,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ade80', // Verde brillante para headers de sección
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 5,
  },
  description: {
    fontSize: 15,
    color: COLORS.TEXT_GRAY,
    lineHeight: 22,
    marginBottom: 15,
  },
  // Objetivos y Periodos
  learningObjectivesList: {
    marginTop: 5,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.TEXT_GRAY,
    lineHeight: 20,
  },
  // Botón Fijo Inferior
  bottomFixedButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', // Fondo semitransparente
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15, // Ajuste para el 'safe area' de iOS
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inscribirseButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  inscribirseGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inscribirseText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CourseDetailScreen;