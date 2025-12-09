// screens/AdminStats.js - Estadísticas Detalladas
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
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
    CARD_BG: 'rgba(255, 255, 255, 0.1)',
    WHITE: '#FFFFFF',
    ACCENT_PURPLE: '#8A2BE2',
    ACCENT_GREEN: '#4ade80',
    ACCENT_BLUE: '#3B82F6',
    ACCENT_ORANGE: '#F59E0B',
    TEXT_LIGHT: '#ADD8E6',
    TEXT_GRAY: '#CCCCCC',
};

const AdminStats = () => {
    const router = useRouter();
    const safeBack = useSafeBack();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

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
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Ionicons name={icon} size={28} color={COLORS.WHITE} />
            </View>
            <View style={styles.statInfo}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
                {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
            </View>
        </View>
    );

    if (loading) {
        return (
            <LinearGradient colors={['#4c1d95', '#1e3a8a']} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.WHITE} />
                    <Text style={styles.loadingText}>Cargando estadísticas...</Text>
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
                <Text style={styles.headerTitle}>Estadísticas del Sistema</Text>
                <TouchableOpacity onPress={loadStats}>
                    <Ionicons name="refresh" size={28} color={COLORS.WHITE} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeTitle}>📊 Panel de Estadísticas</Text>
                    <Text style={styles.welcomeText}>
                        Vista general del rendimiento y actividad de la plataforma
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Estadísticas Generales</Text>

                <StatCard
                    title="Total de Cursos"
                    value={stats?.totalCursos || 0}
                    icon="school"
                    color={COLORS.ACCENT_PURPLE}
                    subtitle="Cursos publicados"
                />

                <StatCard
                    title="Categorías"
                    value={stats?.totalCategorias || 0}
                    icon="pricetags"
                    color={COLORS.ACCENT_GREEN}
                    subtitle="Categorías activas"
                />

                <StatCard
                    title="Usuarios Registrados"
                    value={stats?.totalUsuarios || 0}
                    icon="people"
                    color={COLORS.ACCENT_BLUE}
                    subtitle="Total de usuarios"
                />

                <StatCard
                    title="Cursos Recientes"
                    value={stats?.cursosRecientes || 0}
                    icon="time"
                    color={COLORS.ACCENT_ORANGE}
                    subtitle="Últimos 7 días"
                />

                <View style={styles.detailsCard}>
                    <Text style={styles.detailsTitle}>📈 Detalles Adicionales</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Cursos Activos:</Text>
                        <Text style={styles.detailValue}>{stats?.totalCursos || 0}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Usuarios Admin:</Text>
                        <Text style={styles.detailValue}>
                            {stats?.totalAdmins || 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Usuarios Regular:</Text>
                        <Text style={styles.detailValue}>
                            {(stats?.totalUsuarios || 0) - (stats?.totalAdmins || 0)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Última actualización:</Text>
                        <Text style={styles.detailValue}>
                            {new Date().toLocaleString('es-PE')}
                        </Text>
                    </View>
                </View>

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
        padding: 20,
        marginBottom: 25,
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 14,
        color: COLORS.TEXT_LIGHT,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: 15,
    },
    statCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        borderLeftWidth: 4,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    statInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.WHITE,
    },
    statTitle: {
        fontSize: 14,
        color: COLORS.TEXT_LIGHT,
        marginTop: 2,
    },
    statSubtitle: {
        fontSize: 12,
        color: COLORS.TEXT_GRAY,
        marginTop: 2,
    },
    detailsCard: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 12,
        padding: 20,
        marginTop: 10,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.TEXT_LIGHT,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.WHITE,
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
});

export default AdminStats;
