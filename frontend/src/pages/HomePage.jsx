import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../services";
import { imageUrl } from "../config";
import logo from "../assets/logo-dplosokk.png";
import heroCraft from "../assets/hero-craft.svg";

export default function HomePage() {
  const [artikel, setArtikel] = useState([]);
  const [loadingArtikel, setLoadingArtikel] = useState(true);

  useEffect(() => {
    apiFetch("/artikel")
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];
        setArtikel(list.slice(0, 3));
      })
      .catch((error) => {
        console.error("Gagal mengambil artikel beranda:", error);
        setArtikel([]);
      })
      .finally(() => setLoadingArtikel(false));
  }, []);

  return (
    <>
      <section className="home-premium-hero">
        <div className="home-hero-orb home-hero-orb-one" />
        <div className="home-hero-orb home-hero-orb-two" />
        <div className="container home-premium-grid">
          <div className="home-premium-copy">
            <p className="eyebrow">MILIK BU ENDANG</p>
            <h1>
              <span>Selamat datang</span>
              <span>di Toko Pengrajut</span>
              <span>D-PLOSOKK</span>
            </h1>
            <p className="hero-text">
              Temukan karya rajut handmade yang dibuat dengan teliti. Pilih produk,
              lakukan pemesanan, dan pantau status pesanan dari akun pembeli.
            </p>
            <div className="hero-actions">
              <Link to="/toko" className="btn btn-primary btn-lg">
                Lihat Produk
              </Link>
              <Link to="/artikel" className="btn btn-outline btn-lg">
                Baca Artikel
              </Link>
            </div>
          </div>

          <div className="home-visual-wrap">
            <div className="hero-logo-card home-logo-premium">
              <img src={logo} alt="Logo Toko Pengrajut D-PLOSOKK" />
            </div>
            <div className="home-craft-photo">
              <img src={heroCraft} alt="Koleksi rajut Toko Pengrajut D-PLOSOKK" />
            </div>
          </div>
        </div>
      </section>

      <section className="home-benefit-strip">
        <div className="container home-benefit-grid">
          <div className="home-benefit-item">
            <span className="home-benefit-icon icon-bag" aria-hidden="true" />
            <div>
              <strong>Karya handmade</strong>
              <p>Setiap produk dibuat dengan detail dan karakter yang unik.</p>
            </div>
          </div>
          <div className="home-benefit-item">
            <span className="home-benefit-icon icon-phone" aria-hidden="true" />
            <div>
              <strong>Pesan mudah</strong>
              <p>Pilih produk rajut dan kirim pesanan secara praktis.</p>
            </div>
          </div>
          <div className="home-benefit-item">
            <span className="home-benefit-icon icon-box" aria-hidden="true" />
            <div>
              <strong>Pesanan terpantau</strong>
              <p>Status pembayaran dan proses pesanan dapat dilihat kembali.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section container home-why-section">
        <div className="section-heading home-section-title">
          <div>
            <p className="eyebrow">KENAPA D-PLOSOKK?</p>
            <h2>Rajutan yang dibuat dengan hati</h2>
          </div>
        </div>

        <div className="feature-grid home-feature-premium-grid">
          <article className="feature-card home-feature-premium-card">
            <b>01</b>
            <span className="feature-visual feature-visual-products" aria-hidden="true" />
            <div>
              <h3>Detail produk</h3>
              <p>Nama, kategori, harga, gambar, dan deskripsi produk tersedia dengan jelas.</p>
            </div>
          </article>
          <article className="feature-card home-feature-premium-card">
            <b>02</b>
            <span className="feature-visual feature-visual-order" aria-hidden="true" />
            <div>
              <h3>Pesan praktis</h3>
              <p>Pembeli dapat memilih karya rajut dan membuat pesanan dari halaman produk.</p>
            </div>
          </article>
          <article className="feature-card home-feature-premium-card">
            <b>03</b>
            <span className="feature-visual feature-visual-track" aria-hidden="true" />
            <div>
              <h3>Proses terpantau</h3>
              <p>Status pembayaran dan pesanan dapat dipantau melalui akun pembeli.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="section container home-journal-section">
        <div className="section-heading home-article-heading">
          <div>
            <p className="eyebrow">DARI PENGRAJIN</p>
            <h2>Artikel &amp; Info Terbaru</h2>
            <p>Cerita tentang proses merajut, perawatan produk, inspirasi hadiah, dan karya handmade D-PLOSOKK.</p>
          </div>
          <Link to="/artikel" className="back-link home-all-link">
            Lihat semua →
          </Link>
        </div>

        {loadingArtikel ? (
          <div className="loading-box">Memuat artikel...</div>
        ) : artikel.length === 0 ? (
          <div className="empty-state">
            Belum ada artikel. Artikel yang dibuat admin akan muncul di sini.
          </div>
        ) : (
          <div className="article-grid home-article-premium-grid">
            {artikel.map((item, index) => {
              const id = item.id ?? item.id_artikel;
              return (
                <article className="home-article-card" key={id}>
                  <div className="home-article-image-wrap">
                    <img
                      src={imageUrl(item.gambar)}
                      alt={item.judul || "Artikel"}
                      onError={(event) => {
                        event.currentTarget.src = imageUrl("default.svg");
                      }}
                    />
                    <span className="home-article-index">0{index + 1}</span>
                  </div>
                  <div className="home-article-card-body">
                    <span className="tag article-new-badge">Artikel Baru</span>
                    <h2>{item.judul}</h2>
                    <p>
                      {String(item.ringkasan || item.isi || "").slice(0, 150)}
                      {String(item.ringkasan || item.isi || "").length > 150
                        ? "..."
                        : ""}
                    </p>
                    <Link to={`/artikel/${id}`} className="back-link">
                      Baca selengkapnya →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
