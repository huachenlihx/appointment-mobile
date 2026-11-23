import React, { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { api } from '../src/api';
import { useAuth } from '../src/auth';
import { Button, ErrorText, Field, Page, styles } from '../src/theme';
export default function Password() {
  const { refresh } = useAuth();
  const [old, setOld] = useState(''),
    [next, setNext] = useState(''),
    [confirm, setConfirm] = useState(''),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false);

  async function change() {
    setBusy(true);
    setError('');
    try {
      await api.changePassword(old, next, confirm);
      setNotice('Password changed.');
      setOld('');
      setNext('');
      setConfirm('');
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not change password.');
    } finally {
      setBusy(false);
    }
  }

  return <Page>
    <Text style={styles.title}>Change password</Text>
    <Field label="Current password" value={old} onChangeText={setOld} secureTextEntry />
    <Field label="New password" value={next} onChangeText={setNext} secureTextEntry />
    <Field label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry />
    <ErrorText message={error} />
    {notice ? <Text style={styles.body}>
      {notice}
    </Text> : null}
    <Button
      label={busy ? 'Saving…' : 'Save new password'}
      disabled={busy || !old || !next || !confirm}
      onPress={change} />
    <Button label="Back to home" secondary onPress={() => router.replace('/')} />
  </Page>;
}
