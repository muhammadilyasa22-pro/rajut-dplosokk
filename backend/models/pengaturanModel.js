const db = require("../config/db");

// =============================
// PASTIKAN TABEL PENGATURAN TERSEDIA
// =============================
// Dibuat otomatis di sini supaya fitur foto QRIS tetap jalan
// walau migrasi SQL belum sempat dijalankan manual di database.

let tableReady = false;

async function ensureTable() {
    if (tableReady) return;

    await db.query(`
        CREATE TABLE IF NOT EXISTS pengaturan_toko (
            id INTEGER PRIMARY KEY,
            qris_image VARCHAR(255) NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    tableReady = true;
}

// =============================
// AMBIL PENGATURAN TOKO
// =============================

async function getPengaturan() {
    await ensureTable();

    const [rows] = await db.query(`
        SELECT *
        FROM pengaturan_toko
        WHERE id = 1
        LIMIT 1
    `);

    if (rows[0]) {
        return rows[0];
    }

    await db.query(`
        INSERT INTO pengaturan_toko (id, qris_image)
        VALUES (1, 'qris-default.png')
    `);

    return {
        id: 1,
        qris_image: "qris-default.png"
    };
}

// =============================
// UPDATE FOTO QRIS
// =============================

async function updateQris(filename) {
    await ensureTable();

    // Pastikan baris pengaturan sudah ada sebelum diupdate.
    await getPengaturan();

    await db.query(`
        UPDATE pengaturan_toko
        SET qris_image = ?
        WHERE id = 1
    `, [
        filename
    ]);

    return getPengaturan();
}

module.exports = {
    getPengaturan,
    updateQris
};
