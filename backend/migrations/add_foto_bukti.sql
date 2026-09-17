-- Jalankan sekali pada database Toko Pengrajut D-PLOSOKK.
-- Tambahan ini hanya memastikan kolom bukti pembayaran tersedia.
ALTER TABLE pembelian
ADD COLUMN IF NOT EXISTS foto_bukti VARCHAR(255) NULL;
