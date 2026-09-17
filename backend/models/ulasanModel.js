const db = require("../config/db");

// =============================
// PASTIKAN TABEL ULASAN TERSEDIA
// =============================

let tableReady = false;

async function ensureTable() {
    if (tableReady) return;

    await db.query(`
        CREATE TABLE IF NOT EXISTS ulasan (
            id INT PRIMARY KEY AUTO_INCREMENT,
            id_produk INT NOT NULL,
            id_pembeli INT NOT NULL,
            rating TINYINT NOT NULL,
            komentar TEXT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_ulasan (id_produk, id_pembeli)
        )
    `);

    tableReady = true;
}

// =============================
// APAKAH PEMBELI SUDAH PERNAH BELI PRODUK INI
// =============================

async function sudahBeliProduk(id_produk, id_pembeli) {
    const [rows] = await db.query(`
        SELECT id
        FROM pembelian
        WHERE id_produk = ? AND id_pembeli = ?
        LIMIT 1
    `, [
        id_produk,
        id_pembeli
    ]);

    return rows.length > 0;
}

// =============================
// APAKAH PEMBELI SUDAH PERNAH MENGULAS PRODUK INI
// =============================

async function sudahUlasProduk(id_produk, id_pembeli) {
    await ensureTable();

    const [rows] = await db.query(`
        SELECT id
        FROM ulasan
        WHERE id_produk = ? AND id_pembeli = ?
        LIMIT 1
    `, [
        id_produk,
        id_pembeli
    ]);

    return rows.length > 0;
}

// =============================
// TAMBAH ULASAN
// =============================

async function createUlasan(data) {
    await ensureTable();

    const [result] = await db.query(`
        INSERT INTO ulasan
        (id_produk, id_pembeli, rating, komentar)
        VALUES (?, ?, ?, ?)
    `, [
        data.id_produk,
        data.id_pembeli,
        data.rating,
        data.komentar || null
    ]);

    return result.insertId;
}

// =============================
// DAFTAR ULASAN UNTUK SATU PRODUK
// =============================

async function getUlasanByProduk(id_produk) {
    await ensureTable();

    const [rows] = await db.query(`
        SELECT
            ulasan.id,
            ulasan.rating,
            ulasan.komentar,
            ulasan.created_at,
            users.nama_d,
            users.nama_b
        FROM ulasan
        JOIN users ON ulasan.id_pembeli = users.id
        WHERE ulasan.id_produk = ?
        ORDER BY ulasan.created_at DESC
    `, [
        id_produk
    ]);

    return rows;
}

// =============================
// RINGKASAN RATING (RATA-RATA, JUMLAH, DISTRIBUSI BINTANG)
// =============================

async function getRingkasanRating(id_produk) {
    await ensureTable();

    const [rows] = await db.query(`
        SELECT rating, COUNT(*) AS jumlah
        FROM ulasan
        WHERE id_produk = ?
        GROUP BY rating
    `, [
        id_produk
    ]);

    const distribusi = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalJumlah = 0;
    let totalNilai = 0;

    for (const row of rows) {
        distribusi[row.rating] = row.jumlah;
        totalJumlah += row.jumlah;
        totalNilai += row.rating * row.jumlah;
    }

    return {
        rata_rata: totalJumlah > 0 ? Number((totalNilai / totalJumlah).toFixed(1)) : 0,
        jumlah_ulasan: totalJumlah,
        distribusi
    };
}

// =============================
// JUMLAH TERJUAL (BERDASARKAN PESANAN LUNAS)
// =============================

async function getJumlahTerjual(id_produk) {
    const [rows] = await db.query(`
        SELECT COUNT(*) AS jumlah
        FROM pembelian
        WHERE id_produk = ? AND pembayaran = 'Sudah Bayar'
    `, [
        id_produk
    ]);

    return rows[0]?.jumlah || 0;
}

module.exports = {
    sudahBeliProduk,
    sudahUlasProduk,
    createUlasan,
    getUlasanByProduk,
    getRingkasanRating,
    getJumlahTerjual
};
