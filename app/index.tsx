import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/auth';
import { Busy, Button, Page, styles } from '../src/theme';
export default function Home() {
 const {user,ready,signout} = useAuth();
 return <Page><Text style={styles.title}>Appointment Booking</Text><Text style={styles.muted}>Find a service, choose an available time and manage your bookings.</Text>
 {!ready ? <Busy/> : user ? <><View style={styles.card}><Text style={styles.heading}>Welcome, {user.first_name || user.email}</Text><Text style={styles.muted}>{user.email}</Text></View>{user.must_change_password ? <Button label="Change required password" onPress={() => router.push('/password')}/> : <><Button label="Book an appointment" onPress={() => router.push('/book')}/><Button label="My appointments" secondary onPress={() => router.push('/mine')}/></>}<Button label="Account security" secondary onPress={() => router.push('/password')}/><Button label="Sign out" secondary onPress={() => {void signout().catch(() => {});}}/></> : <><Button label="Sign in" onPress={() => router.push('/login')}/><Button label="Create an account" secondary onPress={() => router.push('/register')}/><Text style={styles.muted}>Registration may require activation using an email link.</Text></>}
 </Page>;
}
