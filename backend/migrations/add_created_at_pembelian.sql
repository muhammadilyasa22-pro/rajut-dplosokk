-- Jalankan sekali pada database Toko Pengrajut D-PLOSOKK.
-- Tujuan: menyimpan tanggal & jam pemesanan agar bisa ditampilkan
-- di Laporan Penjualan panel admin (kolom Tanggal, Jam, dan Pembeli).
--
-- Catatan: transaksi LAMA yang sudah ada sebelum migrasi ini dijalankan
-- akan otomatis terisi dengan waktu SAAT migrasi dijalankan (bukan waktu
-- asli pesanan dibuat), karena MySQL tidak menyimpan riwayat waktu insert
-- untuk baris yang sudah ada. Transaksi BARU setelah ini akan otomatis
-- tercatat dengan waktu pemesanan yang sebenarnya.

ALTER TABLE pembelian
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
