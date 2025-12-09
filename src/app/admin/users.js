// screens/AdminUsers.js - Gestión de Usuarios
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
    TEXT_LIGHT: '#ADD8E6',
    TEXT_GRAY: '#CCCCCC',
};

const AdminUsers = () => {
    const router = useRouter();
    const safeBack = useSafeBack();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchText, users]);

    const loadUsers = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            // Nota: Necesitarás crear este endpoint en el backend
            const response = await fetch(`${API_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            } else {
                // Si el endpoint no existe aún, usar datos de ejemplo
                setUsers([]);
            }
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        if (searchText.trim() === '') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.username.toLowerCase().includes(searchText.toLowerCase()) ||
                user.email.toLowerCase().includes(searchText.toLowerCase()) ||
                (user.nombres && user.nombres.toLowerCase().includes(searchText.toLowerCase()))
            );
            setFilteredUsers(filtered);
        }
    };

    const renderUser = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>
                    {item.nombres ? item.nombres[0].toUpperCase() : item.username[0].toUpperCase()}
                </Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.nombres || item.username}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.userMeta}>
                    <View style={[styles.roleBadge, item.role === 'admin' && styles.adminBadge]}>
                        <Text style={styles.roleText}>
                            {item.role === 'admin' ? '👑 Admin' : 'Usuario'}
                        </Text>
                    </View>
                    <Text style={styles.userDate}>
                        Registrado: {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <LinearGradient colors={['#4c1d95', '#1e3a8a']} style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.WHITE} />
                    <Text style={styles.loadingText}>Cargando usuarios...</Text>
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
                <Text style={styles.headerTitle}>Usuarios Registrados</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.TEXT_GRAY} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar usuario..."
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
                    {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario' : 'usuarios'}
                </Text>
                <Text style={styles.adminCount}>
                    {filteredUsers.filter(u => u.role === 'admin').length} admins
                </Text>
            </View>

            <FlatList
                data={filteredUsers}
                renderItem={renderUser}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color={COLORS.TEXT_GRAY} />
                        <Text style={styles.emptyText}>
                            {users.length === 0
                                ? 'No hay usuarios registrados'
                                : 'No se encontraron usuarios'}
                        </Text>
                    </View>
                }
            />
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    statsText: {
        fontSize: 14,
        color: COLORS.TEXT_LIGHT,
        fontWeight: '600',
    },
    adminCount: {
        fontSize: 14,
        color: COLORS.ACCENT_GREEN,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    userCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.CARD_BG,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
    },
    userAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.ACCENT_PURPLE,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.WHITE,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.WHITE,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 13,
        color: COLORS.TEXT_LIGHT,
        marginBottom: 8,
    },
    userMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    roleBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    adminBadge: {
        backgroundColor: COLORS.ACCENT_GREEN,
    },
    roleText: {
        fontSize: 11,
        color: COLORS.WHITE,
        fontWeight: '600',
    },
    userDate: {
        fontSize: 11,
        color: COLORS.TEXT_GRAY,
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
        textAlign: 'center',
    },
});

export default AdminUsers;
