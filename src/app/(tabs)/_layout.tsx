import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="registro" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="CourseDetail" />
      <Stack.Screen name="ConvenioDetailScreen" />
      <Stack.Screen name="InscripcionScreen" />
      <Stack.Screen name="MyCourses" />
      <Stack.Screen name="CourseLessons" />
      <Stack.Screen name="LessonPlayer" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="help" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="convenios" />
    </Stack>
  );
}