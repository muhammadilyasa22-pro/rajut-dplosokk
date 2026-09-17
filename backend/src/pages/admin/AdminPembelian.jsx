import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getPembelian, updatePembelianStatus } from "../../services/api";
import { formatRp } from "../../components/ProductCard";
import Spinner from "../../components/Spinner";

const STATUS_CLASS = {
  pending: "badge-pending",
  diproses: "badge-diproses",
  selesai: "badge-selesai",
  batal: "badge-batal",
};

export default function AdminPembelian() {
  const [pembelian, setPembelian] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getPembelian()
      .then((res) => setPembelian(res.data?.data || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleStatus(id, status) {
    setPembelian((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      await updatePembelianStatus(id, status);
    } catch {
      load();
    }
  }

  return (
    <AdminLayout>
      <h1 className="font-display fs-3 mb-1">Pesanan Masuk</h1>
      <p className="small text-body-secondary mb-4">Kelola status pesanan dari pelanggan.</p>

      {loading ? (
        <Spinner />
      ) : pembelian.length === 0 ? (
        <p className="small text-body-secondary">Belum ada pesanan.</p>
      ) : (
        <div className="card-toko pengrajut overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="small text-uppercase text-body-secondary" style={{ backgroundColor: "var(--paper-2)" }}>
                  <th className="px-3 py-3 fw-medium">No. Pesanan</th>
                  <th className="px-3 py-3 fw-medium">Pelanggan</th>
                  <th className="px-3 py-3 fw-medium">Total</th>
                  <th className="px-3 py-3 fw-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {pembelian.map((o) => (
                  <tr key={o.id}>
                    <td className="px-3 py-3 price-mono text-body-secondary">#{o.id}</td>
                    <td className="px-3 py-3 fw-medium">{o.nama_pelanggan || o.uname || "—"}</td>
                    <td className="px-3 py-3 price-mono text-pine-dark">{formatRp(o.total)}</td>
                    <td className="px-3 py-3">
                      <select
                        value={o.status || "pending"}
                        onChange={(e) => handleStatus(o.id, e.target.value)}
                        className={`form-select form-select-sm rounded-pill fw-semibold border-0 ${STATUS_CLASS[o.status] || STATUS_CLASS.pending}`}
                        style={{ width: "auto" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="diproses">Diproses</option>
                        <option value="selesai">Selesai</option>
                        <option value="batal">Dibatalkan</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
