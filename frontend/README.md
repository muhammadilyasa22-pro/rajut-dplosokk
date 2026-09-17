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