import { Link } from "react-router-dom";
import { useCart } from "../../controllers/CartContext";
import { imageUrl } from "../../config";

function formatRp(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export default function ProductCard({ produk }) {
  const { addItem } = useCart();
  const id = produk.id_produk ?? produk.id;
  const nama = produk.nama_produk || produk.nama || "Produk";
  const gambar = produk.gambar || produk.foto;
  const stok = produk.stok;
  const habis = stok !== undefined && stok !== null && Number(stok) <= 0;

  return (
    <div className="card-toko pengrajut h-100 overflow-hidden">
      <Link to={`/produk/${id}`} className="text-decoration-none">
        <div className="card-img-wrap position-relative">
          {gambar ? (
            <img
              src={imageUrl(gambar)}
              alt={nama}
              onError={(event) => {
                if (event.currentTarget.dataset.fallback === "1") return;
                event.currentTarget.dataset.fallback = "1";
                event.currentTarget.src = imageUrl("default.svg");
              }}
            />
          ) : (
            <div className="w-100 h-100 d-flex align-items-center justify-content-center font-display fs-1" style={{ color: "rgba(31,77,61,0.25)" }}>
              {nama.charAt(0).toUpperCase()}
            </div>
          )}
          {habis && (
            <span className="position-absolute top-0 start-0 m-2 badge bg-dark bg-opacity-75 text-uppercase" style={{ fontSize: 10 }}>
              Stok habis
            </span>
          )}
        </div>
      </Link>

      <div className="p-3 nota-edge on-white">
        <Link to={`/produk/${id}`} className="text-decoration-none">
          <h3 className="fs-6 fw-semibold text-dark line-clamp-2 mb-1">{nama}</h3>
        </Link>
        <p className="small text-body-secondary mb-3">{produk.kategori || "Kebutuhan harian"}</p>
        <div className="d-flex align-items-center justify-content-between">
          <span className="price-mono fw-semibold text-pine-dark">{formatRp(produk.harga)}</span>
          <button
            type="button"
            onClick={() => addItem(produk, 1)}
            disabled={habis}
            className="btn btn-accent rounded-circle d-flex align-items-center justify-content-center p-0"
            style={{ width: 36, height: 36 }}
            aria-label={`Tambah ${nama} ke keranjang`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export { formatRp };
