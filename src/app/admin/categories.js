// screens/AdminCategories.js - Gestión de Categorías
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
    CARD_BG: 'rgba(255, 255, 255, 0.1)',
    WHITE: '#FFFFFF',
    ACCENT_PURPLE: '#8A2BE2',
    ACCENT_GREEN: '#4ade80',
    ACCENT_RED: '#EF4444',
    TEXT_LIGHT: '#ADD8E6',
    TEXT_GRAY: '#CCCCCC',
};

const AdminCategories = () => {
    const router = useRouter();
    const safeBack = useSafeBack();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('📚');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/categorias`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data.categorias);
            }
        } catch (error) {
            console.error('Error cargando categorías:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Error', 'El nombre es requerido');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/categorias`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre: newCategoryName,
                    icono: newCategoryIcon
                })
            });

            if (response.ok) {
                Alert.alert('Éxito', 'Categoría creada');
                setNewCategoryName('');
                setNewCategoryIcon('📚');
                setShowAddForm(false);
                loadCategories();
            } else {
                Alert.alert('Error', 'No se pudo crear la categoría');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Error de conexión');
        }
    };

    const handleDeleteCategory = async (id, nombre) => {
        Alert.alert(
            'Eliminar Categoría',
            `¿Estás seguro de eliminar "${nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await AsyncStorage.getItem('token');
                            const response = await fetch(`${API_URL}/categorias/${id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });

                            if (response.ok) {
                                Alert.alert('Éxito', 'Categoría eliminada');
                                loadCategories();
                            } else {
                                Alert.alert('Error', 'No se pudo eliminar la categoría');
                            }
                        } catch (error) {
                            console.error('Error eliminando:', error);
                            Alert.alert('Error', 'Error de conexión');
                        }
                    }
                }
            ]
        );
    };

    const renderCategory = ({ item }) => (
        <View style={styles.categoryCard}>
            <Text style={styles.categoryIcon}>{item.icono}</Text>
            <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.nombre}</Text>
                <Text style={styles.categoryId}>ID: {item.id}</Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteCategory(item.id, item.nombre)}
            >
                <Ionicons name="trash-outline" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <LinearGradient colors={['#4c1d95', '#1e3a8a']} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.WHITE} />
                    <Text style={styles.loadingText}>Cargando categorías...</Text>
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
                <Text style={styles.headerTitle}>Gestionar Categorías</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.statsBar}>
                <Text style={styles.statsText}>
                    {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}
                </Text>
            </View>

            {showAddForm && (
                <View style={styles.addForm}>
                    <Text style={styles.formTitle}>Nueva Categoría</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre de la categoría"
                        placeholderTextColor={COLORS.TEXT_GRAY}
                        value={newCategoryName}
                        onChangeText={setNewCategoryName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Emoji (ej: 📚, 💻, 🤖)"
                        placeholderTextColor={COLORS.TEXT_GRAY}
                        value={newCategoryIcon}
                        onChangeText={setNewCategoryIcon}
                        maxLength={2}
                    />
                    <View style={styles.formButtons}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => setShowAddForm(false)}
                        >
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleAddCategory}
                        >
                            <Text style={styles.buttonText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="pricetags-outline" size={64} color={COLORS.TEXT_GRAY} />
                        <Text style={styles.emptyText}>No hay categorías</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fabButton}
                onPress={() => setShowAddForm(true)}
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
    statsBar: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    statsText: {
        fontSize: 14,
        color: COLORS.TEXT_LIGHT,
        fontWeight: '600',
    },
    addForm: {
        backgroundColor: COLORS.CARD_BG,
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 12,
        padding: 15,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: 15,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.WHITE,
        marginBottom: 10,
    },
    formButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
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
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },
    categoryIcon: {
        fontSize: 40,
        marginRight: 15,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.WHITE,
    },
    categoryId: {
        fontSize: 12,
        color: COLORS.TEXT_GRAY,
        marginTop: 2,
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
    deleteButton: {
        padding: 8,
        backgroundColor: COLORS.ACCENT_RED,
        borderRadius: 8,
        marginLeft: 10,
    },
});

export default AdminCategories;
