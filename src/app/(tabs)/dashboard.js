// screens/DashboardScreen.js (Actualización)
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import BottomBar from '../../../components/BottomBar'; // Importar la nueva barra inferior
import SideMenu from '../../../components/SideMenu';
import { useDeviceType } from '../../../hooks/useDeviceType'; // Asume que el hook existe
import courses, { convenios } from '../../app/(tabs)/mockData'; // Importar mockData
const { width } = Dimensions.get('window');

// --- Paleta de Colores (Ajustada a los nuevos fondos azules oscuros) ---
const COLORS = {
  // Estos son los colores base para el fondo de las tarjetas y contenedores
  BACKGROUND_DARK: '#121212',
  CONTAINER_DARK: '#0D1B4C', // Color de fondo principal para Tablet y Desktop
  HEADER_BLUE: '#191970', // Color para el header/sidebar de Tablet
  WHITE: '#FFFFFF',
  TEXT_LIGHT: '#ADD8E6',
  TEXT_GRAY: '#CCCCCC',
  CARD_BG: '#FFFFFF',
  ACCENT_GREEN: '#4ade80',
  ACCENT_PURPLE: '#8A2BE2',
  TEXT_MAIN_BLUE: '#4990E2', // Azul que se ve en el texto 'Hola, Admin'
};

// --- Componentes Reutilizables ---

const SimpleLogo = ({ style, isTablet, isDesktop }) => {
  // Selecciona el estilo de la imagen basado en el dispositivo
  const containerStyle = [
    styles.logoContainer, // Estilo base/móvil
    isTablet && styles.logoContainerTablet,
    isDesktop && styles.logoContainerDesktop,
  ]

  return (
    <View style={[style, containerStyle]}>
      <Image source={require('../../../assets/images/LOGO (1).png')} style={styles.logoImage} resizeMode="stretch" />
    </View>
  );
};

const SearchBar = ({ searchText, setSearchText, placeholder = 'buscar', style }) => (
  <View style={[styles.searchContainer, style]}>
    <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
    <TextInput
      style={styles.searchInput}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      value={searchText}
      onChangeText={setSearchText}
    />
  </View>
);

const ConvenioCard = ({ convenio, isTablet }) => (
  <View style={[styles.convenioCard, isTablet && { width: 90, height: 90 }]}>
    {/* Usar una View Placeholder para simular la imagen del logo */}
    <View style={styles.convenioLogoPlaceholder}>
        <Text style={styles.convenioLogoText}>{convenio.name.substring(0,4).toUpperCase()}</Text>
    </View>
    {/* La imagen de referencia en Tablet y Desktop usa logos más realistas, 
        pero mantendremos texto placeholder por simplicidad */}
  </View>
);

const CourseCard = ({ course, router, isRecommended = false }) => (
  <TouchableOpacity 
    style={[styles.courseCard, isRecommended && styles.recommendedCard]}
    onPress={() => router.push({ pathname: 'CourseDetail', params: { id: course.id } })}
  >
    <View style={styles.courseContent}>
      <Text style={styles.courseTitleSmall}>{course.title}</Text>
      <Text style={styles.detailTextSmall}>detalle:</Text>
      <Text style={styles.detailTextSmall}>Períodos:</Text>
      
      <View style={styles.periodosList}>
        {course.periods.slice(0, 3).map((period, index) => (
          <View key={index} style={styles.detailItem}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.ACCENT_GREEN} />
            <Text style={styles.detailTextSmall}>
              {period.name.split(' ')[0]} {period.name.includes('Avanzado') ? 'avanzado' : 'básico'}: {period.duration}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.viewCourseButton}>
        <Text style={styles.viewCourseText}>Ver curso</Text>
      </TouchableOpacity>
    </View>

    {/* Imagen del curso (Python/Java logo) */}
    <View style={styles.courseImageWrapper}>
      <Text style={styles.courseIconLarge}>{course.logoIcon}</Text>
    </View>
  </TouchableOpacity>
);

// --- Diseño Específico para DESKTOP (Referencia: image_385d9b.png) ---
const DesktopLayout = ({ userName, router, courses, convenios }) => {
  const [searchText, setSearchText] = useState('');

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchText.toLowerCase())
  );
  const filteredConvenios = convenios.filter(convenio =>
    convenio.name.toLowerCase().includes(searchText.toLowerCase())
  );
  
  const recommendedCourses = filteredCourses.filter((_, index) => index < 2);
  const otherCourses = filteredCourses.filter((_, index) => index >= 2);

  return (
    <View style={styles.desktopContainer}>
      {/* Sidebar/Header (Horizontal) */}
      <View style={styles.desktopHeader}>
        <SimpleLogo style={styles.desktopLogo} isDesktop={true} />
        <SearchBar 
          searchText={searchText} 
          setSearchText={setSearchText} 
          placeholder="Buscar..."
          style={styles.desktopSearchBar}
        />
        <View style={styles.desktopNav}>
          <Ionicons name="home-outline" size={28} color={COLORS.WHITE} style={styles.navIcon} />
          <Ionicons name="star-outline" size={28} color={COLORS.WHITE} style={styles.navIcon} />
          <Ionicons name="school" size={28} color={COLORS.ACCENT_PURPLE} style={styles.navIcon} />
        </View>
      </View>

      {/* Main Content (2 Column Layout) */}
      <View style={styles.desktopContentWrapper}>
        {/* Columna Izquierda: Cursos Recomendados */}
        <View style={styles.desktopLeftColumn}>
          <Text style={[styles.desktopSectionTitle, { color: COLORS.WHITE }]}>Cursos recomendados</Text>
          {recommendedCourses.map((course, index) => (
            <View key={course.id}>
              <Text style={styles.desktopCourseLabel}>Curso {index + 1}</Text>
              <CourseCard course={course} router={router} isRecommended={true} />
            </View>
          ))}
          {otherCourses.map((course, index) => (
             <View key={course.id}>
              <Text style={styles.desktopCourseLabel}>Curso {recommendedCourses.length + index + 1}</Text>
              <CourseCard course={course} router={router} isRecommended={true} />
            </View>
          ))}
        </View>

        {/* Columna Derecha: Hola Admin y Convenios */}
        <View style={styles.desktopRightColumn}>
          <Text style={styles.desktopGreetingText}>Hola, {userName}</Text>
          
          <Text style={[styles.desktopSectionTitle, { marginTop: 40 }]}>CONVENIOS</Text>
          <View style={styles.desktopConveniosGrid}>
            {filteredConvenios.slice(0, 6).map(convenio => (
              <ConvenioCard key={convenio.id} convenio={convenio} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

// --- Diseño Específico para TABLET (Referencia: image_385ddb.png) ---
const TabletLayout = ({ userName, router, courses, convenios }) => {
  const [searchText, setSearchText] = useState('');
  const recommendedCourses = courses.filter((_, index) => index < 3);

  // Filtrar convenios basado en la búsqueda
  const filteredConvenios = convenios.filter(convenio =>
    convenio.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.tabletLayoutContainer}>
      {/* Sidebar Fijo Izquierdo */}
      <View style={styles.tabletSidebar}>
        <View style={styles.tabletNavIcons}>
          <Ionicons name="school" size={30} color={COLORS.WHITE} style={styles.navIcon} />
          <Ionicons name="home-outline" size={30} color={COLORS.ACCENT_GREEN} style={styles.navIcon} />
          <Ionicons name="search-outline" size={30} color={COLORS.WHITE} style={styles.navIcon} />
        </View>
        <TouchableOpacity style={styles.tabletLogoutButton}>
          <Ionicons name="log-out-outline" size={30} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Main Content (Scrollable) */}
      <ScrollView style={styles.tabletMainContent}>
        <SimpleLogo style={styles.tabletLogo} isTablet={true} />

        <Text style={styles.tabletGreetingText}>Hola, {userName}</Text>
        
        <SearchBar 
          searchText={searchText} 
          setSearchText={setSearchText} 
          placeholder="Busque la empresa de su preferencia"
          style={styles.tabletSearchBar}
        />
        
        {/* Convenios Section */}
        <View style={styles.tabletSection}>
          <Text style={styles.tabletSectionTitle}>CONVENIOS</Text>
          <View style={styles.tabletConveniosRow}>
            {filteredConvenios.slice(0, 3).map(convenio => (
              <ConvenioCard key={convenio.id} convenio={convenio} isTablet={true} />
            ))}
          </View>
        </View>

        {/* Social Media Icons (Fila Inferior) */}
        <View style={styles.tabletSocialRow}>
          <Ionicons name="logo-facebook" size={40} color="#1877F2" style={styles.socialIcon} />
          <Ionicons name="logo-whatsapp" size={40} color="#25D366" style={styles.socialIcon} />
          <Ionicons name="logo-twitter" size={40} color="#1DA1F2" style={styles.socialIcon} />
          <Ionicons name="logo-tiktok" size={40} color={COLORS.WHITE} style={styles.socialIcon} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Columna Derecha Fija: Cursos Recomendados */}
      <View style={styles.tabletRightColumn}>
        <Text style={styles.tabletRecommendedTitle}>Cursos recomendados</Text>
        {recommendedCourses.map((course, index) => (
          <View key={course.id} style={{ marginBottom: 15 }}>
            <Text style={styles.tabletCourseLabel}>Curso {index + 1}</Text>
            <CourseCard course={course} router={router} isRecommended={true} />
          </View>
        ))}
      </View>
    </View>
  );
};

const MobileLayout = ({ userName, router, courses }) => {
  const [searchText, setSearchText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // <-- Nuevo Estado para el menú
  
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchText.toLowerCase())
  );
  const recommendedCourses = filteredCourses.filter((_, index) => index < 2);
  const otherCourses = filteredCourses.filter((_, index) => index >= 2);

  return (
    <View style={styles.mobileContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.CONTAINER_DARK} />
      
      {/* Header/Greeting (Ajustado para móvil) */}
      <View style={styles.mobileHeader}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setIsMenuOpen(true)}> {/* <-- Toggle Menu */}
          <Ionicons name="menu" size={30} color={COLORS.WHITE} />
        </TouchableOpacity>
        <SimpleLogo style={styles.mobileLogo} />
        <Text style={styles.mobileGreetingText}>Hola, {userName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContentMobile}>
        {/* ... (Contenido principal del Dashboard) ... */}
        <SearchBar 
          searchText={searchText} 
          setSearchText={setSearchText} 
          placeholder="buscar"
          style={styles.mobileSearchBar}
        />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cursos recomendados</Text>
          {recommendedCourses.map(course => (
            // Asegurarse que CourseCard tenga el router para navegar a InscripcionScreen
            <CourseCard key={course.id} course={course} router={router} /> 
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Otros Cursos</Text>
          {otherCourses.map(course => (
            <CourseCard key={course.id} course={course} router={router} />
          ))}
        </View>
        
        <View style={{ height: 100 }} /> 
      </ScrollView>
      
      <BottomBar activeRoute="home" />

      {/* Menú Lateral (Aparece sobre todo) */}
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        userName={userName}
      />

    </View>
  );
};


// --- Lógica Principal del Dashboard ---

const DashboardScreen = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('Cargando...'); // Estado inicial mientras se cargan los datos
  const { isMobile, isTablet, isDesktop } = useDeviceType();

  // Simula la obtención de datos del usuario desde una base de datos o una API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. Obtener los datos del usuario guardados en AsyncStorage durante el login
        const userDataString = await AsyncStorage.getItem('user');
        if (userDataString) {
          // 2. Convertir la cadena de texto a un objeto
          const userData = JSON.parse(userDataString);
          // 3. Actualizar el estado con el nombre del usuario (o username si no hay nombre)
          setUserName(userData.nombres || userData.username || 'Usuario');
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserName('Usuario'); // Un valor por defecto en caso de error
      }
    };

    fetchUserData();
  }, []); // El array vacío asegura que esto se ejecute solo una vez al montar el componente

  // Elegir el layout basado en el tipo de dispositivo
  let LayoutComponent;
  if (isDesktop) {
    LayoutComponent = DesktopLayout;
  } else if (isTablet) {
    LayoutComponent = TabletLayout;
  } else {
    LayoutComponent = MobileLayout;
  }

  // Envolver todo en el degradado base para Desktop/Tablet o usar el fondo sólido
  return (
    <LinearGradient
      colors={isMobile ? [COLORS.CONTAINER_DARK, COLORS.CONTAINER_DARK] : ['#4c1d95', '#1e3a8a']}
      style={styles.fullScreenGradient}
    >
      <LayoutComponent 
        userName={userName} 
        router={router} 
        courses={courses} 
        convenios={convenios} 
      />
    </LinearGradient>
  );
};

// --- Estilos ---

const styles = StyleSheet.create({
  fullScreenGradient: {
    flex: 1,
  },
  
  // =======================================================
  //                 ESTILOS MÓVIL
  // =======================================================
  mobileContainer: {
    flex: 1,
    backgroundColor: COLORS.CONTAINER_DARK, // Fondo sólido oscuro para móvil
  },
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  mobileLogo: {
    flex: 1,
    alignItems: 'center',
    // La altura se define en los contenedores específicos
  },
  logoContainer: { // Contenedor para móvil
    width: 220, // << MUCHO MÁS GRANDE
    height: 60,  // << MUCHO MÁS GRANDE
  },
  logoContainerTablet: { // Contenedor para tablet
    width: 280, // << MUCHO MÁS GRANDE
    height: 75,  // << MUCHO MÁS GRANDE
  },
  logoContainerDesktop: { // Contenedor para desktop
    width: 200, // << MUCHO MÁS GRANDE
    height: 55,  // << MUCHO MÁS GRANDE
  },
  mobileGreetingText: {
    fontSize: 14,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '600',
    paddingRight: 5,
  },
  menuButton: {
    padding: 5,
  },
  logoImage: { // Estilo único para la imagen
    // La imagen se expandirá para llenar el contenedor, pero 'contain' mantendrá la proporción.
    width: '300', 
    height: '400', 
    marginTop: -150,
    marginLeft:-20
  },
  scrollContentMobile: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  mobileSearchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_LIGHT,
    marginBottom: 15,
  },
  section: {
    marginBottom: 25,
  },


  // =======================================================
  //                 ESTILOS TABLET
  // =======================================================
  tabletLayoutContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.CONTAINER_DARK, // Fondo del área de contenido
  },
  tabletSidebar: {
    width: 80,
    backgroundColor: COLORS.HEADER_BLUE,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabletLogo: {
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  tabletNavIcons: {
    flex: 1,
    gap: 30,
  },
  tabletLogoutButton: {
    marginTop: 50,
  },
  tabletMainContent: {
    flex: 2,
    padding: 30,
    paddingTop: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  tabletRightColumn: {
    width: 300, // Ancho fijo para la columna de cursos recomendados
    backgroundColor: COLORS.HEADER_BLUE,
    padding: 20,
    borderLeftWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabletGreetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_MAIN_BLUE,
    marginBottom: 20,
  },
  tabletSearchBar: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
  },
  tabletSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_LIGHT,
    marginBottom: 10,
  },
  tabletConveniosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabletSocialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  socialIcon: {
    padding: 5,
  },
  tabletRecommendedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.TEXT_LIGHT,
    marginBottom: 15,
    textAlign: 'center',
  },
  tabletCourseLabel: {
    fontSize: 14,
    color: COLORS.TEXT_GRAY,
    marginBottom: 5,
    fontWeight: '600',
  },


  // =======================================================
  //                 ESTILOS DESKTOP
  // =======================================================
  desktopContainer: {
    flex: 1,
    padding: 20,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  desktopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    backgroundColor: COLORS.HEADER_BLUE,
    marginBottom: 20,
  },
  desktopLogo: {
    marginRight: 20,
  },
  desktopSearchBar: {
    flex: 1,
    maxWidth: 400,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  desktopNav: {
    flexDirection: 'row',
    marginLeft: 30,
    gap: 20,
  },
  navIcon: {
    padding: 5,
  },
  desktopContentWrapper: {
    flexDirection: 'row',
    flex: 1,
  },
  desktopLeftColumn: {
    flex: 2,
    paddingRight: 20,
  },
  desktopRightColumn: {
    flex: 1,
    paddingLeft: 20,
  },
  desktopSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.TEXT_MAIN_BLUE,
    marginBottom: 15,
  },
  desktopGreetingText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.TEXT_MAIN_BLUE,
    textAlign: 'right',
    marginBottom: 20,
  },
  desktopCourseLabel: {
    fontSize: 16,
    color: COLORS.TEXT_GRAY,
    marginBottom: 5,
    fontWeight: '600',
  },
  desktopConveniosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },


  // =======================================================
  //                 ESTILOS DE TARJETA (Común)
  // =======================================================
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    padding: 0,
  },
  // Course Card
  courseCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row', // Para colocar imagen a la derecha
    justifyContent: 'space-between',
  },
  recommendedCard: {
    borderLeftWidth: 5,
    borderLeftColor: COLORS.ACCENT_PURPLE,
  },
  courseContent: {
    flex: 1,
  },
  courseTitleSmall: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  detailTextSmall: {
    fontSize: 13,
    color: '#374151',
  },
  periodosList: {
    marginTop: 5,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  viewCourseButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.ACCENT_PURPLE,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 10,
  },
  viewCourseText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 12,
  },
  courseImageWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#e0f2f1',
  },
  courseIconLarge: {
    fontSize: 40,
  },
  // Convenio Card
  convenioCard: {
    width: 120, // Aumentado
    height: 120, // Aumentado
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  convenioLogoPlaceholder: {
    width: '80%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  convenioLogoText: {
    fontSize: 14, // Aumentado
    fontWeight: 'bold',
    color: '#1f2937',
  }
});

export default DashboardScreen;