import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";

const initial = {
  nama_d: "",
  nama_b: "",
  kelamin: "Laki-laki",
  lahir: "",
  alamat: "",
  phone: "",
  email: "",
  uname: "",
  passwd: "",
};

export default function Register() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      setOk(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message || "Pendaftaran gagal. Periksa kembali data Anda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center bg-paper-2 px-3 py-5" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className="w-100" style={{ maxWidth: 560 }}>
        <div className="text-center mb-4">
          <h1 className="font-display fs-3 mb-1">Daftar Akun Baru</h1>
          <p className="small text-body-secondary mb-0">Buat akun untuk mulai belanja di Toko Pengrajut D-PLOSOKK.</p>
        </div>

        <form onSubmit={handleSubmit} className="card-toko pengrajut p-4">
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          {ok && <div className="alert alert-success py-2 small">Akun berhasil dibuat, mengarahkan ke login...</div>}

          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label small fw-medium">Nama Depan</label>
              <input type="text" required value={form.nama_d} onChange={update("nama_d")} className="form-control" />
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-medium">Nama Belakang</label>
              <input type="text" value={form.nama_b} onChange={update("nama_b")} className="form-control" />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label small fw-medium">Jenis Kelamin</label>
              <select value={form.kelamin} onChange={update("kelamin")} className="form-select">
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-medium">Tanggal Lahir</label>
              <input type="date" value={form.lahir} onChange={update("lahir")} className="form-control" />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-medium">Alamat</label>
            <input type="text" value={form.alamat} onChange={update("alamat")} className="form-control" />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label small fw-medium">No. HP</label>
              <input type="text" required value={form.phone} onChange={update("phone")} className="form-control" />
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-medium">Email</label>
              <input type="email" required value={form.email} onChange={update("email")} className="form-control" />
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-sm-6">
              <label className="form-label small fw-medium">Username</label>
              <input type="text" required value={form.uname} onChange={update("uname")} className="form-control" />
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-medium">Password</label>
              <input type="password" required value={form.passwd} onChange={update("passwd")} className="form-control" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-toko pengrajut w-100">
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>
        </form>

        <p className="text-center small text-body-secondary mt-4">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-pine fw-semibold text-decoration-none">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
