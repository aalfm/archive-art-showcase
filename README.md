<div align="center">

<img src="public/logo/Favicon_archive.svg" alt="Logo Resmi ARCHIVE" width="76" height="76" />

# ARCHIVE

*Tempat Arsitektur Bertemu Ekspresi Digital.*

Platform galeri seni dan arsitektur digital untuk menjelajahi karya visual, mengikuti tantangan desain, dan berkolaborasi dalam komunitas kreatif.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-1A1917?style=flat-square&logo=nextdotjs&logoColor=F7F5F0)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-1A1917?style=flat-square&logo=react&logoColor=F7F5F0)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-303438?style=flat-square&logo=postgresql&logoColor=F7F5F0)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-303438?style=flat-square&logo=tailwindcss&logoColor=F7F5F0)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.13.0-8C7963?style=flat-square)](https://gsap.com/)

**Navigasi Cepat:** [Tentang](#tentang-proyek) · [Fitur](#fitur-utama) · [Tampilan](#tampilan-aplikasi) · [Arsitektur](#arsitektur--basis-data) · [Teknologi](#teknologi-yang-digunakan) · [Cara Menjalankan](#cara-menjalankan) · [Panduan](#panduan-penggunaan) · [Tanya Jawab](#tanya-jawab-kendala-umum)

[Buka Repositori](https://github.com/aalfm/arthive-art-showcase) · [Laporkan Masalah](https://github.com/aalfm/arthive-art-showcase/issues)

</div>

---

## Tentang Proyek

**ARCHIVE** adalah aplikasi web yang dibuat khusus untuk memamerkan karya arsitektur digital, desain ruang, dan fotografi arsitektur.

Kalau di media sosial biasa karya desain sering tenggelam oleh berbagai konten acak, di **ARCHIVE** semua karya dikelompokkan berdasarkan gaya arsitektur (seperti *Modern*, *Brutalist*, *Organic*, *Parametric*, dan *Sustainable Architecture*). Selain itu, setiap pengguna punya ruang kerja masing-masing sesuai perannya: **Member**, **Kurator**, dan **Admin**.

---

## Fitur Utama

- **Galeri Publik Interaktif** — Halaman utama dengan carousel 3D (`DepthCarousel`), halaman jelajah karya (`/explore`) dengan pencarian & filter kategori, profil seniman (`/artists`), dan daftar tantangan (`/challenges`).
- **Ruang Kreator (Member)** — Unggah karya lewat file gambar atau URL, edit/hapus karya, simpan karya favorit, ikut tantangan, serta beri *like* dan komentar.
- **Ruang Kurator** — Buat dan kelola tantangan desain berhadiah, tinjau karya yang masuk, dan tentukan pemenang Juara 1–3 setelah periode lomba selesai.
- **Ruang Admin** — Verifikasi pendaftar kurator, aktifkan/nonaktifkan akun pengguna, kelola kategori arsitektur, dan moderasi laporan konten.

<details>
<summary><strong>Klik untuk melihat Tabel Hak Akses Tiap Peran</strong></summary>

| Fitur / Aksi | Pengunjung Umum | Member | Kurator (Pending) | Kurator (Disetujui) | Admin |
|---|---|---|---|---|---|
| Lihat karya, seniman, dan tantangan | Bisa | Bisa | Bisa | Bisa | Bisa |
| *Like*, favorit, komentar, lapor karya | Tidak | Bisa | Bisa | Bisa | Dibatasi* |
| Unggah, edit, hapus karya sendiri | Tidak | Bisa | Tidak | Tidak | Edit / Hapus semua |
| Kirim & tarik karya di tantangan | Tidak | Bisa | Tidak | Tidak | Tidak |
| Ubah profil & kata sandi | Tidak | Bisa | Bisa | Bisa | Bisa |
| Buat, edit, hapus tantangan sendiri | Tidak | Tidak | Tidak | Bisa | Edit / Hapus semua |
| Pilih pemenang tantangan (Juara 1–3) | Tidak | Tidak | Tidak | Bisa | Tidak |
| Setujui atau tolak pendaftaran kurator | Tidak | Tidak | Tidak | Tidak | Bisa |
| Aktifkan / nonaktifkan akun pengguna | Tidak | Tidak | Tidak | Tidak | Bisa (non-admin) |
| Kelola kategori & tindak lanjuti laporan | Tidak | Tidak | Tidak | Tidak | Bisa |

*\*Admin tidak bisa memberi like, favorit, komentar, atau laporan agar proses moderasi tetap netral.*

</details>

<details>
<summary><strong>Klik untuk melihat Daftar Halaman & API yang Bisa Dicoba</strong></summary>

| Bagian | Alamat URL | Siapa yang Bisa Akses | Kegunaan |
|---|---|---|---|
| Beranda | `/` | Semua orang | Carousel 3D, galeri pilihan, tantangan aktif, daftar seniman |
| Jelajah Karya | `/explore` | Semua orang | Cari karya/seniman, filter kategori, urutkan terbaru/terpopuler |
| Detail Karya | `/artworks/[id]` | Semua orang | Lihat detail, *like*, favorit, komentar, dan lapor karya |
| Seniman | `/artists`, `/artists/[id]` | Semua orang | Daftar seniman aktif dan halaman portofolio masing-masing |
| Tantangan | `/challenges`, `/challenges/[id]` | Semua orang | Info lomba, aturan, hadiah, kirim karya, dan daftar pemenang |
| Masuk / Daftar | `/login`, `/register` | Publik | Login atau daftar akun baru (`member` atau `curator`) |
| Upload Gambar | `POST /api/upload` | Pengguna Login | Validasi & ubah ukuran gambar otomatis ke `public/uploads/` |
| Cari Tantangan | `GET /api/challenges/search` | Semua orang | Pencarian tantangan dan hitung jumlah tantangan aktif/mendatang |
| Dashboard Member | `/dashboard/member/*` | Member | Ringkasan, kelola karya, favorit, submisi, profil, pengaturan |
| Dashboard Kurator | `/dashboard/curator/*` | Kurator Disetujui | Ringkasan, kelola tantangan, nilai submisi & pilih pemenang |
| Dashboard Admin | `/dashboard/admin/*` | Admin | Ringkasan, kelola user, verifikasi kurator, kategori, laporan |

</details>

[↑ Kembali ke Atas](#archive)

---

## Tampilan Aplikasi

> **Catatan:** Saat ini belum ada gambar tangkapan layar aplikasi di dalam repositori.
>
> Setelah Anda menjalankan aplikasi di komputer lokal, Anda bisa mengambil tangkapan layar halaman berikut lalu menyimpannya di folder `public/` atau `docs/` untuk ditampilkan di sini:
> - **Beranda (`/`)** — Tampilan galeri bergerak 3D (*carousel*) dan karya pilihan utama.
> - **Jelajah & Detail Karya (`/explore`, `/artworks/[id]`)** — Filter kategori dan kolom komentar.
> - **Halaman Tantangan (`/challenges/[id]`)** — Informasi lomba dan daftar pemenang.
> - **Dasbor (`/dashboard/*`)** — Tampilan panel Member, Kurator, dan Admin.

---

## Teknologi yang Digunakan

- **Tampilan Depan (Frontend):** Next.js `16.4.6` (App Router), React `19.3.0`, Tailwind CSS `4.3.3`, GSAP `^3.13.0` (animasi *carousel* 3D), Font Manrope, Ikon SVG kustom
- **Logika Server (Backend):** Next.js *Server Actions* & *Route Handlers*, `jose` `^6.2.18` (token sesi JWT), `bcryptjs` `^3.0.3` (enkripsi kata sandi), `sharp` `^0.35.5` (validasi & ubah ukuran gambar), `uuid` `^14.0.3`
- **Basis Data (Database):** PostgreSQL `14+` menggunakan pustaka `pg` `^8.23.1`
- **Alat Bantu:** Node.js `20+`, npm, ESLint `^9`

---

## Arsitektur & Basis Data

Penjelasan singkat cara kerja **ARCHIVE**:
1. Saat pengguna membuka halaman publik (`/`, `/explore`, `/artists`, `/challenges`), server langsung mengambil data dari PostgreSQL.
2. Saat pengguna membuka halaman `/dashboard/*`, file `src/proxy.js` mengecek apakah cookie sesi (`arthive_session`) ada dan valid. Setelah itu, `src/lib/auth.js` mengecek ulang ke database untuk memastikan akun masih aktif dan perannya sesuai.
3. Saat Member mengunggah gambar, endpoint `/api/upload` memeriksa format (`JPEG`, `PNG`, `WebP`, `GIF`) dan ukuran maksimal `10 MB`, lalu memprosesnya dengan `sharp` dan menyimpannya ke folder `public/uploads/`.

<details>
<summary><strong>Klik untuk melihat Diagram Alur Aplikasi & Relasi Database</strong></summary>

### Alur Kerja Aplikasi

```mermaid
flowchart TD
    Client["Browser Pengguna"]
    Proxy["src/proxy.js (Cek Cookie di /dashboard/*)"]
    Public["Halaman Publik (/, /explore, /artists, /challenges)"]
    Dashboard["Dashboard (/dashboard/member, /curator, /admin)"]
    Actions["Server Actions (src/lib/actions/*.js)"]
    API["API Route (/api/upload, /api/challenges/search)"]
    Auth["Cek Login & Peran (src/lib/auth.js)"]
    Sharp["Proses Gambar (sharp -> public/uploads/)"]
    DB[("Database PostgreSQL")]

    Client --> Proxy
    Client --> Public
    Proxy --> Dashboard
    Public --> DB
    Dashboard --> Auth
    Auth --> DB
    Dashboard --> Actions
    Public --> Actions
    Actions --> Auth
    Actions --> DB
    Client --> API
    API --> Auth
    API --> Sharp
    API --> DB
```

### Relasi Tabel Database (10 Tabel)

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : punya
    USERS ||--o{ ARTWORKS : membuat
    USERS ||--o{ CHALLENGES : mengadakan
    USERS ||--o{ SUBMISSIONS : mengirim
    USERS ||--o{ COMMENTS : menulis
    USERS ||--o{ FAVORITES : menyimpan
    USERS ||--o{ ARTWORK_LIKES : menyukai
    USERS ||--o{ REPORTS : melapor

    CATEGORIES ||--o{ ARTWORKS : mengelompokkan
    ARTWORKS ||--o{ ARTWORK_LIKES : disukai
    ARTWORKS ||--o{ FAVORITES : difavoritkan
    ARTWORKS ||--o{ COMMENTS : memiliki
    ARTWORKS ||--o{ REPORTS : dilaporkan
    ARTWORKS ||--o{ SUBMISSIONS : diikutkan
    CHALLENGES ||--o{ SUBMISSIONS : menerima
```

</details>

[↑ Kembali ke Atas](#archive)

---

## Cara Menjalankan

### Persiapan Awal (Prasyarat)

Pastikan komputer Anda sudah terpasang:
- **Node.js** versi `20` atau lebih baru
- **npm** (otomatis ikut terpasang bersama Node.js)
- **PostgreSQL** versi `14` atau lebih baru

### Daftar Periksa Instalasi Langkah demi Langkah

Ikuti urutan di bawah ini (centang jika sudah selesai):

- [ ] **1. Unduh (clone) proyek ini ke komputer Anda**
  ```bash
  git clone https://github.com/aalfm/arthive-art-showcase.git
  cd arthive-art-showcase
  ```
- [ ] **2. Pasang semua paket yang dibutuhkan**
  ```bash
  npm install
  ```
- [ ] **3. Salin file pengaturan environment**
  ```bash
  cp .env.example .env.local
  ```
  Buka file `.env.local`, lalu isi `DATABASE_URL` sesuai password PostgreSQL Anda dan isi `SESSION_SECRET` dengan teks acak minimal 32 karakter.
- [ ] **4. Buat database dan isi data awalnya (`schema.sql` lalu `seed.sql`)**
  ```bash
  psql -U postgres -c "CREATE DATABASE arthive_db;"
  psql -U postgres -d arthive_db -f database/schema.sql
  psql -U postgres -d arthive_db -f database/seed.sql
  ```
- [ ] **5. Jalankan server pengembangan**
  ```bash
  npm run dev
  ```
  Buka browser dan kunjungi `http://localhost:3000`.

<details>
<summary><strong>Klik untuk melihat Isi `.env.local` & Akun Demo Siap Pakai</strong></summary>

### Penjelasan Variabel Lingkungan (`.env.example`)

| Nama Variabel | Fungsi | Wajib? | Contoh Isi |
|---|---|---|---|
| `DATABASE_URL` | Alamat koneksi ke database PostgreSQL Anda. | Ya | `postgresql://postgres:password_anda@localhost:5432/arthive_db` |
| `SESSION_SECRET` | Kunci rahasia (minimal 32 karakter) untuk mengamankan cookie login. | Ya (Produksi) | `ganti-dengan-teks-acak-minimal-32-karakter` |
| `NEXT_PUBLIC_APP_URL` | Alamat utama aplikasi saat dijalankan. | Tidak | `http://localhost:3000` |

### Akun Demo (dari `database/seed.sql`)

Anda bisa langsung login menggunakan akun berikut untuk mencoba semua fitur:

| Peran | Email | Password | Status |
|---|---|---|---|
| Admin | `admin@arthive.com` | `Admin@123` | Aktif |
| Kurator | `kurator@arthive.com` | `Curator@123` | Disetujui |
| Member | `member@arthive.com` | `Member@123` | Aktif |

</details>

<details>
<summary><strong>Klik untuk melihat Perintah npm Lainnya</strong></summary>

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Menjalankan aplikasi dalam mode pengembangan di `http://localhost:3000`. |
| `npm run build` | Memeriksa dan membangun aplikasi agar siap dijalankan di server produksi. |
| `npm run start` | Menjalankan hasil build produksi (harus jalankan `npm run build` dulu). |
| `npm run lint` | Memeriksa kerapian dan potensi kesalahan kode menggunakan ESLint. |

</details>

[↑ Kembali ke Atas](#archive)

---

## Panduan Penggunaan

Pilih peran di bawah ini untuk melihat cara pakai aplikasinya:

<details>
<summary><strong>1. Sebagai Pengunjung Umum (Tanpa Login)</strong></summary>

1. Buka `http://localhost:3000` untuk melihat galeri utama dan carousel 3D.
2. Buka menu **Explore** (`/explore`) untuk mencari karya berdasarkan judul, nama seniman, atau kategori arsitektur.
3. Klik karya mana saja untuk membaca deskripsi dan komentar, atau buka **Artists** (`/artists`) dan **Challenges** (`/challenges`).

</details>

<details>
<summary><strong>2. Sebagai Member (Seniman / Kreator)</strong></summary>

1. Login menggunakan akun Member (`member@arthive.com` / `Member@123`) atau daftar akun baru di `/register`.
2. Di `/dashboard/member`, pilih **Artworks → Create** untuk mengunggah gambar karya (`JPEG`, `PNG`, `WebP`, `GIF` maks 10 MB) atau tempel URL gambar.
3. Buka halaman karya orang lain untuk memberi *like*, menyimpan ke **Favorites**, menulis komentar, atau melaporkan karya yang melanggar aturan.
4. Buka halaman tantangan aktif di `/challenges/[id]` untuk mengirimkan karya Anda, lalu pantau statusnya di menu **Submissions**.

</details>

<details>
<summary><strong>3. Sebagai Kurator</strong></summary>

1. Jika mendaftar baru sebagai `curator`, akun akan berstatus `pending` dan diarahkan ke `/dashboard/curator/pending` sampai disetujui Admin.
2. Atau langsung login dengan akun demo Kurator (`kurator@arthive.com` / `Curator@123`) untuk masuk ke `/dashboard/curator`.
3. Buat tantangan baru lengkap dengan banner, aturan, hadiah, serta tanggal mulai dan selesai.
4. Setelah tanggal selesai tantangan lewat, buka daftar **Submissions** untuk memilih Juara 1, Juara 2, dan Juara 3.

</details>

<details>
<summary><strong>4. Sebagai Admin</strong></summary>

1. Login menggunakan akun demo Admin (`admin@arthive.com` / `Admin@123`) untuk masuk ke `/dashboard/admin`.
2. Buka **Curators** (`/dashboard/admin/curators`) untuk menyetujui atau menolak pendaftar kurator baru.
3. Buka **Users** (`/dashboard/admin/users`) untuk mencari pengguna dan mengaktifkan/menonaktifkan akun non-admin.
4. Buka **Categories** (`/dashboard/admin/categories`) untuk menambah atau mengubah kategori, dan **Reports** (`/dashboard/admin/reports`) untuk menindaklanjuti laporan karya.

</details>

---

## Struktur Folder

<details>
<summary><strong>Klik untuk melihat Penjelasan Struktur Folder Proyek</strong></summary>

```text
arthive-art-showcase/
├── database/
│   ├── schema.sql                  # Kode SQL untuk membuat 10 tabel database & index
│   └── seed.sql                    # Data contoh awal (akun demo, kategori, karya, tantangan)
├── public/
│   ├── logo/                       # File logo dan ikon resmi ARCHIVE
│   └── uploads/                    # Tempat tersimpannya gambar karya yang diunggah pengguna
├── src/
│   ├── app/
│   │   ├── (public)/               # Halaman publik: explore, detail karya, seniman, tantangan, login, register
│   │   ├── api/                    # Endpoint backend (/api/upload dan /api/challenges/search)
│   │   ├── dashboard/              # Halaman khusus Admin, Kurator, dan Member
│   │   ├── globals.css             # Pengaturan warna, font, dan gaya tampilan utama
│   │   ├── layout.js               # Kerangka HTML utama & pemuatan font Manrope
│   │   └── page.js                 # Halaman beranda utama
│   ├── components/                 # Komponen UI yang dipakai ulang (Navbar, Footer, DepthCarousel, dll.)
│   ├── lib/
│   │   ├── actions/                # Fungsi Server Actions untuk simpan/ubah/hapus data ke database
│   │   ├── auth.js                 # Pengaturan login, cookie sesi, dan pengecekan hak akses
│   │   ├── db.js                   # Koneksi ke database PostgreSQL
│   │   └── utils.js                # Fungsi bantu validasi ID
│   └── proxy.js                    # Penjaga otomatis agar halaman /dashboard/* tidak bisa dibuka tanpa login
├── .env.example                    # Contoh file pengaturan environment
├── next.config.mjs                 # Konfigurasi Next.js (batas upload 10MB & domain gambar)
└── package.json                    # Daftar library dan perintah npm
```

</details>

---

## Tanya Jawab (Kendala Umum)

<details>
<summary><strong>Klik jika muncul error koneksi database (`[DB] Query error`)</strong></summary>

- Pastikan aplikasi/layanan **PostgreSQL** sudah menyala di komputer Anda.
- Periksa kembali isi `DATABASE_URL` di file `.env.local` (pastikan username, password, port `5432`, dan nama database `arthive_db` sudah benar).

</details>

<details>
<summary><strong>Klik jika selalu diarahkan kembali ke `/login` setelah berhasil masuk</strong></summary>

- Pastikan Anda sudah menjalankan file `database/schema.sql` sehingga tabel `sessions` sudah terbentuk di database.
- Pastikan variabel `SESSION_SECRET` sudah diisi di file `.env.local`.

</details>

<details>
<summary><strong>Klik jika gagal saat `npm install` atau upload gambar error karena `sharp`</strong></summary>

- Pastikan Node.js Anda minimal versi `20`.
- Jalankan perintah berikut di terminal:
  ```bash
  npm rebuild sharp
  ```

</details>

<details>
<summary><strong>Klik jika port `3000` sudah dipakai aplikasi lain</strong></summary>

- Tutup aplikasi lain yang memakai port `3000`, atau jalankan di port lain dengan perintah:
  ```bash
  npx next dev -p 3001
  ```

</details>

---

## Berkontribusi

Kontribusi, saran, dan laporan *bug* sangat terbuka:

1. *Fork* repositori ini.
2. Buat branch baru (`git checkout -b feat/nama-fitur`).
3. Pastikan kode rapi dan bebas error dengan menjalankan:
   ```bash
   npm run lint
   npm run build
   ```
4. *Commit* perubahan Anda lalu ajukan *Pull Request*.

---

## Lisensi & Penulis

- **Lisensi:** Belum ada file `LICENSE` yang ditentukan di repositori ini.
- **Dibuat dengan:** [Next.js](https://nextjs.org/), [React](https://react.dev/), [PostgreSQL](https://www.postgresql.org/), [Tailwind CSS](https://tailwindcss.com/), [GSAP](https://gsap.com/), [jose](https://github.com/panva/jose), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), dan [sharp](https://sharp.pixelplumbing.com/).
- **Penulis:** **aalfm** — [GitHub](https://github.com/aalfm)
