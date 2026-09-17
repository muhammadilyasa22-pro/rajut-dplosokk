const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const usersModel = require("../models/usersModel");

// =============================
// REGISTER
// =============================

async function register(req, res) {
    try {
        const {
            nama_d,
            nama_b,
            kelamin,
            lahir,
            alamat,
            phone,
            email,
            uname,
            passwd
        } = req.body;

        // -----------------------------
        // VALIDASI
        // -----------------------------

        if (
            !nama_d ||
            !nama_b ||
            !email ||
            !uname ||
            !passwd
        ) {
            return res.status(400).json({
                message:
                    "Data wajib belum lengkap"
            });
        }

        if (passwd.length < 6) {
            return res.status(400).json({
                message:
                    "Password minimal 6 karakter"
            });
        }

        // -----------------------------
        // CEK USERNAME
        // -----------------------------

        const usernameExists =
            await usersModel.findByUsername(
                uname
            );

        if (usernameExists) {
            return res.status(409).json({
                message:
                    "Username sudah digunakan"
            });
        }

        // -----------------------------
        // CEK EMAIL
        // -----------------------------

        const emailExists =
            await usersModel.findByEmail(
                email
            );

        if (emailExists) {
            return res.status(409).json({
                message:
                    "Email sudah digunakan"
            });
        }

        // -----------------------------
        // HASH PASSWORD
        // -----------------------------

        const hashedPassword =
            await bcrypt.hash(
                passwd,
                10
            );

        // -----------------------------
        // BUAT USER
        // -----------------------------

        const id =
            await usersModel.createUser({
                nama_d,
                nama_b,
                kelamin:
                    kelamin || null,
                lahir:
                    lahir || null,
                alamat:
                    alamat || null,
                phone:
                    phone || null,
                email,
                role: "pembeli",
                uname,
                passwd:
                    hashedPassword,
                foto: "default.jpg"
            });

        return res.status(201).json({
            message:
                "Registrasi berhasil",
            id
        });
    } catch (error) {
        console.error(
            "Register error:",
            error
        );

        return res.status(500).json({
            message:
                "Terjadi kesalahan server"
        });
    }
}

// =============================
// LOGIN
// =============================

async function login(req, res) {
    try {
        const {
            uname,
            email,
            credential,
            passwd
        } = req.body;

        const loginCredential =
            credential ||
            uname ||
            email;

        // -----------------------------
        // VALIDASI
        // -----------------------------

        if (
            !loginCredential ||
            !passwd
        ) {
            return res.status(400).json({
                message:
                    "Username/email dan password wajib diisi"
            });
        }

        // -----------------------------
        // CARI USER
        // -----------------------------

        let user =
            await usersModel.findByUsername(
                loginCredential
            );

        if (!user) {
            user =
                await usersModel.findByEmail(
                    loginCredential
                );
        }

        if (!user) {
            return res.status(401).json({
                message:
                    "Username/email atau password salah"
            });
        }

        // -----------------------------
        // CEK PASSWORD
        // -----------------------------

        const passwordValid =
            await bcrypt.compare(
                passwd,
                user.passwd
            );

        if (!passwordValid) {
            return res.status(401).json({
                message:
                    "Username/email atau password salah"
            });
        }

        // -----------------------------
        // JWT
        // -----------------------------

        if (!process.env.JWT_SECRET) {
            console.error(
                "JWT_SECRET belum tersedia"
            );

            return res.status(500).json({
                message:
                    "Konfigurasi JWT belum tersedia"
            });
        }

        const token =
            jwt.sign(
                {
                    id: user.id,
                    role: user.role,
                    uname: user.uname
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

        // -----------------------------
        // HILANGKAN PASSWORD
        // -----------------------------

        const userData = {
            id: user.id,
            nama_d: user.nama_d,
            nama_b: user.nama_b,
            kelamin: user.kelamin,
            lahir: user.lahir,
            alamat: user.alamat,
            phone: user.phone,
            email: user.email,
            role: user.role,
            uname: user.uname,
            foto: user.foto
        };

        return res.json({
            message:
                "Login berhasil",
            token,
            user: userData
        });
    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({
            message:
                "Terjadi kesalahan server"
        });
    }
}


// =============================
// PROFIL SAYA
// =============================

async function getMyProfile(req, res) {
    try {
        const user = await usersModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        return res.json({ user });
    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({ message: "Gagal mengambil profil" });
    }
}

async function updateMyProfile(req, res) {
    try {
        const id = req.user.id;
        const current = await usersModel.findById(id);

        if (!current) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const {
            nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname,
            passwd_lama, passwd_baru
        } = req.body;

        if (!nama_d || !nama_b || !email || !uname) {
            return res.status(400).json({ message: "Nama, email, dan username wajib diisi" });
        }

        const emailExists = await usersModel.findByEmail(String(email).trim());
        if (emailExists && Number(emailExists.id) !== Number(id)) {
            return res.status(409).json({ message: "Email sudah digunakan" });
        }

        const usernameExists = await usersModel.findByUsername(String(uname).trim());
        if (usernameExists && Number(usernameExists.id) !== Number(id)) {
            return res.status(409).json({ message: "Username sudah digunakan" });
        }

        if (passwd_baru) {
            if (!passwd_lama) {
                return res.status(400).json({ message: "Password lama wajib diisi" });
            }

            const oldUser = await usersModel.findByUsername(current.uname);
            const valid = await bcrypt.compare(passwd_lama, oldUser.passwd);
            if (!valid) {
                return res.status(400).json({ message: "Password lama salah" });
            }

            if (String(passwd_baru).length < 6) {
                return res.status(400).json({ message: "Password baru minimal 6 karakter" });
            }

            const hash = await bcrypt.hash(passwd_baru, 10);
            await usersModel.updatePassword(id, hash);
        }

        const foto = req.file?.filename || current.foto || "default.jpg";

        await usersModel.updateUser(id, {
            nama_d: String(nama_d).trim(),
            nama_b: String(nama_b).trim(),
            kelamin: kelamin || null,
            lahir: lahir || null,
            alamat: alamat || null,
            phone: phone || null,
            email: String(email).trim(),
            uname: String(uname).trim(),
            foto
        });

        const user = await usersModel.findById(id);
        return res.json({ message: "Profil berhasil diperbarui", user });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ message: "Gagal memperbarui profil", error: error.message });
    }
}

module.exports = {
    register,
    login,
    getMyProfile,
    updateMyProfile
};