const kategoriModel = require("../models/kategoriModel");

// =============================
// PUBLIC
// AMBIL SEMUA KATEGORI
// =============================

async function getKategori(req, res) {
    try {
        const data = await kategoriModel.getAllKategori();

        return res.json(data);
    } catch (error) {
        console.error("Get kategori error:", error);

        return res.status(500).json({
            message: "Gagal mengambil daftar kategori"
        });
    }
}

// =============================
// ADMIN
// TAMBAH KATEGORI
// =============================

async function tambahKategori(req, res) {
    try {
        const nama = (req.body.nama || "").trim();

        if (!nama) {
            return res.status(400).json({
                message: "Nama kategori wajib diisi"
            });
        }

        const id = await kategoriModel.createKategori(nama);

        return res.status(201).json({
            message: "Kategori berhasil ditambahkan",
            id,
            nama
        });
    } catch (error) {
        if (error && error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Kategori dengan nama itu sudah ada"
            });
        }

        console.error("Tambah kategori error:", error);

        return res.status(500).json({
            message: "Gagal menambahkan kategori"
        });
    }
}

// =============================
// ADMIN
// UBAH KATEGORI
// =============================

async function ubahKategori(req, res) {
    try {
        const { id } = req.params;
        const nama = (req.body.nama || "").trim();

        if (!nama) {
            return res.status(400).json({
                message: "Nama kategori wajib diisi"
            });
        }

        const affected = await kategoriModel.updateKategori(id, nama);

        if (!affected) {
            return res.status(404).json({
                message: "Kategori tidak ditemukan"
            });
        }

        return res.json({
            message: "Kategori berhasil diubah"
        });
    } catch (error) {
        if (error && error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Kategori dengan nama itu sudah ada"
            });
        }

        console.error("Ubah kategori error:", error);

        return res.status(500).json({
            message: "Gagal mengubah kategori"
        });
    }
}

// =============================
// ADMIN
// HAPUS KATEGORI
// =============================

async function hapusKategori(req, res) {
    try {
        const { id } = req.params;

        const affected = await kategoriModel.deleteKategori(id);

        if (!affected) {
            return res.status(404).json({
                message: "Kategori tidak ditemukan"
            });
        }

        return res.json({
            message: "Kategori berhasil dihapus"
        });
    } catch (error) {
        console.error("Hapus kategori error:", error);

        return res.status(500).json({
            message: "Gagal menghapus kategori"
        });
    }
}

module.exports = {
    getKategori,
    tambahKategori,
    ubahKategori,
    hapusKategori
};
