const db = require("../config/db");

const produkModel = require("../models/produkModel");
const artikelModel = require("../models/artikelModel");
const pembelianModel = require("../models/pembelianModel");
const usersModel = require("../models/usersModel");


// ============================================================
// HELPER ARTIKEL
// ============================================================

// Menyesuaikan jika artikelModel menggunakan:
// getAllArtikel / findAllArtikel
async function ambilSemuaArtikel() {
    if (typeof artikelModel.getAllArtikel === "function") {
        return await artikelModel.getAllArtikel();
    }

    if (typeof artikelModel.findAllArtikel === "function") {
        return await artikelModel.findAllArtikel();
    }

    throw new Error(
        "Fungsi getAllArtikel/findAllArtikel tidak ditemukan di artikelModel.js"
    );
}


// Menyesuaikan jika artikelModel menggunakan:
// getArtikelById / findArtikelById
async function ambilArtikelById(id) {
    if (typeof artikelModel.getArtikelById === "function") {
        return await artikelModel.getArtikelById(id);
    }

    if (typeof artikelModel.findArtikelById === "function") {
        return await artikelModel.findArtikelById(id);
    }

    throw new Error(
        "Fungsi getArtikelById/findArtikelById tidak ditemukan di artikelModel.js"
    );
}


// ============================================================
// DASHBOARD ADMIN
// ============================================================

async function getDashboard(req, res) {
    try {
        const [produkCount] = await db.query(`
            SELECT COUNT(*) AS total
            FROM produk
        `);

        const [artikelCount] = await db.query(`
            SELECT COUNT(*) AS total
            FROM artikel
        `);

        const [pembeliCount] = await db.query(`
            SELECT COUNT(*) AS total
            FROM users
            WHERE role = 'pembeli'
        `);

        const [pembelianCount] = await db.query(`
            SELECT COUNT(*) AS total
            FROM pembelian
        `);

        const [produkTerjual] = await db.query(`
            SELECT COUNT(*) AS total
            FROM pembelian
            WHERE status <> 'Dibatalkan'
        `);

        const [pesananAktif] = await db.query(`
            SELECT COUNT(*) AS total
            FROM pembelian
            WHERE status IN ('Diproses', 'Dikirim')
        `);

        const [belumDibayar] = await db.query(`
            SELECT COUNT(*) AS total
            FROM pembelian
            WHERE pembayaran IS NULL
               OR pembayaran = ''
               OR LOWER(pembayaran) IN ('belum bayar', 'belum dibayar')
        `);

        const [selesaiCount] = await db.query(`
            SELECT COUNT(*) AS total
            FROM pembelian
            WHERE status = 'Selesai'
        `);

        const [pendapatan] = await db.query(`
            SELECT COALESCE(SUM(produk.harga), 0) AS total
            FROM pembelian
            INNER JOIN produk
                ON pembelian.id_produk = produk.id_produk
            WHERE pembelian.status = 'Selesai'
        `);

        // Data transaksi terbaru dibuat terpisah agar dashboard tetap
        // dapat menampilkan statistik walaupun query detail transaksi bermasalah.
        let recentPembelian = [];

        try {
            recentPembelian =
                await pembelianModel.getAllPembelian();
        } catch (recentError) {
            console.error(
                "Gagal mengambil transaksi terbaru dashboard:",
                recentError.message
            );
        }

        const statistik = {
            total_produk: Number(produkCount[0]?.total || 0),
            total_artikel: Number(artikelCount[0]?.total || 0),
            total_pembeli: Number(pembeliCount[0]?.total || 0),
            total_pembelian: Number(pembelianCount[0]?.total || 0),
            produk_terjual: Number(produkTerjual[0]?.total || 0),
            pesanan_aktif: Number(pesananAktif[0]?.total || 0),
            belum_dibayar: Number(belumDibayar[0]?.total || 0),
            pembelian_selesai: Number(selesaiCount[0]?.total || 0),
            total_pendapatan: Number(pendapatan[0]?.total || 0),
            total_pesan_kontak: 0
        };

        return res.json({
            statistik,
            ...statistik,
            total_transaksi: statistik.total_pembelian,
            pembelian_terbaru: Array.isArray(recentPembelian)
                ? recentPembelian.slice(0, 5)
                : []
        });

    } catch (error) {
        console.error(
            "Dashboard admin error:",
            error
        );

        return res.status(500).json({
            message: "Gagal mengambil dashboard admin",
            error: error.message
        });
    }
}


// ============================================================
// PRODUK
// ============================================================

async function getProduk(req, res) {
    try {
        const data =
            await produkModel.getAllProduk();

        return res.json(data);

    } catch (error) {
        console.error(
            "Get produk admin error:",
            error
        );

        return res.status(500).json({
            message: "Gagal mengambil produk",
            error: error.message
        });
    }
}


async function getProdukDetail(req, res) {
    try {
        const data =
            await produkModel.getProdukById(
                req.params.id
            );

        if (!data) {
            return res.status(404).json({
                message: "Produk tidak ditemukan"
            });
        }

        return res.json(data);

    } catch (error) {
        console.error(
            "Get produk detail error:",
            error
        );

        return res.status(500).json({
            message: "Gagal mengambil detail produk",
            error: error.message
        });
    }
}


async function tambahProduk(req, res) {
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
            harga === undefined ||
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

        const id =
            await produkModel.createProduk({
                nama_produk: nama_produk.trim(),
                deskripsi: deskripsi.trim(),
                harga: hargaNumber,
                gambar:
                    req.file?.filename ||
                    "default.jpg",
                kategori: kategori.trim(),
                bahan: bahan ? bahan.trim() : null,
                ukuran: ukuran ? ukuran.trim() : null,
                stok: stok
            });

        return res.status(201).json({
            message:
                "Produk berhasil ditambahkan",
            id
        });

    } catch (error) {
        console.error(
            "Tambah produk error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal menambahkan produk",
            error: error.message
        });
    }
}


async function editProduk(req, res) {
    try {
        const id = req.params.id;

        const produk =
            await produkModel.getProdukById(id);

        if (!produk) {
            return res.status(404).json({
                message:
                    "Produk tidak ditemukan"
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
            harga === undefined ||
            !kategori
        ) {
            return res.status(400).json({
                message:
                    "Data produk belum lengkap"
            });
        }

        const hargaNumber = Number(harga);

        if (
            Number.isNaN(hargaNumber) ||
            hargaNumber < 0
        ) {
            return res.status(400).json({
                message:
                    "Harga produk tidak valid"
            });
        }

        const updated =
            await produkModel.updateProduk(
                id,
                {
                    nama_produk: nama_produk.trim(),
                    deskripsi: deskripsi.trim(),
                    harga: hargaNumber,

                    gambar:
                        req.file?.filename ||
                        produk.gambar ||
                        "default.jpg",

                    kategori: kategori.trim(),
                    bahan: bahan ? bahan.trim() : null,
                    ukuran: ukuran ? ukuran.trim() : null,
                    stok: stok
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
            "Edit produk error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal memperbarui produk",
            error: error.message
        });
    }
}


async function hapusProduk(req, res) {
    try {
        const id = req.params.id;

        const deleted =
            await produkModel.deleteProduk(id);

        if (!deleted) {
            return res.status(404).json({
                message:
                    "Produk tidak ditemukan"
            });
        }

        return res.json({
            message:
                "Produk berhasil dihapus"
        });

    } catch (error) {
        console.error(
            "Hapus produk error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal menghapus produk",
            error: error.message
        });
    }
}


// ============================================================
// PEMBELI
// ============================================================

async function getPembeli(req, res) {
    try {
        const [rows] = await db.query(`
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
            WHERE role = 'pembeli'
            ORDER BY id DESC
        `);

        return res.json(rows);

    } catch (error) {
        console.error(
            "Get pembeli error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal mengambil pembeli",
            error: error.message
        });
    }
}


async function getPembeliDetail(req, res) {
    try {
        const user =
            await usersModel.findById(
                req.params.id
            );

        if (
            !user ||
            user.role !== "pembeli"
        ) {
            return res.status(404).json({
                message:
                    "Pembeli tidak ditemukan"
            });
        }

        const pembelian =
            await pembelianModel.getPembelianSaya(
                req.params.id
            );

        return res.json({
            user,
            pembelian
        });

    } catch (error) {
        console.error(
            "Get pembeli detail error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal mengambil detail pembeli",
            error: error.message
        });
    }
}



async function updatePembeli(req, res) {
    try {
        const id = req.params.id;
        const current = await usersModel.findById(id);

        if (!current || current.role !== "pembeli") {
            return res.status(404).json({ message: "Pembeli tidak ditemukan" });
        }

        const {
            nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname
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

        await usersModel.updateUser(id, {
            nama_d: String(nama_d).trim(),
            nama_b: String(nama_b).trim(),
            kelamin: kelamin || null,
            lahir: lahir || null,
            alamat: alamat || null,
            phone: phone || null,
            email: String(email).trim(),
            uname: String(uname).trim(),
            foto: req.file?.filename || current.foto || "default.jpg"
        });

        const user = await usersModel.findById(id);
        return res.json({ message: "Data pembeli berhasil diperbarui", user });
    } catch (error) {
        console.error("Update pembeli error:", error);
        return res.status(500).json({ message: "Gagal memperbarui pembeli", error: error.message });
    }
}

async function hapusPembeli(req, res) {
    try {
        const id = req.params.id;

        const user =
            await usersModel.findById(id);

        if (
            !user ||
            user.role !== "pembeli"
        ) {
            return res.status(404).json({
                message:
                    "Pembeli tidak ditemukan"
            });
        }

        const deleted =
            await usersModel.deleteUser(id);

        if (!deleted) {
            return res.status(400).json({
                message:
                    "Pembeli gagal dihapus"
            });
        }

        return res.json({
            message:
                "Pembeli berhasil dihapus"
        });

    } catch (error) {
        console.error(
            "Hapus pembeli error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal menghapus pembeli",
            error: error.message
        });
    }
}


// ============================================================
// ARTIKEL
// ============================================================

// GET SEMUA ARTIKEL
async function getArtikel(req, res) {
    try {
        const data =
            await ambilSemuaArtikel();

        return res.json(data);

    } catch (error) {
        console.error(
            "Get artikel admin error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal mengambil artikel",
            error: error.message
        });
    }
}


// GET DETAIL ARTIKEL
async function getArtikelDetail(req, res) {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                message:
                    "ID artikel wajib diisi"
            });
        }

        const data =
            await ambilArtikelById(id);

        if (!data) {
            return res.status(404).json({
                message:
                    "Artikel tidak ditemukan"
            });
        }

        return res.json(data);

    } catch (error) {
        console.error(
            "Get artikel detail error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal mengambil detail artikel",
            error: error.message
        });
    }
}


// TAMBAH ARTIKEL
async function tambahArtikel(req, res) {
    try {
        const {
            judul,
            isi,
            ringkasan
        } = req.body;

        if (
            !judul ||
            !String(judul).trim()
        ) {
            return res.status(400).json({
                message:
                    "Judul artikel wajib diisi"
            });
        }

        if (
            !isi ||
            !String(isi).trim()
        ) {
            return res.status(400).json({
                message:
                    "Isi artikel wajib diisi"
            });
        }

        let ringkasanFinal =
            ringkasan &&
            String(ringkasan).trim()
                ? String(ringkasan).trim()
                : String(isi).trim();

        if (ringkasanFinal.length > 160) {
            ringkasanFinal =
                ringkasanFinal.substring(
                    0,
                    160
                ) + "...";
        }

        const gambar =
            req.file?.filename ||
            "default.jpg";

        const id =
            await artikelModel.createArtikel({
                judul:
                    String(judul).trim(),

                ringkasan:
                    ringkasanFinal,

                isi:
                    String(isi).trim(),

                gambar
            });

        return res.status(201).json({
            message:
                "Artikel berhasil ditambahkan",
            id
        });

    } catch (error) {
        console.error(
            "Tambah artikel error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal menambahkan artikel",
            error: error.message
        });
    }
}


// EDIT ARTIKEL
async function editArtikel(req, res) {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                message:
                    "ID artikel wajib diisi"
            });
        }

        const artikel =
            await ambilArtikelById(id);

        if (!artikel) {
            return res.status(404).json({
                message:
                    "Artikel tidak ditemukan"
            });
        }

        const {
            judul,
            isi,
            ringkasan
        } = req.body;

        if (
            !judul ||
            !String(judul).trim()
        ) {
            return res.status(400).json({
                message:
                    "Judul artikel wajib diisi"
            });
        }

        if (
            !isi ||
            !String(isi).trim()
        ) {
            return res.status(400).json({
                message:
                    "Isi artikel wajib diisi"
            });
        }

        let ringkasanFinal =
            ringkasan &&
            String(ringkasan).trim()
                ? String(ringkasan).trim()
                : String(isi).trim();

        if (ringkasanFinal.length > 160) {
            ringkasanFinal =
                ringkasanFinal.substring(
                    0,
                    160
                ) + "...";
        }

        const gambar =
            req.file?.filename ||
            artikel.gambar ||
            "default.jpg";

        const updated =
            await artikelModel.updateArtikel(
                id,
                {
                    judul:
                        String(judul).trim(),

                    ringkasan:
                        ringkasanFinal,

                    isi:
                        String(isi).trim(),

                    gambar
                }
            );

        if (!updated) {
            return res.status(400).json({
                message:
                    "Artikel gagal diperbarui"
            });
        }

        return res.json({
            message:
                "Artikel berhasil diperbarui"
        });

    } catch (error) {
        console.error(
            "Edit artikel error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal memperbarui artikel",
            error: error.message
        });
    }
}


// HAPUS ARTIKEL
async function hapusArtikel(req, res) {
    try {
        const id = req.params.id;

        console.log(
            "Memproses hapus artikel ID:",
            id
        );

        if (!id) {
            return res.status(400).json({
                message:
                    "ID artikel wajib diisi"
            });
        }

        const artikel =
            await ambilArtikelById(id);

        if (!artikel) {
            return res.status(404).json({
                message:
                    "Artikel tidak ditemukan"
            });
        }

        const deleted =
            await artikelModel.deleteArtikel(id);

        if (!deleted) {
            return res.status(400).json({
                message:
                    "Artikel gagal dihapus"
            });
        }

        return res.json({
            message:
                "Artikel berhasil dihapus"
        });

    } catch (error) {
        console.error(
            "Hapus artikel error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal menghapus artikel",
            error: error.message
        });
    }
}


// ============================================================
// PEMBELIAN
// ============================================================

async function getSemuaPembelian(req, res) {
    try {
        const data =
            await pembelianModel.getAllPembelian();

        return res.json(data);

    } catch (error) {
        console.error(
            "Get pembelian error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal mengambil pembelian",
            error: error.message
        });
    }
}


async function getPembelianDetail(req, res) {
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
                "Gagal mengambil detail pembelian",
            error: error.message
        });
    }
}


async function updateStatusPembelian(req, res) {
    try {
        const id = req.params.id;
        const body = req.body && typeof req.body === "object"
            ? req.body
            : {};

        // Ambil data lama terlebih dahulu supaya admin boleh mengubah
        // STATUS PESANAN atau STATUS PEMBAYARAN secara terpisah.
        const existing = await pembelianModel.getPembelianById(id);

        if (!existing) {
            return res.status(404).json({
                message: "Pembelian tidak ditemukan"
            });
        }

        // Normalisasi supaya nilai dari <select> tetap cocok walaupun
        // database lama menyimpan spasi/perbedaan huruf.
        const normalize = (value) => String(value ?? "").trim();

        const status = body.status !== undefined && normalize(body.status) !== ""
            ? normalize(body.status)
            : normalize(existing.status || "Menunggu");

        const pembayaran = body.pembayaran !== undefined && normalize(body.pembayaran) !== ""
            ? normalize(body.pembayaran)
            : normalize(existing.pembayaran || "Belum Bayar");

        // "Menunggu" adalah status awal yang dipakai data pesanan.
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
                message: "Status tidak valid"
            });
        }

        if (!pembayaranValid.includes(pembayaran)) {
            return res.status(400).json({
                message: "Status pembayaran tidak valid"
            });
        }

        await pembelianModel.updateStatus(id, status, pembayaran);

        // Verifikasi ulang agar frontend mendapatkan nilai yang benar-benar
        // tersimpan di database.
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
            message: "Gagal memperbarui status",
            error: error.message
        });
    }
}

async function updatePembayaranPembelian(req, res) {
    try {
        const id = req.params.id;
        const pembayaran = String(req.body?.pembayaran ?? "").trim();

        const pembayaranValid = [
            "Belum Bayar",
            "Menunggu Verifikasi",
            "Sudah Bayar"
        ];

        if (!pembayaranValid.includes(pembayaran)) {
            return res.status(400).json({
                message: "Status pembayaran tidak valid"
            });
        }

        const existing = await pembelianModel.getPembelianById(id);
        if (!existing) {
            return res.status(404).json({
                message: "Pembelian tidak ditemukan"
            });
        }

        const affectedRows = await pembelianModel.updatePembayaran(id, pembayaran);

        // MySQL dapat mengembalikan affectedRows = 0 bila nilainya sama.
        // Karena itu kita selalu baca ulang setelah UPDATE untuk memastikan
        // nilai yang tersimpan benar-benar sama dengan pilihan admin.
        const updated = await pembelianModel.getPembelianById(id);

        if (!updated || String(updated.pembayaran ?? "").trim() !== pembayaran) {
            return res.status(500).json({
                message: "Status pembayaran gagal disimpan",
                detail: "Nilai pembayaran di database tidak berubah."
            });
        }

        return res.json({
            message: affectedRows
                ? "Status pembayaran berhasil diperbarui"
                : "Status pembayaran sudah sesuai",
            data: {
                id: updated.id,
                status: updated.status,
                pembayaran: updated.pembayaran
            }
        });
    } catch (error) {
        console.error("Update pembayaran error:", error);
        return res.status(500).json({
            message: "Gagal memperbarui status pembayaran",
            error: error.message
        });
    }
}

async function hapusPembelian(req, res) {
    try {
        const deleted =
            await pembelianModel.deletePembelian(
                req.params.id
            );

        if (!deleted) {
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
            "Hapus pembelian error:",
            error
        );

        return res.status(500).json({
            message:
                "Gagal menghapus pembelian",
            error: error.message
        });
    }
}


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    getDashboard,

    // PRODUK
    getProduk,
    getProdukDetail,
    tambahProduk,
    editProduk,
    hapusProduk,

    // PEMBELI
    getPembeli,
    getPembeliDetail,
    updatePembeli,
    hapusPembeli,

    // ARTIKEL
    getArtikel,
    getArtikelDetail,
    tambahArtikel,
    editArtikel,
    hapusArtikel,

    // PEMBELIAN
    getSemuaPembelian,
    getPembelianDetail,
    updateStatusPembelian,
    updatePembayaranPembelian,
    hapusPembelian
};