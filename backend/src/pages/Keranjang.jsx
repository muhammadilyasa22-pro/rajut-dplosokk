import { imageUrl } from "../config";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createPembelian } from "../services/api";
import { formatRp } from "../components/ProductCard";
import EmptyState from "../components/EmptyState";

export default function Keranjang() {
  const { items, updateQty, removeItem, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (!user) {
      navigate("/login", { state: { from: "/keranjang" } });
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createPembelian({
        items: items.map((i) => ({ produk_id: i.id, qty: i.qty, harga: i.harga })),
        total,
      });
      clearCart();
      navigate("/", { state: { checkoutSuccess: true } });
    } catch (err) {
      setError(err.message || "Checkout gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container py-5" style={{ maxWidth: 640 }}>
        <EmptyState title="Keranjang masih kosong" hint="Yuk mulai belanja dari rak produk." />
        <div className="text-center">
          <Link to="/produk" className="btn btn-toko pengrajut rounded-pill px-4">Belanja Sekarang</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      <h1 className="font-display fs-2 mb-4">Keranjang Belanja</h1>

      <div className="d-flex flex-column gap-2 mb-4">
        {items.map((item) => (
          <div key={item.id} className="d-flex align-items-center gap-3 card-toko pengrajut p-3">
            <div className="flex-shrink-0 rounded-3 overflow-hidden bg-paper-2" style={{ width: 64, height: 64 }}>
              {item.foto ? (
                <img src={imageUrl(item.gambar || item.foto)} alt={item.nama_produk || item.nama} className="w-100 h-100" style={{ objectFit: "cover" }} />
              ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center font-display" style={{ color: "rgba(31,77,61,0.25)" }}>{item.nama?.[0]}</div>
              )}
            </div>
            <div className="flex-grow-1 min-w-0">
              <p className="fw-semibold text-truncate mb-0">{item.nama}</p>
              <p className="price-mono small text-pine-dark mb-0">{formatRp(item.harga)}</p>
            </div>
            <div className="d-inline-flex align-items-center border rounded-pill">
              <button onClick={() => updateQty(item.id, item.qty - 1)} className="btn btn-sm border-0 px-2">−</button>
              <span className="price-mono small fw-semibold" style={{ width: 28, textAlign: "center" }}>{item.qty}</span>
              <button onClick={() => updateQty(item.id, item.qty + 1)} className="btn btn-sm border-0 px-2">+</button>
            </div>
            <button onClick={() => removeItem(item.id)} className="btn btn-link text-chili p-2" aria-label="Hapus">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" /></svg>
            </button>
          </div>
        ))}
      </div>

      <div className="nota-edge on-white card-toko pengrajut p-4">
        <p className="price-mono small text-uppercase text-body-secondary mb-3 pb-3 border-bottom border-dashed" style={{ letterSpacing: "0.1em", fontSize: 11 }}>
          *** Ringkasan Belanja ***
        </p>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <span className="text-body-secondary">Total</span>
          <span className="price-mono fs-3 fw-semibold text-pine-dark">{formatRp(total)}</span>
        </div>
        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        <button onClick={handleCheckout} disabled={loading} className="btn btn-accent w-100 rounded-pill py-2">
          {loading ? "Memproses pesanan..." : "Checkout Sekarang"}
        </button>
      </div>
    </div>
  );
}
