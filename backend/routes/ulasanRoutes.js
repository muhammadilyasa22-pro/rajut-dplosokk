const express = require("express");

const {
    getUlasanProduk,
    kirimUlasan
} = require("../controllers/ulasanController");

const {
    verifyToken,
    pembeliOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// =============================
// PUBLIC
// =============================

router.get(
    "/produk/:id_produk",
    getUlasanProduk
);

// =============================
// PEMBELI
// =============================

router.post(
    "/",
    verifyToken,
    pembeliOnly,
    kirimUlasan
);

module.exports = router;
