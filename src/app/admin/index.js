// screens/AdminPanel.js - Panel Principal de Administración
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert, Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
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
    TEXT_LIGHT: '#ADD8E6',
};

const AdminPanel = () => {
    const router = useRouter();
    const safeBack = useSafeBack();
    const [userName, setUserName] = useState('Admin');
    const [stats, setStats] = useState({
        totalCursos: 0,
        totalCategorias: 0,
        totalUsuarios: 0,
        cursosRecientes: 0
    });

    useEffect(() => {
        loadUserData();
        loadStats();
    }, []);

    const loadUserData = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('user');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                console.log('👤 Usuario en admin:', userData.username, 'Role:', userData.role);

                // VERIFICAR ROL DE ADMIN (aceptar username 'admin' como fallback si role no viene)
                const isAdmin = userData.role === 'admin' || userData.username === 'admin' || userData.id === 1;
                if (!isAdmin) {
                    console.log('❌ Acceso denegado - No es admin');
                    Alert.alert('Acceso Denegado', 'No tienes permisos de administrador', [
                        { text: 'OK', onPress: () => router.replace('/(tabs)/dashboard') }
                    ]);
                    return;
                }

                console.log('✅ Admin verificado');
                setUserName(userData.nombres || userData.username || 'Admin');
            } else {
                router.replace('/(tabs)/index');
            }
        } catch (error) {
            console.error('Error cargando usuario:', error);
            router.replace('/(tabs)/dashboard');
        }
    };

    const loadStats = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            router.replace('/');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const menuItems = [
        {
            title: 'Gestionar Cursos',
            subtitle: `${stats.totalCursos} cursos disponibles`,
            icon: 'school',
            color: COLORS.ACCENT_PURPLE,
            onPress: () => router.push('/admin/courses')
        },
        {
            title: 'Gestionar Categorías',
            subtitle: `${stats.totalCategorias} categorías`,
            icon: 'pricetags',
            color: COLORS.ACCENT_GREEN,
            onPress: () => router.push('/admin/categories')
        },
        {
            title: 'Gestionar Convenios',
            subtitle: 'Administrar alianzas',
            icon: 'briefcase',
            color: COLORS.ACCENT_PURPLE,
            onPress: () => router.push('/admin/convenios')
        },
        {
            title: 'Estadísticas',
            subtitle: `${stats.cursosRecientes} cursos esta semana`,
            icon: 'stats-chart',
            color: '#3B82F6',
            onPress: () => router.push('/admin/stats')
        },
        {
            title: 'Usuarios',
            subtitle: `${stats.totalUsuarios} usuarios registrados`,
            icon: 'people',
            color: '#F59E0B',
            onPress: () => router.push('/admin/users')
        }
    ];

    return (
        <LinearGradient
            colors={['#4c1d95', '#1e3a8a']}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={safeBack}>
                    <Ionicons name="arrow-back" size={28} color={COLORS.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Panel de Administración</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={28} color="#FF6B6B" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeText}>Bienvenido</Text>
                    <Text style={styles.nameText}>{userName}</Text>
                    <Text style={styles.roleText}>Administrador</Text>
                </View>

                <Text style={styles.sectionTitle}>Gestión del Sistema</Text>

                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuCard}
                        onPress={item.onPress}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                            <Ionicons name={item.icon} size={32} color={COLORS.WHITE} />
                        </View>
                        <View style={styles.menuInfo}>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={COLORS.TEXT_LIGHT} />
                    </TouchableOpacity>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>
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
    scrollContent: {
        padding: 20,
    },
    welcomeCard: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 15,
        padding: 25,
        marginBottom: 30,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 16,
        color: COLORS.TEXT_LIGHT,
        marginBottom: 5,
    },
    nameText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: 5,
    },
    roleText: {
        fontSize: 14,
        color: COLORS.ACCENT_GREEN,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: 15,
    },
    menuCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuInfo: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: 4,
    },
    menuSubtitle: {
        fontSize: 13,
        color: COLORS.TEXT_LIGHT,
    },
});

export default AdminPanel;
