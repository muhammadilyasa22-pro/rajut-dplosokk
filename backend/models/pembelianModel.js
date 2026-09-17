const db = require("../config/db");

// =============================
// PASTIKAN KOLOM WAKTU PEMESANAN TERSEDIA
// =============================
// Ditambahkan otomatis di sini supaya Laporan Penjualan bisa menampilkan
// tanggal & jam pemesanan meski tabel pembelian yang lama belum punya
// kolom waktu. Catatan: baris pesanan LAMA (sebelum kolom ini ada) akan
// tercatat dengan waktu saat kolom ini pertama kali dibuat, bukan waktu
// asli pesanan itu dibuat, karena waktu aslinya memang belum pernah dicatat.

let columnsReady = false;

async function ensureColumns() {
    if (columnsReady) return;

    try {
        await db.query(`
            ALTER TABLE pembelian
            ADD COLUMN dibuat_pada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);
    } catch (error) {
        if (error.code !== "ER_DUP_FIELDNAME") {
            throw error;
        }
    }

    columnsReady = true;
}

// =============================
// AMBIL SEMUA PEMBELIAN
// =============================

async function getAllPembelian() {
    await ensureColumns();

    const [rows] = await db.query(`
        SELECT
            pembelian.*,
            users.uname,
            users.email,
            produk.nama_produk,
            produk.harga,
            produk.gambar
        FROM pembelian

        JOIN users
            ON pembelian.id_pembeli = users.id

        JOIN produk
            ON pembelian.id_produk = produk.id_produk

        ORDER BY pembelian.dibuat_pada DESC, pembelian.id DESC
    `);

    return rows;
}

// =============================
// AMBIL PEMBELIAN BERDASARKAN ID
// =============================

async function getPembelianById(id) {
    const [rows] = await db.query(`
        SELECT
            pembelian.*,
            users.uname,
            users.email,
            produk.nama_produk,
            produk.harga,
            produk.gambar
        FROM pembelian

        JOIN users
            ON pembelian.id_pembeli = users.id

        JOIN produk
            ON pembelian.id_produk = produk.id_produk

        WHERE pembelian.id = ?

        LIMIT 1
    `, [
        id
    ]);

    return rows[0];
}

// =============================
// PEMBELIAN MILIK PEMBELI
// =============================

async function getPembelianSaya(id_pembeli) {
    const [rows] = await db.query(`
        SELECT
            pembelian.*,
            produk.nama_produk,
            produk.harga,
            produk.gambar
        FROM pembelian

        JOIN produk
            ON pembelian.id_produk = produk.id_produk

        WHERE pembelian.id_pembeli = ?

        ORDER BY pembelian.id DESC
    `, [
        id_pembeli
    ]);

    return rows;
}

// =============================
// TAMBAH PEMBELIAN
// =============================

async function createPembelian(data) {
    await ensureColumns();

    const [result] = await db.query(`
        INSERT INTO pembelian (
            id_pembeli,
            id_produk,
            nama_pembeli,
            alamat_pembeli,
            phone_pembeli,
            metode_pembayaran,
            pembayaran,
            pengiriman,
            status,
            catatan,
            foto_bukti
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        data.id_pembeli,
        data.id_produk,
        data.nama_pembeli,
        data.alamat_pembeli,
        data.phone_pembeli,
        data.metode_pembayaran,
        data.pembayaran,
        data.pengiriman,
        data.status,
        data.catatan,
        data.foto_bukti
    ]);

    return result.insertId;
}

// =============================
// UPDATE STATUS PEMBELIAN
// =============================

async function updateStatus(
    id,
    status,
    pembayaran
) {
    const [result] = await db.query(`
        UPDATE pembelian
        SET status = ?, pembayaran = ?
        WHERE id = ?
    `, [status, pembayaran, id]);

    return result.affectedRows;
}

// Update pembayaran saja. Status pesanan tidak disentuh.
async function updatePembayaran(id, pembayaran) {
    const [result] = await db.query(`
        UPDATE pembelian
        SET pembayaran = ?
        WHERE id = ?
    `, [pembayaran, id]);

    return result.affectedRows;
}

// =============================
// UPDATE FOTO BUKTI PEMBAYARAN
// =============================

async function updateBukti(id, foto_bukti, pembayaran) {
    const [result] = await db.query(`
        UPDATE pembelian
        SET foto_bukti = ?, pembayaran = ?
        WHERE id = ?
    `, [foto_bukti, pembayaran, id]);

    return result.affectedRows;
}

// =============================
// HAPUS PEMBELIAN
// =============================

async function deletePembelian(id) {
    const [result] = await db.query(`
        DELETE FROM pembelian
        WHERE id = ?
    `, [
        id
    ]);

    return result.affectedRows;
}

module.exports = {
    getAllPembelian,
    getPembelianById,
    getPembelianSaya,
    createPembelian,
    updateStatus,
    updatePembayaran,
    updateBukti,
    deletePembelian
};