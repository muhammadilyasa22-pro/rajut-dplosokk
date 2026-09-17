import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [uname, setUname] = useState("");
  const [passwd, setPasswd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(uname, passwd);
      const dest = location.state?.from || (user.role === "admin" ? "/admin" : "/");
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || "Username atau password salah. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center bg-paper-2 px-3 py-5" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className="w-100" style={{ maxWidth: 380 }}>
        <div className="text-center mb-4">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle font-display fw-bold fs-4 mb-3"
            style={{ width: 48, height: 48, backgroundColor: "var(--pine-500)", color: "var(--marigold-300)" }}
          >
            D
          </span>
          <h1 className="font-display fs-3 mb-1">Masuk ke Toko Pengrajut</h1>
          <p className="small text-body-secondary mb-0">Lanjutkan belanja atau kelola toko Anda.</p>
        </div>

        <form onSubmit={handleSubmit} className="card-toko pengrajut p-4">
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <div className="mb-3">
            <label htmlFor="uname" className="form-label small fw-medium">Username</label>
            <input
              id="uname"
              type="text"
              required
              value={uname}
              onChange={(e) => setUname(e.target.value)}
              className="form-control"
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="passwd" className="form-label small fw-medium">Password</label>
            <input
              id="passwd"
              type="password"
              required
              value={passwd}
              onChange={(e) => setPasswd(e.target.value)}
              className="form-control"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-toko pengrajut w-100">
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-center small text-body-secondary mt-4">
          Belum punya akun?{" "}
          <Link to="/register" className="text-pine fw-semibold text-decoration-none">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}
