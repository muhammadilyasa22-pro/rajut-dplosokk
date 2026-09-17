import { useEffect, useState } from "react";
import { getArtikel } from "../services/api";

export default function Artikel() {
    const [artikel, setArtikel] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        async function loadArtikel() {
            try {
                setLoading(true);
                setError("");

                const response = await getArtikel();

                console.log("Response artikel:", response);

                // Axios biasanya menyimpan JSON server di response.data
                const responseData = response?.data;

                let dataArtikel = [];

                // Bentuk:
                // {
                //   message: "...",
                //   data: [...]
                // }
                if (Array.isArray(responseData?.data)) {
                    dataArtikel = responseData.data;
                }

                // Jika API langsung mengembalikan array
                else if (Array.isArray(responseData)) {
                    dataArtikel = responseData;
                }

                // Jika service sudah mengembalikan data array
                else if (Array.isArray(response)) {
                    dataArtikel = response;
                }

                if (mounted) {
                    setArtikel(dataArtikel);
                }

            } catch (err) {
                console.error("Gagal mengambil artikel:", err);

                if (mounted) {
                    setArtikel([]);

                    const pesan =
                        err?.response?.data?.message ||
                        err?.message ||
                        "Gagal mengambil artikel";

                    setError(pesan);
                }

            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadArtikel();

        return () => {
            mounted = false;
        };
    }, []);

    // URL gambar artikel
    function getImageUrl(gambar) {
        if (!gambar) {
            return "http://localhost:5000/uploads/images/default.jpg";
        }

        // Kalau backend sudah mengirim URL lengkap
        if (
            gambar.startsWith("http://") ||
            gambar.startsWith("https://")
        ) {
            return gambar;
        }

        // Kalau sudah berupa path
        if (gambar.startsWith("/")) {
            return `http://localhost:5000${gambar}`;
        }

        return `http://localhost:5000/uploads/images/${gambar}`;
    }

    // Format tanggal
    function formatTanggal(tanggal) {
        if (!tanggal) {
            return "-";
        }

        try {
            const date = new Date(tanggal);

            if (Number.isNaN(date.getTime())) {
                return tanggal;
            }

            return date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });
        } catch {
            return tanggal;
        }
    }

    return (
        <div
            className="container py-5"
            style={{
                minHeight: "70vh"
            }}
        >
            {/* HEADER */}
            <div className="mb-5">
                <p
                    className="text-marigold price-mono small text-uppercase mb-2"
                    style={{
                        letterSpacing: "0.15em"
                    }}
                >
                    Papan Pengumuman
                </p>

                <h1
                    className="font-display"
                    style={{
                        fontSize:
                            "clamp(1.8rem, 4vw, 2.5rem)"
                    }}
                >
                    Artikel &amp; Info Toko Pengrajut
                </h1>

                <p
                    className="text-muted mb-0"
                    style={{
                        fontSize: "1rem"
                    }}
                >
                    Informasi dan cerita terbaru dari Toko Pengrajut
                    D-PLOSOKK.
                </p>
            </div>

            {/* LOADING */}
            {loading && (
                <div
                    className="text-center py-5"
                    style={{
                        border: "1px solid #e5e5e5",
                        background: "#fff"
                    }}
                >
                    <div
                        className="spinner-border"
                        role="status"
                        aria-label="Memuat artikel"
                    />

                    <p className="mt-3 mb-0 text-muted">
                        Memuat artikel...
                    </p>
                </div>
            )}

            {/* ERROR */}
            {!loading && error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    <strong>
                        Gagal mengambil artikel
                    </strong>

                    <div className="mt-1">
                        {error}
                    </div>

                    <button
                        type="button"
                        className="btn btn-outline-danger mt-3"
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        Muat ulang
                    </button>
                </div>
            )}

            {/* EMPTY */}
            {!loading &&
                !error &&
                artikel.length === 0 && (
                    <div
                        className="text-center py-5"
                        style={{
                            border: "1px solid #e5e5e5",
                            background: "#fff"
                        }}
                    >
                        <h3 className="font-display mb-2">
                            Belum ada artikel
                        </h3>

                        <p className="text-muted mb-0">
                            Artikel dari toko pengrajut akan muncul
                            di sini.
                        </p>
                    </div>
                )}

            {/* LIST ARTIKEL */}
            {!loading &&
                !error &&
                artikel.length > 0 && (
                    <div className="row g-4">
                        {artikel.map((a, index) => {
                            // Backend menggunakan id_artikel
                            const idArtikel =
                                a.id_artikel ??
                                a.id ??
                                index;

                            const judul =
                                a.judul ||
                                "Tanpa judul";

                            const ringkasan =
                                a.ringkasan ||
                                a.isi ||
                                "Tidak ada ringkasan artikel.";

                            const gambar =
                                a.gambar ||
                                "default.jpg";

                            const tanggal =
                                a.tanggal ||
                                a.created_at ||
                                a.createdAt ||
                                null;

                            return (
                                <div
                                    key={idArtikel}
                                    className="col-sm-6 col-lg-4"
                                >
                                    <article
                                        className="h-100 article-card"
                                        style={{
                                            background: "#fff",
                                            border:
                                                "1px solid #e5e5e5",
                                            overflow: "hidden"
                                        }}
                                    >
                                        {/* GAMBAR */}
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "220px",
                                                background:
                                                    "#f2f2f2",
                                                overflow: "hidden"
                                            }}
                                        >
                                            <img
                                                src={getImageUrl(
                                                    gambar
                                                )}
                                                alt={judul}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit:
                                                        "cover",
                                                    display:
                                                        "block"
                                                }}
                                                onError={(
                                                    e
                                                ) => {
                                                    e.currentTarget.src =
                                                        "http://localhost:5000/uploads/images/default.jpg";
                                                }}
                                            />
                                        </div>

                                        {/* ISI */}
                                        <div className="p-4">
                                            {tanggal && (
                                                <p
                                                    className="text-muted small mb-2"
                                                >
                                                    {formatTanggal(
                                                        tanggal
                                                    )}
                                                </p>
                                            )}

                                            <h2
                                                className="font-display mb-3"
                                                style={{
                                                    fontSize:
                                                        "1.35rem",
                                                    lineHeight:
                                                        "1.3"
                                                }}
                                            >
                                                {judul}
                                            </h2>

                                            <p
                                                className="text-muted mb-0"
                                                style={{
                                                    lineHeight:
                                                        "1.7"
                                                }}
                                            >
                                                {ringkasan}
                                            </p>
                                        </div>
                                    </article>
                                </div>
                            );
                        })}
                    </div>
                )}
        </div>
    );
}