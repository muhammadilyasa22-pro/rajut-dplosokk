import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo-dplosokk.png";
import { apiFetch } from "../../models/api";

const initial = {
  nama_d: "", nama_b: "", kelamin: "", lahir: "", alamat: "", phone: "", email: "", uname: "", passwd: ""
};

export default function RegisterPage() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setSuccess(result.message || "Registrasi berhasil.");
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page auth-page-tall">
      <div className="auth-card auth-wide">
        <img className="auth-logo" src={logo} alt="D-PLOSOKK" />
        <p className="eyebrow">TOKO PENGRAJUT D-PLOSOKK</p>
        <h1>Daftar akun pembeli</h1>
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
        <form onSubmit={submit} className="form-grid">
          <label>Nama depan<input name="nama_d" value={form.nama_d} onChange={change} required /></label>
          <label>Nama belakang<input name="nama_b" value={form.nama_b} onChange={change} required /></label>
          <label>Jenis kelamin<select name="kelamin" value={form.kelamin} onChange={change}><option value="">Pilih</option><option>Laki-laki</option><option>Perempuan</option></select></label>
          <label>Tanggal lahir<input type="date" name="lahir" value={form.lahir} onChange={change} /></label>
          <label>Nomor telepon<input name="phone" value={form.phone} onChange={change} /></label>
          <label>Email<input type="email" name="email" value={form.email} onChange={change} required /></label>
          <label className="full">Alamat<textarea name="alamat" value={form.alamat} onChange={change} rows="3" /></label>
          <label>Username<input name="uname" value={form.uname} onChange={change} required /></label>
          <label>Password<input type="password" name="passwd" value={form.passwd} onChange={change} minLength="6" required /></label>
          <div className="full"><button className="btn btn-primary btn-block" disabled={loading}>{loading ? "Mendaftarkan..." : "Daftar"}</button></div>
        </form>
        <p className="auth-link">Sudah punya akun? <Link to="/login">Masuk</Link></p>
      </div>
    </div>
  );
}
