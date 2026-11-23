import React, { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { api } from '../src/api';
import { Button, ErrorText, Field, Page, styles } from '../src/theme';
export default function Register() {

  const [first_name, setFirst] = useState(''),
    [last_name, setLast] = useState(''),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [confirm_password, setConfirm] = useState(''),
    [error, setError] = useState(''),
    [info, setInfo] = useState(''),
    [busy, setBusy] = useState(false);

  async function submit() {
    if (password !== confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const r = await api.register({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirm_password
      });
      setInfo(r.detail);
      setPassword('');
      setConfirm('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed.');
    } finally {
      setBusy(false);
    }
  }

  return <Page>
    <Text style={styles.title}>Create account</Text>
    {info ? <>
      <Text style={styles.body}>
        {info}
      </Text>
      <Button label="Go to sign in" onPress={() => router.replace('/login')} />
    </> : <>
      <Field label="First name" value={first_name} onChangeText={setFirst} autoCapitalize="words" />
      <Field label="Last name" value={last_name} onChangeText={setLast} autoCapitalize="words" />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Field label="Confirm password" secureTextEntry value={confirm_password} onChangeText={setConfirm} />
      <Text style={styles.muted}>Your password must meet the server's security policy. We never store your password in the app.</Text>
      <ErrorText message={error} />
      <Button
        disabled={busy || !email || !password || !confirm_password}
        label={busy ? 'Creating account…' : 'Register'}
        onPress={submit} />
    </>}
  </Page>;
}
