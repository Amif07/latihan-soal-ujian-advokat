import {collection,getDocs} from "firebase/firestore";import {db} from "../firebase";import sample from "../data/questions.sample.json";
export const CATEGORIES=["Kode Etik Advokat","UU Advokat","Hukum Acara Perdata","Hukum Acara Pidana","Hukum Acara TUN","Hukum Acara Agama","Hukum Perdata","Hukum Pidana","Hukum Perusahaan","Ketenagakerjaan","Hukum Tata Negara"];
export async function loadQuestions(){
  const s=await getDocs(collection(db,"questions"));
  return s.empty?sample.map((q,i)=>({...q,id:"sample"+i})):s.docs.map(d=>({...d.data(),id:d.id}));
}
export const valid=q=>q&&q.category&&q.question&&Array.isArray(q.options)&&q.options.length===4&&q.options.every(Boolean)&&[0,1,2,3].includes(q.answer);
