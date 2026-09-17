const express = require("express");

const {
    getQris,
    uploadQris,
    deleteQris
} = require("../controllers/pengaturanController");

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
    "/qris",
    getQris
);

// =============================
// ADMIN
// =============================

router.post(
    "/qris",
    verifyToken,
    adminOnly,
    upload.single("qris"),
    uploadQris
);

router.delete(
    "/qris",
    verifyToken,
    adminOnly,
    deleteQris
);

module.exports = router;
