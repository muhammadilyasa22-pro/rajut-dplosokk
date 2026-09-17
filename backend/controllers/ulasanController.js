const ulasanModel = require("../models/ulasanModel");

// =============================
// PUBLIC
// AMBIL ULASAN + RINGKASAN RATING SATU PRODUK
// =============================

async function getUlasanProduk(req, res) {
    try {
        const { id_produk } = req.params;

        const [ulasan, ringkasan, jumlah_terjual] = await Promise.all([
            ulasanModel.getUlasanByProduk(id_produk),
            ulasanModel.getRingkasanRating(id_produk),
            ulasanModel.getJumlahTerjual(id_produk)
        ]);

        return res.json({
            ulasan: ulasan.map((u) => ({
                id: u.id,
                rating: u.rating,
                komentar: u.komentar,
                created_at: u.created_at,
                nama_pembeli: `${u.nama_d || ""} ${(u.nama_b || "").charAt(0)}${u.nama_b ? "." : ""}`.trim()
            })),
            rata_rata: ringkasan.rata_rata,
            jumlah_ulasan: ringkasan.jumlah_ulasan,
            distribusi: ringkasan.distribusi,
            jumlah_terjual
        });
    } catch (error) {
        console.error("Get ulasan produk error:", error);

        return res.status(500).json({
            message: "Gagal mengambil ulasan produk"
        });
    }
}

// =============================
// PEMBELI
// KIRIM ULASAN BARU
// =============================

async function kirimUlasan(req, res) {
    try {
        const id_pembeli = req.user.id;
        const { id_produk, rating, komentar } = req.body;

        const ratingAngka = Number(rating);

        if (!id_produk || !ratingAngka || ratingAngka < 1 || ratingAngka > 5) {
            return res.status(400).json({
                message: "Rating (1-5) dan produk wajib diisi"
            });
        }

        const sudahBeli = await ulasanModel.sudahBeliProduk(id_produk, id_pembeli);

        if (!sudahBeli) {
            return res.status(403).json({
                message: "Kamu hanya bisa memberi ulasan untuk produk yang pernah kamu pesan"
            });
        }

        const sudahUlas = await ulasanModel.sudahUlasProduk(id_produk, id_pembeli);

        if (sudahUlas) {
            return res.status(409).json({
                message: "Kamu sudah pernah memberi ulasan untuk produk ini"
            });
        }

        await ulasanModel.createUlasan({
            id_produk,
            id_pembeli,
            rating: ratingAngka,
            komentar: (komentar || "").trim() || null
        });

        return res.status(201).json({
            message: "Terima kasih, ulasan kamu berhasil dikirim"
        });
    } catch (error) {
        if (error && error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Kamu sudah pernah memberi ulasan untuk produk ini"
            });
        }

        console.error("Kirim ulasan error:", error);

        return res.status(500).json({
            message: "Gagal mengirim ulasan"
        });
    }
}

module.exports = {
    getUlasanProduk,
    kirimUlasan
};
