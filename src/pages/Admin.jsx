import {useEffect,useState} from "react";
import {addDoc,collection,deleteDoc,doc,getDocs,setDoc,writeBatch} from "firebase/firestore";import {db} from "../firebase";
import {CATEGORIES,valid} from "../lib/questions";
function csv(t){const rows=[];let r=[],c="",q=false;for(let i=0;i<t.length;i++){const h=t[i];
  if(q){if(h=='"'){if(t[i+1]=='"'){c+='"';i++}else q=false}else c+=h}else if(h=='"')q=true;else if(h==","){r.push(c);c=""}else if(h=="\n"){r.push(c.replace(/\r$/,""));rows.push(r);r=[];c=""}else c+=h}
  if(c||r.length){r.push(c);rows.push(r)}const [hd,...b]=rows;
  return b.filter(x=>x.length>1).map(x=>{const o=Object.fromEntries(hd.map((k,i)=>[k.trim().toLowerCase(),x[i]]));
    return {category:o.kategori,question:o.pertanyaan,options:[o.a,o.b,o.c,o.d],answer:"abcd".indexOf((o.jawaban||"").trim().toLowerCase()),explanation:o.pembahasan||""}})}
const empty={category:CATEGORIES[0],question:"",options:["","","",""],answer:0,explanation:""};
export default function Admin({questions,reload}){
  const [tab,setTab]=useState("soal"),[f,setF]=useState(empty),[flt,setFlt]=useState("all"),[imp,setImp]=useState([]),[stat,setStat]=useState(null);
  useEffect(()=>{if(tab!=="stat")return;(async()=>{const [r,u]=await Promise.all([getDocs(collection(db,"results")),getDocs(collection(db,"users"))]);
    const m={};u.docs.forEach(d=>m[d.id]={name:d.data().name,email:d.data().email,n:0,sum:0,last:0});
    r.docs.forEach(d=>{const x=d.data();const e=m[x.uid]||(m[x.uid]={name:x.name,email:x.email,n:0,sum:0,last:0});e.n++;e.sum+=x.score;e.last=Math.max(e.last,x.at)});setStat(Object.values(m))})()},[tab]);
  const save=async()=>{if(!valid(f))return alert("Lengkapi pertanyaan dan 4 pilihan.");const {id,...d}=f;id&&!String(id).startsWith("sample")?await setDoc(doc(db,"questions",id),d):await addDoc(collection(db,"questions"),d);setF(empty);reload()};
  const del=async id=>{if(confirm("Hapus soal ini?")){await deleteDoc(doc(db,"questions",id));reload()}};
  const file=async e=>{const t=await e.target.files[0].text();setImp(e.target.files[0].name.endsWith(".csv")?csv(t):JSON.parse(t))};
  const run=async()=>{const ok=imp.filter(valid);for(let i=0;i<ok.length;i+=400){const b=writeBatch(db);ok.slice(i,i+400).forEach(q=>b.set(doc(collection(db,"questions")),q));await b.commit()}
    alert(`${ok.length} soal diimpor, ${imp.length-ok.length} dilewati (tidak valid).`);setImp([]);reload()};
  const list=questions.filter(q=>flt==="all"||q.category===flt);
  return <><h2>Panel Admin</h2><div className="tabs">{[["soal","Bank soal"],["imp","Impor JSON/CSV"],["stat","Statistik pengguna"]].map(([k,t])=><button key={k} className={tab===k?"on":""} onClick={()=>setTab(k)}>{t}</button>)}</div>
  {tab==="soal"&&<><div className="card form"><h3>{f.id?"Edit soal":"Tambah soal"}</h3>
    <select value={f.category} onChange={e=>setF({...f,category:e.target.value})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
    <textarea placeholder="Pertanyaan" value={f.question} onChange={e=>setF({...f,question:e.target.value})}/>
    {f.options.map((o,i)=><input key={i} placeholder={"Pilihan "+"ABCD"[i]} value={o} onChange={e=>{const x=[...f.options];x[i]=e.target.value;setF({...f,options:x})}}/>)}
    <select value={f.answer} onChange={e=>setF({...f,answer:+e.target.value})}>{"ABCD".split("").map((c,i)=><option key={c} value={i}>Kunci: {c}</option>)}</select>
    <textarea placeholder="Pembahasan rinci (sebutkan pasal)" value={f.explanation} onChange={e=>setF({...f,explanation:e.target.value})}/>
    <div className="row"><button className="gold" onClick={save}>Simpan</button>{f.id&&<button onClick={()=>setF(empty)}>Batal</button>}</div></div>
    <select value={flt} onChange={e=>setFlt(e.target.value)}><option value="all">Semua ({questions.length})</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
    {list.map(q=><div className="card" key={q.id}><small>{q.category}</small><p>{q.question}</p><div className="row"><button onClick={()=>setF(q)}>Edit</button>{!String(q.id).startsWith("sample")&&<button onClick={()=>del(q.id)}>Hapus</button>}</div></div>)}</>}
  {tab==="imp"&&<div className="card"><p>Unggah <b>.json</b> (array objek <code>{"{category,question,options[4],answer(0-3),explanation}"}</code>) atau <b>.csv</b> dengan kolom: <code>kategori,pertanyaan,a,b,c,d,jawaban,pembahasan</code>.</p>
    <input type="file" accept=".json,.csv" onChange={file}/>{imp.length>0&&<p>Terbaca {imp.length} soal ({imp.filter(valid).length} valid). <button className="gold" onClick={run}>Impor ke database</button></p>}</div>}
  {tab==="stat"&&<div className="card">{!stat?<p>Memuat…</p>:<table><thead><tr><th>Nama</th><th>Email</th><th>Simulasi</th><th>Rata-rata</th><th>Terakhir</th></tr></thead>
    <tbody>{stat.map((s,i)=><tr key={i}><td>{s.name}</td><td>{s.email}</td><td>{s.n}</td><td>{s.n?Math.round(s.sum/s.n):"-"}</td><td>{s.last?new Date(s.last).toLocaleDateString("id-ID"):"-"}</td></tr>)}</tbody></table>}</div>}</>;
}
