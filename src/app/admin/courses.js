// screens/AdminCourseList.js - Lista de cursos con opciones de editar/eliminar
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import useSafeBack from '../../../components/useSafeBack';
import { API_URL } from '../../config/api';

const COLORS = {
    BACKGROUND: '#0D1B4C',
    CARD_BG: 'rgba(255, 255, 255, 0.1)',
    WHITE: '#FFFFFF',
    ACCENT_PURPLE: '#8A2BE2',
    ACCENT_GREEN: '#4ade80',
    ACCENT_RED: '#EF4444',
    TEXT_LIGHT: '#ADD8E6',
    TEXT_GRAY: '#CCCCCC',
};

const AdminCourseList = () => {
    const router = useRouter();
    const safeBack = useSafeBack();
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        filterCourses();
    }, [searchText, courses]);

    const loadCourses = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/cursos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCourses(data.cursos);
            } else {
                Alert.alert('Error', 'No se pudieron cargar los cursos');
            }
        } catch (error) {
            console.error('Error cargando cursos:', error);
            Alert.alert('Error', 'Error de conexión');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filterCourses = () => {
        if (searchText.trim() === '') {
            setFilteredCourses(courses);
        } else {
            const filtered = courses.filter(course =>
                course.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
                course.categoria.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredCourses(filtered);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadCourses();
    };

    const handleEdit = (course) => {
        router.push({
            pathname: '/admin/course-form',
            params: { courseId: course.id }
        });
    };

    const handleDelete = (course) => {
        Alert.alert(
            'Confirmar eliminación',
            `¿Está seguro que desea eliminar el curso "${course.titulo}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => deleteCourse(course.id)
                }
            ]
        );
    };

    const deleteCourse = async (courseId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/cursos/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                Alert.alert('Éxito', 'Curso eliminado correctamente');
                loadCourses();
            } else {
                Alert.alert('Error', 'No se pudo eliminar el curso');
            }
        } catch (error) {
            console.error('Error eliminando curso:', error);
            Alert.alert('Error', 'Error de conexión');
        }
    };

    const renderCourseItem = ({ item }) => (
        <View style={styles.courseCard}>
            <View style={styles.courseIcon}>
                <Text style={styles.iconText}>{item.logo_icon || '📚'}</Text>
            </View>

            <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{item.titulo}</Text>
                <Text style={styles.courseSubtitle}>{item.subtitulo}</Text>
                <View style={styles.courseMetadata}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{item.categoria}</Text>
                    </View>
                    <Text style={styles.companyText}>{item.company}</Text>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.ACCENT_GREEN }]}
                    onPress={() => handleEdit(item)}
                >
                    <Ionicons name="create-outline" size={20} color={COLORS.WHITE} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.ACCENT_RED }]}
                    onPress={() => handleDelete(item)}
                >
                    <Ionicons name="trash-outline" size={20} color={COLORS.WHITE} />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <LinearGradient colors={['#4c1d95', '#1e3a8a']} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.WHITE} />
                    <Text style={styles.loadingText}>Cargando cursos...</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#4c1d95', '#1e3a8a']} style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={safeBack}>
                    <Ionicons name="arrow-back" size={28} color={COLORS.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Gestionar Cursos</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.TEXT_GRAY} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar curso..."
                    placeholderTextColor={COLORS.TEXT_GRAY}
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText !== '' && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                        <Ionicons name="close-circle" size={20} color={COLORS.TEXT_GRAY} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.statsBar}>
                <Text style={styles.statsText}>
                    {filteredCourses.length} {filteredCourses.length === 1 ? 'curso' : 'cursos'}
                </Text>
            </View>

            <FlatList
                data={filteredCourses}
                renderItem={renderCourseItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="school-outline" size={64} color={COLORS.TEXT_GRAY} />
                        <Text style={styles.emptyText}>No se encontraron cursos</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fabButton}
                onPress={() => router.push('/admin/course-form')}
            >
                <Ionicons name="add" size={32} color={COLORS.WHITE} />
            </TouchableOpacity>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.WHITE,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 12,
        marginHorizontal: 20,
        marginBottom: 15,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.WHITE,
    },
    statsBar: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    statsText: {
        fontSize: 14,
        color: COLORS.TEXT_LIGHT,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    courseCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
    },
    courseIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    iconText: {
        fontSize: 28,
    },
    courseInfo: {
        flex: 1,
    },
    courseTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: 4,
    },
    courseSubtitle: {
        fontSize: 13,
        color: COLORS.TEXT_LIGHT,
        marginBottom: 6,
    },
    courseMetadata: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryBadge: {
        backgroundColor: COLORS.ACCENT_PURPLE,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginRight: 8,
    },
    categoryText: {
        fontSize: 11,
        color: COLORS.WHITE,
        fontWeight: '600',
    },
    companyText: {
        fontSize: 12,
        color: COLORS.TEXT_GRAY,
    },
    actionsContainer: {
        gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.ACCENT_PURPLE,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: COLORS.WHITE,
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: COLORS.TEXT_GRAY,
    },
});

export default AdminCourseList;
