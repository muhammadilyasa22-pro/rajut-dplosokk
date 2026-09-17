import { useEffect, useState } from "react";
import { apiFetch } from "../../../models/api";
import { imageUrl } from "../../../config";

const KATEGORI_BAWAAN = [
  "Baju Rajut",
  "Sweater",
  "Tas Rajut",
  "Mainan Rajut",
  "Aksesori Rajut",
  "Souvenir Rajut",
];

const EMPTY_FORM = {
  nama_produk: "",
  deskripsi: "",
  harga: "",
  kategori: "Aksesori Rajut",
  bahan: "",
  ukuran: "",
  stok: "",
};

export default function ProdukPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editing, setEditing] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [kategoriList, setKategoriList] = useState([]);

  useEffect(() => {
    apiFetch("/kategori")
      .then((data) => setKategoriList(Array.isArray(data) ? data.map((k) => k.nama) : []))
      .catch(() => setKategoriList([]));
  }, []);

  async function load({ silent = false } = {}) {
    try {
      if (!silent) setLoadingData(true);
      setError("");
      const data = await apiFetch("/admin/produk");
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];
      setItems(list);
    } catch (err) {
      console.error("Load produk error:", err);
      setError(err?.message || "Gagal mengambil produk");
    } finally {
      if (!silent) setLoadingData(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function edit(item) {
    setEditing(item.id_produk);
    setForm({
      nama_produk: item.nama_produk || "",
      deskripsi: item.deskripsi || "",
      harga: item.harga ?? "",
      kategori: item.kategori || "Aksesori Rajut",
      bahan: item.bahan || "",
      ukuran: item.ukuran || "",
      stok: item.stok ?? "",
    });
    setFile(null);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFile(null);
    setError("");
    setSuccess("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.nama_produk.trim() || !form.deskripsi.trim() || form.harga === "" || !form.kategori) {
      setError("Nama, kategori, harga, dan deskripsi wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();
      body.append("nama_produk", form.nama_produk.trim());
      body.append("deskripsi", form.deskripsi.trim());
      body.append("harga", String(form.harga));
      body.append("kategori", form.kategori);
      body.append("bahan", form.bahan || "");
      body.append("ukuran", form.ukuran || "");
      body.append("stok", form.stok === "" ? "" : String(form.stok));
      if (file) body.append("gambar", file);

      const url = editing ? `/admin/produk/${editing}` : "/admin/produk";

      await apiFetch(url, {
        method: editing ? "PUT" : "POST",
        body,
      });

      const message = editing ? "Produk berhasil diperbarui." : "Produk berhasil ditambahkan.";
      reset();
      setSuccess(message);
      await load({ silent: true });
    } catch (err) {
      console.error("Simpan produk error:", err);
      setError(err?.message || "Gagal menyimpan produk.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    if (!id || !window.confirm("Hapus produk ini?")) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/admin/produk/${id}`, { method: "DELETE" });
      setSuccess("Produk berhasil dihapus.");
      await load({ silent: true });
    } catch (err) {
      setError(err?.message || "Gagal menghapus produk.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-actions">
        <div>
          <h2>Daftar produk</h2>
          <p>{items.length} produk</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={reset} disabled={loading}>
          {editing ? "Batal edit" : "+ Produk baru"}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <section className="admin-panel form-panel">
        <h3>{editing ? "Ubah produk" : "Tambah produk"}</h3>
        <form onSubmit={submit} className="form-grid">
          <label>
            Nama produk
            <input name="nama_produk" value={form.nama_produk} onChange={handleChange} required />
          </label>

          <label>
            Kategori
            <input
              name="kategori"
              list="kategori-list"
              value={form.kategori}
              onChange={handleChange}
              placeholder="Pilih atau ketik kategori baru"
              required
            />
            <datalist id="kategori-list">
              {Array.from(
                new Set([
                  ...(kategoriList.length ? kategoriList : KATEGORI_BAWAAN),
                  ...items.map((item) => (item.kategori || "").trim()).filter(Boolean),
                ])
              ).map((kategori) => (
                <option key={kategori} value={kategori} />
              ))}
            </datalist>
            <small>
              Pilih dari daftar atau ketik nama kategori baru sendiri. Kelola daftar kategori lengkap di menu <em>Kategori</em>.
            </small>
          </label>

          <label>
            Harga
            <input name="harga" type="number" min="0" value={form.harga} onChange={handleChange} required />
          </label>

          <label>
            Bahan <span className="muted">(opsional)</span>
            <input name="bahan" value={form.bahan} onChange={handleChange} placeholder="misalnya: Benang katun premium" />
          </label>

          <label>
            Ukuran <span className="muted">(opsional)</span>
            <input name="ukuran" value={form.ukuran} onChange={handleChange} placeholder="misalnya: All size / 20x15 cm" />
          </label>

          <label>
            Stok <span className="muted">(opsional, kosongkan jika tidak dilacak)</span>
            <input name="stok" type="number" min="0" value={form.stok} onChange={handleChange} placeholder="misalnya: 10" />
          </label>

          <label>
            Gambar
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <small>JPG, JPEG, PNG, WEBP. Maksimal 2 MB.</small>
          </label>

          <label className="full">
            Deskripsi
            <textarea name="deskripsi" rows="5" value={form.deskripsi} onChange={handleChange} required />
          </label>

          <div className="full">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Menyimpan..." : editing ? "Simpan perubahan" : "Simpan produk"}
            </button>
          </div>
        </form>
      </section>

      <section className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Gambar</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {loadingData ? (
                <tr><td colSpan="5">Memuat produk...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5">Belum ada produk.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id_produk}>
                    <td>
                      <img
                        className="table-thumb"
                        src={imageUrl(item.gambar)}
                        alt={item.nama_produk || "Produk"}
                        onError={(event) => {
                          if (event.currentTarget.dataset.fallback === "1") return;
                          event.currentTarget.dataset.fallback = "1";
                          event.currentTarget.src = imageUrl("default.svg");
                        }}
                      />
                    </td>
                    <td>
                      <strong>{item.nama_produk || "Tanpa nama"}</strong>
                      <small>{item.deskripsi || ""}</small>
                    </td>
                    <td>{item.kategori || "-"}</td>
                    <td>Rp {Number(item.harga || 0).toLocaleString("id-ID")}</td>
                    <td>
                      <div className="action-row">
                        <button type="button" className="btn btn-small" onClick={() => edit(item)} disabled={loading}>Ubah</button>
                        <button type="button" className="btn btn-small btn-danger" onClick={() => remove(item.id_produk)} disabled={loading}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
