-- Jalankan sekali jika database belum memiliki kolom bank_pembayaran.
ALTER TABLE pembelian
ADD COLUMN bank_pembayaran VARCHAR(100) NULL;
