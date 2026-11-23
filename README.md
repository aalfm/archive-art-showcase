# ARTHIVE — Digital Art Showcase Platform

Platform galeri seni digital berbasis Next.js (App Router) dan PostgreSQL untuk seniman (Member), Kurator, dan Administrator.

## Fitur Utama

- **Publik**: Beranda interaktif (3D Hero Carousel & Galeri), Jelajahi Karya (pencarian, filter kategori, urutan terbaru/populer), Detail Karya (like, favorit, komentar, laporkan), Daftar & Profil Seniman, serta Daftar & Detail Tantangan beserta pemenangnya.
- **Member Dashboard** (`/dashboard/member`): Ringkasan statistik, Edit Profil publik, CRUD Karya (unggah gambar lokal ke `/public/uploads` atau via URL), Koleksi Favorit, Submisi Tantangan (kirim & tarik submisi), dan Pengaturan Password.
- **Curator Dashboard** (`/dashboard/curator`): Status verifikasi kurator (`/dashboard/curator/pending`), CRUD Tantangan, Tinjau Submisi peserta, dan Tetapkan Pemenang (Juara 1–3) setelah periode kompetisi berakhir.
- **Admin Dashboard** (`/dashboard/admin`): Statistik platform real-time, Manajemen Pengguna (cari, filter peran, hapus akun non-admin), Verifikasi Kurator (setujui/tolak), Manajemen Kategori, dan Moderasi Konten (abaikan laporan / takedown karya).

## Prasyarat

- Node.js 20+
- PostgreSQL 14+

## Setup & Menjalankan Aplikasi

1. **Instal dependensi**:
   ```bash
   npm install
   ```

2. **Konfigurasi Environment Variables**:
   Salin `.env.example` menjadi `.env.local`, lalu sesuaikan nilai `DATABASE_URL` dan `SESSION_SECRET`:
   ```bash
   cp .env.example .env.local
   ```

3. **Inisialisasi Database PostgreSQL**:
   Buat database `arthive_db`, lalu jalankan skema dan data awal:
   ```bash
   psql -U postgres -c "CREATE DATABASE arthive_db;"
   psql -U postgres -d arthive_db -f database/schema.sql
   psql -U postgres -d arthive_db -f database/seed.sql
   ```

4. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000`.

5. **Build Production**:
   ```bash
   npm run build
   npm run start
   ```

## Akun Demo (dari `database/seed.sql`)

| Peran | Email | Password |
|---|---|---|
| Admin | `admin@arthive.com` | `Admin@123` |
| Kurator (Approved) | `kurator@arthive.com` | `Curator@123` |
| Member | `member@arthive.com` | `Member@123` |
