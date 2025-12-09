import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const PADDING = 20;

// Componente: Enroll Button con Press Animation
const EnrollButton = ({ onPress, isEnrolled, loading }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withTiming(0.95, { duration: 100 });
    };

    const handlePressOut = () => {
        scale.value = withTiming(1, { duration: 150 });
        onPress();
    };

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={styles.enrollButtonTouch}
            disabled={loading}
        >
            <LinearGradient
                colors={isEnrolled ? ['#4ECDC4', '#44A08D'] : ['#FF69B4', '#00BFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        <AntDesign
                            name={isEnrolled ? 'playcircleo' : 'checkcircleo'}
                            size={20}
                            color="white"
                            style={{ marginRight: 8 }}
                        />
                        <Text style={styles.enrollButtonText}>
                            {isEnrolled ? 'VER LECCIONES' : 'INSCRIBIRSE'}
                        </Text>
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    enrollButtonTouch: {
        width: '100%',
        borderRadius: 50,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    gradient: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderRadius: 50,
    },
    enrollButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default EnrollButton;
