import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../models/api";

function formatRp(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function formatTanggal(value) {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
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
    return [...filtered].sort(
      (a, b) => new Date(b.dibuat_pada || 0) - new Date(a.dibuat_pada || 0)
    );
  }, [filtered]);

  const lunas = filtered.filter((i) => i.pembayaran === "Sudah Bayar");

  const totalPendapatan = lunas.reduce(
    (sum, i) => sum + Number(i.harga || 0),
    0
  );
  const totalTransaksi = filtered.length;
  const totalLunas = lunas.length;
  const totalMenunggu = filtered.filter(
    (i) => i.pembayaran === "Menunggu Verifikasi"
  ).length;
  const totalBelumBayar = filtered.filter(
    (i) => i.pembayaran === "Belum Bayar"
  ).length;

  const perProduk = useMemo(() => {
    const map = new Map();

    for (const item of lunas) {
      const key = item.nama_produk || `Produk #${item.id_produk}`;
      const current = map.get(key) || {
        nama: key,
        jumlah: 0,
        pendapatan: 0
      };

      current.jumlah += 1;
      current.pendapatan += Number(item.harga || 0);
      map.set(key, current);
    }

    return Array.from(map.values()).sort(
      (a, b) => b.pendapatan - a.pendapatan
    );
  }, [lunas]);

  const periodeCetak =
    dariTanggal || sampaiTanggal
      ? `${dariTanggal ? formatTanggal(dariTanggal) : "Awal"} - ${
          sampaiTanggal ? formatTanggal(sampaiTanggal) : "Sekarang"
        }`
      : "Semua transaksi";

  function cetakLaporan() {
    window.print();
  }

  return (
    <div className="laporan-page">
      <style>{`
        .laporan-print-header {
          display: none;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 14mm;
          }

          body {
            background: #fff !important;
            color: #111 !important;
          }

          .admin-sidebar,
          .admin-header,
          .sidebar-overlay,
          .laporan-actions,
          .laporan-filter,
          .alert.error {
            display: none !important;
          }

          .admin-shell,
          .admin-main {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            min-height: 0 !important;
            background: #fff !important;
          }

          .admin-content {
            padding: 0 !important;
            background: #fff !important;
          }

          .laporan-print-header {
            display: block !important;
            text-align: center;
            border-bottom: 2px solid #222;
            padding-bottom: 12px;
            margin-bottom: 18px;
          }

          .laporan-print-header .nama-toko {
            font-size: 19px;
            font-weight: 700;
            letter-spacing: .6px;
          }

          .laporan-print-header .judul {
            font-family: Georgia, serif;
            font-size: 25px;
            margin-top: 5px;
          }

          .laporan-print-header .periode {
            font-size: 11px;
            color: #555;
            margin-top: 5px;
          }

          .page-actions {
            margin-bottom: 12px !important;
          }

          .page-actions h2 {
            font-size: 22px !important;
          }

          .stats-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 8px !important;
          }

          .stat-card {
            min-height: 82px !important;
            padding: 12px !important;
            border: 1px solid #ddd !important;
            break-inside: avoid;
          }

          .stat-card span {
            font-size: 8px !important;
          }

          .stat-card strong {
            font-size: 16px !important;
            margin-top: 7px !important;
          }

          .table-card {
            border: 1px solid #ddd !important;
            box-shadow: none !important;
            margin-top: 12px !important;
            break-inside: auto;
          }

          .table-wrap {
            overflow: visible !important;
            padding: 0 !important;
          }

          table {
            min-width: 0 !important;
            width: 100% !important;
            font-size: 9px !important;
          }

          th,
          td {
            padding: 6px 5px !important;
            font-size: 9px !important;
            border-bottom: 1px solid #ddd !important;
          }

          th {
            color: #222 !important;
          }

          .laporan-detail-heading {
            font-family: Georgia, serif;
            font-size: 16px !important;
            margin: 18px 0 8px !important;
            break-after: avoid;
          }

          .status-pill {
            border: 1px solid #bbb !important;
            background: #fff !important;
            color: #111 !important;
            padding: 2px 5px !important;
            font-size: 8px !important;
          }

          .muted {
            color: #555 !important;
          }
        }
      `}</style>

      <div className="laporan-print-header">
        <div className="nama-toko">TOKO PENGRAJUT D-PLOSOKK</div>
        <div className="judul">Laporan Penjualan</div>
        <div className="periode">Periode: {periodeCetak}</div>
      </div>

      <div className="page-actions">
        <div>
          <h2>Laporan Penjualan</h2>
          <p>Ringkasan transaksi yang sudah lunas</p>
        </div>

        <div className="laporan-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={cetakLaporan}
            disabled={loading || filtered.length === 0}
            title="Cetak laporan penjualan"
          >
            <i className="bi bi-printer" style={{ marginRight: 7 }} />
            Cetak Laporan
          </button>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <section className="admin-panel form-panel laporan-filter">
        <h3>Filter Tanggal</h3>
        <div className="inline-form">
          <label>
            Dari
            <input
              type="date"
              value={dariTanggal}
              onChange={(e) => setDariTanggal(e.target.value)}
            />
          </label>
          <label>
            Sampai
            <input
              type="date"
              value={sampaiTanggal}
              onChange={(e) => setSampaiTanggal(e.target.value)}
            />
          </label>
          {(dariTanggal || sampaiTanggal) && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setDariTanggal("");
                setSampaiTanggal("");
              }}
            >
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
                <tr>
                  <th>Produk</th>
                  <th>Terjual (Lunas)</th>
                  <th>Pendapatan</th>
                </tr>
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
                  <tr>
                    <td colSpan={3} className="muted">
                      Belum ada transaksi lunas pada rentang ini.
                    </td>
                  </tr>
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
                    const waktu = item.dibuat_pada
                      ? new Date(item.dibuat_pada)
                      : null;

                    return (
                      <tr key={item.id}>
                        <td>
                          {waktu
                            ? waktu.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              })
                            : "-"}
                        </td>
                        <td>
                          {waktu
                            ? waktu.toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : "-"}
                        </td>
                        <td>{item.nama_pembeli || item.uname || "-"}</td>
                        <td>{item.nama_produk}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              item.pembayaran === "Sudah Bayar"
                                ? "hijau"
                                : item.pembayaran === "Menunggu Verifikasi"
                                  ? "kuning"
                                  : "abu"
                            }`}
                          >
                            {item.pembayaran}
                          </span>
                        </td>
                        <td>{formatRp(item.harga)}</td>
                      </tr>
                    );
                  })}
                  {terbaruDulu.length === 0 && (
                    <tr>
                      <td colSpan={6} className="muted">
                        Belum ada transaksi pada rentang ini.
                      </td>
                    </tr>
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
