import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../services";
import { imageUrl } from "../../config";
import { useAuth } from "../../context/AuthContext";

function statusClass(status = "") {
  const value = String(status).toLowerCase();
  if (["selesai", "diterima"].includes(value)) return "order-badge success";
  if (["dikirim", "dikemas", "diproses"].includes(value)) return "order-badge process";
  if (["dibatalkan", "batal"].includes(value)) return "order-badge danger";
  return "order-badge pending";
}

function paymentClass(payment = "") {
  const value = String(payment).toLowerCase();
  if (["dibayar", "sudah bayar"].includes(value)) return "payment-badge paid";
  if (value.includes("verifikasi")) return "payment-badge verify";
  return "payment-badge unpaid";
}

function statusStep(status = "") {
  const value = String(status).toLowerCase();
  if (["selesai", "diterima"].includes(value)) return 4;
  if (value === "dikirim") return 3;
  if (["dikemas", "diproses"].includes(value)) return 2;
  return 1;
}

function formatPrice(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

export default function PembelianPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(null);
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const fileRefs = useRef({});

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/pembelian/saya");
      setItems(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err?.message || "Gagal mengambil data pesanan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function uploadBukti(id) {
    const file = fileRefs.current[id]?.files?.[0];

    if (!file) {
      setError("Pilih foto bukti pembayaran terlebih dahulu.");
      setSuccess("");
      return;
    }

    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setError("Bukti pembayaran harus berupa JPG, JPEG, PNG, atau WEBP.");
      setSuccess("");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran foto bukti pembayaran maksimal 2 MB.");
      setSuccess("");
      return;
    }

    setUploading(id);
    setError("");
    setSuccess("");

    try {
      const body = new FormData();
      body.append("bukti", file);

      await apiFetch(`/pembelian/${id}/bukti`, {
        method: "POST",
        body
      });

      setSuccess("Bukti pembayaran berhasil dikirim dan menunggu verifikasi admin.");

      if (fileRefs.current[id]) fileRefs.current[id].value = "";
      await load();
    } catch (err) {
      setError(err?.message || "Gagal mengirim bukti pembayaran.");
    } finally {
      setUploading(null);
    }
  }

  const totalOrders = items.length;
  const activeOrders = items.filter((item) => !["Selesai", "Diterima", "Dibatalkan"].includes(item.status)).length;
  const paidOrders = items.filter((item) => ["Dibayar", "Sudah Bayar"].includes(item.pembayaran)).length;

  return (
    <section className="section container profile-page order-page-premium">
      <div className="order-hero">
        <div className="order-hero-copy">
          <p className="eyebrow">PESANAN SAYA</p>
          <h1>Semua pesanan Anda, dalam satu tempat.</h1>
          <p>
            Pantau proses pesanan, status pembayaran, dan bukti transfer dengan lebih mudah.
          </p>
        </div>

        <Link to="/toko" className="btn btn-primary order-shop-button">
          <span>Belanja Lagi</span>
          <b>→</b>
        </Link>
      </div>

      <div className="order-summary-grid premium-summary-grid">
        <div className="stat-card order-summary-card summary-total">
          <div className="summary-icon"><span></span><span></span><span></span></div>
          <div>
            <span>Total Pesanan</span>
            <strong>{totalOrders}</strong>
            <small>Seluruh transaksi Anda</small>
          </div>
        </div>

        <div className="stat-card order-summary-card summary-process">
          <div className="summary-icon"><span></span><span></span><span></span></div>
          <div>
            <span>Sedang Berjalan</span>
            <strong>{activeOrders}</strong>
            <small>Pesanan sedang diproses</small>
          </div>
        </div>

        <div className="stat-card order-summary-card summary-paid">
          <div className="summary-icon"><span></span><span></span><span></span></div>
          <div>
            <span>Sudah Dibayar</span>
            <strong>{paidOrders}</strong>
            <small>Pembayaran telah dikonfirmasi</small>
          </div>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <div className="orders-heading premium-orders-heading">
        <div>
          <p className="eyebrow">RIWAYAT TRANSAKSI</p>
          <h2>Pesanan terbaru</h2>
          <p>{totalOrders} transaksi tercatat di akun Anda.</p>
        </div>
        <div className="orders-count-label">{totalOrders} PESANAN</div>
      </div>

      {loading ? (
        <div className="orders-empty premium-empty">
          <div className="loading-lines"><i></i><i></i><i></i></div>
          <h3>Memuat pesanan Anda</h3>
          <p>Sedang mengambil data transaksi terbaru.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="orders-empty premium-empty">
          <div className="empty-order-mark"><span></span><span></span><span></span></div>
          <h3>Belum ada pesanan</h3>
          <p>Pesanan yang Anda buat akan tampil di halaman ini.</p>
          <Link to="/toko" className="btn btn-primary">Lihat Produk</Link>
        </div>
      ) : (
        <div className="orders-list-modern premium-orders-list">
          {items.map((item) => {
            const orderId = item.id ?? item.id_pembelian;
            const isTransfer = ["Transfer", "Bank Transfer"].includes(item.metode_pembayaran);
            const canUpload = isTransfer && !item.foto_bukti && !["Selesai", "Dibatalkan"].includes(item.status);
            const currentStep = statusStep(item.status);

            return (
              <article className="order-card-modern premium-order-card" key={orderId}>
                <div className="order-card-head">
                  <div className="order-id-block">
                    <span className="order-kicker">ORDER</span>
                    <strong>#{orderId}</strong>
                  </div>

                  <div className="order-head-statuses">
                    <span className={statusClass(item.status)}>{item.status || "Menunggu"}</span>
                    <span className={paymentClass(item.pembayaran)}>{item.pembayaran || "Belum Bayar"}</span>
                  </div>
                </div>

                <div className="order-main premium-order-main">
                  <div className="order-image-wrap">
                    <img
                      src={imageUrl(item.gambar)}
                      alt={item.nama_produk || "Produk"}
                      className="order-product-image"
                    />
                  </div>

                  <div className="order-product-info">
                    <span className="product-label">PRODUK</span>
                    <h3>{item.nama_produk || "Produk"}</h3>
                    <div className="order-meta-row">
                      <span>{item.metode_pembayaran || "Metode belum tersedia"}</span>
                      {item.pengiriman && <span>{item.pengiriman}</span>}
                    </div>
                    {item.catatan && <p className="order-customer-note">{item.catatan}</p>}
                  </div>

                  <div className="order-total premium-total">
                    <span>Total Pembayaran</span>
                    <strong>{formatPrice(item.harga)}</strong>
                  </div>
                </div>

                <div className="order-progress-area">
                  <div className="order-progress-top">
                    <span>PROGRES PESANAN</span>
                    <strong>Langkah {currentStep} dari 4</strong>
                  </div>
                  <div className="order-progress-track">
                    {[1, 2, 3, 4].map((step) => (
                      <div className={`progress-step ${step <= currentStep ? "done" : ""}`} key={step}>
                        <i></i>
                        <span>{["Dibuat", "Diproses", "Dikirim", "Selesai"][step - 1]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-footer premium-order-footer">
                  {item.foto_bukti ? (
                    <div className="proof-box proof-ready">
                      <div className="proof-indicator"></div>
                      <div>
                        <a
                          href={imageUrl(item.foto_bukti)}
                          target="_blank"
                          rel="noreferrer"
                          className="order-proof-link"
                        >
                          Lihat bukti pembayaran
                        </a>
                        <small className="order-note d-block">
                          {item.pembayaran === "Menunggu Verifikasi"
                            ? "Bukti sudah dikirim dan menunggu verifikasi admin."
                            : "Bukti pembayaran sudah dikirim."}
                        </small>
                      </div>
                    </div>
                  ) : canUpload ? (
                    <div className="order-upload premium-upload">
                      <label className="file-select-label">
                        <span>Pilih bukti pembayaran</span>
                        <input
                          ref={(el) => { fileRefs.current[orderId] = el; }}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                        />
                      </label>

                      <button
                        type="button"
                        className="btn btn-small btn-primary upload-button"
                        disabled={uploading === orderId}
                        onClick={() => uploadBukti(orderId)}
                      >
                        {uploading === orderId ? "Mengirim..." : "Kirim Bukti"}
                      </button>

                      <span className="order-note">JPG, PNG, atau WEBP. Maksimal 2 MB.</span>
                    </div>
                  ) : (
                    <div className="proof-box">
                      <div className="proof-indicator neutral"></div>
                      <span className="order-note">
                        {item.metode_pembayaran === "COD"
                          ? "Pembayaran dilakukan saat pesanan diterima."
                          : "Bukti pembayaran belum tersedia."}
                      </span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
