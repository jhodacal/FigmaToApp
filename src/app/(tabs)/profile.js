import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import useSafeBack from '../../../components/useSafeBack';
import { useDeviceType } from '../../../hooks/useDeviceType';

const DARK_BLUE_BG = '#0A0F2D';
const CARD_BLUE = '#1E2A5E';
const ACCENT_YELLOW = '#FFC04D';

// Colores del Dashboard para consistencia en Tablet
const COLORS = {
    BACKGROUND_DARK: '#121212',
    CONTAINER_DARK: '#0D1B4C',
    HEADER_BLUE: '#191970',
    WHITE: '#FFFFFF',
    TEXT_LIGHT: '#ADD8E6',
    TEXT_GRAY: '#CCCCCC',
    TEXT_MAIN_BLUE: '#4990E2',
    ACCENT_GREEN: '#4ade80',
};

const Header = ({ onBackPress }) => (
    <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <AntDesign name="left" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
            <Text style={styles.logoText}>
                <Text style={styles.logoAccent}>Impulsa</Text>
                <Text style={styles.logoBase}>tech</Text>
            </Text>
        </View>
    </View>
);

const TabletLayout = ({ userData, handleBack, router }) => {
    return (
        <View style={styles.tabletLayoutContainer}>
            {/* Sidebar Fijo Izquierdo */}
            <View style={styles.tabletSidebar}>
                <View style={styles.tabletNavIcons}>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
                        <Ionicons name="home-outline" size={30} color={COLORS.WHITE} style={styles.navIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/MyCourses')}>
                        <Ionicons name="school-outline" size={30} color={COLORS.WHITE} style={styles.navIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { }}>
                        <Ionicons name="person" size={30} color={COLORS.ACCENT_GREEN} style={styles.navIcon} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.tabletLogoutButton} onPress={() => router.replace('/')}>
                    <Ionicons name="log-out-outline" size={30} color={COLORS.WHITE} />
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.tabletContentContainer}>
                {/* Header Superior Tablet */}
                <View style={styles.tabletHeader}>
                    <Text style={styles.tabletHeaderTitle}>Mi Perfil</Text>
                    <View style={styles.tabletUserBadge}>
                        <Text style={styles.tabletUserName}>{userData?.nombres || 'Usuario'}</Text>
                        <Ionicons name="person-circle" size={40} color={COLORS.WHITE} />
                    </View>
                </View>

                <ScrollView style={styles.tabletScrollView} contentContainerStyle={styles.tabletScrollContent}>
                    <View style={styles.tabletCard}>
                        <View style={styles.tabletCardHeader}>
                            <Text style={styles.tabletCardTitle}>Información Personal</Text>
                            {userData?.role === 'admin' && (
                                <View style={styles.adminBadge}>
                                    <Text style={styles.adminText}>👑 Administrador</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.divider} />

                        {userData ? (
                            <View style={styles.tabletGridContainer}>
                                <View style={styles.tabletGridItem}>
                                    <Ionicons name="person-outline" size={24} color={ACCENT_YELLOW} />
                                    <View style={styles.dataContent}>
                                        <Text style={styles.dataLabel}>Nombre Completo</Text>
                                        <Text style={styles.dataValue}>{userData.nombres || 'No especificado'}</Text>
                                    </View>
                                </View>

                                <View style={styles.tabletGridItem}>
                                    <Ionicons name="person-circle-outline" size={24} color={ACCENT_YELLOW} />
                                    <View style={styles.dataContent}>
                                        <Text style={styles.dataLabel}>Usuario</Text>
                                        <Text style={styles.dataValue}>{userData.username || 'No especificado'}</Text>
                                    </View>
                                </View>

                                <View style={styles.tabletGridItem}>
                                    <Ionicons name="mail-outline" size={24} color={ACCENT_YELLOW} />
                                    <View style={styles.dataContent}>
                                        <Text style={styles.dataLabel}>Correo Electrónico</Text>
                                        <Text style={styles.dataValue}>{userData.email || 'No especificado'}</Text>
                                    </View>
                                </View>

                                <View style={styles.tabletGridItem}>
                                    <Ionicons name="call-outline" size={24} color={ACCENT_YELLOW} />
                                    <View style={styles.dataContent}>
                                        <Text style={styles.dataLabel}>Teléfono</Text>
                                        <Text style={styles.dataValue}>{userData.telefono || 'No especificado'}</Text>
                                    </View>
                                </View>

                                <View style={styles.tabletGridItem}>
                                    <Ionicons name="calendar-outline" size={24} color={ACCENT_YELLOW} />
                                    <View style={styles.dataContent}>
                                        <Text style={styles.dataLabel}>Fecha de Nacimiento</Text>
                                        <Text style={styles.dataValue}>{userData.fecha_nacimiento ? new Date(userData.fecha_nacimiento).toLocaleDateString() : 'No especificado'}</Text>
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <Text style={styles.noDataText}>No se pudieron cargar los datos del usuario</Text>
                        )}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const ProfileScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const safeBack = useSafeBack();
    const { isTablet } = useDeviceType();

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('user');
            if (userDataString) {
                const user = JSON.parse(userDataString);
                setUserData(user);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.replace('/(tabs)/dashboard');
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={ACCENT_YELLOW} />
                <Text style={styles.loadingText}>Cargando datos...</Text>
            </View>
        );
    }

    // --- TABLET RETURN ---
    if (isTablet) {
        return <TabletLayout userData={userData} handleBack={handleBack} router={router} />;
    }

    // --- MOBILE RETURN (Original) ---
    return (
        <View style={styles.container}>
            <Header onBackPress={handleBack} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Mis Datos</Text>

                    <View style={styles.divider} />

                    {userData ? (
                        <>
                            <View style={styles.dataRow}>
                                <Ionicons name="person-outline" size={20} color={ACCENT_YELLOW} />
                                <View style={styles.dataContent}>
                                    <Text style={styles.dataLabel}>Nombre Completo</Text>
                                    <Text style={styles.dataValue}>{userData.nombres || 'No especificado'}</Text>
                                </View>
                            </View>

                            <View style={styles.dataRow}>
                                <Ionicons name="person-circle-outline" size={20} color={ACCENT_YELLOW} />
                                <View style={styles.dataContent}>
                                    <Text style={styles.dataLabel}>Usuario</Text>
                                    <Text style={styles.dataValue}>{userData.username || 'No especificado'}</Text>
                                </View>
                            </View>

                            <View style={styles.dataRow}>
                                <Ionicons name="mail-outline" size={20} color={ACCENT_YELLOW} />
                                <View style={styles.dataContent}>
                                    <Text style={styles.dataLabel}>Correo Electrónico</Text>
                                    <Text style={styles.dataValue}>{userData.email || 'No especificado'}</Text>
                                </View>
                            </View>

                            <View style={styles.dataRow}>
                                <Ionicons name="call-outline" size={20} color={ACCENT_YELLOW} />
                                <View style={styles.dataContent}>
                                    <Text style={styles.dataLabel}>Teléfono</Text>
                                    <Text style={styles.dataValue}>{userData.telefono || 'No especificado'}</Text>
                                </View>
                            </View>

                            <View style={styles.dataRow}>
                                <Ionicons name="calendar-outline" size={20} color={ACCENT_YELLOW} />
                                <View style={styles.dataContent}>
                                    <Text style={styles.dataLabel}>Fecha de Nacimiento</Text>
                                    <Text style={styles.dataValue}>{userData.fecha_nacimiento ? new Date(userData.fecha_nacimiento).toLocaleDateString() : 'No especificado'}</Text>
                                </View>
                            </View>

                            {userData.role === 'admin' && (
                                <View style={styles.adminBadge}>
                                    <Text style={styles.adminText}>👑 Administrador</Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <Text style={styles.noDataText}>No se pudieron cargar los datos del usuario</Text>
                    )}
                </View>
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
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: Platform.OS === 'ios' ? 90 : 60,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: Platform.OS === 'ios' ? 50 : 20,
        zIndex: 10,
        padding: 5,
    },
    logoContainer: {
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    card: {
        backgroundColor: CARD_BLUE,
        borderRadius: 15,
        padding: 20,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 15,
    },
    dataRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    dataContent: {
        marginLeft: 15,
        flex: 1,
    },
    dataLabel: {
        fontSize: 13,
        color: '#ffffff80',
        marginBottom: 5,
    },
    dataValue: {
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
    noDataText: {
        color: '#ffffff80',
        fontSize: 15,
        textAlign: 'center',
        marginTop: 20,
    },
    adminBadge: {
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
        alignItems: 'center',
    },
    adminText: {
        color: '#4ade80',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // --- STYLES TABLET ---
    tabletLayoutContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: COLORS.CONTAINER_DARK,
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
    tabletNavIcons: {
        marginTop: 20,
        gap: 40,
        alignItems: 'center',
    },
    navIcon: {
        padding: 5,
    },
    tabletLogoutButton: {
        marginBottom: 20,
    },
    tabletContentContainer: {
        flex: 1,
        backgroundColor: COLORS.CONTAINER_DARK,
    },
    tabletHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 20,
        backgroundColor: COLORS.CONTAINER_DARK,
    },
    tabletHeaderTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.TEXT_LIGHT,
    },
    tabletUserBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    tabletUserName: {
        fontSize: 18,
        color: COLORS.WHITE,
        fontWeight: '600',
    },
    tabletScrollView: {
        flex: 1,
        paddingHorizontal: 40,
    },
    tabletScrollContent: {
        paddingBottom: 40,
    },
    tabletCard: {
        backgroundColor: CARD_BLUE,
        borderRadius: 20,
        padding: 40,
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    tabletCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    tabletCardTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.WHITE,
    },
    tabletGridContainer: {
        marginTop: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    tabletGridItem: {
        width: '48%', // Dos columnas
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 15,
        borderRadius: 12,
    },
});

export default ProfileScreen;
