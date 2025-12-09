import { useNavigation } from '@react-navigation/native';
import { usePathname, useRouter } from 'expo-router';

export default function useSafeBack() {
  const router = useRouter();
  const navigation = useNavigation();
  const pathname = usePathname();

  return () => {
    try {
      // Preferir goBack() de react-navigation si está disponible
      if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
        navigation.goBack();
        return;
      }

      // Si estamos en admin, volver al panel principal de admin o dashboard
      if (pathname.startsWith('/admin')) {
        if (pathname === '/admin' || pathname === '/admin/') {
          // Si estamos en el panel admin principal, ir al dashboard
          router.replace('/(tabs)/dashboard');
        } else {
          // Si estamos en una subpágina de admin, ir al panel admin
          router.replace('/admin');
        }
        return;
      }

      // Si no estamos en la ruta raíz, intentar router.back()
      if (pathname !== '/' && pathname !== '/(tabs)' && pathname !== '/(tabs)/index') {
        try {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/dashboard');
          }
        } catch {
          // Si router.back falla, ir al dashboard
          router.replace('/(tabs)/dashboard');
        }
        return;
      }

      // Si estamos en la raíz, no hacemos nada o vamos al dashboard
      router.replace('/(tabs)/dashboard');
    } catch (e) {
      // Si hay un error, ir al dashboard como fallback
      console.error('useSafeBack error:', e);
      try {
        router.replace('/(tabs)/dashboard');
      } catch { }
    }
  };
}