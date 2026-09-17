require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/authRoutes");
const produkRoutes = require("./routes/produkRoutes");
const pembelianRoutes = require("./routes/pembelianRoutes");
const artikelRoutes = require("./routes/artikelRoutes");
const adminRoutes = require("./routes/adminRoutes");
const pengaturanRoutes = require("./routes/pengaturanRoutes");
const kategoriRoutes = require("./routes/kategoriRoutes");
const ulasanRoutes = require("./routes/ulasanRoutes");

const app = express();


// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
    "http://localhost:5173",
    "https://rajut-dplosokk.vercel.app"
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Origin tidak diizinkan oleh CORS")
            );
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ],

        optionsSuccessStatus: 204
    })
);


// ============================================================
// BODY PARSER
// ============================================================

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb"
    })
);


// ============================================================
// FOLDER UPLOAD
// ============================================================

const uploadDir = path.join(
    __dirname,
    "uploads",
    "images"
);

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}


// ============================================================
// STATIC UPLOAD
// ============================================================

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


// ============================================================
// ROUTES
// ============================================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/produk",
    produkRoutes
);

app.use(
    "/api/pembelian",
    pembelianRoutes
);

app.use(
    "/api/artikel",
    artikelRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/pengaturan",
    pengaturanRoutes
);

app.use(
    "/api/kategori",
    kategoriRoutes
);

app.use(
    "/api/ulasan",
    ulasanRoutes
);


// ============================================================
// TEST BACKEND
// ============================================================

app.get("/", function (req, res) {
    res.json({
        message: "Backend Toko Pengrajut D-PLOSOKK berjalan",
        status: "OK"
    });
});


// ============================================================
// ERROR HANDLER
// ============================================================

app.use(function (err, req, res, next) {
    console.error("Server error:", err);

    if (
        err.message &&
        err.message.includes("File harus berupa")
    ) {
        return res.status(400).json({
            message: err.message
        });
    }

    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            message: "Ukuran gambar maksimal 2 MB"
        });
    }

    if (
        err.message ===
        "Origin tidak diizinkan oleh CORS"
    ) {
        return res.status(403).json({
            message: "Origin tidak diizinkan oleh CORS"
        });
    }

    return res.status(500).json({
        message: "Terjadi kesalahan pada server",
        error:
            process.env.NODE_ENV === "development"
                ? err.message
                : undefined
    });
});


// ============================================================
// LOCAL SERVER
// ============================================================

if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, function () {
        console.log(
            `Server berjalan di http://localhost:${PORT}`
        );

        console.log(
            `Folder gambar: ${uploadDir}`
        );

        console.log(
            "CORS aktif untuk:"
        );

        console.log(
            "- http://localhost:5173"
        );

        console.log(
            "- https://rajut-dplosokk.vercel.app"
        );
    });
}


// ============================================================
// VERCEL
// ============================================================

module.exports = app;