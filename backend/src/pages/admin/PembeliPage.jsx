import { useEffect, useState } from "react";
import { apiFetch } from "../../services";
import { imageUrl } from "../../config";
import ProfileEditor from "../../components/ProfileEditor";

export default function PembeliPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  async function load() {
    try { setError(""); setItems(await apiFetch("/admin/pembeli")); }
    catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm("Hapus akun pembeli ini?")) return;
    try { await apiFetch(`/admin/pembeli/${id}`, { method: "DELETE" }); if (editing?.id === id) setEditing(null); load(); }
    catch (err) { setError(err.message); }
  }

  return (
    <div className="admin-buyers-page">
      <div className="page-actions">
        <div><p className="eyebrow">DATA PELANGGAN</p><h2>Kelola Pembeli</h2><p>{items.length} akun pembeli terdaftar.</p></div>
        <div className="buyers-total"><i className="bi bi-people-fill" /><strong>{items.length}</strong><span>Pembeli</span></div>
      </div>
      {error && <div className="alert error"><i className="bi bi-exclamation-circle" /> {error}</div>}

      {editing && (
        <section className="admin-panel buyer-edit-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">EDIT PEMBELI</p><h2>{editing.nama_d} {editing.nama_b}</h2><p>Admin dapat memperbarui data dan foto profil pembeli.</p></div>
            <button className="btn btn-outline" onClick={() => setEditing(null)}><i className="bi bi-x-lg" /> Tutup</button>
          </div>
          <ProfileEditor adminBuyerId={editing.id} user={editing} onSaved={(saved) => { setEditing(saved); load(); }} />
        </section>
      )}

      <section className="table-card buyer-table-card">
        <div className="table-wrap"><table><thead><tr><th>Pembeli</th><th>Email</th><th>Username</th><th>Telepon</th><th>Alamat</th><th>Tindakan</th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id}>
          <td><div className="buyer-cell"><div className="table-avatar">{item.foto ? <img src={imageUrl(item.foto)} alt="" /> : (item.nama_d || "P").slice(0,1)}</div><div><strong>{item.nama_d} {item.nama_b}</strong><small><i className="bi bi-person" /> Pembeli</small></div></div></td>
          <td>{item.email}</td><td>@{item.uname}</td><td>{item.phone || "-"}</td><td>{item.alamat || "-"}</td>
          <td><div className="action-row"><button className="btn btn-small btn-primary" onClick={() => setEditing(item)}><i className="bi bi-pencil-square" /> Edit</button><button className="btn btn-small btn-danger" onClick={() => remove(item.id)}><i className="bi bi-trash3" /> Hapus</button></div></td>
        </tr>)}</tbody></table></div>
        {items.length === 0 && <div className="empty-state"><i className="bi bi-people" /><p>Belum ada akun pembeli.</p></div>}
      </section>
    </div>
  );
}
