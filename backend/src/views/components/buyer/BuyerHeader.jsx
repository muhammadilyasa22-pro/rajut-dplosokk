import { useAuth } from "../../../controllers/AuthContext";
import { imageUrl } from "../../../config";

export default function BuyerHeader({ title, onMenu }) {
  const { user } = useAuth();
  const name = `${user?.nama_d || ""} ${user?.nama_b || ""}`.trim() || user?.uname || "Pembeli";

  return (
    <header className="admin-header buyer-header">
      <div className="header-title-wrap">
        <button className="mobile-menu" onClick={onMenu} aria-label="Buka menu">
          <i className="bi bi-list" />
        </button>
        <div>
          <span className="header-kicker">AREA PEMBELI</span>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="admin-user">
        <div className="avatar avatar-photo">{user?.foto ? <img src={imageUrl(user.foto)} alt="Foto pembeli" /> : name.slice(0, 1).toUpperCase()}</div>
        <div>
          <strong>{name}</strong>
          <span><i className="bi bi-person-check" /> {user?.uname || "pembeli"}</span>
        </div>
      </div>
    </header>
  );
}
