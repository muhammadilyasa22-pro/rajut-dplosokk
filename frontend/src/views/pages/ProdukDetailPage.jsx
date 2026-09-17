import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../models/api";
import { imageUrl } from "../../config";
import { useAuth } from "../../controllers/AuthContext";
import { useCart } from "../../context/CartContext";

function Bintang({ value, size = 16 }) {
  const bulat = Math.round(value || 0);
  return (
    <span className="bintang-row" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= bulat ? "bintang penuh" : "bintang kosong"}>★</span>
      ))}
    </span>
  );
}

export default function ProdukDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [form, setForm] = useState({ nama_pembeli: "", alamat_pembeli: "", phone_pembeli: "", metode_pembayaran: "Transfer", pengiriman: "Diantar", catatan: "" });
  const [buktiFile, setBuktiFile] = useState(null);
  const [qris, setQris] = useState(null);

  // Ulasan & rating
  const [ulasanData, setUlasanData] = useState(null);
  const [ulasanLoading, setUlasanLoading] = useState(true);
  const [formUlasan, setFormUlasan] = useState({ rating: 5, komentar: "" });
  const [kirimUlasanStatus, setKirimUlasanStatus] = useState("");
  const [kirimUlasanError, setKirimUlasanError] = useState("");
  const [sendingUlasan, setSendingUlasan] = useState(false);

  useEffect(() => {
    apiFetch("/pengaturan/qris")
      .then((data) => setQris(data?.qris_image || null))
      .catch(() => setQris(null));
  }, []);

  useEffect(() => {
    apiFetch(`/produk/${id}`).then(setProduct).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id]);

  function loadUlasan() {
    setUlasanLoading(true);
    apiFetch(`/ulasan/produk/${id}`)
      .then(setUlasanData)
      .catch(() => setUlasanData(null))
      .finally(() => setUlasanLoading(false));
  }

  useEffect(() => {
    loadUlasan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (user) {
      setForm((current) => ({ ...current, nama_pembeli: `${user.nama_d || ""} ${user.nama_b || ""}`.trim(), alamat_pembeli: user.alamat || "", phone_pembeli: user.phone || "" }));
    }
  }, [user]);

  function tambahKeranjang() {
    if (!user) {
      navigate("/login", { state: { from: `/produk/${id}` } });
      return;
    }
    if (user.role !== "pembeli") {
      setMessage("Akun admin tidak dapat menambahkan produk ke keranjang.");
      return;
    }
    addItem(
      {
        id: product.id_produk,
        id_produk: product.id_produk,
        nama_produk: product.nama_produk,
        harga: product.harga,
        gambar: product.gambar
      },
      1
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  }

  function beliSekarang() {
    if (!user) {
      navigate("/login", { state: { from: `/produk/${id}` } });
      return;
    }
    if (user.role !== "pembeli") {
      setMessage("Akun admin tidak dapat membeli produk.");
      return;
    }
    navigate("/beli-langsung", {
      state: {
        produk: {
          id_produk: product.id_produk,
          nama_produk: product.nama_produk,
          harga: product.harga,
          gambar: product.gambar
        }
      }
    });
  }

  async function order(event) {
    event.preventDefault();
    if (!user) { navigate("/login", { state: { from: `/produk/${id}` } }); return; }
    setSending(true); setMessage("");
    try {
      if (buktiFile && form.metode_pembayaran !== "Transfer") {
        setMessage("Foto bukti hanya boleh diunggah untuk pembayaran Transfer.");
        setSending(false);
        return;
      }

      if (buktiFile && !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(buktiFile.type)) {
        setMessage("Bukti pembayaran harus berupa JPG, JPEG, PNG, atau WEBP.");
        setSending(false);
        return;
      }

      if (buktiFile && buktiFile.size > 2 * 1024 * 1024) {
        setMessage("Ukuran foto bukti pembayaran maksimal 2 MB.");
        setSending(false);
        return;
      }

      const body = new FormData();
      body.append("id_produk", product.id_produk);
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      if (buktiFile) body.append("bukti", buktiFile);

      await apiFetch("/pembelian", { method: "POST", body });
      setBuktiFile(null);
      setMessage(
        buktiFile
          ? "Pesanan berhasil dibuat dan bukti pembayaran berhasil dikirim. Silakan cek Pesanan Saya."
          : "Pesanan berhasil dibuat. Silakan cek halaman Pesanan Saya untuk mengirim bukti pembayaran."
      );
    } catch (err) { setMessage(err.message); }
    finally { setSending(false); }
  }

  async function kirimUlasan(event) {
    event.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: `/produk/${id}` } });
      return;
    }
    setSendingUlasan(true);
    setKirimUlasanError("");
    setKirimUlasanStatus("");
    try {
      await apiFetch("/ulasan", {
        method: "POST",
        body: JSON.stringify({
          id_produk: product.id_produk,
          rating: formUlasan.rating,
          komentar: formUlasan.komentar
        })
      });
      setKirimUlasanStatus("Terima kasih, ulasan kamu berhasil dikirim.");
      setFormUlasan({ rating: 5, komentar: "" });
      loadUlasan();
    } catch (err) {
      setKirimUlasanError(err.message);
    } finally {
      setSendingUlasan(false);
    }
  }

  if (loading) return <div className="container section"><div className="loading-box">Memuat detail...</div></div>;
  if (error) return <div className="container section"><div className="alert error">{error}</div></div>;
  if (!product) return null;

  const spesifikasi = [
    ["Kategori", product.kategori || "-"],
    ["Bahan", product.bahan || "-"],
    ["Ukuran", product.ukuran || "-"],
    ["Stok", product.stok === null || product.stok === undefined ? "Tersedia" : product.stok > 0 ? `${product.stok} pcs` : "Habis"]
  ];

  const rataRata = ulasanData?.rata_rata || 0;
  const jumlahUlasan = ulasanData?.jumlah_ulasan || 0;
  const jumlahTerjual = ulasanData?.jumlah_terjual || 0;
  const distribusi = ulasanData?.distribusi || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <section className="section container">
      <Link to="/toko" className="back-link">← Kembali ke toko</Link>
      <div className="detail-grid">
        <div className="detail-image"><img src={imageUrl(product.gambar)} alt={product.nama_produk} /></div>
        <div className="detail-copy"><span className="tag">{product.kategori}</span><h1>{product.nama_produk}</h1>

          {!ulasanLoading && (
            <div className="rating-summary-inline">
              <Bintang value={rataRata} />
              <strong>{rataRata > 0 ? rataRata.toFixed(1) : "Belum ada rating"}</strong>
              {jumlahUlasan > 0 && <span className="muted">({jumlahUlasan} ulasan)</span>}
              {jumlahTerjual > 0 && <span className="muted">· {jumlahTerjual} terjual</span>}
            </div>
          )}

          <div className="price">Rp {Number(product.harga || 0).toLocaleString("id-ID")}</div>
          <div className="detail-actions">
            <button type="button" className="btn btn-accent" onClick={tambahKeranjang}>
              {addedToCart ? "Ditambahkan ke keranjang ✓" : "+ Tambah ke Keranjang"}
            </button>
            <button type="button" className="btn btn-primary" onClick={beliSekarang}>
              Beli Sekarang
            </button>
          </div>

          <h3 className="detail-subheading">Deskripsi Produk</h3>
          <p>{product.deskripsi}</p>

          <h3 className="detail-subheading">Spesifikasi Produk</h3>
          <table className="spek-table">
            <tbody>
              {spesifikasi.map(([label, value]) => (
                <tr key={label}><th>{label}</th><td>{value}</td></tr>
              ))}
            </tbody>
          </table>

          {user?.role === "pembeli" ? <form className="order-form" onSubmit={order}><h3>Buat Pesanan</h3>{message && <div className="alert success">{message}</div>}<div className="form-grid"><label>Nama<input value={form.nama_pembeli} onChange={(e) => setForm({ ...form, nama_pembeli: e.target.value })} required /></label><label>Telepon<input value={form.phone_pembeli} onChange={(e) => setForm({ ...form, phone_pembeli: e.target.value })} required /></label><label className="full">Alamat<textarea value={form.alamat_pembeli} onChange={(e) => setForm({ ...form, alamat_pembeli: e.target.value })} required /></label><label>Metode pembayaran<select value={form.metode_pembayaran} onChange={(e) => setForm({ ...form, metode_pembayaran: e.target.value })}><option>Transfer</option><option>COD</option></select></label><label>Pengiriman<select value={form.pengiriman} onChange={(e) => setForm({ ...form, pengiriman: e.target.value })}><option>Diantar</option><option>Diambil</option></select></label><label className="full">Catatan<textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} /></label>
            </div>
            {form.metode_pembayaran === "Transfer" && (
              <div className="qris-box">
                <span className="qris-label">Scan QRIS untuk membayar</span>
                {qris ? (
                  <img src={imageUrl(qris)} alt="QRIS Pembayaran" className="qris-image" />
                ) : (
                  <p className="muted small">Foto QRIS belum tersedia. Silakan hubungi admin toko.</p>
                )}
              </div>
            )}
            <div className="form-grid">
              <label className="full">
                Foto bukti pembayaran
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => setBuktiFile(e.target.files?.[0] || null)}
                />
                <small>Opsional. Jika sudah transfer, pilih foto bukti pembayaran (JPG/PNG/WEBP, maksimal 2 MB).</small>
              </label>
            </div><button className="btn btn-primary" disabled={sending}>{sending ? "Mengirim..." : "Pesan Sekarang"}</button></form> : !user ? <Link to="/login" className="btn btn-primary">Masuk untuk Memesan</Link> : <p className="muted">Akun admin tidak dapat membuat pesanan pembeli.</p>}
        </div>
      </div>

      <div className="ulasan-section">
        <h2>Penilaian Produk</h2>

        {ulasanLoading ? (
          <div className="loading-box">Memuat ulasan...</div>
        ) : (
          <div className="ulasan-ringkasan">
            <div className="ulasan-skor">
              <strong>{rataRata > 0 ? rataRata.toFixed(1) : "0.0"}</strong>
              <Bintang value={rataRata} size={20} />
              <span className="muted">{jumlahUlasan} ulasan</span>
            </div>
            <div className="ulasan-distribusi">
              {[5, 4, 3, 2, 1].map((bintang) => {
                const jumlah = distribusi[bintang] || 0;
                const persen = jumlahUlasan > 0 ? Math.round((jumlah / jumlahUlasan) * 100) : 0;
                return (
                  <div className="ulasan-bar-row" key={bintang}>
                    <span>{bintang} ★</span>
                    <div className="ulasan-bar"><div className="ulasan-bar-fill" style={{ width: `${persen}%` }} /></div>
                    <span className="muted">{jumlah}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {user?.role === "pembeli" && (
          <form className="ulasan-form" onSubmit={kirimUlasan}>
            <h4>Beri Ulasan</h4>
            {kirimUlasanError && <div className="alert error">{kirimUlasanError}</div>}
            {kirimUlasanStatus && <div className="alert success">{kirimUlasanStatus}</div>}
            <div className="ulasan-pilih-bintang">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  className={n <= formUlasan.rating ? "bintang-pilih penuh" : "bintang-pilih"}
                  onClick={() => setFormUlasan({ ...formUlasan, rating: n })}
                  aria-label={`${n} bintang`}
                >★</button>
              ))}
            </div>
            <textarea
              placeholder="Ceritakan pengalamanmu dengan produk ini (opsional)"
              value={formUlasan.komentar}
              onChange={(e) => setFormUlasan({ ...formUlasan, komentar: e.target.value })}
            />
            <button className="btn btn-primary" disabled={sendingUlasan}>
              {sendingUlasan ? "Mengirim..." : "Kirim Ulasan"}
            </button>
            <small className="muted">Ulasan hanya bisa dikirim untuk produk yang pernah kamu pesan, satu kali per produk.</small>
          </form>
        )}

        <div className="ulasan-list">
          {(ulasanData?.ulasan || []).map((u) => (
            <div className="ulasan-item" key={u.id}>
              <div className="ulasan-item-head">
                <strong>{u.nama_pembeli || "Pembeli"}</strong>
                <Bintang value={u.rating} size={14} />
                <span className="muted">{new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              {u.komentar && <p>{u.komentar}</p>}
            </div>
          ))}
          {!ulasanLoading && (ulasanData?.ulasan || []).length === 0 && (
            <p className="muted">Belum ada ulasan untuk produk ini.</p>
          )}
        </div>
      </div>
    </section>
  );
}
