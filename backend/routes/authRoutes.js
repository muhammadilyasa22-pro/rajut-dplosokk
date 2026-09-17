const express = require("express");

const {
    register,
    login,
    getMyProfile,
    updateMyProfile
} = require("../controllers/authController");

const {
    verifyToken,
    adminOnly,
    pembeliOnly
} = require("../middleware/authMiddleware");

const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

// =============================
// REGISTER
// =============================

router.post(
    "/register",
    register
);

// =============================
// LOGIN
// =============================

router.post(
    "/login",
    login
);

// =============================
// CEK TOKEN
// =============================

router.get(
    "/me",
    verifyToken,
    (req, res) => {
        res.json({
            message:
                "Token valid",
            user: req.user
        });
    }
);

// =============================
// PROFIL
// =============================

router.get(
    "/profile",
    verifyToken,
    getMyProfile
);

router.put(
    "/profile",
    verifyToken,
    upload.single("foto"),
    updateMyProfile
);

// =============================
// TEST PEMBELI
// =============================

router.get(
    "/pembeli",
    verifyToken,
    pembeliOnly,
    (req, res) => {
        res.json({
            message:
                "Akses pembeli berhasil",
            user: req.user
        });
    }
);

// =============================
// TEST ADMIN
// =============================

router.get(
    "/admin",
    verifyToken,
    adminOnly,
    (req, res) => {
        res.json({
            message:
                "Akses admin berhasil",
            user: req.user
        });
    }
);

module.exports = router;