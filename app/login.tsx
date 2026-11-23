import React, {useState} from 'react';
import { Linking, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/auth';
import { api } from '../src/api';
import { Button, ErrorText, Field, Page, styles } from '../src/theme';
export default function Login() {
 const {signin} = useAuth(); const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 async function submit(){setBusy(true);setError('');try {await signin(email,password);router.replace('/');}catch(e){setError(e instanceof Error?e.message:'Could not sign in.');}finally{setBusy(false);}}
 async function resend(){if(!email.trim()){setError('Enter your email first.');return;}setBusy(true);setError('');try{const x=await api.resendActivation(email.trim());setNotice(x.detail);}catch(e){setError(e instanceof Error?e.message:'Request failed.');}finally{setBusy(false);}}
 async function reset(){if(!email.trim()){setError('Enter your email first.');return;}setBusy(true);setError('');try{const x=await api.resetRequest(email.trim());setNotice(x.detail);}catch(e){setError(e instanceof Error?e.message:'Request failed.');}finally{setBusy(false);}}
 return <Page><Text style={styles.title}>Sign in</Text><Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address"/><Field label="Password" value={password} onChangeText={setPassword} secureTextEntry/><ErrorText message={error}/>{notice ? <Text style={styles.muted}>{notice}</Text>:null}<Button label={busy?'Working…':'Sign in'} disabled={busy||!email||!password} onPress={submit}/><Button label="Resend activation email" secondary disabled={busy} onPress={resend}/><Button label="Forgot password? Email me a reset link" secondary disabled={busy} onPress={reset}/><Button label="Create account" secondary onPress={()=>router.push('/register')}/><Text style={styles.muted}>Activation and reset links open on the existing secure website. Return to the app to sign in after completing them.</Text></Page>;
}
