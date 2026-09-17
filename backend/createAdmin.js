require("dotenv").config();

const bcrypt = require("bcrypt");
const db = require("./config/db");

async function createAdmin() {
    try {
        const password = "admin123";
        const hashedPassword = await bcrypt.hash(password, 10);
        const [cek] = await db.query("SELECT id FROM users WHERE uname = ? OR email = ?",["admin", "admin@gmail.com"]);
        if (cek.length > 0) {console.log("Admin sudah ada.");process.exit();}
        const [result] = await db.query(
            `INSERT INTO users
            (
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                "Admin",
                "Toko Pengrajut",
                "Laki-laki",
                "2000-01-01",
                "Alamat Toko Pengrajut",
                81234567890,
                "admin@gmail.com",
                "admin",
                "admin",
                hashedPassword,
                "default.jpg"
            ]
        );

        console.log("================================");
        console.log("ADMIN BERHASIL DIBUAT");
        console.log("================================");
        console.log("ID       :", result.insertId);
        console.log("Username :", "admin");
        console.log("Password :", "admin123");
        console.log("Role     :", "admin");
        console.log("Email    :", "admin@gmail.com");
        console.log("================================");
        process.exit();

    } catch (error) {
        console.error("Gagal membuat admin:", error);
        process.exit(1);
    }
}

createAdmin();