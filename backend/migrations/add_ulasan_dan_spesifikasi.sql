-- Jalankan sekali pada database Toko Pengrajut D-PLOSOKK.
-- 1) Tabel ulasan/rating pembeli per produk.
-- 2) Kolom spesifikasi tambahan pada tabel produk (bahan, ukuran, stok).
-- Catatan: keduanya juga otomatis dibuat/ditambahkan sendiri oleh aplikasi
-- (lihat models/ulasanModel.js dan models/produkModel.js) kalau migrasi ini
-- belum sempat dijalankan manual.

CREATE TABLE IF NOT EXISTS ulasan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_produk INT NOT NULL,
    id_pembeli INT NOT NULL,
    rating TINYINT NOT NULL,
    komentar TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_ulasan (id_produk, id_pembeli)
);

ALTER TABLE produk ADD COLUMN IF NOT EXISTS bahan VARCHAR(150) NULL;
ALTER TABLE produk ADD COLUMN IF NOT EXISTS ukuran VARCHAR(150) NULL;
ALTER TABLE produk ADD COLUMN IF NOT EXISTS stok INT NULL;
