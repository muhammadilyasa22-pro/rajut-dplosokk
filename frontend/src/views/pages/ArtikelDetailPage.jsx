import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../../models/api";
import { imageUrl } from "../../config";

export default function ArtikelDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");

    apiFetch(`/artikel/${id}`)
      .then((data) => {
        const article = data?.data || data;
        setItem(article);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <section className="section container">
        <div className="loading-box">Memuat artikel...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section container">
        <div className="alert error">{error}</div>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="section container">
        <div className="alert error">Artikel tidak ditemukan.</div>
      </section>
    );
  }

  return (
    <section className="section container narrow">
      <Link to="/artikel" className="back-link">
        ← Semua artikel
      </Link>

      <article className="article-detail">
        <img
          src={imageUrl(item.gambar)}
          alt={item.judul || "Artikel"}
          onError={(event) => {
            if (event.currentTarget.dataset.fallback === "1") return;
            event.currentTarget.dataset.fallback = "1";
            event.currentTarget.src = imageUrl("default.svg");
          }}
        />

        <p className="eyebrow">ARTIKEL</p>
        <h1>{item.judul}</h1>
        <p className="muted">Toko Pengrajut D-PLOSOKK</p>

        <div className="article-content">
          {String(item.isi || "")
            .split(/\n+/)
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
        </div>
      </article>
    </section>
  );
}
