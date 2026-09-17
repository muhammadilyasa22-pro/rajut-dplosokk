const express = require("express");

const {
    getAllProduk,
    getProdukById,
    createProduk,
    updateProduk,
    deleteProduk
} = require("../controllers/produkController");

const {
    verifyToken,
    adminOnly
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// =============================
// PUBLIC
// =============================

router.get(
    "/",
    getAllProduk
);

router.get(
    "/:id",
    getProdukById
);

// =============================
// ADMIN
// =============================

router.post(
    "/",
    verifyToken,
    adminOnly,
    upload.single("gambar"),
    createProduk
);

router.put(
    "/:id",
    verifyToken,
    adminOnly,
    upload.single("gambar"),
    updateProduk
);

router.delete(
    "/:id",
    verifyToken,
    adminOnly,
    deleteProduk
);

module.exports = router;