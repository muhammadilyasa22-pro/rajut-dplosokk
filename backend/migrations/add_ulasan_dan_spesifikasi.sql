-- Jalankan sekali pada database Toko Pengrajut D-PLOSOKK.
-- 1) Tabel ulasan/rating pembeli per produk.
-- 2) Kolom spesifikasi tambahan pada tabel produk (bahan, ukuran, stok).
-- Catatan: keduanya juga otomatis dibuat/ditambahkan sendiri oleh aplikasi
-- (lihat models/ulasanModel.js dan models/produkModel.js) kalau migrasi ini
-- belum sempat dijalankan manual.

CREATE TABLE IF NOT EXISTS ulasan (
    id SERIAL PRIMARY KEY,
    id_produk INTEGER NOT NULL,
    id_pembeli INTEGER NOT NULL,
    rating SMALLINT NOT NULL,
    komentar TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_ulasan UNIQUE (id_produk, id_pembeli)
);

ALTER TABLE produk ADD COLUMN IF NOT EXISTS bahan VARCHAR(150) NULL;
ALTER TABLE produk ADD COLUMN IF NOT EXISTS ukuran VARCHAR(150) NULL;
ALTER TABLE produk ADD COLUMN IF NOT EXISTS stok INTEGER NULL;
