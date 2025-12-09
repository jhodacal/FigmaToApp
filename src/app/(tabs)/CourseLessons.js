import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Progress from 'react-native-progress';
import { API_URL } from '../../config/api';

const CourseLessons = () => {
    const params = useLocalSearchParams();
    const courseId = params.id || params.courseId;
    const router = useRouter();
    const navigation = useNavigation();
    const [lessons, setLessons] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    const loadLessons = useCallback(async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            const userStr = await AsyncStorage.getItem('user');

            if (!token || !userStr) {
                router.replace('/');
                return;
            }

            const user = JSON.parse(userStr);

            // 1. Obtener detalles del curso
            const courseRes = await fetch(`${API_URL}/cursos/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!courseRes.ok) throw new Error('Error al cargar el curso');
            const courseData = await courseRes.json();
            setCourse(courseData.curso); // Nota: Backend devuelve { curso: {...} } no directo catch

            // 2. Obtener lecciones
            const lessonsRes = await fetch(`${API_URL}/cursos/${courseId}/lecciones`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!lessonsRes.ok) throw new Error('Error al cargar lecciones');
            const lessonsData = await lessonsRes.json();

            // 3. Obtener progreso del usuario
            const progressRes = await fetch(`${API_URL}/cursos/${courseId}/progreso`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (progressRes.ok) {
                const progressData = await progressRes.json();
                setProgress((progressData.porcentaje_completado || 0) / 100);
            }

            // El endpoint de lecciones ya devuelve el estado 'completada' si se envía el token
            const fetchedLessons = lessonsData.lecciones || [];

            // Asegurarnos de marcar completado si viene del backend
            const lessonsWithStatus = fetchedLessons.map(lesson => ({
                ...lesson,
                completed: !!lesson.completada // Convertir a boolean explícito
            }));

            setLessons(lessonsWithStatus);

        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'No se pudieron cargar las lecciones');
        } finally {
            setLoading(false);
        }
    }, [courseId, router]);

    useFocusEffect(
        useCallback(() => {
            loadLessons();
        }, [loadLessons])
    );

    const handleLessonPress = (lesson) => {
        router.push({
            pathname: '/LessonPlayer',
            params: {
                courseId,
                lessonId: lesson.id,
                videoUrl: lesson.video_url,
                title: lesson.titulo,
                description: lesson.descripcion
            }
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4ade80" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* Header */}
            <LinearGradient
                colors={['#1e1b4b', '#312e81']}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigation.canGoBack() ? router.back() : router.replace('/(tabs)/MyCourses')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{course?.titulo || 'Curso'}</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Course Info Card */}
                <View style={styles.courseCard}>
                    <Text style={styles.courseTitle}>{course?.titulo}</Text>
                    <Text style={styles.courseDescription}>{course?.descripcion}</Text>

                    <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>Progreso: {Math.round(progress * 100)}%</Text>
                        <Progress.Bar
                            progress={progress}
                            width={null}
                            height={8}
                            color="#4ade80"
                            unfilledColor="rgba(255,255,255,0.2)"
                            borderWidth={0}
                            style={styles.progressBar}
                        />
                    </View>
                </View>

                {/* Lessons List */}
                <Text style={styles.sectionTitle}>Lecciones</Text>

                {lessons.length === 0 ? (
                    <Text style={styles.emptyText}>No hay lecciones disponibles aún.</Text>
                ) : (
                    lessons.map((lesson, index) => (
                        <TouchableOpacity
                            key={lesson.id}
                            style={styles.lessonItem}
                            onPress={() => handleLessonPress(lesson)}
                        >
                            <View style={[styles.lessonIconContainer, lesson.completed && styles.lessonIconCompleted]}>
                                <Ionicons
                                    name={lesson.completed ? "checkmark" : "play"}
                                    size={20}
                                    color={lesson.completed ? "#fff" : "#94a3b8"}
                                />
                            </View>
                            <View style={styles.lessonContent}>
                                <Text style={styles.lessonTitle}>{index + 1}. {lesson.titulo}</Text>
                                <Text style={styles.lessonDuration}>{lesson.duracion_minutos} min</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#64748b" />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    content: {
        padding: 20,
    },
    courseCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    courseTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    courseDescription: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 20,
        lineHeight: 20,
    },
    progressContainer: {
        marginTop: 10,
    },
    progressText: {
        color: '#4ade80',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    progressBar: {
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },
    lessonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    lessonIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    lessonIconCompleted: {
        backgroundColor: '#22c55e',
    },
    lessonContent: {
        flex: 1,
    },
    lessonTitle: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 4,
    },
    lessonDuration: {
        fontSize: 12,
        color: '#64748b',
    },
    emptyText: {
        color: '#94a3b8',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20
    }
});

export default CourseLessons;
