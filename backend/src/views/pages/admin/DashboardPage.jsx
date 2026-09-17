import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../../models/api";

const INITIAL_STATS = {
  total_pembeli: 0,
  total_pembelian: 0,
  total_produk: 0,
  total_artikel: 0,
  produk_terjual: 0,
  pesanan_aktif: 0,
  belum_dibayar: 0,
  total_pendapatan: 0,
};

function formatRp(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/admin/dashboard");
      const source = data?.statistik || data || {};

      setStats({
        ...INITIAL_STATS,
        ...source,
      });

      setRecent(
        Array.isArray(data?.pembelian_terbaru)
          ? data.pembelian_terbaru.slice(0, 5)
          : []
      );
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err?.message || "Gagal mengambil dashboard admin");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const cards = [
    ["PEMBELI TERDAFTAR", stats.total_pembeli, "gold", "bi-people"],
    ["TOTAL TRANSAKSI", stats.total_pembelian, "dark", "bi-receipt"],
    ["PRODUK DI KATALOG", stats.total_produk, "gold", "bi-box-seam"],
    ["PRODUK TERJUAL", stats.produk_terjual, "gold", "bi-bag-check"],
    ["ARTIKEL", stats.total_artikel, "dark", "bi-newspaper"],
    ["PESAN KONTAK", stats.total_pesan_kontak ?? 0, "dark", "bi-chat-dots"],
    ["PESANAN AKTIF", stats.pesanan_aktif, "red", "bi-hourglass-split"],
    ["BELUM DIBAYAR", stats.belum_dibayar, "red", "bi-wallet2"],
  ];

  return (
    <div>
      <div className="page-actions">
        <div>
          <h2>Dashboard</h2>
          <p>Ringkasan aktivitas Toko Pengrajut D-PLOSOKK.</p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="loading-box">Memuat dashboard...</div>
      ) : (
        <>
          <div className="stats-grid">
            {cards.map(([label, value, tone, icon]) => (
              <div className={`stat-card ${tone}`} key={label}>
                <div className="stat-icon"><i className={`bi ${icon}`} /></div>
                <div className="stat-copy">
                  <span>{label}</span>
                  <strong>{Number(value || 0).toLocaleString("id-ID")}</strong>
                </div>
              </div>
            ))}
          </div>

          <section className="admin-panel revenue">
            <div>
              <h2>Pendapatan (selesai)</h2>
              <p>Total nilai produk dari pesanan dengan status Selesai.</p>
            </div>
            <strong>{formatRp(stats.total_pendapatan)}</strong>
          </section>

          <section className="admin-panel">
            <div className="panel-heading">
              <div>
                <h2>Transaksi terbaru</h2>
                <p>Pesanan terbaru dari pelanggan.</p>
              </div>
              <Link to="/admin/pesanan" className="btn btn-outline">
                <i className="bi bi-arrow-right" /> Lihat semua
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="empty-state">Belum ada pesanan terbaru.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Pembeli</th>
                      <th>Status</th>
                      <th>Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((item) => (
                      <tr key={item.id}>
                        <td>{item.nama_produk || "-"}</td>
                        <td>{item.uname || item.nama_pembeli || "-"}</td>
                        <td>{item.status || "-"}</td>
                        <td>{item.pembayaran || "Belum Bayar"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="quick-actions">
            <Link to="/admin/produk" className="btn btn-outline">
              <i className="bi bi-plus-lg" /> Tambah produk
            </Link>
            <Link to="/admin/artikel" className="btn btn-outline">
              <i className="bi bi-pencil-square" /> Tulis artikel
            </Link>
            <Link to="/admin/info-toko" className="btn btn-outline">
              <i className="bi bi-shop" /> Atur info toko
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
