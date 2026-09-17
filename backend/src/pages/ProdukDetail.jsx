import { imageUrl } from "../config";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProdukById } from "../services/api";
import { formatRp } from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import Spinner from "../components/Spinner";

export default function ProdukDetail() {
  const { id } = useParams();
  const [produk, setProduk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    getProdukById(id)
      .then((res) => setProduk(res.data?.data || res.data))
      .catch(() => setProduk(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Mengambil detail produk..." />;
  if (!produk) {
    return (
      <div className="container text-center py-5">
        <p className="font-display fs-4 mb-2">Produk tidak ditemukan</p>
        <Link to="/produk" className="text-pine fw-semibold small text-decoration-none">← Kembali ke rak produk</Link>
      </div>
    );
  }

  const stok = produk.stok ?? 0;
  const habis = stok <= 0;

  return (
    <div className="container py-5">
      <Link to="/produk" className="small text-body-secondary text-decoration-none d-inline-flex align-items-center gap-1 mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        Semua produk
      </Link>

      <div className="row g-5">
        <div className="col-md-6">
          <div className="ratio ratio-1x1 bg-paper-2 rounded-4 overflow-hidden">
            {produk.foto ? (
              <img src={imageUrl(produk.gambar || produk.foto)} alt={produk.nama_produk || produk.nama} style={{ objectFit: "cover" }} />
            ) : (
              <div className="d-flex align-items-center justify-content-center font-display display-3" style={{ color: "rgba(31,77,61,0.25)" }}>
                {produk.nama?.[0]}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <p className="small text-marigold fw-semibold text-uppercase mb-2" style={{ letterSpacing: "0.1em" }}>{produk.kategori || "Kebutuhan harian"}</p>
          <h1 className="font-display fs-2 mb-3">{produk.nama}</h1>
          <p className="price-mono fs-3 fw-semibold text-pine-dark mb-3">{formatRp(produk.harga)}</p>

          <p className="small text-body-secondary mb-4">{produk.deskripsi || "Belum ada deskripsi untuk produk ini."}</p>

          <div className="nota-edge on-white bg-white border rounded-3 px-3 py-2 mb-4 d-inline-flex align-items-center gap-2 small">
            <span className="rounded-circle" style={{ width: 8, height: 8, backgroundColor: habis ? "var(--chili-500)" : "var(--pine-500)" }} />
            <span className="text-body-secondary">{habis ? "Stok habis" : `Stok tersedia: ${stok}`}</span>
          </div>

          {!habis && (
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="d-inline-flex align-items-center border rounded-pill">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="btn btn-sm border-0 px-3">−</button>
                <span className="price-mono fw-semibold" style={{ width: 32, textAlign: "center" }}>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(stok, q + 1))} className="btn btn-sm border-0 px-3">+</button>
              </div>
            </div>
          )}

          <button
            disabled={habis}
            onClick={() => {
              addItem(produk, qty);
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
            className="btn btn-toko pengrajut rounded-pill px-4 py-2 w-100 w-sm-auto"
          >
            {habis ? "Stok habis" : added ? "✓ Ditambahkan ke keranjang" : "Tambah ke Keranjang"}
          </button>
        </div>
      </div>
    </div>
  );
}
