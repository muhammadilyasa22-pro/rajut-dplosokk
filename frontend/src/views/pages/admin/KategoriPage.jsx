import { useEffect, useState } from "react";
import { apiFetch } from "../../../models/api";

export default function KategoriPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [namaBaru, setNamaBaru] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editNama, setEditNama] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await apiFetch("/kategori");
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function tambah(event) {
    event.preventDefault();
    if (!namaBaru.trim()) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch("/kategori", {
        method: "POST",
        body: JSON.stringify({ nama: namaBaru.trim() })
      });
      setNamaBaru("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function mulaiEdit(item) {
    setEditId(item.id);
    setEditNama(item.nama);
  }

  async function simpanEdit(id) {
    if (!editNama.trim()) return;
    setError("");
    try {
      await apiFetch(`/kategori/${id}`, {
        method: "PUT",
        body: JSON.stringify({ nama: editNama.trim() })
      });
      setEditId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function hapus(item) {
    if (!confirm(`Hapus kategori "${item.nama}"? Produk yang sudah memakai nama ini tidak ikut terhapus.`)) return;
    setError("");
    try {
      await apiFetch(`/kategori/${item.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-actions">
        <div><h2>Kategori Produk</h2><p>{items.length} kategori</p></div>
      </div>

      {error && <div className="alert error">{error}</div>}

      <section className="admin-panel form-panel">
        <h3>Tambah Kategori Baru</h3>
        <form onSubmit={tambah} className="inline-form">
          <input
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            placeholder="Nama kategori, misalnya: Selimut Rajut"
            required
          />
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Menyimpan..." : "+ Tambah"}
          </button>
        </form>
      </section>

      {loading ? (
        <div className="loading-box">Memuat kategori...</div>
      ) : (
        <div className="table-card">
          <table>
            <thead>
              <tr><th>Nama Kategori</th><th style={{ width: 180 }}>Aksi</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {editId === item.id ? (
                      <input value={editNama} onChange={(e) => setEditNama(e.target.value)} />
                    ) : (
                      item.nama
                    )}
                  </td>
                  <td>
                    {editId === item.id ? (
                      <div className="row-actions">
                        <button className="btn btn-primary btn-small" onClick={() => simpanEdit(item.id)}>Simpan</button>
                        <button className="btn btn-outline btn-small" onClick={() => setEditId(null)}>Batal</button>
                      </div>
                    ) : (
                      <div className="row-actions">
                        <button className="btn btn-outline btn-small" onClick={() => mulaiEdit(item)}>Ubah</button>
                        <button className="btn btn-danger btn-small" onClick={() => hapus(item)}>Hapus</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={2} className="muted">Belum ada kategori.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
