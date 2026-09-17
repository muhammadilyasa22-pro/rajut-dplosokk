# Frontend Full Toko Pengrajut D-PLOSOKK

Frontend React + Vite untuk Toko Pengrajut D-PLOSOKK milik Bu Endang.

## Karakteristik
- Tidak menggunakan Axios.
- Semua request API menggunakan `fetch()`.
- Tidak menggunakan `lucide-react` atau library icon lain.
- Logo berada di `src/assets/logo-dplosokk.png`.
- Layout admin mengikuti referensi: sidebar gelap, header putih, kartu statistik, tabel putih, dan background krem.
- Coding dibuat terstruktur per file dan tidak sengaja dipadatkan menjadi satu baris.

## Struktur utama
```text
src/
├── assets/
├── components/
│   ├── admin/
│   ├── layout/
│   └── RequireAuth.jsx
├── context/
├── layouts/
├── pages/
│   ├── admin/
│   └── pembeli/
├── config.js
├── services.js
├── App.jsx
├── main.jsx
└── styles.css
```

## Menjalankan
```bash
npm install
npm run dev
```

Default API:
```text
http://localhost:5000/api
```

Jika backend memakai URL lain, buat `.env` berdasarkan `.env.example`.

## Backend yang digunakan
Frontend ini disesuaikan dengan route backend yang diberikan:
- `/api/auth`
- `/api/produk`
- `/api/artikel`
- `/api/pembelian`
- `/api/admin`

Admin menggunakan endpoint `/api/admin/*` untuk statistik, produk, pembeli, artikel, dan pesanan.

## Catatan
Backend yang diberikan belum mempunyai route pesan kontak dan penyimpanan info toko. Karena itu halaman tersebut tidak melakukan request palsu ke endpoint yang belum ada. Info toko disimpan lokal di browser sampai backend menambahkan endpoint khusus.

## Perbaikan path gambar
Versi ini menggunakan `http://localhost:5000/uploads/images/<nama-file>` untuk gambar upload. Backend juga mengekspos folder `uploads/images` pada path tersebut, sehingga gambar produk/artikel hasil edit dapat tampil di halaman publik.
