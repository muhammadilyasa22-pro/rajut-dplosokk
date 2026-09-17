import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services";
import { imageUrl } from "../config";

function excerpt(item, length = 155) {
  const text = String(item.ringkasan || item.isi || "").replace(/\s+/g, " ").trim();
  return text.length > length ? `${text.slice(0, length).trim()}...` : text;
}

function articleDate(item) {
  if (!item.created_at && !item.tanggal) return "Cerita terbaru";
  const value = item.created_at || item.tanggal;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Cerita terbaru";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArtikelListPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    apiFetch("/artikel")
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];
        setItems(list);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      [item.judul, item.ringkasan, item.isi]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [items, keyword]);

  const featured = filteredItems[0];
  const otherItems = filteredItems.slice(1);

  return (
    <section className="article-premium-page">
      <div className="article-premium-hero">
        <div className="container">
          <div className="article-premium-hero__content">
            <div>
              <p className="eyebrow">RAJUT JOURNAL</p>
              <h1>Cerita &amp; Karya<br />dari D-PLOSOKK</h1>
              <p className="article-premium-hero__text">
                Temukan cerita seputar rajutan, inspirasi karya, dan kabar terbaru dari
                Toko Pengrajut D-PLOSOKK dalam satu tempat yang nyaman untuk dibaca.
              </p>
            </div>

            <div className="article-premium-search">
              <span aria-hidden="true">⌕</span>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Cari artikel atau cerita..."
                aria-label="Cari artikel"
              />
            </div>
          </div>

          <div className="article-premium-meta">
            <span><b>{items.length}</b> Artikel tersedia</span>
            <span>•</span>
            <span>Resep, cerita &amp; inspirasi dari toko pengrajut</span>
          </div>
        </div>
      </div>

      <div className="container article-premium-content">
        {loading && <div className="article-loading-premium">Memuat cerita terbaik untuk Anda...</div>}
        {error && <div className="alert error">{error}</div>}

        {!loading && !error && featured && (
          <>
            <div className="article-section-heading">
              <div>
                <p className="eyebrow">PILIHAN UTAMA</p>
                <h2>Artikel terbaru</h2>
              </div>
              <span className="article-section-count">{filteredItems.length} cerita ditemukan</span>
            </div>

            <article className="article-featured-card">
              <div className="article-featured-card__image-wrap">
                <img
                  src={imageUrl(featured.gambar)}
                  alt={featured.judul || "Artikel"}
                  onError={(event) => {
                    if (event.currentTarget.dataset.fallback === "1") return;
                    event.currentTarget.dataset.fallback = "1";
                    event.currentTarget.src = imageUrl("default.svg");
                  }}
                />
                <span className="article-featured-card__badge">FEATURED</span>
              </div>

              <div className="article-featured-card__body">
                <div className="article-card-topline">
                  <span>Artikel D-PLOSOKK</span>
                  <span>{articleDate(featured)}</span>
                </div>
                <h2>{featured.judul}</h2>
                <p>{excerpt(featured, 230)}</p>
                <Link to={`/artikel/${featured.id ?? featured.id_artikel}`} className="article-read-button">
                  Baca artikel lengkap <span>→</span>
                </Link>
              </div>
            </article>
          </>
        )}

        {!loading && !error && otherItems.length > 0 && (
          <>
            <div className="article-section-heading article-section-heading--grid">
              <div>
                <p className="eyebrow">JELAJAHI LEBIH BANYAK</p>
                <h2>Cerita lainnya</h2>
              </div>
            </div>

            <div className="article-premium-grid">
              {otherItems.map((item, index) => {
                const id = item.id ?? item.id_artikel;
                return (
                  <article className="article-premium-card" key={id}>
                    <Link to={`/artikel/${id}`} className="article-premium-card__image-wrap">
                      <img
                        src={imageUrl(item.gambar)}
                        alt={item.judul || "Artikel"}
                        onError={(event) => {
                          if (event.currentTarget.dataset.fallback === "1") return;
                          event.currentTarget.dataset.fallback = "1";
                          event.currentTarget.src = imageUrl("default.svg");
                        }}
                      />
                      <span className="article-card-number">0{index + 2}</span>
                    </Link>

                    <div className="article-premium-card__body">
                      <div className="article-card-topline">
                        <span>ARTIKEL</span>
                        <span>{articleDate(item)}</span>
                      </div>
                      <h3>{item.judul}</h3>
                      <p>{excerpt(item, 125)}</p>
                      <Link to={`/artikel/${id}`} className="article-text-link">
                        Selengkapnya <span>→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="article-empty-premium">
            <div>⌕</div>
            <h2>{items.length === 0 ? "Belum ada artikel" : "Artikel tidak ditemukan"}</h2>
            <p>
              {items.length === 0
                ? "Artikel dari Toko Pengrajut D-PLOSOKK akan tampil di halaman ini."
                : "Coba gunakan kata kunci lain untuk menemukan artikel yang Anda cari."}
            </p>
            {keyword && (
              <button className="btn btn-outline" onClick={() => setKeyword("")}>
                Reset pencarian
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
