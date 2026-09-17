const pengaturanModel = require("../models/pengaturanModel");

// =============================
// PUBLIC
// AMBIL FOTO QRIS
// =============================

async function getQris(req, res) {
    try {
        const data = await pengaturanModel.getPengaturan();

        return res.json({
            qris_image: data.qris_image || null
        });
    } catch (error) {
        console.error("Get QRIS error:", error);

        return res.status(500).json({
            message: "Gagal mengambil foto QRIS"
        });
    }
}

// =============================
// ADMIN
// UNGGAH / GANTI FOTO QRIS
// =============================

async function uploadQris(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Foto QRIS wajib diunggah"
            });
        }

        const data = await pengaturanModel.updateQris(
            req.file.filename
        );

        return res.json({
            message: "Foto QRIS berhasil disimpan",
            qris_image: data.qris_image
        });
    } catch (error) {
        console.error("Upload QRIS error:", error);

        return res.status(500).json({
            message: "Gagal menyimpan foto QRIS"
        });
    }
}

// =============================
// ADMIN
// HAPUS FOTO QRIS
// =============================

async function deleteQris(req, res) {
    try {
        const data = await pengaturanModel.updateQris(null);

        return res.json({
            message: "Foto QRIS berhasil dihapus",
            qris_image: data.qris_image
        });
    } catch (error) {
        console.error("Delete QRIS error:", error);

        return res.status(500).json({
            message: "Gagal menghapus foto QRIS"
        });
    }
}

module.exports = {
    getQris,
    uploadQris,
    deleteQris
};
