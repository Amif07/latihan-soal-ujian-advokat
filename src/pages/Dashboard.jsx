import {useEffect,useState} from "react";import {collection,getDocs,query,where} from "firebase/firestore";import {db} from "../firebase";
export default function Dashboard({user,go}){
  const [r,setR]=useState(null);
  useEffect(()=>{getDocs(query(collection(db,"results"),where("uid","==",user.uid))).then(s=>setR(s.docs.map(d=>d.data()).sort((a,b)=>a.at-b.at)))},[]);
  if(!r)return <p>Memuat statistik…</p>;
  const avg=r.length?Math.round(r.reduce((a,x)=>a+x.score,0)/r.length):0;
  const cat={};r.forEach(x=>Object.entries(x.byCat||{}).forEach(([k,[c,t]])=>{cat[k]=cat[k]||[0,0];cat[k][0]+=c;cat[k][1]+=t}));
  const rows=Object.entries(cat).map(([k,[c,t]])=>[k,Math.round(c/t*100),t]).sort((a,b)=>a[1]-b[1]);
  const X=i=>20+i*(560/Math.max(r.length-1,1)),pts=r.map((x,i)=>`${X(i)},${130-x.score*1.1}`).join(" ");
  return <><h2>Dashboard</h2>
    <div className="stats"><div className="card"><small>Jumlah simulasi</small><b>{r.length}</b></div><div className="card"><small>Rata-rata skor</small><b>{avg}</b></div>
      <div className="card"><small>Skor terbaik</small><b>{r.length?Math.max(...r.map(x=>x.score)):0}</b></div></div>
    <div className="card"><h3>Perkembangan skor</h3>{r.length?<svg viewBox="0 0 600 140" className="chart"><polyline points={pts} fill="none" stroke="#c8962e" strokeWidth="3"/>
      {r.map((x,i)=><circle key={i} cx={X(i)} cy={130-x.score*1.1} r="4" fill="#0b1f3a"/>)}</svg>:<p>Belum ada riwayat.</p>}</div>
    <div className="card"><h3>Materi yang perlu ditingkatkan</h3>{rows.length?<table><tbody>{rows.map(([k,p,t])=><tr key={k}><td>{k}</td><td>{t} soal</td><td><div className="bar"><i style={{width:p+"%",background:p<60?"#b3302a":"#1d7a4a"}}/></div></td><td>{p}%</td></tr>)}</tbody></table>:<p>Kerjakan satu simulasi terlebih dahulu.</p>}</div>
    <div className="card"><h3>Riwayat ujian</h3><table><tbody>{[...r].reverse().slice(0,15).map((x,i)=><tr key={i}><td>{new Date(x.at).toLocaleString("id-ID")}</td><td>{x.mode}</td><td>{x.correct}/{x.total}</td><td><b>{x.score}</b></td></tr>)}</tbody></table></div>
    <button className="gold" onClick={()=>go("exam")}>Mulai ujian</button></>;
}
