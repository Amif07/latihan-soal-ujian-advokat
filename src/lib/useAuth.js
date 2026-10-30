import {useEffect,useState} from "react";
import {onAuthStateChanged} from "firebase/auth";import {doc,getDoc,setDoc,serverTimestamp} from "firebase/firestore";
import {auth,db} from "../firebase";
export default function useAuth(){
  const [s,setS]=useState({user:null,role:null,loading:true});
  useEffect(()=>onAuthStateChanged(auth,async u=>{
    if(!u)return setS({user:null,role:null,loading:false});
    const ref=doc(db,"users",u.uid);let snap=await getDoc(ref);
    if(!snap.exists()){await setDoc(ref,{email:u.email,name:u.displayName||u.email,role:"user",createdAt:serverTimestamp()});snap=await getDoc(ref)}
    setS({user:u,role:snap.data().role,loading:false});
  }),[]);
  return s;
}
