// screens/AdminCourseForm.js - Formulario para crear/editar cursos
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
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

const AdminCourseForm = () => {
    const router = useRouter();
    const safeBack = useSafeBack();
    const { courseId } = useLocalSearchParams();
    const isEditing = !!courseId;

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);

    // Campos del formulario
    const [titulo, setTitulo] = useState('');
    const [subtitulo, setSubtitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [company, setCompany] = useState('ImpulsaTech');
    const [categoriaId, setCategoriaId] = useState('');
    const [logoIcon, setLogoIcon] = useState('📚');
    const [bannerUrl, setBannerUrl] = useState('');
    const [videoYoutubeUrl, setVideoYoutubeUrl] = useState('');
    const [periods, setPeriods] = useState([{ nombre: '', duracion: '' }]);
    const [learningObjectives, setLearningObjectives] = useState(['']);
    const [lessons, setLessons] = useState([{ titulo: '', youtube_url: '' }]);

    // Estado para nueva categoría
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('🎓');

    useEffect(() => {
        loadCategories();
        if (isEditing) {
            loadCourseData();
        }
    }, []);

    const loadCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/categorias`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data.categorias);
                if (data.categorias.length > 0 && !isEditing) {
                    setCategoriaId(data.categorias[0].id.toString());
                }
            }
        } catch (error) {
            console.error('Error cargando categorías:', error);
        }
    };

    const loadCourseData = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_URL}/cursos/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const course = data.curso;

                setTitulo(course.titulo || '');
                setSubtitulo(course.subtitulo || '');
                setDescripcion(course.descripcion || '');
                setCompany(course.company || 'ImpulsaTech');
                setCategoriaId(course.categoria_id?.toString() || '');
                setLogoIcon(course.logo_icon || '📚');
                setBannerUrl(course.banner_url || '');
                setVideoYoutubeUrl(course.video_youtube_url || '');
                setPeriods(course.periods && course.periods.length > 0 ? course.periods : [{ nombre: '', duracion: '' }]);
                setLearningObjectives(course.learningObjectives && course.learningObjectives.length > 0
                    ? course.learningObjectives
                    : ['']);
                setLessons(course.lessons && course.lessons.length > 0 ? course.lessons : [{ titulo: '', youtube_url: '' }]);
            }
        } catch (error) {
            console.error('Error cargando curso:', error);
            Alert.alert('Error', 'No se pudo cargar el curso');
        } finally {
            setLoading(false);
        }
    };

    const addPeriod = () => {
        setPeriods([...periods, { nombre: '', duracion: '' }]);
    };

    const removePeriod = (index) => {
        if (periods.length > 1) {
            setPeriods(periods.filter((_, i) => i !== index));
        }
    };

    const updatePeriod = (index, field, value) => {
        const newPeriods = [...periods];
        newPeriods[index][field] = value;
        setPeriods(newPeriods);
    };

    const addObjective = () => {
        setLearningObjectives([...learningObjectives, '']);
    };

    const removeObjective = (index) => {
        if (learningObjectives.length > 1) {
            setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
        }
    };

    const updateObjective = (index, value) => {
        const newObjectives = [...learningObjectives];
        newObjectives[index] = value;
        setLearningObjectives(newObjectives);
    };

    const addLesson = () => {
        setLessons([...lessons, { titulo: '', youtube_url: '' }]);
    };

    const removeLesson = (index) => {
        if (lessons.length > 1) {
            setLessons(lessons.filter((_, i) => i !== index));
        }
    };

    const updateLesson = (index, field, value) => {
        const newLessons = [...lessons];
        newLessons[index][field] = value;
        setLessons(newLessons);
    };

    const pickImage = async () => {
        // No permission request is needed for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            // Create data URI for Base64 image
            const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setBannerUrl(base64Img);
        }
    };

    const handleSaveCategory = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Error', 'El nombre de la categoría es requerido');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            const url = editCategoryId
                ? `${API_URL}/categorias/${editCategoryId}`
                : `${API_URL}/categorias`;

            const method = editCategoryId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
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
                // Si es edición, recargamos todas para simplicidad, o actualizamos localmente
                await loadCategories();
                setShowCategoryModal(false);
                setNewCategoryName('');
                setNewCategoryIcon('🎓');
                setEditCategoryId(null);
                Alert.alert('Éxito', editCategoryId ? 'Categoría actualizada' : 'Categoría creada');
            } else {
                Alert.alert('Error', 'No se pudo guardar la categoría');
            }
        } catch (error) {
            console.error('Error guardando categoría:', error);
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
                                loadCategories();
                                if (categoriaId === id.toString()) setCategoriaId('');
                                Alert.alert('Éxito', 'Categoría eliminada');
                            }
                        } catch (error) {
                            console.error('Error eliminando:', error);
                        }
                    }
                }
            ]
        );
    };

    const handleLongPressCategory = (cat) => {
        Alert.alert(
            'Opciones de Categoría',
            `¿Qué deseas hacer con "${cat.nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Editar',
                    onPress: () => {
                        setEditCategoryId(cat.id);
                        setNewCategoryName(cat.nombre);
                        setNewCategoryIcon(cat.icono);
                        setShowCategoryModal(true);
                    }
                },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => handleDeleteCategory(cat.id, cat.nombre)
                }
            ]
        );
    };



    const validateForm = () => {
        if (!titulo.trim()) {
            Alert.alert('Error', 'El título es requerido');
            return false;
        }
        if (!categoriaId) {
            Alert.alert('Error', 'Debe seleccionar una categoría');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const url = isEditing
                ? `${API_URL}/cursos/${courseId}`
                : `${API_URL}/cursos`;

            const method = isEditing ? 'PUT' : 'POST';

            const courseData = {
                titulo,
                subtitulo,
                descripcion,
                company,
                categoria_id: categoriaId ? parseInt(categoriaId) : null,
                logo_icon: logoIcon,
                banner_url: bannerUrl,
                video_youtube_url: videoYoutubeUrl,
                periods,
                learningObjectives: learningObjectives.filter(obj => obj.trim() !== ''),
                lessons: lessons.filter(l => l.youtube_url.trim() !== '')
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(courseData)
            });

            if (response.ok) {
                Alert.alert(
                    'Éxito',
                    isEditing ? 'Curso actualizado correctamente' : 'Curso creado correctamente',
                    [
                        {
                            text: 'OK',
                            onPress: () => safeBack()
                        }
                    ]
                );
            } else {
                const error = await response.json();
                Alert.alert('Error', error.message || 'No se pudo guardar el curso');
            }
        } catch (error) {
            console.error('Error guardando curso:', error);
            Alert.alert('Error', 'Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <LinearGradient colors={['#4c1d95', '#1e3a8a']} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.WHITE} />
                    <Text style={styles.loadingText}>Cargando curso...</Text>
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
                <Text style={styles.headerTitle}>
                    {isEditing ? 'Editar Curso' : 'Nuevo Curso'}
                </Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.formContainer}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Sección General */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información General</Text>

                        <Text style={styles.label}>Título del Curso</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej. Introducción a Python"
                            placeholderTextColor="#9CA3AF"
                            value={titulo}
                            onChangeText={setTitulo}
                        />

                        <Text style={styles.label}>Subtítulo</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Breve descripción corta"
                            placeholderTextColor="#9CA3AF"
                            value={subtitulo}
                            onChangeText={setSubtitulo}
                        />

                        <Text style={styles.label}>Descripción Completa</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Detalles del curso..."
                            placeholderTextColor="#9CA3AF"
                            value={descripcion}
                            onChangeText={setDescripcion}
                            multiline={true}
                            numberOfLines={4}
                        />

                        <Text style={styles.label}>Empresa / Institución</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej. ImpulsaTech"
                            placeholderTextColor="#9CA3AF"
                            value={company}
                            onChangeText={setCompany}
                        />

                        <Text style={styles.label}>Categoría</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerContainer}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryChip,
                                        categoriaId === cat.id.toString() && styles.categoryChipActive
                                    ]}
                                    onPress={() => setCategoriaId(cat.id.toString())}
                                    onLongPress={() => handleLongPressCategory(cat)}
                                    delayLongPress={500}
                                >
                                    <Text style={styles.categoryChipText}>{cat.icono} {cat.nombre}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Visual</Text>

                        <Text style={styles.label}>Ícono</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Emoji del curso: 🐍"
                            placeholderTextColor="#9CA3AF"
                            value={logoIcon}
                            onChangeText={setLogoIcon}
                        />

                        <Text style={styles.label}>Estilo del Banner (URL o Galería)</Text>

                        {/* Image Preview */}
                        {bannerUrl ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: bannerUrl }} style={styles.imagePreview} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => setBannerUrl('')}
                                >
                                    <Ionicons name="trash" size={20} color={COLORS.WHITE} />
                                </TouchableOpacity>
                            </View>
                        ) : null}

                        <View style={styles.imageInputRow}>
                            <TextInput
                                style={[styles.input, styles.urlInput]}
                                placeholder="https://ejemplo.com/banner.jpg"
                                placeholderTextColor="#9CA3AF"
                                value={bannerUrl}
                                onChangeText={setBannerUrl}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                                <Ionicons name="images" size={24} color={COLORS.WHITE} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>URL de Video YouTube</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="https://www.youtube.com/watch?v=..."
                            placeholderTextColor="#9CA3AF"
                            value={videoYoutubeUrl}
                            onChangeText={setVideoYoutubeUrl}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Períodos */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Períodos</Text>
                            <TouchableOpacity onPress={addPeriod} style={styles.addButton}>
                                <Ionicons name="add-circle" size={24} color={COLORS.ACCENT_GREEN} />
                            </TouchableOpacity>
                        </View>

                        {periods.map((period, index) => (
                            <View key={index} style={styles.dynamicRow}>
                                <View style={styles.dynamicInputs}>
                                    <TextInput
                                        style={[styles.input, styles.halfInput]}
                                        placeholder="Nombre del período"
                                        placeholderTextColor={COLORS.TEXT_GRAY}
                                        value={period.nombre}
                                        onChangeText={(text) => updatePeriod(index, 'nombre', text)}
                                    />
                                    <TextInput
                                        style={[styles.input, styles.halfInput]}
                                        placeholder="Duración"
                                        placeholderTextColor={COLORS.TEXT_GRAY}
                                        value={period.duracion}
                                        onChangeText={(text) => updatePeriod(index, 'duracion', text)}
                                    />
                                </View>
                                {periods.length > 1 && (
                                    <TouchableOpacity onPress={() => removePeriod(index)}>
                                        <Ionicons name="close-circle" size={24} color={COLORS.ACCENT_RED} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Objetivos de Aprendizaje */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Objetivos de Aprendizaje</Text>
                            <TouchableOpacity onPress={addObjective} style={styles.addButton}>
                                <Ionicons name="add-circle" size={24} color={COLORS.ACCENT_GREEN} />
                            </TouchableOpacity>
                        </View>

                        {learningObjectives.map((objective, index) => (
                            <View key={index} style={styles.dynamicRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder={`Objetivo ${index + 1}`}
                                    placeholderTextColor={COLORS.TEXT_GRAY}
                                    value={objective}
                                    onChangeText={(text) => updateObjective(index, text)}
                                />
                                {learningObjectives.length > 1 && (
                                    <TouchableOpacity onPress={() => removeObjective(index)}>
                                        <Ionicons name="close-circle" size={24} color={COLORS.ACCENT_RED} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Lecciones (Videos YouTube)</Text>
                            <TouchableOpacity onPress={addLesson} style={styles.addButton}>
                                <Ionicons name="add-circle" size={28} color={COLORS.ACCENT_GREEN} />
                            </TouchableOpacity>
                        </View>

                        {lessons.map((lesson, index) => (
                            <View key={index} style={styles.dynamicRow}>
                                <View style={styles.dynamicInputs}>
                                    <TextInput
                                        style={[styles.input, styles.halfInput]}
                                        placeholder={`Lección ${index + 1}`}
                                        placeholderTextColor={COLORS.TEXT_GRAY}
                                        value={lesson.titulo}
                                        onChangeText={(text) => updateLesson(index, 'titulo', text)}
                                    />
                                    <TextInput
                                        style={[styles.input, styles.halfInput]}
                                        placeholder="URL YouTube"
                                        placeholderTextColor={COLORS.TEXT_GRAY}
                                        value={lesson.youtube_url}
                                        onChangeText={(text) => updateLesson(index, 'youtube_url', text)}
                                    />
                                </View>
                                <TouchableOpacity onPress={() => removeLesson(index)}>
                                    <Ionicons name="trash-outline" size={24} color={COLORS.ACCENT_RED} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Botón Guardar */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color={COLORS.WHITE} />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={24} color={COLORS.WHITE} />
                            <Text style={styles.saveButtonText}>
                                {isEditing ? 'Actualizar Curso' : 'Crear Curso'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Modal para Nueva Categoría */}
            <Modal
                visible={showCategoryModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editCategoryId ? 'Editar Categoría' : 'Nueva Categoría'}</Text>

                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej. Programación"
                            placeholderTextColor={COLORS.TEXT_GRAY}
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                        />

                        <Text style={styles.label}>Ícono (Emoji)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej. 💻"
                            placeholderTextColor={COLORS.TEXT_GRAY}
                            value={newCategoryIcon}
                            onChangeText={setNewCategoryIcon}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowCategoryModal(false);
                                    setEditCategoryId(null);
                                    setNewCategoryName('');
                                    setNewCategoryIcon('🎓');
                                }}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            {editCategoryId && (
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: COLORS.ACCENT_RED, marginRight: 10 }]}
                                    onPress={() => {
                                        setShowCategoryModal(false);
                                        handleDeleteCategory(editCategoryId, newCategoryName);
                                    }}
                                >
                                    <Text style={styles.modalButtonText}>Eliminar</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleSaveCategory}
                            >
                                <Text style={styles.modalButtonText}>{editCategoryId ? 'Actualizar' : 'Crear'}</Text>
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
    formContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.TEXT_LIGHT,
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1f2937', // Dark text
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        marginTop: 8,
    },
    categoryChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    categoryChipActive: {
        backgroundColor: COLORS.ACCENT_PURPLE,
        borderColor: COLORS.ACCENT_PURPLE,
    },
    categoryChipText: {
        color: COLORS.WHITE,
        fontSize: 14,
    },
    halfInput: {
        flex: 1,
    },
    addButton: {
        padding: 4,
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    footerButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    saveButton: {
        backgroundColor: COLORS.ACCENT_GREEN,
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    deleteButton: {
        backgroundColor: COLORS.ACCENT_RED,
        width: 60,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 18,
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
    dynamicRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
    },
    dynamicInputs: {
        flex: 1,
        flexDirection: 'row',
        gap: 10,
    },
    // Image Upload Styles
    imageInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    urlInput: {
        flex: 1,
    },
    galleryButton: {
        backgroundColor: COLORS.ACCENT_PURPLE,
        width: 50,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    imagePreviewContainer: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        padding: 8,
    },
});

export default AdminCourseForm;
