import { useAuth } from "../../context/AuthContext";
import { imageUrl } from "../../config";

export default function AdminHeader({ title, onMenu }) {
  const { user } = useAuth();
  return (
    <header className="admin-header">
      <div className="header-title-wrap">
        <button className="mobile-menu" onClick={onMenu} aria-label="Buka menu">
          <i className="bi bi-list" />
        </button>
        <div>
          <span className="header-kicker">TOKO PENGRAJUT D-PLOSOKK</span>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="admin-user">
        <div className="avatar avatar-photo">
          {user?.foto ? <img src={imageUrl(user.foto)} alt="Foto admin" /> : (user?.nama_d || "A").slice(0, 1).toUpperCase()}
        </div>
        <div>
          <strong>{user?.nama_d || "Admin"} {user?.nama_b || ""}</strong>
          <span><i className="bi bi-shield-check" /> {user?.uname || "admin"}</span>
        </div>
      </div>
    </header>
  );
}
