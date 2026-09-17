import { useEffect, useState } from "react";
import { getArtikel } from "../services/api";

const IMAGE_BASE_URL =
    "https://dplosokk.my.id/uploads/images";

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

                const responseData = response?.data;

                let dataArtikel = [];

                /*
                 * Kemungkinan response:
                 *
                 * 1. { data: [...] }
                 * 2. [...]
                 */

                if (Array.isArray(responseData?.data)) {
                    dataArtikel = responseData.data;
                } else if (Array.isArray(responseData)) {
                    dataArtikel = responseData;
                } else if (Array.isArray(response)) {
                    dataArtikel = response;
                }

                if (mounted) {
                    setArtikel(dataArtikel);
                }
            } catch (err) {
                console.error(
                    "Gagal mengambil artikel:",
                    err
                );

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

    /*
     * Membuat URL gambar artikel.
     *
     * Bisa menangani:
     * - nama file saja
     * - /uploads/images/nama.jpg
     * - /images/nama.jpg
     * - URL lengkap
     */
    function getImageUrl(gambar) {
        if (!gambar) {
            return `${IMAGE_BASE_URL}/default.jpg`;
        }

        let value = String(gambar)
            .trim()
            .replace(/\\/g, "/");

        /*
         * Jika backend sudah memberikan URL lengkap
         */
        if (
            value.startsWith("http://") ||
            value.startsWith("https://")
        ) {
            return value;
        }

        /*
         * Hilangkan slash di bagian depan
         */
        value = value.replace(/^\/+/, "");

        /*
         * Hilangkan prefix yang mungkin berasal
         * dari response backend
         */
        value = value.replace(
            /^uploads\/images\//i,
            ""
        );

        value = value.replace(
            /^uploads\//i,
            ""
        );

        value = value.replace(
            /^images\//i,
            ""
        );

        /*
         * Ambil nama file terakhir
         */
        value =
            value.split("/").pop() ||
            "default.jpg";

        return `${IMAGE_BASE_URL}/${encodeURIComponent(
            value
        )}`;
    }

    /*
     * Format tanggal Indonesia
     */
    function formatTanggal(tanggal) {
        if (!tanggal) {
            return "-";
        }

        try {
            const date = new Date(tanggal);

            if (Number.isNaN(date.getTime())) {
                return tanggal;
            }

            return date.toLocaleDateString(
                "id-ID",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );
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
                    Informasi dan cerita terbaru dari
                    Toko Pengrajut D-PLOSOKK.
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
                            border:
                                "1px solid #e5e5e5",
                            background: "#fff"
                        }}
                    >
                        <h3 className="font-display mb-2">
                            Belum ada artikel
                        </h3>

                        <p className="text-muted mb-0">
                            Artikel dari toko pengrajut
                            akan muncul di sini.
                        </p>
                    </div>
                )}

            {/* LIST ARTIKEL */}
            {!loading &&
                !error &&
                artikel.length > 0 && (
                    <div className="row g-4">
                        {artikel.map((a, index) => {
                            /*
                             * ID artikel
                             */
                            const idArtikel =
                                a.id_artikel ??
                                a.id ??
                                index;

                            /*
                             * Judul
                             */
                            const judul =
                                a.judul ||
                                "Tanpa judul";

                            /*
                             * Ringkasan artikel
                             */
                            const ringkasan =
                                a.ringkasan ||
                                a.isi ||
                                "Tidak ada ringkasan artikel.";

                            /*
                             * Gambar artikel
                             */
                            const gambar =
                                a.gambar ||
                                "default.jpg";

                            /*
                             * Tanggal artikel
                             */
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
                                            background:
                                                "#fff",
                                            border:
                                                "1px solid #e5e5e5",
                                            overflow:
                                                "hidden"
                                        }}
                                    >
                                        {/* GAMBAR */}
                                        <div
                                            style={{
                                                width:
                                                    "100%",
                                                height:
                                                    "220px",
                                                background:
                                                    "#f2f2f2",
                                                overflow:
                                                    "hidden"
                                            }}
                                        >
                                            <img
                                                src={getImageUrl(
                                                    gambar
                                                )}
                                                alt={judul}
                                                style={{
                                                    width:
                                                        "100%",
                                                    height:
                                                        "100%",
                                                    objectFit:
                                                        "cover",
                                                    display:
                                                        "block"
                                                }}
                                                onError={(
                                                    e
                                                ) => {
                                                    e.currentTarget.onerror =
                                                        null;

                                                    e.currentTarget.src =
                                                        `${IMAGE_BASE_URL}/default.jpg`;
                                                }}
                                            />
                                        </div>

                                        {/* ISI */}
                                        <div className="p-4">
                                            {/* TANGGAL */}
                                            {tanggal && (
                                                <p
                                                    className="text-muted small mb-2"
                                                >
                                                    {formatTanggal(
                                                        tanggal
                                                    )}
                                                </p>
                                            )}

                                            {/* JUDUL */}
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

                                            {/* RINGKASAN */}
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