import { useEffect, useState } from "react";
import { apiFetch } from "../../services";
import { imageUrl } from "../../config";

const STATUS_OPTIONS = ["Menunggu", "Diproses", "Dikirim", "Selesai", "Dibatalkan"];
const PAYMENT_OPTIONS = ["Belum Bayar", "Menunggu Verifikasi", "Sudah Bayar"];

export default function PesananPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState({});

  async function load() {
    try {
      setItems(await apiFetch("/admin/pembelian"));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

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
