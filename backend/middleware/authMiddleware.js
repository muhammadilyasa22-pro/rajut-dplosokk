const jwt = require("jsonwebtoken");

// =============================
// VERIFY TOKEN
// =============================

function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Token tidak ditemukan"
            });
        }

        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                message: "Format token tidak valid"
            });
        }

        const token = parts[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();
    } catch (error) {
        console.error("Verify token error:", error.message);

        return res.status(401).json({
            message: "Token tidak valid atau sudah kedaluwarsa"
        });
    }
}

// =============================
// ADMIN ONLY
// =============================

function adminOnly(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            message: "Belum login"
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Akses hanya untuk admin"
        });
    }

    next();
}

// =============================
// PEMBELI ONLY
// =============================

function pembeliOnly(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            message: "Belum login"
        });
    }

    if (req.user.role !== "pembeli") {
        return res.status(403).json({
            message: "Akses hanya untuk pembeli"
        });
    }

    next();
}

module.exports = {
    verifyToken,
    adminOnly,
    pembeliOnly
};