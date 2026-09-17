import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../controllers/AuthContext";
import { useCart } from "../../controllers/CartContext";

const links = [
  { to: "/", label: "Beranda", end: true },
  { to: "/produk", label: "Produk" },
  { to: "/artikel", label: "Artikel" },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar navbar-expand-md sticky-top" style={{ backgroundColor: "var(--paper)", borderBottom: "1px solid rgba(31,77,61,0.12)" }}>
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle font-display fw-bold"
            style={{ width: 36, height: 36, backgroundColor: "var(--pine-500)", color: "var(--marigold-300)" }}
          >
            D
          </span>
          <span className="font-display fw-semibold fs-5 text-pine-dark">Toko Pengrajut D-PLOSOKK</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          aria-label="Buka menu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav mx-auto">
            {links.map((l) => (
              <li className="nav-item" key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) => `nav-link px-3 fw-medium ${isActive ? "text-pine-dark" : "text-body-secondary"}`}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            {isAdmin && (
              <li className="nav-item">
                <NavLink to="/admin" className={({ isActive }) => `nav-link px-3 fw-medium ${isActive ? "text-pine-dark" : "text-body-secondary"}`}>
                  Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
            <Link to="/keranjang" className="btn btn-light rounded-circle position-relative d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }} aria-label="Keranjang">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--pine-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {count > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{ backgroundColor: "var(--chili-500)", fontSize: 10 }}>
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="d-flex align-items-center gap-2">
                <span className="small text-body-secondary d-none d-sm-inline">Halo, {user.nama_d || user.uname}</span>
                <button onClick={handleLogout} className="btn btn-link btn-sm text-chili text-decoration-none fw-semibold">
                  Keluar
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-toko pengrajut rounded-pill px-3">
                Masuk
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
