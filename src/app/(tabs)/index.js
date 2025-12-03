import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Logo, PeruFlag, WaveDivider } from '../../../components/CommonComponents';
import { useDeviceType } from '../../../hooks/useDeviceType';

// Componente para manejar la animación de entrada del formulario
const AnimatedFormContainer = ({ children, fadeAnim, slideAnim }) => {
  if (Platform.OS === 'web') {
    // Usar animación CSS para Web
    return <View style={styles.animatedFormWeb}>{children}</View>;
  }
  // Usar Animated API para Nativo
  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
};

const LoginForm = ({ username, setUsername, password, setPassword, showPassword, setShowPassword, handleLogin, loading, isDesktop, router }) => (
  <View style={[styles.formContainer, isDesktop && { maxWidth: 450 }]}>
    <Text style={[styles.formTitle, isDesktop && { fontSize: 28 }]}>Iniciar Sesión</Text>

    {/* Usuario */}
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Usuario:</Text>
      <TextInput
        style={[styles.input, isDesktop && { paddingVertical: 16 }]}
        placeholder="Usuario"
        placeholderTextColor="#9CA3AF"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
    </View>

    {/* Contraseña */}
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Contraseña:</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput, isDesktop && { paddingVertical: 16 }]}
          placeholder="Contraseña"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={[styles.eyeIcon, isDesktop && { fontSize: 20 }]}>
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Olvidaste Contraseña */}
    <TouchableOpacity>
      <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
    </TouchableOpacity>

    {/* Botón de Login */}
    <TouchableOpacity
      style={styles.loginButton}
      onPress={handleLogin}
      disabled={loading}
    >
      <LinearGradient
        colors={['#7c3aed', '#6d28d9']}
        style={[styles.loginButtonGradient, isDesktop && { paddingVertical: 16 }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.loginButtonText, isDesktop && { fontSize: 18 }]}>Inicia sesión</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>

    {/* Registro */}
    <View style={styles.registerContainer}>
      <Text style={styles.registerText}>No tienes Cuenta </Text>
      <TouchableOpacity onPress={() => router.push('/registro')}>
        <Text style={styles.registerLink}>Regístrate aquí</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const LoginScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { isMobile, isTablet, isDesktop } = useDeviceType();

  // Animaciones para la entrada del formulario (solo nativo)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      // Reemplaza con tu URL de API
      const response = await fetch('http://192.168.1.5:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        } ),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        router.replace('/dashboard');
      } else {
        Alert.alert('Error', data.message || 'Credenciales inválidas');
      }
    } catch (err) {
      Alert.alert('Error', 'Error de conexión. Intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Propiedades comunes para LoginForm
  const loginFormProps = {
    username, setUsername, password, setPassword, showPassword, setShowPassword, handleLogin, loading, isDesktop, router
  };

  // --- Renderizado Único y Adaptable ---

  if (isMobile) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container]}
      >
        <StatusBar 
        translucent={false} 
        hidden={false}
        backgroundColor="#071336"
        barStyle="light-content" // 'light-content' para íconos blancos, 'dark-content' para íconos negros
      />
        <LinearGradient
          colors={['#4c1d95', '#1e3a8a', '#1e40af']}
          style={styles.gradient}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
               <WaveDivider 
               figureType = 'waves'
              position="bottom"
              intensity="low"/>
              <Logo />
             
            </View>

            {/* Contenido principal */}
            <View style={styles.mainContent}>
              <Text style={styles.welcomeText}>Bienvenido</Text>
              <AnimatedFormContainer fadeAnim={fadeAnim} slideAnim={slideAnim}>
                <LoginForm {...loginFormProps} />
              </AnimatedFormContainer>
            </View>

          
            {/* Footer */}
            <View style={styles.footer}>
              <PeruFlag size="small" />
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  if (isTablet) {
    return (
      <LinearGradient
        colors={['#4c1d95', '#1e3a8a', '#1e40af']}
        style={styles.gradient}
      >
           <WaveDivider 
              figureType = 'waves'
              position="bottom"
              intensity="medium"/>
              <Logo />
        <View style={styles.tabletContainer}>
          {/* Lado izquierdo - Bandera */}
          <View style={styles.tabletLeft}>
            <PeruFlag size="large" />
          </View>

          {/* Lado derecho */}
          <View style={styles.tabletRight}>
          
            
            <View style={{ height: 20 }} />
           
            
            <Text style={[styles.welcomeText, { fontSize: 48 }]}>Bienvenido</Text>

            <AnimatedFormContainer fadeAnim={fadeAnim} slideAnim={slideAnim}>
              <LoginForm {...loginFormProps} style={{ width: '100%', maxWidth: 400 }} />
            </AnimatedFormContainer>
          </View>
        </View>
      </LinearGradient>
    );
  }

  // Desktop (Web)
  return (
    <LinearGradient
      colors={['#4c1d95', '#1e3a8a', '#1e40af']}
      style={styles.gradient}
    >
      <View style={styles.desktopContainer}>
        {/* Panel izquierdo */}
        <View style={styles.desktopLeft}>
          <View style={styles.desktopLeftContent}>
            
            <Logo />
            <View style={{ height: 30 }} />
            
            <Text style={styles.desktopMainText}>
              "Tu futuro en tecnología empieza hoy. Sin barreras."
            </Text>
            
            <Text style={styles.desktopSubText}>
              "Accede a los mejores cursos de IA, Robótica y más. Paga solo cuando consigas el trabajo de tus sueños."
            </Text>
            
            <View style={{ height: 30 }} />
            <PeruFlag size="large" />
          </View>
        </View>

        {/* Panel derecho */}
        <View style={styles.desktopRight}>
          <AnimatedFormContainer fadeAnim={fadeAnim} slideAnim={slideAnim}>
            <LoginForm {...loginFormProps} style={{ width: '100%', maxWidth: 450 }} />
          </AnimatedFormContainer>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -100,
  },
  welcomeText: {
    fontSize: 36,
    color: '#22d3ee',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  formContainer: {
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    width: '100%',
    maxWidth: 380,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
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
  forgotPassword: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 20,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loginButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#fff',
    fontSize: 13,
  },
  registerLink: {
    color: '#22d3ee',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  // Tablet styles
  tabletContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 40,
    marginTop: -450,
  },
  tabletLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabletRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Para diferenciar el panel
  },
  desktopLeftContent: {
    maxWidth: 600,
  },
  desktopRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  desktopMainText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 24,
    lineHeight: 48,
  },
  desktopSubText: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 28,
    marginBottom: 20,
  },
  // Animación para Web (CSS Keyframes)
  animatedFormWeb: Platform.OS === 'web' ? {
    animation: '$fadeInUp 0.8s ease-out forwards',
  } : {},
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
});

export default LoginScreen;
