import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../models/api";
import { imageUrl } from "../../config";
import { useCart } from "../../context/CartContext";

export default function TokoPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [justAdded, setJustAdded] = useState(null);
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const { addItem } = useCart();

  function tambahKeranjang(product) {
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
    setJustAdded(product.id_produk);
    setTimeout(() => setJustAdded(null), 1500);
  }

  useEffect(() => {
    apiFetch("/produk")
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const kategoriList = [
    "Semua",
    ...Array.from(
      new Set(
        products
          .map((p) => (p.kategori || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b))
  ];

  const produkTampil =
    kategoriAktif === "Semua"
      ? products
      : products.filter((p) => (p.kategori || "").trim() === kategoriAktif);

  return (
    <section className="section container">
      <div className="page-intro"><p className="eyebrow">TOKO</p><h1>Produk Toko Pengrajut D-PLOSOKK</h1><p>Silakan pilih produk yang ingin kamu pesan.</p></div>
      {loading && <div className="loading-box">Memuat produk...</div>}
      {error && <div className="alert error">{error}</div>}
      {!loading && !error && kategoriList.length > 1 && (
        <div className="kategori-filter">
          {kategoriList.map((kategori) => (
            <button
              key={kategori}
              type="button"
              className={`kategori-chip ${kategoriAktif === kategori ? "active" : ""}`}
              onClick={() => setKategoriAktif(kategori)}
            >
              {kategori}
            </button>
          ))}
        </div>
      )}
      <div className="product-grid">
        {produkTampil.map((product) => (
          <article className="product-card" key={product.id_produk}>
            <img src={imageUrl(product.gambar)} alt={product.nama_produk} />
            <div className="product-body"><span className="tag">{product.kategori}</span><h3>{product.nama_produk}</h3><p>{product.deskripsi}</p><strong>Rp {Number(product.harga || 0).toLocaleString("id-ID")}</strong>
              <div className="product-actions">
                <Link to={`/produk/${product.id_produk}`} className="btn btn-outline btn-block">Lihat Detail</Link>
                <button type="button" className="btn btn-accent btn-block" onClick={() => tambahKeranjang(product)}>
                  {justAdded === product.id_produk ? "Ditambahkan ✓" : "+ Keranjang"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!loading && !error && produkTampil.length === 0 && (
        <div className="empty-state">
          {products.length === 0 ? "Belum ada produk." : `Belum ada produk pada kategori "${kategoriAktif}".`}
        </div>
      )}
    </section>
  );
}
