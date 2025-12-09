import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    Image,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import useSafeBack from '../../../components/useSafeBack';
const DEFAULT_LOGO = require('../../../assets/images/Impulsatech (1).png');
const DARK_BLUE_BG = '#0A0F2D';
const CARD_BLUE = '#1E2A5E';
const ACCENT_YELLOW = '#FFC04D';
const ACCENT_GREEN = '#4ECDC4';

const Header = ({ onBackPress }) => (
    <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <AntDesign name="left" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
            <View style={{ height: 400, width: 300, justifyContent: 'center' }}>
                <Image
                    source={DEFAULT_LOGO}
                    style={{ width: '100%', height: '100%', alignSelf: 'center' }}
                    resizeMode="contain"
                />
            </View>

        </View>
    </View>
);

const HelpCard = ({ icon, title, description, onPress, color = ACCENT_YELLOW }) => (
    <TouchableOpacity style={styles.helpCard} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <MaterialCommunityIcons name={icon} size={32} color={color} />
        </View>
        <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>{title}</Text>
            <Text style={styles.helpDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#ffffff40" />
    </TouchableOpacity>
);

const HelpScreen = () => {
    const router = useRouter();
    const safeBack = useSafeBack();

    const handleBack = () => {
        router.replace('/(tabs)/dashboard');
    };

    const handleContactWhatsApp = () => {
        const phoneNumber = '+51912085031'; // Cambiar por el número real
        const message = 'Hola, necesito ayuda con Impulsatech';
        Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`);
    };

    const handleContactEmail = () => {
        Linking.openURL('mailto:jhodacal2004@gmail.com?subject=Solicitud de Ayuda');
    };

    const handleFAQ = () => {
        // Aquí podrías navegar a una pantalla de FAQ o abrir un enlace externo
        console.log('Abrir FAQ');
    };

    return (
        <View style={styles.container}>
            <Header onBackPress={handleBack} />
            <StatusBar hidden={true} />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.bannerCard}>
                    <LinearGradient
                        colors={['#4ECDC4', '#44A08D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.bannerGradient}
                    >
                        <Ionicons name="help-circle" size={64} color="white" />
                        <Text style={styles.bannerTitle}>Centro de Ayuda</Text>
                        <Text style={styles.bannerSubtitle}>Estamos aquí para ayudarte</Text>
                    </LinearGradient>
                </View>

                <Text style={styles.sectionTitle}>¿Cómo podemos ayudarte?</Text>

                <HelpCard
                    icon="whatsapp"
                    title="Contactar por WhatsApp"
                    description="Chatea con nuestro equipo de soporte"
                    onPress={handleContactWhatsApp}
                    color="#25D366"
                />

                <HelpCard
                    icon="email-outline"
                    title="Enviar un correo"
                    description="jhodacal2004@gmail.com"
                    onPress={handleContactEmail}
                    color={ACCENT_YELLOW}
                />

                <HelpCard
                    icon="frequently-asked-questions"
                    title="Preguntas Frecuentes"
                    description="Respuestas a las dudas más comunes"
                    onPress={handleFAQ}
                    color={ACCENT_GREEN}
                />

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Horario de Atención</Text>
                    <Text style={styles.infoText}>Lunes a Viernes: 9:00 AM - 6:00 PM</Text>
                    <Text style={styles.infoText}>Sábados: 9:00 AM - 1:00 PM</Text>
                    <Text style={styles.infoText}>Domingos: Cerrado</Text>
                </View>

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
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: Platform.OS === 'ios' ? 90 : 80,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: Platform.OS === 'ios' ? 50 : 25,
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
    bannerCard: {
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 30,
    },
    bannerGradient: {
        padding: 30,
        alignItems: 'center',
    },
    bannerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 15,
    },
    bannerSubtitle: {
        fontSize: 16,
        color: 'white',
        opacity: 0.9,
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 15,
    },
    helpCard: {
        backgroundColor: CARD_BLUE,
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    helpContent: {
        flex: 1,
    },
    helpTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    helpDescription: {
        fontSize: 13,
        color: '#ffffff80',
    },
    infoCard: {
        backgroundColor: CARD_BLUE,
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ACCENT_YELLOW,
        marginBottom: 12,
    },
    infoText: {
        fontSize: 15,
        color: 'white',
        marginBottom: 8,
    },
});

export default HelpScreen;
