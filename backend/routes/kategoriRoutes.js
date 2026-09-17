const express = require("express");

const {
    getKategori,
    tambahKategori,
    ubahKategori,
    hapusKategori
} = require("../controllers/kategoriController");

const {
    verifyToken,
    adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// =============================
// PUBLIC
// =============================

router.get(
    "/",
    getKategori
);

// =============================
// ADMIN
// =============================

router.post(
    "/",
    verifyToken,
    adminOnly,
    tambahKategori
);

router.put(
    "/:id",
    verifyToken,
    adminOnly,
    ubahKategori
);

router.delete(
    "/:id",
    verifyToken,
    adminOnly,
    hapusKategori
);

module.exports = router;
