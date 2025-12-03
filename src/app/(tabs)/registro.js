import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Componente de contenedor animado multiplataforma
const AnimatedContainer = ({ children, fadeAnim, slideAnim, style }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.animatedContainer, style]}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        style, 
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
};

// --- Componentes Reutilizables (Movidos fuera de RegisterScreen) ---

const Logo = ({ deviceType }) => (
  <Svg width={deviceType === 'mobile' ? 260 : 320} height={80} viewBox="0 0 400 80">
    <SvgText x="10" y="55" fontSize="45" fontWeight="900" fill="white" fontStyle="italic">
      Impul
    </SvgText>
    <SvgText x="160" y="55" fontSize="45" fontWeight="900" fill="#00d4ff" fontStyle="italic">
      satech
    </SvgText>
    <Line x1="0" y1="50" x2="80" y2="50" stroke="white" strokeWidth="2" opacity="0.5" />
  </Svg>
);

const WaveDivider = () => (
  <Svg width={width} height={40} viewBox={`0 0 ${width} 40`}>
    <Path
      d={`M0,20 Q${width/4},10 ${width/2},20 T${width},20`}
      stroke="white"
      strokeWidth="2"
      fill="none"
      opacity="0.3"
    />
  </Svg>
);

const PeruFlag = ({ size = 'small' }) => {
  const flagWidth = size === 'small' ? 120 : 180;
  const flagHeight = size === 'small' ? 80 : 120;
  const sectionWidth = flagWidth / 3;

  return (
    <View style={[styles.flag, { width: flagWidth, height: flagHeight }]}>
      <View style={[styles.flagSection, { width: sectionWidth, backgroundColor: '#D91023' }]} />
      <View style={[styles.flagSection, { width: sectionWidth, backgroundColor: '#FFFFFF' }]}>
        <Text style={styles.flagShield}>🛡️</Text>
      </View>
      <View style={[styles.flagSection, { width: sectionWidth, backgroundColor: '#D91023' }]} />
    </View>
  );
};

const FormInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  maxLength,
  showPassword,
  onToggleShowPassword,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    {secureTextEntry ? (
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={onToggleShowPassword}
        >
          <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        maxLength={maxLength}
        autoCapitalize={label.includes('Correo') ? 'none' : 'words'}
      />
    )}
  </View>
);

const BackToLoginButton = ({ router }) => (
  <TouchableOpacity 
    style={styles.backButton} 
    onPress={() => router.back()}
  >
    <Text style={styles.backButtonText}>← Volver al Login</Text>
  </TouchableOpacity>
);

// --- Componente Principal de la Pantalla ---

const RegisterScreen = () => {
  const router = useRouter();
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [numero, setNumero] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deviceType, setDeviceType] = useState('mobile');

  // Animaciones solo para móvil/nativo
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    
    if (isMobile) setDeviceType('mobile');
    else if (isTablet) setDeviceType('tablet');
    else setDeviceType('desktop');

    // Solo ejecutar animaciones Animated API en dispositivos nativos
    if (Platform.OS !== 'web') {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // Para web, las animaciones se manejan via CSS
  }, []);

  const handleRegister = async () => {
    // Validaciones
    if (!nombres || !apellidos || !dni || !email || !numero || !username || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (dni.length !== 8) {
      Alert.alert('Error', 'El DNI debe tener 8 dígitos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.1.5:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombres,
          apellidos,
          dni,
          email,
          numero,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Registro exitoso. Ahora puedes iniciar sesión', [
          {
            text: 'OK',
            onPress: () => {
              router.push('/');
            }
          }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Error al registrar');
      }
    } catch (err) {
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Layout MÓVIL
  if (deviceType === 'mobile') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <LinearGradient colors={['#1e40af', '#1e3a8a']} style={styles.gradient}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <AnimatedContainer
              fadeAnim={fadeAnim}
              slideAnim={slideAnim}
              style={{
                width: '100%',
                alignItems: 'center',
                padding: 20,
              }}
            >
              {/* Header */}
              <View style={styles.header}>
                <Logo deviceType={deviceType} />
                <View style={{ height: 10 }} />
                <WaveDivider />
              </View>

              {/* Formulario */}
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Registrate</Text>

                <FormInput
                  label="Nombres:"
                  placeholder="Nombres"
                  value={nombres}
                  onChangeText={setNombres}
                />

                <FormInput
                  label="Apellidos:"
                  placeholder="Apellidos"
                  value={apellidos}
                  onChangeText={setApellidos}
                />

                <FormInput
                  label="DNI:"
                  placeholder="DNI"
                  value={dni}
                  onChangeText={setDni}
                  keyboardType="numeric"
                  maxLength={8}
                />

                <FormInput
                  label="Correo Electronico:"
                  placeholder="Correo Electronico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />

                <FormInput
                  label="Numero:"
                  placeholder="Numero de Celular"
                  value={numero}
                  onChangeText={setNumero}
                  keyboardType="phone-pad"
                  maxLength={9}
                />

                <FormInput
                  label="Usuario:"
                  placeholder="Usuario"
                  value={username}
                  onChangeText={setUsername}
                />

                <FormInput
                  label="Contraseña:"
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  showPassword={showPassword}
                  onToggleShowPassword={() => setShowPassword(!showPassword)}
                />

                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#7c3aed', '#6d28d9']}
                    style={styles.registerButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.registerButtonText}>Registrarse</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <BackToLoginButton router={router} />
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <PeruFlag size="small" />
              </View>
            </AnimatedContainer>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  // Layout TABLET
  if (deviceType === 'tablet') {
    return (
      <LinearGradient colors={['#4c1d95', '#1e3a8a', '#1e40af']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.tabletScrollContent}>
          <AnimatedContainer
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
            style={{
              width: '100%',
            }}
          >
            <View style={styles.tabletContainer}>
              {/* Lado izquierdo - Info */}
              <View style={styles.tabletLeft}>
                <Logo deviceType={deviceType} />
                <View style={{ height: 40 }} />
                
                <Text style={styles.tabletMainText}>
                  ¡Únete a ImpulsaTech!
                </Text>
                
                <Text style={styles.tabletSubText}>
                  Crea tu cuenta y comienza tu camino hacia el éxito en tecnología
                </Text>
                
                <View style={{ height: 40 }} />
                <PeruFlag size="large" />
              </View>

              {/* Lado derecho - Formulario */}
              <View style={styles.tabletRight}>
                <View style={[styles.formContainer, { maxWidth: 450 }]}>
                  <Text style={[styles.formTitle, { fontSize: 26 }]}>Registrate</Text>

                  <View style={styles.twoColumns}>
                    <View style={styles.column}>
                      <FormInput
                        label="Nombres:"
                        placeholder="Nombres"
                        value={nombres}
                        onChangeText={setNombres}
                      />
                    </View>
                    <View style={styles.column}>
                      <FormInput
                        label="Apellidos:"
                        placeholder="Apellidos"
                        value={apellidos}
                        onChangeText={setApellidos}
                      />
                    </View>
                  </View>

                  <View style={styles.twoColumns}>
                    <View style={styles.column}>
                      <FormInput
                        label="DNI:"
                        placeholder="DNI"
                        value={dni}
                        onChangeText={setDni}
                        keyboardType="numeric"
                        maxLength={8}
                      />
                    </View>
                    <View style={styles.column}>
                      <FormInput
                        label="Numero:"
                        placeholder="Celular"
                        value={numero}
                        onChangeText={setNumero}
                        keyboardType="phone-pad"
                        maxLength={9}
                      />
                    </View>
                  </View>

                  <FormInput
                    label="Correo Electronico:"
                    placeholder="Correo Electronico"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                  />

                  <FormInput
                    label="Usuario:"
                    placeholder="Usuario"
                    value={username}
                    onChangeText={setUsername}
                  />

                  <FormInput
                    label="Contraseña:"
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                    showPassword={showPassword}
                    onToggleShowPassword={() => setShowPassword(!showPassword)}
                  />

                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['#7c3aed', '#6d28d9']}
                      style={styles.registerButtonGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={[styles.registerButtonText, { fontSize: 18 }]}>
                          Registrarse
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <BackToLoginButton router={router} />
                </View>
              </View>
            </View>
          </AnimatedContainer>
        </ScrollView>
      </LinearGradient>
    );
  }

  // Layout DESKTOP
  return (
    <LinearGradient colors={['#4c1d95', '#1e3a8a', '#1e40af']} style={styles.gradient}>
      <View style={styles.desktopContainer}>
        {/* Panel izquierdo */}
        <View style={styles.desktopLeft}>
          <View style={styles.desktopLeftContent}>
            <Logo deviceType={deviceType} />
            <View style={{ height: 40 }} />
            
            <Text style={styles.desktopMainText}>
              "Tu futuro en tecnología empieza hoy. Sin barreras."
            </Text>
            
            <Text style={styles.desktopSubText}>
              "Accede a los mejores cursos de IA, Robótica y más. Paga solo cuando consigas el trabajo de tus sueños."
            </Text>
            
            <View style={{ height: 40 }} />
            <PeruFlag size="large" />
          </View>
        </View>

        {/* Panel derecho */}
        <View style={styles.desktopRight}>
          <ScrollView contentContainerStyle={styles.desktopScrollContent}>
            <AnimatedContainer
              fadeAnim={fadeAnim}
              slideAnim={slideAnim}
              style={{
                width: '100%',
              }}
            >
              <View style={[styles.formContainer, { maxWidth: 500, marginVertical: 20 }]}>
                <Text style={[styles.formTitle, { fontSize: 28 }]}>Registrate</Text>

                <View style={styles.twoColumns}>
                  <View style={styles.column}>
                    <FormInput
                      label="Nombres:"
                      placeholder="Nombres"
                      value={nombres}
                      onChangeText={setNombres}
                    />
                  </View>
                  <View style={styles.column}>
                    <FormInput
                      label="Apellidos:"
                      placeholder="Apellidos"
                      value={apellidos}
                      onChangeText={setApellidos}
                    />
                  </View>
                </View>

                <View style={styles.twoColumns}>
                  <View style={styles.column}>
                    <FormInput
                      label="DNI:"
                      placeholder="DNI"
                      value={dni}
                      onChangeText={setDni}
                      keyboardType="numeric"
                      maxLength={8}
                    />
                  </View>
                  <View style={styles.column}>
                    <FormInput
                      label="Numero:"
                      placeholder="Numero de Celular"
                      value={numero}
                      onChangeText={setNumero}
                      keyboardType="phone-pad"
                      maxLength={9}
                    />
                  </View>
                </View>

                <FormInput
                  label="Correo Electronico:"
                  placeholder="Correo Electronico"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />

                <FormInput
                  label="Usuario:"
                  placeholder="Usuario"
                  value={username}
                  onChangeText={setUsername}
                />

                <FormInput
                  label="Contraseña:"
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  showPassword={showPassword}
                  onToggleShowPassword={() => setShowPassword(!showPassword)}
                />

                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#7c3aed', '#6d28d9']}
                    style={[styles.registerButtonGradient, { paddingVertical: 16 }]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={[styles.registerButtonText, { fontSize: 18 }]}>
                        Registrarse
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <BackToLoginButton router={router} />
              </View>
            </AnimatedContainer>
          </ScrollView>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  // Estilos de animación para web
  animatedContainer: Platform.OS === 'web' ? {
    animation: '$fadeInUp 0.8s ease-out forwards',
  } : {},
  // Keyframes CSS para web
  ...(Platform.OS === 'web' ? {
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
  } : {}),
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    width: '100%',
    maxWidth: 400,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1f2937',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  registerButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#22d3ee',
    fontSize: 16,
    fontWeight: '600',
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
  flagShield: {
    fontSize: 32,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  column: {
    flex: 1,
  },
  // Tablet styles
  tabletScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
  },
  tabletContainer: {
    flexDirection: 'row',
    gap: 40,
    alignItems: 'center',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  tabletLeft: {
    flex: 1,
    alignItems: 'center',
  },
  tabletRight: {
    flex: 1,
    alignItems: 'center',
  },
  tabletMainText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4ade80',
    textAlign: 'center',
    marginBottom: 16,
  },
  tabletSubText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 26,
  },
  // Desktop styles
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  desktopLeftContent: {
    maxWidth: 600,
  },
  desktopRight: {
    flex: 1,
    justifyContent: 'center',
  },
  desktopScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopMainText: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#4ade80',
    lineHeight: 52,
    marginBottom: 24,
  },
  desktopSubText: {
    fontSize: 20,
    color: '#fff',
    lineHeight: 30,
  },
});

export default RegisterScreen;