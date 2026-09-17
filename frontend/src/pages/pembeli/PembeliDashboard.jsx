import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../services";
import { useAuth } from "../../context/AuthContext";

const DONE = ["Selesai", "Diterima"];
const CANCELLED = ["Dibatalkan", "Batal"];
const PAID = ["Dibayar", "Sudah Bayar"];

function formatRp(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

export default function PembeliDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await apiFetch("/pembelian/saya");
      setOrders(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err?.message || "Gagal mengambil data pesanan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  const total = orders.length;
  const active = orders.filter((item) => !DONE.includes(item.status) && !CANCELLED.includes(item.status)).length;
  const paid = orders.filter((item) => PAID.includes(item.pembayaran)).length;
  const unpaid = orders.filter((item) => !PAID.includes(item.pembayaran)).length;
  const recent = orders.slice(0, 5);
  const name = user?.nama_d || user?.uname || "Pembeli";

  const cards = [
    ["TOTAL PESANAN", total, "gold", "bi-receipt"],
    ["PESANAN AKTIF", active, "red", "bi-hourglass-split"],
    ["SUDAH BAYAR", paid, "gold", "bi-check2-circle"],
    ["BELUM DIBAYAR", unpaid, "red", "bi-wallet2"],
  ];

  return (
    <div className="buyer-dashboard">
      <div className="page-actions buyer-welcome">
        <div>
          <p className="eyebrow">AREA PEMBELI</p>
          <h2>Dashboard</h2>
          <p>Selamat datang, <strong>{name}</strong>. Pantau pesananmu dari sini.</p>
        </div>
        <Link to="/toko" className="btn btn-primary"><i className="bi bi-bag" /> Belanja di toko</Link>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="loading-box">Memuat ringkasan pesanan...</div>
      ) : (
        <>
          <div className="stats-grid buyer-stats-grid">
            {cards.map(([label, value, tone, icon]) => (
              <div className={`stat-card ${tone}`} key={label}>
                <div className="stat-icon"><i className={`bi ${icon}`} /></div>
                <div className="stat-copy">
                  <span>{label}</span>
                  <strong>{Number(value).toLocaleString("id-ID")}</strong>
                  <small>Data dari transaksi akunmu</small>
                </div>
              </div>
            ))}
          </div>

          <section className="admin-panel buyer-recent-panel">
            <div className="panel-heading">
              <div>
                <h2>Pesanan terbaru</h2>
                <p>Ringkasan transaksi terbaru dari akunmu.</p>
              </div>
              <Link to="/pembeli/pesanan" className="btn btn-outline"><i className="bi bi-arrow-right" /> Lihat semua</Link>
            </div>

            {recent.length === 0 ? (
              <div className="empty-state buyer-empty-state">
                <strong>Belum ada pesanan.</strong>
                <span>Mulai belanja dan pesananmu akan muncul di sini.</span>
                <Link to="/toko" className="btn btn-primary"><i className="bi bi-shop" /> Lihat produk</Link>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="buyer-order-table">
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((item) => (
                      <tr key={item.id ?? item.id_pembelian}>
                        <td>
                          <strong>{item.nama_produk || "Produk"}</strong>
                          <small>Pesanan #{item.id ?? item.id_pembelian}</small>
                        </td>
                        <td>{formatRp(item.harga)}</td>
                        <td><span className="buyer-table-status">{item.status || "Menunggu"}</span></td>
                        <td>{item.pembayaran || "Belum Bayar"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="quick-actions buyer-quick-actions">
            <Link to="/pembeli/pesanan" className="btn btn-outline"><i className="bi bi-receipt" /> Pesanan Saya</Link>
            <Link to="/pembeli/profil" className="btn btn-outline"><i className="bi bi-person-circle" /> Profil Saya</Link>
            <Link to="/toko" className="btn btn-outline"><i className="bi bi-plus-lg" /> Belanja lagi</Link>
          </div>
        </>
      )}
    </div>
  );
}
