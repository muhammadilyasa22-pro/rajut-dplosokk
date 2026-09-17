import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo-dplosokk.png";
import { useAuth } from "../../../controllers/AuthContext";
import { useCart } from "../../../context/CartContext";

export default function PublicNavbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  function keluar() {
    logout();
    navigate("/");
  }

  return (
    <header className="public-nav">
      <div className="container nav-inner">
        <Link to="/" className="brand-logo">
          <img src={logo} alt="D-PLOSOKK" />
        </Link>
        <nav>
          <NavLink to="/">Beranda</NavLink>
          <NavLink to="/toko">Produk</NavLink>
          <NavLink to="/artikel">Artikel</NavLink>
          {user?.role === "pembeli" && <NavLink to="/pembeli">Pesanan Saya</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin">Panel Admin</NavLink>}
        </nav>
        <div className="nav-actions">
          <Link to="/keranjang" className="cart-link" aria-label="Keranjang belanja">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
          {user ? (
            <button className="btn btn-outline" onClick={keluar}>Keluar</button>
          ) : (
            <>
              <Link className="btn btn-outline" to="/login">Masuk</Link>
              <Link className="btn btn-primary" to="/register">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
