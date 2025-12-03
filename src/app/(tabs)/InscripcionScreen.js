// screens/InscripcionScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
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
  BUTTON_GRADIENT_START: '#4ade80', // Verde vibrante
  BUTTON_GRADIENT_END: '#38b000', // Verde oscuro
  CARD_BG: 'rgba(255, 255, 255, 0.9)', // Tarjeta de acuerdo
  CHECKBOX_BORDER: '#8a2be2', // Púrpura
  LINK_TEXT: '#007AFF',
};

const HeaderInscripcion = ({ router }) => (
  <View style={styles.headerInscripcion}>
    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
      <Ionicons name="arrow-back-outline" size={28} color={COLORS.WHITE} />
    </TouchableOpacity>
    {/* Título y subtítulo */}
    <View>
        <Text style={styles.headerTitle}>Inscripción</Text>
        <Text style={styles.headerSubtitle}>financiamiento</Text>
    </View>
  </View>
);

const BulletPointAcuerdo = ({ text }) => (
  <View style={styles.acuerdoBullet}>
    <Text style={styles.bulletTextAcuerdo}>• {text}</Text>
  </View>
);

const InscripcionScreen = () => {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);
  const { isDesktop, isTablet } = useDeviceType();
  const params = useLocalSearchParams();
  const courseName = params.courseName || '[nombre curso]';

  const handleInscribirse = () => {
    if (!isChecked) {
      Alert.alert('Error', 'Debes leer y aceptar los términos y condiciones.');
      return;
    }
    // Lógica de inscripción aquí
    Alert.alert('Éxito', `Inscripción para ${courseName} completada.`);
  };

  const agreementDetails = [
    'Pagaras el 5% de tu salario mensual',
    'Solo si tu salario es mayor a S/2,000',
    'solo si logras conseguir empleo',
    'Por un máximo de 24 meses',
  ];

  const termsText = "He leído y acepto los términos y condiciones";

  // Determinar el estilo de contenedor principal
  const contentWidthStyle = (isDesktop || isTablet) ? styles.tabletDesktopContent : styles.mobileContent;

  return (
    <LinearGradient
      colors={[COLORS.GRADIENT_START, COLORS.GRADIENT_END]}
      style={styles.container}
    >
      <HeaderInscripcion router={router} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={contentWidthStyle}>

          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Detalle del Acuerdo</Text>
            <Text style={styles.courseNameText}>Curso: {courseName}</Text>
          </View>
          
          {/* Acuerdo de Financiamiento */}
          <View style={styles.acuerdoContainer}>
            {agreementDetails.map((detail, index) => (
              <BulletPointAcuerdo key={index} text={detail} />
            ))}
          </View>

          {/* Checkbox y Términos */}
          <View style={styles.termsContainer}>
            <TouchableOpacity onPress={() => setIsChecked(!isChecked)} style={styles.checkboxWrapper}>
                <View style={[styles.checkbox, isChecked && styles.checked]}>
                    {isChecked && <Ionicons name="checkmark" size={18} color={COLORS.WHITE} />}
                </View>
                <Text style={styles.termsText}>
                    He leído y acepto los 
                    <Text 
                        style={styles.termsLink} 
                        onPress={() => router.push('/terms')} // Navegar a la pantalla de términos
                    > 
                        términos y condiciones
                    </Text>
                </Text>
            </TouchableOpacity>
          </View>

          {/* Botón de Acción */}
          <TouchableOpacity 
            style={styles.inscribirseButton} 
            onPress={handleInscribirse}
            disabled={!isChecked}
          >
            <LinearGradient
              colors={[COLORS.BUTTON_GRADIENT_START, COLORS.BUTTON_GRADIENT_END]}
              style={styles.inscribirseGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.inscribirseText}>Firmar Acuerdo y Empezar a aprender</Text>
            </LinearGradient>
          </TouchableOpacity>
          
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
    paddingVertical: 20,
  },
  mobileContent: {
    width: '100%',
    paddingHorizontal: 30,
    maxWidth: 450,
  },
  tabletDesktopContent: {
    width: '90%',
    maxWidth: 550, 
  },
  // Header
  headerInscripcion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 15,
  },
  headerButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    lineHeight: 35,
  },
  headerSubtitle: {
    fontSize: 24,
    color: COLORS.WHITE,
    fontWeight: '300',
    lineHeight: 28,
  },
  // Tarjeta de Detalle
  detailCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    textAlign: 'center',
  },
  detailCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  courseNameText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  // Acuerdo
  acuerdoContainer: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  acuerdoBullet: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bulletTextAcuerdo: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  // Checkbox y Términos
  termsContainer: {
    marginBottom: 30,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.CHECKBOX_BORDER,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: COLORS.CHECKBOX_BORDER,
  },
  termsText: {
    fontSize: 14,
    color: COLORS.WHITE,
  },
  termsLink: {
    color: COLORS.LINK_TEXT,
    textDecorationLine: 'underline',
  },
  // Botón
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InscripcionScreen;