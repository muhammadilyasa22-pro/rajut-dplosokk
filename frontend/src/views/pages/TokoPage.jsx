import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../models/api";
import { imageUrl } from "../../config";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../controllers/AuthContext";

export default function TokoPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [justAdded, setJustAdded] = useState(null);
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [kataKunci, setKataKunci] = useState("");
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  function tambahKeranjang(product) {
    if (!user) {
      navigate("/login", { state: { from: "/toko" } });
      return;
    }
    if (user.role !== "pembeli") {
      setError("Akun admin tidak dapat menambahkan produk ke keranjang.");
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
    setJustAdded(product.id_produk);
    setTimeout(() => setJustAdded(null), 1500);
  }

  function beliSekarang(product) {
    if (!user) {
      navigate("/login", { state: { from: "/toko" } });
      return;
    }
    if (user.role !== "pembeli") {
      setError("Akun admin tidak dapat membeli produk.");
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

  const produkTampil = products
    .filter((p) => kategoriAktif === "Semua" || (p.kategori || "").trim() === kategoriAktif)
    .filter((p) => {
      const kunci = kataKunci.trim().toLowerCase();
      if (!kunci) return true;
      return (
        (p.nama_produk || "").toLowerCase().includes(kunci) ||
        (p.deskripsi || "").toLowerCase().includes(kunci)
      );
    });

  return (
    <section className="section container">
      <div className="page-intro"><p className="eyebrow">TOKO</p><h1>Produk Toko Pengrajut D-PLOSOKK</h1><p>Silakan pilih produk yang ingin kamu pesan.</p></div>
      {loading && <div className="loading-box">Memuat produk...</div>}
      {error && <div className="alert error">{error}</div>}
      {!loading && !error && (
        <div className="search-box">
          <input
            type="search"
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            placeholder="Cari produk, misalnya: tas rajut..."
            aria-label="Cari produk"
          />
        </div>
      )}
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
            <div className="product-thumb">
              <img src={imageUrl(product.gambar)} alt={product.nama_produk} />
              <span className="tag product-tag-float">{product.kategori}</span>
            </div>
            <div className="product-body">
              <h3>{product.nama_produk}</h3>
              <div className="product-rating">
                {Number(product.jumlah_ulasan) > 0 ? (
                  <>
                    <span className="bintang-row">★</span>
                    <span>{Number(product.rata_rata).toFixed(1)}</span>
                    <span className="muted">· {product.jumlah_ulasan} ulasan{Number(product.jumlah_terjual) > 0 ? ` · ${product.jumlah_terjual} terjual` : ""}</span>
                  </>
                ) : (
                  <span className="muted">Belum ada ulasan</span>
                )}
              </div>
              <strong className="product-price">Rp {Number(product.harga || 0).toLocaleString("id-ID")}</strong>
              <div className="product-actions">
                <Link to={`/produk/${product.id_produk}`} className="btn btn-outline btn-block">Lihat Detail</Link>
                <button type="button" className="btn btn-accent btn-block" onClick={() => tambahKeranjang(product)}>
                  {justAdded === product.id_produk ? "Ditambahkan ✓" : "+ Keranjang"}
                </button>
                <button type="button" className="btn btn-primary btn-block" onClick={() => beliSekarang(product)}>
                  Beli Sekarang
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!loading && !error && produkTampil.length === 0 && (
        <div className="empty-state">
          {products.length === 0
            ? "Belum ada produk."
            : kataKunci.trim()
              ? `Tidak ada produk yang cocok dengan "${kataKunci}".`
              : `Belum ada produk pada kategori "${kategoriAktif}".`}
        </div>
      )}
    </section>
  );
}
