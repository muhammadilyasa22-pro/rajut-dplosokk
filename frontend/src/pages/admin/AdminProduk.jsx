import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { getProduk, createProduk, updateProduk, deleteProduk } from "../../services/api";
import { formatRp } from "../../components/ProductCard";
import Spinner from "../../components/Spinner";

const emptyForm = { nama: "", kategori: "", harga: "", stok: "", deskripsi: "", foto: "" };

export default function AdminProduk() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    getProduk()
      .then((res) => setProduk(res.data?.data || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditingId(p.id);
    setForm({
      nama: p.nama || "",
      kategori: p.kategori || "",
      harga: p.harga || "",
      stok: p.stok || "",
      deskripsi: p.deskripsi || "",
      foto: p.foto || "",
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, harga: Number(form.harga), stok: Number(form.stok) };
      if (editingId) {
        await updateProduk(editingId, payload);
      } else {
        await createProduk(payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message || "Gagal menyimpan produk.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus produk ini? Tindakan tidak bisa dibatalkan.")) return;
    try {
      await deleteProduk(id);
      load();
    } catch {
      alert("Gagal menghapus produk.");
    }
  }

  return (
    <AdminLayout>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="font-display fs-3 mb-1">Kelola Produk</h1>
          <p className="small text-body-secondary mb-0">Tambah, ubah, atau hapus produk di rak toko pengrajut.</p>
        </div>
        <button onClick={openCreate} className="btn btn-toko pengrajut rounded-pill px-3">
          + Tambah Produk
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : produk.length === 0 ? (
        <p className="small text-body-secondary">Belum ada produk.</p>
      ) : (
        <div className="card-toko pengrajut overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="small text-uppercase text-body-secondary" style={{ backgroundColor: "var(--paper-2)" }}>
                  <th className="px-3 py-3 fw-medium">Produk</th>
                  <th className="px-3 py-3 fw-medium">Kategori</th>
                  <th className="px-3 py-3 fw-medium">Harga</th>
                  <th className="px-3 py-3 fw-medium">Stok</th>
                  <th className="px-3 py-3 fw-medium text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {produk.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-3 fw-medium">{p.nama}</td>
                    <td className="px-3 py-3 text-body-secondary">{p.kategori || "—"}</td>
                    <td className="px-3 py-3 price-mono text-pine-dark">{formatRp(p.harga)}</td>
                    <td className="px-3 py-3">
                      <span className={`price-mono ${(p.stok ?? 0) <= 5 ? "text-chili fw-semibold" : "text-body-secondary"}`}>{p.stok ?? 0}</span>
                    </td>
                    <td className="px-3 py-3 text-end text-nowrap">
                      <button onClick={() => openEdit(p)} className="btn btn-link btn-sm text-pine text-decoration-none fw-medium me-2">Ubah</button>
                      <button onClick={() => handleDelete(p.id)} className="btn btn-link btn-sm text-chili text-decoration-none fw-medium">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="font-display fs-5 modal-title">{editingId ? "Ubah Produk" : "Tambah Produk"}</h2>
                  <button type="button" className="btn-close" onClick={() => setModalOpen(false)} aria-label="Tutup"></button>
                </div>
                <form onSubmit={handleSave}>
                  <div className="modal-body">
                    {error && <div className="alert alert-danger py-2 small">{error}</div>}
                    <div className="mb-3">
                      <label className="form-label small fw-medium">Nama Produk</label>
                      <input required value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} className="form-control" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-medium">Kategori</label>
                      <input value={form.kategori} onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))} className="form-control" />
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-medium">Harga (Rp)</label>
                        <input type="number" required value={form.harga} onChange={(e) => setForm((f) => ({ ...f, harga: e.target.value }))} className="form-control" />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-medium">Stok</label>
                        <input type="number" required value={form.stok} onChange={(e) => setForm((f) => ({ ...f, stok: e.target.value }))} className="form-control" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-medium">URL Foto</label>
                      <input value={form.foto} onChange={(e) => setForm((f) => ({ ...f, foto: e.target.value }))} className="form-control" />
                    </div>
                    <div>
                      <label className="form-label small fw-medium">Deskripsi</label>
                      <textarea value={form.deskripsi} onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))} rows={3} className="form-control" />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline-secondary rounded-pill px-3">Batal</button>
                    <button type="submit" disabled={saving} className="btn btn-toko pengrajut rounded-pill px-3">
                      {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </AdminLayout>
  );
}
