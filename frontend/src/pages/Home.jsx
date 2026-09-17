import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProduk, getArtikel } from "../services/api";
import ProductCard from "../components/ProductCard";
import ArticleCard from "../components/ArticleCard";
import Spinner from "../components/Spinner";

export default function Home() {
  const [produk, setProduk] = useState([]);
  const [artikel, setArtikel] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProduk(), getArtikel()])
      .then(([pRes, aRes]) => {
        setProduk((pRes.data?.data || pRes.data || []).slice(0, 8));
        setArtikel((aRes.data?.data || aRes.data || []).slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* HERO — shop signboard with a receipt-style stat strip as the signature element */}
      <section className="position-relative overflow-hidden bg-pine">
        <div className="position-absolute top-0 start-0 w-100 h-100 dot-grid-overlay" style={{ opacity: 0.12 }} />
        <div className="container position-relative py-5 py-md-6" style={{ paddingTop: "4rem", paddingBottom: "3.5rem" }}>
          <p className="price-mono small text-uppercase mb-3" style={{ color: "var(--marigold-300)", letterSpacing: "0.2em" }}>
            Karya Rajut, Sekarang Online
          </p>
          <h1 className="font-display text-white mb-4" style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", lineHeight: 1.1, maxWidth: 640 }}>
            Belanja karya rajut, <em style={{ color: "var(--marigold-400)" }}>langsung dari</em> toko pengrajut yang Anda percaya.
          </h1>
          <p className="text-white-50 mb-4" style={{ maxWidth: 520, fontSize: "1.05rem" }}>
            Dari baju rajut sampai tas dan aksesori — pesan dari rumah, kualitas tetap terjaga seperti memesan langsung ke pengrajin.
          </p>
          <div className="d-flex flex-wrap gap-3 mb-5">
            <Link to="/produk" className="btn btn-accent rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2">
              Lihat Produk
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <Link to="/artikel" className="btn btn-outline-toko pengrajut rounded-pill px-4 py-2">
              Baca Artikel
            </Link>
          </div>

          {/* Receipt-style stat strip */}
          <div className="nota-edge on-white bg-white rounded-4 px-4 py-3 shadow" style={{ maxWidth: 380 }}>
            <p className="price-mono small text-uppercase text-body-secondary mb-3 pb-3 border-bottom border-dashed" style={{ letterSpacing: "0.1em", fontSize: 11 }}>
              *** Nota Toko Pengrajut D-PLOSOKK ***
            </p>
            <div className="price-mono small d-flex flex-column gap-2">
              <div className="d-flex justify-content-between"><span className="text-body-secondary">Buka</span><span className="fw-semibold">06.00 – 21.00</span></div>
              <div className="d-flex justify-content-between"><span className="text-body-secondary">Produk tersedia</span><span className="fw-semibold">{produk.length > 0 ? "100+" : "—"}</span></div>
              <div className="d-flex justify-content-between"><span className="text-body-secondary">Antar</span><span className="fw-semibold">Se-kampung</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUK PILIHAN */}
      <section className="container py-5">
        <div className="d-flex align-items-end justify-content-between mb-4">
          <div>
            <p className="text-marigold price-mono small text-uppercase mb-2" style={{ letterSpacing: "0.15em" }}>Koleksi Unggulan</p>
            <h2 className="font-display fs-2 mb-0">Produk Pilihan</h2>
          </div>
          <Link to="/produk" className="small fw-semibold text-pine text-decoration-none d-none d-sm-block">
            Lihat semua →
          </Link>
        </div>

        {loading ? (
          <Spinner label="Menyiapkan rak produk..." />
        ) : produk.length === 0 ? (
          <p className="text-body-secondary small">Belum ada produk. Sambungkan backend untuk menampilkan data asli.</p>
        ) : (
          <div className="row g-3 g-md-4">
            {produk.map((p) => (
              <div key={p.id} className="col-6 col-md-4 col-lg-3">
                <ProductCard produk={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ARTIKEL */}
      {(loading || artikel.length > 0) && (
        <section className="bg-paper-2">
          <div className="container py-5">
            <p className="text-marigold price-mono small text-uppercase mb-2" style={{ letterSpacing: "0.15em" }}>Dari Pengrajin</p>
            <h2 className="font-display fs-2 mb-4">Cerita &amp; Info Terbaru</h2>
            {loading ? (
              <Spinner />
            ) : (
              <div className="row g-4">
                {artikel.map((a) => (
                  <div key={a.id} className="col-md-4">
                    <ArticleCard artikel={a} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
