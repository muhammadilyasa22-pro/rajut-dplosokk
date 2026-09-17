import { Link } from "react-router-dom";
import ProfileEditor from "../../components/ProfileEditor";
import { imageUrl } from "../../config";
import { useAuth } from "../../context/AuthContext";

function initials(user) {
  const text = `${user?.nama_d || ""} ${user?.nama_b || ""}`.trim();
  return text ? text.charAt(0).toUpperCase() : "P";
}

export default function ProfilPage() {
  const { user } = useAuth();
  const name = `${user?.nama_d || ""} ${user?.nama_b || ""}`.trim() || "Pembeli";

  return (
    <section className="section container profile-page profile-edit-page">
      <div className="page-intro profile-heading">
        <p className="eyebrow">AKUN PEMBELI</p>
        <h1>Profil Saya</h1>
        <p>Kelola data akun dan foto profil. Riwayat pembelian tersedia terpisah di halaman Pesanan Saya.</p>
      </div>

      <div className="profile-edit-layout">
        <aside className="profile-card-modern profile-summary-card">
          <div className="profile-avatar-modern profile-avatar-image">
            {user?.foto ? <img src={imageUrl(user.foto)} alt="Foto profil" /> : initials(user)}
          </div>
          <h2>{name}</h2>
          <p className="profile-username">@{user?.uname || "-"}</p>
          <div className="profile-divider" />
          <div className="profile-info-list">
            <div><span>Email</span><strong>{user?.email || "-"}</strong></div>
            <div><span>Telepon</span><strong>{user?.phone || "-"}</strong></div>
            <div><span>Alamat</span><strong>{user?.alamat || "-"}</strong></div>
          </div>
          <Link to="/pembeli/pesanan" className="btn btn-outline btn-block profile-history-link">
            <i className="bi bi-clock-history" /> Lihat riwayat pembelian
          </Link>
        </aside>

        <section className="admin-panel profile-editor-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">EDIT DATA</p><h2>Edit Profil Pembeli</h2><p>Perubahan akan langsung tersimpan ke akun Anda.</p></div>
            <i className="bi bi-person-gear profile-panel-icon" />
          </div>
          <ProfileEditor />
        </section>
      </div>
    </section>
  );
}
