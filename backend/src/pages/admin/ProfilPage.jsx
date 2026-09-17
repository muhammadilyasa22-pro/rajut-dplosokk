import ProfileEditor from "../../components/ProfileEditor";
import { imageUrl } from "../../config";
import { useAuth } from "../../context/AuthContext";

export default function ProfilPage() {
  const { user } = useAuth();
  return (
    <div className="admin-profile-page">
      <div className="page-actions">
        <div><h2>Profil Saya</h2><p>Kelola informasi akun admin dan foto profil.</p></div>
      </div>
      <section className="admin-panel profile-editor-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">AKUN ADMIN</p><h2>{`${user?.nama_d || "Admin"} ${user?.nama_b || ""}`.trim()}</h2><p>Username @{user?.uname || "admin"} · Role {user?.role || "admin"}</p></div>
          <div className="profile-mini-preview">{user?.foto ? <img src={imageUrl(user.foto)} alt="Foto admin" /> : (user?.nama_d || "A").slice(0,1).toUpperCase()}</div>
        </div>
        <ProfileEditor />
      </section>
    </div>
  );
}
