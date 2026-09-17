import { useEffect, useState } from "react";
import { apiFetch } from "../../../models/api";
import { imageUrl } from "../../../config";

const STATUS_OPTIONS = ["Menunggu", "Diproses", "Dikirim", "Selesai", "Dibatalkan"];
const PAYMENT_OPTIONS = ["Belum Bayar", "Menunggu Verifikasi", "Sudah Bayar"];

export default function PesananPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState({});

  const [qris, setQris] = useState(null);
  const [qrisFile, setQrisFile] = useState(null);
  const [qrisSaving, setQrisSaving] = useState(false);
  const [qrisMessage, setQrisMessage] = useState("");

  async function loadQris() {
    try {
      const res = await apiFetch("/pengaturan/qris");
      setQris(res?.qris_image || null);
    } catch (err) {
      // Diamkan saja jika gagal memuat, admin masih bisa mengunggah ulang.
    }
  }

  async function simpanQris(event) {
    event.preventDefault();
    if (!qrisFile) {
      setQrisMessage("Pilih foto QRIS terlebih dahulu.");
      return;
    }
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(qrisFile.type)) {
      setQrisMessage("Foto QRIS harus berupa JPG, JPEG, PNG, atau WEBP.");
      return;
    }
    if (qrisFile.size > 2 * 1024 * 1024) {
      setQrisMessage("Ukuran foto QRIS maksimal 2 MB.");
      return;
    }

    setQrisSaving(true);
    setQrisMessage("");
    try {
      const body = new FormData();
      body.append("qris", qrisFile);
      const res = await apiFetch("/pengaturan/qris", { method: "POST", body });
      setQris(res?.qris_image || null);
      setQrisFile(null);
      setQrisMessage("Foto QRIS berhasil disimpan.");
    } catch (err) {
      setQrisMessage(err.message || "Gagal menyimpan foto QRIS.");
    } finally {
      setQrisSaving(false);
    }
  }

  async function load() {
    try {
      setItems(await apiFetch("/admin/pembelian"));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); loadQris(); }, []);

  async function updateStatus(id, status) {
    const key = `${id}-status`;
    try {
      setError("");
      setSaving((v) => ({ ...v, [key]: true }));
      const current = items.find((x) => String(x.id) === String(id));
      const pembayaran = current?.pembayaran || "Belum Bayar";
      const result = await apiFetch(`/admin/pembelian/${id}/status`, {
        method: "PUT",
        body: { status, pembayaran },
      });
      const updated = result?.data || {};
      setItems((list) => list.map((x) => String(x.id) === String(id)
        ? { ...x, status: updated.status ?? status, pembayaran: updated.pembayaran ?? pembayaran }
        : x));
    } catch (err) {
      setError(err.message);
      await load();
    } finally {
      setSaving((v) => ({ ...v, [key]: false }));
    }
  }

  async function updatePembayaran(id, pembayaran) {
    const key = `${id}-pembayaran`;
    try {
      setError("");
      setSaving((v) => ({ ...v, [key]: true }));

      // Endpoint khusus pembayaran: status pesanan tidak ikut diubah.
      const result = await apiFetch(`/admin/pembelian/${id}/pembayaran`, {
        method: "PUT",
        body: { pembayaran },
      });

      const updated = result?.data || {};
      setItems((list) => list.map((x) => String(x.id) === String(id)
        ? { ...x, pembayaran: updated.pembayaran ?? pembayaran, status: updated.status ?? x.status }
        : x));
    } catch (err) {
      setError(err.message);
      await load();
    } finally {
      setSaving((v) => ({ ...v, [key]: false }));
    }
  }

  async function remove(id) {
    if (!confirm("Hapus pesanan ini?")) return;
    try {
      setError("");
      await apiFetch(`/admin/pembelian/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="page-actions">
        <div><h2>Daftar pesanan</h2><p>{items.length} transaksi</p></div>
      </div>

      <section className="admin-panel form-panel qris-admin-panel">
        <h3>Foto QRIS Pembayaran</h3>
        <p>Foto ini akan tampil ke pembeli saat memilih metode pembayaran Transfer di halaman Keranjang.</p>
        {qrisMessage && <div className={`alert ${qrisMessage.includes("berhasil") ? "success" : "error"}`}>{qrisMessage}</div>}
        <div className="qris-admin-layout">
          <div className="qris-admin-preview">
            {qris ? <img src={imageUrl(qris)} alt="Foto QRIS saat ini" /> : <div className="empty-state">Belum ada foto QRIS.</div>}
          </div>
          <form className="qris-admin-form" onSubmit={simpanQris}>
            <label>
              Ganti foto QRIS
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => setQrisFile(e.target.files?.[0] || null)}
              />
              <small>JPG, PNG, atau WEBP. Maksimal 2 MB.</small>
            </label>
            <button className="btn btn-primary btn-small" disabled={qrisSaving}>
              {qrisSaving ? "Menyimpan..." : "Simpan Foto QRIS"}
            </button>
          </form>
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}
      <section className="table-card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Pembeli</th><th>Gambar</th><th>Produk</th><th>Total</th><th>Status</th><th>Bayar</th><th>Bukti Pembayaran</th><th>Tindakan</th></tr></thead>
            <tbody>
              {items.map((item) => {
                const status = STATUS_OPTIONS.includes(item.status) ? item.status : "Menunggu";
                const pembayaran = PAYMENT_OPTIONS.includes(item.pembayaran) ? item.pembayaran : "Belum Bayar";
                return (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>{item.uname || item.nama_pembeli}</td>
                    <td><img className="table-thumb" src={imageUrl(item.gambar)} alt="" /></td>
                    <td>{item.nama_produk}</td>
                    <td>Rp {Number(item.harga || 0).toLocaleString("id-ID")}</td>
                    <td>
                      <select className="inline-select" value={status} disabled={!!saving[`${item.id}-status`]} onChange={(e) => updateStatus(item.id, e.target.value)}>
                        {STATUS_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="inline-select" value={pembayaran} disabled={!!saving[`${item.id}-pembayaran`]} onChange={(e) => updatePembayaran(item.id, e.target.value)}>
                        {PAYMENT_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </td>
                    <td>{item.foto_bukti ? <a href={imageUrl(item.foto_bukti)} target="_blank" rel="noreferrer" className="back-link">Lihat bukti</a> : <span>-</span>}</td>
                    <td><button className="btn btn-small btn-danger" onClick={() => remove(item.id)}>Hapus</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {items.length === 0 && <div className="empty-state">Belum ada pesanan.</div>}
      </section>
    </div>
  );
}
