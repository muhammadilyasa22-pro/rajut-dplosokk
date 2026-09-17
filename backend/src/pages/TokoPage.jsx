import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services";
import { imageUrl } from "../config";

export default function TokoPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/produk")
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section container">
      <div className="page-intro"><p className="eyebrow">TOKO</p><h1>Produk Toko Pengrajut D-PLOSOKK</h1><p>Silakan pilih produk yang ingin kamu pesan.</p></div>
      {loading && <div className="loading-box">Memuat produk...</div>}
      {error && <div className="alert error">{error}</div>}
      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product.id_produk}>
            <img src={imageUrl(product.gambar)} alt={product.nama_produk} />
            <div className="product-body"><span className="tag">{product.kategori}</span><h3>{product.nama_produk}</h3><p>{product.deskripsi}</p><strong>Rp {Number(product.harga || 0).toLocaleString("id-ID")}</strong><Link to={`/produk/${product.id_produk}`} className="btn btn-primary btn-block">Lihat Detail</Link></div>
          </article>
        ))}
      </div>
      {!loading && !error && products.length === 0 && <div className="empty-state">Belum ada produk.</div>}
    </section>
  );
}
