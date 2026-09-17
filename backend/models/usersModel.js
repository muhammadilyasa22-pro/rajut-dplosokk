const db = require("../config/db");

// =============================
// CARI USER BERDASARKAN USERNAME
// =============================

async function findByUsername(uname) {
    const [rows] = await db.query(
        `
        SELECT *
        FROM users
        WHERE uname = ?
        LIMIT 1
        `,
        [uname]
    );

    return rows[0];
}

// =============================
// CARI USER BERDASARKAN EMAIL
// =============================

async function findByEmail(email) {
    const [rows] = await db.query(
        `
        SELECT *
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );

    return rows[0];
}

// =============================
// CARI USER BERDASARKAN ID
// =============================

async function findById(id) {
    const [rows] = await db.query(
        `
        SELECT
            id,
            nama_d,
            nama_b,
            kelamin,
            lahir,
            alamat,
            phone,
            email,
            role,
            uname,
            foto
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0];
}

// =============================
// TAMBAH USER
// =============================

async function createUser(user) {
    const [result] = await db.query(
        `
        INSERT INTO users (
            nama_d,
            nama_b,
            kelamin,
            lahir,
            alamat,
            phone,
            email,
            role,
            uname,
            passwd,
            foto
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            user.nama_d,
            user.nama_b,
            user.kelamin,
            user.lahir,
            user.alamat,
            user.phone,
            user.email,
            user.role,
            user.uname,
            user.passwd,
            user.foto
        ]
    );

    return result.insertId;
}

// =============================
// UPDATE DATA USER
// =============================

async function updateUser(id, user) {
    const [result] = await db.query(
        `
        UPDATE users
        SET
            nama_d = ?,
            nama_b = ?,
            kelamin = ?,
            lahir = ?,
            alamat = ?,
            phone = ?,
            email = ?,
            uname = ?,
            foto = ?
        WHERE id = ?
        `,
        [
            user.nama_d,
            user.nama_b,
            user.kelamin,
            user.lahir,
            user.alamat,
            user.phone,
            user.email,
            user.uname,
            user.foto,
            id
        ]
    );

    return result.affectedRows;
}

// =============================
// UPDATE PASSWORD
// =============================

async function updatePassword(id, passwd) {
    const [result] = await db.query(
        `
        UPDATE users
        SET passwd = ?
        WHERE id = ?
        `,
        [
            passwd,
            id
        ]
    );

    return result.affectedRows;
}

// =============================
// HAPUS USER
// =============================

async function deleteUser(id) {
    const [result] = await db.query(
        `
        DELETE FROM users
        WHERE id = ?
        `,
        [id]
    );

    return result.affectedRows;
}

module.exports = {
    findByUsername,
    findByEmail,
    findById,
    createUser,
    updateUser,
    updatePassword,
    deleteUser
};