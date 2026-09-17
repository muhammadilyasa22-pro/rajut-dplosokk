import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo-dplosokk.png";
import { useAuth } from "../../../controllers/AuthContext";

const menu = [
  ["Dashboard", "/admin", "bi-speedometer2"],
  ["Produk", "/admin/produk", "bi-box-seam"],
  ["Kategori", "/admin/kategori", "bi-tags"],
  ["Pembeli", "/admin/pembeli", "bi-people"],
  ["Pesanan", "/admin/pesanan", "bi-receipt"],
  ["Laporan Penjualan", "/admin/laporan", "bi-graph-up"],
  ["Artikel", "/admin/artikel", "bi-newspaper"],
  ["Pesan Kontak", "/admin/kontak", "bi-chat-dots"],
  ["Info Toko", "/admin/info-toko", "bi-shop"],
  ["Profil Saya", "/admin/profil", "bi-person-circle"]
];

export default function AdminSidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function keluar() {
    logout();
    navigate("/login");
  }

  return (
    <aside className={`admin-sidebar ${open ? "open" : ""}`}>
      <div className="admin-brand">
        <div className="brand-logo-wrap">
          <img src={logo} alt="D-PLOSOKK" />
        </div>
        <div>
          <strong>Toko Pengrajut D-PLOSOKK</strong>
          <small><i className="bi bi-shop-window" /> Bu Endang</small>
        </div>
      </div>

      <div className="sidebar-section-label">NAVIGASI TOKO</div>
      <div className="sidebar-menu">
        {menu.map(([label, to, icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
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
        <NavLink to="/" onClick={onClose}>
          <i className="bi bi-arrow-up-right-circle" /> <span>Lihat beranda</span>
        </NavLink>
        <button onClick={keluar}>
          <i className="bi bi-box-arrow-right" /> <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}
