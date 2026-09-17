import { Link } from "react-router-dom";
import { imageUrl } from "../config";

export default function ArticleCard({ artikel }) {
  const id = artikel.id ?? artikel.id_artikel;
  const tanggal = artikel.created_at ? new Date(artikel.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : null;
  return (
    <Link to={`/artikel/${id}`} className="card-toko pengrajut h-100 text-decoration-none d-block overflow-hidden">
      <div className="ratio ratio-16x9 bg-paper-2">
        <img src={imageUrl(artikel.gambar)} alt={artikel.judul || "Artikel"} style={{ objectFit: "cover" }} onError={(e) => {
          if (e.currentTarget.dataset.fallback === "1") return;
          e.currentTarget.dataset.fallback = "1";
          e.currentTarget.src = imageUrl("default.svg");
        }} />
      </div>
      <div className="p-3 p-md-4">
        {tanggal && <p className="small text-marigold fw-semibold text-uppercase mb-2" style={{ letterSpacing: "0.05em" }}>{tanggal}</p>}
        <h3 className="font-display fw-semibold fs-5 text-dark mb-2">{artikel.judul}</h3>
        {artikel.ringkasan && <p className="small text-body-secondary line-clamp-2 mb-0">{artikel.ringkasan}</p>}
      </div>
    </Link>
  );
}
