import { imageUrl } from "../config";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getArtikelById } from "../services/api";
import Spinner from "../components/Spinner";

export default function ArtikelDetail() {
  const { id } = useParams();
  const [artikel, setArtikel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getArtikelById(id)
      .then((res) => setArtikel(res.data?.data || res.data))
      .catch(() => setArtikel(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!artikel) {
    return (
      <div className="container text-center py-5">
        <p className="font-display fs-4 mb-2">Artikel tidak ditemukan</p>
        <Link to="/artikel" className="text-pine fw-semibold small text-decoration-none">← Kembali ke artikel</Link>
      </div>
    );
  }

  const tanggal = artikel.created_at
    ? new Date(artikel.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <article className="container py-5" style={{ maxWidth: 680 }}>
      <Link to="/artikel" className="small text-body-secondary text-decoration-none d-inline-flex align-items-center gap-1 mb-4">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
        Semua artikel
      </Link>

      {tanggal && <p className="small text-marigold fw-semibold text-uppercase mb-3" style={{ letterSpacing: "0.1em" }}>{tanggal}</p>}
      <h1 className="font-display mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", lineHeight: 1.2 }}>{artikel.judul}</h1>

      {artikel.gambar && (
        <div className="ratio ratio-16x9 bg-paper-2 rounded-4 overflow-hidden mb-4">
          <img src={imageUrl(artikel.gambar)} alt={artikel.judul} style={{ objectFit: "cover" }} />
        </div>
      )}

      <div className="text-body-secondary" style={{ whiteSpace: "pre-line", lineHeight: 1.75 }}>
        {artikel.konten || artikel.isi}
      </div>
    </article>
  );
}
