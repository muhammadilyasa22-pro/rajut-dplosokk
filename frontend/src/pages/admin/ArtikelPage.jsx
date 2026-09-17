import { useEffect, useState } from "react";
import { apiFetch } from "../../services";
import { imageUrl } from "../../config";

const EMPTY_FORM = {
  judul: "",
  isi: "",
};

export default function ArtikelPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load({ silent = false } = {}) {
    try {
      if (!silent) setLoadingData(true);
      setError("");

      const data = await apiFetch("/admin/artikel");
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setItems(list);
    } catch (err) {
      console.error("Load artikel error:", err);
      // Jangan mengosongkan tabel ketika refresh gagal. Data lama tetap
      // ditampilkan agar halaman tidak berkedip menjadi kosong.
      setError(err?.message || "Gagal mengambil artikel");
    } finally {
      if (!silent) setLoadingData(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function reset() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFile(null);
    setError("");
    setSuccess("");
  }

  function edit(item) {
    const id = item.id ?? item.id_artikel;

    if (!id) {
      setError("ID artikel tidak ditemukan.");
      return;
    }

    setEditing(id);
    setForm({
      judul: item.judul || "",
      isi: item.isi || "",
    });
    setFile(null);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.judul.trim()) {
      setError("Judul artikel wajib diisi.");
      return;
    }

    if (!form.isi.trim()) {
      setError("Isi artikel wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();
      body.append("judul", form.judul.trim());
      body.append("isi", form.isi.trim());

      if (file) {
        body.append("gambar", file);
      }

      const url = editing
        ? `/admin/artikel/${editing}`
        : "/admin/artikel";

      await apiFetch(url, {
        method: editing ? "PUT" : "POST",
        body,
      });

      setSuccess(
        editing
          ? "Artikel berhasil diperbarui."
          : "Artikel berhasil ditambahkan."
      );

      setEditing(null);
      setForm({ ...EMPTY_FORM });
      setFile(null);
      await load({ silent: true });
    } catch (err) {
      console.error("Simpan artikel error:", err);
      setError(err?.message || "Gagal menyimpan artikel.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id) {
    if (!id) {
      setError("ID artikel tidak ditemukan.");
      return;
    }

    if (!window.confirm("Apakah kamu yakin ingin menghapus artikel ini?")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/admin/artikel/${id}`, {
        method: "DELETE",
      });

      setSuccess("Artikel berhasil dihapus.");

      if (editing === id) {
        setEditing(null);
        setForm({ ...EMPTY_FORM });
        setFile(null);
      }

      await load({ silent: true });
    } catch (err) {
      console.error("Hapus artikel error:", err);
      setError(err?.message || "Gagal menghapus artikel.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-actions">
        <div>
          <h2>Artikel &amp; blog</h2>
          <p>{items.length} artikel</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={reset}
          disabled={loading}
        >
          {editing ? "Batal edit" : "+ Artikel baru"}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <section className="admin-panel form-panel">
        <h3>{editing ? "Ubah artikel" : "Tulis artikel"}</h3>

        <form onSubmit={submit} className="form-grid">
          <label className="full">
            Judul
            <input
              name="judul"
              value={form.judul}
              onChange={handleChange}
              placeholder="Judul artikel"
              required
            />
          </label>

          <label>
            Gambar
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(event) =>
                setFile(event.target.files?.[0] || null)
              }
            />
            <small>JPG, JPEG, PNG, WEBP. Maksimal 2 MB.</small>
          </label>

          <label className="full">
            Isi
            <textarea
              name="isi"
              rows="10"
              value={form.isi}
              onChange={handleChange}
              placeholder="Tulis isi artikel..."
              required
            />
          </label>

          <div className="full">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Menyimpan..."
                : editing
                  ? "Simpan perubahan"
                  : "Simpan artikel"}
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
                <th>Judul</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {loadingData ? (
                <tr>
                  <td colSpan="3">Memuat artikel...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="3">Belum ada artikel.</td>
                </tr>
              ) : (
                items.map((item) => {
                  const id = item.id ?? item.id_artikel;

                  return (
                    <tr key={id}>
                      <td>
                        <img
                          className="table-thumb"
                          src={imageUrl(item.gambar)}
                          alt={item.judul || "Artikel"}
                          onError={(event) => {
                            if (event.currentTarget.dataset.fallback === "1") return;
                            event.currentTarget.dataset.fallback = "1";
                            event.currentTarget.src = imageUrl("default.svg");
                          }}
                        />
                      </td>

                      <td>
                        <strong>{item.judul || "Tanpa judul"}</strong>
                        <small>
                          {String(item.ringkasan || item.isi || "").slice(0, 110)}
                          {String(item.ringkasan || item.isi || "").length > 110
                            ? "..."
                            : ""}
                        </small>
                      </td>

                      <td>
                        <div className="action-row">
                          <button
                            type="button"
                            className="btn btn-small"
                            onClick={() => edit(item)}
                            disabled={loading}
                          >
                            Ubah
                          </button>
                          <button
                            type="button"
                            className="btn btn-small btn-danger"
                            onClick={() => remove(id)}
                            disabled={loading}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
