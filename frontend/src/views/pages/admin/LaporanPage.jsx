import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../models/api";

function formatRp(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

export default function LaporanPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dariTanggal, setDariTanggal] = useState("");
  const [sampaiTanggal, setSampaiTanggal] = useState("");

  useEffect(() => {
    apiFetch("/admin/pembelian")
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (!item.dibuat_pada) return true;
      const tgl = new Date(item.dibuat_pada);
      if (dariTanggal && tgl < new Date(dariTanggal)) return false;
      if (sampaiTanggal && tgl > new Date(`${sampaiTanggal}T23:59:59`)) return false;
      return true;
    });
  }, [items, dariTanggal, sampaiTanggal]);

  const terbaruDulu = useMemo(() => {
    return [...filtered].sort((a, b) => new Date(b.dibuat_pada || 0) - new Date(a.dibuat_pada || 0));
  }, [filtered]);

  const lunas = filtered.filter((i) => i.pembayaran === "Sudah Bayar");

  const totalPendapatan = lunas.reduce((sum, i) => sum + Number(i.harga || 0), 0);
  const totalTransaksi = filtered.length;
  const totalLunas = lunas.length;
  const totalMenunggu = filtered.filter((i) => i.pembayaran === "Menunggu Verifikasi").length;
  const totalBelumBayar = filtered.filter((i) => i.pembayaran === "Belum Bayar").length;

  const perProduk = useMemo(() => {
    const map = new Map();
    for (const item of lunas) {
      const key = item.nama_produk || `Produk #${item.id_produk}`;
      const current = map.get(key) || { nama: key, jumlah: 0, pendapatan: 0 };
      current.jumlah += 1;
      current.pendapatan += Number(item.harga || 0);
      map.set(key, current);
    }
    return Array.from(map.values()).sort((a, b) => b.pendapatan - a.pendapatan);
  }, [lunas]);

  return (
    <div>
      <div className="page-actions">
        <div><h2>Laporan Penjualan</h2><p>Ringkasan transaksi yang sudah lunas</p></div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <section className="admin-panel form-panel">
        <h3>Filter Tanggal</h3>
        <div className="inline-form">
          <label>
            Dari
            <input type="date" value={dariTanggal} onChange={(e) => setDariTanggal(e.target.value)} />
          </label>
          <label>
            Sampai
            <input type="date" value={sampaiTanggal} onChange={(e) => setSampaiTanggal(e.target.value)} />
          </label>
          {(dariTanggal || sampaiTanggal) && (
            <button type="button" className="btn btn-outline" onClick={() => { setDariTanggal(""); setSampaiTanggal(""); }}>
              Reset
            </button>
          )}
        </div>
      </section>

      {loading ? (
        <div className="loading-box">Memuat laporan...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card gold">
              <span>TOTAL PENDAPATAN (LUNAS)</span>
              <strong>{formatRp(totalPendapatan)}</strong>
            </div>
            <div className="stat-card dark">
              <span>TOTAL TRANSAKSI</span>
              <strong>{totalTransaksi}</strong>
            </div>
            <div className="stat-card gold">
              <span>SUDAH LUNAS</span>
              <strong>{totalLunas}</strong>
            </div>
            <div className="stat-card gold">
              <span>MENUNGGU / BELUM BAYAR</span>
              <strong>{totalMenunggu + totalBelumBayar}</strong>
            </div>
          </div>

          <div className="table-card" style={{ marginTop: 24 }}>
            <table>
              <thead>
                <tr><th>Produk</th><th>Terjual (Lunas)</th><th>Pendapatan</th></tr>
              </thead>
              <tbody>
                {perProduk.map((row) => (
                  <tr key={row.nama}>
                    <td>{row.nama}</td>
                    <td>{row.jumlah}</td>
                    <td>{formatRp(row.pendapatan)}</td>
                  </tr>
                ))}
                {perProduk.length === 0 && (
                  <tr><td colSpan={3} className="muted">Belum ada transaksi lunas pada rentang ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <h3 className="laporan-detail-heading">Detail Transaksi</h3>
          <div className="table-card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Jam</th>
                    <th>Pembeli</th>
                    <th>Produk</th>
                    <th>Status Pembayaran</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {terbaruDulu.map((item) => {
                    const waktu = item.dibuat_pada ? new Date(item.dibuat_pada) : null;
                    return (
                      <tr key={item.id}>
                        <td>{waktu ? waktu.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}</td>
                        <td>{waktu ? waktu.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                        <td>{item.nama_pembeli || item.uname || "-"}</td>
                        <td>{item.nama_produk}</td>
                        <td>
                          <span className={`status-pill ${item.pembayaran === "Sudah Bayar" ? "hijau" : item.pembayaran === "Menunggu Verifikasi" ? "kuning" : "abu"}`}>
                            {item.pembayaran}
                          </span>
                        </td>
                        <td>{formatRp(item.harga)}</td>
                      </tr>
                    );
                  })}
                  {terbaruDulu.length === 0 && (
                    <tr><td colSpan={6} className="muted">Belum ada transaksi pada rentang ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
