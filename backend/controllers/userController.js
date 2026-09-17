const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const usersModel = require("../models/usersModel");
const produkModel = require("../models/produkModel");
const artikelModel = require("../models/artikelModel");
const pembelianModel = require("../models/pembelianModel");

// =============================
// REGISTER
// =============================
async function registerUser(req, res) {
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

        if (!nama_d || !nama_b || !email || !uname || !passwd) {
            return res.status(400).json({
                message: "Data wajib belum lengkap"
            });
        }

        const userLama = await usersModel.findUserByCredential(uname);

        if (userLama) {
            return res.status(409).json({
                message: "Username atau email sudah digunakan"
            });
        }

        const emailLama = await usersModel.findUserByEmail(email);

        if (emailLama) {
            return res.status(409).json({
                message: "Email sudah digunakan"
            });
        }

        const hashedPassword = await bcrypt.hash(passwd, 10);

        const id = await usersModel.createUser({
            nama_d,
            nama_b,
            kelamin,
            lahir,
            alamat,
            phone,
            email,
            role: "pembeli",
            uname,
            passwd: hashedPassword,
            foto: "default.jpg"
        });

        return res.status(201).json({
            message: "Registrasi berhasil",
            id
        });
    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            message: "Terjadi kesalahan server"
        });
    }
}

// =============================
// LOGIN
// =============================
async function loginUser(req, res) {
    try {
        const { credential, passwd } = req.body;

        if (!credential || !passwd) {
            return res.status(400).json({
                message: "Credential dan password wajib diisi"
            });
        }

        const user = await usersModel.findUserByCredential(credential);

        if (!user) {
            return res.status(401).json({
                message: "Credential atau password salah"
            });
        }

        const passwordValid = await bcrypt.compare(
            passwd,
            user.passwd
        );

        if (!passwordValid) {
            return res.status(401).json({
                message: "Credential atau password salah"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        const userData = await usersModel.findUserById(user.id);

        return res.json({
            message: "Login berhasil",
            token,
            user: userData
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Terjadi kesalahan server"
        });
    }
}

// =============================
// PROFILE
// =============================
async function getMyProfile(req, res) {
    try {
        const id = req.user.id;

        const user = await usersModel.findUserById(id);

        if (!user) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        return res.json({
            user
        });
    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            message: "Terjadi kesalahan server"
        });
    }
}

// =============================
// UPDATE PROFILE
// =============================
async function updateMyProfile(req, res) {
    try {
        const id = req.user.id;

        const {
            nama_d,
            nama_b,
            kelamin,
            lahir,
            alamat,
            phone,
            email,
            uname,
            passwd_lama,
            passwd_baru,
            foto
        } = req.body;

        if (!nama_d || !nama_b || !email || !uname) {
            return res.status(400).json({
                message: "Data profil belum lengkap"
            });
        }

        const userEmail = await usersModel.findUserByEmail(email);

        if (userEmail && userEmail.id !== id) {
            return res.status(409).json({
                message: "Email sudah digunakan"
            });
        }

        const userCredential =
            await usersModel.findUserByCredential(uname);

        if (userCredential && userCredential.id !== id) {
            return res.status(409).json({
                message: "Username sudah digunakan"
            });
        }

        const updated = await usersModel.updateUserProfile(id, {
            nama_d,
            nama_b,
            kelamin,
            lahir,
            alamat,
            phone,
            email,
            uname,
            foto: foto || "default.jpg"
        });

        if (!updated) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        // Ganti password jika diminta
        if (passwd_baru) {
            if (!passwd_lama) {
                return res.status(400).json({
                    message: "Password lama wajib diisi"
                });
            }

            const oldHash =
                await usersModel.findPasswdHashById(id);

            const passwordValid = await bcrypt.compare(
                passwd_lama,
                oldHash
            );

            if (!passwordValid) {
                return res.status(400).json({
                    message: "Password lama salah"
                });
            }

            const newHash =
                await bcrypt.hash(passwd_baru, 10);

            await usersModel.updatePassword(
                id,
                newHash
            );
        }

        const user = await usersModel.findUserById(id);

        return res.json({
            message: "Profil berhasil diperbarui",
            user
        });
    } catch (error) {
        console.error("Update profile error:", error);

        return res.status(500).json({
            message: "Terjadi kesalahan server"
        });
    }
}

// =============================
// PRODUK PUBLIK
// =============================
async function listProduk(req, res) {
    try {
        const data = await produkModel.getAllProduk();

        return res.json(data);
    } catch (error) {
        console.error("List produk error:", error);

        return res.status(500).json({
            message: "Gagal mengambil produk"
        });
    }
}

async function getProdukById(req, res) {
    try {
        const data = await produkModel.getProdukById(
            req.params.id_produk || req.params.id
        );

        if (!data) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        return res.json(data);
    } catch (error) {
        console.error("Get produk error:", error);

        return res.status(500).json({
            message: "Gagal mengambil produk"
        });
    }
}

// =============================
// ARTIKEL PUBLIK
// =============================
async function listArtikelPublik(req, res) {
    try {
        const data = await artikelModel.findAllArtikel();

        return res.json(data);
    } catch (error) {
        console.error("List artikel error:", error);

        return res.status(500).json({
            message: "Gagal mengambil artikel"
        });
    }
}

async function getArtikelPublikById(req, res) {
    try {
        const data = await artikelModel.findArtikelById(
            req.params.id
        );

        if (!data) {
            return res.status(404).json({
                message: "Artikel tidak ditemukan"
            });
        }

        return res.json(data);
    } catch (error) {
        console.error("Get artikel error:", error);

        return res.status(500).json({
            message: "Gagal mengambil artikel"
        });
    }
}

// =============================
// DASHBOARD PEMBELI
// =============================
async function getDashboard(req, res) {
    try {
        const id_pembeli = req.user.id;

        const user = await usersModel.findUserById(
            id_pembeli
        );

        const stats =
            await pembelianModel.getStatsByPembeliId(
                id_pembeli
            );

        const pembelian =
            await pembelianModel.findPembelianByPembeliIdWithDetail(
                id_pembeli
            );

        return res.json({
            user,
            stats,
            pembelian
        });
    } catch (error) {
        console.error("Dashboard error:", error);

        return res.status(500).json({
            message: "Gagal mengambil dashboard"
        });
    }
}

// =============================
// BUAT PEMBELIAN
// =============================
async function createPembelian(req, res) {
    try {
        const id_pembeli = req.user.id;

        const {
            id_produk,
            nama_pembeli,
            alamat_pembeli,
            phone_pembeli,
            metode_pembayaran,
            pembayaran,
            pengiriman,
            catatan,
            foto_bukti
        } = req.body;

        if (
            !id_produk ||
            !nama_pembeli ||
            !alamat_pembeli ||
            !phone_pembeli ||
            !metode_pembayaran ||
            !pengiriman
        ) {
            return res.status(400).json({
                message: "Data pembelian belum lengkap"
            });
        }

        const metodeValid = [
            "Bank Transfer",
            "COD"
        ];

        const kurirValid = [
            "JNT Express",
            "JNE"
        ];

        if (!metodeValid.includes(metode_pembayaran)) {
            return res.status(400).json({
                message: "Metode pembayaran tidak valid"
            });
        }

        if (!kurirValid.includes(pengiriman)) {
            return res.status(400).json({
                message: "Kurir tidak valid"
            });
        }

        const produk =
            await produkModel.getProdukById(id_produk);

        if (!produk) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        const id = await pembelianModel.insertPembelian({
            id_pembeli,
            id_produk,
            nama_pembeli,
            alamat_pembeli,
            phone_pembeli,
            metode_pembayaran,
            pembayaran: pembayaran || "Belum Bayar",
            pengiriman,
            status: "Diproses",
            catatan: catatan || null,
            foto_bukti: foto_bukti || null
        });

        return res.status(201).json({
            message: "Pembelian berhasil dibuat",
            id
        });
    } catch (error) {
        console.error("Create pembelian error:", error);

        return res.status(500).json({
            message: "Gagal membuat pembelian"
        });
    }
}

// =============================
// LIST PEMBELIAN SAYA
// =============================
async function listMyPembelian(req, res) {
    try {
        const id_pembeli = req.user.id;

        const data =
            await pembelianModel.findPembelianByPembeliIdWithDetail(
                id_pembeli
            );

        return res.json(data);
    } catch (error) {
        console.error("List pembelian error:", error);

        return res.status(500).json({
            message: "Gagal mengambil pembelian"
        });
    }
}

// =============================
// DETAIL PEMBELIAN SAYA
// =============================
async function getMyPembelianById(req, res) {
    try {
        const id_pembeli = req.user.id;
        const id = req.params.id;

        const data =
            await pembelianModel.findPembelianByIdAndPembeliId(
                id,
                id_pembeli
            );

        if (!data) {
            return res.status(404).json({
                message: "Pembelian tidak ditemukan"
            });
        }

        return res.json(data);
    } catch (error) {
        console.error("Get pembelian error:", error);

        return res.status(500).json({
            message: "Gagal mengambil detail pembelian"
        });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getMyProfile,
    updateMyProfile,
    listProduk,
    getProdukById,
    listArtikelPublik,
    getArtikelPublikById,
    getDashboard,
    createPembelian,
    listMyPembelian,
    getMyPembelianById
};