import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../../models/api";
import { imageUrl } from "../../config";
import { useAuth } from "../../controllers/AuthContext";

const emptyForm = {
  nama_d: "",
  nama_b: "",
  kelamin: "",
  lahir: "",
  alamat: "",
  phone: "",
  email: "",
  uname: "",
  passwd_lama: "",
  passwd_baru: "",
};

export default function ProfileEditor({ user: externalUser, adminBuyerId = null, onSaved }) {
  const { user: authUser, updateUser } = useAuth();
  const user = externalUser || authUser;
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      nama_d: user.nama_d || "",
      nama_b: user.nama_b || "",
      kelamin: user.kelamin || "",
      lahir: user.lahir ? String(user.lahir).slice(0, 10) : "",
      alamat: user.alamat || "",
      phone: user.phone || "",
      email: user.email || "",
      uname: user.uname || "",
      passwd_lama: "",
      passwd_baru: "",
    });
    setPreview(user.foto ? imageUrl(user.foto) : "");
  }, [user]);

  function change(event) {
    setForm((old) => ({ ...old, [event.target.name]: event.target.value }));
  }

  function choosePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Foto profil harus berupa gambar.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran foto profil maksimal 2 MB.");
      return;
    }
    setError("");
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "") body.append(key, value);
      });
      if (photo) body.append("foto", photo);

      const endpoint = adminBuyerId
        ? `/admin/pembeli/${adminBuyerId}`
        : "/auth/profile";
      const result = await apiFetch(endpoint, { method: "PUT", body });
      const saved = result?.user;

      if (!adminBuyerId && saved) updateUser(saved);
      if (onSaved && saved) onSaved(saved);
      if (fileRef.current) fileRef.current.value = "";
      setPhoto(null);
      setForm((old) => ({ ...old, passwd_lama: "", passwd_baru: "" }));
      setSuccess(adminBuyerId ? "Data pembeli berhasil disimpan." : "Profil berhasil disimpan.");
    } catch (err) {
      setError(err?.message || "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="profile-editor" onSubmit={submit}>
      {error && <div className="alert error"><i className="bi bi-exclamation-circle" /> {error}</div>}
      {success && <div className="alert success"><i className="bi bi-check-circle" /> {success}</div>}

      <div className="profile-editor-top">
        <div className="profile-photo-editor">
          {preview ? (
            <img src={preview} alt="Foto profil" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          ) : (
            <span>{(user?.nama_d || "P").slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div>
          <h3>{adminBuyerId ? "Foto pembeli" : "Foto profil"}</h3>
          <p>Pilih foto JPG, PNG, atau WEBP dengan ukuran maksimal 2 MB.</p>
          <label className="btn btn-outline profile-photo-button">
            <i className="bi bi-camera" /> Pilih foto
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={choosePhoto} hidden />
          </label>
          {photo && <small className="selected-file"><i className="bi bi-paperclip" /> {photo.name}</small>}
        </div>
      </div>

      <div className="profile-form-grid">
        <label>Nama depan<input name="nama_d" value={form.nama_d} onChange={change} required /></label>
        <label>Nama belakang<input name="nama_b" value={form.nama_b} onChange={change} required /></label>
        <label>Username<input name="uname" value={form.uname} onChange={change} required /></label>
        <label>Email<input type="email" name="email" value={form.email} onChange={change} required /></label>
        <label>Telepon<input name="phone" value={form.phone} onChange={change} /></label>
        <label>Jenis kelamin
          <select name="kelamin" value={form.kelamin} onChange={change}>
            <option value="">Pilih</option><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option>
          </select>
        </label>
        <label>Tanggal lahir<input type="date" name="lahir" value={form.lahir} onChange={change} /></label>
        <label className="profile-full">Alamat<textarea name="alamat" value={form.alamat} onChange={change} rows="3" /></label>
      </div>

      <div className="password-section">
        <div><span className="eyebrow">KEAMANAN</span><h3>Ganti password <small>(opsional)</small></h3><p>Kosongkan jika tidak ingin mengganti password.</p></div>
        <div className="profile-form-grid">
          <label>Password lama<input type="password" name="passwd_lama" value={form.passwd_lama} onChange={change} autoComplete="current-password" /></label>
          <label>Password baru<input type="password" name="passwd_baru" value={form.passwd_baru} onChange={change} minLength="6" autoComplete="new-password" /></label>
        </div>
      </div>

      <div className="profile-editor-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          <i className={`bi ${saving ? "bi-arrow-repeat spin" : "bi-check2"}`} /> {saving ? "Menyimpan..." : "Simpan perubahan"}
        </button>
      </div>
    </form>
  );
}
