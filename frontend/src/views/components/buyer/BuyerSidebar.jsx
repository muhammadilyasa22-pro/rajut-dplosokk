import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo-dplosokk.png";
import { useAuth } from "../../../controllers/AuthContext";

const menu = [
  ["Dashboard", "/pembeli", "bi-speedometer2"],
  ["Pesanan Saya", "/pembeli/pesanan", "bi-receipt"],
  ["Profil Saya", "/pembeli/profil", "bi-person-circle"]
];

export default function BuyerSidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function keluar() {
    logout();
    navigate("/login");
  }

  return (
    <aside className={`admin-sidebar buyer-sidebar ${open ? "open" : ""}`}>
      <div className="admin-brand">
        <div className="brand-logo-wrap">
          <img src={logo} alt="D-PLOSOKK" />
        </div>
        <div>
          <strong>Toko Pengrajut D-PLOSOKK</strong>
          <small><i className="bi bi-person-badge" /> Area Pembeli</small>
        </div>
      </div>

      <div className="sidebar-section-label">AREA PEMBELI</div>
      <div className="sidebar-menu">
        {menu.map(([label, to, icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/pembeli"}
            onClick={onClose}
            className={({ isActive }) => isActive ? "active" : ""}
          >
            <span className="menu-icon"><i className={`bi ${icon}`} /></span>
            <span className="menu-label">{label}</span>
            <i className="bi bi-chevron-right menu-chevron" />
          </NavLink>
        ))}
      </div>

      <div className="sidebar-bottom">
        <NavLink to="/toko" onClick={onClose}>
          <i className="bi bi-bag" /> <span>Belanja di toko</span>
        </NavLink>
        <NavLink to="/" onClick={onClose}>
          <i className="bi bi-house" /> <span>Lihat beranda</span>
        </NavLink>
        <button onClick={keluar}>
          <i className="bi bi-box-arrow-right" /> <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
