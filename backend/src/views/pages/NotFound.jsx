import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center px-3" style={{ minHeight: "calc(100vh - 64px)" }}>
      <p className="font-display display-3 text-pine mb-2">404</p>
      <h1 className="font-display fs-3 mb-2">Rak ini kosong</h1>
      <p className="small text-body-secondary mb-4">Halaman yang Anda cari tidak ditemukan di toko pengrajut kami.</p>
      <Link to="/" className="btn btn-toko pengrajut rounded-pill px-4">Kembali ke Beranda</Link>
    </div>
  );
}
