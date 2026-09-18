const db = require("../config/db");

// =============================
// PASTIKAN TABEL KATEGORI TERSEDIA
// =============================
// Dibuat otomatis di sini supaya fitur CRUD Kategori tetap jalan
// walau migrasi SQL belum sempat dijalankan manual di database.

let tableReady = false;

async function ensureTable() {
    if (tableReady) return;

    await db.query(`
        CREATE TABLE IF NOT EXISTS kategori (
            id SERIAL PRIMARY KEY,
            nama VARCHAR(100) NOT NULL UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    const [rows] = await db.query(`SELECT COUNT(*) AS jumlah FROM kategori`);

    if (rows[0].jumlah === 0) {
        await db.query(`
            INSERT INTO kategori (nama)
            VALUES
                ('Baju Rajut'),
                ('Sweater'),
                ('Tas Rajut'),
                ('Mainan Rajut'),
                ('Aksesori Rajut'),
                ('Souvenir Rajut')
            ON CONFLICT (nama) DO NOTHING
        `);
    }

    tableReady = true;
}

// =============================
// AMBIL SEMUA KATEGORI
// =============================

async function getAllKategori() {
    await ensureTable();

    const [rows] = await db.query(`
        SELECT id, nama
        FROM kategori
        ORDER BY nama ASC
    `);

    return rows;
}

// =============================
// TAMBAH KATEGORI
// =============================

async function createKategori(nama) {
    await ensureTable();

    const [result] = await db.query(`
        INSERT INTO kategori (nama)
        VALUES (?)
    `, [
        nama
    ]);

    return result.insertId;
}

// =============================
// UBAH NAMA KATEGORI
// =============================

async function updateKategori(id, nama) {
    await ensureTable();

    const [result] = await db.query(`
        UPDATE kategori
        SET nama = ?
        WHERE id = ?
    `, [
        nama,
        id
    ]);

    return result.affectedRows;
}

// =============================
// HAPUS KATEGORI
// =============================

async function deleteKategori(id) {
    await ensureTable();

    const [result] = await db.query(`
        DELETE FROM kategori
        WHERE id = ?
    `, [
        id
    ]);

    return result.affectedRows;
}

module.exports = {
    getAllKategori,
    createKategori,
    updateKategori,
    deleteKategori
};
