# CAT UPA Advokat

Aplikasi latihan Ujian Profesi Advokat (React + Vite + Firebase Auth + Firestore). Deploy otomatis ke GitHub Pages lewat GitHub Actions.

## Struktur
```
.github/workflows/deploy.yml   CI/CD ke GitHub Pages
firestore.rules                Aturan keamanan (admin vs peserta)
src/App.jsx                    Login, navigasi, peran
src/pages/Dashboard.jsx        Statistik, grafik, materi lemah, riwayat
src/pages/Exam.jsx             Mode Latihan dan Simulasi UPA (timer, navigasi, ragu-ragu)
src/pages/Admin.jsx            CRUD soal, impor JSON/CSV, statistik semua pengguna
src/lib/                       useAuth, daftar kategori, pemuat soal
src/data/questions.sample.json Contoh bank soal (dipakai jika Firestore masih kosong)
```

## Langkah 1. Siapkan Firebase
1. Buka https://console.firebase.google.com, buat proyek baru.
2. Build > Authentication > Get started > Sign-in method > aktifkan **Google**.
3. Build > Firestore Database > Create database (mode production).
4. Tab **Rules**: tempel isi `firestore.rules`, lalu Publish.
5. Project settings (ikon roda gigi) > Your apps > tambah aplikasi **Web (</>)**. Salin nilai `apiKey`, `authDomain`, `projectId`, `appId`.

## Langkah 2. Jalankan lokal
```
npm install
cp .env.example .env     # isi dengan nilai dari Firebase
npm run dev
```

## Langkah 3. Jadikan diri Anda Admin
Login sekali dengan akun Google Anda (dokumen `users/{uid}` dibuat otomatis dengan role `user`). Di Firebase Console > Firestore > koleksi `users` > dokumen milik Anda, ubah field `role` menjadi `admin`, lalu muat ulang aplikasi. Peran admin tidak bisa diubah dari aplikasi oleh pengguna biasa karena dikunci oleh `firestore.rules`.

## Langkah 4. Hubungkan ke GitHub dan deploy
1. Buat repositori baru di GitHub, lalu:
```
git init && git add . && git commit -m "init"
git branch -M main
git remote add origin https://github.com/USERNAME/upa-cat-advokat.git
git push -u origin main
```
2. Repo > Settings > Secrets and variables > Actions > **New repository secret**, tambahkan empat secret: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
3. Repo > Settings > Pages > Source: **GitHub Actions**.
4. Push ke `main` akan menjalankan build dan deploy. Alamat: `https://USERNAME.github.io/upa-cat-advokat/`.
5. Firebase Console > Authentication > Settings > **Authorized domains** > tambahkan `USERNAME.github.io`. Tanpa ini login Google akan gagal di situs yang sudah online.

### Alternatif Vercel / Netlify
Import repo, build command `npm run build`, output `dist`, lalu isi empat variabel lingkungan yang sama. Tambahkan domain yang diberikan ke Authorized domains Firebase.

## Menambah ratusan soal
Admin > Impor JSON/CSV.
- JSON: array objek `{"category","question","options":[4 pilihan],"answer":0-3,"explanation"}`. Lihat `src/data/questions.sample.json`.
- CSV: kolom `kategori,pertanyaan,a,b,c,d,jawaban,pembahasan` (jawaban berisi huruf a-d).
Nilai `category` sebaiknya salah satu dari daftar di `src/lib/questions.js`.

## Catatan
- Kunci jawaban tersimpan di Firestore dan dapat dibaca peserta yang login. Ini cukup untuk latihan, bukan untuk ujian bernilai tinggi.
- Pastikan soal dan pembahasan hukum acara pidana mengacu pada KUHP dan KUHAP yang berlaku saat ini.
