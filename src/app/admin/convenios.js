import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
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
    CARD_BG: 'rgba(255, 255, 255, 0.1)',
    WHITE: '#FFFFFF',
    ACCENT_PURPLE: '#8A2BE2',
    ACCENT_GREEN: '#4ade80',
    ACCENT_RED: '#EF4444',
    TEXT_LIGHT: '#ADD8E6',
    TEXT_GRAY: '#CCCCCC',
};

const AdminConvenios = () => {
    const router = useRouter();
    const safeBack = useSafeBack();
    const [convenios, setConvenios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [nombre, setNombre] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [descripcion, setDescripcion] = useState('');

    useEffect(() => {
        loadConvenios();
    }, []);

    const loadConvenios = async () => {
        try {
            const response = await fetch(`${API_URL}/convenios`);
            if (response.ok) {
                const data = await response.json();
                setConvenios(data.convenios);
            }
        } catch (error) {
            console.error('Error cargando convenios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!nombre.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/convenios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nombre, logo_url: logoUrl, descripcion })
            });

            if (response.ok) {
                Alert.alert('Éxito', 'Convenio creado correctamente');
                setShowModal(false);
                setNombre('');
                setLogoUrl('');
                setDescripcion('');
                loadConvenios();
            } else {
                Alert.alert('Error', 'No se pudo crear el convenio');
            }
        } catch (error) {
            console.error('Error guardando:', error);
            Alert.alert('Error', 'Error de conexión');
        }
    };

    const handleDelete = async (id, name) => {
        Alert.alert(
            'Eliminar Convenio',
            `¿Estás seguro de eliminar a "${name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            const response = await fetch(`${API_URL}/convenios/${id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });

                            if (response.ok) {
                                Alert.alert('Éxito', 'Convenio eliminado');
                                loadConvenios();
                            } else {
                                Alert.alert('Error', 'No se pudo eliminar');
                            }
                        } catch (error) {
                            console.error('Error eliminando:', error);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                {item.logo_url ? (
                    <Image source={{ uri: item.logo_url }} style={styles.logo} resizeMode="contain" />
                ) : (
                    <View style={styles.placeholderLogo}>
                        <Text style={styles.placeholderText}>{item.nombre.substring(0, 2).toUpperCase()}</Text>
                    </View>
                )}
                <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.nombre}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id, item.nombre)}
            >
                <Ionicons name="trash-outline" size={20} color={COLORS.WHITE} />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <LinearGradient colors={['#4c1d95', '#1e3a8a']} style={styles.container}>
                <ActivityIndicator size="large" color={COLORS.WHITE} />
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
                <Text style={styles.headerTitle}>Gestionar Convenios</Text>
                <View style={{ width: 28 }} />
            </View>

            <FlatList
                data={convenios}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No hay convenios registrados</Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
                <Ionicons name="add" size={32} color={COLORS.WHITE} />
            </TouchableOpacity>

            <Modal
                visible={showModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nuevo Convenio</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de la Empresa"
                            placeholderTextColor={COLORS.TEXT_GRAY}
                            value={nombre}
                            onChangeText={setNombre}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="URL del Logo (https://...)"
                            placeholderTextColor={COLORS.TEXT_GRAY}
                            value={logoUrl}
                            onChangeText={setLogoUrl}
                            autoCapitalize="none"
                        />

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Descripción"
                            placeholderTextColor={COLORS.TEXT_GRAY}
                            value={descripcion}
                            onChangeText={setDescripcion}
                            multiline
                            numberOfLines={4}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setShowModal(false)}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleSave}
                            >
                                <Text style={styles.buttonText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    listContent: {
        padding: 20,
    },
    card: {
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    logo: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'white',
        marginRight: 15,
    },
    placeholderLogo: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.ACCENT_PURPLE,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    placeholderText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
        fontSize: 18,
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.WHITE,
    },
    cardDesc: {
        fontSize: 12,
        color: COLORS.TEXT_LIGHT,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: COLORS.ACCENT_RED,
        borderRadius: 8,
        marginLeft: 10,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.ACCENT_GREEN,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1e1e1e', // Dark modal bg
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        color: COLORS.WHITE,
        marginBottom: 15,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.ACCENT_RED,
    },
    saveButton: {
        backgroundColor: COLORS.ACCENT_GREEN,
    },
    buttonText: {
        color: COLORS.WHITE,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: COLORS.TEXT_GRAY,
        fontSize: 16,
    },
});

export default AdminConvenios;
