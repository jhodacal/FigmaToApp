// screens/DashboardScreen.js (Actualización)
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import BottomBar from '../../../components/BottomBar'; // Importar la nueva barra inferior
import SideMenu from '../../../components/SideMenu';
import { useDeviceType } from '../../../hooks/useDeviceType'; // Asume que el hook existe
import { API_URL } from '../../config/api';

const DEFAULT_BANNER = require('../../../assets/images/Impulsatech (1).png'); // Changed fallback to logo as requested or keep banner? User said contain. I will use logo if banner missing? No, stick to banner but resize. Actually, user complained about image style. I will stick to default banner for now but change resizeMode. 
// User mentioned "la imagen del que se muestra en el dashboard creo que debe de usar contain"
// I will keep the banner image but fix the resizeMode in next step.
const DEFAULT_BANNER_IMG = require('../../../assets/images/default_course_banner.png');

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
      <Image source={require('../../../assets/images/Impulsatech (1).png')} style={styles.logoImage} resizeMode="stretch" />
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

const ConvenioCard = ({ convenio, isTablet, isDesktop, router }) => {
  const cardWidth = isTablet ? 220 : (isDesktop ? '100%' : 90);
  const cardHeight = isTablet ? 260 : (isDesktop ? 120 : 90);
  const flexDirection = isDesktop ? 'row' : 'column';

  if (isTablet || isDesktop) {
    return (
      <TouchableOpacity
        style={[
          styles.convenioCard,
          {
            width: cardWidth,
            height: isDesktop ? 'auto' : cardHeight,
            padding: 15,
            flexDirection: flexDirection,
            alignItems: 'center',
            marginBottom: isDesktop ? 10 : 0,
            justifyContent: isDesktop ? 'flex-start' : 'center'
          }
        ]}
        onPress={() => router && router.push({ pathname: '/ConvenioDetailScreen', params: { id: convenio.id } })}
      >
        <View style={[styles.convenioLogoContainer, isDesktop && { width: 60, height: 60, marginBottom: 0, marginRight: 15 }]}>
          {convenio.logo && convenio.logo.startsWith('http') ? (
            <Image source={{ uri: convenio.logo }} style={styles.convenioLogoImage} resizeMode="contain" />
          ) : (
            <View style={styles.placeholderLogoLarge}>
              <Text style={[styles.placeholderTextLarge, isDesktop && { fontSize: 18 }]}>{convenio.name.substring(0, 2).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={{ flex: 1, alignItems: isDesktop ? 'flex-start' : 'center' }}>
          <Text style={[styles.convenioTitle, isDesktop && { textAlign: 'left', height: 'auto', marginBottom: 2 }]} numberOfLines={2}>{convenio.name}</Text>
          <Text style={[styles.convenioDesc, isDesktop && { textAlign: 'left', height: 'auto', marginBottom: 5 }]} numberOfLines={2}>{convenio.description || 'Sin descripción disponible.'}</Text>
          {isTablet && (
            <View style={styles.convenioButton}>
              <Text style={styles.convenioButtonText}>Ver más</Text>
            </View>
          )}
        </View>
        {isDesktop && (
          <Ionicons name="chevron-forward" size={20} color={COLORS.TEXT_GRAY} />
        )}
      </TouchableOpacity>
    );
  }

  // Fallback for Mobile (Simple Icon)
  return (
    <View style={[styles.convenioCard, { width: 90, height: 90 }]}>
      <View style={styles.convenioLogoPlaceholder}>
        <Text style={styles.convenioLogoText}>{convenio.name.substring(0, 4).toUpperCase()}</Text>
      </View>
    </View>
  );
};

const CourseCard = ({ course, router, isRecommended = false }) => {
  // Asegurar que periods existe y es un array
  const periods = course.periods || [];

  return (
    <TouchableOpacity
      style={[styles.courseCard, isRecommended && styles.recommendedCard]}
      onPress={() => router.push({ pathname: '/(tabs)/CourseDetail', params: { id: course.id } })}
    >
      <View style={styles.courseContent}>
        <Text style={styles.courseTitleSmall}>{course.title}</Text>
        <Text style={styles.detailTextSmall}>detalle:</Text>
        {periods.length > 0 && <Text style={styles.detailTextSmall}>Períodos:</Text>}

        <View style={styles.periodosList}>
          {periods.slice(0, 3).map((period, index) => {
            // Manejar ambos formatos: API (nombre/duracion) y local (name/duration)
            const periodName = period.name || period.nombre || '';
            const periodDuration = period.duration || period.duracion || '';

            return (
              <View key={index} style={styles.detailItem}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.ACCENT_GREEN} />
                <Text style={styles.detailTextSmall}>
                  {periodName}: {periodDuration}
                </Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.viewCourseButton}
          onPress={() => router.push({ pathname: '/(tabs)/CourseDetail', params: { id: course.id } })}
        >
          <Text style={styles.viewCourseText}>Ver curso</Text>
        </TouchableOpacity>
      </View>

      {/* Imagen del curso */}
      <View style={styles.courseImageWrapper}>
        <Image
          source={course.bannerUrl ? { uri: course.bannerUrl } : DEFAULT_BANNER_IMG}
          style={styles.courseImage}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
};

// --- Diseño Específico para DESKTOP (Referencia: image_385d9b.png) ---
const DesktopLayout = ({ userName, router, courses, convenios, isAdmin }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas'); // New State

  // Extract unique categories safely
  const categories = ['Todas', ...new Set(courses.map(c => c.category || c.categoria || 'General').filter(Boolean))];

  // Filter courses based on search text AND category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchText.toLowerCase());
    const courseCategory = course.category || course.categoria || 'General';
    const matchesCategory = selectedCategory === 'Todas' || courseCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredConvenios = convenios.filter(convenio =>
    convenio.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const recommendedCourses = filteredCourses.filter((_, index) => index < 2);
  const otherCourses = filteredCourses.filter((_, index) => index >= 2);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  const DEFAULT_LOGO = require('../../../assets/images/Impulsatech (1).png');
  return (
    <View style={styles.desktopContainer}>
      {/* Sidebar/Header (FIXED) */}
      <View style={styles.desktopHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 15 }}>
          {/* Logo */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>

          </View>
          <View style={{ height: 40, width: 150, justifyContent: 'center' }}>
            <Image
              source={DEFAULT_LOGO}
              style={{ width: 350, height: 500, alignSelf: 'center' }}
              resizeMode="contain"
            />
          </View>
          <SearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            placeholder="Buscar cursos..."
            style={styles.desktopSearchBar}
          />

          <View style={styles.desktopNav}>

            {/* Functional Icons */}

            <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboard')}>
              <Ionicons name="home" size={28} color={COLORS.ACCENT_GREEN} style={styles.navIcon} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(tabs)/MyCourses')}>
              <Ionicons name="school-outline" size={28} color={COLORS.WHITE} style={styles.navIcon} />
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity onPress={() => router.push('/admin')}>
                <Ionicons name="speedometer-outline" size={28} color="#FFC04D" style={styles.navIcon} />
              </TouchableOpacity>
            )}

            {/* Help and Terms - HIDDEN for Admins */}
            {!isAdmin && (
              <>
                <TouchableOpacity onPress={() => router.push('/(tabs)/help')}>
                  <Ionicons name="help-circle-outline" size={28} color={COLORS.WHITE} style={styles.navIcon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(tabs)/terms')}>
                  <Ionicons name="document-text-outline" size={28} color={COLORS.WHITE} style={styles.navIcon} />
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={28} color="#FF6B6B" style={styles.navIcon} />
            </TouchableOpacity>


          </View>
        </View>

        {/* Category Filters (Horizontal Scroll) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 5 }}>
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: selectedCategory === cat ? COLORS.ACCENT_PURPLE : 'rgba(255,255,255,0.1)',
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: selectedCategory === cat ? COLORS.ACCENT_PURPLE : 'rgba(255,255,255,0.2)'
              }}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={{ color: COLORS.WHITE, fontWeight: '600' }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content (Scrollable) */}
      <ScrollView style={{ flex: 1, marginTop: 140 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Offset marginTop matches fixed header height approx */}
        <View style={styles.desktopContentWrapper}>
          {/* Columna Izquierda: Cursos Recomendados */}
          <View style={styles.desktopLeftColumn}>
            <Text style={[styles.desktopSectionTitle, { color: COLORS.WHITE }]}>Cursos recomendados</Text>

            {recommendedCourses.length > 0 ? (
              recommendedCourses.map((course, index) => (
                <View key={course.id}>
                  <Text style={styles.desktopCourseLabel}>Curso {index + 1}</Text>
                  <CourseCard course={course} router={router} isRecommended={true} />
                </View>
              ))
            ) : (
              <Text style={{ color: 'rgba(255,255,255,0.5)' }}>No se encontraron cursos.</Text>
            )}

            {/* Otros Cursos */}
            {otherCourses.length > 0 && (
              <>
                <Text style={[styles.desktopSectionTitle, { color: COLORS.WHITE, marginTop: 30 }]}>Otros Cursos</Text>
                {otherCourses.map((course, index) => (
                  <View key={course.id}>
                    <CourseCard course={course} router={router} isRecommended={true} />
                  </View>
                ))}
              </>
            )}

          </View>

          {/* Columna Derecha: Hola Admin y Convenios */}
          <View style={styles.desktopRightColumn}>
            <Text style={styles.desktopGreetingText}>Hola, {userName}</Text>

            <Text style={[styles.desktopSectionTitle, { marginTop: 40 }]}>CONVENIOS</Text>
            <View style={styles.desktopConveniosGrid}>
              <View style={{ gap: 10 }}>
                {filteredConvenios.map(convenio => (
                  <ConvenioCard key={convenio.id} convenio={convenio} isDesktop={true} router={router} />
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// --- Diseño Específico para TABLET (Referencia: image_385ddb.png) ---
const TabletLayout = ({ userName, router, courses, convenios, isAdmin }) => {
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Extract unique categories safely
  const categories = ['Todas', ...new Set(courses.map(c => c.category || c.categoria || 'General').filter(Boolean))];

  // Filter courses based on search text AND category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchText.toLowerCase());
    const courseCategory = course.category || course.categoria || 'General';
    const matchesCategory = selectedCategory === 'Todas' || courseCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const recommendedCourses = filteredCourses.slice(0, 3);
  const otherCourses = filteredCourses.slice(3);

  // Filter convenios based on search
  const filteredConvenios = convenios.filter(convenio =>
    convenio.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.tabletLayoutContainer}>
      {/* Sidebar Fijo Izquierdo */}
      <View style={styles.tabletSidebar}>
        <View style={styles.tabletNavIcons}>
          {/* Home - Inactive on Dashboard */}
          <View style={{ opacity: 0.5 }}>
            <Ionicons name="home" size={30} color={COLORS.ACCENT_GREEN} style={styles.navIcon} />
          </View>

          {/* School - Navigate to MyCourses */}
          <TouchableOpacity onPress={() => router.push('/(tabs)/MyCourses')}>
            <Ionicons name="school-outline" size={30} color={COLORS.WHITE} style={styles.navIcon} />
          </TouchableOpacity>

          {/* Search - Toggle Input */}
          <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
            <Ionicons name={showSearch ? "search" : "search-outline"} size={30} color={showSearch ? COLORS.ACCENT_GREEN : COLORS.WHITE} style={styles.navIcon} />
          </TouchableOpacity>

          {/* Admin Panel - Only for Admins */}
          {isAdmin && (
            <TouchableOpacity onPress={() => router.push('/admin')}>
              <Ionicons name="speedometer-outline" size={30} color={COLORS.WHITE} style={styles.navIcon} />
            </TouchableOpacity>
          )}

          {/* Help and Terms - HIDDEN for Admins */}
          {!isAdmin && (
            <>
              <TouchableOpacity onPress={() => router.push('/(tabs)/help')}>
                <Ionicons name="help-circle-outline" size={30} color={COLORS.WHITE} style={styles.navIcon} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(tabs)/terms')}>
                <Ionicons name="document-text-outline" size={30} color={COLORS.WHITE} style={styles.navIcon} />
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.tabletLogoutButton} onPress={() => router.replace('/')}>
          <Ionicons name="log-out-outline" size={30} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Main Content Area - Split into Fixed Header and Scrollable Body */}
      <View style={[styles.tabletMainContent, { overflow: 'hidden' }]}>

        {/* --- FIXED SECTION (Logo, Header, Search, Categories, Convenios) --- */}
        <View style={{ paddingBottom: 10 }}>
          <SimpleLogo style={styles.tabletLogo} isTablet={true} />

          <Text style={styles.tabletGreetingText}>Hola, {userName}</Text>

          {/* Dynamic Search Bar */}
          {showSearch && (
            <Animated.View entering={FadeIn.duration(300)} style={{ marginBottom: 20 }}>
              <SearchBar
                searchText={searchText}
                setSearchText={setSearchText}
                placeholder="Busque la empresa de su preferencia"
                style={styles.tabletSearchBar}
              />
            </Animated.View>
          )}

          {/* Category Filters */}
          <View style={{ marginBottom: 25 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {categories.map((cat, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    backgroundColor: selectedCategory === cat ? COLORS.ACCENT_PURPLE : 'rgba(255,255,255,0.1)',
                    paddingHorizontal: 20,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: selectedCategory === cat ? COLORS.ACCENT_PURPLE : 'rgba(255,255,255,0.2)'
                  }}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={{ color: COLORS.WHITE, fontWeight: '600' }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Convenios Section - Scroll Horizontal */}
          <View style={styles.tabletSection}>
            <Text style={styles.tabletSectionTitle}>CONVENIOS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 15, paddingRight: 20 }}
            >
              {filteredConvenios.map(convenio => (
                <ConvenioCard key={convenio.id} convenio={convenio} isTablet={true} router={router} />
              ))}
            </ScrollView>
          </View>
        </View>
        <Text style={styles.tabletSectionTitle}>OTROS CURSOS</Text>
        {/* --- SCROLLABLE SECTION (Other Courses, Social Icons) --- */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Otros Cursos Section - Full Width */}
          {otherCourses.length > 0 && (
            <View style={[styles.tabletSection, { marginTop: 10 }]}>

              <View style={{ gap: 15 }}>
                {otherCourses.map(course => (
                  <View key={course.id} style={{ width: '100%' }}>
                    <CourseCard course={course} router={router} />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Social Media Icons (Fila Inferior) */}
          <View style={styles.tabletSocialRow}>
            <Ionicons name="logo-facebook" size={40} color="#1877F2" style={styles.socialIcon} />
            <Ionicons name="logo-whatsapp" size={40} color="#25D366" style={styles.socialIcon} />
            <Ionicons name="logo-twitter" size={40} color="#1DA1F2" style={styles.socialIcon} />
            <Ionicons name="logo-tiktok" size={40} color={COLORS.WHITE} style={styles.socialIcon} />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

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
  const [showSearch, setShowSearch] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todas'); // New State

  // Extract unique categories
  const categories = ['Todas', ...new Set(courses.map(c => c.category || c.categoria || 'General').filter(Boolean))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchText.toLowerCase());
    const courseCategory = course.category || course.categoria || 'General';
    const matchesCategory = selectedCategory === 'Todas' || courseCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const recommendedCourses = filteredCourses.filter((_, index) => index < 2);
  const otherCourses = filteredCourses.filter((_, index) => index >= 2);

  return (
    <View style={styles.mobileContainer}>
      <StatusBar hidden={true} />

      {/* --- FIXED SECTION (Header, Greeting, Search, Categories) --- */}
      <View style={{ backgroundColor: COLORS.CONTAINER_DARK, paddingBottom: 10, zIndex: 5 }}>
        {/* Header */}
        <View style={styles.mobileHeader}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMenuOpen(true)}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="menu" marginTop={30} size={40} color={COLORS.WHITE} />
          </TouchableOpacity>
          <SimpleLogo style={styles.mobileLogo} />
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
          <Text style={styles.mobileGreetingText}>Hola, {userName}</Text>
        </View>

        {/* Dynamic Search Bar */}
        {showSearch && (
          <Animated.View entering={FadeIn.duration(300)} style={{ marginBottom: 15, paddingHorizontal: 20 }}>
            <SearchBar
              searchText={searchText}
              setSearchText={setSearchText}
              placeholder="buscar"
              style={styles.mobileSearchBar}
            />
          </Animated.View>
        )}

        {/* Category Filters */}
        <View style={{ marginBottom: 5 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}
          >
            {categories.map((cat, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: selectedCategory === cat ? COLORS.ACCENT_PURPLE : 'rgba(255,255,255,0.1)',
                  paddingHorizontal: 15,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: selectedCategory === cat ? COLORS.ACCENT_PURPLE : 'rgba(255,255,255,0.2)'
                }}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={{ color: COLORS.WHITE, fontWeight: '600', fontSize: 13 }}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* --- SCROLLABLE SECTION (Course Lists) --- */}
      <ScrollView contentContainerStyle={[styles.scrollContentMobile, { paddingTop: 10 }]}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cursos recomendados</Text>
          {recommendedCourses.map(course => (
            <CourseCard key={course.id} course={course} router={router} />
          ))}
          {recommendedCourses.length === 0 && (
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>No hay recomendaciones</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Otros Cursos</Text>
          {otherCourses.map(course => (
            <CourseCard key={course.id} course={course} router={router} />
          ))}
          {otherCourses.length === 0 && (
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>No se encontraron cursos</Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomBar
        activeRoute={showSearch ? 'search' : 'home'}
        onSearchPress={() => setShowSearch(!showSearch)}
      />

      {/* Menú Lateral */}
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
  const [userName, setUserName] = useState('Cargando...');
  const [isAdmin, setIsAdmin] = useState(false); // New State
  const [courses, setCourses] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isMobile, isTablet, isDesktop } = useDeviceType();

  // Cargar datos del usuario y cursos desde la API
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          // 1. Obtener datos del usuario desde AsyncStorage y Cursos Inscritos
          const userDataString = await AsyncStorage.getItem('user');
          const token = await AsyncStorage.getItem('token');
          let enrolledCourseIds = new Set();

          if (userDataString) {
            const userData = JSON.parse(userDataString);
            setUserName(userData.nombres || userData.username || 'Usuario');
            // Check Admin Status
            setIsAdmin(userData.role === 'admin' || userData.id == 1);
          }

          // Obtener cursos inscritos para filtrar
          if (token) {
            try {
              const enrolledResponse = await fetch(`${API_URL}/mis-cursos`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (enrolledResponse.ok) {
                const enrolledData = await enrolledResponse.json();
                // Asumiendo que enrolledData.cursos es un array de objetos con propiedad 'id'
                if (enrolledData.cursos) {
                  enrolledData.cursos.forEach(c => enrolledCourseIds.add(c.id.toString()));
                }
              }
            } catch (err) {
              console.error('Error fetching enrolled courses:', err);
            }
          }

          // 2. Cargar cursos desde la API
          const cursosResponse = await fetch(`${API_URL}/cursos`);
          if (cursosResponse.ok) {
            const cursosData = await cursosResponse.json();
            // Transformar datos y FILTRAR cursos ya inscritos
            const formattedCourses = cursosData.cursos
              .filter(curso => !enrolledCourseIds.has(curso.id.toString())) // Filter step
              .map(curso => ({
                id: curso.id.toString(),
                title: curso.titulo,
                subtitle: curso.subtitulo || '',
                description: curso.descripcion || '',
                logoIcon: curso.logo_icon || '📚',
                bannerUrl: curso.banner_url || null, // Add bannerUrl
                periods: curso.periods || [],
                learningObjectives: curso.learningObjectives || [],
                category: curso.categoria // Mapping category safely
              }));
            setCourses(formattedCourses);
          }

          // 3. Cargar convenios desde la API
          const conveniosResponse = await fetch(`${API_URL}/convenios`);
          if (conveniosResponse.ok) {
            const conveniosData = await conveniosResponse.json();
            const formattedConvenios = conveniosData.convenios.map(conv => ({
              id: conv.id.toString(),
              name: conv.nombre,
              logo: conv.logo_url,
              description: conv.descripcion
            }));
            setConvenios(formattedConvenios);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setUserName('Usuario');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [])
  );

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
        isAdmin={isAdmin} // Pass isAdmin prop
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
    marginTop: -15,
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
  logoContainerDesktop: { // Contenedor para desktop (IGUAL QUE TABLET AHORA)
    width: 280,
    height: 75,
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
    marginLeft: -20
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
    zIndex: 10,       // Ensure it's above other content
    elevation: 10,    // Android shadow/elevation
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
  // =======================================================
  //                 ESTILOS DESKTOP
  // =======================================================
  desktopContainer: {
    flex: 1,
    // padding: 20, // Removed padding to allow full width header
    width: '100%',
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  desktopHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'column', // Changed to column to stack TopBar and Categories
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.HEADER_BLUE,
    backgroundColor: COLORS.HEADER_BLUE,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 5px rgba(0,0,0,0.3)',
      },
    }),
  },
  desktopLogo: {
    marginRight: 20,
  },
  desktopSearchBar: {
    flex: 1,
    maxWidth: 600,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 20
  },
  desktopNav: {
    flexDirection: 'row',
    gap: 25,
    alignItems: 'center'
  },
  navIcon: {
    padding: 5,
  },
  desktopContentWrapper: {
    flexDirection: 'row',
    flex: 1,
    maxWidth: 1400, // Limit content width
    alignSelf: 'center',
    padding: 20
  },
  desktopLeftColumn: {
    flex: 2,
    paddingRight: 30,
  },
  desktopRightColumn: {
    flex: 1,
    paddingLeft: 30,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)'
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
    padding: 15,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
      },
    }),
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
    backgroundColor: '#374151',
    overflow: 'hidden', // Ensure image stays within radius
  },
  courseImage: { // New style for image
    width: '100%',
    height: '100%',
  },
  // Convenio Card
  convenioCard: {
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  // New Styles for Enhanced Card
  convenioLogoContainer: {
    width: 80,
    height: 80,
    marginBottom: 10,
    backgroundColor: COLORS.WHITE,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    padding: 5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 3px rgba(0,0,0,0.1)',
      },
    }),
  },
  convenioLogoImage: {
    width: '90%',
    height: '90%',
  },
  placeholderLogoLarge: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: COLORS.ACCENT_PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderTextLarge: {
    fontSize: 24,
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  convenioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937', // Dark text on white card
    textAlign: 'center',
    marginBottom: 5,
    height: 40, // Fixed height for 2 lines
  },
  convenioDesc: {
    fontSize: 12,
    color: COLORS.TEXT_GRAY,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 16,
    height: 50, // Fixed height for 3 lines
  },
  convenioButton: {
    marginTop: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: COLORS.ACCENT_PURPLE,
    borderRadius: 15,
  },
  convenioButtonText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;