const express = require("express");

const {
    getAllPembelian,
    getPembelianSaya,
    getPembelianById,
    createPembelian,
    uploadBukti,
    checkoutCart,
    updateStatus,
    deletePembelian
} = require("../controllers/pembelianController");

const {
    verifyToken,
    adminOnly,
    pembeliOnly
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();


// PEMBELI
router.post(
    "/",
    verifyToken,
    pembeliOnly,
    upload.single("bukti"),
    createPembelian
);

router.post(
    "/checkout",
    verifyToken,
    pembeliOnly,
    upload.single("bukti"),
    checkoutCart
);

router.post(
    "/:id/bukti",
    verifyToken,
    pembeliOnly,
    upload.single("bukti"),
    uploadBukti
);

router.get(
    "/saya",
    verifyToken,
    pembeliOnly,
    getPembelianSaya
);


// ADMIN
router.get(
    "/",
    verifyToken,
    adminOnly,
    getAllPembelian
);

router.get(
    "/:id",
    verifyToken,
    adminOnly,
    getPembelianById
);

router.put(
    "/:id/status",
    verifyToken,
    adminOnly,
    updateStatus
);

router.delete(
    "/:id",
    verifyToken,
    adminOnly,
    deletePembelian
);


module.exports = router;