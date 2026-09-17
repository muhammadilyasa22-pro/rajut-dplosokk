import { useEffect, useMemo, useState } from "react";
import { getProduk } from "../services/api";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";

export default function ProdukList() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [kategori, setKategori] = useState("Semua");

  useEffect(() => {
    getProduk()
      .then((res) => setProduk(res.data?.data || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kategoriList = useMemo(() => {
    const set = new Set(produk.map((p) => p.kategori).filter(Boolean));
    return ["Semua", ...set];
  }, [produk]);

  const filtered = produk.filter((p) => {
    const matchQ = p.nama?.toLowerCase().includes(q.toLowerCase());
    const matchK = kategori === "Semua" || p.kategori === kategori;
    return matchQ && matchK;
  });

  return (
    <div className="container py-5">
      <div className="mb-4">
        <p className="text-marigold price-mono small text-uppercase mb-2" style={{ letterSpacing: "0.15em" }}>Koleksi Rajut</p>
        <h1 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}>Semua Produk</h1>
      </div>

      <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
        <div className="position-relative flex-grow-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeOpacity="0.4" strokeWidth="2"
               className="position-absolute top-50 translate-middle-y" style={{ left: 14 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari produk..."
            className="form-control rounded-pill"
            style={{ paddingLeft: 40 }}
          />
        </div>
        {kategoriList.length > 1 && (
          <div className="d-flex gap-2 overflow-auto pb-1">
            {kategoriList.map((k) => (
              <button
                key={k}
                onClick={() => setKategori(k)}
                className={`btn btn-sm rounded-pill text-nowrap ${kategori === k ? "btn-toko pengrajut" : "btn-outline-secondary"}`}
              >
                {k}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <Spinner label="Menyiapkan rak produk..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="Produk tidak ditemukan" hint="Coba kata kunci atau kategori lain." />
      ) : (
        <div className="row g-3 g-md-4">
          {filtered.map((p) => (
            <div key={p.id} className="col-6 col-md-4 col-lg-3">
              <ProductCard produk={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
