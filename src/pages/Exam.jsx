import {useEffect,useRef,useState} from "react";import {addDoc,collection} from "firebase/firestore";import {db} from "../firebase";
import {CATEGORIES} from "../lib/questions";
const sh=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const fmt=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
export default function Exam({questions,user}){
  const [cfg,setCfg]=useState({mode:"simulasi",cat:"all",n:20}),[run,setRun]=useState(null),[res,setRes]=useState(null),ref=useRef();
  ref.current=run;const sim=cfg.mode==="simulasi";
  const start=()=>{const pool=sh(questions.filter(q=>cfg.cat==="all"||q.category===cfg.cat)).slice(0,cfg.n);
    if(!pool.length)return alert("Belum ada soal untuk pilihan ini.");
    setRes(null);setRun({items:pool.map(q=>({...q,order:sh([0,1,2,3])})),ans:pool.map(()=>-1),flag:pool.map(()=>false),cur:0,left:pool.length*60,t0:Date.now()})};
  const upd=p=>setRun(r=>({...r,...p}));
  async function finish(){
    const r=ref.current;if(!r)return;const byCat={};let correct=0;
    r.items.forEach((q,i)=>{const ok=r.ans[i]===q.answer;if(ok)correct++;byCat[q.category]=byCat[q.category]||[0,0];byCat[q.category][1]++;if(ok)byCat[q.category][0]++});
    const out={uid:user.uid,email:user.email,name:user.displayName||user.email,mode:cfg.mode,total:r.items.length,correct,score:Math.round(correct/r.items.length*100),byCat,at:Date.now(),durationSec:Math.round((Date.now()-r.t0)/1000)};
    try{await addDoc(collection(db,"results"),out)}catch(e){console.error(e)}
    setRes({...out,run:r});setRun(null);
  }
  useEffect(()=>{if(!run||!sim)return;const t=setInterval(()=>{if(ref.current.left<=1){clearInterval(t);finish()}else upd({left:ref.current.left-1})},1000);return()=>clearInterval(t)},[!!run]);
  if(res)return <><h2>Hasil</h2><div className="card"><div className="big">{res.score}</div><p>{res.correct} benar dari {res.total} soal · {fmt(res.durationSec)}</p>
    <table><tbody>{Object.entries(res.byCat).map(([k,[c,t]])=><tr key={k}><td>{k}</td><td>{c}/{t}</td></tr>)}</tbody></table><button className="gold" onClick={()=>setRes(null)}>Ujian baru</button></div>
    <h3>Pembahasan</h3>{res.run.items.map((q,i)=><div className="card" key={i}><small>{i+1}. {q.category}</small><p>{q.question}</p>
      {q.options.map((o,j)=><div key={j} className={"opt "+(j===q.answer?"ok":res.run.ans[i]===j?"no":"")}><b>{"ABCD"[j]}.</b> {o}</div>)}<div className="ex">{q.explanation}</div></div>)}</>;
  if(!run)return <><h2>Mulai ujian</h2><div className="card form">
    <label>Mode<select value={cfg.mode} onChange={e=>setCfg({...cfg,mode:e.target.value})}><option value="simulasi">Simulasi UPA (timer, navigasi)</option><option value="latihan">Latihan (pembahasan langsung)</option></select></label>
    <label>Kategori<select value={cfg.cat} onChange={e=>setCfg({...cfg,cat:e.target.value})}><option value="all">Semua kategori</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label>
    <label>Jumlah soal<input type="number" min="1" max="200" value={cfg.n} onChange={e=>setCfg({...cfg,n:+e.target.value||1})}/></label>
    <p><small>Bank soal tersedia: {questions.length}. Waktu simulasi: 1 menit per soal.</small></p><button className="gold" onClick={start}>Mulai</button></div></>;
  const {items,ans,flag,cur,left}=run,q=items[cur],locked=!sim&&ans[cur]>=0;
  return <><div className="top"><b>Soal {cur+1}/{items.length}</b>{sim&&<span className={"timer "+(left<60?"low":"")}>{fmt(left)}</span>}</div>
    <div className="exam"><div className="card"><small>{q.category}</small><p className="q">{q.question}</p>
      {q.order.map((oi,k)=>{const cls=locked?(oi===q.answer?"ok":ans[cur]===oi?"no":""):ans[cur]===oi?"sel":"";
        return <button key={oi} className={"opt "+cls} disabled={locked} onClick={()=>{const a=[...ans];a[cur]=oi;upd({ans:a})}}><b>{"ABCD"[k]}.</b> {q.options[oi]}</button>})}
      {locked&&<div className="ex">{q.explanation}</div>}
      <div className="row"><button disabled={!cur} onClick={()=>upd({cur:cur-1})}>Sebelumnya</button>
        {sim&&<button onClick={()=>{const f=[...flag];f[cur]=!f[cur];upd({flag:f})}}>{flag[cur]?"Hapus ragu-ragu":"Ragu-ragu"}</button>}
        {cur<items.length-1?<button className="navy" onClick={()=>upd({cur:cur+1})}>Selanjutnya</button>:<button className="gold" onClick={()=>confirm("Selesaikan ujian?")&&finish()}>Selesai</button>}</div></div>
      <aside className="card"><b>Navigasi</b><div className="grid">{items.map((_,i)=><button key={i} className={(flag[i]?"flag":ans[i]>=0?"done":"")+(i===cur?" cur":"")} onClick={()=>upd({cur:i})}>{i+1}</button>)}</div>
        <small>Biru: terjawab · Kuning: ragu-ragu · Putih: belum dijawab</small><button className="gold full" onClick={()=>confirm(`Belum dijawab: ${ans.filter(a=>a<0).length}. Akhiri ujian?`)&&finish()}>Akhiri ujian</button></aside></div></>;
}
