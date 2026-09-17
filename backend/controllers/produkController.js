const produkModel = require("../models/produkModel");

// =============================
// PUBLIC - SEMUA PRODUK
// =============================

async function getAllProduk(req, res) {
    try {
        const produk = await produkModel.getAllProduk();

        return res.json(produk);
    } catch (error) {
        console.error(
            "Get all produk error:",
            error
        );

        return res.status(500).json({
            message: "Gagal mengambil produk"
        });
    }
}

// =============================
// PUBLIC - DETAIL PRODUK
// =============================

async function getProdukById(req, res) {
    try {
        const produk =
            await produkModel.getProdukById(
                req.params.id
            );

        if (!produk) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        return res.json(produk);
    } catch (error) {
        console.error(
            "Get produk detail error:",
            error
        );

        return res.status(500).json({
            message: "Gagal mengambil detail produk"
        });
    }
}

// =============================
// ADMIN - TAMBAH PRODUK
// =============================

async function createProduk(req, res) {
    try {
        const {
            nama_produk,
            deskripsi,
            harga,
            kategori,
            bahan,
            ukuran,
            stok
        } = req.body;

        if (
            !nama_produk ||
            !deskripsi ||
            !harga ||
            !kategori
        ) {
            return res.status(400).json({
                message: "Data produk belum lengkap"
            });
        }

        const hargaNumber = Number(harga);

        if (
            Number.isNaN(hargaNumber) ||
            hargaNumber < 0
        ) {
            return res.status(400).json({
                message: "Harga produk tidak valid"
            });
        }

        const gambar =
            req.file?.filename ||
            "default.jpg";

        const id =
            await produkModel.createProduk({
                nama_produk,
                deskripsi,
                harga: hargaNumber,
                gambar,
                kategori,
                bahan,
                ukuran,
                stok
            });

        return res.status(201).json({
            message: "Produk berhasil ditambahkan",
            id
        });
    } catch (error) {
        console.error(
            "Create produk error:",
            error
        );

        return res.status(500).json({
            message: "Gagal menambahkan produk"
        });
    }
}

// =============================
// ADMIN - UPDATE PRODUK
// =============================

async function updateProduk(req, res) {
    try {
        const id = req.params.id;

        const produk =
            await produkModel.getProdukById(id);

        if (!produk) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        const {
            nama_produk,
            deskripsi,
            harga,
            kategori,
            bahan,
            ukuran,
            stok
        } = req.body;

        if (
            !nama_produk ||
            !deskripsi ||
            !harga ||
            !kategori
        ) {
            return res.status(400).json({
                message: "Data produk belum lengkap"
            });
        }

        const hargaNumber = Number(harga);

        if (
            Number.isNaN(hargaNumber) ||
            hargaNumber < 0
        ) {
            return res.status(400).json({
                message: "Harga produk tidak valid"
            });
        }

        const gambar =
            req.file?.filename ||
            produk.gambar ||
            "default.jpg";

        const updated =
            await produkModel.updateProduk(
                id,
                {
                    nama_produk,
                    deskripsi,
                    harga: hargaNumber,
                    gambar,
                    kategori,
                    bahan,
                    ukuran,
                    stok
                }
            );

        if (!updated) {
            return res.status(400).json({
                message:
                    "Produk gagal diperbarui"
            });
        }

        return res.json({
            message:
                "Produk berhasil diperbarui"
        });
    } catch (error) {
        console.error(
            "Update produk error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal memperbarui produk"
        });
    }
}

// =============================
// ADMIN - HAPUS PRODUK
// =============================

async function deleteProduk(req, res) {
    try {
        const id = req.params.id;

        const produk =
            await produkModel.getProdukById(id);

        if (!produk) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        const deleted =
            await produkModel.deleteProduk(id);

        if (!deleted) {
            return res.status(400).json({
                message: "Produk gagal dihapus"
            });
        }

        return res.json({
            message:
                "Produk berhasil dihapus"
        });
    } catch (error) {
        console.error(
            "Delete produk error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal menghapus produk"
        });
    }
}

module.exports = {
    getAllProduk,
    getProdukById,
    createProduk,
    updateProduk,
    deleteProduk
};