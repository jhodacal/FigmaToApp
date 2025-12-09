import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import YoutubePlayer from 'react-native-youtube-iframe';
import useSafeBack from '../../../components/useSafeBack';
import { API_URL } from '../../config/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const PADDING = 20;
const DARK_BLUE_BG = '#0A0F2D';
const CARD_BLUE = '#1E2A5E';
const ACCENT_YELLOW = '#FFC04D';
const ACCENT_GREEN = '#4ECDC4';

// Función para extraer el video ID de YouTube
const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Componente de Header
const Header = ({ lessonTitle, onBackPress }) => (
    <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <AntDesign name="left" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>{lessonTitle}</Text>
        </View>
    </View>
);

// Componente Principal
const LessonPlayerScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const playerRef = useRef(null);
    const safeBack = useSafeBack();

    const [loading, setLoading] = useState(true);
    const [lesson, setLesson] = useState(null);
    const [videoId, setVideoId] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [allLessons, setAllLessons] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        loadLesson();
        loadAllLessons();
    }, [params.lessonId]);

    const loadLesson = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            if (!token) {
                Alert.alert('Error', 'Debes iniciar sesión');
                safeBack();
                return;
            }

            const response = await fetch(`${API_URL}/lecciones/${params.lessonId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setLesson(data.leccion);
                setCompleted(data.leccion.completada);

                const ytId = getYouTubeVideoId(data.leccion.youtube_url);
                // Fallback ID si no hay URL válida (Video por defecto)
                setVideoId(ytId || 'k3_tw44QsZQ');
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message);
                safeBack();
            }
        } catch (error) {
            console.error('Error cargando lección:', error);
            Alert.alert('Error', 'No se pudo cargar la lección');
        } finally {
            setLoading(false);
        }
    };

    const loadAllLessons = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/cursos/${params.courseId}/lecciones`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAllLessons(data.lecciones);
                const index = data.lecciones.findIndex(l => l.id == params.lessonId);
                setCurrentIndex(index);
            }
        } catch (error) {
            console.error('Error cargando todas las lecciones:', error);
        }
    };

    const markAsCompleted = async () => {
        try {
            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${API_URL}/lecciones/${params.lessonId}/progreso`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completada: true,
                    porcentaje_visto: 100
                })
            });

            if (response.ok) {
                const data = await response.json();
                setCompleted(true);

                const progressMsg = data.new_progress
                    ? `Progreso del curso: ${data.new_progress}%`
                    : 'Lección marcada como completada';

                Alert.alert('¡Excelente!', progressMsg);
            }
        } catch (error) {
            console.error('Error marcando como completada:', error);
            Alert.alert('Error', 'No se pudo actualizar el progreso');
        }
    };

    const navigateToLesson = (direction) => {
        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (newIndex >= 0 && newIndex < allLessons.length) {
            const nextLesson = allLessons[newIndex];
            router.replace({
                pathname: '/LessonPlayer',
                params: {
                    lessonId: nextLesson.id,
                    courseId: params.courseId
                }
            });
        }
    };

    const onStateChange = (state) => {
        if (state === 'ended') {
            if (!completed) {
                markAsCompleted();
            }
        }
    };

    const handleBack = () => {
        safeBack();
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={ACCENT_YELLOW} />
                <Text style={styles.loadingText}>Cargando lección...</Text>
            </View>
        );
    }

    if (!lesson || !videoId) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ffffff40" />
                <Text style={styles.errorText}>No se pudo cargar el video</Text>
                <TouchableOpacity onPress={handleBack} style={styles.backButtonError}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const canGoPrevious = currentIndex > 0;
    const canGoNext = currentIndex < allLessons.length - 1;

    return (
        <View style={styles.container}>
            <Header lessonTitle={lesson.titulo} onBackPress={handleBack} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Reproductor de YouTube */}
                <Animated.View entering={FadeIn.duration(600)} style={styles.playerContainer}>
                    {isWeb ? (
                        <View style={{ height: width * 0.56, width: '100%', backgroundColor: '#000' }}>
                            <iframe
                                title="YouTube Video"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ border: 'none' }}
                            />
                        </View>
                    ) : (
                        <YoutubePlayer
                            ref={playerRef}
                            height={width * 0.56} // 16:9 aspect ratio
                            play={playing}
                            videoId={videoId}
                            onChangeState={onStateChange}
                            webViewProps={{
                                androidLayerType: 'hardware',
                                javaScriptEnabled: true,
                                domStorageEnabled: true
                            }}
                        />
                    )}
                </Animated.View>

                {/* Información de la lección */}
                <Animated.View entering={FadeIn.delay(200).duration(600)} style={styles.infoCard}>
                    <View style={styles.lessonHeader}>
                        <View style={styles.orderBadge}>
                            <Text style={styles.orderText}>Lección {lesson.orden}</Text>
                        </View>
                        {completed && (
                            <View style={styles.completedBadge}>
                                <MaterialCommunityIcons name="check-circle" size={20} color={ACCENT_GREEN} />
                                <Text style={styles.completedText}>Completada</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.lessonTitle}>{lesson.titulo}</Text>

                    <View style={styles.metaContainer}>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={16} color="#ffffff80" />
                            <Text style={styles.metaText}>{lesson.duracion_minutos} minutos</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="school-outline" size={16} color="#ffffff80" />
                            <Text style={styles.metaText}>{lesson.curso_titulo}</Text>
                        </View>
                    </View>

                    {lesson.descripcion && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.sectionTitle}>Descripción</Text>
                            <Text style={styles.description}>{lesson.descripcion}</Text>
                        </>
                    )}
                </Animated.View>

                {/* Botones de acción */}
                <Animated.View entering={FadeIn.delay(400).duration(600)} style={styles.actionsContainer}>
                    {!completed && (
                        <TouchableOpacity
                            style={styles.completeButton}
                            onPress={markAsCompleted}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[ACCENT_GREEN, '#44A08D']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <MaterialCommunityIcons name="check-circle-outline" size={24} color="white" />
                                <Text style={styles.completeButtonText}>Marcar como completada</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {/* Navegación entre lecciones */}
                    <View style={styles.navigationContainer}>
                        <TouchableOpacity
                            style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
                            onPress={() => navigateToLesson('prev')}
                            disabled={!canGoPrevious}
                            activeOpacity={0.7}
                        >
                            <AntDesign name="left" size={20} color={canGoPrevious ? 'white' : '#ffffff40'} />
                            <Text style={[styles.navButtonText, !canGoPrevious && styles.navButtonTextDisabled]}>
                                Anterior
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
                            onPress={() => navigateToLesson('next')}
                            disabled={!canGoNext}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.navButtonText, !canGoNext && styles.navButtonTextDisabled]}>
                                Siguiente
                            </Text>
                            <AntDesign name="right" size={20} color={canGoNext ? 'white' : '#ffffff40'} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>
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
    errorText: {
        color: '#ffffff80',
        fontSize: 16,
        marginTop: 15,
    },
    backButtonError: {
        marginTop: 20,
        backgroundColor: CARD_BLUE,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingHorizontal: PADDING,
        paddingBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    playerContainer: {
        backgroundColor: '#000',
        marginBottom: 20,
    },
    infoCard: {
        backgroundColor: CARD_BLUE,
        marginHorizontal: PADDING,
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
    },
    lessonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    orderBadge: {
        backgroundColor: 'rgba(255, 192, 77, 0.2)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    orderText: {
        color: ACCENT_YELLOW,
        fontSize: 12,
        fontWeight: '700',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(78, 205, 196, 0.2)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    completedText: {
        color: ACCENT_GREEN,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 5,
    },
    lessonTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    metaContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        marginBottom: 5,
    },
    metaText: {
        color: '#ffffff80',
        fontSize: 14,
        marginLeft: 5,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 15,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        color: '#ffffff90',
        fontSize: 15,
        lineHeight: 22,
    },
    actionsContainer: {
        marginHorizontal: PADDING,
    },
    completeButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 15,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    completeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CARD_BLUE,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        flex: 0.48,
        justifyContent: 'center',
    },
    navButtonDisabled: {
        opacity: 0.5,
    },
    navButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginHorizontal: 8,
    },
    navButtonTextDisabled: {
        color: '#ffffff40',
    },
});

export default LessonPlayerScreen;
