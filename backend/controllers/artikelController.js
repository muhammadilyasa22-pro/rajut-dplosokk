const artikelModel = require("../models/artikelModel");

// ========================================
// GET SEMUA ARTIKEL
// ========================================
async function getAllArtikel(req, res) {
    try {
        const data = await artikelModel.getAllArtikel();

        return res.json(data);
    } catch (error) {
        console.error("getAllArtikel error:", error);

        res.status(500).json({
            message: "Gagal mengambil data artikel"
        });
    }
}


// ========================================
// GET ARTIKEL BERDASARKAN ID
// ========================================
async function getArtikelById(req, res) {
    try {
        const { id } = req.params;

        const data = await artikelModel.getArtikelById(id);

        if (!data) {
            return res.status(404).json({
                message: "Artikel tidak ditemukan"
            });
        }

        return res.json(data);
    } catch (error) {
        console.error("getArtikelById error:", error);

        res.status(500).json({
            message: "Gagal mengambil artikel"
        });
    }
}


// ========================================
// TAMBAH ARTIKEL
// ========================================
async function createArtikel(req, res) {
    try {
        const judul = req.body.judul;
        const isi = req.body.isi;
        let ringkasan = req.body.ringkasan;

        // Gambar bisa berasal dari upload multer
        let gambar = null;

        if (req.file) {
            gambar = req.file.filename;
        } else if (req.body.gambar) {
            gambar = req.body.gambar;
        }

        // Validasi judul
        if (!judul || !judul.trim()) {
            return res.status(400).json({
                message: "Judul wajib diisi"
            });
        }

        // Validasi isi
        if (!isi || !isi.trim()) {
            return res.status(400).json({
                message: "Isi artikel wajib diisi"
            });
        }

        // Buat ringkasan otomatis jika form tidak mengirim ringkasan
        if (!ringkasan || !ringkasan.trim()) {
            ringkasan = isi.trim();

            if (ringkasan.length > 160) {
                ringkasan = ringkasan.substring(0, 160) + "...";
            }
        }

        const id = await artikelModel.createArtikel({
            judul: judul.trim(),
            ringkasan: ringkasan.trim(),
            isi: isi.trim(),
            gambar
        });

        res.status(201).json({
            message: "Artikel berhasil ditambahkan",
            id_artikel: id
        });

    } catch (error) {
        console.error("createArtikel error:", error);

        res.status(500).json({
            message: "Gagal menambahkan artikel",
            error: error.message
        });
    }
}


// ========================================
// UPDATE ARTIKEL
// ========================================
async function updateArtikel(req, res) {
    try {
        const { id } = req.params;

        const judul = req.body.judul;
        const isi = req.body.isi;
        let ringkasan = req.body.ringkasan;

        // Ambil data lama
        const artikelLama = await artikelModel.getArtikelById(id);

        if (!artikelLama) {
            return res.status(404).json({
                message: "Artikel tidak ditemukan"
            });
        }

        // Jika upload gambar baru, gunakan gambar baru.
        // Jika tidak, pertahankan gambar lama.
        let gambar = artikelLama.gambar;

        if (req.file) {
            gambar = req.file.filename;
        } else if (
            req.body.gambar &&
            req.body.gambar.trim()
        ) {
            gambar = req.body.gambar.trim();
        }

        if (!judul || !judul.trim()) {
            return res.status(400).json({
                message: "Judul wajib diisi"
            });
        }

        if (!isi || !isi.trim()) {
            return res.status(400).json({
                message: "Isi artikel wajib diisi"
            });
        }

        // Ringkasan otomatis
        if (!ringkasan || !ringkasan.trim()) {
            ringkasan = isi.trim();

            if (ringkasan.length > 160) {
                ringkasan = ringkasan.substring(0, 160) + "...";
            }
        }

        const result = await artikelModel.updateArtikel(
            id,
            {
                judul: judul.trim(),
                ringkasan: ringkasan.trim(),
                isi: isi.trim(),
                gambar
            }
        );

        if (!result) {
            return res.status(404).json({
                message: "Artikel tidak ditemukan"
            });
        }

        res.json({
            message: "Artikel berhasil diperbarui"
        });

    } catch (error) {
        console.error("updateArtikel error:", error);

        res.status(500).json({
            message: "Gagal memperbarui artikel",
            error: error.message
        });
    }
}


// ========================================
// HAPUS ARTIKEL
// ========================================
async function deleteArtikel(req, res) {
    try {
        const { id } = req.params;

        const result = await artikelModel.deleteArtikel(id);

        if (!result) {
            return res.status(404).json({
                message: "Artikel tidak ditemukan"
            });
        }

        res.json({
            message: "Artikel berhasil dihapus"
        });

    } catch (error) {
        console.error("deleteArtikel error:", error);

        res.status(500).json({
            message: "Gagal menghapus artikel"
        });
    }
}


module.exports = {
    getAllArtikel,
    getArtikelById,
    createArtikel,
    updateArtikel,
    deleteArtikel
};