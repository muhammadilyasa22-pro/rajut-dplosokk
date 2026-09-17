import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../models/api";
import { imageUrl } from "../../config";
import { useAuth } from "../../controllers/AuthContext";
import { useCart } from "../../context/CartContext";

function formatRp(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

export default function KeranjangPage() {
  const { items, updateQty, removeItem, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama_pembeli: "",
    alamat_pembeli: "",
    phone_pembeli: "",
    metode_pembayaran: "Transfer",
    pengiriman: "Diantar",
    catatan: ""
  });
  const [buktiFile, setBuktiFile] = useState(null);
  const [qris, setQris] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (user) {
      setForm((current) => ({
        ...current,
        nama_pembeli: `${user.nama_d || ""} ${user.nama_b || ""}`.trim() || current.nama_pembeli,
        alamat_pembeli: user.alamat || current.alamat_pembeli,
        phone_pembeli: user.phone || current.phone_pembeli
      }));
    }
  }, [user]);

  useEffect(() => {
    apiFetch("/pengaturan/qris")
      .then((data) => setQris(data?.qris_image || null))
      .catch(() => setQris(null));
  }, []);

  async function checkout(event) {
    event.preventDefault();

    if (!user) {
      navigate("/login", { state: { from: "/keranjang" } });
      return;
    }

    if (user.role !== "pembeli") {
      setError("Akun admin tidak dapat membuat pesanan pembeli.");
      return;
    }

    if (items.length === 0) return;

    if (buktiFile && form.metode_pembayaran !== "Transfer") {
      setError("Foto bukti pembayaran hanya boleh diunggah untuk pembayaran Transfer.");
      return;
    }

    if (buktiFile && !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(buktiFile.type)) {
      setError("Bukti pembayaran harus berupa JPG, JPEG, PNG, atau WEBP.");
      return;
    }

    if (buktiFile && buktiFile.size > 2 * 1024 * 1024) {
      setError("Ukuran foto bukti pembayaran maksimal 2 MB.");
      return;
    }

    setSending(true);
    setError("");

    try {
      const body = new FormData();
      body.append(
        "items",
        JSON.stringify(items.map((item) => ({ id_produk: item.id_produk ?? item.id, qty: item.qty })))
      );
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      if (buktiFile) body.append("bukti", buktiFile);

      const data = await apiFetch("/pembelian/checkout", { method: "POST", body });

      setResult(data);
      clearCart();
      setBuktiFile(null);
    } catch (err) {
      setError(err.message || "Checkout gagal. Silakan coba lagi.");
    } finally {
      setSending(false);
    }
  }

  // =============================
  // TAMPILAN: TRANSAKSI BERHASIL
  // =============================
  if (result) {
    return (
      <section className="section container">
        <div className="checkout-success">
          <div className="checkout-success-icon">✓</div>
          <p className="eyebrow">TRANSAKSI BERHASIL</p>
          <h1>Terima kasih, pesananmu sudah kami terima!</h1>
          <p className="muted">
            {result.orders?.length || 0} produk berhasil dipesan dengan total {formatRp(result.total)}.
          </p>

          <div className="checkout-success-list">
            {(result.orders || []).map((order) => (
              <div className="checkout-success-row" key={order.id}>
                <span>#{order.id} — {order.nama_produk} {order.qty > 1 ? `(x${order.qty})` : ""}</span>
                <strong>{formatRp(order.subtotal)}</strong>
              </div>
            ))}
          </div>

          <div className="checkout-success-total">
            <span>Total Pembayaran</span>
            <strong>{formatRp(result.total)}</strong>
          </div>

          <div className="checkout-success-actions">
            <Link to="/pembeli/pesanan" className="btn btn-primary">Lihat Pesanan Saya</Link>
            <Link to="/toko" className="btn btn-outline">Belanja Lagi</Link>
          </div>
        </div>
      </section>
    );
  }

  // =============================
  // TAMPILAN: KERANJANG KOSONG
  // =============================
  if (items.length === 0) {
    return (
      <section className="section container">
        <div className="page-intro"><p className="eyebrow">KERANJANG</p><h1>Keranjang Belanja</h1></div>
        <div className="empty-state">
          Keranjang kamu masih kosong.
          <div style={{ marginTop: 16 }}>
            <Link to="/toko" className="btn btn-primary">Belanja Sekarang</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section container">
      <div className="page-intro"><p className="eyebrow">KERANJANG</p><h1>Keranjang Belanja</h1><p>Periksa kembali pesananmu sebelum checkout.</p></div>

      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={imageUrl(item.gambar)} alt={item.nama_produk || item.nama} />
              <div className="cart-item-info">
                <strong>{item.nama_produk || item.nama}</strong>
                <span>{formatRp(item.harga)}</span>
              </div>
              <div className="qty-stepper">
                <button type="button" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                <span>{item.qty}</span>
                <button type="button" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
              </div>
              <div className="cart-item-subtotal">{formatRp(item.harga * item.qty)}</div>
              <button type="button" className="cart-remove" onClick={() => removeItem(item.id)} aria-label="Hapus">✕</button>
            </div>
          ))}
        </div>

        <form className="cart-summary" onSubmit={checkout}>
          <h3>Ringkasan &amp; Data Pengiriman</h3>
          {error && <div className="alert error">{error}</div>}

          <div className="form-stack">
            <label>Nama<input value={form.nama_pembeli} onChange={(e) => setForm({ ...form, nama_pembeli: e.target.value })} required /></label>
            <label>Telepon<input value={form.phone_pembeli} onChange={(e) => setForm({ ...form, phone_pembeli: e.target.value })} required /></label>
            <label>Alamat<textarea value={form.alamat_pembeli} onChange={(e) => setForm({ ...form, alamat_pembeli: e.target.value })} required /></label>
            <label>Metode pembayaran
              <select value={form.metode_pembayaran} onChange={(e) => setForm({ ...form, metode_pembayaran: e.target.value })}>
                <option>Transfer</option>
                <option>COD</option>
              </select>
            </label>
            <label>Pengiriman
              <select value={form.pengiriman} onChange={(e) => setForm({ ...form, pengiriman: e.target.value })}>
                <option>Diantar</option>
                <option>Diambil</option>
              </select>
            </label>
            <label>Catatan<textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} /></label>
          </div>

          {form.metode_pembayaran === "Transfer" && (
            <div className="qris-box">
              <span className="qris-label">Scan QRIS untuk membayar</span>
              {qris ? (
                <img src={imageUrl(qris)} alt="QRIS Pembayaran" className="qris-image" />
              ) : (
                <p className="muted small">Foto QRIS belum tersedia. Silakan hubungi admin toko.</p>
              )}
              <label className="full">
                Foto bukti pembayaran
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setBuktiFile(e.target.files?.[0] || null)}
                />
                <small>Opsional saat checkout. JPG/PNG/WEBP, maksimal 2 MB. Bisa juga dikirim nanti di halaman Pesanan Saya.</small>
              </label>
            </div>
          )}

          <div className="cart-total-row">
            <span>Total</span>
            <strong>{formatRp(total)}</strong>
          </div>

          <button className="btn btn-accent btn-block" disabled={sending}>
            {sending ? "Memproses..." : "Checkout Sekarang"}
          </button>
        </form>
      </div>
    </section>
  );
}
