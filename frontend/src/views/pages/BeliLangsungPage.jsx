import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../../models/api";
import { imageUrl } from "../../config";
import { useAuth } from "../../controllers/AuthContext";

function formatRp(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

export default function BeliLangsungPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const produk = location.state?.produk || null;

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

  // Tidak ada produk yang dikirim (misalnya halaman ini dibuka langsung lewat URL) -> kembali ke toko.
  if (!produk) {
    return (
      <section className="section container">
        <div className="empty-state">
          Tidak ada produk yang dipilih untuk dibeli.
          <div style={{ marginTop: 16 }}>
            <Link to="/toko" className="btn btn-primary">Kembali ke Toko</Link>
          </div>
        </div>
      </section>
    );
  }

  async function beli(event) {
    event.preventDefault();

    if (!user) {
      navigate("/login", { state: { from: "/toko" } });
      return;
    }

    if (user.role !== "pembeli") {
      setError("Akun admin tidak dapat membeli produk.");
      return;
    }

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
      body.append("id_produk", produk.id_produk);
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      if (buktiFile) body.append("bukti", buktiFile);

      await apiFetch("/pembelian", { method: "POST", body });

      setResult({
        id_produk: produk.id_produk,
        nama_produk: produk.nama_produk,
        harga: produk.harga
      });
    } catch (err) {
      setError(err.message || "Pembelian gagal. Silakan coba lagi.");
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
          <p className="muted">{result.nama_produk} berhasil dipesan.</p>

          <div className="checkout-success-total">
            <span>Total Pembayaran</span>
            <strong>{formatRp(result.harga)}</strong>
          </div>

          <div className="checkout-success-actions">
            <Link to="/pembeli/pesanan" className="btn btn-primary">Lihat Pesanan Saya</Link>
            <Link to="/toko" className="btn btn-outline">Belanja Lagi</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section container">
      <div className="page-intro"><p className="eyebrow">BELI LANGSUNG</p><h1>Beli Sekarang</h1><p>Pembelian ini tidak melalui keranjang, langsung satu produk.</p></div>

      <div className="cart-layout">
        <div className="cart-list">
          <div className="cart-item">
            <img src={imageUrl(produk.gambar)} alt={produk.nama_produk} />
            <div className="cart-item-info">
              <strong>{produk.nama_produk}</strong>
              <span>{formatRp(produk.harga)}</span>
            </div>
            <div className="cart-item-subtotal">{formatRp(produk.harga)}</div>
          </div>
        </div>

        <form className="cart-summary" onSubmit={beli}>
          <h3>Data Pemesanan</h3>
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
                <small>Opsional saat memesan. JPG/PNG/WEBP, maksimal 2 MB. Bisa juga dikirim nanti di halaman Pesanan Saya.</small>
              </label>
            </div>
          )}

          <div className="cart-total-row">
            <span>Total</span>
            <strong>{formatRp(produk.harga)}</strong>
          </div>

          <button className="btn btn-accent btn-block" disabled={sending}>
            {sending ? "Memproses..." : "Bayar & Pesan Sekarang"}
          </button>
        </form>
      </div>
    </section>
  );
}
