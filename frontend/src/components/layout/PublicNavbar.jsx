import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo-dplosokk.png";
import { useAuth } from "../../context/AuthContext";

export default function PublicNavbar() {
  const { user, logout } = useAuth();
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
          <NavLink to="/toko">Toko</NavLink>
          <NavLink to="/artikel">Artikel</NavLink>
          {user?.role === "pembeli" && <NavLink to="/pembeli">Pesanan Saya</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin">Panel Admin</NavLink>}
        </nav>
        <div className="nav-actions">
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
