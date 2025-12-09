import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
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

const DARK_BLUE_BG = '#0A0F2D';
const CARD_BLUE = '#1E2A5E';
const ACCENT_YELLOW = '#FFC04D';
const DEFAULT_LOGO = require('../../../assets/images/Impulsatech (1).png');
const Header = ({ onBackPress }) => (
    <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <AntDesign name="left" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ height: 450, width: 280, justifyContent: 'center' }}>
            <Image
                source={DEFAULT_LOGO}
                style={{ width: '100%', height: '100%', alignSelf: 'center' }}
                resizeMode="contain"
            />
        </View>
    </View>
);

const Section = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionText}>{children}</Text>
    </View>
);

const TermsScreen = () => {
    const router = useRouter();
    const safeBack = useSafeBack();

    const handleBack = () => {
        router.replace('/(tabs)/dashboard');
    };

    return (
        <View style={styles.container}>
            <Header onBackPress={handleBack} />
            <StatusBar hidden={true} />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.titleContainer}>
                        <Ionicons name="document-text" size={40} color={ACCENT_YELLOW} />
                        <Text style={styles.cardTitle}>Términos y Condiciones</Text>
                    </View>

                    <Text style={styles.lastUpdated}>Última actualización: Diciembre 2024</Text>

                    <View style={styles.divider} />

                    <Section title="1. Aceptación de los Términos">
                        Al acceder y utilizar Impulsatech, aceptas estar sujeto a estos términos y condiciones.
                        Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestra plataforma.
                    </Section>

                    <Section title="2. Uso de la Plataforma">
                        Impulsatech es una plataforma educativa que ofrece cursos de tecnología. Los usuarios
                        pueden inscribirse en cursos, acceder a contenido educativo y realizar un seguimiento de
                        su progreso de aprendizaje.
                    </Section>

                    <Section title="3. Inscripción y Cuenta">
                        Para acceder a ciertos servicios, debes crear una cuenta proporcionando información precisa
                        y actualizada. Eres responsable de mantener la confidencialidad de tu contraseña y de todas
                        las actividades que ocurran en tu cuenta.
                    </Section>

                    <Section title="4. Modelo de Pago">
                        Nuestro modelo único permite que los estudiantes accedan a los cursos sin costo inicial.
                        El pago se realiza únicamente cuando el estudiante consigue un empleo en el campo de estudio.
                        Los detalles específicos del acuerdo de pago se proporcionan al momento de la inscripción.
                    </Section>

                    <Section title="5. Contenido del Curso">
                        Todo el contenido de los cursos, incluyendo videos, materiales y recursos, es propiedad
                        de Impulsatech o sus licenciantes. No está permitido reproducir, distribuir o modificar
                        este contenido sin autorización expresa.
                    </Section>

                    <Section title="6. Conducta del Usuario">
                        Los usuarios deben comportarse de manera respetuosa y profesional. Está prohibido:
                        {'\n'}• Compartir credenciales de acceso
                        {'\n'}• Plagiar o hacer trampa en evaluaciones
                        {'\n'}• Acosar o intimidar a otros usuarios
                        {'\n'}• Distribuir contenido inapropiado
                    </Section>

                    <Section title="7. Cancelación y Reembolsos">
                        Los usuarios pueden cancelar su inscripción en cualquier momento. Dado nuestro modelo de
                        pago diferido, no se aplican políticas de reembolso tradicionales.
                    </Section>

                    <Section title="8. Privacidad">
                        Respetamos tu privacidad. Consulta nuestra Política de Privacidad para obtener información
                        sobre cómo recopilamos, usamos y protegemos tus datos personales.
                    </Section>

                    <Section title="9. Modificaciones">
                        Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
                        entrarán en vigor inmediatamente después de su publicación en la plataforma.
                    </Section>

                    <Section title="10. Contacto">
                        Si tienes preguntas sobre estos términos, contáctanos en:
                        {'\n'}Email: legal@impulsatech.com
                        {'\n'}Teléfono: +51 987 654 321
                    </Section>
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
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: Platform.OS === 'ios' ? 50 : 40,
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
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 15,
        flex: 1,
    },
    lastUpdated: {
        fontSize: 13,
        color: '#ffffff60',
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ACCENT_YELLOW,
        marginBottom: 10,
    },
    sectionText: {
        fontSize: 15,
        color: '#ffffffcc',
        lineHeight: 24,
    },
});

export default TermsScreen;
