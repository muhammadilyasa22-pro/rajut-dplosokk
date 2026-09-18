const db = require("../config/db");

// =============================
// PASTIKAN KOLOM SPESIFIKASI TERSEDIA
// =============================
// Ditambahkan otomatis di sini (bahan, ukuran, stok) supaya fitur
// Spesifikasi Produk tetap jalan walau migrasi SQL belum dijalankan manual.

let columnsReady = false;
let ulasanTableChecked = false;

async function ensureColumns() {
    if (columnsReady) return;

    const kolomTambahan = [
        "ALTER TABLE produk ADD COLUMN IF NOT EXISTS bahan VARCHAR(150) NULL",
        "ALTER TABLE produk ADD COLUMN IF NOT EXISTS ukuran VARCHAR(150) NULL",
        "ALTER TABLE produk ADD COLUMN IF NOT EXISTS stok INTEGER NULL"
    ];

    for (const sql of kolomTambahan) {
        try {
            await db.query(sql);
        } catch (error) {
            if (error.code !== "42701" && !/already exists/i.test(error.message)) {
                throw error;
            }
        }
    }

    columnsReady = true;
}

// getAllProduk mengambil rata-rata rating dari tabel ulasan lewat JOIN,
// jadi pastikan tabel itu ada dulu supaya daftar produk tidak ikut error
// kalau migrasi ulasan belum sempat dijalankan.
async function ensureUlasanTable() {
    if (ulasanTableChecked) return;

    await db.query(`
        CREATE TABLE IF NOT EXISTS ulasan (
            id SERIAL PRIMARY KEY,
            id_produk INTEGER NOT NULL,
            id_pembeli INTEGER NOT NULL,
            rating SMALLINT NOT NULL,
            komentar TEXT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            CONSTRAINT unique_ulasan UNIQUE (id_produk, id_pembeli)
        )
    `);

    ulasanTableChecked = true;
}

// Ambil semua produk
async function getAllProduk() {
    await ensureColumns();
    await ensureUlasanTable();

    const [rows] = await db.query(`
        SELECT
            produk.*,
            COALESCE(r.rata_rata, 0) AS rata_rata,
            COALESCE(r.jumlah_ulasan, 0) AS jumlah_ulasan,
            COALESCE(t.jumlah_terjual, 0) AS jumlah_terjual
        FROM produk
        LEFT JOIN (
            SELECT id_produk, AVG(rating) AS rata_rata, COUNT(*) AS jumlah_ulasan
            FROM ulasan
            GROUP BY id_produk
        ) r ON r.id_produk = produk.id_produk
        LEFT JOIN (
            SELECT id_produk, COUNT(*) AS jumlah_terjual
            FROM pembelian
            WHERE pembayaran = 'Sudah Bayar'
            GROUP BY id_produk
        ) t ON t.id_produk = produk.id_produk
        ORDER BY produk.id_produk DESC
    `);

    return rows;
}

// Ambil produk berdasarkan ID
async function getProdukById(id) {
    await ensureColumns();

    const [rows] = await db.query(
        "SELECT * FROM produk WHERE id_produk = ?",
        [id]
    );

    return rows[0];
}

// Tambah produk
async function createProduk(data) {
    await ensureColumns();

    const [result] = await db.query(
        `INSERT INTO produk
        (nama_produk, deskripsi, harga, gambar, kategori, bahan, ukuran, stok)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.nama_produk,
            data.deskripsi,
            data.harga,
            data.gambar,
            data.kategori,
            data.bahan || null,
            data.ukuran || null,
            data.stok === "" || data.stok === undefined || data.stok === null
                ? null
                : Number(data.stok)
        ]
    );

    return result.insertId;
}

// Edit produk
async function updateProduk(id, data) {
    await ensureColumns();

    const [result] = await db.query(
        `UPDATE produk
        SET nama_produk = ?,
            deskripsi = ?,
            harga = ?,
            gambar = ?,
            kategori = ?,
            bahan = ?,
            ukuran = ?,
            stok = ?
        WHERE id_produk = ?`,
        [
            data.nama_produk,
            data.deskripsi,
            data.harga,
            data.gambar,
            data.kategori,
            data.bahan || null,
            data.ukuran || null,
            data.stok === "" || data.stok === undefined || data.stok === null
                ? null
                : Number(data.stok),
            id
        ]
    );

    return result.affectedRows;
}

// Hapus produk
async function deleteProduk(id) {
    const [result] = await db.query(
        "DELETE FROM produk WHERE id_produk = ?",
        [id]
    );

    return result.affectedRows;
}

module.exports = {
    getAllProduk,
    getProdukById,
    createProduk,
    updateProduk,
    deleteProduk
};
