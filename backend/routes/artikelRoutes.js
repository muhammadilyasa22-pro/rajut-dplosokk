const express = require("express");

const {
    getAllArtikel,
    getArtikelById,
    createArtikel,
    updateArtikel,
    deleteArtikel
} = require("../controllers/artikelController");

const {
    verifyToken,
    adminOnly
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// ========================================
// PUBLIC
// ========================================

// Semua artikel
router.get(
    "/",
    getAllArtikel
);

// Detail artikel
router.get(
    "/:id",
    getArtikelById
);


// ========================================
// ADMIN
// ========================================

// Tambah artikel
router.post(
    "/",
    verifyToken,
    adminOnly,
    upload.single("gambar"),
    createArtikel
);

// Update artikel
router.put(
    "/:id",
    verifyToken,
    adminOnly,
    upload.single("gambar"),
    updateArtikel
);

// Hapus artikel
router.delete(
    "/:id",
    verifyToken,
    adminOnly,
    deleteArtikel
);


module.exports = router;