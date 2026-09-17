-- Jalankan sekali pada database Toko Pengrajut D-PLOSOKK.
-- Membuat tabel kategori produk (fitur CRUD Kategori di panel admin).
-- Catatan: tabel ini juga otomatis dibuat sendiri oleh aplikasi
-- (lihat models/kategoriModel.js) kalau migrasi ini belum sempat dijalankan.

CREATE TABLE IF NOT EXISTS kategori (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO kategori (nama) VALUES
    ('Baju Rajut'),
    ('Sweater'),
    ('Tas Rajut'),
    ('Mainan Rajut'),
    ('Aksesori Rajut'),
    ('Souvenir Rajut');
