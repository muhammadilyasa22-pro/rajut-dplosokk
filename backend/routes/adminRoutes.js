const express = require("express");

const {
    getDashboard,

    getProduk,
    getProdukDetail,
    tambahProduk,
    editProduk,
    hapusProduk,

    getPembeli,
    getPembeliDetail,
    updatePembeli,
    hapusPembeli,

    getArtikel,
    getArtikelDetail,
    tambahArtikel,
    editArtikel,
    hapusArtikel,

    getSemuaPembelian,
    getPembelianDetail,
    updateStatusPembelian,
    updatePembayaranPembelian,
    hapusPembelian
} = require("../controllers/adminController");

const {
    verifyToken,
    adminOnly
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// ============================================================
// SEMUA ROUTE ADMIN WAJIB LOGIN ADMIN
// ============================================================

router.use(
    verifyToken,
    adminOnly
);


// ============================================================
// DASHBOARD ADMIN
// ============================================================

// Endpoint utama dashboard
router.get(
    "/dashboard",
    getDashboard
);

// Alias /stats supaya frontend yang memanggil /stats tetap bekerja
router.get(
    "/stats",
    getDashboard
);


// ============================================================
// PRODUK
// ============================================================

// Ambil semua produk
router.get(
    "/produk",
    getProduk
);

// Detail produk
router.get(
    "/produk/:id",
    getProdukDetail
);

// Tambah produk
router.post(
    "/produk",
    upload.single("gambar"),
    tambahProduk
);

// Edit produk
router.put(
    "/produk/:id",
    upload.single("gambar"),
    editProduk
);

// Hapus produk
router.delete(
    "/produk/:id",
    hapusProduk
);


// ============================================================
// PEMBELI
// ============================================================

// Ambil semua pembeli
router.get(
    "/pembeli",
    getPembeli
);

// Detail pembeli
router.get(
    "/pembeli/:id",
    getPembeliDetail
);

// Edit pembeli
router.put(
    "/pembeli/:id",
    upload.single("foto"),
    updatePembeli
);

// Hapus pembeli
router.delete(
    "/pembeli/:id",
    hapusPembeli
);


// ============================================================
// ARTIKEL
// ============================================================

// Ambil semua artikel
router.get(
    "/artikel",
    getArtikel
);

// Detail artikel
router.get(
    "/artikel/:id",
    getArtikelDetail
);

// Tambah artikel
router.post(
    "/artikel",
    upload.single("gambar"),
    tambahArtikel
);

// Edit artikel
router.put(
    "/artikel/:id",
    upload.single("gambar"),
    editArtikel
);

// Hapus artikel
router.delete(
    "/artikel/:id",
    hapusArtikel
);


// ============================================================
// PEMBELIAN / PESANAN
// ============================================================

// Semua pembelian
router.get(
    "/pembelian",
    getSemuaPembelian
);

// Detail pembelian
router.get(
    "/pembelian/:id",
    getPembelianDetail
);

// Update status pembelian
router.put(
    "/pembelian/:id/status",
    updateStatusPembelian
);

// Update pembayaran secara terpisah agar pilihan bayar di panel admin
// tidak bergantung pada status pesanan.
router.put(
    "/pembelian/:id/pembayaran",
    updatePembayaranPembelian
);

// Alias kompatibilitas untuk frontend lama.
router.put(
    "/pembelian/:id/bayar",
    updatePembayaranPembelian
);

// Hapus pembelian
router.delete(
    "/pembelian/:id",
    hapusPembelian
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;