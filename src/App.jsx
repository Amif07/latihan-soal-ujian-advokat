import {useEffect,useState} from "react";
import {signInWithPopup,signOut} from "firebase/auth";
import {auth,provider} from "./firebase";
import useAuth from "./lib/useAuth";import {loadQuestions} from "./lib/questions";
import Dashboard from "./pages/Dashboard.jsx";import Exam from "./pages/Exam.jsx";import Admin from "./pages/Admin.jsx";
export default function App(){
  const {user,role,loading}=useAuth();const [page,setPage]=useState("dashboard");const [qs,setQs]=useState([]);
  const reload=()=>loadQuestions().then(setQs);
  useEffect(()=>{if(user)reload()},[user]);
  if(loading)return <div className="center">Memuat…</div>;
  if(!user)return <div className="login"><div className="card"><div className="scale">⚖</div><h1>CAT Ujian Profesi Advokat</h1>
    <p>Platform latihan simulasi UPA. Masuk dengan akun Google Anda.</p>
    <button className="gold" onClick={()=>signInWithPopup(auth,provider)}>Masuk dengan Google</button></div></div>;
  const nav=(k,t)=><button className={page===k?"on":""} onClick={()=>setPage(k)}>{t}</button>;
  return <>
    <header><b>⚖ CAT UPA Advokat</b><nav>{nav("dashboard","Dashboard")}{nav("exam","Ujian")}{role==="admin"&&nav("admin","Admin")}</nav>
      <span>{user.displayName} · {role}<button onClick={()=>signOut(auth)}>Keluar</button></span></header>
    <main>{page==="dashboard"&&<Dashboard user={user} go={setPage}/>}
      {page==="exam"&&<Exam questions={qs} user={user}/>}
      {page==="admin"&&role==="admin"&&<Admin questions={qs} reload={reload}/>}</main></>;
}
