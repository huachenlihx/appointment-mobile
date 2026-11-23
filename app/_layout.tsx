import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/auth';
export default function Layout() {
  return <SafeAreaProvider>
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1D4ED8' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#F5F7FC' }
        }}>
        <Stack.Screen name="index" options={{ title: 'Appointments' }} />
        <Stack.Screen name="login" options={{ title: 'Sign in' }} />
        <Stack.Screen name="register" options={{ title: 'Create account' }} />
        <Stack.Screen name="book" options={{ title: 'Book an appointment' }} />
        <Stack.Screen name="mine" options={{ title: 'My appointments' }} />
        <Stack.Screen name="password" options={{ title: 'Account security' }} />
      </Stack>
    </AuthProvider>
  </SafeAreaProvider>;
}
