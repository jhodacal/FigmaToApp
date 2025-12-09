import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import * as Progress from 'react-native-progress';
import Animated, { FadeIn } from 'react-native-reanimated';
import useSafeBack from '../../../components/useSafeBack';
import { API_URL } from '../../config/api';
const DEFAULT_LOGO = require('../../../assets/images/Impulsatech (1).png');

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const PADDING = 20;
const DARK_BLUE_BG = '#0A0F2D';
const CARD_BLUE = '#1E2A5E';
const ACCENT_YELLOW = '#FFC04D';
const ACCENT_GREEN = '#4ECDC4';

// Componente de Header con botón de retroceso
const Header = ({ onBackPress }) => (
    <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <AntDesign name="left" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
            <View style={{ height: 40, width: 150, justifyContent: 'center' }}>
                <Image
                    source={DEFAULT_LOGO}
                    style={{ width: '250', height: '350', alignSelf: 'center', marginRight: '60' }}
                    resizeMode="contain"
                />
            </View>
            <Text style={styles.headerSubtitle}>Mis Cursos</Text>
        </View>
    </View>
);

// Componente de tarjeta de curso
const CourseCard = ({ course, onPress, onContinue }) => {
    const progress = course.porcentaje_completado || 0;

    return (
        <TouchableOpacity
            style={styles.courseCard}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.cardContent}>
                {/* Icono del curso */}
                <View style={styles.courseIconContainer}>
                    <Text style={styles.courseIcon}>{course.logo_icon || '📚'}</Text>
                    {progress === 100 && (
                        <View style={styles.completedBadgeSmall}>
                            <MaterialCommunityIcons name="check-circle" size={20} color={ACCENT_GREEN} />
                        </View>
                    )}
                </View>

                {/* Información del curso */}
                <View style={styles.courseInfo}>
                    <Text style={styles.courseCategory}>{course.categoria || 'Curso'}</Text>
                    <Text style={styles.courseTitle} numberOfLines={2}>{course.titulo}</Text>

                    {/* Progreso */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBarWrapper}>
                            <Progress.Bar
                                progress={progress / 100}
                                width={null}
                                height={8}
                                color={ACCENT_GREEN}
                                unfilledColor="rgba(255, 255, 255, 0.1)"
                                borderWidth={0}
                                borderRadius={4}
                            />
                        </View>
                        <Text style={styles.progressText}>{progress}%</Text>
                    </View>

                    {/* Lecciones completadas */}
                    <View style={styles.statsContainer}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#ffffff80" />
                        <Text style={styles.statsText}>
                            {course.lecciones_completadas || 0} de {course.total_lecciones || 0} lecciones
                        </Text>
                    </View>
                </View>
            </View>

            {/* Botón de continuar */}
            <TouchableOpacity
                style={styles.continueButton}
                onPress={(e) => {
                    e.stopPropagation();
                    onContinue();
                }}
                activeOpacity={0.7}
            >
                <LinearGradient
                    colors={progress === 100 ? ['#4ECDC4', '#44A08D'] : ['#FF69B4', '#00BFFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.continueGradient}
                >
                    <Text style={styles.continueText}>
                        {progress === 100 ? 'Revisar' : 'Continuar'}
                    </Text>
                    <AntDesign name="right" size={16} color="white" />
                </LinearGradient>
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

// Componente principal
const MyCoursesScreen = () => {
    const router = useRouter();
    const safeBack = useSafeBack();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadMyCourses();
        }, [])
    );

    const loadMyCourses = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            // console.log('🔍 Token obtenido:', token ? 'Existe' : 'NO EXISTE');

            if (!token) {
                // console.log('❌ No hay token, mostrando alerta');
                Alert.alert('Error', 'Debes iniciar sesión para ver tus cursos');
                return;
            }

            // console.log('📡 Haciendo petición a /api/mis-cursos');
            const response = await fetch(`${API_URL}/mis-cursos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // console.log('📥 Respuesta recibida:', response.status);

            if (response.ok) {
                const data = await response.json();
                // console.log('✅ Cursos recibidos:', data.cursos ? data.cursos.length : 0);
                setCourses(data.cursos);
            } else {
                const errorData = await response.json();
                // console.log('❌ Error en respuesta:', errorData);
                Alert.alert('Error', errorData.message || 'No se pudieron cargar los cursos');
            }
        } catch (error) {
            console.error('💥 Error cargando cursos:', error);
            Alert.alert('Error', 'No se pudo conectar con el servidor');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadMyCourses();
    };

    const handleCoursePress = (course) => {
        router.push({
            pathname: '/CourseDetail',
            params: { id: course.id }
        });
    };

    const handleContinueCourse = (course) => {
        router.push({
            pathname: '/CourseLessons',
            params: { id: course.id }
        });
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <StatusBar hidden={true} />
            <MaterialCommunityIcons name="school-outline" size={80} color="#ffffff20" />
            <Text style={styles.emptyTitle}>No tienes cursos inscritos</Text>
            <Text style={styles.emptyText}>
                Explora nuestro catálogo y empieza a aprender
            </Text>
            <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push('/')}
            >
                <LinearGradient
                    colors={['#FF69B4', '#00BFFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.exploreGradient}
                >
                    <Text style={styles.exploreButtonText}>Explorar Cursos</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <StatusBar hidden={true} />
                <ActivityIndicator size="large" color={ACCENT_YELLOW} />
                <Text style={styles.loadingText}>Cargando tus cursos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header onBackPress={() => router.replace('/(tabs)/dashboard')} />
            <StatusBar hidden={true} />
            <FlatList
                data={courses}
                renderItem={({ item, index }) => (
                    <Animated.View entering={FadeIn.delay(index * 100).duration(500)}>
                        <CourseCard
                            course={item}
                            onPress={() => handleCoursePress(item)}
                            onContinue={() => handleContinueCourse(item)}
                        />
                    </Animated.View>
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={courses.length === 0 ? styles.flatListEmpty : styles.flatListContent}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={ACCENT_YELLOW}
                        colors={[ACCENT_YELLOW]}
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DARK_BLUE_BG,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        marginTop: 10,
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingHorizontal: PADDING,
        height: 100,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        padding: 8,
        marginRight: 10,
    },
    headerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    logoAccent: {
        color: '#00BFFF',
    },
    logoBase: {
        color: 'white',
    },
    headerSubtitle: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center',
        marginRight: 50,
        fontWeight: 'bold',
    },
    flatListContent: {
        padding: PADDING,
        paddingBottom: 40,
    },
    flatListEmpty: {
        flex: 1,
    },
    courseCard: {
        backgroundColor: CARD_BLUE,
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    cardContent: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    courseIconContainer: {
        width: 60,
        height: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        position: 'relative',
        padding: 5, // Added padding for better contain fit
    },
    courseIcon: {
        fontSize: 32,
    },
    completedBadgeSmall: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: DARK_BLUE_BG,
        borderRadius: 12,
    },
    courseInfo: {
        flex: 1,
    },
    courseCategory: {
        color: ACCENT_YELLOW,
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    courseTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressBarWrapper: {
        flex: 1,
        marginRight: 10,
    },
    progressText: {
        color: ACCENT_GREEN,
        fontSize: 14,
        fontWeight: 'bold',
        minWidth: 40,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statsText: {
        color: '#ffffff80',
        fontSize: 13,
        marginLeft: 5,
    },
    continueButton: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    continueGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    continueText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    emptyText: {
        color: '#ffffff80',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 30,
    },
    exploreButton: {
        borderRadius: 25,
        overflow: 'hidden',
    },
    exploreGradient: {
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 25,
    },
    exploreButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MyCoursesScreen;
