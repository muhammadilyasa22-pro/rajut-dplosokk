import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo-dplosokk.png";
import { apiFetch } from "../../models/api";
import { useAuth } from "../../controllers/AuthContext";

export default function LoginPage() {
  const [credential, setCredential] = useState("");
  const [passwd, setPasswd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ credential, passwd })
      });
      login(result);
      const from = location.state?.from;
      navigate(from || (result.user.role === "admin" ? "/admin" : "/pembeli"), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img className="auth-logo" src={logo} alt="D-PLOSOKK" />
        <p className="eyebrow">TOKO PENGRAJUT D-PLOSOKK</p>
        <h1>Masuk ke akun</h1>
        <p className="muted">Masuk sebagai pembeli atau admin.</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit} className="form-stack">
          <label>Username / Email<input value={credential} onChange={(e) => setCredential(e.target.value)} required /></label>
          <label>Password<input type="password" value={passwd} onChange={(e) => setPasswd(e.target.value)} required /></label>
          <button className="btn btn-primary btn-block" disabled={loading}>{loading ? "Memproses..." : "Masuk"}</button>
        </form>
        <p className="auth-link">Belum punya akun? <Link to="/register">Daftar sebagai pembeli</Link></p>
        <Link to="/" className="back-link">← Kembali ke beranda</Link>
      </div>
    </div>
  );
}
