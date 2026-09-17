const pembelianModel = require("../models/pembelianModel");
const produkModel = require("../models/produkModel");

// =============================
// PEMBELI
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
            pengiriman,
            catatan
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

        const produk =
            await produkModel.getProdukById(
                id_produk
            );

        if (!produk) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        // Frontend lama memakai label "Transfer" dan "Diantar/Diambil".
        // Terima juga label lama agar tidak terjadi mismatch frontend/backend.
        const metodeMap = {
            "Transfer": "Transfer",
            "Bank Transfer": "Transfer",
            "COD": "COD"
        };

        const pengirimanMap = {
            "Diantar": "Diantar",
            "Diambil": "Diambil",
            "JNT Express": "JNT Express",
            "JNE": "JNE"
        };

        const metodePembayaranFinal = metodeMap[metode_pembayaran];
        const pengirimanFinal = pengirimanMap[pengiriman];

        if (!metodePembayaranFinal) {
            return res.status(400).json({
                message: "Metode pembayaran tidak valid"
            });
        }

        if (!pengirimanFinal) {
            return res.status(400).json({
                message: "Metode pengiriman tidak valid"
            });
        }

        const fotoBukti = req.file
            ? req.file.filename
            : null;

        const id =
            await pembelianModel.createPembelian({
                id_pembeli,
                id_produk,
                nama_pembeli,
                alamat_pembeli,
                phone_pembeli,
                metode_pembayaran: metodePembayaranFinal,
                pembayaran: fotoBukti ? "Menunggu Verifikasi" : "Belum Bayar",
                pengiriman: pengirimanFinal,
                status: "Diproses",
                catatan: catatan || null,
                foto_bukti: fotoBukti
            });

        return res.status(201).json({
            message:
                "Pembelian berhasil dibuat",
            id
        });
    } catch (error) {
        console.error(
            "Create pembelian error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal membuat pembelian"
        });
    }
}

// =============================
// PEMBELI
// PEMBELIAN SAYA
// =============================

async function getPembelianSaya(req, res) {
    try {
        const id_pembeli = req.user.id;

        const data =
            await pembelianModel.getPembelianSaya(
                id_pembeli
            );

        return res.json(data);
    } catch (error) {
        console.error(
            "Get pembelian saya error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal mengambil pembelian"
        });
    }
}

// =============================
// PEMBELI
// UNGGAH BUKTI PEMBAYARAN
// =============================

async function uploadBukti(req, res) {
    try {
        const id = req.params.id;
        const id_pembeli = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                message: "Foto bukti pembayaran wajib diunggah"
            });
        }

        const existing = await pembelianModel.getPembelianById(id);

        if (!existing) {
            return res.status(404).json({
                message: "Pembelian tidak ditemukan"
            });
        }

        if (Number(existing.id_pembeli) !== Number(id_pembeli)) {
            return res.status(403).json({
                message: "Anda tidak dapat mengubah pesanan milik pembeli lain"
            });
        }

        const pembayaran =
            existing.pembayaran === "Sudah Bayar"
                ? existing.pembayaran
                : "Menunggu Verifikasi";

        await pembelianModel.updateBukti(
            id,
            req.file.filename,
            pembayaran
        );

        const updated = await pembelianModel.getPembelianById(id);

        return res.json({
            message:
                "Bukti pembayaran berhasil dikirim dan menunggu verifikasi admin",
            data: {
                id: updated.id,
                foto_bukti: updated.foto_bukti,
                pembayaran: updated.pembayaran
            }
        });
    } catch (error) {
        console.error(
            "Upload bukti pembelian error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal mengirim bukti pembayaran"
        });
    }
}

// =============================
// PEMBELI
// CHECKOUT KERANJANG (BANYAK PRODUK SEKALIGUS)
// =============================

async function checkoutCart(req, res) {
    try {
        const id_pembeli = req.user.id;

        const {
            nama_pembeli,
            alamat_pembeli,
            phone_pembeli,
            metode_pembayaran,
            pengiriman,
            catatan
        } = req.body;

        let items = [];

        try {
            items =
                typeof req.body.items === "string"
                    ? JSON.parse(req.body.items)
                    : req.body.items;
        } catch (parseError) {
            return res.status(400).json({
                message: "Data keranjang tidak valid"
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Keranjang masih kosong"
            });
        }

        if (
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

        const metodeMap = {
            "Transfer": "Transfer",
            "Bank Transfer": "Transfer",
            "COD": "COD"
        };

        const pengirimanMap = {
            "Diantar": "Diantar",
            "Diambil": "Diambil",
            "JNT Express": "JNT Express",
            "JNE": "JNE"
        };

        const metodePembayaranFinal = metodeMap[metode_pembayaran];
        const pengirimanFinal = pengirimanMap[pengiriman];

        if (!metodePembayaranFinal) {
            return res.status(400).json({
                message: "Metode pembayaran tidak valid"
            });
        }

        if (!pengirimanFinal) {
            return res.status(400).json({
                message: "Metode pengiriman tidak valid"
            });
        }

        const fotoBukti = req.file
            ? req.file.filename
            : null;

        const pembayaranAwal =
            fotoBukti ? "Menunggu Verifikasi" : "Belum Bayar";

        const orders = [];
        let total = 0;

        for (const item of items) {
            const id_produk = item.id_produk ?? item.id;

            const produk =
                await produkModel.getProdukById(id_produk);

            if (!produk) {
                return res.status(404).json({
                    message: `Produk dengan id ${id_produk} tidak ditemukan`
                });
            }

            const qty = Number(item.qty) > 0
                ? Number(item.qty)
                : 1;

            const catatanItem = qty > 1
                ? `${catatan ? catatan + " | " : ""}Jumlah: ${qty}`
                : (catatan || null);

            const id =
                await pembelianModel.createPembelian({
                    id_pembeli,
                    id_produk: produk.id_produk,
                    nama_pembeli,
                    alamat_pembeli,
                    phone_pembeli,
                    metode_pembayaran: metodePembayaranFinal,
                    pembayaran: pembayaranAwal,
                    pengiriman: pengirimanFinal,
                    status: "Diproses",
                    catatan: catatanItem,
                    foto_bukti: fotoBukti
                });

            const subtotal = Number(produk.harga || 0) * qty;
            total += subtotal;

            orders.push({
                id,
                id_produk: produk.id_produk,
                nama_produk: produk.nama_produk,
                harga: produk.harga,
                qty,
                subtotal
            });
        }

        return res.status(201).json({
            message: "Transaksi berhasil dibuat",
            transaksi_berhasil: true,
            total,
            orders
        });
    } catch (error) {
        console.error(
            "Checkout keranjang error:",
            error
        );

        return res.status(500).json({
            message: "Gagal memproses checkout keranjang"
        });
    }
}

// =============================
// ADMIN
// SEMUA PEMBELIAN
// =============================

async function getAllPembelian(req, res) {
    try {
        const data =
            await pembelianModel.getAllPembelian();

        return res.json(data);
    } catch (error) {
        console.error(
            "Get all pembelian error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal mengambil semua pembelian"
        });
    }
}

// =============================
// ADMIN
// DETAIL PEMBELIAN
// =============================

async function getPembelianById(req, res) {
    try {
        const data =
            await pembelianModel.getPembelianById(
                req.params.id
            );

        if (!data) {
            return res.status(404).json({
                message:
                    "Pembelian tidak ditemukan"
            });
        }

        return res.json(data);
    } catch (error) {
        console.error(
            "Get pembelian detail error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal mengambil detail pembelian"
        });
    }
}

// =============================
// ADMIN
// UPDATE STATUS
// =============================

async function updateStatus(req, res) {
    try {
        const id = req.params.id;
        const body = req.body && typeof req.body === "object"
            ? req.body
            : {};

        const existing = await pembelianModel.getPembelianById(id);

        if (!existing) {
            return res.status(404).json({
                message: "Pembelian tidak ditemukan"
            });
        }

        const status = body.status !== undefined && body.status !== ""
            ? body.status
            : (existing.status || "Menunggu");

        const pembayaran = body.pembayaran !== undefined && body.pembayaran !== ""
            ? body.pembayaran
            : (existing.pembayaran || "Belum Bayar");

        const statusValid = [
            "Menunggu",
            "Diproses",
            "Dikirim",
            "Selesai",
            "Dibatalkan"
        ];

        const pembayaranValid = [
            "Belum Bayar",
            "Menunggu Verifikasi",
            "Sudah Bayar"
        ];

        if (!statusValid.includes(status)) {
            return res.status(400).json({
                message: "Status pembelian tidak valid"
            });
        }

        if (!pembayaranValid.includes(pembayaran)) {
            return res.status(400).json({
                message: "Status pembayaran tidak valid"
            });
        }

        await pembelianModel.updateStatus(id, status, pembayaran);
        const updated = await pembelianModel.getPembelianById(id);

        return res.json({
            message: "Status pembelian berhasil diperbarui",
            data: {
                id: updated.id,
                status: updated.status,
                pembayaran: updated.pembayaran
            }
        });
    } catch (error) {
        console.error("Update status error:", error);

        return res.status(500).json({
            message: "Gagal memperbarui status pembelian",
            error: error.message
        });
    }
}

// =============================
// ADMIN
// HAPUS PEMBELIAN
// =============================

async function deletePembelian(req, res) {
    try {
        const id = req.params.id;

        const affectedRows =
            await pembelianModel.deletePembelian(
                id
            );

        if (!affectedRows) {
            return res.status(404).json({
                message:
                    "Pembelian tidak ditemukan"
            });
        }

        return res.json({
            message:
                "Pembelian berhasil dihapus"
        });
    } catch (error) {
        console.error(
            "Delete pembelian error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal menghapus pembelian"
        });
    }
}

module.exports = {
    getAllPembelian,
    getPembelianSaya,
    getPembelianById,
    createPembelian,
    uploadBukti,
    checkoutCart,
    updateStatus,
    deletePembelian
};