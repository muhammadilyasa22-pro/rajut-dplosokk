import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getProduk, getPembelian } from "../../services/api";
import { formatRp } from "../../components/ProductCard";
import Spinner from "../../components/Spinner";

export default function AdminDashboard() {
  const [produk, setProduk] = useState([]);
  const [pembelian, setPembelian] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProduk(), getPembelian()])
      .then(([pRes, oRes]) => {
        setProduk(pRes.data?.data || pRes.data || []);
        setPembelian(oRes.data?.data || oRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalOmzet = pembelian.reduce((sum, o) => sum + (o.total || 0), 0);
  const stokMenipis = produk.filter((p) => (p.stok ?? 0) <= 5).length;
  const pesananBaru = pembelian.filter((o) => (o.status || "pending") === "pending").length;

  const stats = [
    { label: "Total Produk", value: produk.length },
    { label: "Total Pesanan", value: pembelian.length },
    { label: "Pesanan Baru", value: pesananBaru },
    { label: "Stok Menipis", value: stokMenipis },
  ];

  return (
    <AdminLayout>
      <h1 className="font-display fs-3 mb-1">Ringkasan Toko Pengrajut</h1>
      <p className="small text-body-secondary mb-4">Pantau produk dan pesanan dari satu tempat.</p>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="row g-3 mb-4">
            {stats.map((s) => (
              <div key={s.label} className="col-6 col-lg-3">
                <div className="nota-edge on-white card-toko pengrajut p-3 h-100">
                  <p className="price-mono fs-3 fw-semibold text-pine-dark mb-1">{s.value}</p>
                  <p className="small text-body-secondary mb-0">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card-toko pengrajut p-4">
            <p className="price-mono small text-uppercase text-body-secondary mb-3 pb-3 border-bottom border-dashed" style={{ letterSpacing: "0.1em", fontSize: 11 }}>
              *** Total Omzet Tercatat ***
            </p>
            <p className="price-mono fs-2 fw-semibold text-pine-dark mb-0">{formatRp(totalOmzet)}</p>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
