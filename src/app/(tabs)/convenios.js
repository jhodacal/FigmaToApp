import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import useSafeBack from '../../../components/useSafeBack';
import { useDeviceType } from '../../../hooks/useDeviceType';
import { API_URL } from '../../config/api';

const COLORS = {
    BACKGROUND_DARK: '#0D1B4C',
    CARD_BG: 'rgba(255, 255, 255, 0.1)',
    WHITE: '#FFFFFF',
    ACCENT_PURPLE: '#8A2BE2',
    ACCENT_BLUE: '#4990E2',
    TEXT_GRAY: '#CCCCCC',
};

const ConveniosScreen = () => {
    const router = useRouter();
    const safeBack = useSafeBack();
    const { isMobile, isTablet, isDesktop } = useDeviceType();
    const [convenios, setConvenios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConvenios();
    }, []);

    const fetchConvenios = async () => {
        try {
            const response = await fetch(`${API_URL}/convenios`);
            if (response.ok) {
                const data = await response.json();
                setConvenios(data.convenios);
            }
        } catch (error) {
            console.error('Error fetching convenios:', error);
        } finally {
            setLoading(false);
        }
    };

    const ConvenioCard = ({ convenio }) => (
        <TouchableOpacity
            style={[
                styles.card,
                isMobile ? styles.cardMobile : (isTablet ? styles.cardTablet : styles.cardDesktop)
            ]}
            onPress={() => router.push({ pathname: '/ConvenioDetailScreen', params: { id: convenio.id } })}
        >
            <View style={styles.logoContainer}>
                {convenio.logo_url && convenio.logo_url.startsWith('http') ? (
                    <Image source={{ uri: convenio.logo_url }} style={styles.logo} resizeMode="contain" />
                ) : (
                    <View style={styles.placeholderLogo}>
                        <Text style={styles.placeholderText}>{convenio.nombre.substring(0, 2).toUpperCase()}</Text>
                    </View>
                )}
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{convenio.nombre}</Text>
                <Text style={styles.cardDescription} numberOfLines={3}>
                    {convenio.descripcion || 'Empresa líder en tecnología e innovación. Descubre las oportunidades que ofrecemos.'}
                </Text>
                <View style={styles.cardFooter}>
                    <Text style={styles.seeMore}>Ver más</Text>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.ACCENT_BLUE} />
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <LinearGradient colors={['#0f172a', '#1e3a8a']} style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.WHITE} />
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#0f172a', '#1e3a8a']} style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={safeBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color={COLORS.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nuestros Convenios</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.introContainer}>
                    <Text style={styles.introTitle}>Alianzas Estratégicas</Text>
                    <Text style={styles.introText}>
                        Trabajamos con las empresas más prestigiosas de la industria para ofrecerte las mejores oportunidades laborales y de crecimiento profesional.
                    </Text>
                </View>

                <View style={[styles.grid, isMobile ? styles.gridMobile : styles.gridDesktop]}>
                    {convenios.map((convenio) => (
                        <ConvenioCard key={convenio.id} convenio={convenio} />
                    ))}
                </View>

                {convenios.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="business-outline" size={64} color={COLORS.TEXT_GRAY} />
                        <Text style={styles.emptyText}>Próximamente más convenios.</Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
        paddingBottom: 15,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.WHITE,
    },
    backButton: {
        padding: 5,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    introContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    introTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.ACCENT_PURPLE,
        marginBottom: 10,
        textAlign: 'center',
    },
    introText: {
        fontSize: 16,
        color: COLORS.WHITE,
        textAlign: 'center',
        opacity: 0.9,
        maxWidth: 600,
        lineHeight: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 20,
    },
    card: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 10,
    },
    cardMobile: {
        width: '100%',
    },
    cardTablet: {
        width: '45%',
    },
    cardDesktop: {
        width: '30%',
        maxWidth: 350,
    },
    logoContainer: {
        height: 140,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: '80%',
        height: '80%',
    },
    placeholderLogo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.ACCENT_BLUE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.WHITE,
    },
    cardContent: {
        padding: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        color: COLORS.TEXT_GRAY,
        lineHeight: 20,
        marginBottom: 15,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 5,
    },
    seeMore: {
        color: COLORS.ACCENT_BLUE,
        fontWeight: '600',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: COLORS.TEXT_GRAY,
    },
});

export default ConveniosScreen;
