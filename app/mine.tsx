import React,{useCallback,useEffect,useState} from 'react';
import {Alert,Text,View} from 'react-native';
import {router} from 'expo-router';
import {api} from '../src/api';
import {useAuth} from '../src/auth';
import type {Appointment} from '../src/types';
import {Button,Busy,ErrorText,Page,styles} from '../src/theme';
export default function Mine(){const {user,ready}=useAuth();const [scope,setScope]=useState<'upcoming'|'past'|'all'>('upcoming'),[items,setItems]=useState<Appointment[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState('');
 const load=useCallback(async()=>{if(!user)return;setLoading(true);setError('');try{setItems(await api.mine(scope));}catch(e){setError(e instanceof Error?e.message:'Could not load appointments.');}finally{setLoading(false);}},[scope,user?.public_id]);
 useEffect(()=>{void load();},[load]);
 async function cancel(id:string){setLoading(true);try{await api.cancel(id,'Cancelled by customer via mobile app');await load();}catch(e){setError(e instanceof Error?e.message:'Could not cancel.');}finally{setLoading(false);}}
 if(!ready)return <Page><Busy/></Page>;if(!user)return <Page><Text style={styles.title}>Sign in required</Text><Button label="Sign in" onPress={()=>router.push('/login')}/></Page>;
 return <Page><Text style={styles.title}>My appointments</Text><View style={{flexDirection:'row',gap:8}}>{(['upcoming','past','all']as const).map(x=><View key={x} style={{flex:1}}><Button label={x===scope?'✓ '+x:x} secondary={x!==scope} onPress={()=>setScope(x)}/></View>)}</View><Button label="Refresh" secondary onPress={()=>void load()}/><ErrorText message={error}/>{loading?<Busy/>:items.length===0?<Text style={styles.muted}>No appointments found.</Text>:items.map(a=><View key={a.public_id} style={styles.card}><Text style={styles.heading}>{a.service_name}</Text><Text style={styles.body}>{new Date(a.start_at).toLocaleString()}</Text><Text style={styles.muted}>Staff: {a.staff_name || 'Assigned automatically'}</Text><Text style={styles.muted}>Status: {a.status}</Text>{a.change_deadline?<Text style={styles.muted}>Change deadline: {a.change_deadline}</Text>:null}{a.can_reschedule?<Button label="Reschedule" onPress={()=>router.push({pathname:'/book',params:{reschedule:a.public_id}})}/>:null}{a.can_cancel?<Button label="Cancel appointment" secondary onPress={()=>Alert.alert('Cancel appointment?','This action may not be reversible.',[{text:'Keep appointment',style:'cancel'},{text:'Cancel appointment',style:'destructive',onPress:()=>void cancel(a.public_id)}])}/>:null}</View>)}</Page>;
}
