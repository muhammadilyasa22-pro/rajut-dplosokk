-- Jalankan sekali pada database Toko Pengrajut D-PLOSOKK.
-- Membuat tabel pengaturan toko (saat ini dipakai untuk menyimpan foto QRIS pembayaran).
-- Catatan: tabel ini juga otomatis dibuat sendiri oleh aplikasi (lihat models/pengaturanModel.js)
-- kalau migrasi ini belum sempat dijalankan, jadi fitur QRIS tetap aman berjalan.

CREATE TABLE IF NOT EXISTS pengaturan_toko (
    id INT PRIMARY KEY,
    qris_image VARCHAR(255) NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO pengaturan_toko (id, qris_image)
SELECT 1, 'qris-default.png'
WHERE NOT EXISTS (
    SELECT 1 FROM pengaturan_toko WHERE id = 1
);
