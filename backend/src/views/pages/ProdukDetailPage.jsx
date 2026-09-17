import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../models/api";
import { imageUrl } from "../../config";
import { useAuth } from "../../controllers/AuthContext";
import { useCart } from "../../context/CartContext";

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

  useEffect(() => {
    apiFetch(`/produk/${id}`).then(setProduct).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) {
      setForm((current) => ({ ...current, nama_pembeli: `${user.nama_d || ""} ${user.nama_b || ""}`.trim(), alamat_pembeli: user.alamat || "", phone_pembeli: user.phone || "" }));
    }
  }, [user]);

  function tambahKeranjang() {
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

  if (loading) return <div className="container section"><div className="loading-box">Memuat detail...</div></div>;
  if (error) return <div className="container section"><div className="alert error">{error}</div></div>;
  if (!product) return null;

  return (
    <section className="section container">
      <Link to="/toko" className="back-link">← Kembali ke toko</Link>
      <div className="detail-grid">
        <div className="detail-image"><img src={imageUrl(product.gambar)} alt={product.nama_produk} /></div>
        <div className="detail-copy"><span className="tag">{product.kategori}</span><h1>{product.nama_produk}</h1><div className="price">Rp {Number(product.harga || 0).toLocaleString("id-ID")}</div>
          <button type="button" className="btn btn-accent" onClick={tambahKeranjang}>
            {addedToCart ? "Ditambahkan ke keranjang ✓" : "+ Tambah ke Keranjang"}
          </button>
          <p>{product.deskripsi}</p>
          {user?.role === "pembeli" ? <form className="order-form" onSubmit={order}><h3>Buat Pesanan</h3>{message && <div className="alert success">{message}</div>}<div className="form-grid"><label>Nama<input value={form.nama_pembeli} onChange={(e) => setForm({ ...form, nama_pembeli: e.target.value })} required /></label><label>Telepon<input value={form.phone_pembeli} onChange={(e) => setForm({ ...form, phone_pembeli: e.target.value })} required /></label><label className="full">Alamat<textarea value={form.alamat_pembeli} onChange={(e) => setForm({ ...form, alamat_pembeli: e.target.value })} required /></label><label>Metode pembayaran<select value={form.metode_pembayaran} onChange={(e) => setForm({ ...form, metode_pembayaran: e.target.value })}><option>Transfer</option><option>COD</option></select></label><label>Pengiriman<select value={form.pengiriman} onChange={(e) => setForm({ ...form, pengiriman: e.target.value })}><option>Diantar</option><option>Diambil</option></select></label><label className="full">Catatan<textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} /></label>
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
    </section>
  );
}
