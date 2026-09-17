const db = require("../config/db");

// ============================================================
// GET SEMUA ARTIKEL
// ============================================================

async function getAllArtikel() {
    const [rows] = await db.query(`
        SELECT
            id,
            judul,
            ringkasan,
            isi,
            gambar
        FROM artikel
        ORDER BY id DESC
    `);

    return rows;
}


// ============================================================
// GET ARTIKEL BERDASARKAN ID
// ============================================================

async function getArtikelById(id) {
    const [rows] = await db.query(`
        SELECT
            id,
            judul,
            ringkasan,
            isi,
            gambar
        FROM artikel
        WHERE id = ?
        LIMIT 1
    `, [id]);

    return rows[0] || null;
}


// ============================================================
// TAMBAH ARTIKEL
// ============================================================

async function createArtikel({
    judul,
    ringkasan,
    isi,
    gambar
}) {
    const [result] = await db.query(`
        INSERT INTO artikel
        (
            judul,
            ringkasan,
            isi,
            gambar
        )
        VALUES (?, ?, ?, ?)
    `, [
        judul,
        ringkasan,
        isi,
        gambar
    ]);

    return result.insertId;
}


// ============================================================
// UPDATE ARTIKEL
// ============================================================

async function updateArtikel(
    id,
    {
        judul,
        ringkasan,
        isi,
        gambar
    }
) {
    const [result] = await db.query(`
        UPDATE artikel
        SET
            judul = ?,
            ringkasan = ?,
            isi = ?,
            gambar = ?
        WHERE id = ?
    `, [
        judul,
        ringkasan,
        isi,
        gambar,
        id
    ]);

    return result.affectedRows;
}


// ============================================================
// HAPUS ARTIKEL
// ============================================================

async function deleteArtikel(id) {
    const [result] = await db.query(`
        DELETE FROM artikel
        WHERE id = ?
    `, [id]);

    return result.affectedRows;
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    getAllArtikel,
    getArtikelById,
    createArtikel,
    updateArtikel,
    deleteArtikel
};