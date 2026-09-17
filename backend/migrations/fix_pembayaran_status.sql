-- Jalankan sekali pada database latihan_toko.
-- Tujuan: memastikan kolom pembayaran dapat menyimpan semua pilihan
-- yang digunakan panel admin tanpa bergantung pada ENUM lama.
UPDATE pembelian
SET pembayaran = 'Belum Bayar'
WHERE pembayaran IS NULL OR TRIM(pembayaran) = '';

ALTER TABLE pembelian
MODIFY COLUMN pembayaran VARCHAR(50) NULL DEFAULT 'Belum Bayar';

-- Pilihan yang dipakai aplikasi:
-- Belum Bayar
-- Menunggu Verifikasi
-- Sudah Bayar
